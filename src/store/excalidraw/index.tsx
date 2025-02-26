import { createContext, useContext } from "react";
import { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types/types";

const ExcalidrawContext = createContext<{
  excalidrawAPI: ExcalidrawImperativeAPI | null;
  setExcalidrawAPI: React.Dispatch<
    React.SetStateAction<ExcalidrawImperativeAPI | null>
  >;
} | null>(null);

export const useExcalidrawContext = () => {
  const context = useContext(ExcalidrawContext);

  if (!context)
    throw new Error(
      "Use ExcalidrawContext* component outside inner ExcalidrawContext"
    );

  return context;
};

export default ExcalidrawContext;
