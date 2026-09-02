import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import AlarmManager from '../components/AlarmManager';
import StudyTracker from '../components/StudyTracker';
import AiStudyPlanner from '../components/AiStudyPlanner';
import AiTools from '../components/AiTools';
import AnalyticsDashboard from '../components/AnalyticsDashboard';
import FlashcardManager from '../components/FlashcardManager';
import { 
  LogOut, 
  Sparkles, 
  Clock, 
  Brain, 
  Flame, 
  Target, 
  Bell, 
  BookOpen, 
  TrendingUp,
  Wand2,
  Layers,
  BarChart2
} from 'lucide-react';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('study'); // 'study', 'analytics', 'planner', 'tools', 'flashcards', 'alarms'

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
              Track active study sessions, review Recharts analytics, generate AI study plans, test spaced repetition flashcards, and set smart alarms.
            </p>
          </div>
        </motion.div>

        {/* Tab Navigation Switcher */}
        <div className="flex flex-wrap items-center gap-3 border-b border-white/10 pb-4">
          <button
            onClick={() => setActiveTab('study')}
            className={`px-5 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all ${
              activeTab === 'study'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25'
                : 'glass-panel text-gray-400 hover:text-white border border-white/5'
            }`}
          >
            <BookOpen size={16} />
            <span>Study Session Tracker</span>
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-5 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all ${
              activeTab === 'analytics'
                ? 'bg-teal-600 text-white shadow-lg shadow-teal-500/25'
                : 'glass-panel text-gray-400 hover:text-white border border-white/5'
            }`}
          >
            <BarChart2 size={16} />
            <span>Analytics & Gamification</span>
          </button>

          <button
            onClick={() => setActiveTab('flashcards')}
            className={`px-5 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all ${
              activeTab === 'flashcards'
                ? 'bg-amber-600 text-white shadow-lg shadow-amber-500/25'
                : 'glass-panel text-gray-400 hover:text-white border border-white/5'
            }`}
          >
            <Layers size={16} />
            <span>SM-2 Flashcards</span>
          </button>

          <button
            onClick={() => setActiveTab('planner')}
            className={`px-5 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all ${
              activeTab === 'planner'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/25'
                : 'glass-panel text-gray-400 hover:text-white border border-white/5'
            }`}
          >
            <Brain size={16} />
            <span>Gemini AI Study Planner</span>
          </button>

          <button
            onClick={() => setActiveTab('tools')}
            className={`px-5 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all ${
              activeTab === 'tools'
                ? 'bg-pink-600 text-white shadow-lg shadow-pink-500/25'
                : 'glass-panel text-gray-400 hover:text-white border border-white/5'
            }`}
          >
            <Wand2 size={16} />
            <span>AI Summarizer & Quizzes</span>
          </button>

          <button
            onClick={() => setActiveTab('alarms')}
            className={`px-5 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all ${
              activeTab === 'alarms'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25'
                : 'glass-panel text-gray-400 hover:text-white border border-white/5'
            }`}
          >
            <Bell size={16} />
            <span>Smart Alarms</span>
          </button>
        </div>

        {/* Active Tab View */}
        {activeTab === 'study' && <StudyTracker />}
        {activeTab === 'analytics' && <AnalyticsDashboard />}
        {activeTab === 'flashcards' && <FlashcardManager />}
        {activeTab === 'planner' && <AiStudyPlanner />}
        {activeTab === 'tools' && <AiTools />}
        {activeTab === 'alarms' && <AlarmManager />}
      </main>
    </div>
  );
}
