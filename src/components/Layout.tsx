import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, BookOpen, PenTool, BarChart2, Settings, Home, Trophy } from 'lucide-react';
import { cn } from '../lib/utils';
import { useI18n } from '../hooks/useI18n';

export default function Layout({ children }: { children: React.ReactNode }) {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const location = useLocation();
  const { t } = useI18n();

  const navigation = [
    { name: t('nav.home'), href: '/', icon: Home },
    { name: t('nav.course'), href: '/course', icon: BookOpen },
    { name: t('nav.exercises'), href: '/exercises', icon: PenTool },
    { name: t('nav.reading'), href: '/reading', icon: BookOpen },
    { name: t('nav.progress'), href: '/progress', icon: BarChart2 },
    { name: t('nav.leaderboard'), href: '/leaderboard', icon: Trophy },
    { name: t('nav.settings'), href: '/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Navbar */}
      <nav className="bg-card border-b border-border shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <Link to="/" className="flex-shrink-0 flex items-center gap-2">
                <div className="flex gap-1 h-6 items-center">
                  <div className="w-2 h-full bg-german-black rounded-sm"></div>
                  <div className="w-2 h-full bg-german-red rounded-sm"></div>
                  <div className="w-2 h-full bg-german-gold rounded-sm"></div>
                </div>
                <span className="font-bold text-xl tracking-tight">Open-Deutsch</span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {navigation.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={cn(
                      "inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors",
                      isActive
                        ? "border-primary text-primary"
                        : "border-transparent text-muted-foreground hover:border-gray-300 hover:text-foreground"
                    )}
                  >
                    <item.icon className="w-4 h-4 mr-2" />
                    {item.name}
                  </Link>
                );
              })}
            </div>

            {/* Mobile menu button */}
            <div className="-mr-2 flex items-center sm:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary"
              >
                <span className="sr-only">{t('nav.open_menu')}</span>
                {isMenuOpen ? (
                  <X className="block h-6 w-6" aria-hidden="true" />
                ) : (
                  <Menu className="block h-6 w-6" aria-hidden="true" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="sm:hidden">
            <div className="pt-2 pb-3 space-y-1">
              {navigation.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setIsMenuOpen(false)}
                    className={cn(
                      "block pl-3 pr-4 py-2 border-l-4 text-base font-medium",
                      isActive
                        ? "bg-accent border-primary text-primary"
                        : "border-transparent text-muted-foreground hover:bg-gray-50 hover:border-gray-300 hover:text-foreground"
                    )}
                  >
                    <div className="flex items-center">
                      <item.icon className="w-5 h-5 mr-3" />
                      {item.name}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-card border-t border-border mt-auto">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Open-Deutsch. {t('footer.tagline')}
          </p>
        </div>
      </footer>
    </div>
  );
}
