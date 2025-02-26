import { createContext, useContext } from "react";
import { Settings } from "../../type/settings";

const SettingsContext = createContext<Settings>({
  viewMode: false,
  zenMode: false,
  gridMode: false,
  theme: "light",
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
