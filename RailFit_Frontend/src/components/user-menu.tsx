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
import { useState, useRef, useEffect } from "react"

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
  const [isOpen, setIsOpen] = useState(false);
  const [modal, setModal] = useState<null | 'profile' | 'settings' | 'security' | 'reports' | 'help'>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLDivElement>(null);
  
  // Fallback values if user data is incomplete
  const userName = user.name || "User";
  const userEmail = user.email || "user@example.com";
  const userRole = user.role || "User";
  const userInitials = userName.split(' ').map(n => n[0]).join('').toUpperCase() || "U";
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current && 
        buttonRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  return (
    <div className="relative">
      <div ref={buttonRef}>
        <Button 
          variant="ghost" 
          className="h-auto p-1.5 hover:bg-accent flex items-center gap-2 rounded-full border border-gray-200"
          onClick={() => setIsOpen(!isOpen)}
        >
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.avatarUrl} alt={userName} />
            <AvatarFallback className="bg-primary text-primary-foreground text-sm">
              {userInitials}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col items-start text-left">
            <span className="text-xs font-medium text-gray-900 leading-tight">{userName}</span>
            <span className="text-[10px] text-gray-500 leading-tight">{userEmail}</span>
          </div>
          <ChevronDownIcon size={16} className="opacity-60 ml-1" aria-hidden="true" />
        </Button>
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div 
          ref={dropdownRef}
          className="absolute right-0 top-full mt-2 w-[220px] bg-white rounded-xl border border-gray-100 shadow-lg p-2 z-50 animate-in fade-in-0 zoom-in-95 slide-in-from-top-2"
        >
          {/* User Info Header */}
          <div className="flex flex-col gap-0.5 pb-2 px-2 border-b border-gray-100">
            <span className="text-gray-900 font-semibold text-sm truncate">{userName}</span>
            <span className="text-gray-500 text-xs truncate">{userEmail}</span>
            <span className="text-gray-400 text-xs font-normal">{userRole}</span>
          </div>

          {/* Menu Items */}
          <div className="py-1">
            <button 
              className="w-full flex items-center gap-2 px-2 py-2 rounded-md hover:bg-gray-100 text-left"
              onClick={() => { setModal('profile'); setIsOpen(false); }}
            >
              <UserIcon size={16} className="opacity-60" aria-hidden="true" />
              <span className="text-sm">Profile</span>
            </button>
            <button 
              className="w-full flex items-center gap-2 px-2 py-2 rounded-md hover:bg-gray-100 text-left"
              onClick={() => { setModal('settings'); setIsOpen(false); }}
            >
              <SettingsIcon size={16} className="opacity-60" aria-hidden="true" />
              <span className="text-sm">Account Settings</span>
            </button>
            <button 
              className="w-full flex items-center gap-2 px-2 py-2 rounded-md hover:bg-gray-100 text-left"
              onClick={() => { setModal('security'); setIsOpen(false); }}
            >
              <ShieldIcon size={16} className="opacity-60" aria-hidden="true" />
              <span className="text-sm">Security</span>
            </button>
          </div>

          <div className="border-t border-gray-100 my-1"></div>

          <div className="py-1">
            <button 
              className="w-full flex items-center gap-2 px-2 py-2 rounded-md hover:bg-gray-100 text-left"
              onClick={() => { setModal('reports'); setIsOpen(false); }}
            >
              <FileTextIcon size={16} className="opacity-60" aria-hidden="true" />
              <span className="text-sm">Reports</span>
            </button>
            <button 
              className="w-full flex items-center gap-2 px-2 py-2 rounded-md hover:bg-gray-100 text-left"
              onClick={() => { setModal('help'); setIsOpen(false); }}
            >
              <HelpCircleIcon size={16} className="opacity-60" aria-hidden="true" />
              <span className="text-sm">Help & Support</span>
            </button>
          </div>

          <div className="border-t border-gray-100 my-1"></div>

          <button 
            className="w-full flex items-center gap-2 px-2 py-2 rounded-md text-red-600 hover:bg-red-50 text-left"
            onClick={() => { onLogout?.(); setIsOpen(false); }}
          >
            <LogOutIcon size={16} className="opacity-60" aria-hidden="true" />
            <span className="text-sm">Logout</span>
          </button>
        </div>
      )}

    {/* Modals for each menu item */}
    {modal === 'profile' && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
        <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full relative">
          <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-600" onClick={() => setModal(null)}>&times;</button>
          <h2 className="text-lg font-semibold mb-2">Profile</h2>
          <div className="flex flex-col items-center gap-2">
            <Avatar className="h-16 w-16 mb-2">
              <AvatarImage src={user.avatarUrl} alt={userName} />
              <AvatarFallback className="bg-primary text-primary-foreground text-lg">
                {userInitials}
              </AvatarFallback>
            </Avatar>
            <div className="text-gray-900 font-semibold">{userName}</div>
            <div className="text-gray-500 text-sm">{userEmail}</div>
            <div className="text-gray-400 text-xs">Role: {userRole}</div>
          </div>
        </div>
      </div>
    )}
    {modal === 'settings' && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
        <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full relative">
          <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-600" onClick={() => setModal(null)}>&times;</button>
          <h2 className="text-lg font-semibold mb-2">Account Settings</h2>
          <div className="text-gray-700 text-sm">Email: {userEmail}<br/>Name: {userName}<br/>Role: {userRole}</div>
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
    </div>
  )
}
