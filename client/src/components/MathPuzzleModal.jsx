import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { playAlarmSound, stopAlarmSound } from '../utils/audio';
import { BellRing, CheckCircle, AlertTriangle, RefreshCw } from 'lucide-react';

export default function MathPuzzleModal({ isOpen, alarmTitle, onDismiss }) {
  const [num1, setNum1] = useState(0);
  const [num2, setNum2] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [snoozeCount, setSnoozeCount] = useState(0);

  const generatePuzzle = () => {
    const a = Math.floor(Math.random() * 40) + 10;
    const b = Math.floor(Math.random() * 40) + 10;
    setNum1(a);
    setNum2(b);
    setUserAnswer('');
    setErrorMsg('');
  };

  useEffect(() => {
    if (isOpen) {
      generatePuzzle();
      playAlarmSound();
    } else {
      stopAlarmSound();
    }

    return () => stopAlarmSound();
  }, [isOpen]);

  const handleSolve = (e) => {
    e.preventDefault();
    const correctAnswer = num1 + num2;
    if (parseInt(userAnswer, 10) === correctAnswer) {
      stopAlarmSound();
      onDismiss('math_puzzle', snoozeCount);
    } else {
      setErrorMsg('Incorrect answer! Keep trying to dismiss alarm.');
    }
  };

  const handleSnooze = () => {
    stopAlarmSound();
    setSnoozeCount((prev) => prev + 1);
    onDismiss('snoozed', snoozeCount + 1);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="max-w-md w-full glass-panel p-8 rounded-3xl space-y-6 border border-red-500/30 shadow-2xl relative overflow-hidden"
        >
          {/* Animated Pulsing Icon */}
          <div className="flex flex-col items-center justify-center text-center space-y-3">
            <motion.div
              animate={{ scale: [1, 1.15, 1] }}
              transition={{ repeat: Infinity, duration: 1 }}
              className="w-16 h-16 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center border border-red-500/40"
            >
              <BellRing size={32} />
            </motion.div>
            <h2 className="text-2xl font-bold text-white tracking-tight">{alarmTitle || 'Wake Up & Study!'}</h2>
            <p className="text-xs text-red-400 font-medium flex items-center gap-1">
              <AlertTriangle size={14} />
              <span>Solve the math puzzle to turn off alarm</span>
            </p>
          </div>

          {errorMsg && (
            <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs text-center">
              {errorMsg}
            </div>
          )}

          {/* Puzzle Input Form */}
          <form onSubmit={handleSolve} className="space-y-4">
            <div className="glass-panel p-4 rounded-2xl text-center space-y-1 bg-gray-900/80">
              <span className="text-xs text-gray-400 font-medium">Calculate Sum</span>
              <div className="text-3xl font-extrabold text-indigo-400 tracking-wider">
                {num1} + {num2} = ?
              </div>
            </div>

            <input
              type="number"
              required
              autoFocus
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              placeholder="Enter answer..."
              className="w-full bg-gray-900 border border-gray-700 rounded-xl py-3 px-4 text-center text-xl font-bold text-white focus:outline-none focus:border-indigo-500"
            />

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 hover:from-emerald-600 hover:to-teal-700 transition-all"
            >
              <CheckCircle size={20} />
              <span>Dismiss Alarm</span>
            </button>
          </form>

          <button
            onClick={handleSnooze}
            className="w-full py-2.5 rounded-xl bg-gray-800/80 hover:bg-gray-800 text-gray-400 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors border border-gray-700/50"
          >
            <RefreshCw size={14} />
            <span>Snooze (+5 mins)</span>
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
