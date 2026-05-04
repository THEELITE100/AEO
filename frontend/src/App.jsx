import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Moon, Sun, Globe, Trophy, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export default function App() {
  const [query, setQuery] = useState('');
  const [brand, setBrand] = useState('');
  const [submittedBrand, setSubmittedBrand] = useState('');   
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [darkMode, setDarkMode] = useState(true);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  const runDiagnostic = async (e) => {
    e.preventDefault();
    if (!query || !brand) return;
    
    setLoading(true); 
    setResult(null);
    setSubmittedBrand(brand); 

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      const response = await fetch(`${apiUrl}/api/diagnose`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, brand }),
      });
      const data = await response.json();
      setResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-x-hidden font-sans pb-20 flex flex-col items-center">
      {/* Animated Background */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden w-full">
        <motion.div animate={{ backgroundPosition: ['0px 0px', '40px 40px'] }} transition={{ repeat: Infinity, duration: 3, ease: 'linear' }}
          className="absolute inset-0 opacity-[0.10] dark:opacity-[0.15]"
          style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h40v40H0V0zm20 20h20v20H20V20zM0 20h20v20H0V20z' fill='none' stroke='%233b82f6' stroke-width='1'/%3E%3C/svg%3E")`, backgroundSize: '40px 40px' }} />
        <motion.div animate={{ opacity: [0.2, 0.5, 0.2], scale: [1, 1.05, 1] }} transition={{ repeat: Infinity, duration: 8 }}
          className="absolute top-[10%] left-[20%] w-[500px] h-[500px] bg-blue-500/30 dark:bg-blue-500/60 rounded-full blur-[120px] dark:blur-[100px]" />
        <motion.div animate={{ opacity: [0.1, 0.4, 0.1], scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 10 }}
          className="absolute bottom-[10%] right-[15%] w-[600px] h-[600px] bg-emerald-500/20 dark:bg-emerald-500/50 rounded-full blur-[140px] dark:blur-[100px]" />
      </div>

      {/* Main Content Container */}
      <div className="relative z-10 w-full max-w-6xl px-4 py-8 md:py-12 flex flex-col items-center">
        
        {/* Header & Theme Toggle */}
        <div className="flex flex-col items-center text-center mb-12 relative w-full max-w-4xl">
          <div className="absolute right-0 top-0">
            <button onClick={() => setDarkMode(!darkMode)} className="p-3 rounded-full bg-white dark:bg-slate-800/80 shadow-lg border border-slate-200 dark:border-slate-700 hover:scale-110 transition-transform">
              {darkMode ? <Sun className="text-yellow-400" /> : <Moon className="text-blue-600" />}
            </button>
          </div>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight py-2 bg-gradient-to-r from-blue-600 to-emerald-500 dark:from-blue-400 dark:to-emerald-400 bg-clip-text text-transparent">
            Multi Engine AEO
          </h1>
          <p className="text-slate-600 dark:text-slate-400 font-medium mt-3">
            Compare brand visibility across multiple models.
          </p>
        </div>

        {/* Input Form */}
        <form onSubmit={runDiagnostic} className="w-full max-w-4xl bg-white/80 dark:bg-slate-800/60 backdrop-blur-xl border border-slate-200 dark:border-slate-700 p-8 rounded-3xl shadow-xl mb-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="text-left">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Customer Query</label>
              <input type="text" placeholder="e.g., Best smartphones" value={query} onChange={(e) => setQuery(e.target.value)} required
                className="mt-2 w-full bg-slate-100/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl px-5 py-4 outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="text-left">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Target Brand</label>
              <input type="text" placeholder="e.g., Samsung" value={brand} onChange={(e) => setBrand(e.target.value)} required
                className="mt-2 w-full bg-slate-100/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl px-5 py-4 outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
          <button disabled={loading} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-blue-500/30">
            {loading ? <Loader2 className="animate-spin" /> : <Globe />}
            {loading ? "Aggregating Global AI Data..." : "Run Multi Engine Audit"}
          </button>
        </form>

        {/* Results */}
        <AnimatePresence>
          {result && !loading && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full space-y-8">
              
              {/* Competitor Report Card */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
                <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur rounded-3xl p-6 border border-slate-200 dark:border-slate-700 flex flex-col justify-center items-center text-center shadow-lg">
                  {result.image_url ? (
                    <img src={result.image_url} alt="Product" className="w-full h-40 object-cover rounded-xl mb-4 shadow-md" />
                  ) : (
                    <div className="w-full h-40 bg-slate-200 dark:bg-slate-700 rounded-xl mb-4 flex items-center justify-center text-slate-400">No Image</div>
                  )}
                  <h3 className="font-bold text-lg uppercase tracking-wide">{submittedBrand}</h3>
                </div>

                {/* Scorecard */}
                <div className={`col-span-1 md:col-span-2 rounded-3xl p-8 border-2 flex flex-col justify-center shadow-lg ${result.report_card.win_rate > 50 ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-500/30' : 'bg-orange-50 dark:bg-orange-500/10 border-orange-500/30'}`}>
                  <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 mb-4 text-center sm:text-left">
                    {result.report_card.win_rate > 50 ? <Trophy size={48} className="text-emerald-500 shrink-0" /> : <AlertTriangle size={48} className="text-orange-500 shrink-0" />}
                    <div>
                      <h2 className="text-3xl font-black uppercase">Visibility: {result.report_card.win_rate}%</h2>
                      <p className="font-medium opacity-80 mt-1">Mentioned in {result.report_card.score} out of {result.report_card.total_successful} successful AI Engines.</p>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-current/10">
                    <span className="text-sm font-bold uppercase tracking-widest opacity-70 block mb-3 text-center sm:text-left">Competitors Detected:</span>
                    <div className="flex flex-wrap justify-center sm:justify-start gap-2">
                      {result.report_card.aggregated_competitors.length > 0 
                        ? result.report_card.aggregated_competitors.map((comp, i) => (
                            <span key={i} className="px-3 py-1 bg-white/60 dark:bg-black/30 border border-current/10 rounded-lg text-sm font-semibold">{comp}</span>
                          ))
                        : <span className="px-3 py-1 bg-white/60 dark:bg-black/30 border border-current/10 rounded-lg text-sm font-semibold">None detected</span>
                      }
                    </div>
                  </div>
                </div>
              </div>

              {/* Engine Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
                {result.engines.map((engine, i) => (
                  <div key={i} className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-xl flex flex-col text-left">
                    <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-100 dark:border-slate-700">
                      <h3 className="font-bold text-lg text-blue-600 dark:text-blue-400">{engine.engine_name}</h3>
                      {engine.is_mentioned ? <CheckCircle className="text-emerald-500 shrink-0" /> : <XCircle className="text-red-500 shrink-0" />}
                    </div>
                    <div className="prose dark:prose-invert prose-sm flex-grow leading-relaxed">
                      <ReactMarkdown>{engine.answer}</ReactMarkdown>
                    </div>
                  </div>
                ))}
              </div>

            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}