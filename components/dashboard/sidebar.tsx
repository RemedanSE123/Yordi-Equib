'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import {
  LayoutDashboard,
  Users,
  CalendarDays,
  CalendarRange,
  CalendarClock,
  FileText,
  LogOut,
  Menu,
  UserPlus,
  CreditCard,
  X,
  ChevronLeft,
  ChevronRight,
  FileBarChart,
  TrendingUp,
} from 'lucide-react';
import { useState, useEffect } from 'react';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export default function Sidebar({ isOpen, setIsOpen }: SidebarProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [isMobile, setIsMobile] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  const userRole = (session?.user as any)?.role || 'CUSTOMER';

  useEffect(() => {
    const checkScreen = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) setIsOpen(true);
    };

    checkScreen();
    window.addEventListener('resize', checkScreen);
    return () => window.removeEventListener('resize', checkScreen);
  }, [setIsOpen]);

  // Auto-collapse on mobile when route changes
  useEffect(() => {
    if (isMobile) {
      setIsOpen(false);
    }
  }, [pathname, isMobile, setIsOpen]);

  const menuItems = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['MANAGER', 'SECRETARY', 'COLLECTOR', 'EMPLOYEE', 'CUSTOMER'] },
    { href: '/dashboard/daily', label: 'Daily EKUB', icon: CalendarDays, roles: ['MANAGER', 'SECRETARY', 'COLLECTOR', 'EMPLOYEE', 'CUSTOMER'] },
    { href: '/dashboard/weekly', label: 'Weekly EKUB', icon: CalendarRange, roles: ['MANAGER', 'SECRETARY', 'COLLECTOR', 'EMPLOYEE', 'CUSTOMER'] },
    { href: '/dashboard/monthly', label: 'Monthly EKUB', icon: CalendarClock, roles: ['MANAGER', 'SECRETARY', 'COLLECTOR', 'EMPLOYEE', 'CUSTOMER'] },
    { href: '/dashboard/105-days', label: '105 Days EKUB', icon: CalendarDays, roles: ['MANAGER', 'SECRETARY', 'COLLECTOR', 'EMPLOYEE', 'CUSTOMER'] },
    { href: '/dashboard/share', label: 'Share EKUB', icon: Users, roles: ['MANAGER', 'SECRETARY', 'COLLECTOR', 'EMPLOYEE', 'CUSTOMER'] },
    { href: '/dashboard/customers', label: 'Add Customer', icon: UserPlus, roles: ['MANAGER', 'SECRETARY', 'COLLECTOR', 'EMPLOYEE'] },
    { href: '/dashboard/payments', label: 'Add Payment', icon: CreditCard, roles: ['SECRETARY', 'COLLECTOR', 'EMPLOYEE'] },
    { href: '/dashboard/users', label: 'User Management', icon: Users, roles: ['ADMIN', 'MANAGER'] },
    { href: '/dashboard/audit', label: 'Audit Trail', icon: FileText, roles: ['ADMIN'] },
    { href: '/dashboard/reports', label: 'Reports', icon: FileBarChart, roles: ['MANAGER', 'SECRETARY', 'COLLECTOR', 'EMPLOYEE'] },
  ];

  const visibleItems = menuItems.filter(item => item.roles.includes(userRole));

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/login' });
  };

  return (
    <>
      {/* Sidebar */}
      <aside
        className={`
          fixed md:relative z-40 h-full shadow-2xl
          transition-all duration-300 ease-in-out flex flex-col
          ${isOpen ? 'translate-x-0 w-64' : '-translate-x-full md:translate-x-0 md:w-20'}
        `}
        style={{
          background: 'linear-gradient(180deg, #0a1a2f 0%, #0d2b3e 50%, #0a1a2f 100%)',
        }}
      >
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#1e4d6f]/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-[#1e4d6f]/20 rounded-full blur-3xl animate-pulse delay-1000" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#2a6b8f]/10 rounded-full blur-3xl animate-spin-slow" />
        </div>

        {/* Logo Section */}
        <div className="relative w-full h-16 flex items-center justify-between px-4 border-b border-white/10 bg-black/20 backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-white to-blue-200 flex items-center justify-center shadow-lg">
              <span className="text-[#0a1a2f] font-black text-base">Y</span>
            </div>
            {isOpen && (
              <span className="text-base font-bold tracking-tight text-white animate-fadeIn">
                YORDI <span className="text-blue-300">EQUIB</span>
              </span>
            )}
          </div>

          {/* Close Button (Mobile Only) */}
          {isMobile && isOpen && (
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all"
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto relative mt-4">
          <div className="absolute inset-0 opacity-5 pointer-events-none"
            style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 1px)', backgroundSize: '16px 16px' }} />

          <nav className="relative z-10 px-3 space-y-1.5">
            {visibleItems.map((item, index) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              const isHovered = hoveredItem === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onMouseEnter={() => setHoveredItem(item.href)}
                  onMouseLeave={() => setHoveredItem(null)}
                  style={{ animationDelay: `${index * 30}ms` }}
                  onClick={() => isMobile && setIsOpen(false)}
                  className={`
                    group relative flex items-center gap-3 px-3 py-2.5 rounded-xl
                    transition-all duration-200 animate-slideIn
                    ${isActive
                      ? 'bg-white/15 text-white shadow-lg border-l-4 border-blue-400'
                      : 'text-blue-100/70 hover:text-white hover:bg-white/5'
                    }
                    ${!isOpen && 'md:justify-center md:px-0'}
                  `}
                >
                  <Icon size={18} strokeWidth={isActive ? 2.5 : 2} className={isActive ? 'text-blue-300' : ''} />
                  {isOpen && (
                    <span className="text-[13px] font-semibold tracking-wide whitespace-nowrap">{item.label}</span>
                  )}

                  {isActive && isOpen && (
                    <div className="absolute right-3 w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                  )}

                  {!isOpen && isHovered && (
                    <div className="absolute left-full ml-4 px-3 py-2 bg-gray-900 text-white text-[11px] font-bold rounded-lg shadow-2xl z-50 whitespace-nowrap animate-fadeIn border border-white/10">
                      {item.label}
                    </div>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Section with Logout Button */}
        <div className="p-4 border-t border-white/10 bg-black/20 backdrop-blur-sm">
          <button
            onClick={handleSignOut}
            className={`
              w-full flex items-center gap-3 px-3 py-2.5 rounded-xl
              bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white
              transition-all duration-300 group border border-red-500/20
              ${!isOpen && 'md:justify-center md:px-0'}
            `}
          >
            <LogOut size={18} className="group-hover:rotate-12 transition-transform" />
            {isOpen && <span className="text-[13px] font-bold">Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {isOpen && isMobile && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-[#0a1a2f]/80 backdrop-blur-sm z-30 md:hidden animate-fadeIn"
        />
      )}

      <style jsx>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(-10px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes spin-slow {
          from { transform: translate(-50%, -50%) rotate(0deg); }
          to { transform: translate(-50%, -50%) rotate(360deg); }
        }
        .animate-slideIn { animation: slideIn 0.3s ease-out forwards; }
        .animate-fadeIn { animation: fadeIn 0.2s ease-out; }
        .animate-spin-slow { animation: spin-slow 20s linear infinite; }
        .delay-1000 { animation-delay: 1s; }
        .overflow-y-auto::-webkit-scrollbar { width: 3px; }
        .overflow-y-auto::-webkit-scrollbar-track { background: transparent; }
        .overflow-y-auto::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.1); border-radius: 10px; }
      `}</style>
    </>
  );
}