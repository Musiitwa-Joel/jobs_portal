import React from "react";
import { useState } from "react";
import {
  Modal,
  Input,
  Button,
  Card,
  Typography,
  Divider,
  Row,
  Col,
  Tag,
  Alert,
  Spin,
  Empty,
  QRCode,
  theme,
} from "antd";
import {
  SearchOutlined,
  CopyOutlined,
  PrinterOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import { motion } from "framer-motion";
import { useQuery } from "@apollo/client";
import { PRT_DETAILS } from "../../gql/queries";
import formatDateString from "./formatDateToDateAndTime";

const { Text, Title } = Typography;
const { Search } = Input;

interface PaymentReference {
  prt: string;
  student_name: string;
  student_id: string;
  email: string;
  telephone: string;
  amount: number;
  status: "PENDING" | "PAID" | "paid";
  created_date: string;
  expiry_date: string;
  allocations: string;
  invs:
    | {
        item_id: string;
        item_code: string;
        item_name: string;
        amount: string;
      }[]
    | null;
  generated_by?: string;
  payment_date?: string;
  tnx_id?: string;
  bank_name?: string;
  bank_branch?: string;
}

// Helper function to convert number to words (unchanged)
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

interface ReferenceLookupProps {
  visible: boolean;
  onClose: () => void;
}

const ReferenceLookup: React.FC<ReferenceLookupProps> = ({
  visible,
  onClose,
}) => {
  const { token } = theme.useToken(); // Access AntD theme tokens
  const [searchValue, setSearchValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [queryPrt, setQueryPrt] = useState<string | null>(null);

  const {
    data,
    loading,
    error: queryError,
  } = useQuery(PRT_DETAILS, {
    variables: { prt: queryPrt },
    skip: !queryPrt,
    onError: (err) => {
      console.error("GraphQL Error:", {
        message: err.message,
        graphQLErrors: err.graphQLErrors,
        networkError: err.networkError,
      });
      setError(`Failed to fetch payment details: ${err.message}`);
    },
    onCompleted: (data) => {
      console.log("PRT_DETAILS Response:", data.get_prt_details);
    },
  });

  const paymentData: PaymentReference | null = data?.get_prt_details
    ? {
        prt: data.get_prt_details.prt,
        student_name: data.get_prt_details.full_name,
        student_id: data.get_prt_details.student_no || "",
        email: data.get_prt_details.email || "",
        telephone: data.get_prt_details.phone_no || "",
        amount: Number(data.get_prt_details.amount),
        status: data.get_prt_details.status,
        created_date: data.get_prt_details.created_at,
        expiry_date: data.get_prt_details.prt_expiry,
        allocations: data.get_prt_details.allocations || "",
        invs: data.get_prt_details.invs || null,
        generated_by: data.get_prt_details.generated_by,
        payment_date: data.get_prt_details.payment_date,
        tnx_id: data.get_prt_details.tnx_id,
        bank_name: data.get_prt_details.bank_name,
        bank_branch: data.get_prt_details.bank_branch,
      }
    : null;

  const handleSearch = async (value: string) => {
    if (!value.trim()) {
      setError("Please enter a payment reference");
      setQueryPrt(null);
      return;
    }

    setError(null);
    setQueryPrt(value.trim());
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    // Optional: message.success("Reference copied to clipboard!");
  };

  const handlePrint = () => {
    window.print();
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "paid":
        return token.colorSuccess; // Use AntD success color
      case "pending":
        return token.colorWarning; // Use AntD warning color
      default:
        return token.colorTextDisabled; // Use AntD disabled color
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "paid":
        return <CheckCircleOutlined />;
      case "pending":
        return <ClockCircleOutlined />;
      default:
        return <ClockCircleOutlined />;
    }
  };

  const handleModalClose = () => {
    setSearchValue("");
    setQueryPrt(null);
    setError(null);
    onClose();
  };

  // Card styles based on status, using theme tokens
  const cardStyle = {
    paid: {
      background: token.colorBgContainer, // Theme-aware background
      border: `1px solid ${token.colorSuccess}`,
      position: "relative" as const,
      overflow: "hidden",
      boxShadow: token.boxShadowCard,
    },
    pending: {
      background: token.colorBgContainer,
      border: `1px solid ${token.colorWarning}`,
      boxShadow: token.boxShadowCard,
    },
  };

  // Watermark style for PAID status
  const watermarkStyle: React.CSSProperties = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%) rotate(-45deg)",
    fontSize: 100,
    fontWeight: "bold",
    color: "#52c41a", // Theme-aware success background
    opacity: 0.2,
    pointerEvents: "none",
    textTransform: "uppercase",
    zIndex: 9999,
    userSelect: "none",
  };

  // Helper function to parse ISO date to timestamp
  const parseDateToTimestamp = (dateStr?: string): number | null => {
    if (!dateStr) return null;
    const timestamp = Date.parse(dateStr);
    return isNaN(timestamp) ? null : timestamp;
  };

  return (
    <Modal
      title={
        <div
          style={{ display: "flex", alignItems: "center", gap: token.marginXS }}
        >
          <SearchOutlined style={{ color: token.colorPrimary }} />
          <span>Payment Reference Lookup</span>
        </div>
      }
      open={visible}
      onCancel={handleModalClose}
      footer={null}
      width={800}
      destroyOnClose
      styles={{
        body: { background: token.colorBgLayout, padding: token.paddingLG },
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Alert
          message="Enter your payment reference to check status and details"
          type="info"
          showIcon
          style={{
            marginBottom: token.marginMD,
            background: token.colorInfoBg,
            border: `1px solid ${token.colorInfoBorder}`,
          }}
        />

        <Search
          placeholder="Enter payment reference (e.g., C84H1O0MUB22)"
          allowClear
          enterButton="Search"
          size="large"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          onSearch={handleSearch}
          loading={loading}
          style={{ marginBottom: token.marginMD }}
        />

        {error && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Alert
              message={error}
              type="error"
              showIcon
              style={{ marginBottom: token.marginMD }}
            />
          </motion.div>
        )}

        {loading && (
          <div
            style={{ textAlign: "center", padding: `${token.paddingXL}px 0` }}
          >
            <Spin size="large" />
            <div style={{ marginTop: token.marginMD }}>
              <Text style={{ color: token.colorTextSecondary }}>
                Looking up payment reference...
              </Text>
            </div>
          </div>
        )}

        {paymentData && !loading && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <Card
              style={
                cardStyle[paymentData.status.toLowerCase()] || cardStyle.pending
              }
            >
              {paymentData.status.toLowerCase() === "paid" && (
                <div style={watermarkStyle}>PAID</div>
              )}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  marginBottom: token.marginMD,
                  position: "relative",
                  zIndex: 1,
                }}
              >
                <div>
                  <Title
                    level={4}
                    style={{ margin: 0, color: token.colorText }}
                  >
                    Payment Reference Details
                  </Title>
                  <Text
                    type="secondary"
                    style={{ color: token.colorTextSecondary }}
                  >
                    Reference: {paymentData.prt}
                  </Text>
                </div>
                <div
                  style={{
                    display: "flex",
                    gap: token.marginXS,
                    alignItems: "center",
                  }}
                >
                  <Tag
                    color={getStatusColor(paymentData.status)}
                    icon={getStatusIcon(paymentData.status)}
                    style={{
                      fontSize: "14px",
                      padding: "4px 8px",
                      height: "auto",
                      marginRight: "8px",
                    }}
                  >
                    {paymentData.status.toUpperCase()}
                  </Tag>
                  <div style={{ transform: "scale(1.5)" }}>
                    <QRCode
                      size={40}
                      value={`TREDPAY:${paymentData.prt}:${paymentData.amount}`}
                      bordered={false}
                      color={token.colorText}
                      backgroundColor={token.colorBgContainer}
                    />
                  </div>
                </div>
              </div>

              <Divider style={{ borderColor: token.colorBorder }} />

              <Row gutter={[token.marginMD, token.marginMD]}>
                <Col span={12}>
                  <Card
                    size="small"
                    title="Student Information"
                    style={{
                      background: token.colorBgElevated,
                      border: `1px solid ${token.colorBorder}`,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: token.marginSM,
                      }}
                    >
                      <Text strong style={{ color: token.colorText }}>
                        Name:
                      </Text>
                      <Text style={{ color: token.colorText }}>
                        {paymentData.student_name}
                      </Text>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: token.marginSM,
                      }}
                    >
                      <Text strong style={{ color: token.colorText }}>
                        Student ID:
                      </Text>
                      <Text style={{ color: token.colorText }}>
                        {paymentData.student_id}
                      </Text>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: token.marginSM,
                      }}
                    >
                      <Text strong style={{ color: token.colorText }}>
                        Email:
                      </Text>
                      <Text style={{ color: token.colorText }}>
                        {paymentData.email || "N/A"}
                      </Text>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      <Text strong style={{ color: token.colorText }}>
                        Phone:
                      </Text>
                      <Text style={{ color: token.colorText }}>
                        {paymentData.telephone || "N/A"}
                      </Text>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: token.marginSM,
                      }}
                    >
                      <Text strong style={{ color: token.colorText }}>
                        Amount:
                      </Text>
                      <Text
                        style={{
                          fontSize: token.fontSizeLG,
                          fontWeight: token.fontWeightStrong,
                          color:
                            paymentData.status.toLowerCase() === "paid"
                              ? token.colorSuccess
                              : token.colorWarning,
                        }}
                      >
                        {paymentData.amount.toLocaleString()} UGX
                      </Text>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: token.marginSM,
                      }}
                    >
                      <Text strong style={{ color: token.colorText }}>
                        Amount in Words:
                      </Text>
                      <Text style={{ color: token.colorText }}>
                        {numberToWords(paymentData.amount)} Only
                      </Text>
                    </div>
                  </Card>
                </Col>

                <Col span={12}>
                  <Card
                    size="small"
                    title="Payment Information"
                    style={{
                      background: token.colorBgElevated,
                      border: `1px solid ${token.colorBorder}`,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: token.marginSM,
                      }}
                    >
                      <Text strong style={{ color: token.colorText }}>
                        Created:
                      </Text>
                      <Text style={{ color: token.colorText }}>
                        {formatDateString(
                          parseDateToTimestamp(paymentData.created_date)
                        )}
                      </Text>
                    </div>
                    {paymentData.status.toLowerCase() === "pending" && (
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          marginBottom: token.marginSM,
                        }}
                      >
                        <Text strong style={{ color: token.colorText }}>
                          Expires:
                        </Text>
                        <Text style={{ color: token.colorText }}>
                          {formatDateString(
                            parseDateToTimestamp(paymentData.expiry_date)
                          )}
                        </Text>
                      </div>
                    )}
                    {paymentData.generated_by && (
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          marginBottom: token.marginSM,
                        }}
                      >
                        <Text strong style={{ color: token.colorText }}>
                          Generated By:
                        </Text>
                        <Text style={{ color: token.colorText }}>
                          {paymentData.generated_by}
                        </Text>
                      </div>
                    )}
                    {paymentData.status.toLowerCase() === "paid" && (
                      <>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            marginBottom: token.marginSM,
                          }}
                        >
                          <Text strong style={{ color: token.colorText }}>
                            Paid On:
                          </Text>
                          <Text style={{ color: token.colorText }}>
                            {paymentData.payment_date
                              ? formatDateString(
                                  parseDateToTimestamp(paymentData.payment_date)
                                )
                              : "N/A"}
                          </Text>
                        </div>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            marginBottom: token.marginSM,
                          }}
                        >
                          <Text strong style={{ color: token.colorText }}>
                            Transaction ID:
                          </Text>
                          <Text style={{ color: token.colorText }}>
                            {paymentData.tnx_id || "N/A"}
                          </Text>
                        </div>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            marginBottom: token.marginSM,
                          }}
                        >
                          <Text strong style={{ color: token.colorText }}>
                            Bank:
                          </Text>
                          <Text style={{ color: token.colorText }}>
                            {paymentData.bank_name || "N/A"}
                          </Text>
                        </div>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            marginBottom: token.marginSM,
                          }}
                        >
                          <Text strong style={{ color: token.colorText }}>
                            Bank Branch:
                          </Text>
                          <Text style={{ color: token.colorText }}>
                            {paymentData.bank_branch || "N/A"}
                          </Text>
                        </div>
                      </>
                    )}
                  </Card>
                </Col>
              </Row>

              <Divider style={{ borderColor: token.colorBorder }} />

              <Card
                size="small"
                title="Fee Allocations"
                style={{
                  background: token.colorBgElevated,
                  border: `1px solid ${token.colorBorder}`,
                }}
              >
                <pre
                  style={{
                    whiteSpace: "pre-wrap",
                    fontSize: "12px",
                    margin: 0,
                    color: token.colorText,
                  }}
                >
                  {paymentData.invs && paymentData.invs.length > 0
                    ? paymentData.invs
                        .map(
                          (item) =>
                            `${item.item_name}: ${Number(
                              item.amount
                            ).toLocaleString()} UGX`
                        )
                        .join(" | ")
                    : paymentData.allocations || "No allocations available"}
                </pre>
              </Card>

              <div
                style={{
                  marginTop: token.marginMD,
                  display: "flex",
                  justifyContent: "space-between",
                  position: "relative",
                  zIndex: 1,
                }}
              >
                <div>
                  <Text strong style={{ color: token.colorText }}>
                    Payable from:&nbsp;
                  </Text>
                  <Text style={{ color: token.colorTextSecondary }}>
                    CENTENARY BANK, DFCU BANK, STANBIC BANK
                  </Text>
                </div>
                <div style={{ display: "flex", gap: token.marginXS }}>
                  <Button
                    icon={<CopyOutlined />}
                    onClick={() => handleCopy(paymentData.prt)}
                    style={{
                      borderColor: token.colorBorder,
                      color: token.colorText,
                    }}
                  >
                    Copy Reference
                  </Button>
                  <Button
                    icon={<PrinterOutlined />}
                    onClick={handlePrint}
                    style={{
                      borderColor: token.colorBorder,
                      color: token.colorText,
                    }}
                  >
                    Print
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        {!paymentData && !loading && !error && (
          <div
            style={{ textAlign: "center", padding: `${token.paddingXL}px 0` }}
          >
            <Empty
              description={
                <Text style={{ color: token.colorTextSecondary }}>
                  Enter a payment reference to view details
                </Text>
              }
            />
          </div>
        )}
      </motion.div>
    </Modal>
  );
};

export default ReferenceLookup;
