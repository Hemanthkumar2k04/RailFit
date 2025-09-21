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

// Minimal mock user data
const mockUser: User = {
  id: "1",
  name: "Admin",
  email: "admin@railfit.com",
  avatarUrl: "data:image/png;base64,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",
  role: "Admin"
};

export default function UserMenu({ onLogout }: UserMenuProps) {
  const user = mockUser;
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
