import React from "react";

const TinyLoader = () => {
  return (
    <div className="w-full flex items-center justify-center py-6">
      <div
        className="w-6 h-6 border-[3px] border-blue-100 border-t-blue-600 rounded-full animate-spin"
        role="status"
        aria-label="Loading"
      />
    </div>
  );
};

export default TinyLoader;
