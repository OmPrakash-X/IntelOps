import React from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, ArrowLeft, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Unauthorized = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center font-['Inter'] selection:bg-indigo-100 p-8">
      
      {/* Background Dots */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.4]" 
        style={{ 
          backgroundImage: `radial-gradient(#E0E7FF 1px, transparent 1px)`, 
          backgroundSize: '32px 32px' 
        }} 
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative z-10 max-w-md w-full text-center"
      >
        <div className="mb-8 flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 bg-red-500 blur-2xl opacity-20 animate-pulse" />
            <div className="relative w-24 h-24 rounded-[32px] bg-red-50 flex items-center justify-center text-red-500 border border-red-100 shadow-xl">
              <ShieldAlert size={48} />
            </div>
          </div>
        </div>

        <h1 className="text-4xl font-['Plus_Jakarta_Sans'] font-black text-slate-900 mb-4 tracking-tighter">Access Restricted</h1>
        <p className="text-slate-500 font-medium leading-relaxed mb-10">
          Your account does not have the required permissions to access this secure zone. Please contact your system administrator if you believe this is an error.
        </p>

        <div className="space-y-4">
          <button 
            onClick={() => navigate('/')}
            className="w-full py-4.5 bg-slate-900 text-white rounded-2xl font-black text-[13px] uppercase tracking-widest hover:bg-slate-800 transition-all flex items-center justify-center gap-3 shadow-xl active:scale-95"
          >
            <ArrowLeft size={18} />
            Back to Home
          </button>
          
          <div className="pt-8 border-t border-slate-100 flex items-center justify-center gap-3 opacity-30">
            <Lock size={16} />
            <span className="text-[10px] font-black uppercase tracking-widest">Protocol 403: Forbidden</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Unauthorized;
