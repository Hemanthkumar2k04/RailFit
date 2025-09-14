import {
  UserIcon,
  SettingsIcon,
  HelpCircleIcon,
  LogOutIcon,
  ShieldIcon,
  FileTextIcon,
  ChevronDownIcon,
} from "lucide-react"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useState, useEffect } from "react";

interface UserMenuProps {
  onLogout?: () => void;
}

type User = {
  id: string;
  email: string;
  role: 'admin' | 'manager' | 'field_inspector';
  name: string;
  department?: string;
}

export default function UserMenu({ onLogout }: UserMenuProps) {
  const [user, setUser] = useState<User>();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-auto p-1.5 hover:bg-accent flex items-center gap-2 rounded-md">
          <Avatar className="h-8 w-8">
            <AvatarImage src="./avatar.jpg" alt="Profile image" />
            <AvatarFallback className="bg-primary text-primary-foreground text-sm">
              RI
            </AvatarFallback>
          </Avatar>
          <ChevronDownIcon size={16} className="opacity-60" aria-hidden="true" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="max-w-64" align="end">
        <DropdownMenuLabel className="flex min-w-0 flex-col">
          <span className="text-foreground truncate text-sm font-medium">
            {user?.name}
          </span>
          <span className="text-muted-foreground truncate text-xs font-normal">
            {user?.role}
          </span>
          <span className="text-muted-foreground truncate text-xs font-normal">
            {user?.email}
          </span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem>
            <UserIcon size={16} className="opacity-60" aria-hidden="true" />
            <span>Profile</span>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <SettingsIcon size={16} className="opacity-60" aria-hidden="true" />
            <span>Account Settings</span>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <ShieldIcon size={16} className="opacity-60" aria-hidden="true" />
            <span>Security</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem>
            <FileTextIcon size={16} className="opacity-60" aria-hidden="true" />
            <span>Reports</span>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <HelpCircleIcon size={16} className="opacity-60" aria-hidden="true" />
            <span>Help & Support</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onLogout} className="cursor-pointer">
          <LogOutIcon size={16} className="opacity-60" aria-hidden="true" />
          <span>Logout</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
