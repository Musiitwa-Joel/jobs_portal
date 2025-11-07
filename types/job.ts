export interface Job {
  id: string;
  title: string;
  department: string;
  location: string;
  employmentType: 'Full-time' | 'Part-time' | 'Contract' | 'Temporary';
  description: string;
  responsibilities: string[];
  qualifications: string[];
  benefits: string[];
  deadline: string;
  datePosted: string;
  eligibility: 'Internal' | 'External' | 'Both';
  salary?: string;
}

export interface Application {
  id: string;
  jobId: string;
  jobTitle: string;
  applicantName: string;
  email: string;
  phone: string;
  resumeUrl: string;
  coverLetter?: string;
  employeeId?: string;
  status: 'Submitted' | 'Under Review' | 'Shortlisted' | 'Rejected' | 'Hired';
  submittedDate: string;
  referenceNumber: string;
}

export interface JobFilters {
  department?: string;
  location?: string;
  employmentType?: string;
  datePosted?: string;
  search?: string;
}
