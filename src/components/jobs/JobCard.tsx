import { Card, Tag, Button, Typography, Space } from "antd";
import {
  CalendarOutlined,
  EnvironmentOutlined,
  TeamOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import { motion } from "framer-motion";
import { Job } from "../../../types/job";

const { Title, Text, Paragraph } = Typography;

interface JobCardProps {
  job: Job;
  onViewDetails: (jobId: string) => void;
}

export function JobCard({ job, onViewDetails }: JobCardProps) {
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

  const calculateDaysAgo = (datePosted: string) => {
    const posted = new Date(datePosted);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - posted.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Posted today";
    if (diffDays === 1) return "Posted yesterday";
    if (diffDays < 7) return `Posted ${diffDays} days ago`;
    if (diffDays < 30) return `Posted ${Math.floor(diffDays / 7)} weeks ago`;
    return `Posted ${Math.floor(diffDays / 30)} months ago`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      style={{ height: "100%" }}
    >
      <Card
        hoverable
        style={{
          height: "100%",
          borderRadius: 0,
          border: "1px solid #e8e8e8",
          transition: "all 0.3s ease",
          cursor: "pointer",
        }}
        bodyStyle={{ padding: 20, display: "flex", flexDirection: "column" }}
        onMouseEnter={(e) => {
          e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.1)";
          e.currentTarget.style.borderColor = "#d9d9d9";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.08)";
          e.currentTarget.style.borderColor = "#e8e8e8";
        }}
      >
        <Space
          direction="vertical"
          size="small"
          style={{ width: "100%", height: "100%" }}
        >
          {/* Tags */}
          <Space size="small" wrap>
            <Tag
              color={getEmploymentTypeColor(job.employmentType)}
              style={{
                fontSize: 11,
                padding: "1px 8px",
                borderRadius: 2,
                fontWeight: 500,
              }}
            >
              {job.employmentType}
            </Tag>
            <Tag
              color={getEligibilityColor(job.eligibility)}
              style={{
                fontSize: 11,
                padding: "1px 8px",
                borderRadius: 2,
                fontWeight: 500,
              }}
            >
              {job.eligibility}
            </Tag>
          </Space>

          {/* Job Title */}
          <Title
            level={4}
            style={{
              marginBottom: 0,
              marginTop: 0,
              fontSize: 16,
              fontWeight: 600,
              color: "#000000",
              lineHeight: 1.3,
            }}
          >
            {job.title}
          </Title>

          {/* Job Details */}
          <Space direction="vertical" size={6} style={{ width: "100%" }}>
            <Space size="small">
              <TeamOutlined style={{ color: "#666666", fontSize: 13 }} />
              <Text style={{ fontSize: 12, color: "#666666" }}>
                {job.department}
              </Text>
            </Space>

            <Space size="small">
              <EnvironmentOutlined style={{ color: "#666666", fontSize: 13 }} />
              <Text style={{ fontSize: 12, color: "#666666" }}>
                {job.location}
              </Text>
            </Space>

            {job.salary && (
              <Space size="small">
                <CalendarOutlined style={{ color: "#666666", fontSize: 13 }} />
                <Text style={{ fontSize: 12, color: "#666666" }}>
                  {job.salary}
                </Text>
              </Space>
            )}
          </Space>

          {/* Description */}
          <Paragraph
            ellipsis={{ rows: 2 }}
            style={{
              marginBottom: 0,
              color: "#666666",
              fontSize: 13,
              lineHeight: 1.5,
              flex: 1,
            }}
          >
            {job.description}
          </Paragraph>

          {/* Footer */}
          <div style={{ paddingTop: 12, borderTop: "1px solid #f0f0f0" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 12,
              }}
            >
              <Space size="small" style={{ fontSize: 11 }}>
                <ClockCircleOutlined style={{ color: "#999999" }} />
                <Text style={{ fontSize: 11, color: "#999999" }}>
                  {calculateDaysAgo(job.datePosted)}
                </Text>
              </Space>
              <Text style={{ fontSize: 11, color: "#999999" }}>
                Deadline:{" "}
                {new Date(job.deadline).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </Text>
            </div>
            <Button
              type="primary"
              block
              onClick={() => onViewDetails(job.id)}
              style={{
                height: 36,
                fontSize: 13,
                fontWeight: 500,
                borderRadius: 2,
              }}
            >
              View Details
            </Button>
          </div>
        </Space>
      </Card>
    </motion.div>
  );
}
