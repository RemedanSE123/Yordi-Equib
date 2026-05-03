'use client';

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { Search, User, LogOut, Settings, Bell, Calendar } from 'lucide-react';
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

export default function DashboardHeader() {
  const { data: session } = useSession();
  const [ethDate, setEthDate] = useState('');

  useEffect(() => {
    setEthDate(getCurrentEthiopianDateString());
  }, []);

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-gray-200 bg-white/80 px-4 backdrop-blur-md md:px-8">
      {/* Left side: Logo */}
      <div className="flex items-center">
        <div className="relative h-[72px] w-40">
          <Image
            src="/logo.png"
            alt="YORDI EQUIB Logo"
            fill
            className="object-contain object-left"
            priority
          />
        </div>
      </div>

      {/* Middle: Search */}
      <div className="absolute left-1/2 -translate-x-1/2 hidden lg:block w-full max-w-md">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search..."
            className="h-10 w-full rounded-xl border border-gray-200 bg-gray-50 pl-10 pr-4 text-sm outline-none transition-all focus:border-primary/50 focus:ring-4 focus:ring-primary/10"
          />
        </div>
      </div>

      {/* Right side: Date, Notifications, User */}
      <div className="flex items-center gap-2 md:gap-4">
        {/* Ethiopian Date */}
        <div className="hidden items-center gap-2 rounded-xl bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600 md:flex">
          <Calendar size={14} className="text-primary" />
          <span>{ethDate}</span>
        </div>

        {/* Notifications */}
        <button className="relative rounded-xl p-2 text-gray-500 hover:bg-gray-100 transition-colors">
          <Bell size={20} />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500 border-2 border-white"></span>
        </button>

        {/* User Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-3 p-1 hover:bg-gray-50 rounded-xl transition-all outline-none group">
              <div className="h-8 w-8 rounded-lg bg-primary text-white flex items-center justify-center shadow-sm group-hover:shadow-md transition-all">
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
            <DropdownMenuItem asChild className="rounded-xl cursor-pointer">
              <Link href="/dashboard/settings" className="flex w-full items-center gap-2">
                <Settings size={16} />
                <span>Settings</span>
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
