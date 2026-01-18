import { useState, type ComponentType } from 'react';
import { X, Menu, Users, Zap, LayoutGrid, Sparkles, type LucideProps } from 'lucide-react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { PersonList } from './components/PersonList';
import { StreamDisplay } from './components/StreamDisplay';
import { ProcessRequests } from './components/ProcessRequests';

function NavLink({ to, children, icon: Icon }: { to: string; children: React.ReactNode; icon: ComponentType<LucideProps> }) {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link
      to={to}
      className={`relative group flex items-center gap-2.5 px-5 py-2.5 text-sm font-bold rounded-2xl transition-all duration-300 ${
        isActive
          ? 'text-blue-600 bg-blue-50/50 shadow-sm'
          : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100/50'
      }`}
    >
      <Icon className={`w-4 h-4 transition-transform group-hover:scale-110 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
      {children}
      {isActive && (
        <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-blue-600 rounded-full shadow-[0_0_8px_rgba(37,99,235,0.6)] animate-in zoom-in" />
      )}
    </Link>
  );
}

function AppContent() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <nav className="sticky top-0 z-[100] bg-white border-b border-slate-200/60 shadow-sm">
        <div className="max-w-[1440px] mx-auto px-6">
          <div className="flex items-center justify-between h-20">
            {/* Logo/Brand */}
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200 transition-transform group-hover:rotate-6">
                <Sparkles className="w-6 h-6 text-white fill-current" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-black text-slate-900 leading-none tracking-tight">Presight</span>
                <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest mt-0.5">Exercise Portal</span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center bg-slate-50 p-1.5 rounded-[1.25rem] border border-slate-100">
              <NavLink to="/" icon={Users}>People</NavLink>
              <NavLink to="/stream" icon={Zap}>Stream</NavLink>
              <NavLink to="/process" icon={LayoutGrid}>Queue</NavLink>
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-3 rounded-2xl bg-slate-50 text-slate-600 hover:text-slate-900 transition-all border border-slate-200 active:scale-90"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="md:hidden absolute top-full left-0 right-0 bg-white border-b border-slate-200 p-6 flex flex-col gap-3 animate-in slide-in-from-top-4 duration-300">
              <Link
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 font-bold text-slate-900 border border-slate-100"
              >
                <Users className="w-5 h-5 text-blue-600" />
                Person List
              </Link>
              <Link
                to="/stream"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 font-bold text-slate-900 border border-slate-100"
              >
                <Zap className="w-5 h-5 text-amber-500" />
                Stream Display
              </Link>
              <Link
                to="/process"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 font-bold text-slate-900 border border-slate-100"
              >
                <LayoutGrid className="w-5 h-5 text-violet-500" />
                Process Requests
              </Link>
            </div>
          )}
        </div>
      </nav>

      <main className="relative">
        <Routes>
          <Route path="/" element={<PersonList />} />
          <Route path="/stream" element={<StreamDisplay />} />
          <Route path="/process" element={<ProcessRequests />} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
