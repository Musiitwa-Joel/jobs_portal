import { useState, useEffect, useCallback } from "react";
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
  Spin,
  Alert,
  Descriptions,
  Tooltip,
  message,
} from "antd";
import {
  ArrowLeftOutlined,
  CalendarOutlined,
  EnvironmentOutlined,
  TeamOutlined,
  DollarOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  ShareAltOutlined,
  LinkOutlined,
  TwitterOutlined,
  FacebookFilled,
} from "@ant-design/icons";
import { FaXTwitter } from "react-icons/fa6";

import { motion } from "framer-motion";
import { useQuery } from "@apollo/client";
import { JobPostingWithDescription, JobPosting } from "../../../types/job";
import { JOB_POSTING_QUERY } from "../../gql/queries";

const { Title, Text, Paragraph } = Typography;

interface JobDetailProps {
  jobId: string;
  onBack: () => void;
  onApply: (jobId: string) => void;
}

export function JobDetail({ jobId, onBack, onApply }: JobDetailProps) {
  const { data, loading, error } = useQuery<{
    jobPosting: JobPostingWithDescription;
  }>(JOB_POSTING_QUERY, {
    variables: { id: jobId },
    fetchPolicy: "cache-first",
  });

  const job = data?.jobPosting;
  const metadata = (job?.metadata ?? {}) as Record<string, unknown>;
  const jobDescription = job?.jobDescription ?? undefined;

  const [shareUrl, setShareUrl] = useState("");
  const [canShare, setCanShare] = useState(false);
  const jobShareId = job?.id;

  useEffect(() => {
    if (!jobShareId) {
      setShareUrl("");
      return;
    }

    const fallbackOrigin = "http://localhost:5173";

    if (typeof window === "undefined") {
      setShareUrl(`${fallbackOrigin}/${jobShareId}`);
      return;
    }

    const origin = window.location.origin || fallbackOrigin;

    try {
      const normalizedOrigin = origin.endsWith("/") ? origin : `${origin}/`;
      const url = new URL(jobShareId, normalizedOrigin);
      setShareUrl(url.toString());
    } catch {
      setShareUrl(`${fallbackOrigin}/${jobShareId}`);
    }
  }, [jobShareId]);

  useEffect(() => {
    if (typeof navigator === "undefined") return;
    setCanShare(typeof navigator.share === "function");
  }, []);

  const shareTitle =
    jobDescription?.positionName || job?.jobTitle || "Job opportunity";
  const shareDescription =
    jobDescription?.jobSummary || job?.jobSummary || undefined;
  const shareReady = shareUrl.length > 0;

  const handleCopyLink = useCallback(async () => {
    if (!shareReady) {
      message.warning("Share link is still preparing. Please try again.");
      return;
    }

    try {
      if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareUrl);
      } else if (typeof document !== "undefined") {
        const textArea = document.createElement("textarea");
        textArea.value = shareUrl;
        textArea.style.position = "fixed";
        textArea.style.opacity = "0";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
      } else {
        throw new Error("Clipboard unavailable");
      }

      message.success("Link copied to clipboard");
    } catch {
      message.error("Unable to copy the link right now.");
    }
  }, [shareReady, shareUrl]);

  const handleShare = useCallback(async () => {
    if (!shareReady) {
      message.warning("Share link is still preparing. Please try again.");
      return;
    }

    if (canShare && typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareDescription,
          url: shareUrl,
        });
        return;
      } catch (error) {
        if ((error as DOMException)?.name === "AbortError") {
          return;
        }
        message.error("Unable to open your device share menu.");
      }
    }

    await handleCopyLink();
  }, [
    canShare,
    handleCopyLink,
    shareDescription,
    shareReady,
    shareTitle,
    shareUrl,
  ]);

  const shareTooltip = !shareReady
    ? "Preparing share link..."
    : canShare
      ? "Share using your device controls"
      : "Copies the link when native sharing is unavailable";

  const openShareWindow = useCallback((targetUrl: string) => {
    if (typeof window === "undefined") {
      message.warning("Sharing is only available in the browser.");
      return;
    }

    const shareWindow = window.open(targetUrl, "_blank", "noopener,noreferrer");
    if (!shareWindow) {
      message.warning("Please allow pop-ups to share this job.");
    }
  }, []);

  const handleShareToX = useCallback(() => {
    if (!shareReady) {
      message.warning("Share link is still preparing. Please try again.");
      return;
    }

    const params = new URLSearchParams();
    params.set("url", shareUrl);

    if (shareTitle) {
      const text = shareDescription
        ? `${shareTitle} - ${shareDescription}`
        : shareTitle;
      params.set("text", text);
    }

    openShareWindow(`https://x.com/intent/tweet?${params.toString()}`);
  }, [openShareWindow, shareDescription, shareReady, shareTitle, shareUrl]);

  const handleShareToFacebook = useCallback(() => {
    if (!shareReady) {
      message.warning("Share link is still preparing. Please try again.");
      return;
    }

    const params = new URLSearchParams();
    params.set("u", shareUrl);

    openShareWindow(
      `https://www.facebook.com/sharer/sharer.php?${params.toString()}`
    );
  }, [openShareWindow, shareReady, shareUrl]);

  const getEmploymentTypeColor = (type?: string | null) => {
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

  const getVisibilityColor = (visibility: JobPosting["visibility"]) => {
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

  const calculateDaysRemaining = (deadline?: string | null) => {
    if (!deadline) return "Closing date not set";
    const deadlineDate = new Date(deadline);
    const today = new Date();
    const diffTime = deadlineDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return "Application closed";
    if (diffDays === 0) return "Last day to apply";
    if (diffDays === 1) return "1 day remaining";
    return `${diffDays} days remaining`;
  };

  const isDeadlinePassed = (deadline?: string | null) => {
    if (!deadline) return false;
    const deadlineDate = new Date(deadline);
    const today = new Date();
    return deadlineDate < today;
  };

  const formatSalary = (posting?: JobPosting) => {
    if (!posting) return null;
    if (posting.displaySalary) return posting.displaySalary;
    if (posting.salaryLabel) return posting.salaryLabel;
    if (posting.minSalary == null && posting.maxSalary == null) return null;
    const formatter = new Intl.NumberFormat("en-US", {
      style: posting.currency ? "currency" : "decimal",
      currency: posting.currency || undefined,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
    const parts: string[] = [];
    if (posting.minSalary != null)
      parts.push(formatter.format(posting.minSalary));
    if (posting.maxSalary != null && posting.maxSalary !== posting.minSalary) {
      parts.push(formatter.format(posting.maxSalary));
    }
    if (!parts.length) return null;
    return posting.payPeriod
      ? `${parts.join(" - ")} (${posting.payPeriod.toLowerCase()})`
      : parts.join(" - ");
  };

  const toList = (value: unknown): string[] => {
    if (!value) return [];
    if (Array.isArray(value)) {
      return value
        .filter((item): item is string => typeof item === "string")
        .map((item) => item.trim())
        .filter(Boolean);
    }
    if (typeof value === "string") {
      return value
        .split(/\r?\n+/)
        .map((line) =>
          line
            .replace(/^\s*([\-•*·\u2022\u2023\u25E6\u2043]|\d+\.|\d+\))\s*/, "")
            .trim()
        )
        .filter(Boolean);
    }
    return [];
  };

  const getMetadataList = (...keys: string[]): string[] => {
    for (const key of keys) {
      const list = toList(metadata[key]);
      if (list.length) {
        return list;
      }
    }
    return [];
  };

  const responsibilities = (() => {
    const primary = toList(jobDescription?.responsibilities);
    if (primary.length) return primary;
    return getMetadataList("responsibilities", "keyResponsibilities", "duties");
  })();

  const technicalSkills = (() => {
    const primary = toList(jobDescription?.technicalSkills);
    if (primary.length) return primary;
    return getMetadataList(
      "technicalSkills",
      "requiredSkills",
      "skills",
      "coreSkills"
    );
  })();

  const softSkills = (() => {
    const primary = toList(jobDescription?.softSkills);
    if (primary.length) return primary;
    return getMetadataList("softSkills", "behavioralSkills", "competencies");
  })();

  const certifications = (() => {
    const primary = toList(jobDescription?.certifications);
    if (primary.length) return primary;
    return getMetadataList("certifications", "requiredCertifications");
  })();

  const languages = (() => {
    const primary = toList(jobDescription?.languages);
    if (primary.length) return primary;
    return getMetadataList(
      "languages",
      "languageRequirements",
      "requiredLanguages"
    );
  })();

  const kpis = (() => {
    const primary = toList(jobDescription?.kpis);
    if (primary.length) return primary;
    return getMetadataList("kpis", "keyPerformanceIndicators");
  })();

  const education = (() => {
    const primary = toList(jobDescription?.education);
    if (primary.length) return primary;
    return getMetadataList("education", "educationRequirements");
  })();

  const experience = (() => {
    const primary = toList(jobDescription?.experience);
    if (primary.length) return primary;
    return getMetadataList(
      "experience",
      "experienceRequirements",
      "experienceYears"
    );
  })();

  const benefitsList = (() => {
    const primary = toList(jobDescription?.benefits);
    const extras = toList(jobDescription?.additionalBenefits);
    const combined = Array.from(new Set([...primary, ...extras]));
    if (combined.length) return combined;
    return getMetadataList("benefits", "perks", "additionalBenefits");
  })();

  const jobCode = jobDescription?.jobCode || job?.jobCode || null;
  const positionName = jobDescription?.positionName || job?.jobTitle || null;
  const jobCategory = jobDescription?.category || null;
  const jobFamily = jobDescription?.jobFamily || null;
  const division = jobDescription?.division || null;
  const grade = jobDescription?.grade || null;
  const reportsTo = jobDescription?.reportsTo || null;
  const departmentDetail =
    jobDescription?.department || job?.department || null;
  const employmentTypeDetail =
    jobDescription?.employmentType || job?.employmentType || null;
  const workLocationDetail =
    jobDescription?.workLocation || job?.workLocation || null;
  const descriptionStatus = jobDescription?.status || null;
  const approvedPositions = jobDescription?.approvedPositions ?? null;
  const filledPositionsDisplay =
    jobDescription?.filledPositions ?? job?.openingsFilled ?? null;
  const openPositions =
    jobDescription?.openings ??
    (typeof approvedPositions === "number" &&
    typeof filledPositionsDisplay === "number"
      ? Math.max(approvedPositions - filledPositionsDisplay, 0)
      : job?.openings ?? null);

  const hasRoleMetadata = [
    jobCode,
    positionName,
    jobCategory,
    jobFamily,
    division,
    grade,
    reportsTo,
    departmentDetail,
    employmentTypeDetail,
    workLocationDetail,
    descriptionStatus,
    approvedPositions,
    filledPositionsDisplay,
    openPositions,
  ].some((value) => {
    if (value === null || value === undefined) return false;
    if (typeof value === "string") return value.trim().length > 0;
    return true;
  });

  const renderOptionalValue = (value: unknown) => {
    if (value === null || value === undefined) {
      return <Text type="secondary">Not specified</Text>;
    }
    if (typeof value === "number") {
      return value;
    }
    if (typeof value === "string") {
      const trimmed = value.trim();
      return trimmed ? trimmed : <Text type="secondary">Not specified</Text>;
    }
    return value;
  };

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "40px 24px" }}>
      {loading && (
        <Card style={{ marginBottom: 24 }}>
          <Space
            align="center"
            style={{ width: "100%", justifyContent: "center" }}
          >
            <Spin />
          </Space>
        </Card>
      )}

      {error && (
        <Alert
          type="error"
          showIcon
          message="Unable to load job details"
          description={error.message}
          style={{ marginBottom: 24 }}
        />
      )}

      {!loading && !job && !error && (
        <Card>
          <Text>Job not found</Text>
          <Button onClick={onBack} style={{ marginLeft: 16 }}>
            Back to Listings
          </Button>
        </Card>
      )}

      {job && (
        <>
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
                  <Space
                    direction="vertical"
                    size="large"
                    style={{ width: "100%" }}
                  >
                    {/* Header */}
                    <div>
                      <Space size="small" wrap style={{ marginBottom: 16 }}>
                        <Tag
                          color={getEmploymentTypeColor(employmentTypeDetail)}
                        >
                          {employmentTypeDetail || "Not specified"}
                        </Tag>
                        <Tag color={getVisibilityColor(job.visibility)}>
                          {job.visibility === "BOTH"
                            ? "Internal & External"
                            : job.visibility === "INTERNAL"
                              ? "Internal"
                              : "External"}
                        </Tag>
                      </Space>

                      <Title
                        level={2}
                        style={{ marginBottom: 8, marginTop: 0 }}
                      >
                        {positionName || job.jobTitle}
                      </Title>

                      <Space size="large" wrap>
                        <Space size="small">
                          <TeamOutlined style={{ color: "#8c8c8c" }} />
                          <Text type="secondary">
                            {departmentDetail || "Department not specified"}
                          </Text>
                        </Space>
                        <Space size="small">
                          <EnvironmentOutlined style={{ color: "#8c8c8c" }} />
                          <Text type="secondary">
                            {workLocationDetail || "Location not specified"}
                          </Text>
                        </Space>
                        {formatSalary(job) && (
                          <Space size="small">
                            <DollarOutlined style={{ color: "#8c8c8c" }} />
                            <Text type="secondary">{formatSalary(job)}</Text>
                          </Space>
                        )}
                      </Space>

                      {hasRoleMetadata && (
                        <Descriptions
                          size="small"
                          column={{ xs: 1, sm: 2 }}
                          style={{ marginTop: 16 }}
                        >
                          <Descriptions.Item label="Position Name">
                            {renderOptionalValue(positionName)}
                          </Descriptions.Item>
                          <Descriptions.Item label="Job Code">
                            {renderOptionalValue(jobCode)}
                          </Descriptions.Item>
                          <Descriptions.Item label="Category">
                            {renderOptionalValue(jobCategory)}
                          </Descriptions.Item>
                          <Descriptions.Item label="Job Family">
                            {renderOptionalValue(jobFamily)}
                          </Descriptions.Item>
                          <Descriptions.Item label="Division">
                            {renderOptionalValue(division)}
                          </Descriptions.Item>
                          <Descriptions.Item label="Grade">
                            {renderOptionalValue(grade)}
                          </Descriptions.Item>
                          <Descriptions.Item label="Reports To">
                            {renderOptionalValue(reportsTo)}
                          </Descriptions.Item>
                          <Descriptions.Item label="Department">
                            {renderOptionalValue(departmentDetail)}
                          </Descriptions.Item>
                          <Descriptions.Item label="Employment Type">
                            {renderOptionalValue(employmentTypeDetail)}
                          </Descriptions.Item>
                          <Descriptions.Item label="Work Location">
                            {renderOptionalValue(workLocationDetail)}
                          </Descriptions.Item>
                          <Descriptions.Item label="Status">
                            {renderOptionalValue(descriptionStatus)}
                          </Descriptions.Item>
                          <Descriptions.Item label="Approved Positions">
                            {renderOptionalValue(approvedPositions)}
                          </Descriptions.Item>
                          <Descriptions.Item label="Filled Positions">
                            {renderOptionalValue(filledPositionsDisplay)}
                          </Descriptions.Item>
                          <Descriptions.Item label="Open Positions">
                            {renderOptionalValue(openPositions)}
                          </Descriptions.Item>
                        </Descriptions>
                      )}
                    </div>

                    <Divider style={{ margin: 0 }} />

                    {/* Job Description */}
                    <div>
                      <Title level={4}>About the Position</Title>
                      <Paragraph style={{ fontSize: 15, color: "#595959" }}>
                        {job.jobSummary ||
                          job.jobDescription?.jobSummary ||
                          "No summary provided."}
                      </Paragraph>
                    </div>

                    {/* Responsibilities */}
                    <div>
                      <Title level={4}>Key Responsibilities</Title>
                      {responsibilities.length ? (
                        <List
                          dataSource={responsibilities}
                          renderItem={(item) => (
                            <List.Item
                              style={{ border: "none", padding: "8px 0" }}
                            >
                              <Space align="start" size="small">
                                <CheckCircleOutlined
                                  style={{ color: "#52c41a", marginTop: 4 }}
                                />
                                <Text style={{ fontSize: 15 }}>{item}</Text>
                              </Space>
                            </List.Item>
                          )}
                        />
                      ) : (
                        <Text type="secondary">
                          No responsibilities specified.
                        </Text>
                      )}
                    </div>

                    {/* Technical Skills */}
                    <div>
                      <Title level={4}>Technical Skills</Title>
                      {technicalSkills.length ? (
                        <List
                          dataSource={technicalSkills}
                          renderItem={(item) => (
                            <List.Item
                              style={{ border: "none", padding: "8px 0" }}
                            >
                              <Space align="start" size="small">
                                <CheckCircleOutlined
                                  style={{ color: "#1890ff", marginTop: 4 }}
                                />
                                <Text style={{ fontSize: 15 }}>{item}</Text>
                              </Space>
                            </List.Item>
                          )}
                        />
                      ) : (
                        <Text type="secondary">
                          No technical skills specified.
                        </Text>
                      )}
                    </div>

                    {/* Soft Skills */}
                    <div>
                      <Title level={4}>Soft Skills</Title>
                      {softSkills.length ? (
                        <List
                          dataSource={softSkills}
                          renderItem={(item) => (
                            <List.Item
                              style={{ border: "none", padding: "8px 0" }}
                            >
                              <Space align="start" size="small">
                                <CheckCircleOutlined
                                  style={{ color: "#722ED1", marginTop: 4 }}
                                />
                                <Text style={{ fontSize: 15 }}>{item}</Text>
                              </Space>
                            </List.Item>
                          )}
                        />
                      ) : (
                        <Text type="secondary">No soft skills specified.</Text>
                      )}
                    </div>

                    {/* Languages */}
                    <div>
                      <Title level={4}>Languages</Title>
                      {languages.length ? (
                        <List
                          dataSource={languages}
                          renderItem={(item) => (
                            <List.Item
                              style={{ border: "none", padding: "8px 0" }}
                            >
                              <Space align="start" size="small">
                                <CheckCircleOutlined
                                  style={{ color: "#C74634", marginTop: 4 }}
                                />
                                <Text style={{ fontSize: 15 }}>{item}</Text>
                              </Space>
                            </List.Item>
                          )}
                        />
                      ) : (
                        <Text type="secondary">No languages specified.</Text>
                      )}
                    </div>

                    {/* Certifications */}
                    {certifications.length > 0 && (
                      <div>
                        <Title level={4}>Certifications</Title>
                        <List
                          dataSource={certifications}
                          renderItem={(item) => (
                            <List.Item
                              style={{ border: "none", padding: "8px 0" }}
                            >
                              <Space align="start" size="small">
                                <CheckCircleOutlined
                                  style={{ color: "#13C2C2", marginTop: 4 }}
                                />
                                <Text style={{ fontSize: 15 }}>{item}</Text>
                              </Space>
                            </List.Item>
                          )}
                        />
                      </div>
                    )}

                    {/* Education */}
                    {education.length > 0 && (
                      <div>
                        <Title level={4}>Education Requirements</Title>
                        <List
                          dataSource={education}
                          renderItem={(item) => (
                            <List.Item
                              style={{ border: "none", padding: "8px 0" }}
                            >
                              <Space align="start" size="small">
                                <CheckCircleOutlined
                                  style={{ color: "#FADB14", marginTop: 4 }}
                                />
                                <Text style={{ fontSize: 15 }}>{item}</Text>
                              </Space>
                            </List.Item>
                          )}
                        />
                      </div>
                    )}

                    {/* Experience */}
                    {experience.length > 0 && (
                      <div>
                        <Title level={4}>Experience Requirements</Title>
                        <List
                          dataSource={experience}
                          renderItem={(item) => (
                            <List.Item
                              style={{ border: "none", padding: "8px 0" }}
                            >
                              <Space align="start" size="small">
                                <CheckCircleOutlined
                                  style={{ color: "#2F54EB", marginTop: 4 }}
                                />
                                <Text style={{ fontSize: 15 }}>{item}</Text>
                              </Space>
                            </List.Item>
                          )}
                        />
                      </div>
                    )}

                    {/* Key Performance Indicators */}
                    {kpis.length > 0 && (
                      <div>
                        <Title level={4}>Key Performance Indicators</Title>
                        <List
                          dataSource={kpis}
                          renderItem={(item) => (
                            <List.Item
                              style={{ border: "none", padding: "8px 0" }}
                            >
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
                    )}

                    {/* Benefits */}
                    <div>
                      <Title level={4}>Benefits &amp; Perks</Title>
                      {benefitsList.length ? (
                        <List
                          dataSource={benefitsList}
                          renderItem={(item) => (
                            <List.Item
                              style={{ border: "none", padding: "8px 0" }}
                            >
                              <Space align="start" size="small">
                                <CheckCircleOutlined
                                  style={{ color: "#52c41a", marginTop: 4 }}
                                />
                                <Text style={{ fontSize: 15 }}>{item}</Text>
                              </Space>
                            </List.Item>
                          )}
                        />
                      ) : (
                        <Text type="secondary">No benefits specified.</Text>
                      )}
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
                <Space
                  direction="vertical"
                  size="middle"
                  style={{ width: "100%" }}
                >
                  {/* Apply Card */}
                  <Card
                    style={{
                      borderRadius: 8,
                      boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                      background: isDeadlinePassed(job.closingDate)
                        ? "#f5f5f5"
                        : "#ffffff",
                    }}
                  >
                    <Space
                      direction="vertical"
                      size="middle"
                      style={{ width: "100%" }}
                    >
                      <div>
                        <Text
                          strong
                          style={{
                            fontSize: 16,
                            display: "block",
                            marginBottom: 8,
                          }}
                        >
                          Application Deadline
                        </Text>
                        <Space size="small">
                          <CalendarOutlined style={{ color: "#C74634" }} />
                          <Text strong style={{ fontSize: 15 }}>
                            {job.closingDate
                              ? new Date(job.closingDate).toLocaleDateString(
                                  "en-US",
                                  {
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                  }
                                )
                              : "Not specified"}
                          </Text>
                        </Space>
                        <div style={{ marginTop: 8 }}>
                          <Text
                            type={
                              isDeadlinePassed(job.closingDate)
                                ? "danger"
                                : "secondary"
                            }
                            style={{ fontSize: 13 }}
                          >
                            <ClockCircleOutlined style={{ marginRight: 4 }} />
                            {calculateDaysRemaining(job.closingDate)}
                          </Text>
                        </div>
                      </div>

                      <Button
                        type="primary"
                        size="large"
                        block
                        onClick={() => onApply(job.id)}
                        disabled={isDeadlinePassed(job.closingDate)}
                        style={{ borderRadius: 4, height: 48, fontSize: 16 }}
                      >
                        {isDeadlinePassed(job.closingDate)
                          ? "Application Closed"
                          : "Apply Now"}
                      </Button>

                      {!isDeadlinePassed(job.closingDate) && (
                        <Text
                          type="secondary"
                          style={{
                            fontSize: 12,
                            display: "block",
                            textAlign: "center",
                          }}
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
                      marginTop: 8,
                      boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                    }}
                  >
                    <Space
                      direction="vertical"
                      size="middle"
                      style={{ width: "100%" }}
                    >
                      <div>
                        <Text
                          type="secondary"
                          style={{ display: "block", marginBottom: 4 }}
                        >
                          Posted Date
                        </Text>
                        <Text strong>
                          {job.postedDate
                            ? new Date(job.postedDate).toLocaleDateString(
                                "en-US",
                                {
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                }
                              )
                            : "Not specified"}
                        </Text>
                      </div>

                      <Divider style={{ margin: 0 }} />

                      <div>
                        <Text
                          type="secondary"
                          style={{ display: "block", marginBottom: 4 }}
                        >
                          Employment Type
                        </Text>
                        <Tag color={getEmploymentTypeColor(job.employmentType)}>
                          {job.employmentType || "Not specified"}
                        </Tag>
                      </div>

                      <Divider style={{ margin: 0 }} />

                      <div>
                        <Text
                          type="secondary"
                          style={{ display: "block", marginBottom: 4 }}
                        >
                          Visibility
                        </Text>
                        <Tag color={getVisibilityColor(job.visibility)}>
                          {job.visibility === "BOTH"
                            ? "Internal & External"
                            : job.visibility === "INTERNAL"
                              ? "Internal"
                              : "External"}
                        </Tag>
                      </div>

                      <Divider style={{ margin: 0 }} />

                      <div>
                        <Text
                          type="secondary"
                          style={{ display: "block", marginBottom: 4 }}
                        >
                          Department
                        </Text>
                        <Text strong>{job.department || "Not specified"}</Text>
                      </div>

                      <Divider style={{ margin: 0 }} />

                      <div>
                        <Text
                          type="secondary"
                          style={{ display: "block", marginBottom: 4 }}
                        >
                          Location
                        </Text>
                        <Text strong>
                          {job.workLocation || "Not specified"}
                        </Text>
                      </div>

                      {(experience || education || certifications.length) && (
                        <>
                          <Divider style={{ margin: 0 }} />

                          {experience && (
                            <div>
                              <Text
                                type="secondary"
                                style={{ display: "block", marginBottom: 4 }}
                              >
                                Experience Required
                              </Text>
                              <Text strong>{experience}</Text>
                            </div>
                          )}

                          {education && (
                            <>
                              {experience && <Divider style={{ margin: 0 }} />}
                              <div>
                                <Text
                                  type="secondary"
                                  style={{ display: "block", marginBottom: 4 }}
                                >
                                  Education
                                </Text>
                                <Text strong>{education}</Text>
                              </div>
                            </>
                          )}

                          {certifications.length > 0 && (
                            <>
                              {(experience || education) && (
                                <Divider style={{ margin: 0 }} />
                              )}
                              <div>
                                <Text
                                  type="secondary"
                                  style={{ display: "block", marginBottom: 4 }}
                                >
                                  Preferred Certifications
                                </Text>
                                <Space direction="vertical" size={4}>
                                  {certifications.map((item) => (
                                    <Tag key={item} color="geekblue">
                                      {item}
                                    </Tag>
                                  ))}
                                </Space>
                              </div>
                            </>
                          )}
                        </>
                      )}
                    </Space>
                  </Card>

                  {/* Share Card */}
                  <Card
                    style={{
                      borderRadius: 8,
                      marginTop: 8,
                      boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                    }}
                  >
                    <Space
                      direction="vertical"
                      size="middle"
                      style={{ width: "100%" }}
                    >
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        Share this opportunity with others who might be
                        interested
                      </Text>
                      <Space wrap>
                        <Tooltip title={shareTooltip} placement="top">
                          <Button
                            type="primary"
                            icon={<ShareAltOutlined />}
                            onClick={handleShare}
                            disabled={!shareReady}
                          >
                            Share
                          </Button>
                        </Tooltip>
                        <Button
                          icon={<FaXTwitter />}
                          onClick={handleShareToX}
                          disabled={!shareReady}
                        >
                          Share on X
                        </Button>
                        <Button
                          icon={<FacebookFilled />}
                          onClick={handleShareToFacebook}
                          disabled={!shareReady}
                        >
                          Share on Facebook
                        </Button>
                        <Button
                          icon={<LinkOutlined />}
                          onClick={handleCopyLink}
                          disabled={!shareReady}
                        >
                          Copy link
                        </Button>
                      </Space>
                    </Space>
                  </Card>
                </Space>
              </motion.div>
            </Col>
          </Row>
        </>
      )}
    </div>
  );
}
