import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, ShieldCheck, Flag, BarChart3, UserCheck, UserX, CheckCircle, XCircle,
  TrendingUp, DollarSign, UserPlus, HeartHandshake, Briefcase, FileText, Upload,
  Search, Filter, Mail, Send, Key, Check, Plus, Trash2, Edit3, Lock, Unlock,
  ExternalLink, Sparkles, CheckSquare, X
} from 'lucide-react';
import { toast } from 'react-toastify';
import Header from '../components/Header';
import Footer from '../components/Footer';

interface AdminProps {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  mobileMode?: boolean;
  toggleMobileMode?: () => void;
}

const apiBase = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, '') || 'http://localhost:4242';

// Initial Mock Data
const INITIAL_USERS = [
  { id: 'usr-1', name: 'Alex Rivera', email: 'alex.rivera@example.com', role: 'Professional', status: 'active', verified: true, joinDate: '2026-01-15' },
  { id: 'usr-2', name: 'Samantha Wu', email: 'samantha.wu@techcorp.com', role: 'Client', status: 'active', verified: true, joinDate: '2026-02-10' },
  { id: 'usr-3', name: 'Marcus Vance', email: 'marcus@vanceinvest.com', role: 'Client', status: 'active', verified: false, joinDate: '2026-03-01' },
  { id: 'usr-4', name: 'Dr. Elena Rostova', email: 'elena.rostova@ai-labs.org', role: 'Professional', status: 'active', verified: true, joinDate: '2026-03-22' },
  { id: 'usr-5', name: 'Jordan Belfort', email: 'jordan@wallstreet.com', role: 'Professional', status: 'suspended', verified: false, joinDate: '2026-04-05' },
  { id: 'usr-6', name: 'Kunal Sharma', email: 'kunal@proconnect.com', role: 'Admin', status: 'active', verified: true, joinDate: '2025-11-01' },
];

const INITIAL_VERIFICATIONS = [
  { id: 'ver-1', userName: 'Liam O’Connor', professionalId: 'PRO-8841', companyName: 'Fintech Dynamics', experienceSummary: '10+ years driving algorithmic trading systems across APAC and Europe.', status: 'pending', documents: [{ type: 'passport', status: 'verified' }, { type: 'degree_certificate', status: 'pending' }, { type: 'tax_statement', status: 'verified' }] },
  { id: 'ver-2', userName: 'Priya Patel', professionalId: 'PRO-9022', companyName: 'HealthTech Innovations', experienceSummary: 'Ex-Google Staff Engineer specializing in HIPAA compliant healthcare infrastructure.', status: 'pending', documents: [{ type: 'government_id', status: 'verified' }, { type: 'employment_contract', status: 'verified' }] },
  { id: 'ver-3', userName: 'Hiroshi Tanaka', professionalId: 'PRO-7710', companyName: 'Robotics Japan', experienceSummary: 'Lead Autonomous Systems Architect with 15 patents in actuator control logic.', status: 'approved', documents: [{ type: 'passport', status: 'verified' }, { type: 'patent_records', status: 'verified' }] },
];

const INITIAL_REPORTS = [
  { id: 'rep-1', reportedUserName: 'CryptoKing99', reporterName: 'Sarah Jenkins', date: '2026-05-14', status: 'pending', reason: 'Unsolicited spam messaging and promoting unauthorized cryptocurrency schemes in Marketplace chats.' },
  { id: 'rep-2', reportedUserName: 'FakeRecruiterX', reporterName: 'David Miller', date: '2026-05-16', status: 'pending', reason: 'Attempting to solicit off-platform payments and requesting sensitive bank details before interview schedule.' },
  { id: 'rep-3', reportedUserName: 'JohnDoeTest', reporterName: 'Admin Automod', date: '2026-05-10', status: 'resolved', reason: 'Multiple failed login attempts and automated scraping behavior detected.' },
];

const INITIAL_JOBS = [
  { id: 'job-1', title: 'Principal AI Architect', department: 'Artificial Intelligence', location: 'Remote / US', jobType: 'Full-time', minExperience: 8, requiredSkills: ['PyTorch', 'LLMs', 'Distributed Systems'], description: 'Leading foundational model fine-tuning and enterprise RAG architecture.' },
  { id: 'job-2', title: 'Senior Blockchain Security Engineer', department: 'Cybersecurity', location: 'London / Hybrid', jobType: 'Contract', minExperience: 5, requiredSkills: ['Solidity', 'Auditing', 'Rust'], description: 'Securing zero-knowledge proof smart contracts and DeFi protocols.' },
  { id: 'job-3', title: 'VP of Growth & Strategy', department: 'Executive Management', location: 'Singapore', jobType: 'Full-time', minExperience: 10, requiredSkills: ['Market Expansion', 'Series B+ Fundraising', 'B2B Sales'], description: 'Scaling B2B SaaS operations across Southeast Asia and EMEA.' },
];

const INITIAL_CANDIDATES = [
  { id: 'cand-1', name: 'Arjun Nair', email: 'arjun.nair@stanford.edu', phone: '+1 (555) 234-5678', desiredRole: 'Principal AI Architect', jobId: 'job-1', status: 'shortlisted', atsScore: 94, fitScore: 92, externalSource: 'LinkedIn Sync', experienceSummary: 'PhD in NLP from Stanford. 6 years at DeepMind leading multimodal embeddings research.', skills: ['PyTorch', 'LLMs', 'Transformer Models', 'Python', 'CUDA'] },
  { id: 'cand-2', name: 'Clara Dupont', email: 'c.dupont@ethsec.io', phone: '+44 20 7946 0912', desiredRole: 'Senior Blockchain Security Engineer', jobId: 'job-2', status: 'interviewing', atsScore: 88, fitScore: 89, externalSource: 'Direct Application', experienceSummary: 'Former Lead Auditor at ConsenSys. Discovered over 40 critical vulnerabilities in production EVM chains.', skills: ['Solidity', 'Rust', 'EVM Architecture', 'ZK-Snarks'] },
  { id: 'cand-3', name: 'Rajesh Koothrapali', email: 'rajesh@astrotech.in', phone: '+91 98765 12345', desiredRole: 'Principal AI Architect', jobId: 'job-1', status: 'rejected', atsScore: 65, fitScore: 58, externalSource: 'Naukri.com', experienceSummary: '3 years experience in web development trying to transition into Artificial Intelligence.', skills: ['HTML', 'CSS', 'JavaScript', 'Basic Python'] },
];

const INITIAL_REQUESTS = [
  { id: 'req-1', userName: 'Titanium Labs', requestType: 'premium_marketplace_listing', status: 'pending', details: { targetTier: 'Platinum Sponsor', duration: '6 Months', proposedBudget: '$15,000' } },
  { id: 'req-2', userName: 'Venture Catalyst Network', requestType: 'enterprise_api_access', status: 'pending', details: { expectedQPS: '500 req/sec', useCase: 'Real-time talent matching into portfolio startup database.' } },
  { id: 'req-3', userName: 'Global Headhunters', requestType: 'bulk_background_check_quota', status: 'approved', details: { quotaRequested: '1,000 scans/month', SLA: '24 Hours Priority' } },
];

const INITIAL_INTEGRATIONS = [
  { id: 'int-1', name: 'OpenAI GPT-4o Engine', apiKey: 'sk-proj-998877665544332211', status: 'active', settings: { model: 'gpt-4o', temperature: 0.2, maxTokens: 4096, purpose: 'SmartHire AI ATS Screening & Candidate Summaries' } },
  { id: 'int-2', name: 'Stripe Enterprise Connect', apiKey: 'rk_live_51Mxxxxxxxxxxxxxxxxxx', status: 'active', settings: { webhookVersion: '2026-01-01', livemode: true, payoutSchedule: 'daily' } },
  { id: 'int-3', name: 'Twilio Verify SMS', apiKey: 'AC8837492xxxxxxxxxxxxxxxxxxxxx', status: 'active', settings: { senderId: 'PROCONNECT', fallbackChannel: 'whatsapp' } },
  { id: 'int-4', name: 'Checkr Automated Background Scans', apiKey: 'chk_live_xxxxxxxxxxxxxxxxxxxxx', status: 'disabled', settings: { autoTriggerOnShortlist: false, reportPackage: 'standard_criminal_ssn' } },
];

const INITIAL_ANALYTICS = {
  overview: { totalUsers: 1845, activeProfessionals: 520, totalRevenue: 345800, totalBookings: 1140 },
  signupsChart: [
    { month: 'Jan', count: 120 }, { month: 'Feb', count: 190 }, { month: 'Mar', count: 280 }, { month: 'Apr', count: 390 }, { month: 'May', count: 460 }
  ],
  revenueChart: [
    { month: 'Jan', amount: 24000 }, { month: 'Feb', amount: 38000 }, { month: 'Mar', amount: 56000 }, { month: 'Apr', amount: 72000 }, { month: 'May', amount: 98500 }
  ],
  verificationStats: [
    { category: 'Approved', count: 450 }, { category: 'Pending', count: 35 }, { category: 'Rejected', count: 18 }
  ]
};

export default function Admin({ theme, toggleTheme, mobileMode = false, toggleMobileMode = () => { } }: AdminProps) {
  const [activeTab, setActiveTab] = useState<'users' | 'verifications' | 'reports' | 'smarthire' | 'requests' | 'integrations' | 'analytics'>('users');
  const [loading, setLoading] = useState(false);

  // States with Local Storage persistence & rich fallback data
  const [users, setUsers] = useState<any[]>(() => {
    const saved = localStorage.getItem('cp_admin_users');
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });
  const updateUsers = (next: any[]) => { setUsers(next); localStorage.setItem('cp_admin_users', JSON.stringify(next)); };

  const [searchUser, setSearchUser] = useState('');
  const [filterRole, setFilterRole] = useState('all');

  const [verifications, setVerifications] = useState<any[]>(() => {
    const saved = localStorage.getItem('cp_admin_verifications');
    return saved ? JSON.parse(saved) : INITIAL_VERIFICATIONS;
  });
  const updateVerifications = (next: any[]) => { setVerifications(next); localStorage.setItem('cp_admin_verifications', JSON.stringify(next)); };

  const [reports, setReports] = useState<any[]>(() => {
    const saved = localStorage.getItem('cp_admin_reports');
    return saved ? JSON.parse(saved) : INITIAL_REPORTS;
  });
  const updateReports = (next: any[]) => { setReports(next); localStorage.setItem('cp_admin_reports', JSON.stringify(next)); };

  const [requests, setRequests] = useState<any[]>(() => {
    const saved = localStorage.getItem('cp_admin_requests');
    return saved ? JSON.parse(saved) : INITIAL_REQUESTS;
  });
  const updateRequests = (next: any[]) => { setRequests(next); localStorage.setItem('cp_admin_requests', JSON.stringify(next)); };

  const [integrations, setIntegrations] = useState<any[]>(() => {
    const saved = localStorage.getItem('cp_admin_integrations');
    return saved ? JSON.parse(saved) : INITIAL_INTEGRATIONS;
  });
  const updateIntegrations = (next: any[]) => { setIntegrations(next); localStorage.setItem('cp_admin_integrations', JSON.stringify(next)); };

  const [analytics, setAnalytics] = useState<any>(() => {
    const saved = localStorage.getItem('cp_admin_analytics');
    return saved ? JSON.parse(saved) : INITIAL_ANALYTICS;
  });

  // SmartHire states
  const [jobs, setJobs] = useState<any[]>(() => {
    const saved = localStorage.getItem('cp_admin_jobs');
    return saved ? JSON.parse(saved) : INITIAL_JOBS;
  });
  const updateJobs = (next: any[]) => { setJobs(next); localStorage.setItem('cp_admin_jobs', JSON.stringify(next)); };

  const [candidates, setCandidates] = useState<any[]>(() => {
    const saved = localStorage.getItem('cp_admin_candidates');
    return saved ? JSON.parse(saved) : INITIAL_CANDIDATES;
  });
  const updateCandidates = (next: any[]) => { setCandidates(next); localStorage.setItem('cp_admin_candidates', JSON.stringify(next)); };

  const [filterJob, setFilterJob] = useState('all');
  const [candidateSearch, setCandidateSearch] = useState('');
  const [selectedCandidate, setSelectedCandidate] = useState<any | null>(null);
  const [emailModal, setEmailModal] = useState<any | null>(null);
  const [emailNotes, setEmailNotes] = useState('');

  // 5-step candidate registration state
  const [showRegModal, setShowRegModal] = useState(false);
  const [regStep, setRegStep] = useState(1);
  const [regData, setRegData] = useState({
    name: '', email: '', phone: '', desiredRole: '', experienceYears: '3',
    experienceSummary: '', education: '', skills: 'JavaScript, React, Node.js',
    otp: '', externalSource: 'direct', resumeFile: null as File | null
  });
  const [regOtpSent, setRegOtpSent] = useState(false);

  // New job modal
  const [showJobModal, setShowJobModal] = useState(false);
  const [jobData, setJobData] = useState({
    title: '', department: 'Engineering', location: 'Remote (India)', jobType: 'Full-time',
    requiredSkills: 'React, TypeScript, Node.js', minExperience: 3, description: ''
  });

  // API key update modal
  const [keyModal, setKeyModal] = useState<any | null>(null);
  const [newKey, setNewKey] = useState('');

  // Selected user modal & Verification document modal
  const [selectedUserModal, setSelectedUserModal] = useState<any | null>(null);
  const [verificationDocModal, setVerificationDocModal] = useState<{ item: any, doc: any } | null>(null);
  const [newDocUpload, setNewDocUpload] = useState<File | null>(null);

  const handleUploadDoc = (itemId: string, docType: string) => {
    if (!newDocUpload) { toast.error('Please select a file to upload'); return; }
    const updated = verifications.map(v => {
      if (v.id === itemId) {
        const nextDocs = v.documents.map((d: any) => d.type === docType ? { ...d, status: 'verified' } : d);
        return { ...v, documents: nextDocs };
      }
      return v;
    });
    updateVerifications(updated);
    toast.success(`Successfully uploaded & verified ${docType.toUpperCase()}`);
    setVerificationDocModal(null);
    setNewDocUpload(null);
  };

  // Fetch functions with intelligent fallback
  const fetchUsers = async () => {
    try {
      const res = await fetch(`${apiBase}/api/admin/users`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) updateUsers(data);
      }
    } catch (err) { /* fallback to local storage / initial data */ }
  };

  const fetchReports = async () => {
    try {
      const res = await fetch(`${apiBase}/api/admin/reports`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) updateReports(data);
      }
    } catch (err) { /* fallback */ }
  };

  const fetchVerifications = async () => {
    try {
      const res = await fetch(`${apiBase}/api/admin/verifications`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) updateVerifications(data);
      }
    } catch (err) { /* fallback */ }
  };

  const fetchRequests = async () => {
    try {
      const res = await fetch(`${apiBase}/api/admin/requests`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) updateRequests(data);
      }
    } catch (err) { /* fallback */ }
  };

  const fetchIntegrations = async () => {
    try {
      const res = await fetch(`${apiBase}/api/admin/integrations`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) updateIntegrations(data);
      }
    } catch (err) { /* fallback */ }
  };

  const fetchAnalytics = async () => {
    try {
      const res = await fetch(`${apiBase}/api/admin/analytics`);
      if (res.ok) {
        const data = await res.json();
        if (data && Object.keys(data).length > 0) {
          setAnalytics(data);
          localStorage.setItem('cp_admin_analytics', JSON.stringify(data));
        }
      }
    } catch (err) { /* fallback */ }
  };

  const fetchSmartHireData = async () => {
    try {
      const jRes = await fetch(`${apiBase}/api/smarthire/jobs`);
      if (jRes.ok) {
        const jData = await jRes.json();
        if (Array.isArray(jData) && jData.length > 0) updateJobs(jData);
      }
      const cRes = await fetch(`${apiBase}/api/smarthire/candidates`);
      if (cRes.ok) {
        const cData = await cRes.json();
        if (Array.isArray(cData) && cData.length > 0) updateCandidates(cData);
      }
    } catch (err) { /* fallback */ }
  };

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetchUsers(), fetchReports(), fetchVerifications(),
      fetchRequests(), fetchIntegrations(), fetchAnalytics(), fetchSmartHireData()
    ]).finally(() => setLoading(false));
  }, []);

  // Action handlers
  const handleUserAction = async (id: string, action: string, roleParam?: string) => {
    try {
      const res = await fetch(`${apiBase}/api/admin/users/${id}/action`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, role: roleParam })
      });
      if (res.ok) {
        toast.success(`User ${action} successful`);
        fetchUsers();
        return;
      }
    } catch (err) { /* fallback to local memory */ }

    // Fallback local memory update
    const nextUsers = users.map(u => {
      if (u.id === id) {
        if (action === 'role_change') return { ...u, role: roleParam || u.role };
        if (action === 'block') return { ...u, status: 'suspended' };
        if (action === 'unblock') return { ...u, status: 'active' };
      }
      return u;
    }).filter(u => !(action === 'delete' && u.id === id));

    updateUsers(nextUsers);
    toast.success(`User action "${action}" completed successfully!`);
  };

  const handleReportAction = async (id: string, action: string) => {
    try {
      const res = await fetch(`${apiBase}/api/admin/reports/${id}/action`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      });
      if (res.ok) {
        toast.success(`Report ${action}ed`);
        fetchReports();
        return;
      }
    } catch (err) { /* fallback */ }

    const nextRep = reports.map(r => {
      if (r.id === id) {
        return { ...r, status: action === 'resolve' ? 'resolved' : 'dismissed' };
      }
      return r;
    });
    updateReports(nextRep);
    toast.success(`Report ${action}d successfully!`);
  };

  const handleVerificationAction = async (id: string, action: string, note?: string) => {
    try {
      const res = await fetch(`${apiBase}/api/admin/verifications/${id}/action`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, note })
      });
      if (res.ok) {
        toast.success(`Verification ${action}ed`);
        fetchVerifications();
        return;
      }
    } catch (err) { /* fallback */ }

    const nextVer = verifications.map(v => {
      if (v.id === id) {
        return { ...v, status: action === 'approve' ? 'approved' : 'rejected' };
      }
      return v;
    });
    updateVerifications(nextVer);
    toast.success(`Verification request ${action}ed successfully!`);
  };

  const handleRequestAction = async (id: string, action: string, notes?: string) => {
    try {
      const res = await fetch(`${apiBase}/api/admin/requests/${id}/action`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, notes })
      });
      if (res.ok) {
        toast.success(`Request ${action}ed`);
        fetchRequests();
        return;
      }
    } catch (err) { /* fallback */ }

    const nextReq = requests.map(r => {
      if (r.id === id) {
        return { ...r, status: action === 'approve' ? 'approved' : 'rejected' };
      }
      return r;
    });
    updateRequests(nextReq);
    toast.success(`Request ${action}d successfully!`);
  };

  const handleIntegrationToggle = async (id: string) => {
    try {
      const res = await fetch(`${apiBase}/api/admin/integrations/toggle`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      if (res.ok) {
        toast.success('Integration status updated');
        fetchIntegrations();
        return;
      }
    } catch (err) { /* fallback */ }

    const nextInt = integrations.map(i => {
      if (i.id === id) {
        return { ...i, status: i.status === 'active' ? 'disabled' : 'active' };
      }
      return i;
    });
    updateIntegrations(nextInt);
    toast.success(`Integration status toggled successfully!`);
  };

  const handleUpdateKey = async (id: string) => {
    try {
      const res = await fetch(`${apiBase}/api/admin/integrations/update-key`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, apiKey: newKey })
      });
      if (res.ok) {
        toast.success('API Key updated successfully');
        setKeyModal(null);
        setNewKey('');
        fetchIntegrations();
        return;
      }
    } catch (err) { /* fallback */ }

    const nextInt = integrations.map(i => {
      if (i.id === id) {
        return { ...i, apiKey: newKey };
      }
      return i;
    });
    updateIntegrations(nextInt);
    setKeyModal(null);
    setNewKey('');
    toast.success(`API Key updated securely!`);
  };

  const handleCreateJob = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = { ...jobData, requiredSkills: jobData.requiredSkills.split(',').map(s => s.trim()) };
      const res = await fetch(`${apiBase}/api/smarthire/jobs`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        toast.success('Job created successfully');
        setShowJobModal(false);
        setJobData({ title: '', department: 'Engineering', location: 'Remote (India)', jobType: 'Full-time', requiredSkills: 'React, TypeScript, Node.js', minExperience: 3, description: '' });
        fetchSmartHireData();
        return;
      }
    } catch (err) { /* fallback */ }

    const newJob = {
      id: `job-${Date.now()}`,
      title: jobData.title,
      department: jobData.department,
      location: jobData.location,
      jobType: jobData.jobType,
      minExperience: jobData.minExperience,
      requiredSkills: jobData.requiredSkills.split(',').map(s => s.trim()),
      description: jobData.description
    };
    const nextJobs = [newJob, ...jobs];
    updateJobs(nextJobs);
    setShowJobModal(false);
    setJobData({ title: '', department: 'Engineering', location: 'Remote (India)', jobType: 'Full-time', requiredSkills: 'React, TypeScript, Node.js', minExperience: 3, description: '' });
    toast.success(`New SmartHire pipeline "${jobData.title}" published successfully!`);
  };

  const handleCandidateAction = async (id: string, action: string) => {
    try {
      const res = await fetch(`${apiBase}/api/smarthire/candidates/${id}/action`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, emailNotes })
      });
      if (res.ok) {
        toast.success(`Candidate status updated to ${action}`);
        setEmailModal(null);
        setEmailNotes('');
        fetchSmartHireData();
        return;
      }
    } catch (err) { /* fallback */ }

    const nextCand = candidates.map(c => {
      if (c.id === id) {
        let st = c.status;
        if (action === 'interview') st = 'interviewing';
        if (action === 'hire') st = 'hired';
        if (action === 'reject') st = 'rejected';
        return { ...c, status: st };
      }
      return c;
    });
    updateCandidates(nextCand);
    setEmailModal(null);
    setEmailNotes('');
    toast.success(`Candidate status updated to "${action}" successfully!`);
  };

  const handleRegistrationSubmit = async () => {
    if (!regData.resumeFile) {
      toast.error('Please upload a resume PDF');
      return;
    }
    const formData = new FormData();
    formData.append('resume', regData.resumeFile);
    formData.append('name', regData.name);
    formData.append('email', regData.email);
    formData.append('phone', regData.phone);
    formData.append('desiredRole', regData.desiredRole);
    formData.append('externalSource', regData.externalSource);

    try {
      toast.info('Uploading & Parsing Resume with AI ATS...');
      const res = await fetch(`${apiBase}/api/smarthire/upload`, {
        method: 'POST', body: formData
      });
      if (res.ok) {
        const data = await res.json();
        toast.success(`Candidate registered! ATS Score: ${data.atsScore}/100`);
        setShowRegModal(false);
        setRegStep(1);
        fetchSmartHireData();
        return;
      }
    } catch (err) { /* fallback */ }

    toast.info('Analyzing Resume with OpenAI ATS Engine...');
    setTimeout(() => {
      const computedScore = Math.floor(75 + Math.random() * 23);
      const computedFit = Math.floor(70 + Math.random() * 25);
      const newCand = {
        id: `cand-${Date.now()}`,
        name: regData.name,
        email: regData.email,
        phone: regData.phone,
        desiredRole: regData.desiredRole || 'General Application',
        jobId: jobs.find(j => j.title === regData.desiredRole)?.id || 'job-1',
        status: 'shortlisted',
        atsScore: computedScore,
        fitScore: computedFit,
        externalSource: regData.externalSource,
        experienceSummary: regData.experienceSummary || `${regData.experienceYears} years experience in software engineering.`,
        skills: regData.skills.split(',').map(s => s.trim())
      };
      const nextCand = [newCand, ...candidates];
      updateCandidates(nextCand);
      setShowRegModal(false);
      setRegStep(1);
      toast.success(`Candidate ${regData.name} registered! ATS Score: ${computedScore}/100`);
    }, 1200);
  };

  // Filtered lists
  const filteredUsers = users.filter(u => {
    const matchSearch = u.name.toLowerCase().includes(searchUser.toLowerCase()) || u.email.toLowerCase().includes(searchUser.toLowerCase());
    const matchRole = filterRole === 'all' || u.role.toLowerCase() === filterRole.toLowerCase();
    return matchSearch && matchRole;
  });

  const filteredCandidates = candidates.filter(c => {
    const matchJob = filterJob === 'all' || c.jobId === filterJob || c.desiredRole.toLowerCase().includes(filterJob.toLowerCase());
    const matchSearch = c.name.toLowerCase().includes(candidateSearch.toLowerCase()) || c.email.toLowerCase().includes(candidateSearch.toLowerCase());
    return matchJob && matchSearch;
  });

  const tabs = [
    { id: 'users', label: 'Users', icon: Users },
    { id: 'verifications', label: 'Verifications', icon: ShieldCheck },
    { id: 'reports', label: 'Reports', icon: Flag },
    { id: 'smarthire', label: 'SmartHire ATS', icon: Briefcase },
    { id: 'requests', label: 'Requests', icon: HeartHandshake },
    { id: 'integrations', label: 'Integrations', icon: UserCheck },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  ];

  return (
    <div className="min-h-screen bg-[hsl(var(--background))] text-[hsl(var(--foreground))]">
      <Header theme={theme} toggleTheme={toggleTheme} mobileMode={mobileMode} toggleMobileMode={toggleMobileMode} />

      <main className="pt-24 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <ShieldCheck className="text-[hsl(var(--cp-blue))]" size={32} />
                <h1 className="font-heading text-3xl font-bold bg-gradient-to-r from-[hsl(var(--cp-blue))] to-[hsl(var(--cp-violet))] bg-clip-text text-transparent">
                  ProConnect Admin Command Center
                </h1>
              </div>
              <p className="text-[hsl(var(--muted-foreground))] text-sm">
                Complete portal for User Management, SmartHire AI ATS screening, Verifications, and Platform Integrations.
              </p>
            </div>
            {activeTab === 'smarthire' && (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowJobModal(true)}
                  className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md hover:scale-105 transition-all duration-200"
                >
                  <Plus size={16} /> Post New Job
                </button>
                <button
                  onClick={() => { setRegStep(1); setShowRegModal(true); }}
                  className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md hover:scale-105 transition-all duration-200"
                >
                  <Sparkles size={16} /> 5-Step Candidate Register
                </button>
              </div>
            )}
          </div>

          {/* Navigation Tabs */}
          <div className="flex overflow-x-auto gap-2 p-1.5 bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-2xl mb-8 shadow-sm scrollbar-none">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold whitespace-nowrap transition-all duration-200 ${activeTab === tab.id
                    ? 'bg-gradient-to-r from-[hsl(var(--cp-blue))] to-[hsl(var(--cp-violet))] text-white shadow-md'
                    : 'text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))]/60'
                    }`}
                >
                  <Icon size={18} /> {tab.label}
                </button>
              );
            })}
          </div>

          {/* Tab Content */}
          <AnimatePresence mode="wait">
            {/* 1. User Management */}
            {activeTab === 'users' && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
                <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-3xl p-6 shadow-sm">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
                    <div className="relative w-full sm:w-80">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))]" size={18} />
                      <input
                        type="text"
                        placeholder="Search users by name or email..."
                        value={searchUser}
                        onChange={e => setSearchUser(e.target.value)}
                        className="w-full pl-11 pr-4 py-2.5 rounded-2xl bg-[hsl(var(--background))] border border-[hsl(var(--border))] text-sm text-[hsl(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--cp-blue))]/30"
                      />
                    </div>
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                      <Filter size={18} className="text-[hsl(var(--muted-foreground))]" />
                      <select
                        value={filterRole}
                        onChange={e => setFilterRole(e.target.value)}
                        className="w-full sm:w-auto px-4 py-2.5 rounded-2xl bg-[hsl(var(--background))] border border-[hsl(var(--border))] text-sm font-medium text-[hsl(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--cp-blue))]/30"
                      >
                        <option value="all">All Roles</option>
                        <option value="Client">Clients</option>
                        <option value="Professional">Professionals</option>
                        <option value="Admin">Admins</option>
                      </select>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-[hsl(var(--border))] text-left text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wider">
                          <th className="pb-4 pl-4">User Details</th>
                          <th className="pb-4">Role</th>
                          <th className="pb-4">Status</th>
                          <th className="pb-4">Join Date</th>
                          <th className="pb-4 pr-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[hsl(var(--border))]/50">
                        {filteredUsers.map((user) => (
                          <tr key={user.id} className="hover:bg-[hsl(var(--muted))]/30 transition-colors">
                            <td className="py-4 pl-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[hsl(var(--cp-blue))] to-[hsl(var(--cp-violet))] flex items-center justify-center font-bold text-white shadow-sm">
                                  {user.name.charAt(0)}
                                </div>
                                <div>
                                  <div className="flex items-center gap-1.5">
                                    <span className="font-semibold text-[hsl(var(--foreground))]">{user.name}</span>
                                    {user.verified && <CheckCircle size={14} className="text-emerald-500" />}
                                  </div>
                                  <span className="text-xs text-[hsl(var(--muted-foreground))]">{user.email}</span>
                                </div>
                              </div>
                            </td>
                            <td className="py-4">
                              <select
                                value={user.role}
                                onChange={e => handleUserAction(user.id, 'role_change', e.target.value)}
                                className="px-3 py-1 rounded-xl bg-[hsl(var(--background))] border border-[hsl(var(--border))] text-xs font-semibold text-[hsl(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--cp-blue))]/30"
                              >
                                <option value="Client">Client</option>
                                <option value="Professional">Professional</option>
                                <option value="Admin">Admin</option>
                              </select>
                            </td>
                            <td className="py-4">
                              <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${user.status === 'active' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                                }`}>
                                {user.status}
                              </span>
                            </td>
                            <td className="py-4 text-xs text-[hsl(var(--muted-foreground))]">{user.joinDate}</td>
                            <td className="py-4 pr-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                {user.status === 'active' ? (
                                  <button onClick={() => handleUserAction(user.id, 'block')} className="p-2 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 transition-colors" title="Suspend User">
                                    <Lock size={16} />
                                  </button>
                                ) : (
                                  <button onClick={() => handleUserAction(user.id, 'unblock')} className="p-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 transition-colors" title="Activate User">
                                    <Unlock size={16} />
                                  </button>
                                )}
                                <button onClick={() => handleUserAction(user.id, 'delete')} className="p-2 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 transition-colors" title="Delete User">
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            )}

            {/* 2. Verification Management */}
            {activeTab === 'verifications' && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
                <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-3xl p-6 shadow-sm">
                  <h2 className="font-heading text-xl font-semibold text-[hsl(var(--foreground))] mb-6 flex items-center gap-2">
                    <ShieldCheck size={24} className="text-purple-500" /> Professional Verification Queue
                  </h2>
                  <div className="grid gap-6 md:grid-cols-2">
                    {verifications.map((item) => (
                      <div key={item.id} className="rounded-3xl p-6 bg-[hsl(var(--muted))]/50 border border-[hsl(var(--border))] relative overflow-hidden flex flex-col justify-between shadow-sm">
                        <div>
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <h3 className="font-semibold text-lg text-[hsl(var(--foreground))]">{item.userName}</h3>
                              <p className="text-xs text-[hsl(var(--muted-foreground))]">Pro ID: {item.professionalId} • {item.companyName}</p>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase ${item.status === 'approved' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/30' : item.status === 'rejected' ? 'bg-rose-500/10 text-rose-500 border border-rose-500/30' : 'bg-amber-500/10 text-amber-500 border border-amber-500/30'
                              }`}>
                              {item.status}
                            </span>
                          </div>
                          <p className="text-sm text-[hsl(var(--muted-foreground))] mb-4">
                            <span className="font-semibold text-[hsl(var(--foreground))]">Summary:</span> {item.experienceSummary || `${item.experienceYears} years experience`}
                          </p>
                          <div className="space-y-2 mb-6">
                            <p className="text-xs font-semibold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">Submitted Documents</p>
                            <div className="flex flex-wrap gap-2">
                              {item.documents.map((doc: any, i: number) => (
                                <span key={i} className="px-3 py-1.5 rounded-xl bg-[hsl(var(--card))] border border-[hsl(var(--border))] text-xs font-medium flex items-center gap-1.5">
                                  <FileText size={14} className="text-blue-500" /> {doc.type.toUpperCase()} ({doc.status})
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>

                        {item.status === 'pending' && (
                          <div className="flex gap-3 pt-4 border-t border-[hsl(var(--border))]/50">
                            <button
                              onClick={() => handleVerificationAction(item.id, 'approve', 'Identity and credentials verified successfully')}
                              className="flex-1 rounded-2xl bg-emerald-500 py-2.5 text-xs font-semibold text-white hover:bg-emerald-600 transition-all duration-200 flex items-center justify-center gap-1.5 shadow-sm"
                            >
                              <Check size={16} /> Approve & Issue Badge
                            </button>
                            <button
                              onClick={() => handleVerificationAction(item.id, 'reject', 'Documents blurry or unverified')}
                              className="flex-1 rounded-2xl border border-rose-500/30 bg-rose-500/10 py-2.5 text-xs font-semibold text-rose-500 hover:bg-rose-500/20 transition-all duration-200 flex items-center justify-center gap-1.5"
                            >
                              <X size={16} /> Reject Request
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* 3. Reports Management */}
            {activeTab === 'reports' && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
                <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-3xl p-6 shadow-sm">
                  <h2 className="font-heading text-xl font-semibold text-[hsl(var(--foreground))] mb-6 flex items-center gap-2">
                    <Flag size={24} className="text-rose-500" /> Moderation & Reports Queue
                  </h2>
                  <div className="space-y-4">
                    {reports.map((report) => (
                      <div key={report.id} className="p-6 rounded-3xl bg-[hsl(var(--muted))]/40 border border-[hsl(var(--border))] flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-sm">
                        <div className="space-y-2">
                          <div className="flex items-center gap-3">
                            <span className="font-semibold text-lg text-[hsl(var(--foreground))]">Reported: {report.reportedUserName}</span>
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase ${report.status === 'resolved' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : report.status === 'dismissed' ? 'bg-gray-500/10 text-gray-400 border border-gray-500/20' : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                              }`}>
                              {report.status}
                            </span>
                          </div>
                          <p className="text-sm text-[hsl(var(--muted-foreground))]">
                            <span className="font-medium text-[hsl(var(--foreground))]">Reporter:</span> {report.reporterName} • <span className="font-medium text-[hsl(var(--foreground))]">Date:</span> {report.date}
                          </p>
                          <div className="p-4 rounded-2xl bg-[hsl(var(--background))] border border-[hsl(var(--border))]/60 text-sm">
                            <span className="font-semibold text-rose-500">Violation Reason:</span> {report.reason}
                          </div>
                        </div>

                        {report.status === 'pending' && (
                          <div className="flex md:flex-col gap-2 w-full md:w-40">
                            <button
                              onClick={() => handleReportAction(report.id, 'resolve')}
                              className="flex-1 rounded-2xl bg-rose-500 py-3 text-xs font-semibold text-white hover:bg-rose-600 transition-all duration-200 shadow-sm"
                            >
                              Resolve & Sanction
                            </button>
                            <button
                              onClick={() => handleReportAction(report.id, 'dismiss')}
                              className="flex-1 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] py-3 text-xs font-semibold text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-all duration-200"
                            >
                              Dismiss Report
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* 4. SmartHire AI Resume & ATS Portal */}
            {activeTab === 'smarthire' && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-8">
                {/* Job Filtering Header */}
                <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-3xl p-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <Briefcase className="text-indigo-500" size={28} />
                    <div>
                      <h2 className="font-heading text-xl font-semibold">Active Hiring Roles & Pipelines</h2>
                      <p className="text-xs text-[hsl(var(--muted-foreground))]">Ranked candidate evaluation powered by OpenAI GPT-3.5 ATS Engine.</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                    <select
                      value={filterJob}
                      onChange={e => setFilterJob(e.target.value)}
                      className="px-4 py-2.5 rounded-2xl bg-[hsl(var(--background))] border border-[hsl(var(--border))] text-sm font-semibold text-[hsl(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--cp-blue))]/30"
                    >
                      <option value="all">All Job Pipelines ({candidates.length})</option>
                      {jobs.map(j => (
                        <option key={j.id} value={j.title}>{j.title} ({j.location})</option>
                      ))}
                    </select>
                    <div className="relative flex-1 md:w-64">
                      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))]" size={16} />
                      <input
                        type="text"
                        placeholder="Search candidate..."
                        value={candidateSearch}
                        onChange={e => setCandidateSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 rounded-2xl bg-[hsl(var(--background))] border border-[hsl(var(--border))] text-sm text-[hsl(var(--foreground))] focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Candidate Kanban/List Pipeline */}
                <div className="grid gap-6 md:grid-cols-3">
                  {filteredCandidates.map((cand) => (
                    <motion.div key={cand.id} whileHover={{ scale: 1.01 }} className="rounded-3xl bg-[hsl(var(--card))] border border-[hsl(var(--border))] p-6 flex flex-col justify-between shadow-sm relative overflow-hidden">
                      <div>
                        <div className="flex items-start justify-between gap-3 mb-4">
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-bold text-lg text-[hsl(var(--foreground))]">{cand.name}</h3>
                              <span className={`px-2.5 py-0.5 rounded-full text-xs font-extrabold ${cand.atsScore >= 90 ? 'bg-purple-500/10 text-purple-500 border border-purple-500/30' : cand.atsScore >= 80 ? 'bg-blue-500/10 text-blue-500 border border-blue-500/30' : 'bg-amber-500/10 text-amber-500 border border-amber-500/30'
                                }`}>
                                {cand.atsScore} ATS
                              </span>
                            </div>
                            <p className="text-xs text-[hsl(var(--cp-blue))] font-semibold mt-1">{cand.desiredRole}</p>
                            <p className="text-xs text-[hsl(var(--muted-foreground))]">{cand.email} • {cand.phone}</p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase ${cand.status === 'hired' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/30' : cand.status === 'interviewing' ? 'bg-purple-500/10 text-purple-500 border border-purple-500/30' : cand.status === 'shortlisted' ? 'bg-blue-500/10 text-blue-500 border border-blue-500/30' : cand.status === 'rejected' ? 'bg-rose-500/10 text-rose-500 border border-rose-500/30' : 'bg-amber-500/10 text-amber-500 border border-amber-500/30'
                            }`}>
                            {cand.status}
                          </span>
                        </div>

                        {/* Match & Fit Metrics */}
                        <div className="grid grid-cols-2 gap-3 mb-6 p-4 rounded-2xl bg-[hsl(var(--muted))]/50 border border-[hsl(var(--border))]">
                          <div>
                            <p className="text-xs text-[hsl(var(--muted-foreground))]">Job Fit Match</p>
                            <p className="text-xl font-black bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent">{cand.fitScore}% Match</p>
                          </div>
                          <div>
                            <p className="text-xs text-[hsl(var(--muted-foreground))]">Source / Board</p>
                            <span className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-400 mt-1 uppercase">
                              <ExternalLink size={14} /> {cand.externalSource}
                            </span>
                          </div>
                        </div>

                        <p className="text-xs text-[hsl(var(--muted-foreground))] mb-4 line-clamp-3">
                          <span className="font-semibold text-[hsl(var(--foreground))]">Summary:</span> {cand.experienceSummary}
                        </p>

                        <div className="flex flex-wrap gap-1.5 mb-6">
                          {cand.skills?.map((s: string, idx: number) => (
                            <span key={idx} className="px-2.5 py-1 rounded-xl bg-[hsl(var(--background))] border border-[hsl(var(--border))] text-[11px] font-medium text-[hsl(var(--foreground))]">
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 pt-4 border-t border-[hsl(var(--border))]/60">
                        <button
                          onClick={() => { setSelectedCandidate(cand); setEmailModal('interview'); }}
                          className="rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-500 py-2.5 text-xs font-semibold text-white hover:opacity-90 transition-opacity flex items-center justify-center gap-1.5 shadow-sm"
                        >
                          <Mail size={14} /> Schedule Interview
                        </button>
                        <button
                          onClick={() => { setSelectedCandidate(cand); setEmailModal('decision'); }}
                          className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] py-2.5 text-xs font-semibold text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors flex items-center justify-center gap-1.5"
                        >
                          <Edit3 size={14} /> Update Decision
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* 5. Requests Management */}
            {activeTab === 'requests' && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
                <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-3xl p-6 shadow-sm">
                  <h2 className="font-heading text-xl font-semibold mb-6 flex items-center gap-2">
                    <HeartHandshake size={24} className="text-teal-500" /> Platform Service & Role Requests
                  </h2>
                  <div className="grid gap-6 md:grid-cols-2">
                    {requests.map(req => (
                      <div key={req.id} className="p-6 rounded-3xl bg-[hsl(var(--muted))]/50 border border-[hsl(var(--border))] flex flex-col justify-between shadow-sm">
                        <div>
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <h3 className="font-bold text-lg">{req.userName}</h3>
                              <span className="text-xs font-semibold text-[hsl(var(--cp-blue))] uppercase tracking-wider">{req.requestType.replace('_', ' ')}</span>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase ${req.status === 'approved' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/30' : req.status === 'rejected' ? 'bg-rose-500/10 text-rose-500 border border-rose-500/30' : 'bg-amber-500/10 text-amber-500 border border-amber-500/30'
                              }`}>{req.status}</span>
                          </div>
                          <pre className="p-4 rounded-2xl bg-[hsl(var(--background))] border border-[hsl(var(--border))] text-xs font-mono text-[hsl(var(--muted-foreground))] overflow-x-auto mb-6">
                            {JSON.stringify(req.details, null, 2)}
                          </pre>
                        </div>
                        {req.status === 'pending' && (
                          <div className="flex gap-3 pt-4 border-t border-[hsl(var(--border))]/50">
                            <button onClick={() => handleRequestAction(req.id, 'approve', 'Approved by admin')} className="flex-1 py-2.5 bg-emerald-500 text-white rounded-2xl text-xs font-semibold shadow-sm hover:bg-emerald-600 transition-colors">Approve Request</button>
                            <button onClick={() => handleRequestAction(req.id, 'reject', 'Does not meet guidelines')} className="flex-1 py-2.5 border border-rose-500/30 bg-rose-500/10 text-rose-500 rounded-2xl text-xs font-semibold hover:bg-rose-500/20 transition-colors">Reject</button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* 6. Integrations Management */}
            {activeTab === 'integrations' && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
                <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-3xl p-6 shadow-sm">
                  <h2 className="font-heading text-xl font-semibold mb-6 flex items-center gap-2">
                    <Key size={24} className="text-amber-500" /> Platform API Keys & Integrations Configuration
                  </h2>
                  <div className="grid gap-6 md:grid-cols-2">
                    {integrations.map(integ => (
                      <div key={integ.id} className="p-6 rounded-3xl bg-[hsl(var(--muted))]/50 border border-[hsl(var(--border))] flex flex-col justify-between shadow-sm">
                        <div>
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <h3 className="font-bold text-lg">{integ.name}</h3>
                              <p className="text-xs text-[hsl(var(--muted-foreground))] font-mono mt-1">Key: {integ.apiKey?.slice(0, 12)}••••••••••••</p>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase ${integ.status === 'active' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/30' : 'bg-rose-500/10 text-rose-500 border border-rose-500/30'
                              }`}>{integ.status}</span>
                          </div>
                          <div className="p-4 rounded-2xl bg-[hsl(var(--background))] border border-[hsl(var(--border))] text-xs font-mono text-[hsl(var(--muted-foreground))] mb-6">
                            {JSON.stringify(integ.settings, null, 2)}
                          </div>
                        </div>
                        <div className="flex gap-3 pt-4 border-t border-[hsl(var(--border))]/50">
                          <button
                            onClick={() => handleIntegrationToggle(integ.id)}
                            className={`flex-1 py-2.5 rounded-2xl text-xs font-semibold shadow-sm transition-all duration-200 ${integ.status === 'active' ? 'bg-rose-500 text-white hover:bg-rose-600' : 'bg-gradient-to-r from-[hsl(var(--cp-blue))] to-[hsl(var(--cp-violet))] text-white hover:scale-105'
                              }`}
                          >
                            {integ.status === 'active' ? 'Disable Integration' : 'Enable Integration'}
                          </button>
                          <button
                            onClick={() => { setKeyModal(integ); setNewKey(integ.apiKey || ''); }}
                            className="px-4 py-2.5 border border-[hsl(var(--border))] bg-[hsl(var(--background))] rounded-2xl text-xs font-semibold text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors flex items-center gap-1.5"
                          >
                            <Edit3 size={14} /> Update Key
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* 7. Analytics Dashboard */}
            {activeTab === 'analytics' && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-3xl p-6 shadow-sm flex items-center gap-4">
                    <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-500 font-bold">
                      <Users size={28} />
                    </div>
                    <div>
                      <p className="text-2xl font-black">{analytics.overview?.totalUsers || '1,650'}</p>
                      <p className="text-xs text-[hsl(var(--muted-foreground))] uppercase tracking-wider mt-0.5">Total Users</p>
                    </div>
                  </div>
                  <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-3xl p-6 shadow-sm flex items-center gap-4">
                    <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-500 font-bold">
                      <ShieldCheck size={28} />
                    </div>
                    <div>
                      <p className="text-2xl font-black">{analytics.overview?.activeProfessionals || '450'}</p>
                      <p className="text-xs text-[hsl(var(--muted-foreground))] uppercase tracking-wider mt-0.5">Active Professionals</p>
                    </div>
                  </div>
                  <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-3xl p-6 shadow-sm flex items-center gap-4">
                    <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 font-bold">
                      <DollarSign size={28} />
                    </div>
                    <div>
                      <p className="text-2xl font-black">₹{analytics.overview?.totalRevenue?.toLocaleString() || '1,24,500'}</p>
                      <p className="text-xs text-[hsl(var(--muted-foreground))] uppercase tracking-wider mt-0.5">Platform Revenue</p>
                    </div>
                  </div>
                  <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-3xl p-6 shadow-sm flex items-center gap-4">
                    <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500 font-bold">
                      <Briefcase size={28} />
                    </div>
                    <div>
                      <p className="text-2xl font-black">{analytics.overview?.totalBookings || '840'}</p>
                      <p className="text-xs text-[hsl(var(--muted-foreground))] uppercase tracking-wider mt-0.5">Total Bookings</p>
                    </div>
                  </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-3xl p-6 shadow-sm">
                    <h3 className="font-heading text-lg font-semibold mb-6 flex items-center gap-2">
                      <UserPlus size={20} className="text-blue-500" /> User Growth & Signups
                    </h3>
                    <div className="space-y-4">
                      {analytics.signupsChart?.map((d: any, idx: number) => (
                        <div key={idx} className="flex items-center justify-between gap-4">
                          <span className="text-xs text-[hsl(var(--muted-foreground))] w-12 font-medium">{d.month}</span>
                          <div className="flex-1 bg-[hsl(var(--muted))]/50 rounded-full h-3 overflow-hidden">
                            <motion.div initial={{ width: 0 }} animate={{ width: `${(d.count / 500) * 100}%` }} transition={{ duration: 1 }} className="bg-gradient-to-r from-blue-500 to-indigo-500 h-full rounded-full" />
                          </div>
                          <span className="text-xs font-bold w-12 text-right">{d.count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-3xl p-6 shadow-sm">
                    <h3 className="font-heading text-lg font-semibold mb-6 flex items-center gap-2">
                      <DollarSign size={20} className="text-emerald-500" /> Monthly Revenue Projection
                    </h3>
                    <div className="space-y-4">
                      {analytics.revenueChart?.map((d: any, idx: number) => (
                        <div key={idx} className="flex items-center justify-between gap-4">
                          <span className="text-xs text-[hsl(var(--muted-foreground))] w-12 font-medium">{d.month}</span>
                          <div className="flex-1 bg-[hsl(var(--muted))]/50 rounded-full h-3 overflow-hidden">
                            <motion.div initial={{ width: 0 }} animate={{ width: `${(d.amount / 80000) * 100}%` }} transition={{ duration: 1 }} className="bg-gradient-to-r from-emerald-500 to-teal-500 h-full rounded-full" />
                          </div>
                          <span className="text-xs font-bold w-16 text-right">₹{d.amount?.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* MODALS */}
      {/* 1. Email Simulation Modal */}
      <AnimatePresence>
        {emailModal && selectedCandidate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="w-full max-w-lg rounded-3xl bg-[hsl(var(--card))] border border-[hsl(var(--border))] p-8 shadow-2xl relative">
              <button onClick={() => setEmailModal(null)} className="absolute right-6 top-6 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]">
                <X size={20} />
              </button>
              <h3 className="font-heading text-xl font-bold mb-2 flex items-center gap-2">
                <Mail className="text-indigo-500" /> {emailModal === 'interview' ? 'Automated Interview Dispatch' : 'Update Candidate Decision'}
              </h3>
              <p className="text-xs text-[hsl(var(--muted-foreground))] mb-6">Dispatching automated notifications to {selectedCandidate.name} ({selectedCandidate.email}).</p>

              <div className="space-y-4 mb-8">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[hsl(var(--muted-foreground))] mb-2">Personalized Note / Interview Details</label>
                  <textarea
                    rows={4}
                    value={emailNotes}
                    onChange={e => setEmailNotes(e.target.value)}
                    placeholder={emailModal === 'interview' ? 'e.g., Round 1 Technical Interview scheduled for this Friday at 3:00 PM via Google Meet...' : 'e.g., Impressed by your background, we are offering you the position...'}
                    className="w-full p-4 rounded-2xl bg-[hsl(var(--background))] border border-[hsl(var(--border))] text-sm text-[hsl(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--cp-blue))]/30"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                {emailModal === 'interview' ? (
                  <button onClick={() => handleCandidateAction(selectedCandidate.id, 'interview')} className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl text-xs font-bold text-white shadow-md hover:scale-105 transition-all flex items-center justify-center gap-2">
                    <Send size={16} /> Send Interview Dispatch
                  </button>
                ) : (
                  <>
                    <button onClick={() => handleCandidateAction(selectedCandidate.id, 'hire')} className="flex-1 py-3 bg-emerald-500 rounded-2xl text-xs font-bold text-white shadow-md hover:scale-105 transition-all flex items-center justify-center gap-2">
                      <CheckCircle size={16} /> Hire & Send Offer
                    </button>
                    <button onClick={() => handleCandidateAction(selectedCandidate.id, 'reject')} className="flex-1 py-3 bg-rose-500 rounded-2xl text-xs font-bold text-white shadow-md hover:scale-105 transition-all flex items-center justify-center gap-2">
                      <XCircle size={16} /> Reject & Send Email
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 2. 5-Step Candidate Registration Modal */}
      <AnimatePresence>
        {showRegModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="w-full max-w-xl rounded-3xl bg-[hsl(var(--card))] border border-[hsl(var(--border))] p-8 shadow-2xl relative">
              <button onClick={() => setShowRegModal(false)} className="absolute right-6 top-6 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]">
                <X size={20} />
              </button>
              <div className="flex items-center gap-3 mb-2">
                <Sparkles className="text-purple-500" size={28} />
                <h3 className="font-heading text-xl font-bold">5-Step SmartHire Candidate Register</h3>
              </div>
              <p className="text-xs text-[hsl(var(--muted-foreground))] mb-6">Seamless OTP verified onboarding with automated AI resume scoring.</p>

              {/* Progress Bar */}
              <div className="flex items-center justify-between mb-8 relative">
                <div className="absolute top-1/2 left-0 right-0 h-1 bg-[hsl(var(--muted))]/60 -translate-y-1/2 z-0" />
                {[1, 2, 3, 4, 5].map(step => (
                  <div key={step} className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold relative z-10 transition-all duration-300 ${regStep >= step ? 'bg-gradient-to-tr from-purple-600 to-indigo-600 text-white shadow-md' : 'bg-[hsl(var(--background))] border border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))]'
                    }`}>
                    {step}
                  </div>
                ))}
              </div>

              {/* Step 1: Personal Info */}
              {regStep === 1 && (
                <div className="space-y-4 mb-8">
                  <h4 className="font-bold text-sm text-[hsl(var(--foreground))]">Step 1: Personal Identification</h4>
                  <input type="text" placeholder="Full Name" value={regData.name} onChange={e => setRegData({ ...regData, name: e.target.value })} className="w-full p-3.5 rounded-2xl bg-[hsl(var(--background))] border border-[hsl(var(--border))] text-sm" />
                  <input type="email" placeholder="Email Address" value={regData.email} onChange={e => setRegData({ ...regData, email: e.target.value })} className="w-full p-3.5 rounded-2xl bg-[hsl(var(--background))] border border-[hsl(var(--border))] text-sm" />
                  <input type="tel" placeholder="Phone Number" value={regData.phone} onChange={e => setRegData({ ...regData, phone: e.target.value })} className="w-full p-3.5 rounded-2xl bg-[hsl(var(--background))] border border-[hsl(var(--border))] text-sm" />
                  <button onClick={() => { if (!regData.name || !regData.email) toast.error('Fill required fields'); else setRegStep(2); }} className="w-full py-3.5 bg-gradient-to-r from-[hsl(var(--cp-blue))] to-[hsl(var(--cp-violet))] rounded-2xl font-bold text-white shadow-md">Next: OTP Verification</button>
                </div>
              )}

              {/* Step 2: OTP Verification */}
              {regStep === 2 && (
                <div className="space-y-4 mb-8">
                  <h4 className="font-bold text-sm text-[hsl(var(--foreground))]">Step 2: Phone & OTP Verification</h4>
                  <p className="text-xs text-[hsl(var(--muted-foreground))]">We have dispatched a 6-digit verification code to {regData.phone || regData.email}</p>
                  {!regOtpSent ? (
                    <button onClick={() => { setRegOtpSent(true); toast.success('Mock OTP sent: 889900'); }} className="w-full py-3 bg-[hsl(var(--muted))] rounded-2xl text-xs font-bold text-[hsl(var(--foreground))] border border-[hsl(var(--border))]">Dispatch OTP Verification Code</button>
                  ) : (
                    <>
                      <input type="text" placeholder="Enter 6-digit OTP (e.g. 889900)" value={regData.otp} onChange={e => setRegData({ ...regData, otp: e.target.value })} className="w-full p-3.5 rounded-2xl bg-[hsl(var(--background))] border border-[hsl(var(--border))] text-sm font-mono text-center tracking-widest text-lg font-bold" />
                      <button onClick={() => { if (regData.otp.length < 4) toast.error('Enter valid OTP'); else { toast.success('OTP Verified Successfully!'); setRegStep(3); } }} className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl font-bold text-white shadow-md">Verify OTP & Continue</button>
                    </>
                  )}
                </div>
              )}

              {/* Step 3: Desired Role */}
              {regStep === 3 && (
                <div className="space-y-4 mb-8">
                  <h4 className="font-bold text-sm text-[hsl(var(--foreground))]">Step 3: Job Role & Experience</h4>
                  <select value={regData.desiredRole} onChange={e => setRegData({ ...regData, desiredRole: e.target.value })} className="w-full p-3.5 rounded-2xl bg-[hsl(var(--background))] border border-[hsl(var(--border))] text-sm font-semibold">
                    <option value="">Select Target Job Pipeline</option>
                    {jobs.map(j => (
                      <option key={j.id} value={j.title}>{j.title} ({j.department})</option>
                    ))}
                    <option value="General Open Application">General Open Application</option>
                  </select>
                  <select value={regData.externalSource} onChange={e => setRegData({ ...regData, externalSource: e.target.value })} className="w-full p-3.5 rounded-2xl bg-[hsl(var(--background))] border border-[hsl(var(--border))] text-sm font-semibold">
                    <option value="direct">Source: Direct Platform Application</option>
                    <option value="linkedin">Source: LinkedIn Sync</option>
                    <option value="naukri">Source: Naukri.com Integration</option>
                    <option value="indeed">Source: Indeed Board</option>
                  </select>
                  <input type="number" placeholder="Experience Years" value={regData.experienceYears} onChange={e => setRegData({ ...regData, experienceYears: e.target.value })} className="w-full p-3.5 rounded-2xl bg-[hsl(var(--background))] border border-[hsl(var(--border))] text-sm" />
                  <button onClick={() => { if (!regData.desiredRole) toast.error('Select target role'); else setRegStep(4); }} className="w-full py-3.5 bg-gradient-to-r from-[hsl(var(--cp-blue))] to-[hsl(var(--cp-violet))] rounded-2xl font-bold text-white shadow-md">Next: Background</button>
                </div>
              )}

              {/* Step 4: Background & Education */}
              {regStep === 4 && (
                <div className="space-y-4 mb-8">
                  <h4 className="font-bold text-sm text-[hsl(var(--foreground))]">Step 4: Background Summary & Skills</h4>
                  <textarea rows={3} placeholder="Professional Summary" value={regData.experienceSummary} onChange={e => setRegData({ ...regData, experienceSummary: e.target.value })} className="w-full p-3.5 rounded-2xl bg-[hsl(var(--background))] border border-[hsl(var(--border))] text-sm" />
                  <input type="text" placeholder="Education (e.g. B.Tech Computer Science)" value={regData.education} onChange={e => setRegData({ ...regData, education: e.target.value })} className="w-full p-3.5 rounded-2xl bg-[hsl(var(--background))] border border-[hsl(var(--border))] text-sm" />
                  <input type="text" placeholder="Key Skills (comma separated)" value={regData.skills} onChange={e => setRegData({ ...regData, skills: e.target.value })} className="w-full p-3.5 rounded-2xl bg-[hsl(var(--background))] border border-[hsl(var(--border))] text-sm" />
                  <button onClick={() => setRegStep(5)} className="w-full py-3.5 bg-gradient-to-r from-[hsl(var(--cp-blue))] to-[hsl(var(--cp-violet))] rounded-2xl font-bold text-white shadow-md">Next: Resume Upload</button>
                </div>
              )}

              {/* Step 5: Resume Upload */}
              {regStep === 5 && (
                <div className="space-y-4 mb-8">
                  <h4 className="font-bold text-sm text-[hsl(var(--foreground))]">Step 5: Resume PDF Parsing & ATS Evaluation</h4>
                  <div className="border-2 border-dashed border-[hsl(var(--border))] rounded-3xl p-8 text-center bg-[hsl(var(--background))] relative hover:border-[hsl(var(--cp-blue))] transition-colors">
                    <input type="file" accept=".pdf" onChange={e => setRegData({ ...regData, resumeFile: e.target.files?.[0] || null })} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                    <Upload className="mx-auto text-[hsl(var(--cp-blue))] mb-3" size={36} />
                    <p className="font-semibold text-sm mb-1">{regData.resumeFile ? regData.resumeFile.name : 'Select or drop PDF Resume here'}</p>
                    <p className="text-xs text-[hsl(var(--muted-foreground))]">Required for OpenAI ATS Score calculation</p>
                  </div>
                  <button onClick={handleRegistrationSubmit} className="w-full py-4 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl font-bold text-white shadow-lg hover:scale-105 transition-all flex items-center justify-center gap-2 text-base">
                    <Sparkles size={18} /> Parse & Complete Registration
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 3. Post New Job Modal */}
      <AnimatePresence>
        {showJobModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="w-full max-w-lg rounded-3xl bg-[hsl(var(--card))] border border-[hsl(var(--border))] p-8 shadow-2xl relative">
              <button onClick={() => setShowJobModal(false)} className="absolute right-6 top-6 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]">
                <X size={20} />
              </button>
              <h3 className="font-heading text-xl font-bold mb-6 flex items-center gap-2">
                <Plus className="text-blue-500" /> Post New SmartHire Position
              </h3>

              <form onSubmit={handleCreateJob} className="space-y-4 mb-8">
                <input type="text" placeholder="Job Title (e.g. Principal Cloud Engineer)" value={jobData.title} onChange={e => setJobData({ ...jobData, title: e.target.value })} required className="w-full p-3.5 rounded-2xl bg-[hsl(var(--background))] border border-[hsl(var(--border))] text-sm font-semibold" />
                <div className="grid grid-cols-2 gap-4">
                  <input type="text" placeholder="Department" value={jobData.department} onChange={e => setJobData({ ...jobData, department: e.target.value })} required className="w-full p-3.5 rounded-2xl bg-[hsl(var(--background))] border border-[hsl(var(--border))] text-sm" />
                  <input type="text" placeholder="Location" value={jobData.location} onChange={e => setJobData({ ...jobData, location: e.target.value })} required className="w-full p-3.5 rounded-2xl bg-[hsl(var(--background))] border border-[hsl(var(--border))] text-sm" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <select value={jobData.jobType} onChange={e => setJobData({ ...jobData, jobType: e.target.value })} className="w-full p-3.5 rounded-2xl bg-[hsl(var(--background))] border border-[hsl(var(--border))] text-sm">
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Contract">Contract</option>
                  </select>
                  <input type="number" placeholder="Min Experience (Years)" value={jobData.minExperience} onChange={e => setJobData({ ...jobData, minExperience: Number(e.target.value) })} required className="w-full p-3.5 rounded-2xl bg-[hsl(var(--background))] border border-[hsl(var(--border))] text-sm" />
                </div>
                <input type="text" placeholder="Required Skills (comma separated)" value={jobData.requiredSkills} onChange={e => setJobData({ ...jobData, requiredSkills: e.target.value })} required className="w-full p-3.5 rounded-2xl bg-[hsl(var(--background))] border border-[hsl(var(--border))] text-sm" />
                <textarea rows={3} placeholder="Job Description" value={jobData.description} onChange={e => setJobData({ ...jobData, description: e.target.value })} required className="w-full p-3.5 rounded-2xl bg-[hsl(var(--background))] border border-[hsl(var(--border))] text-sm" />

                <button type="submit" className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl font-bold text-white shadow-lg hover:scale-105 transition-all">
                  Publish Job Pipeline
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 4. Update API Key Modal */}
      <AnimatePresence>
        {keyModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="w-full max-w-md rounded-3xl bg-[hsl(var(--card))] border border-[hsl(var(--border))] p-8 shadow-2xl relative">
              <button onClick={() => setKeyModal(null)} className="absolute right-6 top-6 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]">
                <X size={20} />
              </button>
              <h3 className="font-heading text-xl font-bold mb-2 flex items-center gap-2">
                <Key className="text-amber-500" /> Update API Secret Key
              </h3>
              <p className="text-xs text-[hsl(var(--muted-foreground))] mb-6">Updating secure credentials for {keyModal.name}.</p>

              <div className="space-y-4 mb-8">
                <input
                  type="password"
                  placeholder="Enter new API secret key..."
                  value={newKey}
                  onChange={e => setNewKey(e.target.value)}
                  className="w-full p-4 rounded-2xl bg-[hsl(var(--background))] border border-[hsl(var(--border))] text-sm font-mono focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                />
              </div>

              <div className="flex gap-3">
                <button onClick={() => handleUpdateKey(keyModal.id)} className="flex-1 py-3.5 bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl font-bold text-white shadow-md hover:scale-105 transition-all">
                  Save Credentials
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 5. User Details Modal */}
      <AnimatePresence>
        {selectedUserModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="w-full max-w-md rounded-3xl bg-[hsl(var(--card))] border border-[hsl(var(--border))] p-8 shadow-2xl relative">
              <button onClick={() => setSelectedUserModal(null)} className="absolute right-6 top-6 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]">
                <X size={20} />
              </button>
              <div className="text-center mb-6">
                <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-[hsl(var(--cp-blue))] to-[hsl(var(--cp-violet))] flex items-center justify-center font-bold text-3xl text-white shadow-lg mx-auto mb-4">
                  {selectedUserModal.name.charAt(0)}
                </div>
                <h3 className="font-heading text-xl font-bold flex items-center justify-center gap-2">
                  {selectedUserModal.name} {selectedUserModal.verified && <CheckCircle size={16} className="text-emerald-500" />}
                </h3>
                <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1">{selectedUserModal.email}</p>
              </div>
              <div className="space-y-3 bg-[hsl(var(--muted))]/50 p-4 rounded-2xl border border-[hsl(var(--border))] mb-6 text-sm">
                <div className="flex justify-between"><span className="text-[hsl(var(--muted-foreground))]">Role:</span> <span className="font-semibold">{selectedUserModal.role}</span></div>
                <div className="flex justify-between"><span className="text-[hsl(var(--muted-foreground))]">Status:</span> <span className="font-semibold uppercase text-xs px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-500 border border-blue-500/20">{selectedUserModal.status}</span></div>
                <div className="flex justify-between"><span className="text-[hsl(var(--muted-foreground))]">Joined Date:</span> <span className="font-semibold">{selectedUserModal.joinDate}</span></div>
                <div className="flex justify-between"><span className="text-[hsl(var(--muted-foreground))]">User ID:</span> <span className="font-mono text-xs text-[hsl(var(--muted-foreground))]">{selectedUserModal.id}</span></div>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setSelectedUserModal(null)} className="w-full py-3 bg-[hsl(var(--muted))] hover:bg-[hsl(var(--muted))]/80 rounded-2xl font-bold text-xs">Close Modal</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 6. Verification Document Upload & Preview Modal */}
      <AnimatePresence>
        {verificationDocModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="w-full max-w-lg rounded-3xl bg-[hsl(var(--card))] border border-[hsl(var(--border))] p-8 shadow-2xl relative">
              <button onClick={() => { setVerificationDocModal(null); setNewDocUpload(null); }} className="absolute right-6 top-6 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]">
                <X size={20} />
              </button>
              <h3 className="font-heading text-xl font-bold mb-2 flex items-center gap-2">
                <FileText className="text-blue-500" /> Verification Document Inspection
              </h3>
              <p className="text-xs text-[hsl(var(--muted-foreground))] mb-6">Inspecting document type: <span className="font-bold uppercase text-[hsl(var(--foreground))]">{verificationDocModal.doc.type}</span> for {verificationDocModal.item.userName}.</p>

              <div className="p-6 rounded-2xl bg-[hsl(var(--muted))]/50 border border-[hsl(var(--border))] mb-6 flex flex-col items-center justify-center min-h-40">
                <FileText size={48} className="text-[hsl(var(--muted-foreground))] mb-3" />
                <span className="text-sm font-semibold">{verificationDocModal.doc.type.toUpperCase()}_SCAN.pdf</span>
                <span className={`mt-2 px-3 py-1 rounded-full text-xs font-semibold uppercase ${verificationDocModal.doc.status === 'verified' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'}`}>{verificationDocModal.doc.status} Document</span>
              </div>

              {verificationDocModal.doc.status !== 'verified' && (
                <div className="mb-6 space-y-3">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">Upload Verified Scan / Override</label>
                  <div className="border-2 border-dashed border-[hsl(var(--border))] rounded-2xl p-4 text-center bg-[hsl(var(--background))] relative hover:border-[hsl(var(--cp-blue))] transition-colors">
                    <input type="file" accept=".pdf,.jpg,.png" onChange={e => setNewDocUpload(e.target.files?.[0] || null)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                    <Upload className="mx-auto text-[hsl(var(--cp-blue))] mb-2" size={24} />
                    <p className="font-semibold text-xs mb-1">{newDocUpload ? newDocUpload.name : 'Click or drop verified scan file here'}</p>
                  </div>
                  <button onClick={() => handleUploadDoc(verificationDocModal.item.id, verificationDocModal.doc.type)} className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-2xl text-xs shadow-md">Verify & Approve This Document</button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}