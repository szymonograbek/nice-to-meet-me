"use client";

import { CameraOff } from "lucide-react";
import { forwardRef } from "react";
import { AspectRatio } from "./ui/aspect-ratio";

export const Camera = forwardRef<
  HTMLVideoElement,
  React.VideoHTMLAttributes<HTMLVideoElement>
>((props, ref) => {
  return (
    <div className="border-primary relative w-full max-w-[640px] overflow-hidden rounded-md border-[1px]">
      <AspectRatio ratio={16 / 9}>
        <div className="relative flex h-full w-full flex-row items-center">
          <div className="absolute left-1/2 top-1/2 z-0 -translate-x-1/2 -translate-y-1/2">
            <CameraOff className="h-16 w-16" />
          </div>
          <video
            ref={ref}
            className="relative z-10 w-full"
            autoPlay
            {...props}
          />
        </div>
      </AspectRatio>
    </div>
  );
});

Camera.displayName = "Camera";
