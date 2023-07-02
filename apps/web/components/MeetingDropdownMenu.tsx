"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useDevices } from "@/hooks/useDevices";
import { ChevronDown } from "lucide-react";

type MeetingDropdownMenuProps = {
  onVideoDeviceSelect: (deviceId: string) => void;
  selectedVideoDevice: string | null;
};

export function MeetingDropdownMenu({
  onVideoDeviceSelect,
  selectedVideoDevice,
}: MeetingDropdownMenuProps) {
  const { videoDevices } = useDevices();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuLabel>Video</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuRadioGroup
          value={selectedVideoDevice || undefined}
          onValueChange={onVideoDeviceSelect}
        >
          {videoDevices.map((device) => (
            <DropdownMenuRadioItem
              key={device.deviceId}
              value={device.deviceId}
            >
              {device.label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
