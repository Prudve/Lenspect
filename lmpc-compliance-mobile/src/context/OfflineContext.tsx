import NetInfo from "@react-native-community/netinfo";
import * as FileSystem from "expo-file-system";
import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { InspectionApi } from "../services/api";
import { StorageService } from "../services/storage";
import { OfflineInspectionItem } from "../types/queue";

interface OfflineContextValue {
  isOnline: boolean;
  isSyncing: boolean;
  queue: OfflineInspectionItem[];
  enqueueInspection: (item: {
    imageUri: string;
    latitude: number;
    longitude: number;
    merchantName?: string;
    notes?: string;
  }) => Promise<void>;
  syncQueue: () => Promise<void>;
  removeItem: (id: string) => Promise<void>;
  clearQueue: () => Promise<void>;
}

const OfflineContext = createContext<OfflineContextValue | undefined>(undefined);

export const OfflineProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [queue, setQueue] = useState<OfflineInspectionItem[]>([]);
  const isSyncingRef = useRef<boolean>(false);

  // Initialize queue from disk
  useEffect(() => {
    const loadQueue = async () => {
      const stored = await StorageService.getOfflineQueue();
      setQueue(stored);
    };
    loadQueue();
  }, []);

  // Monitor network status
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      const online = Boolean(state.isConnected && state.isInternetReachable !== false);
      setIsOnline(online);

      // Trigger automatic background sync when connection recovers
      if (online && !isSyncingRef.current) {
        syncQueue();
      }
    });

    return () => unsubscribe();
  }, []);

  const saveAndSetQueue = async (newQueue: OfflineInspectionItem[]) => {
    setQueue(newQueue);
    await StorageService.saveOfflineQueue(newQueue);
  };

  const enqueueInspection = async (item: {
    imageUri: string;
    latitude: number;
    longitude: number;
    merchantName?: string;
    notes?: string;
  }) => {
    const id = `scan_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    // Copy to persistent document directory so OS doesn't purge temp cache
    let persistentUri = item.imageUri;
    try {
      if (FileSystem.documentDirectory) {
        const dest = `${FileSystem.documentDirectory}${id}.jpg`;
        await FileSystem.copyAsync({ from: item.imageUri, to: dest });
        persistentUri = dest;
      }
    } catch (err) {
      console.warn("Could not copy photo to documents dir, using original URI:", err);
    }

    const newItem: OfflineInspectionItem = {
      id,
      localImageUri: persistentUri,
      latitude: item.latitude,
      longitude: item.longitude,
      merchantName: item.merchantName,
      notes: item.notes,
      timestamp: Date.now(),
      status: "PENDING",
      attempts: 0,
    };

    const updated = [newItem, ...queue];
    await saveAndSetQueue(updated);

    // If online, immediately attempt to process
    if (isOnline && !isSyncingRef.current) {
      setTimeout(() => syncQueue(), 500);
    }
  };

  const syncQueue = async () => {
    const currentQueue = await StorageService.getOfflineQueue();
    const pendingItems = currentQueue.filter((item) => item.status !== "SYNCING");

    if (pendingItems.length === 0 || isSyncingRef.current) return;

    isSyncingRef.current = true;
    setIsSyncing(true);

    const workingQueue = [...currentQueue];

    for (const item of pendingItems) {
      try {
        // Mark as syncing
        const idx = workingQueue.findIndex((q) => q.id === item.id);
        if (idx !== -1) {
          workingQueue[idx].status = "SYNCING";
          await saveAndSetQueue([...workingQueue]);
        }

        // Upload to Express Backend
        await InspectionApi.uploadScan({
          imageUri: item.localImageUri,
          latitude: item.latitude,
          longitude: item.longitude,
        });

        // Upload succeeded: remove from queue & delete persistent local file
        const itemToRemove = workingQueue.find((q) => q.id === item.id);
        if (itemToRemove?.localImageUri?.startsWith(FileSystem.documentDirectory || "")) {
          try {
            await FileSystem.deleteAsync(itemToRemove.localImageUri, { idempotent: true });
          } catch {
            // ignore
          }
        }

        const filtered = workingQueue.filter((q) => q.id !== item.id);
        workingQueue.length = 0;
        workingQueue.push(...filtered);
        await saveAndSetQueue([...workingQueue]);
      } catch (err: any) {
        const idx = workingQueue.findIndex((q) => q.id === item.id);
        if (idx !== -1) {
          workingQueue[idx].status = "FAILED";
          workingQueue[idx].attempts += 1;
          workingQueue[idx].errorMessage = err?.response?.data?.message || err?.message || "Sync failed";
          await saveAndSetQueue([...workingQueue]);
        }
      }
    }

    setIsSyncing(false);
    isSyncingRef.current = false;
  };

  const removeItem = async (id: string) => {
    const item = queue.find((q) => q.id === id);
    if (item?.localImageUri?.startsWith(FileSystem.documentDirectory || "")) {
      try {
        await FileSystem.deleteAsync(item.localImageUri, { idempotent: true });
      } catch {
        // ignore
      }
    }
    const filtered = queue.filter((q) => q.id !== id);
    await saveAndSetQueue(filtered);
  };

  const clearQueue = async () => {
    for (const item of queue) {
      if (item.localImageUri?.startsWith(FileSystem.documentDirectory || "")) {
        try {
          await FileSystem.deleteAsync(item.localImageUri, { idempotent: true });
        } catch {
          // ignore
        }
      }
    }
    await saveAndSetQueue([]);
  };

  return (
    <OfflineContext.Provider
      value={{
        isOnline,
        isSyncing,
        queue,
        enqueueInspection,
        syncQueue,
        removeItem,
        clearQueue,
      }}
    >
      {children}
    </OfflineContext.Provider>
  );
};

export const useOffline = (): OfflineContextValue => {
  const context = useContext(OfflineContext);
  if (!context) {
    throw new Error("useOffline must be used within an OfflineProvider");
  }
  return context;
};
