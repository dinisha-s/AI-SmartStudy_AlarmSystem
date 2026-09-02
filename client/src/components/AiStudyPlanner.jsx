import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { motion } from 'framer-motion';
import { Sparkles, Calendar, Clock, Plus, X, BookOpen, CheckCircle, Brain, CalendarDays } from 'lucide-react';

export default function AiStudyPlanner() {
  const [examDate, setExamDate] = useState('2026-10-15');
  const [dailyHours, setDailyHours] = useState(4);
  const [topicInput, setTopicInput] = useState('');
  const [topics, setTopics] = useState(['Python Architecture', 'Django REST Framework', 'FastAPI ML', 'React Vite']);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activePlan, setActivePlan] = useState(null);
  const [pastPlans, setPastPlans] = useState([]);

  const fetchPlans = async () => {
    try {
      const res = await api.get('/ai/plans/');
      setPastPlans(res.data);
      if (res.data.length > 0 && !activePlan) {
        setActivePlan(res.data[0]);
      }
    } catch (err) {
      console.error('Error fetching study plans:', err);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const handleAddTopic = (e) => {
    e.preventDefault();
    if (topicInput.trim() && !topics.includes(topicInput.trim())) {
      setTopics([...topics, topicInput.trim()]);
      setTopicInput('');
    }
  };

  const handleRemoveTopic = (topicToRemove) => {
    setTopics(topics.filter((t) => t !== topicToRemove));
  };

  const handleGeneratePlan = async (e) => {
    e.preventDefault();
    if (topics.length === 0) return;

    setIsGenerating(true);
    try {
      const res = await api.post('/ai/generate-plan/', {
        exam_date: examDate,
        syllabus_topics: topics,
        daily_hours: parseInt(dailyHours, 10),
      });

      setActivePlan(res.data);
      fetchPlans();
    } catch (err) {
      console.error('Error generating study plan:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const planData = activePlan?.generated_plan || null;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="glass-panel p-6 rounded-3xl border border-white/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Brain className="text-purple-400" size={22} />
            <span>Gemini AI Study Plan Generator</span>
          </h2>
          <p className="text-xs text-gray-400">
            Powered by Google Gemini 2.5 API with strict JSON schema validation.
          </p>
        </div>

        {pastPlans.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400">History:</span>
            <select
              onChange={(e) => {
                const found = pastPlans.find((p) => p.id === parseInt(e.target.value, 10));
                if (found) setActivePlan(found);
              }}
              className="bg-gray-900 border border-gray-800 rounded-xl py-1.5 px-3 text-xs text-white focus:outline-none"
            >
              {pastPlans.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.exam_date} ({p.syllabus_topics.length} topics)
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Generator Form */}
      <form onSubmit={handleGeneratePlan} className="glass-panel p-6 rounded-3xl border border-purple-500/20 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs text-gray-400 font-medium">Target Exam Date</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
              <input
                type="date"
                required
                value={examDate}
                onChange={(e) => setExamDate(e.target.value)}
                className="w-full bg-gray-900 border border-gray-800 rounded-xl py-2.5 pl-10 pr-3 text-white text-xs focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs text-gray-400 font-medium">Daily Available Hours</label>
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
              <input
                type="number"
                min="1"
                max="16"
                required
                value={dailyHours}
                onChange={(e) => setDailyHours(e.target.value)}
                className="w-full bg-gray-900 border border-gray-800 rounded-xl py-2.5 pl-10 pr-3 text-white text-xs focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>
        </div>

        {/* Topics Tag Input */}
        <div className="space-y-2">
          <label className="text-xs text-gray-400 font-medium">Syllabus Topics</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={topicInput}
              onChange={(e) => setTopicInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddTopic(e)}
              placeholder="Add topic (e.g. Signals & Systems) and press Enter..."
              className="flex-1 bg-gray-900 border border-gray-800 rounded-xl py-2 px-3 text-white text-xs focus:outline-none focus:border-purple-500"
            />
            <button
              type="button"
              onClick={handleAddTopic}
              className="px-4 py-2 rounded-xl bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 text-xs font-semibold"
            >
              Add
            </button>
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            {topics.map((t) => (
              <span
                key={t}
                className="px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs flex items-center gap-1.5"
              >
                <span>{t}</span>
                <button type="button" onClick={() => handleRemoveTopic(t)}>
                  <X size={12} className="hover:text-red-400" />
                </button>
              </span>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={isGenerating || topics.length === 0}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white font-bold flex items-center justify-center gap-2 shadow-lg shadow-purple-500/25 transition-all disabled:opacity-50 mt-2"
        >
          {isGenerating ? (
            <span>Generating Day-Wise Plan via Gemini...</span>
          ) : (
            <>
              <Sparkles size={18} />
              <span>Generate AI Study Plan</span>
            </>
          )}
        </button>
      </form>

      {/* Generated Day-Wise Schedule Timeline */}
      {planData && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel p-8 rounded-3xl border border-white/10 space-y-6"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-white/10 pb-4">
            <div>
              <h3 className="text-xl font-bold text-white">{planData.plan_title}</h3>
              <p className="text-xs text-gray-400">
                Strategy: {planData.general_strategy}
              </p>
            </div>
            <div className="px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-semibold border border-indigo-500/20">
              {planData.schedule?.length || 0} Day Roadmap
            </div>
          </div>

          <div className="space-y-4">
            {planData.schedule?.map((item) => (
              <motion.div
                key={item.day}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: item.day * 0.05 }}
                className="glass-panel p-5 rounded-2xl border border-white/5 hover:border-purple-500/30 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 font-bold flex items-center justify-center shrink-0">
                    Day {item.day}
                  </div>

                  <div className="space-y-1">
                    <h4 className="font-bold text-white text-base">{item.focus_topic}</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {item.subtopics?.map((sub, idx) => (
                        <span key={idx} className="text-[10px] px-2 py-0.5 rounded-md bg-gray-800 text-gray-300">
                          {sub}
                        </span>
                      ))}
                    </div>
                    <p className="text-xs text-purple-300 pt-1 flex items-center gap-1">
                      <CheckCircle size={12} />
                      <span>{item.action_item}</span>
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-xs font-semibold text-gray-400">{item.allocated_hours} hrs allocated</span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
