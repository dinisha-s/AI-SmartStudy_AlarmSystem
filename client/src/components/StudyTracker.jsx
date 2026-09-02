import React, { useState, useEffect, useRef } from 'react';
import api from '../api/axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, 
  Square, 
  Pause, 
  Coffee, 
  EyeOff, 
  Sparkles, 
  Clock, 
  Star, 
  BookOpen, 
  Award, 
  TrendingUp 
} from 'lucide-react';

export default function StudyTracker() {
  const [subject, setSubject] = useState('Python Full Stack Architecture');
  const [activeSessionId, setActiveSessionId] = useState(null);
  const [isStudying, setIsStudying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  // Timer & Session Stats
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [breaksTaken, setBreaksTaken] = useState(0);
  const [tabSwitches, setTabSwitches] = useState(0);

  // End Session Modal & Result
  const [showEndModal, setShowEndModal] = useState(false);
  const [selfRating, setSelfRating] = useState(4);
  const [completedSessionResult, setCompletedSessionResult] = useState(null);
  const [analytics, setAnalytics] = useState(null);

  const timerRef = useRef(null);

  const fetchAnalytics = async () => {
    try {
      const res = await api.get('/study/analytics/');
      setAnalytics(res.data);
    } catch (err) {
      console.error('Failed to fetch study analytics:', err);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  // Browser Page Visibility API listener (Tracks tab switching)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && isStudying && !isPaused) {
        setTabSwitches((prev) => prev + 1);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isStudying, isPaused]);

  // Live Timer Interval Loop
  useEffect(() => {
    if (isStudying && !isPaused) {
      timerRef.current = setInterval(() => {
        setSecondsElapsed((prev) => prev + 1);
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }

    return () => clearInterval(timerRef.current);
  }, [isStudying, isPaused]);

  const handleStartSession = async (e) => {
    e.preventDefault();
    if (!subject.trim()) return;

    try {
      const res = await api.post('/study/session/start/', { subject });
      setActiveSessionId(res.data.session_id);
      setIsStudying(true);
      setIsPaused(false);
      setSecondsElapsed(0);
      setBreaksTaken(0);
      setTabSwitches(0);
      setCompletedSessionResult(null);
    } catch (err) {
      console.error('Error starting session:', err);
    }
  };

  const handleTogglePause = () => {
    if (!isPaused) {
      setBreaksTaken((prev) => prev + 1);
    }
    setIsPaused(!isPaused);
  };

  const handleOpenEndModal = () => {
    setIsPaused(true);
    setShowEndModal(true);
  };

  const handleConfirmEndSession = async () => {
    const durationMins = Math.max(1, Math.round(secondsElapsed / 60));

    try {
      const res = await api.post('/study/session/end/', {
        session_id: activeSessionId,
        duration_minutes: durationMins,
        focus_score_self_rated: selfRating,
        breaks_taken: breaksTaken,
        tab_switches: tabSwitches,
      });

      setIsStudying(false);
      setIsPaused(false);
      setShowEndModal(false);
      setCompletedSessionResult(res.data.session);
      fetchAnalytics();
    } catch (err) {
      console.error('Error ending session:', err);
    }
  };

  const formatTime = (secs) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return `${h > 0 ? `${h}:` : ''}${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="glass-panel p-6 rounded-3xl border border-white/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <BookOpen className="text-indigo-400" size={22} />
            <span>Study Session Tracker & Focus Engine</span>
          </h2>
          <p className="text-xs text-gray-400">
            Real-time timer with Page Visibility tab-switch tracking and automated focus score calculation.
          </p>
        </div>

        {analytics && (
          <div className="flex items-center gap-4 text-xs">
            <div className="px-3 py-1.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-semibold">
              {analytics.total_study_hours} Total Hours
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 font-semibold flex items-center gap-1">
              <TrendingUp size={14} />
              <span>{analytics.avg_focus_score}% Avg Focus</span>
            </div>
          </div>
        )}
      </div>

      {/* Main Active Timer Container */}
      <div className="glass-panel p-8 rounded-3xl border border-indigo-500/20 text-center space-y-6 shadow-2xl relative overflow-hidden">
        {!isStudying ? (
          /* Pre-Session Setup Form */
          <form onSubmit={handleStartSession} className="max-w-md mx-auto space-y-4">
            <div className="space-y-1 text-left">
              <label className="text-xs text-gray-400 font-medium">Select Subject / Topic</label>
              <input
                type="text"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Signals & Systems, Django REST Framework"
                className="w-full bg-gray-900 border border-gray-800 rounded-xl py-3 px-4 text-white text-sm focus:outline-none focus:border-indigo-500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/25 transition-all"
            >
              <Play size={20} />
              <span>Start Study Session</span>
            </button>
          </form>
        ) : (
          /* Active Live Timer Screen */
          <div className="space-y-6">
            <div className="space-y-1">
              <span className="text-xs uppercase tracking-widest text-indigo-400 font-semibold">
                Active Session • {subject}
              </span>
              <div className="text-6xl md:text-7xl font-extrabold tracking-tight text-white font-mono">
                {formatTime(secondsElapsed)}
              </div>
            </div>

            {/* Live Interaction Counters */}
            <div className="flex justify-center items-center gap-6 pt-2">
              <div className="glass-panel px-4 py-2 rounded-xl border border-white/10 flex items-center gap-2 text-xs">
                <Coffee className="text-purple-400" size={16} />
                <span className="text-gray-300">Breaks: <strong className="text-white">{breaksTaken}</strong></span>
              </div>

              <div className="glass-panel px-4 py-2 rounded-xl border border-amber-500/20 text-amber-400 flex items-center gap-2 text-xs">
                <EyeOff size={16} />
                <span>Tab Switches: <strong className="text-white">{tabSwitches}</strong></span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-center items-center gap-4 pt-4">
              <button
                onClick={handleTogglePause}
                className={`px-5 py-2.5 rounded-xl font-medium text-xs flex items-center gap-2 transition-all ${
                  isPaused
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    : 'bg-gray-800 hover:bg-gray-700 text-gray-300 border border-gray-700'
                }`}
              >
                {isPaused ? <Play size={16} /> : <Pause size={16} />}
                <span>{isPaused ? 'Resume Session' : 'Take Break'}</span>
              </button>

              <button
                onClick={handleOpenEndModal}
                className="px-5 py-2.5 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-400 font-medium text-xs border border-red-500/30 flex items-center gap-2 transition-all"
              >
                <Square size={16} />
                <span>Complete Session</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Completed Session Result Summary */}
      {completedSessionResult && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel p-6 rounded-3xl border border-emerald-500/30 space-y-4 bg-emerald-500/5"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                <Award size={22} />
              </div>
              <div>
                <h3 className="font-bold text-white">Session Completed!</h3>
                <p className="text-xs text-gray-400">{completedSessionResult.subject} ({completedSessionResult.duration_minutes} mins)</p>
              </div>
            </div>

            <div className="text-right">
              <div className="text-2xl font-black text-emerald-400">
                {completedSessionResult.focus_score_computed}%
              </div>
              <span className="text-[10px] text-gray-400">Rule-Based Focus Score</span>
            </div>
          </div>
        </motion.div>
      )}

      {/* End Session Focus Rating Modal */}
      <AnimatePresence>
        {showEndModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="max-w-md w-full glass-panel p-8 rounded-3xl space-y-6 border border-white/10 shadow-2xl"
            >
              <div className="text-center space-y-2">
                <div className="w-12 h-12 mx-auto rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                  <Sparkles size={24} />
                </div>
                <h3 className="text-xl font-bold text-white">Rate Your Focus</h3>
                <p className="text-xs text-gray-400">How focused were you during this study session?</p>
              </div>

              {/* Star Rating Input */}
              <div className="flex justify-center gap-2 py-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setSelfRating(star)}
                    className="p-2 transition-transform hover:scale-125 focus:outline-none"
                  >
                    <Star
                      size={28}
                      className={star <= selfRating ? 'text-amber-400 fill-amber-400' : 'text-gray-600'}
                    />
                  </button>
                ))}
              </div>

              <div className="glass-panel p-3 rounded-xl text-xs space-y-1 text-gray-400">
                <div className="flex justify-between">
                  <span>Duration:</span>
                  <strong className="text-white">{Math.max(1, Math.round(secondsElapsed / 60))} mins</strong>
                </div>
                <div className="flex justify-between">
                  <span>Breaks Taken:</span>
                  <strong className="text-white">{breaksTaken}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Tab Switches Detected:</span>
                  <strong className="text-amber-400">{tabSwitches}</strong>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEndModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-gray-800 text-gray-300 text-xs font-medium"
                >
                  Resume
                </button>
                <button
                  type="button"
                  onClick={handleConfirmEndSession}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-xs font-bold shadow-lg shadow-indigo-500/25"
                >
                  Calculate Score
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
