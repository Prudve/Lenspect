import { NavigatorScreenParams } from "@react-navigation/native";

export type MainTabParamList = {
  Dashboard: undefined;
  Scan: undefined;
  History: undefined;
  Queue: undefined;
  Profile: undefined;
};

export type RootStackParamList = {
  Login: undefined;
  MainTabs: NavigatorScreenParams<MainTabParamList>;
  InspectionPreview: {
    photoUri: string;
    latitude: number;
    longitude: number;
    address?: string;
  };
  InspectionDetail: {
    inspectionId: string;
  };
};
