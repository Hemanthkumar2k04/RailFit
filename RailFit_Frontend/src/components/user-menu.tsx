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
import { useState } from "react"
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
  const [modal, setModal] = useState<null | 'profile' | 'settings' | 'security' | 'reports' | 'help'>(null);
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
          <DropdownMenuItem className="gap-2 px-2 py-2 rounded-md hover:bg-gray-100" onClick={() => setModal('profile')}>
            <UserIcon size={16} className="opacity-60" aria-hidden="true" />
            <span>Profile</span>
          </DropdownMenuItem>
          <DropdownMenuItem className="gap-2 px-2 py-2 rounded-md hover:bg-gray-100" onClick={() => setModal('settings')}>
            <SettingsIcon size={16} className="opacity-60" aria-hidden="true" />
            <span>Account Settings</span>
          </DropdownMenuItem>
          <DropdownMenuItem className="gap-2 px-2 py-2 rounded-md hover:bg-gray-100" onClick={() => setModal('security')}>
            <ShieldIcon size={16} className="opacity-60" aria-hidden="true" />
            <span>Security</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem className="gap-2 px-2 py-2 rounded-md hover:bg-gray-100" onClick={() => setModal('reports')}>
            <FileTextIcon size={16} className="opacity-60" aria-hidden="true" />
            <span>Reports</span>
          </DropdownMenuItem>
          <DropdownMenuItem className="gap-2 px-2 py-2 rounded-md hover:bg-gray-100" onClick={() => setModal('help')}>
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
    {/* Modals for each menu item */}
    {modal === 'profile' && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
        <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full relative">
          <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-600" onClick={() => setModal(null)}>&times;</button>
          <h2 className="text-lg font-semibold mb-2">Profile</h2>
          <div className="flex flex-col items-center gap-2">
            <Avatar className="h-16 w-16 mb-2">
              <AvatarImage src={user.avatarUrl} alt={user.name} />
              <AvatarFallback className="bg-primary text-primary-foreground text-lg">
                {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="text-gray-900 font-semibold">{user.name}</div>
            <div className="text-gray-500 text-sm">{user.email}</div>
            <div className="text-gray-400 text-xs">Role: {user.role}</div>
          </div>
        </div>
      </div>
    )}
    {modal === 'settings' && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
        <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full relative">
          <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-600" onClick={() => setModal(null)}>&times;</button>
          <h2 className="text-lg font-semibold mb-2">Account Settings</h2>
          <div className="text-gray-700 text-sm">Email: {user.email}<br/>Name: {user.name}<br/>Role: {user.role}</div>
        </div>
      </div>
    )}
    {modal === 'security' && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
        <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full relative">
          <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-600" onClick={() => setModal(null)}>&times;</button>
          <h2 className="text-lg font-semibold mb-2">Security</h2>
          <div className="text-gray-700 text-sm">For security settings, contact your administrator.</div>
        </div>
      </div>
    )}
    {modal === 'reports' && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
        <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full relative">
          <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-600" onClick={() => setModal(null)}>&times;</button>
          <h2 className="text-lg font-semibold mb-2">Reports</h2>
          <div className="text-gray-700 text-sm">Download or view your reports from the Reports section in the dashboard.</div>
        </div>
      </div>
    )}
    {modal === 'help' && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
        <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full relative">
          <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-600" onClick={() => setModal(null)}>&times;</button>
          <h2 className="text-lg font-semibold mb-2">Help & Support</h2>
          <p className="text-gray-700 text-sm mb-4">For assistance, contact support@railfit.com or visit our documentation.</p>
          <a href="mailto:support@railfit.com" className="text-blue-600 hover:underline">Email Support</a>
        </div>
      </div>
    )}
    </DropdownMenu>
  )
}
