import { ShieldAlert, UserPlus, Search, Cpu, CheckCircle, GitMerge, Activity, Globe, Database, Key, HardDrive, CheckCircle2, MessageSquare, BrainCircuit } from 'lucide-react';

export const incidents = [
  {
    id: 'INC-9482', title: 'Kubernetes Pod CrashLoopBackOff', severity: 'P3', status: 'Monitoring',
    service: 'K8s Cluster', updatedAt: '2m ago', detectedAt: 'Oct 24, 15:10 UTC', isActive: true,
    timeline: [
      { time: '15:10 UTC', title: 'Incident Detected', desc: 'Slight increase in asset load times for Asia-Pacific users.', icon: ShieldAlert, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/30' },
      { time: '15:15 UTC', title: 'Edge Cache Purge', desc: 'Triggering global edge cache purge for static assets.', icon: Activity, color: 'text-sky-400', bg: 'bg-sky-500/10', border: 'border-sky-500/30' },
    ],
    ai: {
      rootCause: 'BGP routing instability in regional CDN edge nodes in Tokyo.',
      impact: 'Images and CSS files taking 500ms longer to load for 5% of traffic.',
      solution: 'Reroute traffic to Osaka and Seoul edge nodes while Tokyo stabilizes.',
      summary: 'Minor latency reported. Rerouting active. Monitoring for stability.'
    }
  },
  {
    id: 'INC-9481', title: 'High Latency in Payment Service', severity: 'P1', status: 'Investigating',
    service: 'Core API', updatedAt: '5m ago', detectedAt: 'Oct 24, 14:02 UTC', isActive: true,
    timeline: [
      { time: '14:02 UTC', title: 'Incident Detected', desc: 'Automated alerts triggered for high p99 latency.', icon: ShieldAlert, color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30' },
      { time: '14:05 UTC', title: 'Assigned to Team', desc: 'On-call backend engineers paged and assembling.', icon: UserPlus, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/30' },
      { time: '14:15 UTC', title: 'Investigation Started', desc: 'Database CPU spikes correlating with latency drops.', icon: Search, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30' },
    ],
    ai: {
      rootCause: 'Sudden 400% spike in complex JOIN queries from a specific tenant overloading the primary DB cluster.',
      impact: 'API requests to /v2/analytics taking >5s. Other endpoints operating normally.',
      solution: 'Scale up read replicas and temporarily throttle the offending tenant.',
      summary: 'Issue ongoing for 20m. Team actively applying rate limits.'
    },
    image: '/images/incident_telemetry.png'
  },
  {
    id: 'INC-9480', title: 'Redis Connection Pool Exhaustion', severity: 'P2', status: 'Identified',
    service: 'Cache Service', updatedAt: '23m ago', detectedAt: 'Oct 24, 11:30 UTC', isActive: true,
    timeline: [
      { time: '11:30 UTC', title: 'Incident Detected', desc: 'Queue depth alerts triggered for webhook workers.', icon: ShieldAlert, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30' },
      { time: '11:45 UTC', title: 'Identified Issue', desc: 'Bad payload caused worker nodes to hang.', icon: Search, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/30' },
      { time: '12:10 UTC', title: 'Fix Deploying', desc: 'Rolling out hotfix to handle malformed payloads.', icon: GitMerge, color: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/30' },
    ],
    ai: {
      rootCause: 'Malformed JSON payload caused unhandled exceptions in worker threads.',
      impact: 'Webhook delivery delayed by up to 30 seconds for all users.',
      solution: 'Deploy hotfix with try-catch around payload parser and restart worker pods.',
      summary: 'Issue identified quickly. Hotfix currently rolling out.'
    }
  },
  {
    id: 'INC-9475', title: 'PostgreSQL Replica Lag Detected', severity: 'P1', status: 'Resolved',
    service: 'Database', updatedAt: '1d ago', detectedAt: 'Oct 23, 08:15 UTC', isActive: false,
    postmortem: "At 08:15 UTC, we experienced connectivity loss to our primary DB cluster in eu-west-1a due to an AWS hardware failure. Automated failover to standby cluster in eu-west-1b completed by 08:20 UTC. No data loss occurred.",
    timeline: [
      { time: '08:15 UTC', title: 'Incident Detected', desc: 'Database connection pool exhausted.', icon: ShieldAlert, color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30' },
      { time: '08:17 UTC', title: 'Failover Triggered', desc: 'Automated failover to secondary cluster.', icon: Cpu, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30' },
      { time: '08:20 UTC', title: 'Resolved', desc: 'Connectivity restored. Systems normal.', icon: CheckCircle, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30' },
    ],
    ai: {
      rootCause: 'Network hardware failure in AWS availability zone eu-west-1a.',
      impact: '2 minutes of total database unavailability.',
      solution: 'None required. Automated failover succeeded.',
      summary: 'Resolved in 5 minutes via automation.'
    }
  },
];

export const services = [
  { name: 'API Gateway', status: 'operational', icon: Activity, uptime: '99.9%' },
  { name: 'Database', status: 'degraded', icon: Database, uptime: '99.7%' },
  { name: 'Auth Service', status: 'operational', icon: Key, uptime: '100%' },
  { name: 'CDN', status: 'operational', icon: Globe, uptime: '100%' },
];

export const plans = [
  { name: 'Starter', price: '$0', features: ['Public status page', 'Email notifications', '3 team members', '7-day history'], featured: false },
  { name: 'Growth', price: '$49', period: '/mo', features: ['Custom domain & branding', 'SMS & Slack alerts', 'Unlimited members', '1-year history', 'AI Summaries'], featured: true },
  { name: 'Enterprise', price: 'Custom', features: ['SSO & Security', 'Dedicated manager', '99.99% SLA', 'Custom integrations', 'Audit logs'], featured: false },
];

export const steps = [
  { name: 'Detect', icon: Search },
  { name: 'Assign', icon: UserPlus },
  { name: 'Respond', icon: MessageSquare },
  { name: 'Analyze', icon: BrainCircuit },
  { name: 'Resolve', icon: CheckCircle2 },
];

export const severityConfig = {
  P1: { border: 'border-l-red-500', badge: 'bg-red-500/15 text-red-300 border-red-500/30', label: 'P1 Critical', dot: true },
  P2: { border: 'border-l-amber-500', badge: 'bg-amber-500/15 text-amber-300 border-amber-500/30', label: 'P2 Major', dot: false },
  P3: { border: 'border-l-blue-500', badge: 'bg-blue-500/15 text-blue-300 border-blue-500/30', label: 'P3 Minor', dot: false },
};
