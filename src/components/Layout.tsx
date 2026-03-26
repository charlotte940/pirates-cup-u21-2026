import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Calendar, Users, LogOut, Menu, Bell, Smartphone, ChevronRight, Home, UserCheck } from 'lucide-react';

interface NavItem {
  label: string;
  icon: React.ElementType;
  href: string;
  roles: string[];
}

const navItems: NavItem[] = [
  { label: 'Dashboard', icon: Home, href: 'dashboard', roles: ['manager', 'registration', 'fieldmanager'] },
  { label: 'Registration & Security', icon: UserCheck, href: 'checkin', roles: ['registration'] },
  { label: 'Matches', icon: Calendar, href: 'matches', roles: ['manager'] },
  { label: 'Teams', icon: Users, href: 'teams', roles: ['manager'] },
  { label: 'NFC Check-in', icon: Smartphone, href: 'nfc', roles: ['registration'] },
];

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function Layout({ children, activeTab, setActiveTab }: LayoutProps) {
  const { user, logout, hasRole } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const filteredNavItems = navItems.filter(item => hasRole(item.roles as any));

  return (
    <div className="min-h-screen bg-pirates-gray-50 flex">
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/20 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-72 bg-white border-r border-pirates-gray-200 transform transition-transform duration-300 lg:transform-none ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        {/* Logo Section */}
        <div className="p-5 border-b border-pirates-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 flex-shrink-0">
              <img src="/logo.jpg" alt="Pirates Cup U21" className="w-full h-full object-contain" />
            </div>
            <div>
              <div className="accent-block-red text-xs py-1 px-2">2026</div>
              <p className="text-pirates-gray-400 text-xs mt-1">&quot;A decade of dreams&quot;</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1">
          <p className="px-4 py-2 text-pirates-gray-400 text-xs font-medium uppercase tracking-wider">Main Menu</p>
          {filteredNavItems.map((item) => (
            <button 
              key={item.href} 
              onClick={() => { setActiveTab(item.href); setSidebarOpen(false); }}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-200 group ${
                activeTab === item.href 
                  ? 'bg-pirates-red text-white shadow-md' 
                  : 'text-pirates-gray-600 hover:bg-pirates-gray-100 hover:text-pirates-black'
              }`}>
              <div className="flex items-center gap-3">
                <item.icon className={`w-5 h-5 ${activeTab === item.href ? 'text-white' : 'text-pirates-gray-500 group-hover:text-pirates-red'}`} />
                <span className="font-medium text-sm">{item.label}</span>
              </div>
              {activeTab === item.href && (
                <ChevronRight className="w-4 h-4 text-white" />
              )}
            </button>
          ))}
        </nav>

        {/* User Section */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-pirates-gray-200 bg-white">
          <div className="flex items-center gap-3 mb-4 p-3 bg-pirates-gray-50 rounded-lg border border-pirates-gray-100">
            {user?.avatar ? (
              <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full border-2 border-pirates-red" />
            ) : (
              <div className="w-10 h-10 bg-pirates-red/10 rounded-full flex items-center justify-center border-2 border-pirates-red">
                <Users className="w-5 h-5 text-pirates-red" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-pirates-black text-sm font-medium truncate">{user?.name}</p>
              <p className="text-pirates-red text-xs capitalize font-medium">{user?.role}</p>
            </div>
          </div>
          <button onClick={logout}
            className="w-full flex items-center justify-center gap-2 bg-pirates-gray-100 border border-pirates-gray-200 text-pirates-gray-600 rounded-lg py-3 hover:border-pirates-red hover:text-pirates-red hover:bg-pirates-red/5 transition-all">
            <LogOut className="w-4 h-4" />
            <span className="text-sm font-medium">Logout</span>
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="bg-white border-b border-pirates-gray-200 px-4 lg:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={() => setSidebarOpen(true)} className="lg:hidden w-10 h-10 bg-pirates-gray-100 rounded-lg flex items-center justify-center text-pirates-black hover:bg-pirates-red hover:text-white transition-colors">
                <Menu className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-3">
                <h2 className="font-heading text-xl font-bold text-pirates-black uppercase tracking-wide">{activeTab.replace('-', ' ')}</h2>
                <span className="hidden sm:inline-block w-px h-6 bg-pirates-gray-300" />
                <span className="hidden sm:inline-block accent-block-red text-xs py-1 px-2">Pirates Cup 2026</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button className="w-10 h-10 bg-pirates-gray-100 rounded-lg flex items-center justify-center text-pirates-gray-600 hover:text-pirates-red hover:bg-pirates-red/10 transition-colors relative border border-pirates-gray-200">
                <Bell className="w-5 h-5" />
                <span className="absolute top-2 right-2 w-2 h-2 bg-pirates-red rounded-full animate-pulse" />
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
