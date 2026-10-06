import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Shield, User as UserIcon, LogOut, Menu, X, BarChart3, PlusCircle, History } from 'lucide-react';

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
    <nav className="border-b border-line/60 bg-bg/95 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <div
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => handleNav('/')}
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cy to-blue-600 flex items-center justify-center text-bg font-black text-xl shadow-lg shadow-cy/20 group-hover:scale-105 transition-transform">
              <Shield className="w-5 h-5 text-bg" />
            </div>
            <div>
              <div className="font-extrabold text-lg tracking-tight">
                Loan <span className="text-cy">Eligibility</span> AI
              </div>
              <div className="text-[10px] uppercase tracking-wider text-mute -mt-1 font-semibold">
                Explainable Risk Engine
              </div>
            </div>
          </div>

          {/* Desktop Nav Items */}
          <div className="hidden md:flex items-center gap-1">
            {isAuthenticated ? (
              <>
                <button
                  onClick={() => handleNav('/dashboard')}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    currentPath === '/dashboard' ? 'text-cy bg-field' : 'text-mute hover:text-ink hover:bg-field/50'
                  }`}
                >
                  Dashboard
                </button>
                <button
                  onClick={() => handleNav('/apply')}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    currentPath === '/apply' ? 'text-cy bg-field' : 'text-mute hover:text-ink hover:bg-field/50'
                  }`}
                >
                  <PlusCircle className="w-4 h-4 text-cy" />
                  New Application
                </button>
                <button
                  onClick={() => handleNav('/history')}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    currentPath === '/history' ? 'text-cy bg-field' : 'text-mute hover:text-ink hover:bg-field/50'
                  }`}
                >
                  <History className="w-4 h-4" />
                  History
                </button>
                <button
                  onClick={() => handleNav('/model-metrics')}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    currentPath === '/model-metrics' ? 'text-cy bg-field' : 'text-mute hover:text-ink hover:bg-field/50'
                  }`}
                >
                  <BarChart3 className="w-4 h-4" />
                  Model Metrics
                </button>

                {isAdmin && (
                  <button
                    onClick={() => handleNav('/admin')}
                    className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                      currentPath === '/admin' ? 'text-warn bg-warn/10 border border-warn/30' : 'text-warn/80 hover:text-warn hover:bg-field/50'
                    }`}
                  >
                    Admin Console
                  </button>
                )}
              </>
            ) : (
              <>
                <button
                  onClick={() => handleNav('/model-metrics')}
                  className="px-3 py-2 rounded-lg text-sm font-medium text-mute hover:text-ink hover:bg-field/50"
                >
                  Model Metrics
                </button>
              </>
            )}
          </div>

          {/* User profile / Auth buttons */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-field border border-line text-sm">
                  <UserIcon className="w-3.5 h-3.5 text-cy" />
                  <span className="font-medium text-xs">{user?.name}</span>
                  {isAdmin && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-warn/20 text-warn border border-warn/30">
                      ADMIN
                    </span>
                  )}
                </div>
                <button
                  onClick={logout}
                  title="Sign out"
                  className="p-2 rounded-xl text-mute hover:text-bad hover:bg-field transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleNav('/login')}
                  className="px-4 py-2 rounded-xl text-sm font-medium text-mute hover:text-ink transition-colors"
                >
                  Sign in
                </button>
                <button
                  onClick={() => handleNav('/register')}
                  className="px-4 py-2 rounded-xl text-sm font-bold bg-gradient-to-r from-cy to-blue-600 text-bg hover:opacity-95 shadow-md shadow-cy/20 transition-all"
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
              className="p-2 rounded-lg text-mute hover:text-ink bg-field border border-line"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-line bg-card/95 px-4 pt-2 pb-4 space-y-2">
          {isAuthenticated ? (
            <>
              <div className="px-3 py-2 text-xs font-semibold text-mute border-b border-line mb-2 flex justify-between items-center">
                <span>Signed in as <strong className="text-ink">{user?.name}</strong></span>
                {isAdmin && <span className="text-warn text-[10px]">ADMIN</span>}
              </div>
              <button
                onClick={() => handleNav('/dashboard')}
                className="w-full text-left px-3 py-2 rounded-lg text-sm text-ink hover:bg-field"
              >
                Dashboard
              </button>
              <button
                onClick={() => handleNav('/apply')}
                className="w-full text-left px-3 py-2 rounded-lg text-sm text-cy hover:bg-field font-semibold"
              >
                + New Application
              </button>
              <button
                onClick={() => handleNav('/history')}
                className="w-full text-left px-3 py-2 rounded-lg text-sm text-ink hover:bg-field"
              >
                Application History
              </button>
              <button
                onClick={() => handleNav('/model-metrics')}
                className="w-full text-left px-3 py-2 rounded-lg text-sm text-ink hover:bg-field"
              >
                Model Metrics
              </button>
              {isAdmin && (
                <button
                  onClick={() => handleNav('/admin')}
                  className="w-full text-left px-3 py-2 rounded-lg text-sm text-warn hover:bg-field"
                >
                  Admin Console
                </button>
              )}
              <button
                onClick={logout}
                className="w-full text-left px-3 py-2 rounded-lg text-sm text-bad hover:bg-field border-t border-line mt-2"
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => handleNav('/login')}
                className="w-full text-left px-3 py-2 rounded-lg text-sm text-ink hover:bg-field"
              >
                Sign in
              </button>
              <button
                onClick={() => handleNav('/register')}
                className="w-full text-left px-3 py-2 rounded-lg text-sm text-cy font-bold hover:bg-field"
              >
                Register
              </button>
              <button
                onClick={() => handleNav('/model-metrics')}
                className="w-full text-left px-3 py-2 rounded-lg text-sm text-mute hover:bg-field"
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
