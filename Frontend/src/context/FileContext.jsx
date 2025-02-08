import React, { createContext, useState } from "react";

export const FileContext = createContext();

export const FileProvider = ({ children }) => {
  const [file, setFile] = useState(null);

  return (
    <FileContext.Provider value={{ file, setFile }}>
      {children}
    </FileContext.Provider>
  );
};



