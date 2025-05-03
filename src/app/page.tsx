"use client";
import React, { useState } from "react";
import SwaggerLoaderComponent from "@/components/swaggerloader";
import { parse } from "yaml";
import { GenAIFunction } from "@/utils";
import AiInteraction from "@/components/aiinteraction";

export default function Home() {
  const [fileContent, setFileContent] = useState<any>(""); // Changed state type to 'any'
  const [isSwagger, setIsSwagger] = useState(false);

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const fileContentString = e.target?.result;
        if (typeof fileContentString === "string") {
          let parsedContent: any;
          if (file.name.endsWith(".yml") || file.name.endsWith(".yaml")) {
            try {
              parsedContent = parse(fileContentString);
            } catch (error) {
              console.error("Invalid YAML file:", error);
              setFileContent("");
              setIsSwagger(false);
              return;
            }
          } else if (file.name.endsWith(".json")) {
            try {
              parsedContent = JSON.parse(fileContentString);
            } catch (error) {
              console.error("Invalid JSON file:", error);
              setFileContent("");
              setIsSwagger(false);
              return;
            }
          } else {
            console.error("Unsupported file format");
            setFileContent("");
            setIsSwagger(false);
            return;
          }

          if (
            parsedContent &&
            (parsedContent.swagger === "2.0" ||
              (parsedContent.openapi &&
                /^3(\.\d+)*$/.test(parsedContent.openapi)))
          ) {
            setIsSwagger(true);
            try {
              const genAIResponse = await GenAIFunction({
                fileContent: parsedContent,
              });
              setFileContent(genAIResponse);
            } catch (e) {
              console.log(`An Error Occurred after GenAIFunction call: ${e}`);
            }
          } else {
            console.log("File is not a valid Swagger/OpenAPI file");
            setFileContent("");
            setIsSwagger(false);
          }
        }
      };
      reader.readAsText(file);
    }
  };

  if (typeof window !== "undefined") {
    const { innerWidth, innerHeight } = window;
    if (innerWidth < 1200 || innerHeight < 760) {
      return (
        <div className="w-screen h-screen flex items-center justify-center bg-green-100">
          <p className="text-xl font-bold text-green-900">
            Shift to a bigger screen
          </p>
        </div>
      );
    }
  }

  return (
    <div className="w-screen h-screen flex bg-green-100 pt-20 px-24 pb-4 gap-4">
      <div className="rounded-lg border-2 border-green-900 w-8/12 h-full p-5">
        <SwaggerLoaderComponent
          handleFileChange={handleFileChange}
          loadUI={fileContent !== "" && isSwagger}
          fileContent={fileContent}
        />
      </div>
      <div className="rounded-lg border-2 border-green-900 w-4/12 h-full p-5">
        <AiInteraction
          fileContent={fileContent}
          setFileContent={setFileContent}
        />
      </div>
    </div>
  );
}
