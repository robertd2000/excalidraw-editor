import React, { useState } from "react";
import { fonts } from "../../constants/fonts";

interface FontSettings {
  fontFamily: string;
  fontSize: number;
  lineHeight: number;
}

interface FontToolbarProps {
  onChange: (settings: FontSettings) => void;
}

const FontToolbar: React.FC<FontToolbarProps> = ({ onChange }) => {
  const [fontFamily, setFontFamily] = useState("Virgil");
  const [fontSize, setFontSize] = useState(20);
  const [lineHeight, setLineHeight] = useState(1.5);

  const handleApply = () => {
    onChange({ fontFamily, fontSize, lineHeight });
  };

  return (
    <div
      style={{
        position: "absolute",
        top: "10px",
        right: "10px",
        zIndex: 1000,
        background: "white",
        padding: "10px",
        borderRadius: "8px",
        boxShadow: "0 2px 10px rgba(0, 0, 0, 0.2)",
      }}
    >
      <div>
        <label>Шрифт:</label>
        <select
          value={fontFamily}
          onChange={(e) => setFontFamily(e.target.value)}
        >
          {fonts.map((font) => (
            <option key={font.value} value={font.value}>
              {font.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label>Размер шрифта:</label>
        <input
          type='number'
          value={fontSize}
          onChange={(e) => setFontSize(Number(e.target.value))}
        />
      </div>
      <div>
        <label>Высота линии:</label>
        <input
          type='number'
          step='0.1'
          value={lineHeight}
          onChange={(e) => setLineHeight(Number(e.target.value))}
        />
      </div>
      <button onClick={handleApply}>Применить</button>
    </div>
  );
};

export default FontToolbar;
