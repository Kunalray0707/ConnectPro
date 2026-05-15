import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Upload, FileText, CheckCircle, X, Award,
  ChevronRight, ChevronLeft, Shield, AlertCircle, Building2, Briefcase,
} from 'lucide-react';
import { toast } from 'react-toastify';
import {
  DOCUMENT_META,
  defaultDocuments,
  type DocumentType,
  type VerificationDoc,
  upsertDraftRequest,
  submitVerificationRequest,
  getRequestForUser,
} from '../lib/verification';

interface VerificationWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
  userId: string;
  userName: string;
  professionalId: string;
}

const VerificationWizard: React.FC<VerificationWizardProps> = ({
  isOpen,
  onClose,
  onComplete,
  userId,
  userName,
  professionalId,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [documents, setDocuments] = useState<VerificationDoc[]>(defaultDocuments());
  const [companyName, setCompanyName] = useState('');
  const [experienceYears, setExperienceYears] = useState('');
  const [experienceSummary, setExperienceSummary] = useState('');
  const [requestId, setRequestId] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    const existing = getRequestForUser(userId, professionalId);
    if (existing) {
      setDocuments(existing.documents.length ? existing.documents : defaultDocuments());
      setCompanyName(existing.companyName ?? '');
      setExperienceYears(existing.experienceYears?.toString() ?? '');
      setExperienceSummary(existing.experienceSummary ?? '');
      setRequestId(existing.id);
      if (existing.status === 'pending') setCurrentStep(3);
    } else {
      setDocuments(defaultDocuments());
      setCompanyName('');
      setExperienceYears('');
      setExperienceSummary('');
      setRequestId(null);
      setCurrentStep(0);
    }
  }, [isOpen, userId, professionalId]);

  const steps = [
    { title: 'Overview', description: 'Verification types' },
    { title: 'Experience', description: 'Work & company details' },
    { title: 'Documents', description: 'Upload Aadhaar, PAN, certs, resume' },
    { title: 'Submit', description: 'Admin review queue' },
  ];

  const docList = (Object.keys(DOCUMENT_META) as DocumentType[]).map(type => ({
    type,
    ...DOCUMENT_META[type],
    doc: documents.find(d => d.type === type)!,
  }));

  const handleFileUpload = (documentType: DocumentType, file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }
    const allowed = ['image/jpeg', 'image/png', 'application/pdf'];
    if (!allowed.includes(file.type)) {
      toast.error('Upload JPEG, PNG, or PDF only');
      return;
    }
    setDocuments(prev =>
      prev.map(d =>
        d.type === documentType
          ? { ...d, fileName: file.name, uploadedAt: new Date().toISOString(), status: 'not_submitted' }
          : d,
      ),
    );
    toast.success(`${DOCUMENT_META[documentType].label} uploaded`);
  };

  const persistDraft = () => {
    const req = upsertDraftRequest({
      userId,
      userName,
      professionalId,
      companyName: companyName || undefined,
      experienceYears: experienceYears ? Number(experienceYears) : undefined,
      experienceSummary: experienceSummary || undefined,
      documents,
    });
    setRequestId(req.id);
    return req;
  };

  const handleNext = () => {
    if (currentStep === 1 && !experienceSummary.trim()) {
      toast.error('Please add a brief experience summary');
      return;
    }
    if (currentStep === 2) {
      const required = (Object.keys(DOCUMENT_META) as DocumentType[]).filter(t => DOCUMENT_META[t].required);
      const missing = required.filter(t => !documents.find(d => d.type === t)?.fileName);
      if (missing.length > 0) {
        toast.error(`Upload required: ${missing.map(t => DOCUMENT_META[t].label).join(', ')}`);
        return;
      }
    }
    persistDraft();
    setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
  };

  const handleSubmit = () => {
    const req = persistDraft();
    const submitted = submitVerificationRequest(req.id);
    if (!submitted) {
      toast.error('Complete all required documents before submitting');
      return;
    }
    toast.success('Submitted for admin review. Badge appears after approval.');
    setCurrentStep(3);
    onComplete();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
      >
        <div className="flex items-center justify-between p-6 border-b border-[hsl(var(--border))]">
          <div className="flex items-center gap-3">
            <Shield className="text-[hsl(var(--cp-blue))]" size={24} />
            <div>
              <h2 className="font-heading font-semibold text-lg text-[hsl(var(--foreground))]">
                Professional Verification
              </h2>
              <p className="text-sm text-[hsl(var(--muted-foreground))]">Build trust — remove fake ratings</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="p-2 rounded-lg hover:bg-[hsl(var(--muted))]">
            <X size={20} />
          </button>
        </div>

        <motion.div className="px-6 py-3 bg-[hsl(var(--muted))]/30 text-xs text-[hsl(var(--muted-foreground))] flex flex-wrap gap-2">
          {steps.map((s, i) => (
            <span key={s.title} className={i === currentStep ? 'text-[hsl(var(--cp-indigo))] font-semibold' : ''}>
              {i + 1}. {s.title}
            </span>
          ))}
        </motion.div>

        <div className="p-6 overflow-y-auto max-h-[55vh]">
          {currentStep === 0 && (
            <div className="space-y-4">
              <div className="text-center mb-4">
                <Award className="text-[hsl(var(--cp-blue))] mx-auto mb-2" size={40} />
                <p className="text-sm text-[hsl(var(--muted-foreground))]">
                  Verified pros get public badges. Only clients with verified purchases can rate you.
                </p>
              </div>
              <ul className="space-y-2 text-sm">
                {docList.map(({ type, label, description, required }) => (
                  <li key={type} className="flex gap-3 p-3 border border-[hsl(var(--border))] rounded-lg">
                    <span className="text-[hsl(var(--cp-indigo))] font-bold">{required ? '*' : '○'}</span>
                    <div>
                      <p className="font-medium text-[hsl(var(--foreground))]">{label}</p>
                      <p className="text-xs text-[hsl(var(--muted-foreground))]">{description}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {currentStep === 1 && (
            <div className="space-y-4">
              <h3 className="font-semibold flex items-center gap-2">
                <Briefcase size={18} /> Experience verification
              </h3>
              <motion.div>
                <label className="text-sm font-medium mb-1 block">Years of experience</label>
                <input
                  type="number"
                  min={0}
                  max={50}
                  value={experienceYears}
                  onChange={e => setExperienceYears(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-sm"
                  placeholder="e.g. 5"
                />
              </motion.div>
              <div>
                <label className="text-sm font-medium mb-1 block">Experience summary *</label>
                <textarea
                  value={experienceSummary}
                  onChange={e => setExperienceSummary(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2.5 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-sm"
                  placeholder="Roles, domains, notable clients..."
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 flex items-center gap-2">
                  <Building2 size={16} /> Company name (optional badge)
                </label>
                <input
                  type="text"
                  value={companyName}
                  onChange={e => setCompanyName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-sm"
                  placeholder="Registered company or employer"
                />
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-4">
              <h3 className="font-semibold">Upload documents</h3>
              {docList.map(({ type, label, description, required, doc }) => (
                <div key={type} className="border border-[hsl(var(--border))] rounded-lg p-4">
                  <motion.div className="flex justify-between mb-2">
                    <motion.div>
                      <p className="font-medium text-sm">{label} {required && <span className="text-red-500">*</span>}</p>
                      <p className="text-xs text-[hsl(var(--muted-foreground))]">{description}</p>
                    </motion.div>
                    {doc.fileName && <CheckCircle className="text-green-500" size={18} />}
                  </motion.div>
                  {!doc.fileName ? (
                    <label className="flex items-center justify-center gap-2 p-4 border-2 border-dashed rounded-lg cursor-pointer hover:border-[hsl(var(--cp-blue))]">
                      <Upload size={18} />
                      <span className="text-sm text-[hsl(var(--muted-foreground))]">Upload {label}</span>
                      <input
                        type="file"
                        accept="image/jpeg,image/png,application/pdf"
                        className="hidden"
                        onChange={e => {
                          const file = e.target.files?.[0];
                          if (file) handleFileUpload(type, file);
                        }}
                      />
                    </label>
                  ) : (
                    <div className="flex items-center justify-between p-2 bg-green-50 dark:bg-green-900/20 rounded-lg text-sm">
                      <span className="flex items-center gap-2">
                        <FileText size={14} /> {doc.fileName}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          setDocuments(prev =>
                            prev.map(d => (d.type === type ? { ...d, fileName: undefined, status: 'not_submitted' } : d)),
                          )
                        }
                      >
                        <X size={14} />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {currentStep === 3 && (
            <div className="text-center space-y-4 py-4">
              <CheckCircle className="text-green-500 mx-auto" size={56} />
              <h3 className="font-heading text-xl font-semibold">In admin review queue</h3>
              <p className="text-sm text-[hsl(var(--muted-foreground))]">
                An admin will approve or reject each document. Your verified badge will show publicly once approved.
              </p>
              {requestId && (
                <p className="text-xs text-[hsl(var(--muted-foreground))]">Reference: {requestId}</p>
              )}
            </div>
          )}
        </div>

        {currentStep < 3 && (
          <div className="flex justify-between p-6 border-t border-[hsl(var(--border))]">
            <button
              type="button"
              onClick={() => setCurrentStep(s => Math.max(0, s - 1))}
              disabled={currentStep === 0}
              className="flex items-center gap-1 px-4 py-2 rounded-lg border text-sm disabled:opacity-50"
            >
              <ChevronLeft size={16} /> Back
            </button>
            <button
              type="button"
              onClick={currentStep === 2 ? handleSubmit : handleNext}
              className="flex items-center gap-1 px-4 py-2 rounded-lg bg-[hsl(var(--cp-blue))] text-white text-sm"
            >
              {currentStep === 2 ? 'Submit for review' : 'Next'}
              <ChevronRight size={16} />
            </button>
          </div>
        )}

        {currentStep === 3 && (
          <div className="p-6 border-t">
            <button type="button" onClick={onClose} className="w-full py-3 rounded-lg bg-[hsl(var(--cp-blue))] text-white font-medium">
              Close
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default VerificationWizard;
