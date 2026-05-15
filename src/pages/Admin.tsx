import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  ShieldCheck,
  Flag,
  BarChart3,
  UserCheck,
  UserX,
  CheckCircle,
  XCircle,
  TrendingUp,
  DollarSign,
  UserPlus,
  HeartHandshake,
  Briefcase
} from 'lucide-react';
import { toast } from 'react-toastify';
import Header from '../components/Header';
import Footer from '../components/Footer';
import {
  getAllRequests,
  adminReviewRequest,
  DOCUMENT_META,
  type VerificationRequest,
  type DocumentType,
} from '../lib/verification';

interface AdminProps {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  mobileMode?: boolean;
  toggleMobileMode?: () => void;
}

// Mock data for admin panel
const mockUsers = [
  { id: '1', name: 'John Doe', email: 'john@example.com', role: 'Professional', status: 'active', verified: true, joinDate: '2024-01-15' },
  { id: '2', name: 'Jane Smith', email: 'jane@example.com', role: 'Client', status: 'active', verified: false, joinDate: '2024-02-20' },
  { id: '3', name: 'Bob Johnson', email: 'bob@example.com', role: 'Professional', status: 'suspended', verified: true, joinDate: '2024-01-10' },
  { id: '4', name: 'Alice Brown', email: 'alice@example.com', role: 'Client', status: 'active', verified: true, joinDate: '2024-03-05' },
];

const mockReports = [
  { id: '1', reporterId: '4', reporterName: 'Alice Brown', reportedUserId: '3', reportedUserName: 'Bob Johnson', reason: 'Inappropriate behavior', date: '2024-03-12', status: 'pending' },
  { id: '2', reporterId: '7', reporterName: 'Tom Harris', reportedUserId: '1', reportedUserName: 'John Doe', reason: 'Spam content', date: '2024-03-10', status: 'reviewed' },
];

interface MatchRequestItem {
  id: string;
  name: string;
  role: string;
  status: 'pending' | 'approved' | 'rejected';
  avatar: string;
  requestedAt: string;
}

interface AppointmentRequestItem {
  id: string;
  title: string;
  time: string;
  status: 'pending' | 'approved' | 'rejected';
  requestedAt: string;
}

interface SmartHireCandidate {
  id: string;
  name: string;
  email: string;
  phone: string;
  desiredRole: string;
  experience: string;
  education: string;
  skills: string[];
  atsScore: number;
  fitScore: number;
  status: 'pending' | 'shortlisted' | 'rejected' | 'hired';
  appliedAt: string;
  notes: string;
}

const mockAnalytics = {
  signups: [
    { month: 'Jan', count: 120 },
    { month: 'Feb', count: 150 },
    { month: 'Mar', count: 180 },
    { month: 'Apr', count: 200 },
    { month: 'May', count: 250 },
    { month: 'Jun', count: 300 },
  ],
  connections: [
    { month: 'Jan', count: 45 },
    { month: 'Feb', count: 60 },
    { month: 'Mar', count: 75 },
    { month: 'Apr', count: 90 },
    { month: 'May', count: 110 },
    { month: 'Jun', count: 130 },
  ],
  revenue: [
    { month: 'Jan', amount: 4500 },
    { month: 'Feb', amount: 5200 },
    { month: 'Mar', amount: 6100 },
    { month: 'Apr', amount: 6800 },
    { month: 'May', amount: 7500 },
    { month: 'Jun', amount: 8200 },
  ],
};

const Admin: React.FC<AdminProps> = ({ theme, toggleTheme, mobileMode = false, toggleMobileMode = () => {} }) => {
  const [activeTab, setActiveTab] = useState<'users' | 'verifications' | 'reports' | 'smarthire' | 'analytics' | 'integrations' | 'requests'>('users');
  const [users, setUsers] = useState(mockUsers);
  const [verifications, setVerifications] = useState<VerificationRequest[]>([]);
  const [reports, setReports] = useState(mockReports);
  const [matchRequests, setMatchRequests] = useState<MatchRequestItem[]>([]);
  const [appointmentRequests, setAppointmentRequests] = useState<AppointmentRequestItem[]>([]);
  const [smartHireCandidates, setSmartHireCandidates] = useState<SmartHireCandidate[]>([]);
  const [integrations, setIntegrations] = useState([
    { id: 'github', name: 'GitHub', status: 'active', linkedUsers: 682 },
    { id: 'linkedin', name: 'LinkedIn', status: 'active', linkedUsers: 419 },
  ]);

  const handleUserAction = (userId: string, action: 'verify' | 'suspend' | 'activate') => {
    setUsers(users.map(user => {
      if (user.id === userId) {
        if (action === 'verify') return { ...user, verified: true };
        if (action === 'suspend') return { ...user, status: 'suspended' };
        if (action === 'activate') return { ...user, status: 'active' };
      }
      return user;
    }));
  };

  const refreshVerifications = () => setVerifications(getAllRequests());

  const handleVerificationAction = (verificationId: string, action: 'approve' | 'reject') => {
    const result = adminReviewRequest(verificationId, action, undefined, action === 'reject' ? 'Rejected by admin' : undefined);
    if (result) {
      toast.success(action === 'approve' ? 'Verification approved — badge is now public' : 'Verification rejected');
      refreshVerifications();
    }
  };

  const handleReportAction = (reportId: string, action: 'resolve' | 'dismiss') => {
    setReports(reports.map(r => {
      if (r.id === reportId) {
        return { ...r, status: action === 'resolve' ? 'resolved' : 'dismissed' };
      }
      return r;
    }));
  };

  const handleIntegrationToggle = (integrationId: string) => {
    setIntegrations(integrations.map((integration) => {
      if (integration.id === integrationId) {
        return {
          ...integration,
          status: integration.status === 'active' ? 'disabled' : 'active',
        };
      }
      return integration;
    }));
  };

  useEffect(() => {
    refreshVerifications();
    const storedMatches = JSON.parse(localStorage.getItem('pendingMatchRequests') || '[]');
    const storedAppointments = JSON.parse(localStorage.getItem('pendingAppointmentRequests') || '[]');
    const storedSmartHire = JSON.parse(localStorage.getItem('smartHireCandidates') || '[]');
    setMatchRequests(storedMatches);
    setAppointmentRequests(storedAppointments);
    setSmartHireCandidates(storedSmartHire);
  }, []);

  useEffect(() => {
    localStorage.setItem('pendingMatchRequests', JSON.stringify(matchRequests));
  }, [matchRequests]);

  useEffect(() => {
    localStorage.setItem('pendingAppointmentRequests', JSON.stringify(appointmentRequests));
  }, [appointmentRequests]);

  useEffect(() => {
    localStorage.setItem('smartHireCandidates', JSON.stringify(smartHireCandidates));
  }, [smartHireCandidates]);

  const handleMatchRequestAction = (id: string, action: 'approve' | 'reject') => {
    setMatchRequests((prev) => prev.map((request) => request.id === id ? { ...request, status: action === 'approve' ? 'approved' : 'rejected' } : request));
    toast.success(`Match request ${action}ed.`);
  };

  const handleAppointmentRequestAction = (id: string, action: 'approve' | 'reject') => {
    setAppointmentRequests((prev) => prev.map((request) => request.id === id ? { ...request, status: action === 'approve' ? 'approved' : 'rejected' } : request));
    toast.success(`Appointment request ${action}ed.`);
  };

  const tabs = [
    { id: 'users', label: 'User Management', icon: Users },
    { id: 'verifications', label: 'Verifications', icon: ShieldCheck },
    { id: 'reports', label: 'Reports', icon: Flag },
    { id: 'smarthire', label: 'SmartHire', icon: Briefcase },
    { id: 'requests', label: 'Requests', icon: HeartHandshake },
    { id: 'integrations', label: 'Integrations', icon: UserCheck },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  ];

  return (
    <div className="min-h-screen bg-[hsl(var(--background))]">
      <Header theme={theme} toggleTheme={toggleTheme} mobileMode={mobileMode} toggleMobileMode={toggleMobileMode} />

      <main className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-8">
            <h1 className="font-heading text-3xl font-bold text-[hsl(var(--foreground))] mb-2">
              Admin Panel
            </h1>
            <p className="text-[hsl(var(--muted-foreground))]">
              Manage users, verifications, reports, and view platform analytics
            </p>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mb-8 bg-[hsl(var(--muted))]/40 p-1 rounded-xl">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
                    activeTab === tab.id
                      ? 'bg-white dark:bg-[hsl(var(--card))] text-[hsl(var(--foreground))] shadow-sm'
                      : 'text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]'
                  }`}
                >
                  <Icon size={16} />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Tab Content */}
          <div className="space-y-6">
            {activeTab === 'users' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-2xl p-6"
              >
                <h2 className="font-heading text-xl font-semibold text-[hsl(var(--foreground))] mb-6">
                  User Management
                </h2>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-[hsl(var(--border))]">
                        <th className="text-left py-3 px-4 text-sm font-medium text-[hsl(var(--muted-foreground))]">User</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-[hsl(var(--muted-foreground))]">Role</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-[hsl(var(--muted-foreground))]">Status</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-[hsl(var(--muted-foreground))]">Verified</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-[hsl(var(--muted-foreground))]">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((user) => (
                        <tr key={user.id} className="border-b border-[hsl(var(--border))]/50">
                          <td className="py-4 px-4">
                            <div>
                              <p className="font-medium text-[hsl(var(--foreground))]">{user.name}</p>
                              <p className="text-sm text-[hsl(var(--muted-foreground))]">{user.email}</p>
                            </div>
                          </td>
                          <td className="py-4 px-4 text-sm text-[hsl(var(--foreground))]">{user.role}</td>
                          <td className="py-4 px-4">
                            <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                              user.status === 'active'
                                ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                                : 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400'
                            }`}>
                              {user.status}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            {user.verified ? (
                              <CheckCircle size={16} className="text-green-500" />
                            ) : (
                              <XCircle size={16} className="text-red-500" />
                            )}
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex gap-2">
                              {!user.verified && (
                                <button
                                  onClick={() => handleUserAction(user.id, 'verify')}
                                  className="p-1 rounded-lg bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/20 dark:text-green-400 dark:hover:bg-green-900/30 transition-colors"
                                  title="Verify user"
                                >
                                  <UserCheck size={14} />
                                </button>
                              )}
                              {user.status === 'active' ? (
                                <button
                                  onClick={() => handleUserAction(user.id, 'suspend')}
                                  className="p-1 rounded-lg bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30 transition-colors"
                                  title="Suspend user"
                                >
                                  <UserX size={14} />
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleUserAction(user.id, 'activate')}
                                  className="p-1 rounded-lg bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/20 dark:text-green-400 dark:hover:bg-green-900/30 transition-colors"
                                  title="Activate user"
                                >
                                  <UserCheck size={14} />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}

            {activeTab === 'verifications' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-2xl p-6"
              >
                <h2 className="font-heading text-xl font-semibold text-[hsl(var(--foreground))] mb-6">
                  Verification Queue
                </h2>
                <div className="space-y-4">
                  {verifications.map((verification) => (
                    <div key={verification.id} className="flex items-center justify-between p-4 bg-[hsl(var(--muted))]/40 rounded-lg">
                      <div>
                        <p className="font-medium text-[hsl(var(--foreground))]">{verification.userName}</p>
                        <p className="text-sm text-[hsl(var(--muted-foreground))]">Pro: {verification.professionalId}</p>
                        <p className="text-xs text-[hsl(var(--muted-foreground))]">
                          Status: {verification.status} · {verification.submittedAt ? new Date(verification.submittedAt).toLocaleDateString() : 'draft'}
                        </p>
                      </div>
                      {verification.status === 'pending' && (
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => handleVerificationAction(verification.id, 'approve')}
                            className="px-3 py-1 rounded-lg bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400 text-sm font-medium"
                          >
                            Approve
                          </button>
                          <button
                            type="button"
                            onClick={() => handleVerificationAction(verification.id, 'reject')}
                            className="px-3 py-1 rounded-lg bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400 text-sm font-medium"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === 'reports' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-2xl p-6"
              >
                <h2 className="font-heading text-xl font-semibold text-[hsl(var(--foreground))] mb-6">
                  Reported Content
                </h2>
                <div className="space-y-4">
                  {reports.map((report) => (
                    <div key={report.id} className="p-4 bg-[hsl(var(--muted))]/40 rounded-lg">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="font-medium text-[hsl(var(--foreground))]">Reported: {report.reportedUserName}</p>
                          <p className="text-sm text-[hsl(var(--muted-foreground))]">By: {report.reporterName}</p>
                          <p className="text-xs text-[hsl(var(--muted-foreground))]">Reason: {report.reason}</p>
                          <p className="text-xs text-[hsl(var(--muted-foreground))]">Date: {report.date}</p>
                        </div>
                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                          report.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400'
                            : report.status === 'resolved'
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                            : 'bg-gray-100 text-gray-700 dark:bg-gray-900/20 dark:text-gray-400'
                        }`}>
                          {report.status}
                        </span>
                      </div>
                      {report.status === 'pending' && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleReportAction(report.id, 'resolve')}
                            className="px-3 py-1 rounded-lg bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/20 dark:text-green-400 dark:hover:bg-green-900/30 text-sm font-medium transition-colors"
                          >
                            Resolve
                          </button>
                          <button
                            onClick={() => handleReportAction(report.id, 'dismiss')}
                            className="px-3 py-1 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-900/20 dark:text-gray-400 dark:hover:bg-gray-900/30 text-sm font-medium transition-colors"
                          >
                            Dismiss
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === 'smarthire' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="grid gap-6 lg:grid-cols-2">
                  <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-2xl p-6">
                    <h2 className="font-heading text-xl font-semibold text-[hsl(var(--foreground))] mb-4">SmartHire Candidate Pipeline</h2>
                    <div className="space-y-4">
                      {smartHireCandidates.length === 0 ? (
                        <p className="text-sm text-[hsl(var(--muted-foreground))]">No candidates have entered the ATS pipeline yet.</p>
                      ) : (
                        smartHireCandidates.map((candidate) => (
                          <div key={candidate.id} className="rounded-3xl bg-[hsl(var(--muted))] border border-[hsl(var(--border))] p-4">
                            <div className="flex items-center justify-between gap-3">
                              <div>
                                <p className="font-semibold text-[hsl(var(--foreground))]">{candidate.name}</p>
                                <p className="text-xs text-[hsl(var(--muted-foreground))]">Applied for {candidate.desiredRole} • {candidate.appliedAt}</p>
                              </div>
                              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${candidate.status === 'pending' ? 'bg-amber-100 text-amber-700' : candidate.status === 'shortlisted' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>{candidate.status}</span>
                            </div>
                            <div className="mt-4 grid gap-3 sm:grid-cols-3">
                              <div className="rounded-3xl bg-white/90 p-3 text-sm">
                                <p className="text-[hsl(var(--muted-foreground))]">ATS Score</p>
                                <p className="font-semibold text-[hsl(var(--foreground))]">{candidate.atsScore}</p>
                              </div>
                              <div className="rounded-3xl bg-white/90 p-3 text-sm">
                                <p className="text-[hsl(var(--muted-foreground))]">Fit</p>
                                <p className="font-semibold text-[hsl(var(--foreground))]">{candidate.fitScore}%</p>
                              </div>
                              <div className="rounded-3xl bg-white/90 p-3 text-sm">
                                <p className="text-[hsl(var(--muted-foreground))]">Education</p>
                                <p className="font-semibold text-[hsl(var(--foreground))]">{candidate.education}</p>
                              </div>
                            </div>
                            <div className="mt-4 flex flex-wrap gap-2">
                              <button onClick={() => setSmartHireCandidates((prev) => prev.map((item) => item.id === candidate.id ? { ...item, status: 'shortlisted' } : item))} className="rounded-full bg-green-500 px-4 py-2 text-xs font-semibold text-white hover:bg-green-600 transition-all duration-200">Shortlist</button>
                              <button onClick={() => setSmartHireCandidates((prev) => prev.map((item) => item.id === candidate.id ? { ...item, status: 'rejected' } : item))} className="rounded-full bg-rose-500 px-4 py-2 text-xs font-semibold text-white hover:bg-rose-600 transition-all duration-200">Reject</button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                  <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-2xl p-6">
                    <h2 className="font-heading text-xl font-semibold text-[hsl(var(--foreground))] mb-4">SmartHire Job Management</h2>
                    <p className="text-sm text-[hsl(var(--muted-foreground))]">View candidate ranking and manage hiring status from the Admin portal.</p>
                    <div className="mt-6 space-y-4">
                      <div className="rounded-3xl bg-[hsl(var(--muted))] p-4">
                        <p className="text-sm text-[hsl(var(--muted-foreground))]">SmartHire connects candidates to modern external boards and brings ATS scoring directly into the platform.</p>
                      </div>
                      <div className="rounded-3xl bg-[hsl(var(--muted))] p-4">
                        <p className="text-sm text-[hsl(var(--muted-foreground))]">Use the candidate pipeline above to approve or reject applications, then send automated email updates from the SmartHire portal.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'requests' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="grid gap-6 lg:grid-cols-2">
                  <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-2xl p-6">
                    <h2 className="font-heading text-xl font-semibold text-[hsl(var(--foreground))] mb-4">Swipe Match Requests</h2>
                    <div className="space-y-4">
                      {matchRequests.length === 0 ? (
                        <p className="text-sm text-[hsl(var(--muted-foreground))]">No pending match requests right now.</p>
                      ) : (
                        matchRequests.map((request) => (
                          <div key={request.id} className="p-4 rounded-2xl bg-[hsl(var(--muted))] border border-[hsl(var(--border))]">
                            <div className="flex items-center gap-3 mb-3">
                              <img src={request.avatar} alt={request.name} className="w-12 h-12 rounded-2xl object-cover" />
                              <div>
                                <p className="font-medium text-[hsl(var(--foreground))]">{request.name}</p>
                                <p className="text-sm text-[hsl(var(--muted-foreground))]">{request.role}</p>
                              </div>
                            </div>
                            <div className="flex items-center justify-between gap-3 text-xs text-[hsl(var(--muted-foreground))] mb-4">
                              <span>Requested at {request.requestedAt}</span>
                              <span className={`px-2 py-1 rounded-full ${request.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : request.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{request.status}</span>
                            </div>
                            {request.status === 'pending' && (
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleMatchRequestAction(request.id, 'approve')}
                                  className="flex-1 rounded-full bg-green-500 text-white py-2 text-xs font-semibold hover:bg-green-600 transition-all duration-200"
                                >
                                  Approve
                                </button>
                                <button
                                  onClick={() => handleMatchRequestAction(request.id, 'reject')}
                                  className="flex-1 rounded-full bg-rose-500 text-white py-2 text-xs font-semibold hover:bg-rose-600 transition-all duration-200"
                                >
                                  Reject
                                </button>
                              </div>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-2xl p-6">
                    <h2 className="font-heading text-xl font-semibold text-[hsl(var(--foreground))] mb-4">Appointment Requests</h2>
                    <div className="space-y-4">
                      {appointmentRequests.length === 0 ? (
                        <p className="text-sm text-[hsl(var(--muted-foreground))]">No pending appointment requests right now.</p>
                      ) : (
                        appointmentRequests.map((request) => (
                          <div key={request.id} className="p-4 rounded-2xl bg-[hsl(var(--muted))] border border-[hsl(var(--border))]">
                            <p className="font-medium text-[hsl(var(--foreground))]">{request.title}</p>
                            <p className="text-sm text-[hsl(var(--muted-foreground))]">{request.time}</p>
                            <p className="text-xs text-[hsl(var(--muted-foreground))] mt-2">Requested at {request.requestedAt}</p>
                            <div className="mt-4 flex gap-2">
                              <button
                                onClick={() => handleAppointmentRequestAction(request.id, 'approve')}
                                className="flex-1 rounded-full bg-green-500 text-white py-2 text-xs font-semibold hover:bg-green-600 transition-all duration-200"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleAppointmentRequestAction(request.id, 'reject')}
                                className="flex-1 rounded-full bg-rose-500 text-white py-2 text-xs font-semibold hover:bg-rose-600 transition-all duration-200"
                              >
                                Reject
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'integrations' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-2xl p-6"
              >
                <h2 className="font-heading text-xl font-semibold text-[hsl(var(--foreground))] mb-6">
                  Connected Integrations
                </h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  {integrations.map((integration) => (
                    <div key={integration.id} className="p-4 bg-[hsl(var(--muted))]/40 rounded-2xl border border-[hsl(var(--border))]">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <p className="font-medium text-[hsl(var(--foreground))]">{integration.name}</p>
                          <p className="text-xs text-[hsl(var(--muted-foreground))]">Linked users: {integration.linkedUsers}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${integration.status === 'active' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400' : 'bg-rose-100 text-rose-700 dark:bg-rose-900/20 dark:text-rose-400'}`}>
                          {integration.status}
                        </span>
                      </div>
                      <button
                        onClick={() => handleIntegrationToggle(integration.id)}
                        className={`w-full rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 ${integration.status === 'active' ? 'bg-rose-500 text-white hover:bg-rose-600' : 'bg-[hsl(var(--cp-blue))] text-white hover:bg-[hsl(var(--cp-blue))]/90'}`}
                      >
                        {integration.status === 'active' ? 'Disable integration' : 'Enable integration'}
                      </button>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === 'analytics' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-2xl p-6">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-xl">
                        <UserPlus className="text-blue-600 dark:text-blue-400" size={24} />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-[hsl(var(--foreground))]">1,200</p>
                        <p className="text-sm text-[hsl(var(--muted-foreground))]">Total Signups</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-2xl p-6">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-xl">
                        <HeartHandshake className="text-green-600 dark:text-green-400" size={24} />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-[hsl(var(--foreground))]">410</p>
                        <p className="text-sm text-[hsl(var(--muted-foreground))]">Connections Made</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-2xl p-6">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-xl">
                        <DollarSign className="text-purple-600 dark:text-purple-400" size={24} />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-[hsl(var(--foreground))]">$43,200</p>
                        <p className="text-sm text-[hsl(var(--muted-foreground))]">Revenue</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-2xl p-6">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-orange-100 dark:bg-orange-900/20 rounded-xl">
                        <TrendingUp className="text-orange-600 dark:text-orange-400" size={24} />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-[hsl(var(--foreground))]">+24%</p>
                        <p className="text-sm text-[hsl(var(--muted-foreground))]">Growth Rate</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Charts Placeholder */}
                <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-2xl p-6">
                  <h3 className="font-heading text-lg font-semibold text-[hsl(var(--foreground))] mb-6">
                    Platform Analytics
                  </h3>
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Signups Chart */}
                    <div className="space-y-4">
                      <h4 className="font-medium text-[hsl(var(--foreground))] flex items-center gap-2">
                        <UserPlus size={16} className="text-blue-500" />
                        User Signups
                      </h4>
                      <div className="space-y-2">
                        {mockAnalytics.signups.map((data) => (
                          <div key={data.month} className="flex items-center justify-between">
                            <span className="text-sm text-[hsl(var(--muted-foreground))]">{data.month}</span>
                            <div className="flex items-center gap-2">
                              <div className="w-20 bg-[hsl(var(--muted))]/40 rounded-full h-2">
                                <div
                                  className="bg-blue-500 h-2 rounded-full"
                                  style={{ width: `${(data.count / 300) * 100}%` }}
                                ></div>
                              </div>
                              <span className="text-sm font-medium text-[hsl(var(--foreground))] w-8">{data.count}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Connections Chart */}
                    <div className="space-y-4">
                      <h4 className="font-medium text-[hsl(var(--foreground))] flex items-center gap-2">
                        <HeartHandshake size={16} className="text-green-500" />
                        Connections
                      </h4>
                      <div className="space-y-2">
                        {mockAnalytics.connections.map((data) => (
                          <div key={data.month} className="flex items-center justify-between">
                            <span className="text-sm text-[hsl(var(--muted-foreground))]">{data.month}</span>
                            <div className="flex items-center gap-2">
                              <div className="w-20 bg-[hsl(var(--muted))]/40 rounded-full h-2">
                                <div
                                  className="bg-green-500 h-2 rounded-full"
                                  style={{ width: `${(data.count / 130) * 100}%` }}
                                ></div>
                              </div>
                              <span className="text-sm font-medium text-[hsl(var(--foreground))] w-8">{data.count}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Revenue Chart */}
                    <div className="space-y-4">
                      <h4 className="font-medium text-[hsl(var(--foreground))] flex items-center gap-2">
                        <DollarSign size={16} className="text-purple-500" />
                        Revenue ($)
                      </h4>
                      <div className="space-y-2">
                        {mockAnalytics.revenue.map((data) => (
                          <div key={data.month} className="flex items-center justify-between">
                            <span className="text-sm text-[hsl(var(--muted-foreground))]">{data.month}</span>
                            <div className="flex items-center gap-2">
                              <div className="w-20 bg-[hsl(var(--muted))]/40 rounded-full h-2">
                                <div
                                  className="bg-purple-500 h-2 rounded-full"
                                  style={{ width: `${(data.amount / 8200) * 100}%` }}
                                ></div>
                              </div>
                              <span className="text-sm font-medium text-[hsl(var(--foreground))] w-10">${data.amount}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Admin;