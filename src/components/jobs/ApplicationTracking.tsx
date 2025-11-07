import { useState } from "react";
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
} from "antd";
import {
  SearchOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  FileTextOutlined,
  SyncOutlined,
} from "@ant-design/icons";
import { motion, AnimatePresence } from "framer-motion";
import { Application } from "../../../types/job";

const { Title, Text, Paragraph } = Typography;

interface ApplicationTrackingProps {}

// Mock data for demonstration
const mockApplications: Application[] = [
  {
    id: "1",
    jobId: "1",
    jobTitle: "Senior Lecturer - Computer Science",
    applicantName: "John Doe",
    email: "john.doe@example.com",
    phone: "+256 700 000 000",
    resumeUrl: "/resumes/john-doe.pdf",
    status: "Under Review",
    submittedDate: "2024-01-20",
    referenceNumber: "NU17058234561234",
  },
  {
    id: "2",
    jobId: "5",
    jobTitle: "Assistant Lecturer - Business Administration",
    applicantName: "John Doe",
    email: "john.doe@example.com",
    phone: "+256 700 000 000",
    resumeUrl: "/resumes/john-doe.pdf",
    status: "Shortlisted",
    submittedDate: "2024-01-15",
    referenceNumber: "NU17058234565678",
  },
];

export function ApplicationTracking({}: ApplicationTrackingProps) {
  const [referenceNumber, setReferenceNumber] = useState("");
  const [searchedApplication, setSearchedApplication] =
    useState<Application | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSearch = () => {
    if (!referenceNumber.trim()) {
      return;
    }

    setLoading(true);
    setNotFound(false);

    // Simulate API call
    setTimeout(() => {
      const application = mockApplications.find(
        (app) => app.referenceNumber === referenceNumber.trim()
      );

      if (application) {
        setSearchedApplication(application);
        setNotFound(false);
      } else {
        setSearchedApplication(null);
        setNotFound(true);
      }
      setLoading(false);
    }, 1000);
  };

  const getStatusColor = (status: Application["status"]) => {
    switch (status) {
      case "Submitted":
        return "blue";
      case "Under Review":
        return "orange";
      case "Shortlisted":
        return "green";
      case "Rejected":
        return "red";
      case "Hired":
        return "purple";
      default:
        return "default";
    }
  };

  const getStatusIcon = (status: Application["status"]) => {
    switch (status) {
      case "Submitted":
        return <FileTextOutlined />;
      case "Under Review":
        return <SyncOutlined spin />;
      case "Shortlisted":
        return <CheckCircleOutlined />;
      case "Rejected":
        return <CloseCircleOutlined />;
      case "Hired":
        return <CheckCircleOutlined />;
      default:
        return <ClockCircleOutlined />;
    }
  };

  const getTimelineItems = (status: Application["status"]) => {
    const allStatuses: Application["status"][] = [
      "Submitted",
      "Under Review",
      "Shortlisted",
      "Hired",
    ];

    const currentIndex = allStatuses.indexOf(status);
    const isRejected = status === "Rejected";

    if (isRejected) {
      return [
        {
          color: "green",
          dot: <CheckCircleOutlined />,
          children: (
            <div>
              <Text strong>Application Submitted</Text>
              <br />
              <Text type="secondary" style={{ fontSize: 12 }}>
                Your application has been received
              </Text>
            </div>
          ),
        },
        {
          color: "red",
          dot: <CloseCircleOutlined />,
          children: (
            <div>
              <Text strong>Application Not Successful</Text>
              <br />
              <Text type="secondary" style={{ fontSize: 12 }}>
                Thank you for your interest
              </Text>
            </div>
          ),
        },
      ];
    }

    return allStatuses.map((s, index) => {
      const isPast = index <= currentIndex;
      const isCurrent = index === currentIndex;

      return {
        color: isPast ? "green" : "gray",
        dot: isPast ? <CheckCircleOutlined /> : <ClockCircleOutlined />,
        children: (
          <div>
            <Text strong={isCurrent}>{s}</Text>
            <br />
            <Text type="secondary" style={{ fontSize: 12 }}>
              {s === "Submitted" && "Application received successfully"}
              {s === "Under Review" && "HR team is reviewing your application"}
              {s === "Shortlisted" && "Congratulations! You've been shortlisted"}
              {s === "Hired" && "Welcome to Nkumba University!"}
            </Text>
          </div>
        ),
      };
    });
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
                  onChange={(e) => setReferenceNumber(e.target.value)}
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
              message="Demo Reference Numbers"
              description={
                <Space direction="vertical" size="small">
                  <Text>Try these reference numbers to see the tracking in action:</Text>
                  <Text code>NU17058234561234</Text> - Under Review
                  <br />
                  <Text code>NU17058234565678</Text> - Shortlisted
                </Space>
              }
              type="info"
              showIcon
              style={{ borderRadius: 4 }}
            />
          </Space>
        </Card>
      </motion.div>

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
                      <Text code>{referenceNumber}</Text>
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
                      {searchedApplication.referenceNumber}
                    </Text>
                  </Descriptions.Item>
                  <Descriptions.Item label="Position" span={2}>
                    <Text strong>{searchedApplication.jobTitle}</Text>
                  </Descriptions.Item>
                  <Descriptions.Item label="Status">
                    <Tag
                      color={getStatusColor(searchedApplication.status)}
                      icon={getStatusIcon(searchedApplication.status)}
                    >
                      {searchedApplication.status}
                    </Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Submitted Date">
                    {new Date(
                      searchedApplication.submittedDate
                    ).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </Descriptions.Item>
                  <Descriptions.Item label="Applicant">
                    {searchedApplication.applicantName}
                  </Descriptions.Item>
                  <Descriptions.Item label="Email">
                    {searchedApplication.email}
                  </Descriptions.Item>
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
                <Timeline items={getTimelineItems(searchedApplication.status)} />

                <Divider />

                {searchedApplication.status === "Shortlisted" && (
                  <Alert
                    message="Congratulations!"
                    description="You have been shortlisted for this position. Our HR team will contact you soon via email or phone to schedule an interview. Please ensure your contact details are up to date."
                    type="success"
                    showIcon
                    style={{ borderRadius: 4 }}
                  />
                )}

                {searchedApplication.status === "Under Review" && (
                  <Alert
                    message="Application Under Review"
                    description="Our recruitment team is currently reviewing your application. This process typically takes 2-3 weeks. We will notify you once a decision has been made."
                    type="info"
                    showIcon
                    style={{ borderRadius: 4 }}
                  />
                )}

                {searchedApplication.status === "Rejected" && (
                  <Alert
                    message="Application Status"
                    description="Thank you for your interest in this position. Unfortunately, we have decided to proceed with other candidates. We encourage you to apply for other positions that match your qualifications."
                    type="warning"
                    showIcon
                    style={{ borderRadius: 4 }}
                  />
                )}

                {searchedApplication.status === "Hired" && (
                  <Alert
                    message="Welcome Aboard!"
                    description="Congratulations! You have been selected for this position. Our HR team will contact you with onboarding details and next steps. Welcome to Nkumba University!"
                    type="success"
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
                    If you have any questions about your application status, please
                    contact our HR department:
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
