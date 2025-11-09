export type JobPostingStatus = "ACTIVE" | "CLOSING" | "CLOSED" | "DRAFT";

export type JobPostingVisibility = "INTERNAL" | "EXTERNAL" | "BOTH";

export interface JobPosting {
  id: string;
  jobCode: string;
  jobTitle: string;
  department?: string | null;
  employmentType?: string | null;
  workLocation?: string | null;
  visibility: JobPostingVisibility;
  status: JobPostingStatus;
  openings: number;
  openingsFilled: number;
  openingDate?: string | null;
  closingDate?: string | null;
  postedDate?: string | null;
  autoClose: boolean;
  acceptOverflow: boolean;
  displaySalary: string;
  minSalary?: number | null;
  maxSalary?: number | null;
  currency?: string | null;
  payPeriod?: string | null;
  salaryLabel?: string | null;
  jobSummary?: string | null;
  notes?: string | null;
  metadata?: Record<string, unknown> | null;
}

export interface JobPostingJobDescription {
  id: string;
  jobCode?: string | null;
  jobTitle?: string | null;
  positionName?: string | null;
  category?: string | null;
  jobFamily?: string | null;
  department?: string | null;
  division?: string | null;
  employmentType?: string | null;
  grade?: string | null;
  reportsTo?: string | null;
  workLocation?: string | null;
  status?: string | null;
  jobSummary?: string | null;
  responsibilities?: string[] | null;
  education?: string | null;
  experience?: string | null;
  technicalSkills?: string[] | null;
  softSkills?: string[] | null;
  certifications?: string[] | null;
  kpis?: string[] | null;
  languages?: string[] | null;
  benefits?: string[] | null;
  additionalBenefits?: string[] | null;
  approvedPositions?: number | null;
  filledPositions?: number | null;
  openings?: number | null;
}

export interface JobPostingWithDescription extends JobPosting {
  jobDescription?: JobPostingJobDescription | null;
}

export interface JobPostingMetrics {
  total: number;
  active: number;
  closing: number;
  closed: number;
  draft: number;
}

export interface JobPostingConnection {
  data: JobPosting[];
  total: number;
  metrics: JobPostingMetrics;
}

export interface JobPostingFilters {
  department?: string;
  workLocation?: string;
  employmentType?: string;
  search?: string;
}

export type JobApplicationStatus =
  | "NEW"
  | "IN_REVIEW"
  | "SHORTLISTED"
  | "INTERVIEW"
  | "OFFER"
  | "REJECTED"
  | "HIRED"
  | "WITHDRAWN";

export interface JobApplicant {
  id: string;
  applicantCode: string;
  jobPostingId: string;
  jobTitle: string;
  jobCode: string;
  status: JobApplicationStatus;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone?: string | null;
  source?: string | null;
  createdAt: string;
  expectedSalary?: number | null;
  resumeName?: string | null;
  resumeMimeType?: string | null;
  resumeSize?: number | null;
  coverLetterIncluded?: boolean;
  linkedinUrl?: string | null;
  portfolioUrl?: string | null;
  currentEmployer?: string | null;
  currentTitle?: string | null;
  experienceYears?: number | null;
  noticePeriod?: string | null;
  salaryCurrency?: string | null;
  message?: string | null;
  metadata?: Record<string, unknown> | null;
}

export interface JobApplicantWithPosting extends JobApplicant {
  jobPosting?: {
    id: string;
    jobTitle?: string | null;
    jobCode?: string | null;
  } | null;
}
