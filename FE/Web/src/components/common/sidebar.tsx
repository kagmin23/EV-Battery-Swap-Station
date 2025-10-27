import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const Sidebar = () => {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const location = useLocation();

  const toggleDropdown = (dropdownName: string) => {
    setOpenDropdown(openDropdown === dropdownName ? null : dropdownName);
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const isSectionActive = (keyword: string) => {
    return location.pathname.includes(keyword);
  };

  return (
    <aside className="w-64 h-screen bg-slate-800 text-slate-100 fixed left-0 top-0 overflow-y-auto transition-all duration-300 shadow-lg z-30 scrollbar-thin">

      <div className="px-4 py-6 border-b border-slate-700">
        <h2 className="text-xl font-semibold text-blue-400 m-0">EV Battery Swap</h2>
      </div>

      <nav className="py-4">
        <ul className="list-none m-0 p-0">
          <li className="my-1">
            <Link
              to="/"
              className={`flex items-center px-4 py-3 no-underline cursor-pointer transition-all duration-200 font-medium ${isActive('/')
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                }`}
            >
              <span className="flex-1">Home</span>
            </Link>
          </li>

          <li className="my-1">
            <div
              onClick={() => toggleDropdown('cabinet')}
              className={`flex items-center px-4 py-3 cursor-pointer transition-all duration-200 font-medium ${isSectionActive('cabinet')
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                }`}
            >
              <span className="flex-1">Cabinet</span>
              <svg
                className={`w-4 h-4 transition-transform duration-300 ${openDropdown === 'cabinet' ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>

            <ul className={`list-none m-0 p-0 overflow-hidden transition-all duration-300 ${openDropdown === 'cabinet' ? 'max-h-96' : 'max-h-0'
              }`}>
              <li>
                <Link
                  to="/cabinet-management"
                  className={`flex items-center pl-14 pr-4 py-2.5 text-sm no-underline transition-all duration-200 ${isActive('/cabinet-management')
                      ? 'bg-blue-700 text-white'
                      : 'text-slate-400 hover:bg-slate-700 hover:text-white'
                    }`}
                >
                  Cabinet Management
                </Link>
              </li>
              <li>
                <Link
                  to="/cabinet-model"
                  className={`flex items-center pl-14 pr-4 py-2.5 text-sm no-underline transition-all duration-200 ${isActive('/cabinet-model')
                      ? 'bg-blue-700 text-white'
                      : 'text-slate-400 hover:bg-slate-700 hover:text-white'
                    }`}
                >
                  Cabinet Model
                </Link>
              </li>
            </ul>
          </li>

          <li className="my-1">
            <div
              onClick={() => toggleDropdown('battery')}
              className={`flex items-center px-4 py-3 cursor-pointer transition-all duration-200 font-medium ${isSectionActive('battery')
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                }`}
            >
              <span className="flex-1">Battery</span>
              <svg
                className={`w-4 h-4 transition-transform duration-300 ${openDropdown === 'battery' ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>

            <ul className={`list-none m-0 p-0 overflow-hidden transition-all duration-300 ${openDropdown === 'battery' ? 'max-h-[500px]' : 'max-h-0'
              }`}>
              <li>
                <Link to="/battery-management" className={`flex items-center pl-14 pr-4 py-2.5 text-sm no-underline transition-all duration-200 ${isActive('/battery-management') ? 'bg-blue-700 text-white' : 'text-slate-400 hover:bg-slate-700 hover:text-white'
                  }`}>Battery Management</Link>
              </li>
              <li>
                <Link to="/battery-model" className={`flex items-center pl-14 pr-4 py-2.5 text-sm no-underline transition-all duration-200 ${isActive('/battery-model') ? 'bg-blue-700 text-white' : 'text-slate-400 hover:bg-slate-700 hover:text-white'
                  }`}>Battery Model</Link>
              </li>
              <li>
                <Link to="/battery-circulation-record" className={`flex items-center pl-14 pr-4 py-2.5 text-sm no-underline transition-all duration-200 ${isActive('/battery-circulation-record') ? 'bg-blue-700 text-white' : 'text-slate-400 hover:bg-slate-700 hover:text-white'
                  }`}>Battery Circulation Record</Link>
              </li>
              <li>
                <Link to="/battery-temporary-storage" className={`flex items-center pl-14 pr-4 py-2.5 text-sm no-underline transition-all duration-200 ${isActive('/battery-temporary-storage') ? 'bg-blue-700 text-white' : 'text-slate-400 hover:bg-slate-700 hover:text-white'
                  }`}>Battery Temporary Storage Records</Link>
              </li>
              <li>
                <Link to="/battery-version-control" className={`flex items-center pl-14 pr-4 py-2.5 text-sm no-underline transition-all duration-200 ${isActive('/battery-version-control') ? 'bg-blue-700 text-white' : 'text-slate-400 hover:bg-slate-700 hover:text-white'
                  }`}>Battery Version Control</Link>
              </li>
            </ul>
          </li>

          <li className="my-1">
            <div
              onClick={() => toggleDropdown('business')}
              className={`flex items-center px-4 py-3 cursor-pointer transition-all duration-200 font-medium ${isSectionActive('business') || isSectionActive('deposit') || isSectionActive('package') || isSectionActive('merchant')
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                }`}
            >
              <span className="flex-1">Business</span>
              <svg
                className={`w-4 h-4 transition-transform duration-300 ${openDropdown === 'business' ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>

            <ul className={`list-none m-0 p-0 overflow-hidden transition-all duration-300 ${openDropdown === 'business' ? 'max-h-96' : 'max-h-0'
              }`}>
              <li>
                <Link to="/deposit-management" className={`flex items-center pl-14 pr-4 py-2.5 text-sm no-underline transition-all duration-200 ${isActive('/deposit-management') ? 'bg-blue-700 text-white' : 'text-slate-400 hover:bg-slate-700 hover:text-white'
                  }`}>Deposit Management</Link>
              </li>
              <li>
                <Link to="/package-management" className={`flex items-center pl-14 pr-4 py-2.5 text-sm no-underline transition-all duration-200 ${isActive('/package-management') ? 'bg-blue-700 text-white' : 'text-slate-400 hover:bg-slate-700 hover:text-white'
                  }`}>Package Management</Link>
              </li>
              <li>
                <Link to="/merchant-management" className={`flex items-center pl-14 pr-4 py-2.5 text-sm no-underline transition-all duration-200 ${isActive('/merchant-management') ? 'bg-blue-700 text-white' : 'text-slate-400 hover:bg-slate-700 hover:text-white'
                  }`}>Merchant Management</Link>
              </li>
            </ul>
          </li>

          <li className="my-1">
            <div
              onClick={() => toggleDropdown('user')}
              className={`flex items-center px-4 py-3 cursor-pointer transition-all duration-200 font-medium ${isSectionActive('user') || isSectionActive('swap') || isSectionActive('auth') || isSectionActive('abnormal')
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                }`}
            >
              <span className="flex-1">User Management</span>
              <svg
                className={`w-4 h-4 transition-transform duration-300 ${openDropdown === 'user' ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>

            <ul className={`list-none m-0 p-0 overflow-hidden transition-all duration-300 ${openDropdown === 'user' ? 'max-h-[400px]' : 'max-h-0'
              }`}>
              <li>
                <Link to="/user-list" className={`flex items-center pl-14 pr-4 py-2.5 text-sm no-underline transition-all duration-200 ${isActive('/user-list') ? 'bg-blue-700 text-white' : 'text-slate-400 hover:bg-slate-700 hover:text-white'
                  }`}>User List</Link>
              </li>
              <li>
                <Link to="/battery-swap-records" className={`flex items-center pl-14 pr-4 py-2.5 text-sm no-underline transition-all duration-200 ${isActive('/battery-swap-records') ? 'bg-blue-700 text-white' : 'text-slate-400 hover:bg-slate-700 hover:text-white'
                  }`}>Battery Swap Records</Link>
              </li>
              <li>
                <Link to="/real-name-authentication" className={`flex items-center pl-14 pr-4 py-2.5 text-sm no-underline transition-all duration-200 ${isActive('/real-name-authentication') ? 'bg-blue-700 text-white' : 'text-slate-400 hover:bg-slate-700 hover:text-white'
                  }`}>Real-name Authentication</Link>
              </li>
              <li>
                <Link to="/abnormal-members-records" className={`flex items-center pl-14 pr-4 py-2.5 text-sm no-underline transition-all duration-200 ${isActive('/abnormal-members-records') ? 'bg-blue-700 text-white' : 'text-slate-400 hover:bg-slate-700 hover:text-white'
                  }`}>Abnormal Members Records</Link>
              </li>
            </ul>
          </li>

          <li className="my-1">
            <div
              onClick={() => toggleDropdown('marketing')}
              className={`flex items-center px-4 py-3 cursor-pointer transition-all duration-200 font-medium ${isSectionActive('coupon') || isSectionActive('marketing')
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                }`}
            >
              <span className="flex-1">Marketing</span>
              <svg
                className={`w-4 h-4 transition-transform duration-300 ${openDropdown === 'marketing' ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>

            <ul className={`list-none m-0 p-0 overflow-hidden transition-all duration-300 ${openDropdown === 'marketing' ? 'max-h-96' : 'max-h-0'
              }`}>
              <li>
                <Link to="/coupon-management" className={`flex items-center pl-14 pr-4 py-2.5 text-sm no-underline transition-all duration-200 ${isActive('/coupon-management') ? 'bg-blue-700 text-white' : 'text-slate-400 hover:bg-slate-700 hover:text-white'
                  }`}>Coupon Management</Link>
              </li>
              <li>
                <Link to="/coupon-receipt-records" className={`flex items-center pl-14 pr-4 py-2.5 text-sm no-underline transition-all duration-200 ${isActive('/coupon-receipt-records') ? 'bg-blue-700 text-white' : 'text-slate-400 hover:bg-slate-700 hover:text-white'
                  }`}>Coupon Receipt Records</Link>
              </li>
            </ul>
          </li>

          <li className="my-1">
            <div
              onClick={() => toggleDropdown('financial')}
              className={`flex items-center px-4 py-3 cursor-pointer transition-all duration-200 font-medium ${isSectionActive('financial') || isSectionActive('package-deposit')
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                }`}
            >
              <span className="flex-1">Financial Center</span>
              <svg
                className={`w-4 h-4 transition-transform duration-300 ${openDropdown === 'financial' ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>

            <ul className={`list-none m-0 p-0 overflow-hidden transition-all duration-300 ${openDropdown === 'financial' ? 'max-h-96' : 'max-h-0'
              }`}>
              <li>
                <Link to="/package-deposit-records" className={`flex items-center pl-14 pr-4 py-2.5 text-sm no-underline transition-all duration-200 ${isActive('/package-deposit-records') ? 'bg-blue-700 text-white' : 'text-slate-400 hover:bg-slate-700 hover:text-white'
                  }`}>Package Deposit Records</Link>
              </li>
            </ul>
          </li>

          <li className="my-1">
            <div
              onClick={() => toggleDropdown('system')}
              className={`flex items-center px-4 py-3 cursor-pointer transition-all duration-200 font-medium ${isSectionActive('system') || isSectionActive('account') || isSectionActive('role')
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                }`}
            >
              <span className="flex-1">System</span>
              <svg
                className={`w-4 h-4 transition-transform duration-300 ${openDropdown === 'system' ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>

            <ul className={`list-none m-0 p-0 overflow-hidden transition-all duration-300 ${openDropdown === 'system' ? 'max-h-96' : 'max-h-0'
              }`}>
              <li>
                <Link to="/account-management" className={`flex items-center pl-14 pr-4 py-2.5 text-sm no-underline transition-all duration-200 ${isActive('/account-management') ? 'bg-blue-700 text-white' : 'text-slate-400 hover:bg-slate-700 hover:text-white'
                  }`}>Account Management</Link>
              </li>
              <li>
                <Link to="/role-management" className={`flex items-center pl-14 pr-4 py-2.5 text-sm no-underline transition-all duration-200 ${isActive('/role-management') ? 'bg-blue-700 text-white' : 'text-slate-400 hover:bg-slate-700 hover:text-white'
                  }`}>Role Management</Link>
              </li>
            </ul>
          </li>

          <li className="my-1">
            <div
              onClick={() => toggleDropdown('admin')}
              className={`flex items-center px-4 py-3 cursor-pointer transition-all duration-200 font-medium ${isSectionActive('admin')
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                }`}
            >
              <span className="flex-1">Admin Management</span>
              <svg
                className={`w-4 h-4 transition-transform duration-300 ${openDropdown === 'admin' ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>

            <ul className={`list-none m-0 p-0 overflow-hidden transition-all duration-300 ${openDropdown === 'admin' ? 'max-h-[500px]' : 'max-h-0'
              }`}>
              <li>
                <Link to="/admin/dashboard" className={`flex items-center pl-14 pr-4 py-2.5 text-sm no-underline transition-all duration-200 ${isActive('/admin/dashboard') ? 'bg-blue-700 text-white' : 'text-slate-400 hover:bg-slate-700 hover:text-white'
                  }`}>Dashboard</Link>
              </li>
              <li>
                <Link to="/admin/battery-changes" className={`flex items-center pl-14 pr-4 py-2.5 text-sm no-underline transition-all duration-200 ${isActive('/admin/battery-changes') ? 'bg-blue-700 text-white' : 'text-slate-400 hover:bg-slate-700 hover:text-white'
                  }`}>Battery Changes</Link>
              </li>
              <li>
                <Link to="/admin/ai-forecast" className={`flex items-center pl-14 pr-4 py-2.5 text-sm no-underline transition-all duration-200 ${isActive('/admin/ai-forecast') ? 'bg-blue-700 text-white' : 'text-slate-400 hover:bg-slate-700 hover:text-white'
                  }`}>AI Forecast</Link>
              </li>
              <li>
                <Link to="/admin/report-management" className={`flex items-center pl-14 pr-4 py-2.5 text-sm no-underline transition-all duration-200 ${isActive('/admin/report-management') ? 'bg-blue-700 text-white' : 'text-slate-400 hover:bg-slate-700 hover:text-white'
                  }`}>Report Management</Link>
              </li>
              <li>
                <Link to="/admin/revenue-report" className={`flex items-center pl-14 pr-4 py-2.5 text-sm no-underline transition-all duration-200 ${isActive('/admin/revenue-report') ? 'bg-blue-700 text-white' : 'text-slate-400 hover:bg-slate-700 hover:text-white'
                  }`}>Revenue Report</Link>
              </li>
            </ul>
          </li>
        </ul>
      </nav>

      <style>{`
        .scrollbar-thin::-webkit-scrollbar {
          width: 6px;
        }
        .scrollbar-thin::-webkit-scrollbar-track {
          background: #1e293b;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb {
          background: #475569;
          border-radius: 3px;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb:hover {
          background: #64748b;
        }
      `}</style>
    </aside>
  );
};

export default Sidebar;
