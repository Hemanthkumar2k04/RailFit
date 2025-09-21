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


interface UserMenuProps {
  onLogout?: () => void;
}


type User = {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  role: string;
};



export default function UserMenu({ onLogout }: UserMenuProps) {
  const user = JSON.parse(localStorage.getItem("user") || "{}") as User;
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-auto p-1.5 hover:bg-accent flex items-center gap-2 rounded-full border border-gray-200">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.avatarUrl} alt={user.name} />
            <AvatarFallback className="bg-primary text-primary-foreground text-sm">
              {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col items-start text-left">
            <span className="text-xs font-medium text-gray-900 leading-tight">{user.name}</span>
            <span className="text-[10px] text-gray-500 leading-tight">{user.email}</span>
          </div>
          <ChevronDownIcon size={16} className="opacity-60 ml-1" aria-hidden="true" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="max-w-64 min-w-[220px] p-2 rounded-xl border border-gray-100 shadow-lg" align="end">
        <DropdownMenuLabel className="flex flex-col gap-0.5 pb-1">
          <span className="text-gray-900 font-semibold text-sm truncate">{user.name}</span>
          <span className="text-gray-500 text-xs truncate">{user.email}</span>
          <span className="text-gray-400 text-xs font-normal">{user.role}</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem className="gap-2 px-2 py-2 rounded-md hover:bg-gray-100">
            <UserIcon size={16} className="opacity-60" aria-hidden="true" />
            <span>Profile</span>
          </DropdownMenuItem>
          <DropdownMenuItem className="gap-2 px-2 py-2 rounded-md hover:bg-gray-100">
            <SettingsIcon size={16} className="opacity-60" aria-hidden="true" />
            <span>Account Settings</span>
          </DropdownMenuItem>
          <DropdownMenuItem className="gap-2 px-2 py-2 rounded-md hover:bg-gray-100">
            <ShieldIcon size={16} className="opacity-60" aria-hidden="true" />
            <span>Security</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem className="gap-2 px-2 py-2 rounded-md hover:bg-gray-100">
            <FileTextIcon size={16} className="opacity-60" aria-hidden="true" />
            <span>Reports</span>
          </DropdownMenuItem>
          <DropdownMenuItem className="gap-2 px-2 py-2 rounded-md hover:bg-gray-100">
            <HelpCircleIcon size={16} className="opacity-60" aria-hidden="true" />
            <span>Help & Support</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onLogout} className="gap-2 px-2 py-2 rounded-md text-red-600 hover:bg-red-50 cursor-pointer">
          <LogOutIcon size={16} className="opacity-60" aria-hidden="true" />
          <span>Logout</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
