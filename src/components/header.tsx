"use client";

export default function AppHeader() {
  return (
    <div className="w-screen h-16 bg-green-500 py-5 px-24 absolute flex flex-row items-center justify-between cursor-pointer">
      <span className="text-base text-green-900 font-medium">
        Better Swagger Editor
      </span>
      <span className="text-xs text-green-900 font-medium">
        A cooler way to talk to your swagger files
      </span>
    </div>
  );
}
