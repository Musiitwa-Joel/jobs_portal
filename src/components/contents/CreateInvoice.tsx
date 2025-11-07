import React, { useState } from "react";
import { InfoCircleOutlined } from "@ant-design/icons";
import { Button, Card, Form, Input, Tag } from "antd";
import InvoiceTable from "./InvoiceTable";

type RequiredMark = boolean | "optional" | "customize";

const customizeRequiredMark = (
  label: React.ReactNode,
  { required }: { required: boolean }
) => (
  <>
    {required ? (
      <Tag color="error">Required</Tag>
    ) : (
      <Tag color="warning">optional</Tag>
    )}
    {label}
  </>
);

const CreateInvoice: React.FC = () => {
  const [form] = Form.useForm();
  const [requiredMark, setRequiredMarkType] =
    useState<RequiredMark>("optional");

  const onRequiredTypeChange = ({
    requiredMarkValue,
  }: {
    requiredMarkValue: RequiredMark;
  }) => {
    setRequiredMarkType(requiredMarkValue);
  };

  return (
    <Card>
      <div style={{ display: "flex", alignItems: "flex-start" }}>
        <Form
          style={{ width: "30%", marginRight: "10px" }}
          form={form}
          layout="vertical"
          initialValues={{ requiredMarkValue: requiredMark }}
          onValuesChange={onRequiredTypeChange}
          requiredMark={
            requiredMark === "customize" ? customizeRequiredMark : requiredMark
          }
        >
          <Form.Item
            label="FULL NAME"
            required
            tooltip="Please Enter the full name"
          >
            <Input placeholder="Input Full Name" />
          </Form.Item>
          <Form.Item
            required
            label="EMAIL ADDRESS"
            tooltip={{
              title: "Please Enter your email address",
              icon: <InfoCircleOutlined />,
            }}
          >
            <Input placeholder="Input Email Address" />
          </Form.Item>
          <Form.Item
            required
            label="STUDENT ID"
            tooltip={{
              title: "Please Enter your student ID",
              icon: <InfoCircleOutlined />,
            }}
          >
            <Input placeholder="Input STUDENT ID" />
          </Form.Item>

          <Form.Item>
            <Button type="primary">Submit</Button>
          </Form.Item>
        </Form>
        {/* <Card style={{ width: "100%" }}> */}
        {/* <div style={{ flex: 1 }}>
          <InvoiceTable />
        </div> */}
        {/* </Card> */}
      </div>
    </Card>
  );
};

export default CreateInvoice;
