import { Layout, Typography, Space, Divider, Row, Col } from "antd";
import {
  MailOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  GlobalOutlined,
} from "@ant-design/icons";
import { motion } from "framer-motion";

const { Footer: AntFooter } = Layout;
const { Text, Title, Link } = Typography;

interface FooterProps {
  isDarkMode: boolean;
}

export function Footer({ isDarkMode }: FooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <AntFooter
      style={{
        background: isDarkMode ? "#1f1f1f" : "#f5f5f5",
        borderTop: "1px solid #e8e8e8",
        padding: "48px 24px 24px",
        marginTop: "auto",
      }}
    >
      <div style={{ maxWidth: 1400, margin: "0 auto" }}>
        <Row gutter={[32, 32]}>
          {/* About Section */}
          <Col xs={24} sm={12} md={6}>
            <Space direction="vertical" size="middle">
              <Title level={5} style={{ marginBottom: 0 }}>
                Nkumba University
              </Title>
              <Text type="secondary" style={{ fontSize: 13 }}>
                Building careers and shaping futures through excellence in
                education and innovation.
              </Text>
            </Space>
          </Col>

          {/* Contact Information */}
          <Col xs={24} sm={12} md={6}>
            <Space direction="vertical" size="middle" style={{ width: "100%" }}>
              <Title level={5} style={{ marginBottom: 0 }}>
                Contact Us
              </Title>
              <Space direction="vertical" size="small">
                <Space size="small">
                  <PhoneOutlined style={{ color: "#C74634" }} />
                  <Text type="secondary" style={{ fontSize: 13 }}>
                    +256 414 320 021
                  </Text>
                </Space>
                <Space size="small">
                  <MailOutlined style={{ color: "#C74634" }} />
                  <Text type="secondary" style={{ fontSize: 13 }}>
                    hr@nkumbauniversity.ac.ug
                  </Text>
                </Space>
                <Space size="small" align="start">
                  <EnvironmentOutlined style={{ color: "#C74634", marginTop: 4 }} />
                  <Text type="secondary" style={{ fontSize: 13 }}>
                    Entebbe, Uganda
                  </Text>
                </Space>
              </Space>
            </Space>
          </Col>

          {/* Quick Links */}
          <Col xs={24} sm={12} md={6}>
            <Space direction="vertical" size="middle" style={{ width: "100%" }}>
              <Title level={5} style={{ marginBottom: 0 }}>
                Quick Links
              </Title>
              <Space direction="vertical" size="small">
                <Link
                  href="https://nkumbauniversity.ac.ug"
                  target="_blank"
                  style={{ fontSize: 13 }}
                >
                  University Website
                </Link>
                <Link
                  href="https://nkumbauniversity.ac.ug/about"
                  target="_blank"
                  style={{ fontSize: 13 }}
                >
                  About Us
                </Link>
                <Link
                  href="https://nkumbauniversity.ac.ug/academics"
                  target="_blank"
                  style={{ fontSize: 13 }}
                >
                  Academic Programs
                </Link>
                <Link
                  href="https://nkumbauniversity.ac.ug/research"
                  target="_blank"
                  style={{ fontSize: 13 }}
                >
                  Research
                </Link>
              </Space>
            </Space>
          </Col>

          {/* HR Department */}
          <Col xs={24} sm={12} md={6}>
            <Space direction="vertical" size="middle" style={{ width: "100%" }}>
              <Title level={5} style={{ marginBottom: 0 }}>
                Human Resources
              </Title>
              <Space direction="vertical" size="small">
                <Text type="secondary" style={{ fontSize: 13 }}>
                  For inquiries about job applications and recruitment:
                </Text>
                <Text type="secondary" style={{ fontSize: 13 }}>
                  Monday - Friday
                </Text>
                <Text type="secondary" style={{ fontSize: 13 }}>
                  8:00 AM - 5:00 PM (EAT)
                </Text>
              </Space>
            </Space>
          </Col>
        </Row>

        <Divider style={{ margin: "32px 0 24px" }} />

        {/* Bottom Section */}
        <Row justify="space-between" align="middle" gutter={[16, 16]}>
          <Col xs={24} md={12}>
            <Text type="secondary" style={{ fontSize: 12 }}>
              © {currentYear} Nkumba University. All rights reserved.
            </Text>
          </Col>
          <Col xs={24} md={12} style={{ textAlign: "right" }}>
            <Space split={<Divider type="vertical" />} size="small" wrap>
              <Link style={{ fontSize: 12 }}>Privacy Policy</Link>
              <Link style={{ fontSize: 12 }}>Terms of Service</Link>
              <Link style={{ fontSize: 12 }}>Equal Opportunity</Link>
            </Space>
          </Col>
        </Row>
      </div>
    </AntFooter>
  );
}
