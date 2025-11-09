import { useState, useEffect, useMemo } from "react";
import {
  Card,
  Typography,
  Space,
  Input,
  Button,
  Timeline,
  Tag,
  Alert,
  Empty,
  Descriptions,
  Divider,
  message,
} from "antd";
import {
  SearchOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  SyncOutlined,
} from "@ant-design/icons";
import { motion, AnimatePresence } from "framer-motion";
import { useLazyQuery } from "@apollo/client";
import {
  JobApplicantWithPosting,
  JobApplicationStatus,
} from "../../../types/job";
import { JOB_APPLICANT_BY_REFERENCE_QUERY } from "../../gql/queries";

const { Title, Text, Paragraph } = Typography;

interface ApplicationTrackingProps {}

interface ApplicantQueryResult {
  jobApplicants: {
    data: JobApplicantWithPosting[];
    total: number;
  };
}

const STATUS_LABELS: Record<JobApplicationStatus, string> = {
  NEW: "Submitted",
  IN_REVIEW: "Under Review",
  SHORTLISTED: "Shortlisted",
  INTERVIEW: "Interview",
  OFFER: "Offer Extended",
  REJECTED: "Not Selected",
  HIRED: "Hired",
  WITHDRAWN: "Withdrawn",
} as const;

const STATUS_COLORS: Record<JobApplicationStatus, string> = {
  NEW: "blue",
  IN_REVIEW: "orange",
  SHORTLISTED: "green",
  INTERVIEW: "purple",
  OFFER: "gold",
  REJECTED: "red",
  HIRED: "cyan",
  WITHDRAWN: "default",
} as const;

const TIMELINE_STAGES: JobApplicationStatus[] = [
  "NEW",
  "IN_REVIEW",
  "SHORTLISTED",
  "INTERVIEW",
  "OFFER",
  "HIRED",
];

const STAGE_DESCRIPTIONS: Partial<Record<JobApplicationStatus, string>> = {
  NEW: "Application received successfully",
  IN_REVIEW: "HR team is reviewing your application",
  SHORTLISTED: "Congratulations! You've been shortlisted",
  INTERVIEW: "Interview scheduling is in progress",
  OFFER: "An offer has been extended",
  HIRED: "Welcome to Nkumba University!",
};

const FINAL_STATUS_MESSAGES: Partial<Record<JobApplicationStatus, string>> = {
  REJECTED:
    "Thank you for your interest. Unfortunately, we have decided to proceed with other candidates.",
  WITHDRAWN:
    "You have withdrawn your application. Contact HR if this was a mistake.",
  HIRED: "Congratulations! Our HR team will share onboarding details shortly.",
  OFFER: "Our HR team will reach out with next steps regarding your offer.",
};

const STATUS_ALERTS: Partial<
  Record<
    JobApplicationStatus,
    {
      type: "success" | "info" | "warning";
      title: string;
      description: string;
    }
  >
> = {
  NEW: {
    type: "info",
    title: "Application Received",
    description:
      STAGE_DESCRIPTIONS.NEW ??
      "Your application has been received successfully.",
  },
  IN_REVIEW: {
    type: "info",
    title: "Application Under Review",
    description:
      STAGE_DESCRIPTIONS.IN_REVIEW ??
      "Our recruitment team is currently reviewing your application.",
  },
  SHORTLISTED: {
    type: "success",
    title: "Congratulations!",
    description:
      "You have been shortlisted. Our HR team will contact you soon to schedule next steps.",
  },
  INTERVIEW: {
    type: "info",
    title: "Interview Stage",
    description:
      STAGE_DESCRIPTIONS.INTERVIEW ??
      "Interview scheduling is in progress. Watch your email for details.",
  },
  OFFER: {
    type: "success",
    title: "Offer Extended",
    description:
      FINAL_STATUS_MESSAGES.OFFER ??
      "An offer has been extended. Our HR team will reach out with next steps.",
  },
  HIRED: {
    type: "success",
    title: "Welcome Aboard!",
    description:
      FINAL_STATUS_MESSAGES.HIRED ??
      "Congratulations! Our HR team will share onboarding details shortly.",
  },
  REJECTED: {
    type: "warning",
    title: "Application Status",
    description:
      FINAL_STATUS_MESSAGES.REJECTED ??
      "Thank you for your interest. We encourage you to apply for other roles.",
  },
  WITHDRAWN: {
    type: "warning",
    title: "Application Withdrawn",
    description:
      FINAL_STATUS_MESSAGES.WITHDRAWN ??
      "You have withdrawn your application. Contact HR if this was a mistake.",
  },
};

export function ApplicationTracking({}: ApplicationTrackingProps) {
  const [referenceNumber, setReferenceNumber] = useState("");
  const [searchedApplication, setSearchedApplication] =
    useState<JobApplicantWithPosting | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [lastSearch, setLastSearch] = useState("");

  const [fetchApplicant, { data, loading, error }] =
    useLazyQuery<ApplicantQueryResult>(JOB_APPLICANT_BY_REFERENCE_QUERY, {
      fetchPolicy: "network-only",
    });

  const handleSearch = () => {
    const trimmed = referenceNumber.trim();
    if (!trimmed) {
      message.warning("Please enter your reference number.");
      return;
    }

    const normalizedInput = trimmed.toUpperCase();
    setReferenceNumber(normalizedInput);
    setNotFound(false);
    setSearchedApplication(null);
    setLastSearch(normalizedInput);
    fetchApplicant({
      variables: {
        limit: 5,
        filter: { search: normalizedInput },
      },
    });
  };

  useEffect(() => {
    if (!lastSearch || loading) {
      return;
    }

    const results = data?.jobApplicants?.data ?? [];
    if (!results.length) {
      setSearchedApplication(null);
      setNotFound(true);
      return;
    }

    const normalizedSearch = lastSearch.toLowerCase();
    const exactMatch = results.find(
      (applicant) => applicant.applicantCode.toLowerCase() === normalizedSearch
    );

    if (exactMatch) {
      setSearchedApplication(exactMatch);
      setNotFound(false);
    } else {
      setSearchedApplication(null);
      setNotFound(true);
    }
  }, [data, loading, lastSearch]);

  const statusAlertConfig = useMemo(() => {
    if (!searchedApplication) {
      return null;
    }

    return STATUS_ALERTS[searchedApplication.status] ?? null;
  }, [searchedApplication]);

  const getStatusLabel = (status: JobApplicationStatus) =>
    STATUS_LABELS[status] || status.replace(/_/g, " ");

  const getStatusColor = (status: JobApplicationStatus) =>
    STATUS_COLORS[status] || "default";

  const getStatusIcon = (status: JobApplicationStatus) => {
    switch (status) {
      case "NEW":
        return <ClockCircleOutlined />;
      case "IN_REVIEW":
        return <SyncOutlined spin />;
      case "SHORTLISTED":
      case "OFFER":
      case "HIRED":
        return <CheckCircleOutlined />;
      case "INTERVIEW":
        return <ClockCircleOutlined />;
      case "REJECTED":
      case "WITHDRAWN":
        return <CloseCircleOutlined />;
      default:
        return <ClockCircleOutlined />;
    }
  };

  const getTimelineItems = (status: JobApplicationStatus) => {
    const normalizedStatus = status ?? "NEW";
    const isTerminalNegative =
      normalizedStatus === "REJECTED" || normalizedStatus === "WITHDRAWN";

    const stageIndex = TIMELINE_STAGES.indexOf(normalizedStatus);
    const fallbackIndex = TIMELINE_STAGES.indexOf("IN_REVIEW");
    const effectiveIndex =
      stageIndex !== -1 ? stageIndex : fallbackIndex === -1 ? 0 : fallbackIndex;

    const items = TIMELINE_STAGES.map((stage, index) => {
      const isCurrent = stageIndex !== -1 && index === stageIndex;
      const isCompleted =
        stageIndex !== -1 ? index < stageIndex : index <= effectiveIndex;

      const color = isCurrent ? "blue" : isCompleted ? "green" : "gray";
      const dot = isCurrent ? (
        getStatusIcon(normalizedStatus)
      ) : isCompleted ? (
        <CheckCircleOutlined />
      ) : (
        <ClockCircleOutlined />
      );

      return {
        color,
        dot,
        children: (
          <div>
            <Text strong={isCurrent}>{getStatusLabel(stage)}</Text>
            {STAGE_DESCRIPTIONS[stage] && (
              <>
                <br />
                <Text type="secondary" style={{ fontSize: 12 }}>
                  {STAGE_DESCRIPTIONS[stage]}
                </Text>
              </>
            )}
          </div>
        ),
      };
    });

    if (isTerminalNegative) {
      items.push({
        color: "red",
        dot: <CloseCircleOutlined />,
        children: (
          <div>
            <Text strong>{getStatusLabel(normalizedStatus)}</Text>
            {FINAL_STATUS_MESSAGES[normalizedStatus] && (
              <>
                <br />
                <Text type="secondary" style={{ fontSize: 12 }}>
                  {FINAL_STATUS_MESSAGES[normalizedStatus]}
                </Text>
              </>
            )}
          </div>
        ),
      });
    } else if (
      (normalizedStatus === "OFFER" || normalizedStatus === "HIRED") &&
      FINAL_STATUS_MESSAGES[normalizedStatus]
    ) {
      items[effectiveIndex] = {
        ...items[effectiveIndex],
        children: (
          <div>
            <Text strong>{getStatusLabel(normalizedStatus)}</Text>
            <br />
            <Text type="secondary" style={{ fontSize: 12 }}>
              {FINAL_STATUS_MESSAGES[normalizedStatus]}
            </Text>
          </div>
        ),
      };
    }

    return items;
  };

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto", padding: "40px 24px" }}>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{ textAlign: "center", marginBottom: 48 }}
      >
        <Title level={1} style={{ marginBottom: 16 }}>
          Track Your Application
        </Title>
        <Text
          style={{
            fontSize: 16,
            color: "#595959",
            display: "block",
            maxWidth: 600,
            margin: "0 auto",
          }}
        >
          Enter your reference number to check the status of your application
        </Text>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card
          style={{
            marginBottom: 32,
            borderRadius: 8,
            boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
          }}
        >
          <Space direction="vertical" size="large" style={{ width: "100%" }}>
            <div>
              <Text strong style={{ display: "block", marginBottom: 8 }}>
                Reference Number
              </Text>
              <Space.Compact style={{ width: "100%" }} size="large">
                <Input
                  placeholder="Enter your reference number (e.g., NU17058234561234)"
                  value={referenceNumber}
                  onChange={(e) =>
                    setReferenceNumber(e.target.value.toUpperCase())
                  }
                  onPressEnter={handleSearch}
                  prefix={<SearchOutlined style={{ color: "#bfbfbf" }} />}
                  style={{ borderRadius: "4px 0 0 4px" }}
                />
                <Button
                  type="primary"
                  onClick={handleSearch}
                  loading={loading}
                  style={{ borderRadius: "0 4px 4px 0", minWidth: 100 }}
                >
                  Search
                </Button>
              </Space.Compact>
            </div>

            <Alert
              message="Where to Find Your Reference Number"
              description={
                <Space direction="vertical" size="small">
                  <Text>
                    We emailed a unique reference number right after you
                    submitted your application.
                  </Text>
                  <Text>
                    It usually looks like <Text code>NU1705...</Text>.
                  </Text>
                  <Text type="secondary">
                    Can't find it? Reach out to our HR team at{" "}
                    <a href="mailto:hr@nkumbauniversity.ac.ug">
                      hr@nkumbauniversity.ac.ug
                    </a>{" "}
                    and we'll resend it.
                  </Text>
                </Space>
              }
              type="info"
              showIcon
              style={{ borderRadius: 4 }}
            />
          </Space>
        </Card>
      </motion.div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          style={{ marginBottom: 24 }}
        >
          <Alert
            type="error"
            showIcon
            message="We couldn't retrieve your application"
            description={
              error.message ||
              "Please try again in a moment or contact HR for assistance."
            }
            style={{ borderRadius: 4 }}
          />
        </motion.div>
      )}

      <AnimatePresence mode="wait">
        {notFound && (
          <motion.div
            key="not-found"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card
              style={{
                borderRadius: 8,
                boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                textAlign: "center",
                padding: "40px 20px",
              }}
            >
              <Empty
                description={
                  <Space direction="vertical" size="small">
                    <Text strong style={{ fontSize: 16 }}>
                      Application Not Found
                    </Text>
                    <Text type="secondary">
                      We couldn't find an application with reference number:{" "}
                      <Text code>{lastSearch}</Text>
                    </Text>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      Please check your reference number and try again
                    </Text>
                  </Space>
                }
              />
            </Card>
          </motion.div>
        )}

        {searchedApplication && (
          <motion.div
            key="found"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Space direction="vertical" size="large" style={{ width: "100%" }}>
              {/* Application Details */}
              <Card
                title="Application Details"
                style={{
                  borderRadius: 8,
                  boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                }}
              >
                <Descriptions column={{ xs: 1, sm: 2 }} bordered>
                  <Descriptions.Item label="Reference Number" span={2}>
                    <Text strong code>
                      {searchedApplication.applicantCode}
                    </Text>
                  </Descriptions.Item>
                  <Descriptions.Item label="Position" span={2}>
                    <Text strong>
                      {searchedApplication.jobPosting?.jobTitle ??
                        searchedApplication.jobTitle}
                    </Text>
                    {searchedApplication.jobPosting?.jobCode && (
                      <>
                        <br />
                        <Text type="secondary">
                          Job Code: {searchedApplication.jobPosting.jobCode}
                        </Text>
                      </>
                    )}
                  </Descriptions.Item>
                  <Descriptions.Item label="Status">
                    <Tag
                      color={getStatusColor(searchedApplication.status)}
                      icon={getStatusIcon(searchedApplication.status)}
                    >
                      {getStatusLabel(searchedApplication.status)}
                    </Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Submitted Date">
                    {new Date(searchedApplication.createdAt).toLocaleDateString(
                      "en-US",
                      {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      }
                    )}
                  </Descriptions.Item>
                  <Descriptions.Item label="Applicant">
                    {searchedApplication.fullName ||
                      [
                        searchedApplication.firstName,
                        searchedApplication.lastName,
                      ]
                        .filter(Boolean)
                        .join(" ")}
                  </Descriptions.Item>
                  <Descriptions.Item label="Email">
                    <a href={`mailto:${searchedApplication.email}`}>
                      {searchedApplication.email}
                    </a>
                  </Descriptions.Item>
                  {searchedApplication.phone && (
                    <Descriptions.Item label="Phone">
                      <a href={`tel:${searchedApplication.phone}`}>
                        {searchedApplication.phone}
                      </a>
                    </Descriptions.Item>
                  )}
                </Descriptions>
              </Card>

              {/* Application Progress */}
              <Card
                title="Application Progress"
                style={{
                  borderRadius: 8,
                  boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                }}
              >
                <Timeline
                  items={getTimelineItems(searchedApplication.status)}
                />

                <Divider />

                {statusAlertConfig && (
                  <Alert
                    message={statusAlertConfig.title}
                    description={statusAlertConfig.description}
                    type={statusAlertConfig.type}
                    showIcon
                    style={{ borderRadius: 4 }}
                  />
                )}
              </Card>

              {/* Contact Information */}
              <Card
                style={{
                  borderRadius: 8,
                  boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                  background: "#f5f5f5",
                }}
              >
                <Space direction="vertical" size="small">
                  <Text strong>Need Help?</Text>
                  <Text type="secondary">
                    If you have any questions about your application status,
                    please contact our HR department:
                  </Text>
                  <Text>
                    Email:{" "}
                    <a href="mailto:hr@nkumbauniversity.ac.ug">
                      hr@nkumbauniversity.ac.ug
                    </a>
                  </Text>
                  <Text>Phone: +256 414 320 021</Text>
                </Space>
              </Card>
            </Space>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
