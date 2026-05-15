import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { ArrowUpRight, BadgeCheck, ShieldCheck, Sparkles, Upload } from 'lucide-react';
import { toast } from 'react-toastify';

interface JobListing {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  keywords: string[];
  description: string;
  links: { linkedin: string; naukri: string; indeed: string };
}

interface CandidateProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  desiredRole: string;
  experience: string;
  education: string;
  skills: string[];
  resumeText: string;
  atsScore: number;
  fitScore: number;
  status: 'pending' | 'shortlisted' | 'rejected' | 'hired';
  appliedAt: string;
  notes: string;
}

interface EmailLog {
  id: string;
  to: string;
  subject: string;
  status: 'sent';
  message: string;
  sentAt: string;
}

const jobListings: JobListing[] = [
  {
    id: 'job-1',
    title: 'Senior Product Manager',
    company: 'SmartHire Labs',
    location: 'Mumbai, Hybrid',
    type: 'Full-time',
    keywords: ['product', 'strategy', 'analytics', 'roadmap', 'stakeholder'],
    description: 'Lead product strategy for our AI-driven resume screening platform and own end-to-end delivery.',
    links: {
      linkedin: 'https://linkedin.com/jobs/view/1234567890',
      naukri: 'https://www.naukri.com/job-listings/senior-product-manager',
      indeed: 'https://in.indeed.com/viewjob?jk=smart-hire-pm',
    },
  },
  {
    id: 'job-2',
    title: 'AI Software Engineer',
    company: 'SmartHire Labs',
    location: 'Remote',
    type: 'Contract',
    keywords: ['machine learning', 'python', 'nlp', 'gpt', 'automation'],
    description: 'Build intelligent scoring models and automate resume parsing for large volume hiring.',
    links: {
      linkedin: 'https://linkedin.com/jobs/view/0987654321',
      naukri: 'https://www.naukri.com/job-listings/ai-software-engineer',
      indeed: 'https://in.indeed.com/viewjob?jk=smart-hire-ai',
    },
  },
  {
    id: 'job-3',
    title: 'Talent Acquisition Lead',
    company: 'SmartHire Labs',
    location: 'Bangalore, Onsite',
    type: 'Full-time',
    keywords: ['talent acquisition', 'recruitment', 'employer branding', 'headhunting'],
    description: 'Manage the candidate funnel, automate hiring emails, and improve pipeline metrics.',
    links: {
      linkedin: 'https://linkedin.com/jobs/view/1122334455',
      naukri: 'https://www.naukri.com/job-listings/talent-acquisition-lead',
      indeed: 'https://in.indeed.com/viewjob?jk=smart-hire-ttl',
    },
  },
];

const initialWizard = {
  name: '',
  email: '',
  phone: '',
  desiredRole: '',
  experience: '3-5 years',
  education: 'Bachelor degree',
  skills: 'React, TypeScript, AI',
  resumeText: '',
  otp: '',
  otpSentValue: '1234',
  otpVerified: false,
  selectedJobId: 'job-1',
};

const SmartHire: React.FC<{ theme: 'light' | 'dark'; toggleTheme: () => void; mobileMode?: boolean; toggleMobileMode?: () => void }> = ({ theme, toggleTheme, mobileMode = false, toggleMobileMode = () => {} }) => {
  const [activeTab, setActiveTab] = useState<'jobs' | 'ats' | 'pipeline' | 'register' | 'emails'>('jobs');
  const [step, setStep] = useState(1);
  const [wizardData, setWizardData] = useState(initialWizard);
  const [candidates, setCandidates] = useState<CandidateProfile[]>([]);
  const [emailLog, setEmailLog] = useState<EmailLog[]>([]);
  const [previewResume, setPreviewResume] = useState('');
  const [uploadedText, setUploadedText] = useState('');
  const [jobFilter, setJobFilter] = useState('All');
  const [selectedJob] = useState<JobListing | null>(jobListings[0]);

  useEffect(() => {
    const savedCandidates = JSON.parse(localStorage.getItem('smartHireCandidates') || '[]');
    setCandidates(savedCandidates);
    const savedEmails = JSON.parse(localStorage.getItem('smartHireEmailLog') || '[]');
    setEmailLog(savedEmails);
  }, []);

  useEffect(() => {
    localStorage.setItem('smartHireCandidates', JSON.stringify(candidates));
  }, [candidates]);

  useEffect(() => {
    localStorage.setItem('smartHireEmailLog', JSON.stringify(emailLog));
  }, [emailLog]);

  const rankedCandidates = useMemo(() => {
    return [...candidates].sort((a, b) => b.fitScore - a.fitScore);
  }, [candidates]);

  const activeJobs = useMemo(() => {
    if (jobFilter === 'All') return jobListings;
    return jobListings.filter((job) => job.type === jobFilter);
  }, [jobFilter]);

  const handleResumeGeneration = () => {
    const profile = wizardData;
    const generated = `Resume for ${profile.name}\nRole: ${profile.desiredRole}\nExperience: ${profile.experience}\nEducation: ${profile.education}\nSkills: ${profile.skills}\n\nProfessional summary:\nExperienced ${profile.desiredRole} with ${profile.experience} experience, skilled in ${profile.skills}. Proven track record in delivering impact through AI-driven hiring and candidate screening.`;
    setPreviewResume(generated);
    toast.success('ATS-friendly resume draft generated.');
  };

  const handleUploadResume = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const text = reader.result as string;
      setUploadedText(text.slice(0, 1600));
      setWizardData((prev) => ({ ...prev, resumeText: text.slice(0, 1600) }));
      toast.success('PDF text extracted via simulated Apache PDFBox flow.');
    };
    reader.readAsText(file);
  };

  const calculateScore = (resumeText: string, job: JobListing) => {
    const base = Math.min(80, Math.max(30, resumeText.length / 30));
    const keywordMatch = job.keywords.reduce((score, keyword) => {
      return resumeText.toLowerCase().includes(keyword.toLowerCase()) ? score + 5 : score;
    }, 0);
    const score = Math.min(100, Math.round(base + keywordMatch + Math.random() * 7));
    return score;
  };

  const calculateFit = (skillText: string, job: JobListing) => {
    const skills = skillText.toLowerCase().split(/[,\s]+/).filter(Boolean);
    const matched = job.keywords.filter((keyword) => skills.some((skill) => keyword.toLowerCase().includes(skill) || skill.includes(keyword.toLowerCase()))).length;
    return Math.min(100, Math.round((matched / job.keywords.length) * 100 + Math.random() * 10));
  };

  const handleCandidateSubmit = () => {
    if (!wizardData.name || !wizardData.email || !wizardData.phone || !wizardData.resumeText || !wizardData.desiredRole) {
      toast.error('Please fill in all required registration fields.');
      return;
    }
    if (wizardData.otp !== wizardData.otpSentValue) {
      toast.error('Enter the correct OTP to complete registration.');
      return;
    }
    const job = jobListings.find((j) => j.id === wizardData.selectedJobId) ?? jobListings[0];
    const atsScore = calculateScore(wizardData.resumeText, job);
    const fitScore = calculateFit(wizardData.skills, job);
    const candidate: CandidateProfile = {
      id: `cand-${Date.now()}`,
      name: wizardData.name,
      email: wizardData.email,
      phone: wizardData.phone,
      desiredRole: wizardData.desiredRole,
      experience: wizardData.experience,
      education: wizardData.education,
      skills: wizardData.skills.split(/[,\s]+/).filter(Boolean),
      resumeText: wizardData.resumeText,
      atsScore,
      fitScore,
      status: 'pending',
      appliedAt: new Date().toLocaleString(),
      notes: 'Awaiting recruiter review',
    };
    setCandidates((prev) => [...prev, candidate]);
    setEmailLog((prev) => [
      {
        id: `email-${Date.now()}`,
        to: wizardData.email,
        subject: 'Application received for ' + job.title,
        status: 'sent',
        message: `Thank you ${wizardData.name} for applying to ${job.title}. Your resume has been received and is under review.`,
        sentAt: new Date().toLocaleString(),
      },
      ...prev,
    ]);
    toast.success('Candidate registered and resume scored successfully.');
    setWizardData((prev) => ({ ...prev, otpVerified: true }));
    setActiveTab('pipeline');
  };

  const handleSendFeedback = (candidate: CandidateProfile, type: 'select' | 'reject') => {
    const status = type === 'select' ? 'shortlisted' : 'rejected';
    setCandidates((prev) => prev.map((item) => (item.id === candidate.id ? { ...item, status, notes: type === 'select' ? 'Shortlisted for interview' : 'Rejected with feedback.' } : item)));
    setEmailLog((prev) => [
      {
        id: `email-${Date.now()}`,
        to: candidate.email,
        subject: type === 'select' ? `Interview invitation for ${candidate.desiredRole}` : `Application update for ${candidate.desiredRole}`,
        status: 'sent',
        message: type === 'select'
          ? `Hi ${candidate.name}, your application is strong. We would like to invite you for the next round.`
          : `Hi ${candidate.name}, thank you for applying. We are moving forward with other candidates but appreciate your interest.`,
        sentAt: new Date().toLocaleString(),
      },
      ...prev,
    ]);
    toast.success(`Automated ${type === 'select' ? 'selection' : 'rejection'} email sent.`);
  };

  const jobTypes = ['All', 'Full-time', 'Contract'];

  return (
    <div className="min-h-screen bg-[hsl(var(--background))]">
      <Header theme={theme} toggleTheme={toggleTheme} mobileMode={mobileMode} toggleMobileMode={toggleMobileMode} />

      <main className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-[2rem] bg-[hsl(var(--cp-blue))]/5 border border-[hsl(var(--cp-blue))]/10 p-10"
            >
              <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                <div className="max-w-3xl">
                  <div className="inline-flex items-center gap-2 rounded-full bg-[hsl(var(--cp-blue))]/20 px-4 py-2 text-sm font-semibold text-[hsl(var(--cp-blue))] mb-4">
                    <ShieldCheck size={16} /> SmartHire ATS Portal
                  </div>
                  <h1 className="font-heading text-4xl font-bold text-[hsl(var(--foreground))] mb-3">AI-powered resume screening, scoring, and candidate pipeline automation</h1>
                  <p className="text-[hsl(var(--muted-foreground))] text-lg leading-relaxed">Upload resumes, build ATS-friendly CVs, score applicants with GPT-style intelligence, rank fit, and manage hiring from one central portal.</p>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm text-[hsl(var(--foreground))] bg-[hsl(var(--card))] rounded-3xl p-5 shadow-sm">
                  <div className="rounded-3xl bg-white/80 p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-[hsl(var(--muted-foreground))]">Pipeline</p>
                    <p className="mt-2 text-2xl font-semibold text-[hsl(var(--foreground))]">{candidates.length}</p>
                    <p className="text-[hsl(var(--muted-foreground))]">Applicants tracked</p>
                  </div>
                  <div className="rounded-3xl bg-white/80 p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-[hsl(var(--muted-foreground))]">Emails</p>
                    <p className="mt-2 text-2xl font-semibold text-[hsl(var(--foreground))]">{emailLog.length}</p>
                    <p className="text-[hsl(var(--muted-foreground))]">Auto-response sent</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6">
            <div className="flex flex-wrap gap-2">
              {['jobs', 'ats', 'pipeline', 'register', 'emails'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab as any)}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 ${activeTab === tab ? 'bg-[hsl(var(--cp-blue))] text-white shadow-md' : 'bg-[hsl(var(--card))] text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))]'}`}
                >
                  {tab === 'jobs' ? 'Job Board' : tab === 'ats' ? 'ATS Resume' : tab === 'pipeline' ? 'Candidate Pipeline' : tab === 'register' ? '5-step Registration' : 'Email Log'}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-3 text-sm text-[hsl(var(--muted-foreground))]">
              <BadgeCheck size={18} />
              <span>Automated job-match scoring, feedback emails, and pipeline ranking.</span>
            </div>
          </div>

          {activeTab === 'jobs' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1 }} className="grid gap-6 lg:grid-cols-2">
              <div className="space-y-6">
                <div className="rounded-3xl bg-[hsl(var(--card))] border border-[hsl(var(--border))] p-6">
                  <div className="flex items-center justify-between gap-4 mb-4">
                    <div>
                      <h2 className="font-heading text-xl font-semibold text-[hsl(var(--foreground))]">External Job Board</h2>
                      <p className="text-sm text-[hsl(var(--muted-foreground))]">LinkedIn, Naukri and Indeed listings with direct apply links.</p>
                    </div>
                    <div className="flex gap-2">
                      {jobTypes.map((type) => (
                        <button
                          key={type}
                          onClick={() => setJobFilter(type)}
                          className={`rounded-full px-3 py-2 text-xs font-semibold transition-all duration-200 ${jobFilter === type ? 'bg-[hsl(var(--cp-blue))] text-white' : 'bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]'}`}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-4">
                    {activeJobs.map((job) => (
                      <div key={job.id} className="rounded-3xl border border-[hsl(var(--border))] p-5 hover:border-[hsl(var(--cp-blue))] transition-all duration-200">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                          <div>
                            <h3 className="font-semibold text-[hsl(var(--foreground))]">{job.title}</h3>
                            <p className="text-sm text-[hsl(var(--muted-foreground))]">{job.company} • {job.location}</p>
                          </div>
                          <span className="rounded-full bg-[hsl(var(--muted))] px-3 py-1 text-xs font-semibold text-[hsl(var(--muted-foreground))]">{job.type}</span>
                        </div>
                        <p className="text-sm text-[hsl(var(--muted-foreground))] mt-3">{job.description}</p>
                        <div className="mt-4 flex flex-wrap gap-2">
                          <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">LinkedIn</span>
                          <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">Naukri</span>
                          <span className="rounded-full bg-violet-100 px-3 py-1 text-xs font-semibold text-violet-700">Indeed</span>
                        </div>
                        <div className="mt-5 flex flex-wrap gap-2">
                          <a href={job.links.linkedin} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-2xl bg-[hsl(var(--cp-blue))] px-4 py-2 text-xs font-semibold text-white hover:bg-[hsl(var(--cp-blue))]/90 transition-all duration-200">
                            Apply via LinkedIn <ArrowUpRight size={14} />
                          </a>
                          <a href={job.links.naukri} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-2xl bg-[hsl(var(--cp-violet))] px-4 py-2 text-xs font-semibold text-white hover:bg-[hsl(var(--cp-violet))]/90 transition-all duration-200">
                            Apply via Naukri <ArrowUpRight size={14} />
                          </a>
                          <a href={job.links.indeed} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-2xl bg-[hsl(var(--cp-blue))]/90 px-4 py-2 text-xs font-semibold text-white hover:bg-[hsl(var(--cp-blue))]/80 transition-all duration-200">
                            Apply via Indeed <ArrowUpRight size={14} />
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-3xl bg-[hsl(var(--card))] border border-[hsl(var(--border))] p-6">
                  <h2 className="font-heading text-xl font-semibold text-[hsl(var(--foreground))] mb-4">Why SmartHire</h2>
                  <div className="grid gap-4 sm:grid-cols-2">
                    {[
                      'PDF resume parsing',
                      'OpenAI ATS scoring',
                      'Job-fit ranking',
                      'Automated email feedback',
                    ].map((item) => (
                      <div key={item} className="rounded-3xl bg-[hsl(var(--muted))] p-4">
                        <p className="text-sm font-medium text-[hsl(var(--foreground))]">{item}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="rounded-3xl bg-[hsl(var(--card))] border border-[hsl(var(--border))] p-6">
                <h2 className="font-heading text-xl font-semibold text-[hsl(var(--foreground))] mb-4">Job Spotlight</h2>
                <div className="rounded-3xl bg-[hsl(var(--muted))] p-6">
                  <p className="text-sm text-[hsl(var(--muted-foreground))]">Feature your top job and make it easy for candidates to apply across major boards.</p>
                  <div className="mt-6 grid gap-4">
                    {jobListings.slice(0, 2).map((job) => (
                      <div key={job.id} className="rounded-3xl bg-white/90 p-5 border border-[hsl(var(--border))]">
                        <h3 className="font-semibold text-[hsl(var(--foreground))]">{job.title}</h3>
                        <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1">{job.company} • {job.location}</p>
                        <div className="mt-4 flex flex-wrap gap-2">
                          {job.keywords.map((keyword) => (
                            <span key={keyword} className="rounded-full bg-[hsl(var(--muted))] px-3 py-1 text-xs text-[hsl(var(--muted-foreground))]">{keyword}</span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'ats' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1 }} className="grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
              <div className="space-y-6">
                <div className="rounded-3xl bg-[hsl(var(--card))] border border-[hsl(var(--border))] p-6">
                  <div className="flex items-start justify-between gap-4 mb-6">
                    <div>
                      <h2 className="font-heading text-xl font-semibold text-[hsl(var(--foreground))]">ATS Resume Screening</h2>
                      <p className="text-sm text-[hsl(var(--muted-foreground))] mt-2">Upload your CV and see the simulated GPT-driven resume score and fit percentage.</p>
                    </div>
                    <Sparkles size={24} className="text-[hsl(var(--cp-blue))]" />
                  </div>
                  <div className="grid gap-4">
                    <label className="block text-sm font-medium text-[hsl(var(--foreground))]">Upload PDF / DOCX</label>
                    <input type="file" accept=".pdf,.docx,.txt" onChange={handleUploadResume} className="w-full rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-4 py-3 text-sm text-[hsl(var(--foreground))]" />
                    {uploadedText && (
                      <div className="rounded-3xl bg-[hsl(var(--muted))] p-4 text-sm text-[hsl(var(--muted-foreground))]">
                        <p className="font-medium mb-2">Extracted resume preview</p>
                        <p className="truncate">{uploadedText}</p>
                      </div>
                    )}
                    <label className="block text-sm font-medium text-[hsl(var(--foreground))]">Use ATS Resume Builder</label>
                    <textarea
                      rows={6}
                      value={wizardData.resumeText || previewResume}
                      onChange={(e) => setWizardData((prev) => ({ ...prev, resumeText: e.target.value }))}
                      placeholder="Paste your resume text or let the builder create an ATS-friendly version"
                      className="w-full rounded-3xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-4 py-3 text-sm text-[hsl(var(--foreground))] focus:outline-none"
                    />
                    <button onClick={handleResumeGeneration} className="w-full rounded-full bg-gradient-to-r from-[hsl(var(--cp-blue))] to-[hsl(var(--cp-violet))] px-5 py-3 text-sm font-semibold text-white hover:scale-105 transition-all duration-200">
                      Generate ATS-Friendly Resume
                    </button>
                  </div>
                </div>

                <div className="rounded-3xl bg-[hsl(var(--card))] border border-[hsl(var(--border))] p-6">
                  <h2 className="font-heading text-xl font-semibold text-[hsl(var(--foreground))] mb-4">Score Summary</h2>
                  <div className="grid gap-4">
                    <div className="rounded-3xl bg-[hsl(var(--muted))] p-5">
                      <p className="text-sm text-[hsl(var(--muted-foreground))]">Resume score is based on extracted keywords and fit to selected job.</p>
                      <div className="mt-4 flex items-center justify-between">
                        <span className="font-semibold text-[hsl(var(--foreground))]">Preview score</span>
                        <span className="text-lg font-bold text-[hsl(var(--cp-blue))]">{wizardData.resumeText ? calculateScore(wizardData.resumeText, selectedJob ?? jobListings[0]) : '--'}</span>
                      </div>
                    </div>
                    <div className="rounded-3xl bg-[hsl(var(--muted))] p-5">                      
                      <div className="flex items-center justify-between gap-3">
                        <span className="font-semibold text-[hsl(var(--foreground))]">Job match estimate</span>
                        <span className="text-lg font-bold text-[hsl(var(--cp-violet))]">{wizardData.skills ? calculateFit(wizardData.skills, selectedJob ?? jobListings[0]) : '--'}%</span>
                      </div>
                      <p className="text-sm text-[hsl(var(--muted-foreground))] mt-2">Updated automatically when resume text is available.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="rounded-3xl bg-[hsl(var(--card))] border border-[hsl(var(--border))] p-6">
                  <h2 className="font-heading text-xl font-semibold text-[hsl(var(--foreground))] mb-4">ATS Resume Builder</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-2">Name</label>
                      <input value={wizardData.name} onChange={(e) => setWizardData((prev) => ({ ...prev, name: e.target.value }))} className="w-full rounded-3xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-4 py-3 text-sm text-[hsl(var(--foreground))]" placeholder="Full Name" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-2">Desired Role</label>
                      <input value={wizardData.desiredRole} onChange={(e) => setWizardData((prev) => ({ ...prev, desiredRole: e.target.value }))} className="w-full rounded-3xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-4 py-3 text-sm text-[hsl(var(--foreground))]" placeholder="Senior Product Manager" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-2">Skills</label>
                      <input value={wizardData.skills} onChange={(e) => setWizardData((prev) => ({ ...prev, skills: e.target.value }))} className="w-full rounded-3xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-4 py-3 text-sm text-[hsl(var(--foreground))]" placeholder="AI, product, stakeholder management" />
                    </div>
                    <div className="rounded-3xl border border-[hsl(var(--border))] bg-[hsl(var(--muted))] p-4 text-sm text-[hsl(var(--muted-foreground))]">
                      <div className="flex items-center gap-2 mb-2">
                        <Upload size={16} />
                        <span>Use the resume builder to create a clean ATS-friendly CV from your profile details.</span>
                      </div>
                      <p>Use the generated resume in your applications or download it as a text draft.</p>
                    </div>
                  </div>
                </div>

                <div className="rounded-3xl bg-[hsl(var(--card))] border border-[hsl(var(--border))] p-6">
                  <h2 className="font-heading text-xl font-semibold text-[hsl(var(--foreground))] mb-4">Preview Resume</h2>
                  <div className="rounded-3xl bg-[hsl(var(--muted))] p-5 text-sm text-[hsl(var(--foreground))] whitespace-pre-line">{previewResume || 'No resume draft generated yet. Click the button to create your ATS-friendly resume.'}</div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'pipeline' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1 }} className="space-y-6">
              <div className="grid gap-6 lg:grid-cols-3">
                <div className="rounded-3xl bg-[hsl(var(--card))] border border-[hsl(var(--border))] p-6">
                  <h2 className="font-heading text-xl font-semibold text-[hsl(var(--foreground))] mb-4">Pipeline Metrics</h2>
                  <div className="space-y-3 text-sm text-[hsl(var(--muted-foreground))]">
                    <p>Total candidates: <strong className="text-[hsl(var(--foreground))]">{candidates.length}</strong></p>
                    <p>Shortlisted: <strong className="text-[hsl(var(--foreground))]">{candidates.filter((c) => c.status === 'shortlisted').length}</strong></p>
                    <p>Rejected: <strong className="text-[hsl(var(--foreground))]">{candidates.filter((c) => c.status === 'rejected').length}</strong></p>
                    <p>Pending review: <strong className="text-[hsl(var(--foreground))]">{candidates.filter((c) => c.status === 'pending').length}</strong></p>
                  </div>
                </div>
                <div className="rounded-3xl bg-[hsl(var(--card))] border border-[hsl(var(--border))] p-6">
                  <h2 className="font-heading text-xl font-semibold text-[hsl(var(--foreground))] mb-4">Hiring Automation</h2>
                  <p className="text-sm text-[hsl(var(--muted-foreground))]">Candidates are ranked by fit score and receive instant selection or rejection emails based on admin decisions.</p>
                </div>
                <div className="rounded-3xl bg-[hsl(var(--card))] border border-[hsl(var(--border))] p-6">
                  <h2 className="font-heading text-xl font-semibold text-[hsl(var(--foreground))] mb-4">ATS Scoring</h2>
                  <p className="text-sm text-[hsl(var(--muted-foreground))]">Resume scores range from 0-100 and help recruiters prioritize high-fit applicants.</p>
                </div>
              </div>

              <div className="rounded-3xl bg-[hsl(var(--card))] border border-[hsl(var(--border))] p-6">
                <div className="flex items-center justify-between gap-4 mb-5">
                  <div>
                    <h2 className="font-heading text-xl font-semibold text-[hsl(var(--foreground))]">Candidate Pipeline</h2>
                    <p className="text-sm text-[hsl(var(--muted-foreground))]">Sorted by highest fit score first.</p>
                  </div>
                </div>
                <div className="space-y-4">
                  {rankedCandidates.length === 0 ? (
                    <p className="text-sm text-[hsl(var(--muted-foreground))]">No registered candidates yet.</p>
                  ) : (
                    rankedCandidates.map((candidate) => (
                      <div key={candidate.id} className="rounded-3xl border border-[hsl(var(--border))] bg-[hsl(var(--muted))] p-5">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <p className="font-semibold text-[hsl(var(--foreground))]">{candidate.name}</p>
                            <p className="text-xs text-[hsl(var(--muted-foreground))]">Applied for {candidate.desiredRole} • {candidate.appliedAt}</p>
                          </div>
                          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${candidate.status === 'pending' ? 'bg-amber-100 text-amber-700' : candidate.status === 'shortlisted' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>{candidate.status}</span>
                        </div>
                        <div className="mt-4 grid gap-3 sm:grid-cols-3">
                          <div className="rounded-3xl bg-white/90 p-4">
                            <p className="text-[hsl(var(--muted-foreground)))] text-xs uppercase tracking-[0.14em] mb-2">ATS score</p>
                            <p className="text-2xl font-bold text-[hsl(var(--cp-blue))]">{candidate.atsScore}</p>
                          </div>
                          <div className="rounded-3xl bg-white/90 p-4">
                            <p className="text-[hsl(var(--muted-foreground)))] text-xs uppercase tracking-[0.14em] mb-2">Job fit</p>
                            <p className="text-2xl font-bold text-[hsl(var(--cp-violet))]">{candidate.fitScore}%</p>
                          </div>
                          <div className="rounded-3xl bg-white/90 p-4">
                            <p className="text-[hsl(var(--muted-foreground)))] text-xs uppercase tracking-[0.14em] mb-2">Notes</p>
                            <p className="text-sm text-[hsl(var(--foreground))]">{candidate.notes}</p>
                          </div>
                        </div>
                        <div className="mt-4 flex flex-wrap gap-3">
                          <button onClick={() => handleSendFeedback(candidate, 'select')} className="rounded-full bg-green-500 px-4 py-2 text-xs font-semibold text-white hover:bg-green-600 transition-all duration-200">Shortlist</button>
                          <button onClick={() => handleSendFeedback(candidate, 'reject')} className="rounded-full bg-rose-500 px-4 py-2 text-xs font-semibold text-white hover:bg-rose-600 transition-all duration-200">Reject</button>
                          <button className="rounded-full bg-[hsl(var(--muted))] px-4 py-2 text-xs font-semibold text-[hsl(var(--foreground))]">View resume</button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'register' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1 }} className="space-y-6">
              <div className="rounded-3xl bg-[hsl(var(--card))] border border-[hsl(var(--border))] p-6">
                <div className="flex items-center justify-between gap-4 mb-4">
                  <div>
                    <h2 className="font-heading text-xl font-semibold text-[hsl(var(--foreground))]">Candidate Registration</h2>
                    <p className="text-sm text-[hsl(var(--muted-foreground))]">Complete the 5-step onboarding workflow with OTP verification.</p>
                  </div>
                  <span className="rounded-full bg-[hsl(var(--muted))] px-3 py-1 text-xs font-semibold text-[hsl(var(--foreground))]">Step {step} of 5</span>
                </div>
                <div className="grid gap-4 sm:grid-cols-5">
                  {['Profile', 'Role', 'Education', 'Document', 'OTP'].map((label, index) => (
                    <div key={label} className={`rounded-3xl p-3 text-center text-xs font-semibold ${step === index + 1 ? 'bg-[hsl(var(--cp-blue))] text-white' : 'bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]'}`}>{label}</div>
                  ))}
                </div>
              </div>

              <div className="rounded-3xl bg-[hsl(var(--card))] border border-[hsl(var(--border))] p-6">
                {step === 1 && (
                  <div className="space-y-4">
                    <label className="block text-sm font-medium text-[hsl(var(--foreground))]">Full name</label>
                    <input value={wizardData.name} onChange={(e) => setWizardData((prev) => ({ ...prev, name: e.target.value }))} className="w-full rounded-3xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-4 py-3 text-sm text-[hsl(var(--foreground))]" placeholder="Your name" />
                    <label className="block text-sm font-medium text-[hsl(var(--foreground))]">Email</label>
                    <input value={wizardData.email} onChange={(e) => setWizardData((prev) => ({ ...prev, email: e.target.value }))} className="w-full rounded-3xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-4 py-3 text-sm text-[hsl(var(--foreground))]" placeholder="you@example.com" />
                    <label className="block text-sm font-medium text-[hsl(var(--foreground))]">Phone</label>
                    <input value={wizardData.phone} onChange={(e) => setWizardData((prev) => ({ ...prev, phone: e.target.value }))} className="w-full rounded-3xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-4 py-3 text-sm text-[hsl(var(--foreground))]" placeholder="Mobile number" />
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-4">
                    <label className="block text-sm font-medium text-[hsl(var(--foreground))]">Desired role</label>
                    <input value={wizardData.desiredRole} onChange={(e) => setWizardData((prev) => ({ ...prev, desiredRole: e.target.value }))} className="w-full rounded-3xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-4 py-3 text-sm text-[hsl(var(--foreground))]" placeholder="Full Stack Developer" />
                    <label className="block text-sm font-medium text-[hsl(var(--foreground))]">Experience level</label>
                    <select value={wizardData.experience} onChange={(e) => setWizardData((prev) => ({ ...prev, experience: e.target.value }))} className="w-full rounded-3xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-4 py-3 text-sm text-[hsl(var(--foreground))]">
                      <option>0-2 years</option>
                      <option>3-5 years</option>
                      <option>5-8 years</option>
                      <option>8+ years</option>
                    </select>
                    <label className="block text-sm font-medium text-[hsl(var(--foreground))]">Select role to apply</label>
                    <select value={wizardData.selectedJobId} onChange={(e) => setWizardData((prev) => ({ ...prev, selectedJobId: e.target.value }))} className="w-full rounded-3xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-4 py-3 text-sm text-[hsl(var(--foreground))]">
                      {jobListings.map((job) => (<option key={job.id} value={job.id}>{job.title}</option>))}
                    </select>
                  </div>
                )}

                {step === 3 && (
                  <div className="space-y-4">
                    <label className="block text-sm font-medium text-[hsl(var(--foreground))]">Highest education</label>
                    <input value={wizardData.education} onChange={(e) => setWizardData((prev) => ({ ...prev, education: e.target.value }))} className="w-full rounded-3xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-4 py-3 text-sm text-[hsl(var(--foreground))]" placeholder="B.Tech in Computer Science" />
                    <label className="block text-sm font-medium text-[hsl(var(--foreground))]">Core skills</label>
                    <input value={wizardData.skills} onChange={(e) => setWizardData((prev) => ({ ...prev, skills: e.target.value }))} className="w-full rounded-3xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-4 py-3 text-sm text-[hsl(var(--foreground))]" placeholder="TypeScript, React, GPT, ATS" />
                  </div>
                )}

                {step === 4 && (
                  <div className="space-y-4">
                    <label className="block text-sm font-medium text-[hsl(var(--foreground))]">Upload resume file</label>
                    <input type="file" accept=".pdf,.docx,.txt" onChange={handleUploadResume} className="w-full rounded-3xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-4 py-3 text-sm text-[hsl(var(--foreground))]" />
                    <div className="rounded-3xl bg-[hsl(var(--muted))] p-4 text-sm text-[hsl(var(--muted-foreground))]">
                      <p><strong>Existing resume text:</strong></p>
                      <p className="truncate">{wizardData.resumeText || 'Upload or paste your resume details here.'}</p>
                    </div>
                    <button onClick={handleResumeGeneration} className="w-full rounded-full bg-gradient-to-r from-[hsl(var(--cp-blue))] to-[hsl(var(--cp-violet))] px-5 py-3 text-sm font-semibold text-white hover:scale-105 transition-all duration-200">Generate ATS-friendly resume</button>
                  </div>
                )}

                {step === 5 && (
                  <div className="space-y-4">
                    <div className="rounded-3xl bg-[hsl(var(--muted))] p-4 text-sm text-[hsl(var(--muted-foreground))]">
                      <p className="font-medium">OTP verification</p>
                      <p>Enter the OTP sent to your phone number for verification.</p>
                      <p className="mt-2 text-xs">Sample OTP: 1234</p>
                    </div>
                    <input value={wizardData.otp} onChange={(e) => setWizardData((prev) => ({ ...prev, otp: e.target.value }))} placeholder="Enter OTP" className="w-full rounded-3xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-4 py-3 text-sm text-[hsl(var(--foreground))]" />
                  </div>
                )}

                <div className="flex items-center justify-between gap-3 mt-6">
                  <button
                    onClick={() => setStep((prev) => Math.max(1, prev - 1))}
                    disabled={step === 1}
                    className="rounded-full border border-[hsl(var(--border))] px-5 py-3 text-sm font-semibold text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))] transition-all duration-200 disabled:opacity-50"
                  >
                    Back
                  </button>
                  {step < 5 ? (
                    <button
                      onClick={() => setStep((prev) => Math.min(5, prev + 1))}
                      className="rounded-full bg-gradient-to-r from-[hsl(var(--cp-blue))] to-[hsl(var(--cp-violet))] px-5 py-3 text-sm font-semibold text-white hover:scale-105 transition-all duration-200"
                    >
                      Next step
                    </button>
                  ) : (
                    <button
                      onClick={handleCandidateSubmit}
                      className="rounded-full bg-emerald-500 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-600 transition-all duration-200"
                    >
                      Complete registration
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'emails' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1 }} className="space-y-6">
              <div className="rounded-3xl bg-[hsl(var(--card))] border border-[hsl(var(--border))] p-6">
                <h2 className="font-heading text-xl font-semibold text-[hsl(var(--foreground))] mb-4">Automated Email Log</h2>
                <div className="space-y-4">
                  {emailLog.length === 0 ? (
                    <p className="text-sm text-[hsl(var(--muted-foreground))]">No automation emails have been sent yet.</p>
                  ) : (
                    emailLog.map((email) => (
                      <div key={email.id} className="rounded-3xl bg-[hsl(var(--muted))] border border-[hsl(var(--border))] p-4">
                        <p className="text-sm font-semibold text-[hsl(var(--foreground))]">{email.subject}</p>
                        <p className="text-xs text-[hsl(var(--muted-foreground))]">To: {email.to} • {email.sentAt}</p>
                        <p className="mt-3 text-sm text-[hsl(var(--foreground))]">{email.message}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default SmartHire;
