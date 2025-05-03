"use client";
import React, { useRef } from "react";

import SwaggerViewer from "./swaggerviewer";

export default function SwaggerLoaderComponent({
  handleFileChange,
  loadUI,
  fileContent,
}: {
  handleFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  loadUI: boolean;
  fileContent: string;
}) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center">
      {loadUI === false ? (
        <>
          <button
            type="button"
            onClick={handleButtonClick}
            className="focus:outline-none text-white bg-green-700 hover:bg-green-800 focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5"
          >
            Browse File
          </button>
          <input
            type="file"
            accept=".json,.yaml,.yml"
            ref={fileInputRef}
            onChange={handleFileChange}
            style={{ display: "none" }}
          />
        </>
      ) : (
        <SwaggerViewer swaggerdata={fileContent} />
      )}
    </div>
  );
}
