import { useState } from "react";
import { Alert, Button, Card, Form, Input } from "antd";
import Marquee from "react-fast-marquee";
import {
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  NumberOutlined,
  RightCircleOutlined,
  LeftCircleOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import SelectItemTable from "./SelectItemTable";

interface FormData {
  fullName: string;
  email: string;
  telephone: string;
  studentNumber?: string;
}

interface StudentFile {
  biodata: {
    surname: string;
    other_names: string;
  };
  student_no: string;
  email: string;
  telephone: string;
}

export default function PaymentPortal() {
  const [form] = Form.useForm();
  const [submitted, setSubmitted] = useState(false);
  const [returned, setReturned] = useState(false);
  const [studentFile, setStudentFile] = useState<StudentFile | null>(null);

  const onFinish = (values: FormData) => {
    console.log("Form values:", values);

    // Parse the full name into surname and other names
    const nameParts = values.fullName.trim().split(" ");
    const surname = nameParts[0] || "";
    const other_names = nameParts.slice(1).join(" ") || "";

    // Create student file object
    const studentData: StudentFile = {
      biodata: {
        surname: surname,
        other_names: other_names,
      },
      student_no: values.studentNumber || "",
      email: values.email,
      telephone: values.telephone,
    };

    console.log("Student file created:", studentData);
    setStudentFile(studentData);
    setSubmitted(true);
    setReturned(false);
  };

  const handleBack = () => {
    setSubmitted(false);
    setReturned(true);
  };

  const handleClearForm = () => {
    form.resetFields();
    setStudentFile(null);
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <Alert
        className="mb-6"
        type="info"
        banner
        message={
          <Marquee pauseOnHover gradient={false}>
            This platform allows you to generate a Tred Pay reference for making
            payments to the university through specified financial institutions.
            If you are a continuing student, please use the student portal to
            make payments to the institution. This form is ONLY intended for
            &nbsp;
            <span className="text-red-500 font-bold">
              NON-STUDENTS and FORMER STUDENTS &nbsp;
            </span>
            of Nkumba University.
          </Marquee>
        }
      />

      <Card className="mb-4">
        {submitted && studentFile ? (
          <div>
            <SelectItemTable studentFile={studentFile} />
            <Button
              icon={<LeftCircleOutlined />}
              type="default"
              danger
              onClick={handleBack}
              size="small"
              className="mr-2"
            >
              BACK
            </Button>
          </div>
        ) : (
          <Form
            style={{ width: "100%" }}
            form={form}
            layout="vertical"
            onFinish={onFinish}
            requiredMark="optional"
          >
            <Form.Item
              label="Full Name"
              name="fullName"
              required
              rules={[
                { required: true, message: "Please enter your full name" },
                { min: 2, message: "Name must be at least 2 characters" },
              ]}
              style={{ marginBottom: 12 }}
            >
              <Input
                prefix={<UserOutlined />}
                placeholder="Enter your full name (e.g., Mubiru David )"
              />
            </Form.Item>

            <Form.Item
              label="E-mail address"
              name="email"
              required
              rules={[
                { required: true, message: "Please enter your email address" },
                {
                  type: "email",
                  message: "Please enter a valid email address",
                },
              ]}
              style={{ marginBottom: 12 }}
            >
              <Input
                prefix={<MailOutlined />}
                placeholder="Enter your email address"
              />
            </Form.Item>

            <Form.Item
              label="Telephone No."
              name="telephone"
              required
              rules={[
                {
                  required: true,
                  message: "Please enter your telephone number",
                },
                {
                  pattern: /^[0-9+\-\s()]+$/,
                  message: "Please enter a valid telephone number",
                },
              ]}
              extra="Please start with country code. e.g 256"
              style={{ marginBottom: 12 }}
            >
              <Input
                prefix={<PhoneOutlined />}
                placeholder="Enter your telephone number"
              />
            </Form.Item>

            <Form.Item
              label="Student or Reg. No."
              name="studentNumber"
              extra="Only for former Students i.e. alumni!"
              style={{ marginBottom: 12 }}
            >
              <Input
                prefix={<NumberOutlined />}
                placeholder="Enter your student or index number"
              />
            </Form.Item>

            <Form.Item
              style={{
                marginBottom: 12,
                display: "flex",
                justifyContent: "flex-end",
              }}
            >
              <Button
                icon={<RightCircleOutlined />}
                type="primary"
                htmlType="submit"
                size="small"
                className="mr-2"
              >
                CONTINUE
              </Button>
              {returned && (
                <Button
                  icon={<DeleteOutlined />}
                  type="default"
                  onClick={handleClearForm}
                  size="small"
                  danger
                >
                  CLEAR FORM
                </Button>
              )}
            </Form.Item>
          </Form>
        )}
      </Card>
    </div>
  );
}
