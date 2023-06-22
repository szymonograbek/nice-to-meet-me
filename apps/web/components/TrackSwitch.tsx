"use client";

import { Toggle } from "./ui/toggle";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";

type TrackSwitchProps = {
  icon: React.ReactNode;
  tooltip: string;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

export const TrackSwitch = ({ icon, tooltip, ...props }: TrackSwitchProps) => (
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger asChild>
        <Toggle {...props}>{icon}</Toggle>
      </TooltipTrigger>
      <TooltipContent>{tooltip}</TooltipContent>
    </Tooltip>
  </TooltipProvider>
);
