import React from "react";

const LoadingAnimation = () => {
  return (
    <div className="fixed inset-0 flex flex-col gap-5 items-center justify-center z-50 bg-black bg-opacity-70">
      <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-orange-400"></div>
      <h1>Loading, Please Wait</h1>
    </div>
  );
};

export default LoadingAnimation;
