import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Shield, User as UserIcon, LogOut, Menu, X, ChevronDown, PlusCircle } from 'lucide-react';

interface NavbarProps {
  currentPath: string;
  navigate: (path: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentPath, navigate }) => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleNav = (path: string) => {
    navigate(path);
    setMobileMenuOpen(false);
    setUserMenuOpen(false);
  };

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Citizen Portal tag matching screenshot */}
          <div
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => handleNav('/')}
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 group-hover:scale-105 transition-transform">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="font-extrabold text-base tracking-tight text-slate-900 leading-tight">
                Loan Assistant
              </div>
              <div className="text-[10px] uppercase tracking-wider text-emerald-700 font-bold">
                CITIZEN PORTAL
              </div>
            </div>
          </div>

          {/* Desktop Nav Items matching screenshot */}
          <div className="hidden md:flex items-center gap-2">
            <button
              onClick={() => handleNav('/')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                currentPath === '/' ? 'text-emerald-800 bg-emerald-50' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Home
            </button>
            <button
              onClick={() => handleNav('/dashboard')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                currentPath === '/dashboard' ? 'text-emerald-800 bg-emerald-50' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Schemes
            </button>
            <button
              onClick={() => handleNav('/apply')}
              className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
                currentPath === '/apply'
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-200/60'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Check Eligibility
            </button>
            <button
              onClick={() => handleNav('/history')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                currentPath === '/history' ? 'text-emerald-800 bg-emerald-50' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              History
            </button>
            <button
              onClick={() => handleNav('/model-metrics')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                currentPath === '/model-metrics' ? 'text-emerald-800 bg-emerald-50' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Compare
            </button>

            {isAdmin && (
              <button
                onClick={() => handleNav('/admin')}
                className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                  currentPath === '/admin' ? 'text-amber-800 bg-amber-50' : 'text-amber-600 hover:bg-amber-50'
                }`}
              >
                Admin
              </button>
            )}
          </div>

          {/* User profile dropdown matching screenshot */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-slate-50 text-slate-700 text-sm font-medium border border-transparent hover:border-slate-200 transition-all"
                >
                  <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
                    {user?.name?.[0] || 'U'}
                  </div>
                  <span>{user?.name?.split(' ')[0]?.toLowerCase() || 'user'}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-1 w-48 bg-white border border-slate-200 rounded-xl shadow-lg py-1 z-50 text-xs">
                    <div className="px-3 py-2 border-b border-slate-100">
                      <p className="font-bold text-slate-800">{user?.name}</p>
                      <p className="text-slate-500 text-[11px] truncate">{user?.email}</p>
                    </div>
                    <button
                      onClick={() => handleNav('/dashboard')}
                      className="w-full text-left px-3 py-2 hover:bg-slate-50 text-slate-700"
                    >
                      Dashboard
                    </button>
                    <button
                      onClick={() => handleNav('/history')}
                      className="w-full text-left px-3 py-2 hover:bg-slate-50 text-slate-700"
                    >
                      Application History
                    </button>
                    <button
                      onClick={() => {
                        logout();
                        setUserMenuOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-rose-50 text-rose-600 flex items-center gap-1.5 border-t border-slate-100"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleNav('/login')}
                  className="px-3.5 py-1.5 rounded-lg text-sm font-medium text-slate-600 hover:text-slate-900"
                >
                  Sign in
                </button>
                <button
                  onClick={() => handleNav('/register')}
                  className="px-4 py-1.5 rounded-lg text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                >
                  Register
                </button>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-2 pb-4 space-y-1">
          <button
            onClick={() => handleNav('/')}
            className="w-full text-left px-3 py-2 rounded-lg text-sm text-slate-700 hover:bg-slate-50"
          >
            Home
          </button>
          <button
            onClick={() => handleNav('/dashboard')}
            className="w-full text-left px-3 py-2 rounded-lg text-sm text-slate-700 hover:bg-slate-50"
          >
            Schemes
          </button>
          <button
            onClick={() => handleNav('/apply')}
            className="w-full text-left px-3 py-2 rounded-lg text-sm font-semibold bg-emerald-50 text-emerald-800"
          >
            Check Eligibility
          </button>
          <button
            onClick={() => handleNav('/history')}
            className="w-full text-left px-3 py-2 rounded-lg text-sm text-slate-700 hover:bg-slate-50"
          >
            History
          </button>
          <button
            onClick={() => handleNav('/model-metrics')}
            className="w-full text-left px-3 py-2 rounded-lg text-sm text-slate-700 hover:bg-slate-50"
          >
            Compare Models
          </button>
          {isAuthenticated ? (
            <button
              onClick={logout}
              className="w-full text-left px-3 py-2 rounded-lg text-sm text-rose-600 hover:bg-rose-50 border-t border-slate-100 mt-2"
            >
              Sign out ({user?.name})
            </button>
          ) : (
            <button
              onClick={() => handleNav('/login')}
              className="w-full text-left px-3 py-2 rounded-lg text-sm text-blue-600 font-bold"
            >
              Sign In
            </button>
          )}
        </div>
      )}
    </nav>
  );
};
