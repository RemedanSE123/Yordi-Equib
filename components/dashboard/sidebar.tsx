'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import Image from 'next/image';
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
  Gift,
  TrendingUp,
  Award,
} from 'lucide-react';
import { useState, useEffect } from 'react';

export default function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  const userRole = (session?.user as any)?.role || 'CUSTOMER';

  useEffect(() => {
    const checkScreen = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      setIsOpen(!mobile);
    };

    checkScreen();
    window.addEventListener('resize', checkScreen);
    return () => window.removeEventListener('resize', checkScreen);
  }, []);

  const menuItems = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['ADMIN', 'MANAGER', 'SECRETARY', 'COLLECTOR', 'CUSTOMER'] },
    { href: '/dashboard/daily', label: 'Daily EKUB', icon: CalendarDays, roles: ['ADMIN', 'MANAGER', 'SECRETARY', 'COLLECTOR', 'CUSTOMER'] },
    { href: '/dashboard/weekly', label: 'Weekly EKUB', icon: CalendarRange, roles: ['ADMIN', 'MANAGER', 'SECRETARY', 'COLLECTOR', 'CUSTOMER'] },
    { href: '/dashboard/monthly', label: 'Monthly EKUB', icon: CalendarClock, roles: ['ADMIN', 'MANAGER', 'SECRETARY', 'COLLECTOR', 'CUSTOMER'] },
    { href: '/dashboard/105-days', label: '105 Days EKUB', icon: CalendarDays, roles: ['ADMIN', 'MANAGER', 'SECRETARY', 'COLLECTOR', 'CUSTOMER'] },
    { href: '/dashboard/share', label: 'Share EKUB', icon: Users, roles: ['ADMIN', 'MANAGER', 'SECRETARY', 'COLLECTOR', 'CUSTOMER'] },
    { href: '/dashboard/customers', label: 'Add Customer', icon: UserPlus, roles: ['ADMIN', 'MANAGER', 'SECRETARY', 'COLLECTOR'] },
    { href: '/dashboard/payments', label: 'Add Payment', icon: CreditCard, roles: ['ADMIN', 'MANAGER', 'SECRETARY', 'COLLECTOR'] },
    { href: '/dashboard/users', label: 'User Management', icon: Users, roles: ['ADMIN'] },
    { href: '/dashboard/audit', label: 'Audit Trail', icon: FileText, roles: ['ADMIN'] },
    { href: '/dashboard/reports', label: 'Reports', icon: FileBarChart, roles: ['ADMIN', 'MANAGER', 'SECRETARY', 'COLLECTOR'] },
  ];

  const visibleItems = menuItems.filter(item => item.roles.includes(userRole));

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/login' });
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden fixed top-4 left-4 z-50 p-2.5 bg-gradient-to-r from-[#0f2b4d] to-[#1a3a5c] text-white rounded-xl shadow-lg"
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Sidebar */}
      <aside
        className={`
          fixed md:relative z-40 shadow-2xl
          transition-all duration-300 ease-in-out flex flex-col
          ${isOpen ? 'translate-x-0 w-64' : '-translate-x-full md:translate-x-0 md:w-16'}
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
        <div className="relative w-full h-14 flex items-center justify-center border-b border-white/10 bg-black/20 backdrop-blur-sm">
          {isOpen ? (
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-white to-blue-200 flex items-center justify-center shadow-lg">
                <span className="text-[#0a1a2f] font-black text-base">Y</span>
              </div>
              <span className="text-base font-bold tracking-tight text-white">
                YORDI <span className="text-blue-300">EQUIB</span>
              </span>
            </div>
          ) : (
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-white to-blue-200 flex items-center justify-center shadow-lg">
              <span className="text-[#0a1a2f] font-black text-sm">Y</span>
            </div>
          )}

          {/* Collapse Button */}
          {!isMobile && (
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="absolute -right-2.5 top-1/2 -translate-y-1/2 bg-white rounded-full p-1 text-[#0a1a2f] shadow-lg border border-white/20 hover:scale-110 transition-all duration-200 z-50"
            >
              {isOpen ? <ChevronLeft size={12} strokeWidth={2.5} /> : <ChevronRight size={12} strokeWidth={2.5} />}
            </button>
          )}
        </div>



        {/* Navigation */}
        <div className="flex-1 overflow-y-auto relative mt-4">
          {/* Subtle Pattern Overlay */}
          <div className="absolute inset-0 opacity-5 pointer-events-none"
            style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 1px)', backgroundSize: '16px 16px' }} />

          <nav className="relative z-10 px-2 space-y-1">
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
                  className={`
                    group relative flex items-center gap-2.5 px-3 py-2 rounded-lg
                    transition-all duration-200 animate-slideIn
                    ${isActive
                      ? 'bg-white/15 text-white shadow-lg border-l-2 border-white/40'
                      : 'text-blue-100/80 hover:text-white hover:bg-white/10'
                    }
                    ${!isOpen && 'md:justify-center md:px-2'}
                  `}
                >
                  <Icon size={17} strokeWidth={isActive ? 2.2 : 1.8} />
                  {isOpen && (
                    <span className="text-xs font-medium tracking-wide">{item.label}</span>
                  )}

                  {/* Active indicator */}
                  {isActive && isOpen && (
                    <div className="absolute right-2 w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                  )}

                  {/* Tooltip for collapsed mode */}
                  {!isOpen && isHovered && (
                    <div className="absolute left-full ml-2 px-2.5 py-1.5 bg-gray-900 text-white text-[10px] font-medium rounded-md shadow-xl z-50 whitespace-nowrap animate-fadeIn">
                      {item.label}
                    </div>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Stats Card (when expanded) */}
        {isOpen && (
          <div className="relative mx-3 my-3 p-3 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-xl border border-white/10 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] text-blue-200 font-medium">Today's Collection</span>
              <TrendingUp size={12} className="text-green-300" />
            </div>
            <p className="text-sm font-bold text-white">ETB 12,450</p>

          </div>
        )}

        {/* Bottom Section with Logout Button */}
        <div className="p-3 border-t border-white/10 bg-black/20 backdrop-blur-sm">
          <button
            onClick={handleSignOut}
            className={`
              w-full flex items-center gap-2.5 px-3 py-2 rounded-lg
              bg-red-500/80 hover:bg-red-600 text-white
              transition-all duration-200 group backdrop-blur-sm
              ${!isOpen && 'md:justify-center'}
            `}
          >
            <LogOut size={17} className="group-hover:scale-110 transition-transform" />
            {isOpen && <span className="text-xs font-medium">Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {isOpen && isMobile && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 md:hidden animate-fadeIn"
        />
      )}

      <style jsx>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(-10px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        @keyframes spin-slow {
          from {
            transform: translate(-50%, -50%) rotate(0deg);
          }
          to {
            transform: translate(-50%, -50%) rotate(360deg);
          }
        }
        
        .animate-slideIn {
          animation: slideIn 0.3s ease-out forwards;
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        
        .animate-spin-slow {
          animation: spin-slow 20s linear infinite;
        }
        
        .delay-1000 {
          animation-delay: 1s;
        }
        
        /* Custom scrollbar */
        .overflow-y-auto::-webkit-scrollbar {
          width: 3px;
        }
        
        .overflow-y-auto::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
        
        .overflow-y-auto::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 10px;
        }
        
        .overflow-y-auto::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.3);
        }
      `}</style>
    </>
  );
}