import type React from "react";
import { Modal, Button, Divider, QRCode, Row, Col, Typography } from "antd";
import formatDateString from "./formatDateToDateAndTime";

const { Title, Text } = Typography;

interface StudentFile {
  biodata: {
    surname: string;
    other_names: string;
  };
  student_no: string;
  email: string;
  telephone: string;
}

interface TokenRes {
  amount: number;
  prt_expiry: string;
  prt: string;
  allocations: string;
  invs: {
    item_id: string;
    item_code: string;
    item_name: string;
    amount: string;
  }[];
}

interface PaymentSlipProps {
  visible: boolean;
  onClose: () => void;
  studentFile: StudentFile;
  tokenRes: TokenRes | null;
}

// Helper function to convert number to words
const numberToWords = (num: number): string => {
  if (num === 0) return "Zero";

  const ones = [
    "",
    "One",
    "Two",
    "Three",
    "Four",
    "Five",
    "Six",
    "Seven",
    "Eight",
    "Nine",
    "Ten",
    "Eleven",
    "Twelve",
    "Thirteen",
    "Fourteen",
    "Fifteen",
    "Sixteen",
    "Seventeen",
    "Eighteen",
    "Nineteen",
  ];
  const tens = [
    "",
    "",
    "Twenty",
    "Thirty",
    "Forty",
    "Fifty",
    "Sixty",
    "Seventy",
    "Eighty",
    "Ninety",
  ];
  const thousands = ["", "Thousand", "Million", "Billion"];

  const convertLessThanThousand = (n: number): string => {
    if (n === 0) return "";
    if (n < 20) return ones[n];
    if (n < 100) {
      return tens[Math.floor(n / 10)] + (n % 10 ? " " + ones[n % 10] : "");
    }
    return (
      ones[Math.floor(n / 100)] +
      " Hundred" +
      (n % 100 ? " " + convertLessThanThousand(n % 100) : "")
    );
  };

  if (num < 0) return "Negative " + numberToWords(-num);

  let result = "";
  let groupIndex = 0;

  while (num > 0) {
    const group = num % 1000;
    if (group > 0) {
      result =
        convertLessThanThousand(group) +
        (thousands[groupIndex] ? " " + thousands[groupIndex] : "") +
        (result ? " " + result : "");
    }
    num = Math.floor(num / 1000);
    groupIndex++;
  }

  return result.trim();
};

const PaymentSlip: React.FC<PaymentSlipProps> = ({
  visible,
  onClose,
  studentFile,
  tokenRes,
}) => {
  const handlePrint = () => {
    window.print();
  };

  const handleMobilePayment = () => {
    if (tokenRes) {
      console.log("Initiating mobile money payment for:", tokenRes.prt);
    }
  };

  if (!tokenRes) {
    return (
      <Modal
        title="Error"
        maskClosable={false}
        open={visible}
        onCancel={onClose}
        footer={
          <Button key="close" onClick={onClose}>
            Close
          </Button>
        }
        width={800}
      >
        <Text type="danger">
          Failed to generate payment token. Please try again.
        </Text>
      </Modal>
    );
  }

  return (
    <Modal
      title="Payment Reference Generated Successfully 🎉"
      maskClosable={false}
      open={visible}
      onCancel={onClose}
      footer={
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            width: "100%",
          }}
        >
          <Button style={{ marginRight: 10 }} key="close" onClick={onClose}>
            Close
          </Button>
          <Button
            key="print"
            type="primary"
            onClick={handlePrint}
            style={{ marginRight: 5 }}
          >
            Print
          </Button>
          <Button
            key="mobile"
            type="primary"
            danger
            onClick={handleMobilePayment}
            style={{ marginLeft: "auto" }}
          >
            Pay via Mobile Money
          </Button>
        </div>
      }
      width={800}
    >
      <div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <img
            src="src/components/nkumba-university.svg"
            alt="University Logo"
            style={{ height: 50 }}
          />
          <QRCode
            bordered={false}
            size={50}
            value={`TREDPAY:${tokenRes.prt}:${tokenRes.amount}`}
          />
        </div>
      </div>

      <Divider
        style={{
          borderColor: "lightgray",
          marginTop: 10,
          marginBottom: 5,
        }}
      />

      <Title level={5} style={{ textAlign: "center" }}>
        Trepay Payment Slip
      </Title>

      <Divider
        style={{
          borderColor: "lightgray",
          marginTop: 5,
          marginBottom: 0,
          height: "100%",
        }}
      />

      <Row gutter={16} style={{ marginTop: 0 }}>
        <Col span={12}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <Text strong>Student Name:</Text>
            <Text>{`${studentFile.biodata.surname} ${studentFile.biodata.other_names}`}</Text>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <Text strong>Student ID:</Text>
            <Text>{studentFile.student_no}</Text>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <Text strong>Email:</Text>
            <Text>{studentFile.email}</Text>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <Text strong>Phone:</Text>
            <Text>{studentFile.telephone}</Text>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <Text strong>Amount:</Text>
            <Text>{tokenRes.amount.toLocaleString()} UGX</Text>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <Text strong>Expiry:</Text>
            <Text>
              {formatDateString(Number.parseInt(tokenRes.prt_expiry))}
            </Text>
          </div>

          <br />
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <Text
              strong
              style={{
                marginRight: 10,
              }}
            >
              Payable from:
            </Text>
            <ul>
              <li>CENTENARY BANK</li>
              <li>DFCU BANK</li>
              <li>STANBIC BANK</li>
            </ul>
          </div>
        </Col>
        <Col span={2}>
          <Divider
            type="vertical"
            style={{
              borderColor: "lightgray",
              marginTop: 0,
              marginBottom: 0,
              height: "100%",
            }}
          />
        </Col>
        <Col span={10} style={{ textAlign: "right" }}>
          <Text strong>Payment Token:</Text> {tokenRes.prt}
          <br />
          <Text strong>Amount:</Text> UGX. {tokenRes.amount.toLocaleString()}/-
          <br />
          <Text strong>Amount in Words:</Text> {numberToWords(tokenRes.amount)}{" "}
          Only
          <br />
        </Col>
      </Row>

      <Divider
        style={{
          borderColor: "lightgray",
          marginTop: 0,
          marginBottom: 10,
        }}
      />
      <Text strong>Allocations:</Text>
      <br />
      <pre style={{ fontSize: "12px", whiteSpace: "normal" }}>
        {tokenRes.invs.length > 0
          ? tokenRes.invs
              .map(
                (item) =>
                  `${item.item_name}: ${Number(
                    item.amount
                  ).toLocaleString()} UGX`
              )
              .join(" | ")
          : "No allocations available"}
      </pre>
    </Modal>
  );
};

export default PaymentSlip;
