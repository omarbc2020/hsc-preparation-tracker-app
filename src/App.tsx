import React, { useEffect, useState } from 'react';
import { useStore } from './store/useStore';
import Auth from './components/Auth/Auth';
import Dashboard from './components/Dashboard/Dashboard';
import Subjects from './components/Subjects/Subjects';
import Exams from './components/Exams/Exams';
import StudyHours from './components/StudyHours/StudyHours';
import ProfileModal from './components/Profile/ProfileModal';
import { LayoutDashboard, BookOpen, GraduationCap, Clock, User as UserIcon, Bell } from 'lucide-react';
import { supabase } from './lib/supabase';

export default function App() {
  const { user, setUser, fetchData } = useStore();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        supabase.from('profiles').select('*').eq('id', session.user.id).single().then(({ data }) => {
          if (data) setUser(data);
        });
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        supabase.from('profiles').select('*').eq('id', session.user.id).single().then(({ data }) => {
          if (data) setUser(data);
        });
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  if (!user) {
    return <Auth />;
  }

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'subjects', label: 'Subjects & Chapters', icon: BookOpen },
    { id: 'exams', label: 'Exams', icon: GraduationCap },
    { id: 'study', label: 'Study Hours', icon: Clock },
  ];

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-white border-b md:border-b-0 md:border-r border-zinc-200 flex flex-col">
        <div className="p-6">
          <h1 className="text-xl font-bold text-emerald-600">HSC Tracker</h1>
          <p className="text-xs text-zinc-500 mt-1">Preparation Assistant</p>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                activeTab === tab.id
                  ? 'bg-emerald-50 text-emerald-700 font-medium'
                  : 'text-zinc-600 hover:bg-zinc-100'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              {tab.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-zinc-200">
          <div className="flex items-center gap-3 px-4 py-3">
            <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-xs">
              {user.name[0]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-zinc-900 truncate">{user.full_name || user.name}</p>
              <p className="text-xs text-zinc-500 truncate">{user.unique_id}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <header className="bg-white border-b border-zinc-200 px-8 py-4 sticky top-0 z-10 flex items-center justify-between">
          <div className="flex items-center gap-2 text-zinc-500 text-sm">
            <span className="capitalize">{activeTab}</span>
          </div>
          <div className="flex items-center gap-4">
            <button className="p-2 hover:bg-zinc-100 rounded-full transition-colors text-zinc-400">
              <Bell className="w-5 h-5" />
            </button>
            <button 
              onClick={() => setIsProfileOpen(true)}
              className="flex items-center gap-2 p-1 pl-3 hover:bg-zinc-100 rounded-full transition-colors border border-zinc-200"
            >
              <span className="text-sm font-medium text-zinc-700 hidden sm:block">{user.name}</span>
              <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center text-white font-bold text-xs">
                {user.name[0]}
              </div>
            </button>
          </div>
        </header>

        <div className="p-4 md:p-8 max-w-6xl mx-auto">
          {activeTab === 'dashboard' && <Dashboard />}
          {activeTab === 'subjects' && <Subjects />}
          {activeTab === 'exams' && <Exams />}
          {activeTab === 'study' && <StudyHours />}
        </div>
      </main>

      <ProfileModal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
    </div>
  );
}
