import React from "react";

const fonts = [
  { name: "Virgil", value: "Virgil" },
  { name: "Helvetica", value: "Helvetica" },
  { name: "Cascadia", value: "Cascadia" },
  { name: "Arial", value: "Arial" },
  { name: "Times New Roman", value: "Times New Roman" },
  { name: "Georgia", value: "Georgia" },
  { name: "Roboto", value: "Roboto" },
  { name: "Open Sans", value: "Open Sans" },
  { name: "Lato", value: "Lato" },
  { name: "Montserrat", value: "Montserrat" },
  { name: "Poppins", value: "Poppins" },
  { name: "Adobe Garamond", value: "Adobe Garamond" },
  { name: "Adobe Caslon", value: "Adobe Caslon" },
  { name: "Courier New", value: "Courier New" },
  { name: "Comic Sans MS", value: "Comic Sans MS" },
];

const FontSelector = ({ onChange }) => {
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
