import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { motion } from 'framer-motion';
import { Layers, Plus, RotateCw, Check, Brain, Calendar } from 'lucide-react';

export default function FlashcardManager() {
  const [flashcards, setFlashcards] = useState([]);
  const [topic, setTopic] = useState('');
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [isFlipped, setIsFlipped] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  const fetchFlashcards = async () => {
    try {
      const res = await api.get('/ai/flashcards/');
      setFlashcards(res.data);
    } catch (err) {
      console.error('Error fetching flashcards:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFlashcards();
  }, []);

  const handleCreateFlashcard = async (e) => {
    e.preventDefault();
    if (!question.trim() || !answer.trim()) return;

    try {
      await api.post('/ai/flashcards/', {
        topic: topic || 'General',
        question: question,
        answer: answer,
      });
      setQuestion('');
      setAnswer('');
      setTopic('');
      fetchFlashcards();
    } catch (err) {
      console.error('Error creating flashcard:', err);
    }
  };

  const handleReviewCard = async (cardId, rating) => {
    try {
      await api.post(`/ai/flashcards/${cardId}/review/`, { rating: rating });
      setIsFlipped({ ...isFlipped, [cardId]: false });
      fetchFlashcards();
    } catch (err) {
      console.error('Error reviewing flashcard:', err);
    }
  };

  const toggleFlip = (cardId) => {
    setIsFlipped({ ...isFlipped, [cardId]: !isFlipped[cardId] });
  };

  return (
    <div className="space-y-6">
      {/* Create Flashcard Form */}
      <form onSubmit={handleCreateFlashcard} className="glass-panel p-6 rounded-3xl border border-indigo-500/20 space-y-4">
        <h3 className="font-bold text-white text-base flex items-center gap-2">
          <Layers className="text-indigo-400" size={18} />
          <span>Create Spaced Repetition Flashcard (SuperMemo SM-2)</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <input
            type="text"
            placeholder="Topic (e.g. Django Signals)"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="bg-gray-900 border border-gray-800 rounded-xl py-2 px-3 text-white text-xs focus:outline-none focus:border-indigo-500"
          />
          <input
            type="text"
            required
            placeholder="Question / Prompt"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            className="bg-gray-900 border border-gray-800 rounded-xl py-2 px-3 text-white text-xs focus:outline-none focus:border-indigo-500"
          />
          <input
            type="text"
            required
            placeholder="Answer / Definition"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            className="bg-gray-900 border border-gray-800 rounded-xl py-2 px-3 text-white text-xs focus:outline-none focus:border-indigo-500"
          />
        </div>

        <button
          type="submit"
          className="w-full py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/25 transition-all"
        >
          <Plus size={16} />
          <span>Add Flashcard</span>
        </button>
      </form>

      {/* Flashcard Stack Grid */}
      <div className="space-y-4">
        <h3 className="font-bold text-white text-base flex items-center gap-2">
          <Brain className="text-purple-400" size={18} />
          <span>Due Flashcards Review Deck</span>
        </h3>

        {flashcards.length === 0 ? (
          <div className="glass-panel p-8 rounded-3xl text-center text-xs text-gray-400">
            No flashcards created yet. Create a card above to start spaced repetition study!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {flashcards.map((card) => {
              const flipped = !!isFlipped[card.id];
              return (
                <div
                  key={card.id}
                  className="glass-panel p-6 rounded-3xl border border-white/10 min-h-[220px] flex flex-col justify-between space-y-4 hover:border-purple-500/30 transition-all"
                >
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <span className="px-2.5 py-1 rounded-full bg-purple-500/10 text-purple-400 font-semibold border border-purple-500/20">
                      {card.topic || 'General'}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar size={12} />
                      <span>Next: {card.next_review_date}</span>
                    </span>
                  </div>

                  <div className="my-auto py-2">
                    {!flipped ? (
                      <div className="space-y-2">
                        <span className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider block">Question</span>
                        <p className="text-sm font-bold text-white">{card.question}</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <span className="text-[10px] text-purple-400 font-semibold uppercase tracking-wider block">Answer</span>
                        <p className="text-sm text-gray-200 leading-relaxed bg-gray-900/60 p-3 rounded-xl border border-white/5">
                          {card.answer}
                        </p>
                      </div>
                    )}
                  </div>

                  {!flipped ? (
                    <button
                      onClick={() => toggleFlip(card.id)}
                      className="w-full py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-semibold flex items-center justify-center gap-2 transition-colors border border-gray-700"
                    >
                      <RotateCw size={14} />
                      <span>Flip to Reveal Answer</span>
                    </button>
                  ) : (
                    <div className="space-y-2">
                      <span className="text-[10px] text-gray-400 block text-center font-medium">Rate Recall Quality (SM-2):</span>
                      <div className="grid grid-cols-6 gap-1">
                        {[0, 1, 2, 3, 4, 5].map((q) => (
                          <button
                            key={q}
                            onClick={() => handleReviewCard(card.id, q)}
                            className={`py-1.5 rounded-lg text-xs font-bold transition-all ${
                              q < 3
                                ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                                : q < 4
                                ? 'bg-orange-500/20 text-orange-400 hover:bg-orange-500/30'
                                : 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30'
                            }`}
                          >
                            {q}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
