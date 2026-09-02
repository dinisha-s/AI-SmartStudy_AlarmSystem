import React from 'react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { 
  LogOut, 
  Sparkles, 
  Clock, 
  Brain, 
  Flame, 
  Target, 
  Bell, 
  BookOpen, 
  TrendingUp 
} from 'lucide-react';

export default function Dashboard() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-[#0b0f19] text-white flex flex-col">
      {/* Top Navbar */}
      <header className="border-b border-white/10 glass-panel sticky top-0 z-50 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-lg shadow-lg shadow-indigo-500/20">
            S
          </div>
          <div>
            <h1 className="font-bold tracking-tight text-white flex items-center gap-2">
              SmartStudy <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">AI Active</span>
            </h1>
            <p className="text-xs text-gray-400">Logged in as {user?.email}</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-semibold">
            <Flame size={16} />
            <span>{user?.streak || 0} Day Streak</span>
          </div>

          <button
            onClick={logout}
            className="px-3.5 py-1.5 rounded-xl bg-gray-800/80 hover:bg-gray-800 text-gray-300 text-xs font-medium flex items-center gap-1.5 transition-colors border border-gray-700/50"
          >
            <LogOut size={14} />
            <span>Logout</span>
          </button>
        </div>
      </header>

      {/* Main Dashboard Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 space-y-8">
        {/* Welcome Hero */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel p-8 rounded-3xl relative overflow-hidden border border-white/10"
        >
          <div className="relative z-10 space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-medium border border-indigo-500/20">
              <Sparkles size={14} />
              <span>Personalized Study Hub</span>
            </div>
            <h2 className="text-3xl font-bold tracking-tight">
              Welcome back, <span className="gradient-text">{user?.username || 'Student'}</span>!
            </h2>
            <p className="text-gray-400 text-sm leading-relaxed">
              Your intelligent study alarm system is ready. Track sessions, generate Gemini study plans, and predict your daily focus scores.
            </p>
          </div>
        </motion.div>

        {/* Overview Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-2">
            <div className="flex items-center justify-between text-gray-400 text-xs">
              <span>Target Study</span>
              <Target size={18} className="text-indigo-400" />
            </div>
            <div className="text-2xl font-bold">{user?.daily_study_hours || 4} hrs/day</div>
            <p className="text-xs text-gray-500">Daily goal set</p>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-2">
            <div className="flex items-center justify-between text-gray-400 text-xs">
              <span>Current Streak</span>
              <Flame size={18} className="text-orange-400" />
            </div>
            <div className="text-2xl font-bold text-orange-400">{user?.streak || 0} Days</div>
            <p className="text-xs text-gray-500">Consistent study logging</p>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-2">
            <div className="flex items-center justify-between text-gray-400 text-xs">
              <span>Wake Window</span>
              <Clock size={18} className="text-purple-400" />
            </div>
            <div className="text-xl font-bold">
              {user?.wake_window_start || '06:30'} - {user?.wake_window_end || '07:30'}
            </div>
            <p className="text-xs text-gray-500">Smart alarm window</p>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-2">
            <div className="flex items-center justify-between text-gray-400 text-xs">
              <span>Snooze Risk AI</span>
              <TrendingUp size={18} className="text-emerald-400" />
            </div>
            <div className="text-2xl font-bold text-emerald-400">Low Risk</div>
            <p className="text-xs text-gray-500">FastAPI ML Ready</p>
          </div>
        </div>

        {/* Feature Modules Quick Access Shell */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-3 hover:border-indigo-500/40 transition-all">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-bold">
              <Bell size={20} />
            </div>
            <h3 className="font-semibold text-lg">Smart Alarm Manager</h3>
            <p className="text-xs text-gray-400">Phase 6: Set alarms, record wake events, snooze logs, and math puzzles.</p>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-3 hover:border-purple-500/40 transition-all">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center font-bold">
              <BookOpen size={20} />
            </div>
            <h3 className="font-semibold text-lg">Study Session Tracker</h3>
            <p className="text-xs text-gray-400">Phase 7: Live timer, break logger, and focus score calculation.</p>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-3 hover:border-pink-500/40 transition-all">
            <div className="w-10 h-10 rounded-xl bg-pink-500/10 text-pink-400 flex items-center justify-center font-bold">
              <Brain size={20} />
            </div>
            <h3 className="font-semibold text-lg">Gemini AI Assistant</h3>
            <p className="text-xs text-gray-400">Phase 13+: Generate study plans, summarize notes, and take quizzes.</p>
          </div>
        </div>
      </main>
    </div>
  );
}
