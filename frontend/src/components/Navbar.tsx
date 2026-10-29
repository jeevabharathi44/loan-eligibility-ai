import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Shield, User as UserIcon, LogOut, Menu, X, BarChart3, PlusCircle, Smartphone } from 'lucide-react';

interface NavbarProps {
  currentPath: string;
  navigate: (path: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentPath, navigate }) => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNav = (path: string) => {
    navigate(path);
    setMobileMenuOpen(false);
  };

  return (
    <nav className="border-b border-slate-200 bg-white sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Heading: Clean Light Portal Theme */}
          <div
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => handleNav('/')}
          >
            <div className="w-10 h-10 rounded-xl border border-emerald-300 bg-emerald-50/70 flex items-center justify-center text-emerald-600 shadow-sm group-hover:scale-105 transition-transform">
              <Shield className="w-5 h-5 text-emerald-600 stroke-[2]" />
            </div>
            <div>
              <div className="font-extrabold text-base tracking-tight text-slate-900 leading-tight">
                Loan Assistant
              </div>
              <div className="text-[10px] uppercase tracking-wider text-emerald-600 font-bold -mt-0.5">
                CITIZEN PORTAL
              </div>
            </div>
          </div>

          {/* Desktop Nav Items */}
          <div className="hidden md:flex items-center gap-1.5">
            <button
              onClick={() => handleNav('/')}
              className={`px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                currentPath === '/' ? 'text-blue-600 font-semibold bg-blue-50 border border-blue-200/80' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Home
            </button>

            <button
              onClick={() => handleNav('/schemes')}
              className={`px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                currentPath === '/schemes' ? 'text-blue-600 font-semibold bg-blue-50 border border-blue-200/80' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Schemes
            </button>

            <button
              onClick={() => handleNav('/apply')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                currentPath === '/apply' ? 'text-blue-600 font-semibold bg-blue-50 border border-blue-200/80' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <span>Check Eligibility</span>
            </button>

            <button
              onClick={() => handleNav('/sso')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                currentPath === '/sso' ? 'text-blue-600 font-semibold bg-blue-50 border border-blue-200/80' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <span>DigiLocker SSO</span>
            </button>

            <button
              onClick={() => handleNav('/history')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                currentPath === '/history' ? 'text-blue-600 font-semibold bg-blue-50 border border-blue-200/80' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <span>History</span>
            </button>

            <button
              onClick={() => handleNav('/compare')}
              className={`px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                currentPath === '/compare' ? 'text-blue-600 font-semibold bg-blue-50 border border-blue-200/80' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Compare
            </button>

            <button
              onClick={() => handleNav('/admin')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ml-1 ${
                currentPath === '/admin' || currentPath === '/cockpit'
                  ? 'text-amber-800 bg-amber-50 border border-amber-200'
                  : 'text-amber-700 hover:text-amber-800 hover:bg-amber-50/50'
              }`}
            >
              <Shield className="w-3.5 h-3.5 text-amber-600" />
              <span>Cockpit</span>
            </button>
          </div>

          {/* User Profile / Action Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-blue-50/60 border border-blue-200/80 text-sm">
                  <UserIcon className="w-3.5 h-3.5 text-blue-600" />
                  <span className="font-semibold text-xs text-slate-800">{user?.name}</span>
                  {isAdmin && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-200 font-mono">
                      AUDITOR
                    </span>
                  )}
                </div>
                <button
                  onClick={logout}
                  title="Sign out"
                  className="p-2 rounded-xl text-slate-500 hover:text-red-600 hover:bg-slate-100 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleNav('/login')}
                  className="text-sm font-semibold text-slate-700 hover:text-slate-900 transition-colors"
                >
                  Sign in
                </button>
                <button
                  onClick={() => handleNav('/register')}
                  className="px-5 py-2 rounded-lg text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-all"
                >
                  Register
                </button>
              </div>
            )}
          </div>

          {/* Mobile hamburger */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 bg-white border border-slate-200"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 bg-white px-4 pt-2 pb-4 space-y-2 shadow-lg">
          {isAuthenticated ? (
            <>
              <div className="px-3 py-2 text-xs font-semibold text-slate-500 border-b border-slate-100 mb-2 flex justify-between items-center">
                <span>Signed in as <strong className="text-slate-900">{user?.name}</strong></span>
                {isAdmin && <span className="text-amber-700 text-[10px] font-mono">AUDITOR</span>}
              </div>
              <button
                onClick={() => handleNav('/')}
                className="w-full text-left px-3 py-2 rounded-lg text-sm text-slate-800 hover:bg-slate-50"
              >
                Home
              </button>
              <button
                onClick={() => handleNav('/apply')}
                className="w-full text-left px-3 py-2 rounded-lg text-sm text-sky-700 hover:bg-slate-50 font-semibold"
              >
                Check Eligibility
              </button>
              <button
                onClick={() => handleNav('/sso')}
                className="w-full text-left px-3 py-2 rounded-lg text-sm text-slate-800 hover:bg-slate-50"
              >
                DigiLocker SSO (Meri Pehchaan)
              </button>
              <button
                onClick={() => handleNav('/history')}
                className="w-full text-left px-3 py-2 rounded-lg text-sm text-slate-800 hover:bg-slate-50"
              >
                History
              </button>
              <button
                onClick={() => handleNav('/admin')}
                className="w-full text-left px-3 py-2 rounded-lg text-sm text-amber-800 hover:bg-amber-50 font-semibold"
              >
                Dr. Varman Cockpit
              </button>
              <button
                onClick={() => handleNav('/model-metrics')}
                className="w-full text-left px-3 py-2 rounded-lg text-sm text-slate-600 hover:bg-slate-50"
              >
                Model Metrics
              </button>
              <button
                onClick={logout}
                className="w-full text-left px-3 py-2 rounded-lg text-sm text-red-600 hover:bg-red-50 border-t border-slate-100 mt-2"
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => handleNav('/')}
                className="w-full text-left px-3 py-2 rounded-lg text-sm text-slate-800 hover:bg-slate-50"
              >
                Home
              </button>
              <button
                onClick={() => handleNav('/apply')}
                className="w-full text-left px-3 py-2 rounded-lg text-sm text-slate-800 font-semibold hover:bg-slate-50"
              >
                Check Eligibility
              </button>
              <button
                onClick={() => handleNav('/sso')}
                className="w-full text-left px-3 py-2 rounded-lg text-sm text-slate-800 hover:bg-slate-50"
              >
                DigiLocker SSO
              </button>
              <button
                onClick={() => handleNav('/login')}
                className="w-full text-left px-3 py-2 rounded-lg text-sm text-slate-800 hover:bg-slate-50"
              >
                Sign in
              </button>
              <button
                onClick={() => handleNav('/register')}
                className="w-full text-left px-3 py-2 rounded-lg text-sm text-slate-800 font-semibold hover:bg-slate-50"
              >
                Register
              </button>
              <button
                onClick={() => handleNav('/admin')}
                className="w-full text-left px-3 py-2 rounded-lg text-sm text-amber-800 hover:bg-amber-50"
              >
                Dr. Varman Cockpit
              </button>
              <button
                onClick={() => handleNav('/model-metrics')}
                className="w-full text-left px-3 py-2 rounded-lg text-sm text-slate-600 hover:bg-slate-50"
              >
                Model Metrics
              </button>
            </>
          )}
        </div>
      )}
    </nav>
  );
};
