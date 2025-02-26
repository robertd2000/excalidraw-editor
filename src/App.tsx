import { useState } from "react";
import "./App.scss";
import Editor from "./components/Editor";
import SettingsContext from "./store/settings";
import { Settings } from "./type/settings";
import { Navbar } from "./components/Navbar";
import { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types/types";
import ExcalidrawContext from "./store/excalidraw";

function App() {
  const [excalidrawAPI, setExcalidrawAPI] =
    useState<ExcalidrawImperativeAPI | null>(null);
  const [settings, setSettings] = useState<Settings>({
    viewMode: false,
    zenMode: false,
    gridMode: false,
    theme: "light",
  });

  return (
    <SettingsContext.Provider value={{ settings, setSettings }}>
      <ExcalidrawContext.Provider value={{ excalidrawAPI, setExcalidrawAPI }}>
        <Navbar />
        <Editor />
      </ExcalidrawContext.Provider>
    </SettingsContext.Provider>
  );
}

export default App;
