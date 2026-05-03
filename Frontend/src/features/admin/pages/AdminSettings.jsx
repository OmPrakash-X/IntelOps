import React from 'react';
import { motion } from 'framer-motion';
import { User, Shield, Bell, Lock, Globe, LogOut, ChevronRight } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../auth/authSlice';
import { useNavigate } from 'react-router-dom';

function Corners({ opacity = "opacity-60" }) {
  return (
    <>
      <span aria-hidden className={`absolute w-2 h-2 border-t-2 border-l-2 border-[#D4AF37] top-1 left-1 pointer-events-none ${opacity}`} />
      <span aria-hidden className={`absolute w-2 h-2 border-t-2 border-r-2 border-[#D4AF37] top-1 right-1 pointer-events-none ${opacity}`} />
      <span aria-hidden className={`absolute w-2 h-2 border-b-2 border-l-2 border-[#D4AF37] bottom-1 left-1 pointer-events-none ${opacity}`} />
      <span aria-hidden className={`absolute w-2 h-2 border-b-2 border-r-2 border-[#D4AF37] bottom-1 right-1 pointer-events-none ${opacity}`} />
    </>
  );
}

const AdminSettings = () => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };



  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl space-y-8 font-['Josefin_Sans']">
      
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <span className="h-px w-6 bg-[#D4AF37]/40" />
          <h2 className="font-['Marcellus'] text-2xl text-[#F2F0E4] uppercase tracking-[0.1em]">Settings</h2>
        </div>
        <p className="text-[#888] text-[10px] font-bold uppercase tracking-[0.2em]">Configure your IntelOps command experience</p>
      </div>

      {/* Profile Card */}
      <div className="relative p-6 md:p-8 bg-[#141414] border border-[#D4AF37]/25 flex flex-col md:flex-row items-center text-center md:text-left gap-6">
        <Corners opacity="opacity-100" />
        <div className="flex items-center justify-center w-20 h-20 border-2 border-[#D4AF37] bg-[#D4AF37]/10 text-[#D4AF37] shrink-0">
          <span className="font-['Marcellus'] text-4xl">{(user?.username || 'A').charAt(0).toUpperCase()}</span>
        </div>
        <div className="flex-1 min-w-0 flex flex-col items-center md:items-start">
          <h3 className="font-['Marcellus'] text-2xl text-[#F2F0E4] mb-1">{user?.username || 'Administrator'}</h3>
          <p className="text-[#888] text-[12px] mb-3 md:mb-2 break-all">{user?.email || 'admin@intelops.io'}</p>
          <span className="px-2 py-1 bg-[#D4AF37]/10 text-[#D4AF37] text-[8px] font-bold uppercase tracking-[0.2em] border border-[#D4AF37]/30 w-fit">
            {user?.role || 'System Admin'}
          </span>
        </div>
        <button onClick={handleLogout}
          className="mt-4 md:mt-0 w-full md:w-auto px-5 py-3 bg-[#ef4444]/10 text-[#ef4444] border border-[#ef4444]/30 text-[9px] font-bold uppercase tracking-[0.2em] hover:bg-[#ef4444] hover:text-[#0A0A0A] transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0">
          <LogOut size={14} /> Logout
        </button>
      </div>


    </motion.div>
  );
};

export default AdminSettings;
