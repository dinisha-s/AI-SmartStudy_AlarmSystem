import React, { useState } from 'react';
import api from '../api/axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, 
  HelpCircle, 
  MessageSquare, 
  Sparkles, 
  CheckCircle, 
  AlertCircle, 
  Send, 
  RefreshCw,
  Award,
  BookOpen
} from 'lucide-react';

export default function AiTools() {
  const [subTab, setSubTab] = useState('summarizer'); // 'summarizer', 'quiz', or 'chatbot'

  // --- Summarizer State ---
  const [notesText, setNotesText] = useState('');
  const [subject, setSubject] = useState('Django REST Framework & Microservices');
  const [summaryResult, setSummaryResult] = useState(null);
  const [isSummarizing, setIsSummarizing] = useState(false);

  // --- Quiz Generator State ---
  const [quizTopic, setQuizTopic] = useState('Python Architecture & FastAPI');
  const [quizData, setQuizData] = useState(null);
  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [submittedQuiz, setSubmittedQuiz] = useState(false);
  const [quizScore, setQuizScore] = useState(0);

  // --- Chatbot State ---
  const [chatSubject, setChatSubject] = useState('Computer Science & AI');
  const [chatMessage, setChatMessage] = useState('');
  const [chatMessages, setChatMessages] = useState([
    {
      sender: 'bot',
      text: 'Hello! I am your AI academic tutor. Ask me any study doubt or concept explanation!',
    },
  ]);
  const [isSendingChat, setIsSendingChat] = useState(false);

  // --- Summarizer Handler ---
  const handleSummarize = async (e) => {
    e.preventDefault();
    if (!notesText.trim()) return;

    setIsSummarizing(true);
    try {
      const res = await api.post('/ai/summarize-notes/', {
        notes_text: notesText,
        subject: subject,
      });
      setSummaryResult(res.data);
    } catch (err) {
      console.error('Error summarizing notes:', err);
    } finally {
      setIsSummarizing(false);
    }
  };

  // --- Quiz Handler ---
  const handleGenerateQuiz = async (e) => {
    e.preventDefault();
    setIsGeneratingQuiz(true);
    setSubmittedQuiz(false);
    setSelectedAnswers({});
    try {
      const res = await api.post('/ai/generate-quiz/', {
        topic: quizTopic,
        num_questions: 3,
      });
      setQuizData(res.data);
    } catch (err) {
      console.error('Error generating quiz:', err);
    } finally {
      setIsGeneratingQuiz(false);
    }
  };

  const handleSelectOption = (questionId, option) => {
    if (submittedQuiz) return;
    setSelectedAnswers({ ...selectedAnswers, [questionId]: option });
  };

  const handleSubmitQuiz = () => {
    if (!quizData) return;
    let score = 0;
    quizData.questions.forEach((q) => {
      if (selectedAnswers[q.id] === q.correct_answer) {
        score += 1;
      }
    });
    setQuizScore(score);
    setSubmittedQuiz(true);
  };

  // --- Chatbot Handler ---
  const handleSendChat = async (e) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;

    const userMsg = chatMessage;
    setChatMessage('');
    setChatMessages((prev) => [...prev, { sender: 'user', text: userMsg }]);
    setIsSendingChat(true);

    try {
      const res = await api.post('/ai/chatbot/', {
        user_message: userMsg,
        subject_context: chatSubject,
      });
      setChatMessages((prev) => [...prev, { sender: 'bot', text: res.data.reply }]);
    } catch (err) {
      console.error('Error in chatbot:', err);
      setChatMessages((prev) => [
        ...prev,
        { sender: 'bot', text: 'Apologies, I encountered an issue answering your doubt. Please try again.' },
      ]);
    } finally {
      setIsSendingChat(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Sub Navigation Switcher */}
      <div className="glass-panel p-2 rounded-2xl border border-white/10 flex items-center gap-2">
        <button
          onClick={() => setSubTab('summarizer')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
            subTab === 'summarizer'
              ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/25'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <FileText size={16} />
          <span>Notes Summarizer</span>
        </button>

        <button
          onClick={() => setSubTab('quiz')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
            subTab === 'quiz'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <HelpCircle size={16} />
          <span>MCQ Quiz Generator</span>
        </button>

        <button
          onClick={() => setSubTab('chatbot')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
            subTab === 'chatbot'
              ? 'bg-pink-600 text-white shadow-lg shadow-pink-500/25'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <MessageSquare size={16} />
          <span>Doubt-Solving Chatbot</span>
        </button>
      </div>

      {/* --- TAB 1: NOTES SUMMARIZER --- */}
      {subTab === 'summarizer' && (
        <div className="space-y-6">
          <form onSubmit={handleSummarize} className="glass-panel p-6 rounded-3xl border border-purple-500/20 space-y-4">
            <div className="space-y-1">
              <label className="text-xs text-gray-400 font-medium">Subject / Module Title</label>
              <input
                type="text"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full bg-gray-900 border border-gray-800 rounded-xl py-2 px-3 text-white text-xs focus:outline-none focus:border-purple-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-gray-400 font-medium">Paste Study Notes / Textbook Content</label>
              <textarea
                rows={5}
                required
                value={notesText}
                onChange={(e) => setNotesText(e.target.value)}
                placeholder="Paste lecture notes or textbook passages here..."
                className="w-full bg-gray-900 border border-gray-800 rounded-xl py-3 px-3 text-white text-xs focus:outline-none focus:border-purple-500"
              />
            </div>

            <button
              type="submit"
              disabled={isSummarizing || !notesText.trim()}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white font-bold flex items-center justify-center gap-2 shadow-lg shadow-purple-500/25 transition-all disabled:opacity-50"
            >
              {isSummarizing ? (
                <span>Summarizing Notes via Gemini...</span>
              ) : (
                <>
                  <Sparkles size={18} />
                  <span>Generate Summary & Key Concepts</span>
                </>
              )}
            </button>
          </form>

          {summaryResult && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-panel p-6 rounded-3xl border border-purple-500/30 space-y-6"
            >
              <div className="space-y-2">
                <span className="text-xs text-purple-400 font-semibold uppercase tracking-wider">Executive Summary</span>
                <h3 className="text-lg font-bold text-white">{summaryResult.subject}</h3>
                <p className="text-xs text-gray-300 leading-relaxed bg-gray-900/60 p-4 rounded-2xl border border-white/5">
                  {summaryResult.summary}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Key Takeaways</h4>
                  <ul className="space-y-1.5">
                    {summaryResult.key_points?.map((pt, idx) => (
                      <li key={idx} className="text-xs text-gray-300 flex items-start gap-2 bg-gray-900/40 p-2.5 rounded-xl">
                        <CheckCircle size={14} className="text-indigo-400 shrink-0 mt-0.5" />
                        <span>{pt}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-purple-400 uppercase tracking-wider">Important Concepts</h4>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {summaryResult.important_concepts?.map((c, idx) => (
                      <span key={idx} className="px-3 py-1.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-medium">
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      )}

      {/* --- TAB 2: MCQ QUIZ GENERATOR --- */}
      {subTab === 'quiz' && (
        <div className="space-y-6">
          <form onSubmit={handleGenerateQuiz} className="glass-panel p-6 rounded-3xl border border-indigo-500/20 space-y-4">
            <div className="space-y-1">
              <label className="text-xs text-gray-400 font-medium">Quiz Subject / Topic</label>
              <input
                type="text"
                required
                value={quizTopic}
                onChange={(e) => setQuizTopic(e.target.value)}
                className="w-full bg-gray-900 border border-gray-800 rounded-xl py-2 px-3 text-white text-xs focus:outline-none focus:border-indigo-500"
              />
            </div>

            <button
              type="submit"
              disabled={isGeneratingQuiz}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/25 transition-all disabled:opacity-50"
            >
              {isGeneratingQuiz ? (
                <span>Generating Quiz via Gemini...</span>
              ) : (
                <>
                  <HelpCircle size={18} />
                  <span>Generate Interactive MCQ Quiz</span>
                </>
              )}
            </button>
          </form>

          {quizData && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-panel p-6 rounded-3xl border border-white/10 space-y-6"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <h3 className="text-lg font-bold text-white">{quizData.topic} Quiz</h3>
                  <p className="text-xs text-gray-400">{quizData.questions?.length || 0} Questions</p>
                </div>

                {submittedQuiz && (
                  <div className="px-4 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-400 text-xs font-bold border border-emerald-500/30 flex items-center gap-1.5">
                    <Award size={16} />
                    <span>Score: {quizScore} / {quizData.questions.length}</span>
                  </div>
                )}
              </div>

              <div className="space-y-6">
                {quizData.questions?.map((q, qIdx) => (
                  <div key={q.id} className="glass-panel p-5 rounded-2xl border border-white/5 space-y-3">
                    <h4 className="font-semibold text-white text-sm">
                      Q{qIdx + 1}: {q.question}
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {q.options?.map((opt, optIdx) => {
                        const isSelected = selectedAnswers[q.id] === opt;
                        const isCorrect = q.correct_answer === opt;
                        let optionStyle = 'bg-gray-900/60 border-gray-800 text-gray-300 hover:border-indigo-500/40';

                        if (isSelected) {
                          optionStyle = 'bg-indigo-500/20 border-indigo-500 text-indigo-300';
                        }
                        if (submittedQuiz) {
                          if (isCorrect) {
                            optionStyle = 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-semibold';
                          } else if (isSelected && !isCorrect) {
                            optionStyle = 'bg-red-500/20 border-red-500 text-red-300';
                          }
                        }

                        return (
                          <button
                            key={optIdx}
                            type="button"
                            onClick={() => handleSelectOption(q.id, opt)}
                            className={`p-3 rounded-xl border text-xs text-left transition-all ${optionStyle}`}
                          >
                            {opt}
                          </button>
                        );
                      })}
                    </div>

                    {submittedQuiz && (
                      <div className="p-3 rounded-xl bg-gray-900/80 border border-gray-800 text-xs text-purple-300 space-y-1">
                        <strong className="text-white block font-semibold">Explanation:</strong>
                        <p>{q.explanation}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {!submittedQuiz && (
                <button
                  type="button"
                  onClick={handleSubmitQuiz}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 transition-all"
                >
                  <CheckCircle size={18} />
                  <span>Submit Quiz Answers</span>
                </button>
              )}
            </motion.div>
          )}
        </div>
      )}

      {/* --- TAB 3: DOUBT CHATBOT --- */}
      {subTab === 'chatbot' && (
        <div className="glass-panel p-6 rounded-3xl border border-pink-500/20 space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <MessageSquare className="text-pink-400" size={18} />
              <span>Subject-Aware Academic Doubt Solver</span>
            </h3>

            <input
              type="text"
              value={chatSubject}
              onChange={(e) => setChatSubject(e.target.value)}
              placeholder="Subject context..."
              className="bg-gray-900 border border-gray-800 rounded-xl py-1 px-3 text-xs text-white focus:outline-none"
            />
          </div>

          {/* Chat Messages Display Box */}
          <div className="h-80 overflow-y-auto space-y-3 p-3 bg-gray-900/60 rounded-2xl border border-white/5">
            {chatMessages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-md p-3.5 rounded-2xl text-xs whitespace-pre-wrap leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-br-none'
                      : 'bg-gray-800/90 text-gray-200 border border-gray-700/50 rounded-bl-none'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {isSendingChat && (
              <div className="flex justify-start">
                <div className="p-3 rounded-2xl bg-gray-800 text-gray-400 text-xs animate-pulse">
                  Gemini AI is thinking...
                </div>
              </div>
            )}
          </div>

          {/* Chat Input Form */}
          <form onSubmit={handleSendChat} className="flex gap-2">
            <input
              type="text"
              required
              value={chatMessage}
              onChange={(e) => setChatMessage(e.target.value)}
              placeholder="Ask your doubt (e.g. How does simplejwt handle token rotation?)..."
              className="flex-1 bg-gray-900 border border-gray-800 rounded-xl py-2.5 px-4 text-white text-xs focus:outline-none focus:border-pink-500"
            />
            <button
              type="submit"
              disabled={isSendingChat || !chatMessage.trim()}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-bold flex items-center justify-center gap-1.5 shadow-lg shadow-pink-500/25 transition-all disabled:opacity-50"
            >
              <Send size={16} />
              <span>Send</span>
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
