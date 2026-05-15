export type DocumentType =
  | 'aadhaar'
  | 'pan'
  | 'certificate'
  | 'resume'
  | 'experience'
  | 'company';

export type DocStatus = 'not_submitted' | 'pending' | 'approved' | 'rejected';

export type VerificationDoc = {
  type: DocumentType;
  fileName?: string;
  uploadedAt?: string;
  status: DocStatus;
  rejectionReason?: string;
};

export type RequestStatus = 'draft' | 'pending' | 'approved' | 'rejected' | 'partial';

export type VerificationRequest = {
  id: string;
  userId: string;
  userName: string;
  professionalId: string;
  companyName?: string;
  experienceYears?: number;
  experienceSummary?: string;
  documents: VerificationDoc[];
  status: RequestStatus;
  submittedAt?: string;
  reviewedAt?: string;
  adminNote?: string;
};

export type ProfessionalVerification = {
  professionalId: string;
  identityVerified: boolean;
  taxVerified: boolean;
  credentialsVerified: boolean;
  experienceVerified: boolean;
  companyVerified: boolean;
  companyName?: string;
  badgeLevel: BadgeLevel;
  updatedAt: string;
};

export type BadgeLevel = 'none' | 'basic' | 'pro' | 'elite';

const REQUESTS_KEY = 'cp-verification-requests';
const PRO_VERIFICATION_KEY = 'cp-professional-verifications';

export const DOCUMENT_META: Record<
  DocumentType,
  { label: string; description: string; required: boolean }
> = {
  aadhaar: { label: 'Aadhaar', description: 'Government ID — front & back', required: true },
  pan: { label: 'PAN Card', description: 'Permanent Account Number card', required: true },
  certificate: { label: 'Certificates', description: 'Degree or professional certifications', required: true },
  resume: { label: 'Resume / CV', description: 'Latest resume with work history', required: true },
  experience: { label: 'Experience Proof', description: 'Offer letter, experience letter, or portfolio', required: true },
  company: { label: 'Company Verification', description: 'Company registration or employment proof', required: false },
};

export function defaultDocuments(): VerificationDoc[] {
  return (Object.keys(DOCUMENT_META) as DocumentType[]).map(type => ({
    type,
    status: 'not_submitted',
  }));
}

function loadRequests(): VerificationRequest[] {
  try {
    const raw = localStorage.getItem(REQUESTS_KEY);
    return raw ? (JSON.parse(raw) as VerificationRequest[]) : [];
  } catch {
    return [];
  }
}

function saveRequests(requests: VerificationRequest[]): void {
  localStorage.setItem(REQUESTS_KEY, JSON.stringify(requests));
}

function loadProVerifications(): Record<string, ProfessionalVerification> {
  try {
    const raw = localStorage.getItem(PRO_VERIFICATION_KEY);
    return raw ? (JSON.parse(raw) as Record<string, ProfessionalVerification>) : {};
  } catch {
    return {};
  }
}

function saveProVerifications(map: Record<string, ProfessionalVerification>): void {
  localStorage.setItem(PRO_VERIFICATION_KEY, JSON.stringify(map));
}

export function computeBadgeLevel(verification: ProfessionalVerification): BadgeLevel {
  const score =
    (verification.identityVerified ? 1 : 0) +
    (verification.taxVerified ? 1 : 0) +
    (verification.credentialsVerified ? 1 : 0) +
    (verification.experienceVerified ? 1 : 0) +
    (verification.companyVerified ? 1 : 0);

  if (score >= 5) return 'elite';
  if (score >= 4) return 'pro';
  if (score >= 2) return 'basic';
  return 'none';
}

export function getProfessionalVerification(professionalId: string): ProfessionalVerification | null {
  const map = loadProVerifications();
  return map[professionalId] ?? null;
}

export function isPubliclyVerified(professionalId: string, fallbackVerified = false): boolean {
  const v = getProfessionalVerification(professionalId);
  if (v) return v.badgeLevel !== 'none';
  return fallbackVerified;
}

export function getRequestForUser(userId: string, professionalId: string): VerificationRequest | null {
  return (
    loadRequests().find(r => r.userId === userId && r.professionalId === professionalId) ?? null
  );
}

export function getPendingRequests(): VerificationRequest[] {
  return loadRequests().filter(r => r.status === 'pending');
}

export function getAllRequests(): VerificationRequest[] {
  return loadRequests().sort(
    (a, b) => new Date(b.submittedAt ?? 0).getTime() - new Date(a.submittedAt ?? 0).getTime(),
  );
}

export function upsertDraftRequest(params: {
  userId: string;
  userName: string;
  professionalId: string;
  companyName?: string;
  experienceYears?: number;
  experienceSummary?: string;
  documents: VerificationDoc[];
}): VerificationRequest {
  const requests = loadRequests();
  const existing = requests.find(
    r => r.userId === params.userId && r.professionalId === params.professionalId,
  );

  const request: VerificationRequest = existing
    ? {
        ...existing,
        ...params,
        status: existing.status === 'approved' ? 'approved' : 'draft',
      }
    : {
        id: `vr-${Date.now()}`,
        ...params,
        status: 'draft',
        documents: params.documents,
      };

  const next = existing
    ? requests.map(r => (r.id === request.id ? request : r))
    : [request, ...requests];
  saveRequests(next);
  return request;
}

export function submitVerificationRequest(requestId: string): VerificationRequest | null {
  const requests = loadRequests();
  const idx = requests.findIndex(r => r.id === requestId);
  if (idx < 0) return null;

  const req = requests[idx];
  const required = (Object.keys(DOCUMENT_META) as DocumentType[]).filter(
    t => DOCUMENT_META[t].required,
  );
  const missing = required.filter(
    t => !req.documents.find(d => d.type === t && d.status !== 'not_submitted' && d.fileName),
  );
  if (missing.length > 0) return null;

  const updated: VerificationRequest = {
    ...req,
    status: 'pending',
    submittedAt: new Date().toISOString(),
    documents: req.documents.map(d =>
      d.fileName && d.status === 'not_submitted' ? { ...d, status: 'pending' as DocStatus } : d,
    ),
  };
  requests[idx] = updated;
  saveRequests(requests);
  return updated;
}

function buildProVerificationFromRequest(req: VerificationRequest): ProfessionalVerification {
  const doc = (t: DocumentType) => req.documents.find(d => d.type === t);
  const approved = (t: DocumentType) => doc(t)?.status === 'approved';

  const base: ProfessionalVerification = {
    professionalId: req.professionalId,
    identityVerified: approved('aadhaar'),
    taxVerified: approved('pan'),
    credentialsVerified: approved('certificate') && approved('resume'),
    experienceVerified: approved('experience'),
    companyVerified: approved('company'),
    companyName: req.companyName,
    badgeLevel: 'none',
    updatedAt: new Date().toISOString(),
  };
  base.badgeLevel = computeBadgeLevel(base);
  return base;
}

export function adminReviewRequest(
  requestId: string,
  action: 'approve' | 'reject',
  docDecisions?: Partial<Record<DocumentType, 'approved' | 'rejected'>>,
  adminNote?: string,
): VerificationRequest | null {
  const requests = loadRequests();
  const idx = requests.findIndex(r => r.id === requestId);
  if (idx < 0) return null;

  const req = requests[idx];
  let documents = req.documents;

  if (action === 'approve' && docDecisions) {
    documents = documents.map(d => {
      const decision = docDecisions[d.type];
      if (!decision) return d;
      return {
        ...d,
        status: decision,
        rejectionReason: decision === 'rejected' ? adminNote : undefined,
      };
    });
  } else if (action === 'reject') {
    documents = documents.map(d =>
      d.status === 'pending' ? { ...d, status: 'rejected' as DocStatus, rejectionReason: adminNote } : d,
    );
  } else if (action === 'approve') {
    documents = documents.map(d =>
      d.status === 'pending' ? { ...d, status: 'approved' as DocStatus } : d,
    );
  }

  const allApproved = documents.filter(d => d.fileName).every(d => d.status === 'approved');
  const anyRejected = documents.some(d => d.status === 'rejected');
  const status: RequestStatus =
    action === 'reject' ? 'rejected' : allApproved ? 'approved' : anyRejected ? 'partial' : 'approved';

  const updated: VerificationRequest = {
    ...req,
    documents,
    status,
    reviewedAt: new Date().toISOString(),
    adminNote,
  };
  requests[idx] = updated;
  saveRequests(requests);

  if (status === 'approved' || status === 'partial') {
    const map = loadProVerifications();
    map[req.professionalId] = buildProVerificationFromRequest(updated);
    saveProVerifications(map);
  }

  return updated;
}

export function seedDemoVerifications(): void {
  if (loadProVerifications()['p1']) return;
  const demo: ProfessionalVerification = {
    professionalId: 'p1',
    identityVerified: true,
    taxVerified: true,
    credentialsVerified: true,
    experienceVerified: true,
    companyVerified: false,
    badgeLevel: 'pro',
    updatedAt: new Date().toISOString(),
  };
  saveProVerifications({ p1: demo });
}
