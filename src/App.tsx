import { useState } from "react";
import "./App.scss";
import Editor from "./components/Editor";
import SettingsContext from "./store/settings";
import { Settings } from "./type/settings";
import { Navbar } from "./components/Navbar";

function App() {
  const [settings, setSettings] = useState<Settings>({
    viewMode: false,
    zenMode: false,
    gridMode: false,
    theme: "light",
  });

  return (
    <SettingsContext.Provider value={{ settings, setSettings }}>
      <Navbar />
      <Editor />
    </SettingsContext.Provider>
  );
}

export default App;
