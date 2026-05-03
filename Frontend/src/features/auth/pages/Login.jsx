import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { login } from '../authSlice';
import { useNavigate } from 'react-router-dom';
import { Shield, Lock, Eye, EyeOff, AlertTriangle, Activity, Zap, CheckCircle } from 'lucide-react';

export default function Login() {
  const navigate  = useNavigate();
  const dispatch  = useDispatch();
  const { loading } = useSelector(s => s.auth);

  const [form,    setForm]    = useState({ email: '', password: '' });
  const [show,    setShow]    = useState(false);
  const [error,   setError]   = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const res = await dispatch(login(form));
    if (res.error) { setError('Invalid credentials. Please try again.'); return; }
    if (res.meta.requestStatus === 'fulfilled') {
      const role = res.payload.user.role.toLowerCase();
      if (role === 'admin')      navigate('/admin');
      else if (role === 'teamlead')   navigate('/team-lead');
      else if (role === 'bugger')     navigate('/bugger');
      else if (role === 'teammember') navigate('/member');
      else navigate('/unauthorized');
    }
  };

  return (
    <div className="min-h-screen flex" style={{ background:'#0A0A0A', fontFamily:"'Josefin Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Marcellus&family=Josefin+Sans:wght@300;400;600;700&display=swap');
        .deco-input {
          width:100%; background:transparent; border:none; border-bottom:2px solid rgba(212,175,55,0.4);
          padding:12px 0; font-family:'Josefin Sans',sans-serif; font-size:13px;
          color:#F2F0E4; letter-spacing:0.05em; outline:none; transition:border-color 0.3s;
        }
        .deco-input::placeholder { color:#444; }
        .deco-input:focus { border-bottom-color:#D4AF37; }
        .deco-btn-gold {
          width:100%; padding:14px; background:#D4AF37; color:#0A0A0A;
          font-family:'Josefin Sans',sans-serif; font-size:11px; font-weight:700;
          letter-spacing:0.25em; text-transform:uppercase; border:none; cursor:pointer;
          transition:all 0.3s; position:relative;
        }
        .deco-btn-gold:hover { background:#F2E8C4; box-shadow:0 0 28px rgba(212,175,55,0.4); }
        .deco-btn-gold:disabled { opacity:0.5; cursor:not-allowed; }
        @keyframes deco-pulse { 0%,100%{box-shadow:0 0 0 0 rgba(239,68,68,0.3);} 50%{box-shadow:0 0 0 6px rgba(239,68,68,0);} }
      `}</style>

      {/* ── LEFT PANEL (Art Deco brand) ── */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-16 relative overflow-hidden"
        style={{ borderRight:'1px solid rgba(212,175,55,0.15)', background:'#0e0e0e' }}>

        {/* Crosshatch texture overlay */}
        <div className="absolute inset-0 pointer-events-none" aria-hidden style={{
          backgroundImage:`repeating-linear-gradient(45deg,rgba(212,175,55,0.03) 0,rgba(212,175,55,0.03) 1px,transparent 0,transparent 50%),repeating-linear-gradient(-45deg,rgba(212,175,55,0.03) 0,rgba(212,175,55,0.03) 1px,transparent 0,transparent 50%)`,
          backgroundSize:'24px 24px'
        }} />

        {/* Sunburst radial */}
        <div className="absolute inset-0 pointer-events-none" aria-hidden
          style={{ background:'radial-gradient(ellipse 70% 60% at 30% 40%,rgba(212,175,55,0.05) 0%,transparent 70%)' }} />

        {/* Logo */}
        <div className="flex items-center gap-4 relative z-10">
          <div className="flex items-center justify-center shrink-0"
            style={{ width:40, height:40, border:'2px solid #D4AF37', transform:'rotate(45deg)', boxShadow:'0 0 16px rgba(212,175,55,0.25)' }}>
            <Shield size={16} color="#D4AF37" style={{ transform:'rotate(-45deg)' }} />
          </div>
          <div>
            <h1 style={{ fontFamily:"'Marcellus',serif", fontSize:20, color:'#D4AF37', letterSpacing:'0.2em', textTransform:'uppercase' }}>IntelOps</h1>
            <p style={{ fontSize:8, color:'#555', letterSpacing:'0.28em', textTransform:'uppercase' }}>Command Centre</p>
          </div>
        </div>

        {/* Center content */}
        <motion.div initial={{ opacity:0, y:30 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.8, delay:0.2 }} className="relative z-10">
          {/* Section label */}
          <div className="flex items-center gap-4 mb-10">
            <span className="h-px flex-1" style={{ background:'rgba(212,175,55,0.3)' }} />
            <span style={{ fontSize:8, color:'#D4AF37', letterSpacing:'0.3em', textTransform:'uppercase' }}>System Status</span>
            <span className="h-px flex-1" style={{ background:'rgba(212,175,55,0.3)' }} />
          </div>

          <h2 style={{ fontFamily:"'Marcellus',serif", fontSize:'clamp(2rem,4vw,3rem)', color:'#F2F0E4', textTransform:'uppercase', letterSpacing:'0.1em', lineHeight:1.2, marginBottom:16 }}>
            Incident<br /><span style={{ color:'#D4AF37' }}>Intelligence</span><br />Platform
          </h2>
          <p style={{ color:'#666', fontSize:13, lineHeight:1.8, letterSpacing:'0.04em', maxWidth:380, marginBottom:48 }}>
            Autonomous detection, AI-powered root cause analysis, and real-time incident orchestration for elite SRE teams.
          </p>

          {/* Feature list */}
          {[
            { icon:Activity, text:'Real-time incident monitoring' },
            { icon:Zap,      text:'AI-powered root cause analysis' },
            { icon:CheckCircle, text:'Automated postmortem generation' },
          ].map(({ icon:Icon, text }) => (
            <div key={text} className="flex items-center gap-3 mb-4">
              <div className="flex items-center justify-center shrink-0"
                style={{ width:28, height:28, border:'1px solid rgba(212,175,55,0.3)', transform:'rotate(45deg)' }}>
                <Icon size={11} color="#D4AF37" style={{ transform:'rotate(-45deg)' }} />
              </div>
              <span style={{ fontSize:11, color:'#888', letterSpacing:'0.08em' }}>{text}</span>
            </div>
          ))}
        </motion.div>

        {/* Bottom stats */}
        <div className="flex items-center gap-10 relative z-10" style={{ borderTop:'1px solid rgba(212,175,55,0.1)', paddingTop:24 }}>
          {[['187K+','Resolved'],['94%','MTTR Cut'],['99.98%','Uptime']].map(([v,l]) => (
            <div key={l}>
              <div style={{ fontFamily:"'Marcellus',serif", fontSize:20, color:'#D4AF37' }}>{v}</div>
              <div style={{ fontSize:8, color:'#555', letterSpacing:'0.22em', textTransform:'uppercase' }}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── RIGHT PANEL (Login form) ── */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 py-16 relative">
        {/* Subtle glow */}
        <div className="absolute inset-0 pointer-events-none" aria-hidden
          style={{ background:'radial-gradient(ellipse 60% 50% at 50% 50%,rgba(212,175,55,0.04) 0%,transparent 65%)' }} />

        <motion.div initial={{ opacity:0, y:24 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.7 }}
          className="w-full max-w-sm relative z-10">

          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-12 lg:hidden">
            <div style={{ width:32, height:32, border:'2px solid #D4AF37', transform:'rotate(45deg)', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <Shield size={12} color="#D4AF37" style={{ transform:'rotate(-45deg)' }} />
            </div>
            <span style={{ fontFamily:"'Marcellus',serif", fontSize:16, color:'#D4AF37', letterSpacing:'0.2em', textTransform:'uppercase' }}>IntelOps</span>
          </div>

          {/* Heading */}
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-4">
              <span className="h-px w-8" style={{ background:'rgba(212,175,55,0.5)' }} />
              <span style={{ fontSize:8, color:'#D4AF37', letterSpacing:'0.3em', textTransform:'uppercase' }}>Secure Access</span>
            </div>
            <h2 style={{ fontFamily:"'Marcellus',serif", fontSize:28, color:'#F2F0E4', textTransform:'uppercase', letterSpacing:'0.12em', marginBottom:6 }}>Sign In</h2>
            <p style={{ fontSize:11, color:'#555', letterSpacing:'0.08em' }}>Internal portal access only</p>
          </div>

          {/* Error */}
          {error && (
            <motion.div initial={{ opacity:0, y:-8 }} animate={{ opacity:1, y:0 }}
              className="flex items-center gap-3 px-4 py-3 mb-6"
              style={{ border:'1px solid rgba(239,68,68,0.3)', background:'rgba(239,68,68,0.06)', color:'#ef4444' }}>
              <AlertTriangle size={13} />
              <span style={{ fontSize:11, letterSpacing:'0.05em' }}>{error}</span>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Email */}
            <div>
              <label style={{ display:'block', fontSize:9, fontWeight:700, letterSpacing:'0.25em', textTransform:'uppercase', color:'#D4AF37', marginBottom:8 }}>
                Email Address
              </label>
              <input
                type="email" required
                className="deco-input"
                placeholder="your@email.com"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              />
            </div>

            {/* Password */}
            <div>
              <label style={{ display:'block', fontSize:9, fontWeight:700, letterSpacing:'0.25em', textTransform:'uppercase', color:'#D4AF37', marginBottom:8 }}>
                Password
              </label>
              <div className="relative">
                <input
                  type={show ? 'text' : 'password'} required
                  className="deco-input"
                  style={{ paddingRight:36 }}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                />
                <button type="button" onClick={() => setShow(s => !s)}
                  className="absolute right-0 top-1/2 -translate-y-1/2"
                  style={{ color:'#555', background:'none', border:'none', cursor:'pointer', padding:4 }}
                  onMouseEnter={e => e.currentTarget.style.color='#D4AF37'}
                  onMouseLeave={e => e.currentTarget.style.color='#555'}>
                  {show ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button type="submit" className="deco-btn-gold" disabled={loading}>
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin" width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="#0A0A0A" strokeWidth={3}><circle cx={12} cy={12} r={10} strokeOpacity={0.3} /><path d="M12 2a10 10 0 0 1 10 10" /></svg>
                  Authenticating...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <Lock size={12} /> Access Portal
                </span>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-10 pt-6 flex items-center justify-between" style={{ borderTop:'1px solid rgba(212,175,55,0.1)' }}>
            <button onClick={() => navigate('/')} className="text-[9px] uppercase tracking-widest transition-colors"
              style={{ background:'none', border:'none', cursor:'pointer', color:'#444' }}
              onMouseEnter={e => e.target.style.color='#D4AF37'} onMouseLeave={e => e.target.style.color='#444'}>
              ← Back to Home
            </button>
            <div className="flex items-center gap-2" style={{ fontSize:8, letterSpacing:'0.18em', textTransform:'uppercase', color:'#444' }}>
              <span style={{ width:6, height:6, background:'#22c55e', display:'inline-block', animation:'deco-pulse 2s infinite' }} />
              Systems Online
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}