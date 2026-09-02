import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { motion } from 'framer-motion';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend 
} from 'recharts';
import { TrendingUp, Clock, Flame, Award, Zap, Activity } from 'lucide-react';

const COLORS = ['#8b5cf6', '#6366f1', '#ec4899', '#14b8a6', '#f59e0b'];

export default function AnalyticsDashboard() {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAnalytics = async () => {
    try {
      const res = await api.get('/study/analytics/dashboard/');
      setData(res.data);
    } catch (err) {
      console.error('Error fetching dashboard analytics:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (isLoading) {
    return (
      <div className="glass-panel p-12 rounded-3xl text-center text-gray-400 animate-pulse">
        Loading interactive study & sleep analytics graphs...
      </div>
    );
  }

  const trends = data?.daily_trends || [];
  const pieData = data?.subject_pie_chart || [];
  const badges = data?.badges || [];

  return (
    <div className="space-y-6">
      {/* Metric Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-panel p-5 rounded-2xl border border-purple-500/20 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-400 flex items-center justify-center shrink-0">
            <Clock size={24} />
          </div>
          <div>
            <span className="text-xs text-gray-400 font-medium">Total Study Time</span>
            <h3 className="text-2xl font-bold text-white">{data?.total_study_hours || 0} hrs</h3>
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-indigo-500/20 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center shrink-0">
            <Zap size={24} />
          </div>
          <div>
            <span className="text-xs text-gray-400 font-medium">Avg Focus Score</span>
            <h3 className="text-2xl font-bold text-white">{data?.avg_focus_score || 0} / 100</h3>
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-orange-500/20 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-orange-500/10 text-orange-400 flex items-center justify-center shrink-0">
            <Flame size={24} />
          </div>
          <div>
            <span className="text-xs text-gray-400 font-medium">Current Streak</span>
            <h3 className="text-2xl font-bold text-white">{data?.streak || 0} Days</h3>
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-pink-500/20 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-pink-500/10 text-pink-400 flex items-center justify-center shrink-0">
            <Award size={24} />
          </div>
          <div>
            <span className="text-xs text-gray-400 font-medium">Badges Unlocked</span>
            <h3 className="text-2xl font-bold text-white">{badges.length} Badges</h3>
          </div>
        </div>
      </div>

      {/* Recharts Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Focus Score Trend Area Chart */}
        <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <TrendingUp className="text-purple-400" size={18} />
              <span>7-Day Focus Score Trend</span>
            </h3>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trends}>
                <defs>
                  <linearGradient id="focusGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" stroke="#6b7280" tickLine={false} />
                <YAxis domain={[0, 100]} stroke="#6b7280" tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', borderRadius: '12px' }} />
                <Area type="monotone" dataKey="focus_score" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#focusGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Sleep vs Study Hours Bar Chart */}
        <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <Activity className="text-indigo-400" size={18} />
              <span>Sleep Duration vs. Study Hours</span>
            </h3>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trends}>
                <XAxis dataKey="day" stroke="#6b7280" tickLine={false} />
                <YAxis stroke="#6b7280" tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', borderRadius: '12px' }} />
                <Legend />
                <Bar dataKey="study_hours" fill="#6366f1" radius={[6, 6, 0, 0]} name="Study Hours" />
                <Bar dataKey="sleep_hours" fill="#14b8a6" radius={[6, 6, 0, 0]} name="Sleep Hours" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Subject Distribution Pie Chart & Badges Showcase */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Subject Pie Chart */}
        <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-4 lg:col-span-1">
          <h3 className="font-bold text-white text-base">Subject Time Allocation</h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={4} dataKey="value">
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', borderRadius: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gamification Badges Grid */}
        <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-4 lg:col-span-2">
          <h3 className="font-bold text-white text-base flex items-center gap-2">
            <Award className="text-orange-400" size={18} />
            <span>Gamification Badges Showcase</span>
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {badges.length > 0 ? (
              badges.map((b) => (
                <div key={b.id} className="p-4 rounded-2xl bg-gray-900/60 border border-purple-500/20 flex flex-col items-center text-center space-y-1">
                  <span className="text-3xl">{b.icon || '🏅'}</span>
                  <h4 className="font-bold text-xs text-white pt-1">{b.name}</h4>
                  <p className="text-[10px] text-gray-400">{b.description}</p>
                </div>
              ))
            ) : (
              <div className="col-span-3 text-center py-8 text-xs text-gray-400">
                Complete study sessions to earn streak & focus badges!
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
