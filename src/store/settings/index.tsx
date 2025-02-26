import { createContext, useContext } from "react";
import { SettingsContextType } from "../../type/settings";

const SettingsContext = createContext<SettingsContextType>({
  settings: {
    viewMode: false,
    zenMode: false,
    gridMode: false,
    theme: "light",
  },
  setSettings: () => {},
});

export const useSettingsContext = () => {
  const context = useContext(SettingsContext);

  if (!context)
    throw new Error(
      "Use SettingsContext* component outside inner SettingsContext"
    );

  return context;
};

export default SettingsContext;
