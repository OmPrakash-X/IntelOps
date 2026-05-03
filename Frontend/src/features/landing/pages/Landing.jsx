import React, { useState, useEffect, useRef } from 'react';
import { motion, useInView, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const BASE = import.meta.env.VITE_BACKEND_API || 'http://localhost:3000';
const GOLD = '#D4AF37';
const OBSIDIAN = '#0A0A0A';
const CHARCOAL = '#141414';
const CREAM = '#F2F0E4';

/* ── Reusable animation variants ─────────────────── */
const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] } },
};
const fadeIn = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.6 } },
};
const slideLeft = {
  hidden: { opacity: 0, x: -40 },
  show: { opacity: 1, x: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};
const stagger = (delay = 0.1) => ({
  hidden: {},
  show: { transition: { staggerChildren: delay } },
});

/* ── Scroll-triggered wrapper ────────────────────── */
function RevealOnScroll({ children, variants = fadeUp, delay = 0, className, style }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  return (
    <motion.div
      ref={ref}
      variants={variants}
      initial="hidden"
      animate={inView ? 'show' : 'hidden'}
      transition={{ delay }}
      className={className}
      style={style}
    >
      {children}
    </motion.div>
  );
}

/* ── Floating gold particle ──────────────────────── */
function Particle({ x, y, size, duration, delay }) {
  return (
    <motion.div
      aria-hidden
      style={{
        position: 'absolute', left: `${x}%`, top: `${y}%`,
        width: size, height: size,
        background: GOLD, borderRadius: '50%', opacity: 0,
        pointerEvents: 'none',
      }}
      animate={{ y: [0, -30, 0], opacity: [0, 0.4, 0] }}
      transition={{ duration, delay, repeat: Infinity, ease: 'easeInOut' }}
    />
  );
}

/* ── Animated counter ─────────────────────────────── */
function Counter({ end, suffix = '' }) {
  const [n, setN] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  useEffect(() => {
    if (!inView) return;
    let v = 0;
    const step = end / 80;
    const id = setInterval(() => {
      v += step;
      if (v >= end) { setN(end); clearInterval(id); }
      else setN(Math.floor(v));
    }, 16);
    return () => clearInterval(id);
  }, [inView, end]);
  return <span ref={ref}>{n.toLocaleString()}{suffix}</span>;
}

/* ── Corner bracket decoration ────────────────────── */
function Corners({ opacity = 0.6 }) {
  const b = `2px solid ${GOLD}`;
  const base = { position: 'absolute', width: 12, height: 12, opacity, pointerEvents: 'none' };
  return (
    <>
      <span aria-hidden style={{ ...base, top: 6, left: 6, borderTop: b, borderLeft: b }} />
      <span aria-hidden style={{ ...base, top: 6, right: 6, borderTop: b, borderRight: b }} />
      <span aria-hidden style={{ ...base, bottom: 6, left: 6, borderBottom: b, borderLeft: b }} />
      <span aria-hidden style={{ ...base, bottom: 6, right: 6, borderBottom: b, borderRight: b }} />
    </>
  );
}

/* ── Section heading ──────────────────────────────── */
function SectionHeading({ children, sub }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  return (
    <div ref={ref} style={{ textAlign: 'center', marginBottom: 64 }}>
      <motion.div
        initial={{ opacity: 0, scaleX: 0 }}
        animate={inView ? { opacity: 1, scaleX: 1 } : {}}
        transition={{ duration: 0.6 }}
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, marginBottom: 16 }}
      >
        <span style={{ height: 1, width: 60, background: `linear-gradient(to right, transparent, ${GOLD})` }} />
        <span style={{ color: GOLD, fontSize: 10, fontWeight: 900, letterSpacing: '0.3em', textTransform: 'uppercase' }}>IntelOps</span>
        <span style={{ height: 1, width: 60, background: `linear-gradient(to left, transparent, ${GOLD})` }} />
      </motion.div>
      <motion.h2
        initial={{ opacity: 0, y: 24 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.7, delay: 0.15 }}
        style={{ fontFamily: "'Marcellus', serif", fontSize: 'clamp(2rem,5vw,3.5rem)', color: CREAM, textTransform: 'uppercase', letterSpacing: '0.12em', margin: '0 0 16px' }}
      >
        {children}
      </motion.h2>
      {sub && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.3 }}
          style={{ color: '#888', fontSize: 14, letterSpacing: '0.05em' }}
        >
          {sub}
        </motion.p>
      )}
    </div>
  );
}

/* ── NavLink ──────────────────────────────────────── */
function NavLink({ children, sectionId }) {
  return (
    <motion.button
      onClick={() => document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' })}
      whileHover={{ color: GOLD, y: -1 }}
      style={{
        background: 'none', border: 'none', color: '#888', cursor: 'pointer',
        fontFamily: "'Josefin Sans', sans-serif", fontSize: 10, fontWeight: 700,
        letterSpacing: '0.22em', textTransform: 'uppercase', padding: '4px 0',
      }}
    >
      {children}
    </motion.button>
  );
}

/* ── Particles config ─────────────────────────────── */
const PARTICLES = Array.from({ length: 18 }, (_, i) => ({
  id: i,
  x: (i * 37 + 11) % 100,
  y: (i * 53 + 7) % 100,
  size: (i % 3) + 1,
  duration: (i % 4) + 4,
  delay: (i % 4),
}));

/* ── Main Component ───────────────────────────────── */
export default function Landing() {
  const navigate = useNavigate();
  const [incidents, setIncidents] = useState([]);
  const [incLoading, setIncLoading] = useState(true);
  const [isAnnual, setIsAnnual] = useState(true);

  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 600], [0, -80]);
  const heroOpacity = useTransform(scrollY, [0, 400], [1, 0]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    axios.get(`${BASE}/api/incidents`, { headers: token ? { Authorization: `Bearer ${token}` } : {} })
      .then(r => setIncidents(r.data?.data || r.data || []))
      .catch(() => setIncidents([]))
      .finally(() => setIncLoading(false));
  }, []);

  const active = incidents.filter(i => i.status !== 'resolved').length;

  const btnBase = {
    border: `2px solid ${GOLD}`, color: GOLD, padding: '14px 36px',
    fontFamily: "'Josefin Sans', sans-serif", fontSize: 11, fontWeight: 700,
    letterSpacing: '0.25em', textTransform: 'uppercase', cursor: 'pointer',
    background: 'transparent',
  };
  const btnSolid = { ...btnBase, background: GOLD, color: OBSIDIAN };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Marcellus&family=Josefin+Sans:wght@300;400;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        .deco-card { background: ${CHARCOAL}; border: 1px solid rgba(212,175,55,0.2); position: relative; }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
        .pulse { animation: pulse 1.5s infinite; }
        @keyframes spin-slow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes spin-reverse { from { transform: rotate(360deg); } to { transform: rotate(0deg); } }
        .spin-slow { animation: spin-slow 20s linear infinite; }
        .spin-reverse { animation: spin-reverse 14s linear infinite; }
      `}</style>

      <div style={{
        background: OBSIDIAN,
        backgroundImage: `repeating-linear-gradient(45deg,rgba(212,175,55,0.04) 0,rgba(212,175,55,0.04) 1px,transparent 0,transparent 50%),repeating-linear-gradient(-45deg,rgba(212,175,55,0.04) 0,rgba(212,175,55,0.04) 1px,transparent 0,transparent 50%)`,
        backgroundSize: '28px 28px',
        minHeight: '100vh',
        fontFamily: "'Josefin Sans', sans-serif",
        color: CREAM,
        overflowX: 'hidden',
      }}>

        {/* ── NAVBAR ── */}
        <motion.nav
          initial={{ y: -80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, background: 'rgba(10,10,10,0.92)', backdropFilter: 'blur(12px)', borderBottom: `1px solid rgba(212,175,55,0.2)` }}
        >
          <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 32px', height: 72, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <motion.div
              style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
            >
              <motion.div
                style={{ width: 36, height: 36, border: `2px solid ${GOLD}`, transform: 'rotate(45deg)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 0 12px rgba(212,175,55,0.3)` }}
                whileHover={{ boxShadow: `0 0 28px rgba(212,175,55,0.65)` }}
              >
                <svg style={{ transform: 'rotate(-45deg)', width: 16, height: 16 }} viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
              </motion.div>
              <span style={{ fontFamily: "'Marcellus', serif", fontSize: 20, color: CREAM, letterSpacing: '0.2em', textTransform: 'uppercase' }}>IntelOps</span>
            </motion.div>

            <motion.div
              style={{ display: 'flex', gap: 40 }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              <NavLink sectionId="features">Platform</NavLink>
              <NavLink sectionId="pricing">Solutions</NavLink>
              <NavLink sectionId="incidents">Status</NavLink>
            </motion.div>

            <motion.button
              style={btnBase}
              onClick={() => navigate('/login')}
              whileHover={{ background: GOLD, color: OBSIDIAN, boxShadow: '0 0 28px rgba(212,175,55,0.35)' }}
              whileTap={{ scale: 0.96 }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <svg style={{ display: 'inline', width: 12, height: 12, verticalAlign: 'middle', marginRight: 8 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0110 0v4" />
              </svg>
              Internal Portal
            </motion.button>
          </div>
        </motion.nav>

        {/* ── HERO ── */}
        <section id="hero" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '120px 32px 80px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>

          {/* Floating particles */}
          {PARTICLES.map(p => <Particle key={p.id} {...p} />)}

          {/* Rotating rings */}
          <div aria-hidden className="spin-slow" style={{ position: 'absolute', width: 600, height: 600, border: `1px solid rgba(212,175,55,0.06)`, borderRadius: '50%', top: '50%', left: '50%', marginTop: -300, marginLeft: -300, pointerEvents: 'none' }} />
          <div aria-hidden className="spin-reverse" style={{ position: 'absolute', width: 420, height: 420, border: `1px solid rgba(212,175,55,0.08)`, borderRadius: '50%', top: '50%', left: '50%', marginTop: -210, marginLeft: -210, pointerEvents: 'none' }} />

          <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse 60% 50% at 50% 40%,rgba(212,175,55,0.07) 0%,transparent 70%)`, pointerEvents: 'none' }} />

          <motion.div style={{ maxWidth: 800, position: 'relative', y: heroY, opacity: heroOpacity }}>

            <motion.div
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 10, border: `1px solid rgba(212,175,55,0.4)`, padding: '8px 20px', marginBottom: 40, fontSize: 10, letterSpacing: '0.25em', textTransform: 'uppercase', color: GOLD }}
            >
              <span className="pulse" style={{ width: 8, height: 8, borderRadius: '50%', background: '#ef4444', display: 'inline-block' }} />
              LIVE: {active} Active Incident{active !== 1 ? 's' : ''}
            </motion.div>

            <motion.h1
              style={{ fontFamily: "'Marcellus', serif", fontSize: 'clamp(3rem,8vw,5.5rem)', textTransform: 'uppercase', letterSpacing: '0.1em', lineHeight: 1.1, marginBottom: 24, color: CREAM }}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              From Chaos<br />
              <motion.span
                style={{ color: GOLD, textShadow: `0 0 40px rgba(212,175,55,0.25)`, display: 'inline-block' }}
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.7, delay: 0.6 }}
              >
                to Clarity
              </motion.span>
            </motion.h1>

            <motion.div
              initial={{ opacity: 0, scaleX: 0 }}
              animate={{ opacity: 1, scaleX: 1 }}
              transition={{ duration: 0.6, delay: 0.75 }}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, marginBottom: 32 }}
            >
              <span style={{ height: 1, width: 80, background: GOLD, opacity: 0.4 }} />
              <motion.span
                animate={{ rotate: [45, 90, 45] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                style={{ width: 6, height: 6, border: `1px solid ${GOLD}`, display: 'inline-block', opacity: 0.6 }}
              />
              <span style={{ height: 1, width: 80, background: GOLD, opacity: 0.4 }} />
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.85 }}
              style={{ color: '#aaa', fontSize: 16, lineHeight: 1.8, maxWidth: 560, margin: '0 auto 48px', letterSpacing: '0.04em' }}
            >
              The autonomous intelligence platform for modern SRE teams. Resolve incidents before they impact customers with AI-powered detection and 70% faster MTTR.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1 }}
              style={{ display: 'flex', gap: 20, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 64 }}
            >
              <motion.button
                style={btnSolid}
                onClick={() => navigate('/login')}
                whileHover={{ background: '#F2E8C4', boxShadow: '0 0 28px rgba(212,175,55,0.5)', scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                Access Portal
              </motion.button>
              <motion.button
                style={btnBase}
                onClick={() => document.getElementById('incidents')?.scrollIntoView({ behavior: 'smooth' })}
                whileHover={{ background: GOLD, color: OBSIDIAN, boxShadow: '0 0 28px rgba(212,175,55,0.35)', scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                View Live Status
              </motion.button>
            </motion.div>

            <motion.div
              variants={stagger(0.15)}
              initial="hidden"
              animate="show"
              transition={{ delayChildren: 1.1 }}
              style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap' }}
            >
              {[
                { value: <><Counter end={187450} />+</>, label: 'Incidents Resolved' },
                { value: '94%', label: 'MTTR Reduction' },
                { value: '99.98%', label: 'Uptime' },
              ].map(({ value, label }, i) => (
                <React.Fragment key={label}>
                  {i > 0 && <motion.div variants={fadeIn} style={{ width: 1, background: `rgba(212,175,55,0.2)`, margin: '0 40px' }} />}
                  <motion.div variants={fadeUp} style={{ textAlign: 'center' }}>
                    <div style={{ fontFamily: "'Marcellus', serif", fontSize: 28, color: GOLD, marginBottom: 4 }}>{value}</div>
                    <div style={{ fontSize: 9, letterSpacing: '0.25em', textTransform: 'uppercase', color: '#666' }}>{label}</div>
                  </motion.div>
                </React.Fragment>
              ))}
            </motion.div>
          </motion.div>
        </section>

        {/* ── FEATURES ── */}
        <section id="features" style={{ padding: '100px 32px', background: `linear-gradient(to bottom,${OBSIDIAN},#0e0d0a)` }}>
          <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            <SectionHeading sub="Autonomous intelligence for modern SRE teams">Platform Capabilities</SectionHeading>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: 2 }}>
              {[
                { num: 'I', title: 'Real-time Visibility', desc: 'Deep stack monitoring across thousands of microservices with zero latency overhead.', icon: <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /> },
                { num: 'II', title: 'AI Root Cause', desc: 'Autonomous diagnostic reasoning identifies the precise failure point in seconds.', icon: <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /> },
                { num: 'III', title: 'Auto-Remediation', desc: 'Predefined runbooks execute automatically so engineers sleep through false alarms.', icon: <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /> },
                { num: 'IV', title: 'Audit Trail', desc: 'Immutable incident timelines satisfy compliance requirements automatically.', icon: <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /> },
              ].map((f, i) => (
                <RevealOnScroll key={f.num} delay={i * 0.1}>
                  <motion.div
                    className="deco-card"
                    style={{ padding: 40, height: '100%' }}
                    whileHover={{ borderColor: GOLD, boxShadow: `0 0 24px rgba(212,175,55,0.12)`, y: -6 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Corners />
                    <div style={{ color: GOLD, fontSize: 11, letterSpacing: '0.3em', marginBottom: 20, opacity: 0.5 }}>{f.num}</div>
                    <motion.div
                      style={{ width: 44, height: 44, border: `1px solid rgba(212,175,55,0.3)`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24, transform: 'rotate(45deg)' }}
                      whileHover={{ borderColor: GOLD, boxShadow: `0 0 14px rgba(212,175,55,0.3)` }}
                    >
                      <svg style={{ transform: 'rotate(-45deg)', width: 20, height: 20 }} viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth="2">{f.icon}</svg>
                    </motion.div>
                    <h3 style={{ fontFamily: "'Marcellus', serif", fontSize: 18, color: CREAM, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>{f.title}</h3>
                    <p style={{ color: '#888', fontSize: 13, lineHeight: 1.7 }}>{f.desc}</p>
                  </motion.div>
                </RevealOnScroll>
              ))}
            </div>
          </div>
        </section>

        {/* ── LIVE INCIDENTS ── */}
        <section id="incidents" style={{ padding: '100px 32px' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            <SectionHeading sub="Real-time feed from our command center">Live Incident Activity</SectionHeading>

            {incLoading ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[1, 2, 3].map(i => (
                  <motion.div
                    key={i}
                    style={{ height: 80, background: CHARCOAL, border: `1px solid rgba(212,175,55,0.1)` }}
                    animate={{ opacity: [0.4, 0.8, 0.4] }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
                  />
                ))}
              </div>
            ) : incidents.length === 0 ? (
              <RevealOnScroll>
                <div className="deco-card" style={{ padding: 60, textAlign: 'center' }}>
                  <Corners />
                  <svg style={{ width: 32, height: 32, margin: '0 auto 16px', display: 'block' }} viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth="2">
                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                  </svg>
                  <h3 style={{ fontFamily: "'Marcellus', serif", color: CREAM, fontSize: 20, letterSpacing: '0.1em' }}>All Systems Operational</h3>
                  <p style={{ color: '#666', marginTop: 8, fontSize: 13 }}>No active incidents at this time.</p>
                </div>
              </RevealOnScroll>
            ) : (
              <motion.div
                variants={stagger(0.08)}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                style={{ display: 'flex', flexDirection: 'column', gap: 2 }}
              >
                {incidents.slice(0, 5).map((inc) => {
                  const sev = inc.severity === 'high' ? 'P1' : inc.severity === 'medium' ? 'P2' : 'P3';
                  const sevColor = sev === 'P1' ? '#ef4444' : sev === 'P2' ? '#f59e0b' : '#6366f1';
                  return (
                    <motion.div
                      key={inc._id}
                      variants={slideLeft}
                      onClick={() => navigate(`/incident/${inc._id}`)}
                      style={{ background: CHARCOAL, border: `1px solid rgba(212,175,55,0.15)`, padding: '24px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24, cursor: 'pointer' }}
                      whileHover={{ borderColor: GOLD, boxShadow: '0 0 20px rgba(212,175,55,0.1)', x: 4 }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                          <div className={sev === 'P1' ? 'pulse' : ''} style={{ width: 10, height: 10, borderRadius: '50%', background: sevColor, boxShadow: sev === 'P1' ? `0 0 10px ${sevColor}` : undefined }} />
                          <span style={{ fontSize: 9, color: '#555', letterSpacing: '0.1em' }}>{sev}</span>
                        </div>
                        <div>
                          <h4 style={{ fontFamily: "'Marcellus', serif", fontSize: 16, color: CREAM, letterSpacing: '0.05em', marginBottom: 6 }}>{inc.title}</h4>
                          <div style={{ display: 'flex', gap: 20, fontSize: 9, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#666' }}>
                            <span>{inc.status === 'inProgress' ? 'In Progress' : inc.status}</span>
                            <span>{inc.createdBy?.username || 'System'}</span>
                            <span>{new Date(inc.createdAt).toLocaleTimeString()}</span>
                          </div>
                        </div>
                      </div>
                      <motion.svg
                        style={{ width: 18, height: 18, opacity: 0.5 }}
                        viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth="2"
                        animate={{ x: [0, 4, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                      >
                        <polyline points="9 18 15 12 9 6" />
                      </motion.svg>
                    </motion.div>
                  );
                })}
              </motion.div>
            )}
          </div>
        </section>

        {/* ── PRICING ── */}
        <section id="pricing" style={{ padding: '100px 32px' }}>
          <div style={{ maxWidth: 1100, margin: '0 auto' }}>
            <SectionHeading sub="Choose your operational tier">Ready for Production</SectionHeading>

            <RevealOnScroll>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 56 }}>
                <div style={{ display: 'inline-flex', border: `1px solid rgba(212,175,55,0.3)`, padding: 4 }}>
                  {['Monthly', 'Annual'].map(t => {
                    const isActive = (t === 'Annual') === isAnnual;
                    return (
                      <motion.button
                        key={t}
                        onClick={() => setIsAnnual(t === 'Annual')}
                        animate={{ background: isActive ? GOLD : 'transparent', color: isActive ? OBSIDIAN : GOLD }}
                        transition={{ duration: 0.25 }}
                        style={{ padding: '10px 28px', fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', fontFamily: "'Josefin Sans', sans-serif", cursor: 'pointer', border: 'none', fontWeight: 700 }}
                      >
                        {t}{t === 'Annual' && ' −20%'}
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            </RevealOnScroll>

            <motion.div
              variants={stagger(0.12)}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 2 }}
            >
              {[
                { tier: 'I', title: 'Starter', price: '$0', features: ['5 Active Monitors', 'Daily AI Scans', 'Basic Root Cause', '7-day Retention'] },
                { tier: 'II', title: 'Growth', price: isAnnual ? '$39' : '$49', featured: true, features: ['Unlimited Monitors', 'Auto-Remediation', 'Real-time Telemetry', 'Slack & PagerDuty', '30-day Retention'] },
                { tier: 'III', title: 'Enterprise', price: 'Custom', features: ['Air-gap Deployment', 'SLA Guarantee', 'Dedicated SRE', 'Custom Integrations', 'Unlimited Retention'] },
              ].map((p) => (
                <motion.div
                  key={p.title}
                  variants={fadeUp}
                  className="deco-card"
                  style={{ padding: 48, borderColor: p.featured ? GOLD : 'rgba(212,175,55,0.2)', boxShadow: p.featured ? `0 0 40px rgba(212,175,55,0.1)` : undefined }}
                  whileHover={{ y: -8, boxShadow: `0 0 32px rgba(212,175,55,${p.featured ? '0.25' : '0.1'})`, borderColor: GOLD }}
                >
                  <Corners opacity={p.featured ? 1 : 0.4} />
                  {p.featured && <div style={{ fontSize: 8, letterSpacing: '0.3em', color: GOLD, textTransform: 'uppercase', marginBottom: 16, textAlign: 'center' }}>— Most Popular —</div>}
                  <div style={{ fontSize: 10, letterSpacing: '0.3em', color: GOLD, opacity: 0.5, marginBottom: 8 }}>{p.tier}</div>
                  <h3 style={{ fontFamily: "'Marcellus', serif", fontSize: 22, color: CREAM, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 20 }}>{p.title}</h3>
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={p.price}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      transition={{ duration: 0.25 }}
                      style={{ fontFamily: "'Marcellus', serif", fontSize: 48, color: p.featured ? GOLD : CREAM, marginBottom: 32 }}
                    >
                      {p.price}
                    </motion.div>
                  </AnimatePresence>
                  <div style={{ height: 1, background: `rgba(212,175,55,0.2)`, marginBottom: 28 }} />
                  <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 40, padding: 0 }}>
                    {p.features.map((f, fi) => (
                      <motion.li
                        key={f}
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: fi * 0.06 }}
                        style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 12, color: '#aaa', letterSpacing: '0.05em' }}
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>
                        {f}
                      </motion.li>
                    ))}
                  </ul>
                  <motion.button
                    style={{ ...(p.featured ? btnSolid : btnBase), width: '100%', display: 'block' }}
                    onClick={() => navigate('/login')}
                    whileHover={{ background: p.featured ? '#F2E8C4' : GOLD, color: OBSIDIAN, boxShadow: '0 0 28px rgba(212,175,55,0.4)' }}
                    whileTap={{ scale: 0.97 }}
                  >
                    {p.price === 'Custom' ? 'Contact Us' : 'Get Started'}
                  </motion.button>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section style={{ padding: '100px 32px', background: CHARCOAL, textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse 80% 70% at 50% 50%,rgba(212,175,55,0.06) 0%,transparent 65%)`, pointerEvents: 'none' }} />
          <RevealOnScroll style={{ maxWidth: 700, margin: '0 auto', position: 'relative', zIndex: 1 }}>
            <h2 style={{ fontFamily: "'Marcellus', serif", fontSize: 'clamp(2.5rem,6vw,4rem)', color: CREAM, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 16 }}>
              Cut Your MTTR<br /><span style={{ color: GOLD }}>By 70%</span>
            </h2>
            <p style={{ color: '#888', fontSize: 14, marginBottom: 48, letterSpacing: '0.05em' }}>Join engineering teams who resolved over 187,000 incidents with IntelOps.</p>
            <div style={{ display: 'flex', gap: 20, justifyContent: 'center', flexWrap: 'wrap' }}>
              <motion.button
                style={btnSolid}
                onClick={() => navigate('/login')}
                whileHover={{ background: '#F2E8C4', boxShadow: '0 0 28px rgba(212,175,55,0.5)', scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                Access the Portal
              </motion.button>
              <motion.button
                style={btnBase}
                whileHover={{ background: GOLD, color: OBSIDIAN, boxShadow: '0 0 28px rgba(212,175,55,0.35)', scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                Request a Demo
              </motion.button>
            </div>
          </RevealOnScroll>
        </section>

        {/* ── FOOTER ── */}
        <motion.footer
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          style={{ borderTop: `1px solid rgba(212,175,55,0.15)`, padding: '40px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}
        >
          <motion.div style={{ display: 'flex', alignItems: 'center', gap: 12 }} whileHover={{ scale: 1.04 }}>
            <div style={{ width: 28, height: 28, border: `1px solid rgba(212,175,55,0.4)`, transform: 'rotate(45deg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg style={{ transform: 'rotate(-45deg)', width: 12, height: 12 }} viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </div>
            <span style={{ fontFamily: "'Marcellus', serif", fontSize: 14, color: CREAM, letterSpacing: '0.18em', textTransform: 'uppercase' }}>IntelOps</span>
          </motion.div>
          <p style={{ color: '#555', fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase' }}>© {new Date().getFullYear()} IntelOps — All Rights Reserved</p>
          <motion.button
            style={{ ...btnBase, padding: '10px 24px', fontSize: 9 }}
            onClick={() => navigate('/login')}
            whileHover={{ background: GOLD, color: OBSIDIAN }}
            whileTap={{ scale: 0.96 }}
          >
            Internal Portal
          </motion.button>
        </motion.footer>

      </div>
    </>
  );
}