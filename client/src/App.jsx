import React from 'react';
import { Sparkles, Brain, Clock, BarChart3 } from 'lucide-react';

export default function App() {
  return (
    <div className="min-h-screen bg-[#0b0f19] text-white flex flex-col items-center justify-center p-6">
      <div className="max-w-3xl w-full text-center space-y-8">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-panel text-indigo-400 text-sm font-medium">
          <Sparkles size={16} />
          <span>AI-Powered Smart Productivity Platform</span>
        </div>

        <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
          Smart Study & <span className="gradient-text">Alarm Management</span>
        </h1>

        <p className="text-gray-400 text-lg max-w-xl mx-auto">
          An intelligent study platform that learns from your sleep patterns, study habits, and focus scores to optimize alarms and study schedules.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
          <div className="glass-panel p-6 rounded-2xl text-left space-y-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
              <Clock size={20} />
            </div>
            <h3 className="font-semibold text-lg">Smart Alarms</h3>
            <p className="text-sm text-gray-400">ML snooze-risk prediction & progressive wake-up triggers.</p>
          </div>

          <div className="glass-panel p-6 rounded-2xl text-left space-y-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400">
              <Brain size={20} />
            </div>
            <h3 className="font-semibold text-lg">Gemini AI Assistant</h3>
            <p className="text-sm text-gray-400">Automated study plans, note summaries, and interactive quizzes.</p>
          </div>

          <div className="glass-panel p-6 rounded-2xl text-left space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <BarChart3 size={20} />
            </div>
            <h3 className="font-semibold text-lg">Focus Analytics</h3>
            <p className="text-sm text-gray-400">Real-time focus scores and sleep vs study performance correlation.</p>
          </div>
        </div>

        <div className="pt-6 text-sm text-gray-500">
          Phase 1 Setup Active • React + Vite + Tailwind CSS Ready
        </div>
      </div>
    </div>
  );
}
