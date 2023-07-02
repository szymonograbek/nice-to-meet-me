"use client";

import { CameraOff } from "lucide-react";
import { forwardRef } from "react";

export const Camera = forwardRef<
  HTMLVideoElement,
  React.VideoHTMLAttributes<HTMLVideoElement>
>(({ className, ...props }, ref) => {
  return (
    <div className="border-border relative min-h-[50%] overflow-hidden rounded-md border-4">
      <div className="relative flex h-full flex-row items-center">
        <div className="absolute left-1/2 top-1/2 z-0 -translate-x-1/2 -translate-y-1/2">
          <CameraOff className="text-border h-10 w-10" />
        </div>
        <video
          ref={ref}
          className="relative z-10 h-full w-full"
          autoPlay
          playsInline
          {...props}
        />
      </div>
    </div>
  );
});

Camera.displayName = "Camera";
