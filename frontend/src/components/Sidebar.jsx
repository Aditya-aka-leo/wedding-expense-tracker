import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  FaHome,
  FaMoneyBillWave,
  FaWallet,
  FaTasks,
  FaUsers,
} from 'react-icons/fa';

const Sidebar = ({ isOpen, onClose }) => {
  const { isAdmin, user } = useAuth();

  const navItems = [
    { to: '/dashboard', icon: FaHome, label: 'Dashboard' },
    { to: '/expenses', icon: FaMoneyBillWave, label: 'Expenses' },
    { to: '/budget', icon: FaWallet, label: 'Budget' },
    { to: '/tasks', icon: FaTasks, label: 'Tasks' },
  ];

  if (isAdmin) {
    navItems.push({ to: '/users', icon: FaUsers, label: 'Users' });
  }

  const handleNavClick = () => {
    if (window.innerWidth < 1024) {
      onClose();
    }
  };

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-40 bg-white w-64 min-h-screen shadow-md transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Mobile user info */}
        <div className="lg:hidden p-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-primary-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-lg">
                {user?.name?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <p className="font-semibold text-gray-900">{user?.name}</p>
              {user?.role === 'admin' && (
                <span className="text-xs px-2 py-1 bg-primary-100 text-primary-700 rounded-full">
                  Admin
                </span>
              )}
            </div>
          </div>
        </div>

        <nav className="p-4 space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={handleNavClick}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-primary-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`
              }
            >
              <item.icon className="text-xl" />
              <span className="font-medium">{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
