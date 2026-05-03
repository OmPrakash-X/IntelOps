import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Sparkles, Activity, Shield, ArrowRight, Zap, RefreshCw, List } from 'lucide-react';

const TypingText = ({ text, delay = 0 }) => {
  const [displayText, setDisplayText] = useState('');
  
  useEffect(() => {
    let timeout;
    let currentText = '';
    const speed = 30; // typing speed in ms
    
    const startTyping = () => {
      if (currentText.length < text.length) {
        currentText = text.slice(0, currentText.length + 1);
        setDisplayText(currentText);
        timeout = setTimeout(startTyping, speed);
      }
    };
    
    const initialDelay = setTimeout(startTyping, delay);
    
    return () => {
      clearTimeout(timeout);
      clearTimeout(initialDelay);
    };
  }, [text, delay]);
  
  return (
    <span className="font-mono text-slate-300 text-sm">
      {displayText}
      <motion.span
        animate={{ opacity: [0, 1, 0] }}
        transition={{ duration: 0.8, repeat: Infinity }}
        className="inline-block w-1.5 h-3.5 bg-indigo-500 ml-1 align-middle"
      />
    </span>
  );
};

const AIDiagnosticAgent = () => {
  const [isRemediating, setIsRemediating] = useState(false);
  const confidence = 98.4;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative w-full max-w-lg"
    >
      <div className="relative bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-800/20">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/10 flex items-center justify-center text-indigo-500 border border-indigo-500/20">
              <Brain size={18} />
            </div>
            <div>
              <h3 className="text-xs font-semibold text-white uppercase tracking-widest leading-none mb-1.5">Intelligence Agent</h3>
              <div className="flex items-center gap-1.5">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                </span>
                <span className="text-[9px] font-semibold text-emerald-500 uppercase tracking-widest">Online</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-slate-800 border border-slate-700">
            <Activity size={10} className="text-slate-500" />
            <span className="text-[9px] font-mono text-slate-500 tracking-tighter">v2.4.0</span>
          </div>
        </div>

        {/* Body Content */}
        <div className="p-6 space-y-6">
          {/* Analysis Result */}
          <div className="space-y-2">
            <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest flex justify-between">
              <span>Primary Hypothesis</span>
              <span className="text-indigo-500">Real-time scan</span>
            </div>
            <div className="p-4 rounded-lg bg-slate-950 border border-slate-800">
              <TypingText 
                text={`Root cause identified: Database connection timeout on secondary cluster.`} 
                delay={200} 
              />
            </div>
          </div>

          {/* Confidence Meter */}
          <div className="space-y-2">
            <div className="flex justify-between text-[10px] font-semibold uppercase tracking-widest">
              <span className="text-slate-500">Confidence Score</span>
              <span className="text-indigo-400">{confidence}%</span>
            </div>
            <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800 p-[1px]">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${confidence}%` }}
                transition={{ duration: 1.2, ease: "easeOut" }}
                className="h-full bg-indigo-600 rounded-full"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              onClick={() => setIsRemediating(true)}
              className="h-10 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all"
            >
              {isRemediating ? (
                <RefreshCw size={14} className="animate-spin" />
              ) : (
                <Zap size={14} />
              )}
              <span>Remediate</span>
            </button>

            <button
              className="h-10 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 font-semibold text-[10px] uppercase tracking-widest hover:bg-slate-700 transition-all flex items-center justify-center gap-2"
            >
              <List size={14} />
              <span>Details</span>
            </button>
          </div>
        </div>

        {/* Footer Metadata */}
        <div className="px-6 py-3 bg-slate-950/50 border-t border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles size={10} className="text-indigo-400" />
            <span className="text-[9px] font-semibold text-slate-500 uppercase tracking-widest">Reasoning Layer Active</span>
          </div>
          <div className="text-[9px] font-mono text-slate-600">
            {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default AIDiagnosticAgent;
