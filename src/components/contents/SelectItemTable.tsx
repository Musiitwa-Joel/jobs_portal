import type React from "react";
import { useState, useMemo, useCallback, useEffect } from "react";
import { useQuery, useMutation } from "@apollo/client";
import {
  Table,
  Button,
  InputNumber,
  Checkbox,
  message,
  Spin,
  Card,
  Typography,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { CURRENT_FEES } from "../../gql/queries";
import { GENERATE_GLOBAL_PRT } from "../../gql/mutations";
import PaymentSlip from "./PaymentSlip";

const { Text } = Typography;

interface DataType {
  key: string;
  item: string;
  unitCost: number;
  quantity: number;
  selected: boolean;
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

interface SelectItemTableProps {
  studentFile: StudentFile;
}

const PartialPayment: React.FC<SelectItemTableProps> = ({ studentFile }) => {
  const {
    loading,
    error,
    data: queryData,
  } = useQuery(CURRENT_FEES, {
    errorPolicy: "all",
    notifyOnNetworkStatusChange: true,
    onError: (error) => {
      console.error("GraphQL Error Details:", {
        message: error.message,
        graphQLErrors: error.graphQLErrors,
        networkError: error.networkError,
        extraInfo: error.extraInfo,
      });

      if (error.networkError) {
        console.error("Network Error:", error.networkError);
        message.error({
          content: `Network Error: ${
            error.networkError.message || "Server unavailable"
          }`,
          key: "feesLoad",
          duration: 5,
        });
      }

      if (error.graphQLErrors && error.graphQLErrors.length > 0) {
        error.graphQLErrors.forEach(({ message, locations, path }) => {
          console.error(
            `GraphQL error: Message: ${message}, Location: ${locations}, Path: ${path}`
          );
        });
        message.error({
          content: `GraphQL Error: ${error.graphQLErrors[0].message}`,
          key: "feesLoad",
          duration: 5,
        });
      }
    },
  });

  const [
    generateGlobalPRT,
    { loading: mutationLoading, error: mutationError },
  ] = useMutation(GENERATE_GLOBAL_PRT);

  const [data, setData] = useState<DataType[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [tokenRes, setTokenRes] = useState<any>(null);

  useEffect(() => {
    console.log("Student file received in SelectItemTable:", studentFile);
  }, [studentFile]);

  useEffect(() => {
    if (loading) {
      message.loading({ content: "Loading fees...", key: "feesLoad" });
    } else {
      message.destroy("feesLoad");
    }

    if (error) {
      console.error("Full error object:", error);
    }

    if (queryData?.current_fees) {
      const mappedData: DataType[] = queryData.current_fees.map((fee: any) => ({
        key: fee.id.toString(),
        item: fee.fee_item?.item_name || "Unknown Item",
        unitCost: fee.amount,
        quantity: 1,
        selected: false,
      }));
      setData(mappedData);
      message.success({
        content: "Fees loaded successfully!",
        key: "feesLoad",
        duration: 2,
      });
      console.log("Fetched current_fees:", mappedData);
    }
  }, [loading, error, queryData]);

  const handleQuantityChange = useCallback(
    (value: number | null, key: string) => {
      setData((prevData) =>
        prevData.map((item) =>
          item.key === key ? { ...item, quantity: value || 0 } : item
        )
      );
    },
    []
  );

  const handleCheckboxChange = useCallback((key: string) => {
    setData((prevData) =>
      prevData.map((item) =>
        item.key === key ? { ...item, selected: !item.selected } : item
      )
    );
  }, []);

  const columns: ColumnsType<DataType> = useMemo(
    () => [
      {
        title: "",
        key: "checkbox",
        width: 50,
        render: (_, record) => (
          <Checkbox
            checked={record.selected}
            onChange={(e) => {
              e.stopPropagation();
              handleCheckboxChange(record.key);
            }}
          />
        ),
      },
      {
        title: "ITEM",
        ellipsis: true,
        dataIndex: "item",
        key: "item",
      },
      {
        title: "UNIT COST (UGX)",
        ellipsis: true,
        dataIndex: "unitCost",
        key: "unitCost",
        render: (value) => value.toLocaleString(),
      },
      {
        title: "QUANTITY",
        ellipsis: true,
        key: "quantity",
        render: (_, record) => (
          <InputNumber
            className="quantity-input"
            size="small"
            min={0}
            value={record.quantity}
            onChange={(value) => handleQuantityChange(value, record.key)}
          />
        ),
      },
    ],
    [handleCheckboxChange, handleQuantityChange]
  );

  const totalAmountToPay = useMemo(
    () =>
      data
        .filter((item) => item.selected)
        .reduce((total, item) => total + item.unitCost * item.quantity, 0),
    [data]
  );

  const handleGenerateToken = useCallback(async () => {
    if (totalAmountToPay === 0) {
      message.warning(
        "Please select at least one item to generate a payment token."
      );
      return;
    }

    const selectedItems = data
      .filter((item) => item.selected)
      .map((item) => ({
        item_id: item.key,
        item_code: item.key, // Adjust if item_code is available in queryData
        item_name: item.item,
        amount: (item.unitCost * item.quantity).toString(),
      }));

    const payload = {
      student_id: studentFile.student_no || "",
      phone_no: studentFile.telephone,
      full_name: `${studentFile.biodata.surname} ${studentFile.biodata.other_names}`,
      email: studentFile.email,
      items: JSON.stringify(selectedItems),
      total_amount: totalAmountToPay,
    };

    try {
      console.log("Sending mutation with payload:", payload);
      const { data } = await generateGlobalPRT({
        variables: { payload },
      });
      if (data?.generateGlobalPRT) {
        setTokenRes(data.generateGlobalPRT);
        setModalVisible(true);
        message.success("Payment token generated successfully!");
      } else {
        throw new Error("No data returned from mutation");
      }
    } catch (err: any) {
      console.error("Mutation error:", err);
      message.error(
        `Failed to generate payment token: ${err.message || "Unknown error"}`
      );
    }
  }, [totalAmountToPay, studentFile, generateGlobalPRT, data]);

  const handleCloseModal = useCallback(() => {
    setModalVisible(false);
    setTokenRes(null);
  }, []);

  if (loading || mutationLoading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          // minHeight: "100vh",
        }}
      >
        <Spin tip="Processing..." />
      </div>
    );
  }

  if (error && data.length === 0)
    return <p>Error loading fees: {error.message}</p>;

  return (
    <div className="container mx-auto p-4">
      <Card className="mb-4" size="small">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Text strong>Name: </Text>
            <Text>{`${studentFile.biodata.surname} ${studentFile.biodata.other_names}`}</Text>
          </div>
          <div>
            <Text strong>Student ID: </Text>
            <Text>{studentFile.student_no}</Text>
          </div>
          <div>
            <Text strong>Email: </Text>
            <Text>{studentFile.email}</Text>
          </div>
        </div>
      </Card>

      <Table
        pagination={false}
        className="custom-table"
        size="small"
        columns={columns}
        dataSource={data}
        rowClassName={(record) => (record.selected ? "bg-blue-100" : "")}
        onRow={(record) => ({
          onClick: (event) => {
            const target = event.target as HTMLElement;
            if (
              !target.closest(".ant-input-number") &&
              !target.closest(".ant-checkbox-wrapper")
            ) {
              handleCheckboxChange(record.key);
            }
          },
        })}
        summary={() => (
          <Table.Summary.Row>
            <Table.Summary.Cell index={0} colSpan={3}>
              <div className="text-right">
                <strong>TOTAL AMOUNT TO PAY</strong>
              </div>
            </Table.Summary.Cell>
            <Table.Summary.Cell index={3}>
              <strong>{totalAmountToPay.toLocaleString()} UGX</strong>
            </Table.Summary.Cell>
          </Table.Summary.Row>
        )}
      />
      <div className="mt-4 text-right">
        <Button
          type="primary"
          onClick={handleGenerateToken}
          disabled={totalAmountToPay === 0 || mutationLoading}
        >
          GENERATE TOKEN ({totalAmountToPay.toLocaleString()} UGX)
        </Button>
      </div>
      <PaymentSlip
        visible={modalVisible}
        onClose={handleCloseModal}
        studentFile={studentFile}
        tokenRes={tokenRes}
      />
    </div>
  );
};

export default PartialPayment;
