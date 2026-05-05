'use client';

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { Search, User, LogOut, Settings, Bell, Calendar, Menu } from 'lucide-react';
import { getCurrentEthiopianDateString } from '@/lib/ethiopian-date';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Image from 'next/image';
import Link from 'next/link';

interface DashboardHeaderProps {
  onMenuClick?: () => void;
}

export default function DashboardHeader({ onMenuClick }: DashboardHeaderProps) {
  const { data: session } = useSession();
  const [ethDate, setEthDate] = useState('');

  useEffect(() => {
    setEthDate(getCurrentEthiopianDateString());
  }, []);

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-gray-200 bg-white/80 px-4 backdrop-blur-md md:px-8">
      {/* Mobile Menu Trigger (Hamburger) */}
      <button
        onClick={onMenuClick}
        className="flex md:hidden items-center justify-center w-10 h-10 rounded-xl bg-white text-black border border-gray-200 shadow-sm active:scale-95 transition-all"
      >
        <Menu size={20} />
      </button>

      {/* Logo Section - Centered on Mobile, Left on Desktop */}
      <div className="flex items-center absolute md:relative left-1/2 md:left-0 -translate-x-1/2 md:translate-x-0">
        <div className="relative h-10 w-32 md:h-[72px] md:w-40">
          <Image
            src="/logo.png"
            alt="YORDI EQUIB Logo"
            fill
            className="object-contain object-center md:object-left"
            priority
          />
        </div>
      </div>



      {/* Right side: Date, Notifications, User */}
      <div className="flex items-center gap-1 md:gap-4">
        {/* Ethiopian Date (Hidden on Mobile) */}
        <div className="hidden items-center gap-2 rounded-xl bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600 md:flex">
          <Calendar size={14} className="text-primary" />
          <span>{ethDate}</span>
        </div>



        {/* User Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-3 p-1 hover:bg-gray-50 rounded-xl transition-all outline-none group">
              <div className="h-9 w-9 md:h-10 md:w-10 rounded-xl bg-[#016cc4] text-white flex items-center justify-center shadow-md group-hover:shadow-lg transition-all active:scale-95">
                <User size={18} />
              </div>
              <div className="hidden flex-col items-start md:flex">
                <span className="text-xs font-black leading-none text-gray-950 uppercase tracking-tight">
                  {session?.user?.name || 'User'}
                </span>
                <span className="text-[10px] text-gray-500 font-bold uppercase mt-0.5 tracking-tighter">
                  {(session?.user as any)?.role || 'Member'}
                </span>
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 rounded-2xl p-2 shadow-xl border-gray-100">
            <DropdownMenuLabel className="px-2 py-1.5 text-xs font-medium text-gray-500">
              My Account
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild className="rounded-xl cursor-pointer">
              <Link href="/dashboard/settings" className="flex w-full items-center gap-2">
                <User size={16} />
                <span>Profile</span>
              </Link>
            </DropdownMenuItem>

            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="rounded-xl cursor-pointer text-red-600 focus:bg-red-50 focus:text-red-600"
              onClick={() => signOut({ callbackUrl: '/login' })}
            >
              <LogOut size={16} />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
