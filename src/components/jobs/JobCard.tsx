import { Card, Tag, Button, Typography, Space } from "antd";
import {
  CalendarOutlined,
  EnvironmentOutlined,
  TeamOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import { motion } from "framer-motion";
import { JobPosting, JobPostingVisibility } from "../../../types/job";

const { Title, Text, Paragraph } = Typography;

interface JobCardProps {
  job: JobPosting;
  onViewDetails: (jobId: string) => void;
}

const employmentTypeColor = (type?: string | null) => {
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

const visibilityColor = (visibility: JobPostingVisibility) => {
  switch (visibility) {
    case "INTERNAL":
      return "gold";
    case "EXTERNAL":
      return "cyan";
    case "BOTH":
      return "magenta";
    default:
      return "default";
  }
};

const visibilityLabel = (visibility: JobPostingVisibility) => {
  if (visibility === "BOTH") return "Internal & External";
  if (visibility === "INTERNAL") return "Internal";
  return "External";
};

const formatSalary = (job: JobPosting) => {
  if (job.salaryLabel) return job.salaryLabel;
  if (job.minSalary == null && job.maxSalary == null) return null;

  const formatter = new Intl.NumberFormat("en-US", {
    style: job.currency ? "currency" : "decimal",
    currency: job.currency || undefined,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

  const parts: string[] = [];
  if (job.minSalary != null) parts.push(formatter.format(job.minSalary));
  if (job.maxSalary != null && job.maxSalary !== job.minSalary) {
    parts.push(formatter.format(job.maxSalary));
  }

  if (!parts.length) return null;
  return job.payPeriod
    ? `${parts.join(" - ")} (${job.payPeriod.toLowerCase()})`
    : parts.join(" - ");
};

const postedLabel = (
  postedDate?: string | null,
  openingDate?: string | null
) => {
  const reference = postedDate || openingDate;
  if (!reference) return null;

  const posted = new Date(reference);
  const today = new Date();
  const diffTime = Math.abs(today.getTime() - posted.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Posted today";
  if (diffDays === 1) return "Posted yesterday";
  if (diffDays < 7) return `Posted ${diffDays} days ago`;
  if (diffDays < 30) return `Posted ${Math.floor(diffDays / 7)} weeks ago`;
  return `Posted ${Math.floor(diffDays / 30)} months ago`;
};

export function JobCard({ job, onViewDetails }: JobCardProps) {
  const salary = formatSalary(job);
  const posted =
    postedLabel(job.postedDate, job.openingDate) || "Recently posted";
  const closingDateLabel = job.closingDate
    ? new Date(job.closingDate).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : null;

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
        onMouseEnter={(event) => {
          event.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.1)";
          event.currentTarget.style.borderColor = "#d9d9d9";
        }}
        onMouseLeave={(event) => {
          event.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.08)";
          event.currentTarget.style.borderColor = "#e8e8e8";
        }}
      >
        <Space
          direction="vertical"
          size="small"
          style={{ width: "100%", height: "100%" }}
        >
          <Space size="small" wrap>
            <Tag
              color={employmentTypeColor(job.employmentType)}
              style={{
                fontSize: 11,
                padding: "1px 8px",
                borderRadius: 2,
                fontWeight: 500,
              }}
            >
              {job.employmentType || "Not specified"}
            </Tag>
            <Tag
              color={visibilityColor(job.visibility)}
              style={{
                fontSize: 11,
                padding: "1px 8px",
                borderRadius: 2,
                fontWeight: 500,
              }}
            >
              {visibilityLabel(job.visibility)}
            </Tag>
          </Space>

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
            {job.jobTitle}
          </Title>

          <Space direction="vertical" size={6} style={{ width: "100%" }}>
            <Space size="small">
              <TeamOutlined style={{ color: "#666666", fontSize: 13 }} />
              <Text style={{ fontSize: 12, color: "#666666" }}>
                {job.department || "Department not specified"}
              </Text>
            </Space>

            <Space size="small">
              <EnvironmentOutlined style={{ color: "#666666", fontSize: 13 }} />
              <Text style={{ fontSize: 12, color: "#666666" }}>
                {job.workLocation || "Location not specified"}
              </Text>
            </Space>

            {salary && (
              <Space size="small">
                <CalendarOutlined style={{ color: "#666666", fontSize: 13 }} />
                <Text style={{ fontSize: 12, color: "#666666" }}>{salary}</Text>
              </Space>
            )}
          </Space>

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
            {job.jobSummary || "No description available."}
          </Paragraph>

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
                <Text style={{ fontSize: 11, color: "#999999" }}>{posted}</Text>
              </Space>
              <Text style={{ fontSize: 11, color: "#999999" }}>
                {closingDateLabel
                  ? `Deadline: ${closingDateLabel}`
                  : "Open until filled"}
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
