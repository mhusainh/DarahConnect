import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Heart, 
  Users, 
  FileText, 
  Settings, 
  LogOut,
  BarChart3,
  Shield,
  X,
  Award,
  CreditCard,
  Building
} from 'lucide-react';

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({ isOpen, onClose }) => {
  const location = useLocation();

  const menuItems = [
    {
      title: 'Dashboard',
      icon: LayoutDashboard,
      path: '/admin/dashboard',
      description: 'Overview & Analytics'
    },
    {
      title: 'Campaign',
      icon: Heart,
      path: '/admin/campaigns',
      description: 'Kelola Campaign Donor'
    },
    {
      title: 'Donor',
      icon: Users,
      path: '/admin/donors',
      description: 'Kelola Data Donor'
    },
    {
      title: 'Rumah Sakit',
      icon: Building,
      path: '/admin/hospitals',
      description: 'Kelola Data Rumah Sakit'
    },
    {
      title: 'Permintaan',
      icon: FileText,
      path: '/admin/requests',
      description: 'Kelola Permintaan Donasi'
    },
    {
      title: 'Sertifikat',
      icon: Award,
      path: '/admin/certificates',
      description: 'Kelola Sertifikat Donor',
    },
    {
      title: 'Health Passport',
      icon: CreditCard,
      path: '/admin/health-passports',
      description: 'Kelola Health Passport'
    },
    
  ];

  const isActiveRoute = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('isAdminLoggedIn');
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('isAdmin');
    window.location.href = '/login';
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0
      `}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="bg-red-600 p-2 rounded-lg">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">Admin Panel</h1>
              <p className="text-xs text-gray-500">DarahConnect</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Navigation */}
        <div className="flex flex-col h-full pb-20">
          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = isActiveRoute(item.path);
              
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={`
                    flex items-center justify-between px-3 py-3 rounded-lg text-sm font-medium transition-all duration-200 group
                    ${isActive 
                      ? 'bg-red-50 text-red-700 border-r-4 border-red-500' 
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }
                  `}
                  onClick={() => window.innerWidth < 1024 && onClose()}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className={`h-5 w-5 ${isActive ? 'text-red-600' : 'text-gray-400 group-hover:text-gray-600'}`} />
                    <div>
                      <div className="font-medium">{item.title}</div>
                      <div className="text-xs text-gray-500">{item.description}</div>
                    </div>
                  </div>
                  
    
                </NavLink>
              );
            })}
          </nav>

          {/* Logout Button */}
          <div className="absolute bottom-0 left-0 right-0 border-t border-gray-200 bg-white p-4">
            <button
              onClick={handleLogout}
              className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-red-50 hover:text-red-600 transition-all duration-200"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminSidebar; 