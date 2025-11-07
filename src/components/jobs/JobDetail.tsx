import { useState } from "react";
import {
  Typography,
  Button,
  Space,
  Tag,
  Divider,
  Card,
  Row,
  Col,
  List,
} from "antd";
import {
  ArrowLeftOutlined,
  CalendarOutlined,
  EnvironmentOutlined,
  TeamOutlined,
  DollarOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import { motion } from "framer-motion";
import { Job } from "../../../types/job";
import { mockJobs } from "../../data/mockJobs";

const { Title, Text, Paragraph } = Typography;

interface JobDetailProps {
  jobId: string;
  onBack: () => void;
  onApply: (jobId: string) => void;
}

export function JobDetail({ jobId, onBack, onApply }: JobDetailProps) {
  const job = mockJobs.find((j) => j.id === jobId);

  if (!job) {
    return (
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "40px 24px" }}>
        <Card>
          <Text>Job not found</Text>
          <Button onClick={onBack} style={{ marginLeft: 16 }}>
            Back to Listings
          </Button>
        </Card>
      </div>
    );
  }

  const getEmploymentTypeColor = (type: string) => {
    switch (type) {
      case "Full-time":
        return "blue";
      case "Part-time":
        return "green";
      case "Contract":
        return "orange";
      case "Temporary":
        return "purple";
      default:
        return "default";
    }
  };

  const getEligibilityColor = (eligibility: string) => {
    switch (eligibility) {
      case "Internal":
        return "gold";
      case "External":
        return "cyan";
      case "Both":
        return "magenta";
      default:
        return "default";
    }
  };

  const calculateDaysRemaining = (deadline: string) => {
    const deadlineDate = new Date(deadline);
    const today = new Date();
    const diffTime = deadlineDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return "Application closed";
    if (diffDays === 0) return "Last day to apply";
    if (diffDays === 1) return "1 day remaining";
    return `${diffDays} days remaining`;
  };

  const isDeadlinePassed = () => {
    const deadlineDate = new Date(job.deadline);
    const today = new Date();
    return deadlineDate < today;
  };

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "40px 24px" }}>
      {/* Back Button */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Button
          type="text"
          icon={<ArrowLeftOutlined />}
          onClick={onBack}
          style={{ marginBottom: 24, padding: "4px 8px" }}
        >
          Back to All Positions
        </Button>
      </motion.div>

      <Row gutter={[24, 24]}>
        {/* Main Content */}
        <Col xs={24} lg={16}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card
              style={{
                borderRadius: 8,
                boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
              }}
            >
              <Space direction="vertical" size="large" style={{ width: "100%" }}>
                {/* Header */}
                <div>
                  <Space size="small" wrap style={{ marginBottom: 16 }}>
                    <Tag color={getEmploymentTypeColor(job.employmentType)}>
                      {job.employmentType}
                    </Tag>
                    <Tag color={getEligibilityColor(job.eligibility)}>
                      {job.eligibility}
                    </Tag>
                  </Space>

                  <Title level={2} style={{ marginBottom: 8, marginTop: 0 }}>
                    {job.title}
                  </Title>

                  <Space size="large" wrap>
                    <Space size="small">
                      <TeamOutlined style={{ color: "#8c8c8c" }} />
                      <Text type="secondary">{job.department}</Text>
                    </Space>
                    <Space size="small">
                      <EnvironmentOutlined style={{ color: "#8c8c8c" }} />
                      <Text type="secondary">{job.location}</Text>
                    </Space>
                    {job.salary && (
                      <Space size="small">
                        <DollarOutlined style={{ color: "#8c8c8c" }} />
                        <Text type="secondary">{job.salary}</Text>
                      </Space>
                    )}
                  </Space>
                </div>

                <Divider style={{ margin: 0 }} />

                {/* Job Description */}
                <div>
                  <Title level={4}>About the Position</Title>
                  <Paragraph style={{ fontSize: 15, color: "#595959" }}>
                    {job.description}
                  </Paragraph>
                </div>

                {/* Responsibilities */}
                <div>
                  <Title level={4}>Key Responsibilities</Title>
                  <List
                    dataSource={job.responsibilities}
                    renderItem={(item) => (
                      <List.Item style={{ border: "none", padding: "8px 0" }}>
                        <Space align="start" size="small">
                          <CheckCircleOutlined
                            style={{ color: "#52c41a", marginTop: 4 }}
                          />
                          <Text style={{ fontSize: 15 }}>{item}</Text>
                        </Space>
                      </List.Item>
                    )}
                  />
                </div>

                {/* Qualifications */}
                <div>
                  <Title level={4}>Qualifications & Requirements</Title>
                  <List
                    dataSource={job.qualifications}
                    renderItem={(item) => (
                      <List.Item style={{ border: "none", padding: "8px 0" }}>
                        <Space align="start" size="small">
                          <CheckCircleOutlined
                            style={{ color: "#1890ff", marginTop: 4 }}
                          />
                          <Text style={{ fontSize: 15 }}>{item}</Text>
                        </Space>
                      </List.Item>
                    )}
                  />
                </div>

                {/* Benefits */}
                <div>
                  <Title level={4}>Benefits & Perks</Title>
                  <List
                    dataSource={job.benefits}
                    renderItem={(item) => (
                      <List.Item style={{ border: "none", padding: "8px 0" }}>
                        <Space align="start" size="small">
                          <CheckCircleOutlined
                            style={{ color: "#C74634", marginTop: 4 }}
                          />
                          <Text style={{ fontSize: 15 }}>{item}</Text>
                        </Space>
                      </List.Item>
                    )}
                  />
                </div>
              </Space>
            </Card>
          </motion.div>
        </Col>

        {/* Sidebar */}
        <Col xs={24} lg={8}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Space direction="vertical" size="middle" style={{ width: "100%" }}>
              {/* Apply Card */}
              <Card
                style={{
                  borderRadius: 8,
                  boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                  background: isDeadlinePassed() ? "#f5f5f5" : "#ffffff",
                }}
              >
                <Space direction="vertical" size="middle" style={{ width: "100%" }}>
                  <div>
                    <Text strong style={{ fontSize: 16, display: "block", marginBottom: 8 }}>
                      Application Deadline
                    </Text>
                    <Space size="small">
                      <CalendarOutlined style={{ color: "#C74634" }} />
                      <Text strong style={{ fontSize: 15 }}>
                        {new Date(job.deadline).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </Text>
                    </Space>
                    <div style={{ marginTop: 8 }}>
                      <Text
                        type={isDeadlinePassed() ? "danger" : "secondary"}
                        style={{ fontSize: 13 }}
                      >
                        <ClockCircleOutlined style={{ marginRight: 4 }} />
                        {calculateDaysRemaining(job.deadline)}
                      </Text>
                    </div>
                  </div>

                  <Button
                    type="primary"
                    size="large"
                    block
                    onClick={() => onApply(job.id)}
                    disabled={isDeadlinePassed()}
                    style={{ borderRadius: 4, height: 48, fontSize: 16 }}
                  >
                    {isDeadlinePassed() ? "Application Closed" : "Apply Now"}
                  </Button>

                  {!isDeadlinePassed() && (
                    <Text
                      type="secondary"
                      style={{ fontSize: 12, display: "block", textAlign: "center" }}
                    >
                      Submit your application before the deadline
                    </Text>
                  )}
                </Space>
              </Card>

              {/* Job Details Card */}
              <Card
                title="Job Information"
                style={{
                  borderRadius: 8,
                  boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                }}
              >
                <Space direction="vertical" size="middle" style={{ width: "100%" }}>
                  <div>
                    <Text type="secondary" style={{ display: "block", marginBottom: 4 }}>
                      Posted Date
                    </Text>
                    <Text strong>
                      {new Date(job.datePosted).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </Text>
                  </div>

                  <Divider style={{ margin: 0 }} />

                  <div>
                    <Text type="secondary" style={{ display: "block", marginBottom: 4 }}>
                      Employment Type
                    </Text>
                    <Tag color={getEmploymentTypeColor(job.employmentType)}>
                      {job.employmentType}
                    </Tag>
                  </div>

                  <Divider style={{ margin: 0 }} />

                  <div>
                    <Text type="secondary" style={{ display: "block", marginBottom: 4 }}>
                      Eligibility
                    </Text>
                    <Tag color={getEligibilityColor(job.eligibility)}>
                      {job.eligibility}
                    </Tag>
                  </div>

                  <Divider style={{ margin: 0 }} />

                  <div>
                    <Text type="secondary" style={{ display: "block", marginBottom: 4 }}>
                      Department
                    </Text>
                    <Text strong>{job.department}</Text>
                  </div>

                  <Divider style={{ margin: 0 }} />

                  <div>
                    <Text type="secondary" style={{ display: "block", marginBottom: 4 }}>
                      Location
                    </Text>
                    <Text strong>{job.location}</Text>
                  </div>
                </Space>
              </Card>

              {/* Share Card */}
              <Card
                style={{
                  borderRadius: 8,
                  boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                }}
              >
                <Text type="secondary" style={{ fontSize: 12 }}>
                  Share this opportunity with others who might be interested
                </Text>
              </Card>
            </Space>
          </motion.div>
        </Col>
      </Row>
    </div>
  );
}
