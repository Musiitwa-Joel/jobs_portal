import { gql } from "@apollo/client";

const JOB_POSTING_CORE_FIELDS = gql`
  fragment JobPostingCoreFields on JobPosting {
    id
    jobCode
    jobTitle
    department
    employmentType
    workLocation
    visibility
    status
    openings
    openingsFilled
    openingDate
    closingDate
    postedDate
    autoClose
    acceptOverflow
    displaySalary
    minSalary
    maxSalary
    currency
    payPeriod
    salaryLabel
    jobSummary
    notes
    metadata
  }
`;

export const JOB_POSTINGS_QUERY = gql`
  ${JOB_POSTING_CORE_FIELDS}
  query JobsPortalJobPostings(
    $limit: Int!
    $offset: Int!
    $filter: JobPostingFilter
  ) {
    jobPostings(limit: $limit, offset: $offset, filter: $filter) {
      data {
        ...JobPostingCoreFields
      }
      total
      metrics {
        total
        active
        closing
        closed
        draft
      }
    }
  }
`;

export const JOB_POSTING_QUERY = gql`
  ${JOB_POSTING_CORE_FIELDS}
  query JobsPortalJobPosting($id: ID!) {
    jobPosting(id: $id) {
      ...JobPostingCoreFields
      jobDescription {
        id
        jobCode
        jobTitle
        positionName
        category
        jobFamily
        department
        division
        employmentType
        grade
        reportsTo
        workLocation
        status
        jobSummary
        responsibilities
        education
        experience
        technicalSkills
        softSkills
        certifications
        kpis
        languages
        benefits
        additionalBenefits
        approvedPositions
        filledPositions
        openings
      }
    }
  }
`;

export const JOB_APPLICANT_BY_REFERENCE_QUERY = gql`
  query JobsPortalApplicantByReference(
    $limit: Int!
    $filter: JobApplicantFilter
  ) {
    jobApplicants(limit: $limit, filter: $filter) {
      data {
        id
        applicantCode
        jobPostingId
        jobTitle
        jobCode
        status
        firstName
        lastName
        fullName
        email
        phone
        source
        createdAt
        expectedSalary
        resumeName
        resumeMimeType
        resumeSize
        coverLetterIncluded
        linkedinUrl
        portfolioUrl
        currentEmployer
        currentTitle
        experienceYears
        noticePeriod
        salaryCurrency
        message
        metadata
        jobPosting {
          id
          jobTitle
          jobCode
        }
      }
      total
    }
  }
`;
