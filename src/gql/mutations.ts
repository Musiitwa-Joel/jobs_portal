import { gql } from "@apollo/client";

export const SUBMIT_JOB_APPLICATION_MUTATION = gql`
  mutation JobsPortalSubmitJobApplication($input: SubmitJobApplicationInput!) {
    submitJobApplication(input: $input) {
      applicant {
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
      }
      emailQueued
    }
  }
`;
