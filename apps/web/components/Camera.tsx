"use client";

import { CameraOff } from "lucide-react";
import { forwardRef } from "react";

export const Camera = forwardRef<HTMLVideoElement>((_props, ref) => {
  return (
    <div className="overflow-hidden rounded-md border-[1px] border-primary min-h-[280px] w-full max-w-[640px] relative">
      <div className="absolute top-1/2 left-1/2">
        <CameraOff className="h-16 w-16" />
      </div>
      <video ref={ref} className="z-10" autoPlay playsInline />
    </div>
  );
});

Camera.displayName = "Camera";
