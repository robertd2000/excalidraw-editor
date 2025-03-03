import React from "react";
import { fonts } from "../../constants/fonts";

interface FontSelectorProps {
  onChange: (fontFamily: string) => void;
}

const FontSelector: React.FC<FontSelectorProps> = ({ onChange }) => {
  return (
    <select
      onChange={(e) => onChange(e.target.value)}
      className='p-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
    >
      {fonts.map((font) => (
        <option key={font.value} value={font.value}>
          {font.name}
        </option>
      ))}
    </select>
  );
};

export default FontSelector;
