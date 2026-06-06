import { useState, useEffect } from 'react';
import { Activity, Server, Database, Trash2, Stethoscope, FileText, Sun, Moon } from 'lucide-react';
import Overview from './components/Overview';
import Sessions from './components/Sessions';
import Databases from './components/Databases';
import Bloat from './components/Bloat';
import SlowQueries from './components/SlowQueries';

export default function App() {
  const [activeTab, setActiveTab] = useState('overview');
  // THEME TOGGLE STATE
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const navItems = [
    { id: 'overview', label: 'Overview', icon: Activity },
    { id: 'sessions', label: 'Live Sessions', icon: Server },
    { id: 'queries', label: 'Top Queries', icon: FileText }, // YANGI TAB
    { id: 'databases', label: 'Databases', icon: Database },
    { id: 'bloat', label: 'Bloat Analysis', icon: Trash2 },
  ];

  return (
    <div className="flex h-screen overflow-hidden selection:bg-pg-accent selection:text-[var(--pg-bg)]">
      <aside className="w-[300px] border-r border-[var(--pg-border)] py-10 flex flex-col z-10 bg-[var(--pg-bg)]">
        
        {/* Logo and Theme Toggle */}
        <div className="flex items-center justify-between px-8 mb-14">
          <div className="text-3xl font-bold flex items-center gap-4 cursor-pointer group">
            <div className="relative flex items-center justify-center">
              <Stethoscope size={36} className="text-pg-accent logo-icon-custom rounded-full p-2" />
              <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-[2.5px] border-[var(--pg-bg)] rounded-full shadow-[0_0_12px_rgba(16,185,129,0.8)] animate-pulse"></div>
            </div>
            <span className="tracking-wide group-hover:text-[var(--pg-text)] transition-colors">
              pgdoctor<span className="text-pg-accent">.</span>
            </span>
          </div>
          
          {/* THEME BUTTON */}
          <button 
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-2 rounded-xl text-[var(--pg-muted)] hover:bg-[var(--pg-border)] hover:text-[var(--pg-text)] transition-colors"
            title="Toggle Light/Dark Mode"
          >
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>

        <nav className="flex flex-col px-6 gap-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`group flex items-center gap-4 px-6 py-4 rounded-xl text-[18px] transition-all duration-300 active:scale-[0.97] ${
                  isActive 
                    ? 'bg-[var(--pg-panel)] border border-[var(--pg-border)] text-[var(--pg-text)] font-medium shadow-xl' 
                    : 'text-[var(--pg-muted)] border border-transparent hover:text-[var(--pg-text)] hover:bg-[var(--pg-hover)]'
                }`}
              >
                <Icon size={24} className={`transition-all duration-300 ${isActive ? 'text-pg-accent' : 'group-hover:text-[var(--pg-text)]'}`} />
                {item.label}
              </button>
            );
          })}
        </nav>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden relative bg-[var(--pg-bg)]">
        <div className="absolute top-[-20%] left-[20%] w-[800px] h-[800px] bg-pg-accent/5 rounded-full blur-[200px] pointer-events-none"></div>

        <div className="p-14 flex-1 overflow-y-auto z-10 scroll-smooth">
          {activeTab === 'overview' && <Overview />}
          {activeTab === 'sessions' && <Sessions />}
          {activeTab === 'queries' && <SlowQueries />} {/* YANGI COMPONENT */}
          {activeTab === 'databases' && <Databases />}
          {activeTab === 'bloat' && <Bloat />}
        </div>
      </main>
    </div>
  );
}
