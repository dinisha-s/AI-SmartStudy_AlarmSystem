import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import MathPuzzleModal from './MathPuzzleModal';
import { playAlarmSound, stopAlarmSound } from '../utils/audio';
import { Bell, Plus, Trash2, Volume2, CheckCircle2, ShieldAlert, Clock } from 'lucide-react';

export default function AlarmManager() {
  const [alarms, setAlarms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState(Notification.permission);
  const [activeTriggeredAlarm, setActiveTriggeredAlarm] = useState(null);

  const [newAlarm, setNewAlarm] = useState({
    title: 'Morning Study Session',
    time: '06:30',
    require_math_puzzle: true,
    days_of_week: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
  });

  const fetchAlarms = async () => {
    try {
      const res = await api.get('/alarms/');
      setAlarms(res.data);
    } catch (err) {
      console.error('Failed to fetch alarms:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlarms();
  }, []);

  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
    }
  };

  const handleCreateAlarm = async (e) => {
    e.preventDefault();
    try {
      await api.post('/alarms/', newAlarm);
      setShowAddForm(false);
      fetchAlarms();
    } catch (err) {
      console.error('Error creating alarm:', err);
    }
  };

  const handleDeleteAlarm = async (id) => {
    try {
      await api.delete(`/alarms/${id}/`);
      fetchAlarms();
    } catch (err) {
      console.error('Error deleting alarm:', err);
    }
  };

  const handleTestAlarm = (alarm) => {
    setActiveTriggeredAlarm(alarm);
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(`Alarm: ${alarm.title}`, {
        body: 'Time to wake up and start your study session!',
        icon: '/favicon.svg',
      });
    }
  };

  const handleDismissModal = async (dismissMethod, snoozeCount) => {
    if (activeTriggeredAlarm) {
      try {
        const now = new Date();
        const currentTimeStr = now.toTimeString().split(' ')[0];
        const todayStr = now.toISOString().split('T')[0];

        await api.post('/alarms/log-wake/', {
          alarm_set_time: activeTriggeredAlarm.time,
          actual_wake_time: currentTimeStr,
          snooze_count: snoozeCount,
          sleep_duration_prev_night: 7.5,
          dismiss_method: dismissMethod,
          log_date: todayStr,
        });
      } catch (err) {
        console.error('Error logging wake event:', err);
      }
    }
    setActiveTriggeredAlarm(null);
  };

  return (
    <div className="space-y-6">
      {/* Header & Web Notification Permission Banner */}
      <div className="glass-panel p-6 rounded-3xl border border-white/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Bell className="text-indigo-400" size={22} />
            <span>Smart Alarm Manager</span>
          </h2>
          <p className="text-xs text-gray-400">
            Configure intelligent alarms with custom math puzzles and progressive wake tones.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {notificationPermission !== 'granted' && (
            <button
              onClick={requestNotificationPermission}
              className="px-3.5 py-2 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 text-xs font-semibold border border-indigo-500/30 flex items-center gap-1.5 transition-all"
            >
              <ShieldAlert size={16} />
              <span>Enable Web Notifications</span>
            </button>
          )}

          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white text-xs font-semibold shadow-lg shadow-indigo-500/20 flex items-center gap-1.5 transition-all"
          >
            <Plus size={16} />
            <span>New Alarm</span>
          </button>
        </div>
      </div>

      {/* Create Alarm Form Modal / Accordion */}
      {showAddForm && (
        <form onSubmit={handleCreateAlarm} className="glass-panel p-6 rounded-3xl border border-indigo-500/30 space-y-4">
          <h3 className="font-semibold text-sm text-white">Create New Alarm</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs text-gray-400">Alarm Title</label>
              <input
                type="text"
                required
                value={newAlarm.title}
                onChange={(e) => setNewAlarm({ ...newAlarm, title: e.target.value })}
                className="w-full bg-gray-900 border border-gray-800 rounded-xl py-2 px-3 text-white text-xs focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-gray-400">Alarm Time</label>
              <input
                type="time"
                required
                value={newAlarm.time}
                onChange={(e) => setNewAlarm({ ...newAlarm, time: e.target.value })}
                className="w-full bg-gray-900 border border-gray-800 rounded-xl py-2 px-3 text-white text-xs focus:outline-none focus:border-indigo-500 text-center"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="mathPuzzleCheck"
              checked={newAlarm.require_math_puzzle}
              onChange={(e) => setNewAlarm({ ...newAlarm, require_math_puzzle: e.target.checked })}
              className="rounded bg-gray-900 border-gray-700 text-indigo-600 focus:ring-indigo-500"
            />
            <label htmlFor="mathPuzzleCheck" className="text-xs text-gray-300">
              Require Math Puzzle to Dismiss (Prevents sleep-dismiss)
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-4 py-1.5 rounded-xl bg-gray-800 text-gray-400 text-xs font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold"
            >
              Save Alarm
            </button>
          </div>
        </form>
      )}

      {/* Alarms List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {alarms.map((alarm) => (
          <div
            key={alarm.id}
            className="glass-panel p-5 rounded-2xl border border-white/10 flex items-center justify-between hover:border-indigo-500/30 transition-all"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Clock className="text-indigo-400" size={16} />
                <span className="text-2xl font-bold tracking-tight text-white">{alarm.time}</span>
              </div>
              <p className="text-xs font-medium text-gray-300">{alarm.title}</p>
              <div className="flex items-center gap-2 pt-1">
                {alarm.require_math_puzzle && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20 font-medium">
                    Math Puzzle
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleTestAlarm(alarm)}
                title="Test Alarm Sound & Puzzle"
                className="p-2 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 transition-colors"
              >
                <Volume2 size={18} />
              </button>

              <button
                onClick={() => handleDeleteAlarm(alarm.id)}
                title="Delete Alarm"
                className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Math Puzzle Active Ringing Modal */}
      <MathPuzzleModal
        isOpen={Boolean(activeTriggeredAlarm)}
        alarmTitle={activeTriggeredAlarm?.title}
        onDismiss={handleDismissModal}
      />
    </div>
  );
}
