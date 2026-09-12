export type QueueItemStatus = "PENDING" | "SYNCING" | "FAILED";

export interface OfflineInspectionItem {
  id: string;
  localImageUri: string;
  latitude: number;
  longitude: number;
  merchantName?: string;
  notes?: string;
  timestamp: number;
  status: QueueItemStatus;
  errorMessage?: string;
  attempts: number;
}
