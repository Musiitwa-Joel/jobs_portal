import { Card, Typography, Space, Button, Result, Divider } from "antd";
import {
  CheckCircleOutlined,
  HomeOutlined,
  MailOutlined,
} from "@ant-design/icons";
import { motion } from "framer-motion";

const { Title, Text, Paragraph } = Typography;

interface ApplicationSuccessProps {
  referenceNumber: string;
  onBackToHome: () => void;
}

export function ApplicationSuccess({
  referenceNumber,
  onBackToHome,
}: ApplicationSuccessProps) {
  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: "40px 24px" }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Card
          style={{
            borderRadius: 8,
            boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
          }}
        >
          <Result
            status="success"
            icon={
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{
                  type: "spring",
                  stiffness: 200,
                  damping: 15,
                  delay: 0.2,
                }}
              >
                <CheckCircleOutlined style={{ color: "#52c41a" }} />
              </motion.div>
            }
            title={
              <Title level={2} style={{ marginTop: 16 }}>
                Application Submitted Successfully!
              </Title>
            }
            subTitle={
              <Space direction="vertical" size="middle" style={{ width: "100%" }}>
                <Paragraph
                  style={{ fontSize: 16, color: "#595959", marginBottom: 0 }}
                >
                  Thank you for applying to Nkumba University. We have received
                  your application and will review it carefully.
                </Paragraph>

                <Card
                  style={{
                    background: "#f6ffed",
                    border: "1px solid #b7eb8f",
                    borderRadius: 4,
                    marginTop: 16,
                  }}
                >
                  <Space direction="vertical" size="small" style={{ width: "100%" }}>
                    <Text strong style={{ fontSize: 15 }}>
                      Your Reference Number:
                    </Text>
                    <Title
                      level={3}
                      copyable
                      style={{
                        color: "#52c41a",
                        marginTop: 8,
                        marginBottom: 0,
                        fontFamily: "monospace",
                      }}
                    >
                      {referenceNumber}
                    </Title>
                    <Text type="secondary" style={{ fontSize: 13 }}>
                      Please save this reference number for tracking your
                      application status
                    </Text>
                  </Space>
                </Card>

                <Divider style={{ margin: "24px 0" }} />

                <div style={{ textAlign: "left", maxWidth: 600, margin: "0 auto" }}>
                  <Title level={4}>What happens next?</Title>
                  <Space direction="vertical" size="middle">
                    <div>
                      <Space align="start">
                        <MailOutlined
                          style={{ color: "#1890ff", fontSize: 16, marginTop: 4 }}
                        />
                        <div>
                          <Text strong style={{ display: "block" }}>
                            Confirmation Email
                          </Text>
                          <Text type="secondary">
                            You will receive a confirmation email shortly with your
                            application details.
                          </Text>
                        </div>
                      </Space>
                    </div>

                    <div>
                      <Space align="start">
                        <CheckCircleOutlined
                          style={{ color: "#52c41a", fontSize: 16, marginTop: 4 }}
                        />
                        <div>
                          <Text strong style={{ display: "block" }}>
                            Application Review
                          </Text>
                          <Text type="secondary">
                            Our HR team will review your application within 2-3
                            weeks.
                          </Text>
                        </div>
                      </Space>
                    </div>

                    <div>
                      <Space align="start">
                        <CheckCircleOutlined
                          style={{ color: "#faad14", fontSize: 16, marginTop: 4 }}
                        />
                        <div>
                          <Text strong style={{ display: "block" }}>
                            Status Updates
                          </Text>
                          <Text type="secondary">
                            You can track your application status using your
                            reference number in the "Track Application" section.
                          </Text>
                        </div>
                      </Space>
                    </div>

                    <div>
                      <Space align="start">
                        <CheckCircleOutlined
                          style={{ color: "#C74634", fontSize: 16, marginTop: 4 }}
                        />
                        <div>
                          <Text strong style={{ display: "block" }}>
                            Interview Invitation
                          </Text>
                          <Text type="secondary">
                            If shortlisted, we will contact you via email or phone
                            to schedule an interview.
                          </Text>
                        </div>
                      </Space>
                    </div>
                  </Space>
                </div>

                <Divider style={{ margin: "24px 0" }} />

                <div
                  style={{
                    background: "#f5f5f5",
                    padding: 20,
                    borderRadius: 4,
                    textAlign: "center",
                  }}
                >
                  <Text type="secondary">
                    If you have any questions about your application, please contact
                    us at{" "}
                    <a href="mailto:hr@nkumbauniversity.ac.ug">
                      hr@nkumbauniversity.ac.ug
                    </a>
                  </Text>
                </div>
              </Space>
            }
            extra={[
              <Button
                type="primary"
                size="large"
                icon={<HomeOutlined />}
                onClick={onBackToHome}
                key="home"
                style={{ minWidth: 150 }}
              >
                Back to Job Listings
              </Button>,
            ]}
          />
        </Card>
      </motion.div>
    </div>
  );
}
