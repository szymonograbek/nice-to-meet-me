"use client";

import { CameraOff } from "lucide-react";
import { forwardRef } from "react";

export const Camera = forwardRef<HTMLVideoElement>((_props, ref) => {
  return (
    <div className="overflow-hidden rounded-md border-[1px] border-primary min-h-[280px] w-full max-w-[640px] relative">
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-0">
        <CameraOff className="h-16 w-16" />
      </div>
      <video ref={ref} className="z-10 relative" autoPlay playsInline muted />
    </div>
  );
});

Camera.displayName = "Camera";
