import { useState } from "react";
import {
  Form,
  Input,
  Button,
  Upload,
  Card,
  Typography,
  Space,
  message,
  Steps,
  Row,
  Col,
  Progress,
  Radio,
  Select,
  Spin,
  Alert,
} from "antd";
import {
  UploadOutlined,
  ArrowLeftOutlined,
  ArrowRightOutlined,
  CheckOutlined,
  UserOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  BulbOutlined,
  TrophyOutlined,
} from "@ant-design/icons";
import { motion, AnimatePresence } from "framer-motion";
import type { UploadFile, UploadProps } from "antd";
import type { RcFile } from "antd/es/upload/interface";
import { useQuery, useMutation, isApolloError } from "@apollo/client";
import { JobPostingWithDescription } from "../../../types/job";
import { JOB_POSTING_QUERY } from "../../gql/queries";
import { SUBMIT_JOB_APPLICATION_MUTATION } from "../../gql/mutations";

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { Option } = Select;

interface ResumeAttachment {
  kind: string;
  fileName: string;
  content: string;
  mimeType?: string;
}

interface SubmitJobApplicationResponse {
  submitJobApplication?: {
    applicant?: {
      applicantCode?: string | null;
    } | null;
    emailQueued: boolean;
  } | null;
}

const EXPERIENCE_YEARS_MAP: Record<string, number> = {
  "0-1": 0.5,
  "1-3": 2,
  "3-5": 4,
  "5-10": 7.5,
  "10+": 12,
};

const NOTICE_PERIOD_LABELS: Record<string, string> = {
  immediately: "Immediate",
  "2weeks": "2 Weeks",
  "1month": "1 Month",
  "2months": "2 Months",
  negotiable: "Negotiable",
};

const SOURCE_OPTIONS = [
  { value: "university-website", label: "University Website" },
  { value: "linkedin", label: "LinkedIn" },
  { value: "facebook", label: "Facebook" },
  { value: "twitter", label: "Twitter" },
  { value: "job-board", label: "Job Board" },
  { value: "referral", label: "Employee Referral" },
  { value: "newspaper", label: "Newspaper" },
  { value: "other", label: "Other" },
];

const QUALIFICATION_LABELS: Record<string, string> = {
  "high-school": "High School Diploma",
  certificate: "Certificate",
  diploma: "Diploma",
  bachelor: "Bachelor's Degree",
  master: "Master's Degree",
  phd: "PhD/Doctorate",
  other: "Other",
};

const SOURCE_LABEL_MAP = SOURCE_OPTIONS.reduce<Record<string, string>>(
  (acc, option) => {
    acc[option.value] = option.label;
    return acc;
  },
  {}
);

const fileToBase64 = (file: RcFile) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result === "string") {
        const base64 = result.includes(",") ? result.split(",")[1] : result;
        if (!base64) {
          reject(new Error("Unable to read file content."));
        } else {
          resolve(base64);
        }
      } else {
        reject(new Error("Invalid file result."));
      }
    };
    reader.onerror = () =>
      reject(reader.error || new Error("File read failed."));
    reader.readAsDataURL(file);
  });

const trimString = (value?: string | null) => {
  if (typeof value !== "string") {
    return undefined;
  }
  const trimmed = value.trim();
  return trimmed ? trimmed : undefined;
};

const mapExperienceYears = (value?: string) => {
  if (!value) return undefined;
  if (value in EXPERIENCE_YEARS_MAP) {
    return EXPERIENCE_YEARS_MAP[value];
  }
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : undefined;
};

const mapNoticePeriod = (value?: string) => {
  if (!value) return undefined;
  return NOTICE_PERIOD_LABELS[value] || value;
};

interface ApplicationFormProps {
  jobId: string;
  onBack: () => void;
  onSuccess: (referenceNumber: string) => void;
}

export function ApplicationForm({
  jobId,
  onBack,
  onSuccess,
}: ApplicationFormProps) {
  const [form] = Form.useForm();
  const [currentStep, setCurrentStep] = useState(0);
  const [resumeFile, setResumeFile] = useState<UploadFile[]>([]);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [resumeAttachment, setResumeAttachment] =
    useState<ResumeAttachment | null>(null);
  const [resumeEncoding, setResumeEncoding] = useState(false);
  const [submitApplication, { loading: submitting }] =
    useMutation<SubmitJobApplicationResponse>(SUBMIT_JOB_APPLICATION_MUTATION);

  const {
    data,
    loading: jobLoading,
    error,
  } = useQuery<{ jobPosting: JobPostingWithDescription }>(JOB_POSTING_QUERY, {
    variables: { id: jobId },
    fetchPolicy: "cache-first",
  });

  const job = data?.jobPosting;

  if (jobLoading) {
    return (
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "40px 24px" }}>
        <Card>
          <Space
            align="center"
            style={{ width: "100%", justifyContent: "center", padding: 32 }}
          >
            <Spin size="large" />
          </Space>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "40px 24px" }}>
        <Card>
          <Space direction="vertical" size="middle" style={{ width: "100%" }}>
            <Alert
              type="error"
              showIcon
              message="Unable to load job information"
              description={error.message}
            />
            <Button onClick={onBack}>Back</Button>
          </Space>
        </Card>
      </div>
    );
  }

  if (!job) {
    return (
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "40px 24px" }}>
        <Card>
          <Space direction="vertical" size="middle" style={{ width: "100%" }}>
            <Text>Job not found</Text>
            <Button onClick={onBack}>Back</Button>
          </Space>
        </Card>
      </div>
    );
  }

  const generateReferenceNumber = () => {
    const prefix = "JAP";
    const charset = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let result = "";
    for (let i = 0; i < 12; i += 1) {
      const index = Math.floor(Math.random() * charset.length);
      result += charset[index];
    }
    return `${prefix}${result}`;
  };

  const uploadProps: UploadProps = {
    beforeUpload: async (file) => {
      const rcFile = file as RcFile;
      const mimeType = rcFile.type || "";
      const isPDF = mimeType === "application/pdf";
      const isDoc =
        mimeType === "application/msword" ||
        mimeType ===
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

      if (!isPDF && !isDoc) {
        message.error("You can only upload PDF or DOC/DOCX files!");
        return false;
      }

      const isLt5M = rcFile.size / 1024 / 1024 < 5;
      if (!isLt5M) {
        message.error("File must be smaller than 5MB!");
        return false;
      }

      setResumeEncoding(true);
      setResumeAttachment(null);

      try {
        const base64 = await fileToBase64(rcFile);
        const uploadEntry: UploadFile = {
          uid: rcFile.uid,
          name: rcFile.name,
          status: "done",
          size: rcFile.size,
          type: mimeType,
          originFileObj: rcFile,
        };
        setResumeFile([uploadEntry]);
        setResumeAttachment({
          kind: "RESUME",
          fileName: rcFile.name,
          mimeType: mimeType || "application/octet-stream",
          content: base64,
        });
        message.success(`${rcFile.name} is ready to submit.`);
      } catch (err) {
        console.error(err);
        const errorMessage =
          err instanceof Error ? err.message : "Failed to process resume file.";
        message.error(errorMessage);
        setResumeFile([]);
        setResumeAttachment(null);
      } finally {
        setResumeEncoding(false);
      }

      return false;
    },
    onRemove: () => {
      setResumeFile([]);
      setResumeAttachment(null);
      return true;
    },
    fileList: resumeFile,
    maxCount: 1,
  };

  const steps = [
    {
      title: "Personal",
      icon: <UserOutlined />,
    },
    {
      title: "Background",
      icon: <TrophyOutlined />,
    },
    {
      title: "About You",
      icon: <BulbOutlined />,
    },
    {
      title: "Documents",
      icon: <FileTextOutlined />,
    },
    {
      title: "Review",
      icon: <CheckCircleOutlined />,
    },
  ];

  const handleNext = async () => {
    try {
      if (currentStep === 0) {
        const values = await form.validateFields([
          "firstName",
          "lastName",
          "email",
          "phone",
          "employeeId",
        ]);
        setFormData({ ...formData, ...values });
        setCurrentStep(1);
      } else if (currentStep === 1) {
        const values = await form.validateFields([
          "currentRole",
          "yearsOfExperience",
          "highestQualification",
          "currentEmployer",
        ]);
        setFormData({ ...formData, ...values });
        setCurrentStep(2);
      } else if (currentStep === 2) {
        const values = await form.validateFields([
          "whyThisRole",
          "whatMakesYouFit",
          "careerGoals",
          "canStartDate",
        ]);
        setFormData({ ...formData, ...values });
        setCurrentStep(3);
      } else if (currentStep === 3) {
        if (resumeEncoding) {
          message.warning("Please wait until your resume finishes processing.");
          return;
        }

        if (resumeFile.length === 0 || !resumeAttachment) {
          message.error("Please upload your resume/CV");
          return;
        }
        const values = form.getFieldsValue([
          "coverLetter",
          "howDidYouHear",
          "employeeId",
          "additionalComments",
        ]);
        setFormData({ ...formData, ...values });
        setCurrentStep(4);
      }
    } catch (error) {
      console.error("Validation failed:", error);
    }
  };

  const handlePrevious = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async () => {
    if (resumeEncoding) {
      message.warning("Please wait until your resume finishes processing.");
      return;
    }

    if (!resumeAttachment) {
      message.error("Please upload your resume/CV before submitting.");
      return;
    }

    try {
      const currentValues = form.getFieldsValue(true);
      const allValues = { ...formData, ...currentValues };

      const firstName = trimString(allValues.firstName as string | undefined);
      const lastName = trimString(allValues.lastName as string | undefined);
      const email = trimString(allValues.email as string | undefined);

      if (!firstName || !lastName || !email) {
        message.error("First name, last name, and a valid email are required.");
        return;
      }

      const sourceKey = trimString(
        allValues.howDidYouHear as string | undefined
      );
      const sourceLabel = sourceKey
        ? SOURCE_LABEL_MAP[sourceKey] || sourceKey
        : undefined;
      const keySkills =
        typeof allValues.keySkills === "string"
          ? (allValues.keySkills as string)
              .split(",")
              .map((skill) => skill.trim())
              .filter(Boolean)
          : undefined;

      const qualificationKey = trimString(
        allValues.highestQualification as string | undefined
      );
      const qualificationLabel = qualificationKey
        ? QUALIFICATION_LABELS[qualificationKey] || qualificationKey
        : undefined;

      const metadataDraft: Record<string, unknown> = {
        employeeId: trimString(allValues.employeeId as string | undefined),
        highestQualification: qualificationLabel,
        keySkills,
        careerGoals: trimString(allValues.careerGoals as string | undefined),
        whatMakesYouFit: trimString(
          allValues.whatMakesYouFit as string | undefined
        ),
        whyThisRole: trimString(allValues.whyThisRole as string | undefined),
        experienceRange: allValues.yearsOfExperience,
        noticePreference: allValues.canStartDate,
        heardFrom: sourceLabel,
      };

      if (sourceKey) {
        metadataDraft.heardFromKey = sourceKey;
      }

      if (qualificationKey) {
        metadataDraft.highestQualificationKey = qualificationKey;
      }

      metadataDraft.resumeFileName = resumeAttachment.fileName;
      metadataDraft.resumeMimeType = resumeAttachment.mimeType;

      if (trimString(allValues.additionalComments as string | undefined)) {
        metadataDraft.additionalComments = trimString(
          allValues.additionalComments as string | undefined
        );
      }

      const metadataEntries = Object.entries(metadataDraft).filter(
        ([_, value]) => {
          if (Array.isArray(value)) {
            return value.length > 0;
          }
          if (value == null) {
            return false;
          }
          if (typeof value === "string") {
            return value.trim().length > 0;
          }
          return true;
        }
      );

      const metadata = metadataEntries.length
        ? Object.fromEntries(metadataEntries)
        : undefined;

      const input = {
        jobPostingId: job.id,
        firstName,
        lastName,
        email,
        phone: trimString(allValues.phone as string | undefined),
        source: sourceLabel || sourceKey || "Jobs Portal",
        resume: { ...resumeAttachment },
        coverLetter: trimString(allValues.coverLetter as string | undefined),
        currentEmployer: trimString(
          allValues.currentEmployer as string | undefined
        ),
        currentTitle: trimString(allValues.currentRole as string | undefined),
        experienceYears: mapExperienceYears(
          allValues.yearsOfExperience as string | undefined
        ),
        noticePeriod: mapNoticePeriod(
          allValues.canStartDate as string | undefined
        ),
        expectedSalary: undefined,
        salaryCurrency: undefined,
        message: trimString(allValues.additionalComments as string | undefined),
        metadata,
      };

      const { data: submissionData } = await submitApplication({
        variables: { input },
      });

      const referenceNumber =
        submissionData?.submitJobApplication?.applicant?.applicantCode ||
        generateReferenceNumber();

      message.success(
        `Application submitted successfully! Reference: ${referenceNumber}`
      );
      form.resetFields();
      setResumeFile([]);
      setResumeAttachment(null);
      setResumeEncoding(false);
      setFormData({});
      setCurrentStep(0);
      onSuccess(referenceNumber);
    } catch (err) {
      console.error("Application submission failed:", err);
      let errorMessage = "Failed to submit application. Please try again.";
      // Narrow the unknown caught error for safer checks
      const maybeApollo = isApolloError(err as Error) ? (err as any) : null;
      if (maybeApollo) {
        if (maybeApollo.graphQLErrors.length) {
          errorMessage = maybeApollo.graphQLErrors[0].message;
        }

        const networkError = maybeApollo.networkError as
          | (Error & {
              statusCode?: number;
              status?: number;
              result?: { statusCode?: number };
            })
          | undefined;

        if (networkError) {
          const statusCode =
            typeof networkError.statusCode === "number"
              ? networkError.statusCode
              : typeof networkError.status === "number"
                ? networkError.status
                : typeof networkError.result?.statusCode === "number"
                  ? networkError.result.statusCode
                  : undefined;

          if (statusCode === 413) {
            errorMessage =
              "We couldn't upload your resume because the server reported it was too large. Please confirm the file is under 5 MB, then try again. If it already is, wait a moment and retry or email hr@nkumbauniversity.ac.ug for help.";
          } else if (!maybeApollo.graphQLErrors.length) {
            errorMessage =
              "We couldn't submit your application because of a network issue. Please try again in a moment.";
          }
        }
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      message.error(errorMessage);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Space direction="vertical" size="middle" style={{ width: "100%" }}>
              <div>
                <Title level={4} style={{ marginBottom: 4, fontSize: 18 }}>
                  Let's start with your contact information
                </Title>
                <Text style={{ fontSize: 13, color: "#666666" }}>
                  We'll use this to keep in touch with you about your
                  application
                </Text>
              </div>

              <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="firstName"
                    label="First Name"
                    rules={[
                      {
                        required: true,
                        message: "Please enter your first name",
                      },
                    ]}
                  >
                    <Input placeholder="Enter your first name" />
                  </Form.Item>
                </Col>

                <Col xs={24} sm={12}>
                  <Form.Item
                    name="lastName"
                    label="Last Name"
                    rules={[
                      {
                        required: true,
                        message: "Please enter your last name",
                      },
                    ]}
                  >
                    <Input placeholder="Enter your last name" />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                name="email"
                label="Email Address"
                rules={[
                  {
                    required: true,
                    type: "email",
                    message: "Please enter a valid email address",
                  },
                ]}
              >
                <Input placeholder="your.email@example.com" />
              </Form.Item>

              <Form.Item
                name="phone"
                label="Phone Number"
                rules={[
                  {
                    required: true,
                    message: "Please enter your phone number",
                  },
                  {
                    pattern: /^[0-9+\-\s()]+$/,
                    message: "Please enter a valid phone number",
                  },
                ]}
              >
                <Input placeholder="+256 700 000 000" />
              </Form.Item>

              {(job.visibility === "INTERNAL" || job.visibility === "BOTH") && (
                <Form.Item
                  name="employeeId"
                  label="Employee ID (Optional)"
                  help="For internal applicants only"
                >
                  <Input placeholder="Enter your employee ID if applicable" />
                </Form.Item>
              )}
            </Space>
          </motion.div>
        );

      case 1:
        return (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Space direction="vertical" size="middle" style={{ width: "100%" }}>
              <div>
                <Title level={4} style={{ marginBottom: 4, fontSize: 18 }}>
                  Tell us about your professional background
                </Title>
                <Text style={{ fontSize: 13, color: "#666666" }}>
                  Help us understand your experience and qualifications
                </Text>
              </div>

              <Form.Item
                name="currentRole"
                label="What is your current or most recent job title?"
                rules={[
                  {
                    required: true,
                    message: "Please enter your current or most recent role",
                  },
                ]}
              >
                <Input placeholder="e.g., Software Engineer, Lecturer, Administrator" />
              </Form.Item>

              <Form.Item
                name="currentEmployer"
                label="Current or most recent employer"
                rules={[
                  {
                    required: true,
                    message: "Please enter your employer",
                  },
                ]}
              >
                <Input placeholder="Company or organization name" />
              </Form.Item>

              <Form.Item
                name="yearsOfExperience"
                label="Years of relevant experience"
                rules={[
                  {
                    required: true,
                    message: "Please select your experience level",
                  },
                ]}
              >
                <Select placeholder="Select your experience level">
                  <Option value="0-1">Less than 1 year</Option>
                  <Option value="1-3">1-3 years</Option>
                  <Option value="3-5">3-5 years</Option>
                  <Option value="5-10">5-10 years</Option>
                  <Option value="10+">More than 10 years</Option>
                </Select>
              </Form.Item>

              <Form.Item
                name="highestQualification"
                label="Highest level of education"
                rules={[
                  {
                    required: true,
                    message: "Please select your qualification",
                  },
                ]}
              >
                <Select placeholder="Select your highest qualification">
                  <Option value="high-school">High School Diploma</Option>
                  <Option value="certificate">Certificate</Option>
                  <Option value="diploma">Diploma</Option>
                  <Option value="bachelor">Bachelor's Degree</Option>
                  <Option value="master">Master's Degree</Option>
                  <Option value="phd">PhD/Doctorate</Option>
                  <Option value="other">Other</Option>
                </Select>
              </Form.Item>

              <Form.Item
                name="keySkills"
                label="Key skills relevant to this position (Optional)"
                help="Separate with commas"
              >
                <Input placeholder="e.g., Project Management, Data Analysis, Teaching" />
              </Form.Item>
            </Space>
          </motion.div>
        );

      case 2:
        return (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Space direction="vertical" size="middle" style={{ width: "100%" }}>
              <div>
                <Title level={4} style={{ marginBottom: 4, fontSize: 18 }}>
                  Help us get to know you better
                </Title>
                <Text style={{ fontSize: 13, color: "#666666" }}>
                  Share your motivation and career aspirations with us
                </Text>
              </div>

              <Form.Item
                name="whyThisRole"
                label="Why are you interested in this position?"
                rules={[
                  {
                    required: true,
                    message: "Please tell us why you're interested",
                  },
                  {
                    min: 50,
                    message: "Please provide at least 50 characters",
                  },
                ]}
              >
                <TextArea
                  rows={4}
                  placeholder="Tell us what excites you about this opportunity and why you want to work at Nkumba University..."
                  maxLength={500}
                  showCount
                />
              </Form.Item>

              <Form.Item
                name="whatMakesYouFit"
                label="What makes you a good fit for this role?"
                rules={[
                  {
                    required: true,
                    message: "Please describe what makes you a good fit",
                  },
                  {
                    min: 50,
                    message: "Please provide at least 50 characters",
                  },
                ]}
              >
                <TextArea
                  rows={4}
                  placeholder="Describe your relevant experience, skills, and qualities that align with this position..."
                  maxLength={500}
                  showCount
                />
              </Form.Item>

              <Form.Item
                name="careerGoals"
                label="What are your career goals for the next 3-5 years?"
                rules={[
                  {
                    required: true,
                    message: "Please share your career goals",
                  },
                  {
                    min: 30,
                    message: "Please provide at least 30 characters",
                  },
                ]}
              >
                <TextArea
                  rows={3}
                  placeholder="Share your professional aspirations and how this role fits into your career path..."
                  maxLength={400}
                  showCount
                />
              </Form.Item>

              <Form.Item
                name="canStartDate"
                label="When can you start if selected?"
                rules={[
                  {
                    required: true,
                    message: "Please select your availability",
                  },
                ]}
              >
                <Radio.Group>
                  <Space direction="vertical">
                    <Radio value="immediately">Immediately</Radio>
                    <Radio value="2weeks">2 weeks notice</Radio>
                    <Radio value="1month">1 month notice</Radio>
                    <Radio value="2months">2 months notice</Radio>
                    <Radio value="negotiable">Negotiable</Radio>
                  </Space>
                </Radio.Group>
              </Form.Item>
            </Space>
          </motion.div>
        );

      case 3:
        return (
          <motion.div
            key="step4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Space direction="vertical" size="middle" style={{ width: "100%" }}>
              <div>
                <Title level={4} style={{ marginBottom: 4, fontSize: 18 }}>
                  Upload your documents
                </Title>
                <Text style={{ fontSize: 13, color: "#666666" }}>
                  Please upload your resume and any supporting documents
                </Text>
              </div>

              <Form.Item
                label="Resume / CV"
                required
                help="Accepted formats: PDF, DOC, DOCX (Max size: 5MB)"
              >
                <Upload {...uploadProps} disabled={resumeEncoding}>
                  <Button
                    icon={<UploadOutlined />}
                    style={{ width: "100%" }}
                    disabled={resumeEncoding}
                  >
                    {resumeFile.length > 0
                      ? "Change Resume/CV"
                      : "Upload Resume/CV"}
                  </Button>
                </Upload>
                {resumeEncoding && (
                  <Text
                    style={{ marginTop: 8, display: "block" }}
                    type="secondary"
                  >
                    Processing document...
                  </Text>
                )}
                {resumeFile.length > 0 && (
                  <div
                    style={{
                      marginTop: 12,
                      padding: 12,
                      background: "#f6ffed",
                      border: "1px solid #b7eb8f",
                      borderRadius: 2,
                    }}
                  >
                    <CheckOutlined
                      style={{ color: "#52c41a", marginRight: 8 }}
                    />
                    <Text style={{ color: "#52c41a", fontSize: 13 }}>
                      {resumeFile[0].name} uploaded successfully
                    </Text>
                  </div>
                )}
              </Form.Item>

              <Form.Item
                name="coverLetter"
                label="Cover Letter (Optional but recommended)"
                help="A well-written cover letter can strengthen your application"
              >
                <TextArea
                  rows={6}
                  placeholder="Use this space to introduce yourself and highlight why you're the ideal candidate for this position..."
                  maxLength={2000}
                  showCount
                />
              </Form.Item>

              <Form.Item
                name="howDidYouHear"
                label="How did you hear about this position?"
              >
                <Select placeholder="Select an option">
                  {SOURCE_OPTIONS.map((option) => (
                    <Option key={option.value} value={option.value}>
                      {option.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                name="additionalComments"
                label="Additional Comments (Optional)"
              >
                <TextArea
                  rows={3}
                  placeholder="Any additional information you'd like to share..."
                  maxLength={500}
                  showCount
                />
              </Form.Item>
            </Space>
          </motion.div>
        );

      case 4:
        return (
          <motion.div
            key="step5"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Space direction="vertical" size="middle" style={{ width: "100%" }}>
              <div>
                <Title level={4} style={{ marginBottom: 4, fontSize: 18 }}>
                  Review your application
                </Title>
                <Text style={{ fontSize: 13, color: "#666666" }}>
                  Please review your information before submitting
                </Text>
              </div>

              <Card
                title="Personal Information"
                size="small"
                style={{ background: "#fafafa" }}
              >
                <Space
                  direction="vertical"
                  size="small"
                  style={{ width: "100%" }}
                >
                  <Row>
                    <Col span={8}>
                      <Text strong style={{ fontSize: 12 }}>
                        Name:
                      </Text>
                    </Col>
                    <Col span={16}>
                      <Text style={{ fontSize: 12 }}>
                        {formData.firstName} {formData.lastName}
                      </Text>
                    </Col>
                  </Row>
                  <Row>
                    <Col span={8}>
                      <Text strong style={{ fontSize: 12 }}>
                        Email:
                      </Text>
                    </Col>
                    <Col span={16}>
                      <Text style={{ fontSize: 12 }}>{formData.email}</Text>
                    </Col>
                  </Row>
                  <Row>
                    <Col span={8}>
                      <Text strong style={{ fontSize: 12 }}>
                        Phone:
                      </Text>
                    </Col>
                    <Col span={16}>
                      <Text style={{ fontSize: 12 }}>{formData.phone}</Text>
                    </Col>
                  </Row>
                  {formData.employeeId && (
                    <Row>
                      <Col span={8}>
                        <Text strong style={{ fontSize: 12 }}>
                          Employee ID:
                        </Text>
                      </Col>
                      <Col span={16}>
                        <Text style={{ fontSize: 12 }}>
                          {formData.employeeId}
                        </Text>
                      </Col>
                    </Row>
                  )}
                </Space>
              </Card>

              <Card
                title="Professional Background"
                size="small"
                style={{ background: "#fafafa" }}
              >
                <Space
                  direction="vertical"
                  size="small"
                  style={{ width: "100%" }}
                >
                  <Row>
                    <Col span={8}>
                      <Text strong style={{ fontSize: 12 }}>
                        Current Role:
                      </Text>
                    </Col>
                    <Col span={16}>
                      <Text style={{ fontSize: 12 }}>
                        {formData.currentRole}
                      </Text>
                    </Col>
                  </Row>
                  <Row>
                    <Col span={8}>
                      <Text strong style={{ fontSize: 12 }}>
                        Employer:
                      </Text>
                    </Col>
                    <Col span={16}>
                      <Text style={{ fontSize: 12 }}>
                        {formData.currentEmployer}
                      </Text>
                    </Col>
                  </Row>
                  <Row>
                    <Col span={8}>
                      <Text strong style={{ fontSize: 12 }}>
                        Experience:
                      </Text>
                    </Col>
                    <Col span={16}>
                      <Text style={{ fontSize: 12 }}>
                        {formData.yearsOfExperience}
                      </Text>
                    </Col>
                  </Row>
                  <Row>
                    <Col span={8}>
                      <Text strong style={{ fontSize: 12 }}>
                        Education:
                      </Text>
                    </Col>
                    <Col span={16}>
                      <Text style={{ fontSize: 12 }}>
                        {formData.highestQualification}
                      </Text>
                    </Col>
                  </Row>
                </Space>
              </Card>

              <Card
                title="Why You're Applying"
                size="small"
                style={{ background: "#fafafa" }}
              >
                <Space
                  direction="vertical"
                  size="small"
                  style={{ width: "100%" }}
                >
                  <div>
                    <Text
                      strong
                      style={{
                        fontSize: 12,
                        display: "block",
                        marginBottom: 4,
                      }}
                    >
                      Interest in Role:
                    </Text>
                    <Paragraph
                      ellipsis={{ rows: 2, expandable: true }}
                      style={{ fontSize: 12, marginBottom: 8, color: "#666" }}
                    >
                      {formData.whyThisRole}
                    </Paragraph>
                  </div>
                  <div>
                    <Text
                      strong
                      style={{
                        fontSize: 12,
                        display: "block",
                        marginBottom: 4,
                      }}
                    >
                      What Makes You Fit:
                    </Text>
                    <Paragraph
                      ellipsis={{ rows: 2, expandable: true }}
                      style={{ fontSize: 12, marginBottom: 8, color: "#666" }}
                    >
                      {formData.whatMakesYouFit}
                    </Paragraph>
                  </div>
                  <Row>
                    <Col span={8}>
                      <Text strong style={{ fontSize: 12 }}>
                        Start Date:
                      </Text>
                    </Col>
                    <Col span={16}>
                      <Text style={{ fontSize: 12 }}>
                        {formData.canStartDate}
                      </Text>
                    </Col>
                  </Row>
                </Space>
              </Card>

              <Card
                title="Documents"
                size="small"
                style={{ background: "#fafafa" }}
              >
                <Space
                  direction="vertical"
                  size="small"
                  style={{ width: "100%" }}
                >
                  <Row>
                    <Col span={8}>
                      <Text strong style={{ fontSize: 12 }}>
                        Resume:
                      </Text>
                    </Col>
                    <Col span={16}>
                      <Text style={{ fontSize: 12 }}>
                        {resumeFile[0]?.name || "No file"}
                      </Text>
                    </Col>
                  </Row>
                  {formData.coverLetter && (
                    <Row>
                      <Col span={8}>
                        <Text strong style={{ fontSize: 12 }}>
                          Cover Letter:
                        </Text>
                      </Col>
                      <Col span={16}>
                        <Text style={{ fontSize: 12, color: "#52c41a" }}>
                          ✓ Included
                        </Text>
                      </Col>
                    </Row>
                  )}
                </Space>
              </Card>

              <Card
                size="small"
                style={{
                  background: "#fff7e6",
                  border: "1px solid #ffd591",
                }}
              >
                <Space direction="vertical" size="small">
                  <Text strong style={{ fontSize: 12 }}>
                    Data Privacy Notice
                  </Text>
                  <Text style={{ fontSize: 12, color: "#666666" }}>
                    By submitting this application, you consent to Nkumba
                    University collecting and processing your personal data for
                    recruitment purposes. Your information will be kept
                    confidential and used solely for this application.
                  </Text>
                </Space>
              </Card>
            </Space>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "32px 24px" }}>
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
          style={{ marginBottom: 24, padding: "4px 8px", fontSize: 13 }}
        >
          Back to Job Details
        </Button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card
          style={{
            borderRadius: 0,
            boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
            border: "1px solid #e8e8e8",
          }}
          bodyStyle={{ padding: 32 }}
        >
          <Space direction="vertical" size="large" style={{ width: "100%" }}>
            {/* Header */}
            <div>
              <Title level={2} style={{ marginBottom: 8, fontSize: 24 }}>
                Apply for Position
              </Title>
              <Text
                style={{ fontSize: 14, color: "#666666", display: "block" }}
              >
                {job.jobTitle}
              </Text>
              <Text style={{ fontSize: 13, color: "#999999" }}>
                {`${job.department || "Department not specified"} • ${job.workLocation || "Location not specified"}`}
              </Text>
            </div>

            {/* Progress Indicator */}
            <div style={{ marginBottom: 8 }}>
              <Progress
                percent={((currentStep + 1) / steps.length) * 100}
                showInfo={false}
                strokeColor="#C74634"
                style={{ marginBottom: 16 }}
              />
              <Steps
                current={currentStep}
                items={steps}
                size="small"
                style={{ marginBottom: 0 }}
              />
            </div>

            {/* Form */}
            <Form
              form={form}
              layout="vertical"
              requiredMark="optional"
              initialValues={formData}
            >
              <AnimatePresence mode="wait">
                {renderStepContent()}
              </AnimatePresence>
            </Form>

            {/* Navigation Buttons */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                paddingTop: 16,
                borderTop: "1px solid #f0f0f0",
              }}
            >
              <Button
                onClick={currentStep === 0 ? onBack : handlePrevious}
                disabled={submitting}
                style={{ minWidth: 100 }}
              >
                {currentStep === 0 ? "Cancel" : "Previous"}
              </Button>

              {currentStep < steps.length - 1 ? (
                <Button
                  type="primary"
                  onClick={handleNext}
                  icon={<ArrowRightOutlined />}
                  iconPosition="end"
                  disabled={submitting || (currentStep === 3 && resumeEncoding)}
                  style={{ minWidth: 100 }}
                >
                  Next
                </Button>
              ) : (
                <Button
                  type="primary"
                  onClick={handleSubmit}
                  loading={submitting}
                  icon={<CheckOutlined />}
                  iconPosition="end"
                  disabled={submitting}
                  style={{ minWidth: 120 }}
                >
                  Submit Application
                </Button>
              )}
            </div>
          </Space>
        </Card>
      </motion.div>
    </div>
  );
}
