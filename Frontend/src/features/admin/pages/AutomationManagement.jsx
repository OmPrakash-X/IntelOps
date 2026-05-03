import React from 'react';
import { motion } from 'framer-motion';
import { Zap, Construction } from 'lucide-react';

const AutomationManagement = () => {
  return (
    <div className="h-[60vh] flex flex-col items-center justify-center text-center">
      <motion.div 
        animate={{ rotate: [0, 360], scale: [1, 1.2, 1] }}
        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
        className="w-24 h-24 rounded-3xl bg-indigo-600/10 flex items-center justify-center text-indigo-500 mb-8 border border-indigo-500/20"
      >
        <Zap size={48} />
      </motion.div>
      <h2 className="text-3xl font-black mb-4">Automation Engine</h2>
      <p className="text-slate-500 text-xs font-bold uppercase tracking-widest max-w-md leading-relaxed">
        Our next-generation AI automation engine is currently under development. 
        Soon you'll be able to create auto-remediation workflows and predictive scaling policies.
      </p>
      <div className="mt-12 flex items-center gap-3 px-6 py-3 bg-slate-900 rounded-2xl border border-slate-800 text-slate-500">
        <Construction size={18} />
        <span className="text-[10px] font-black uppercase tracking-widest">Coming Soon in v2.0</span>
      </div>
    </div>
  );
};

export default AutomationManagement;
