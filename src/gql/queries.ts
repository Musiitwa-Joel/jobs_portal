import { gql } from "@apollo/client";

export const CURRENT_FEES = gql`
  query current_fees {
    current_fees {
      id
      item_id
      fee_item {
        item_code
        item_name
        item_description
      }
      amount
    }
  }
`;

export const PRT_DETAILS = gql`
  query get_prt_details($prt: String!) {
    get_prt_details(prt: $prt) {
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
      payment_date
      tnx_id
      bank_name
      generated_by_name
      bank_branch
      invs {
        item_id
        item_code
        item_name
        amount
      }
    }
  }
`;
