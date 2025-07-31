import React from "react";

const MiniLoadingAnimation = () => {
  return (
    <div className=" inset-0 flex flex-col gap-5 items-center justify-center z-50 bg-transparent ">
      <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-black"></div>
      <h1>Loading, Please Wait</h1>
    </div>
  );
};

export default MiniLoadingAnimation;
