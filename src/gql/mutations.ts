import { gql } from "@apollo/client";

export const GENERATE_GLOBAL_PRT = gql`
  mutation GenerateGlobalPRT($payload: GlobalPRTInput) {
    generateGlobalPRT(payload: $payload) {
      id
      student_no
      full_name
      phone_no
      email
      type
      prt
      amount
      status
      allocations
      prt_expiry
      created_at
      generated_by
      invs {
        item_id
        item_code
        item_name
        amount
      }
    }
  }
`;
