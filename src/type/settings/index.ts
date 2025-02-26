import { Theme } from "@excalidraw/excalidraw/types/element/types";

export interface Settings {
  viewMode: boolean;
  zenMode: boolean;
  gridMode: boolean;
  theme: Theme;
}

export interface SettingsContextType {
  settings: Settings;
  setSettings: React.Dispatch<React.SetStateAction<Settings>>;
}
