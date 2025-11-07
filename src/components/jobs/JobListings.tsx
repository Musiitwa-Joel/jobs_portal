import { useState, useMemo } from "react";
import {
  Input,
  Select,
  Row,
  Col,
  Typography,
  Space,
  Card,
  Empty,
  Badge,
} from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { motion } from "framer-motion";
import { Job, JobFilters } from "../../../types/job";
import { JobCard } from "./JobCard";
import {
  mockJobs,
  departments,
  locations,
  employmentTypes,
} from "../../data/mockJobs";

const { Title, Text } = Typography;
const { Option } = Select;

interface JobListingsProps {
  onSelectJob: (jobId: string) => void;
}

export function JobListings({ onSelectJob }: JobListingsProps) {
  const [filters, setFilters] = useState<JobFilters>({
    department: undefined,
    location: undefined,
    employmentType: undefined,
    search: "",
  });

  const filteredJobs = useMemo(() => {
    return mockJobs.filter((job) => {
      const matchesDepartment =
        !filters.department || job.department === filters.department;
      const matchesLocation =
        !filters.location || job.location === filters.location;
      const matchesEmploymentType =
        !filters.employmentType ||
        job.employmentType === filters.employmentType;
      const matchesSearch =
        !filters.search ||
        job.title.toLowerCase().includes(filters.search.toLowerCase()) ||
        job.description.toLowerCase().includes(filters.search.toLowerCase()) ||
        job.department.toLowerCase().includes(filters.search.toLowerCase());

      return (
        matchesDepartment &&
        matchesLocation &&
        matchesEmploymentType &&
        matchesSearch
      );
    });
  }, [filters]);

  const handleFilterChange = (key: keyof JobFilters, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      department: undefined,
      location: undefined,
      employmentType: undefined,
      search: "",
    });
  };

  const activeFilterCount = Object.values(filters).filter(
    (value) => value !== undefined && value !== "",
  ).length;

  return (
    <div style={{ maxWidth: 1400, margin: "0 auto", padding: "40px 24px" }}>
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{ textAlign: "center", marginBottom: 32, paddingTop: 24 }}
      >
        <Title
          level={1}
          style={{
            marginBottom: 12,
            fontSize: 28,
            fontWeight: 600,
            color: "#000000",
            letterSpacing: "-0.5px",
          }}
        >
          Careers at Nkumba University
        </Title>
        <Text
          style={{
            fontSize: 14,
            color: "#666666",
            display: "block",
            maxWidth: 600,
            margin: "0 auto",
            lineHeight: 1.5,
          }}
        >
          Join our community of educators, researchers, and professionals
          dedicated to academic excellence and innovation.
        </Text>
      </motion.div>

      {/* Filters Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card
          style={{
            marginBottom: 32,
            borderRadius: 0,
            boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
            border: "1px solid #e8e8e8",
          }}
        >
          <Space direction="vertical" size="middle" style={{ width: "100%" }}>
            {/* Search Bar */}
            <Input
              size="large"
              placeholder="Search by job title, keyword, or department..."
              prefix={
                <SearchOutlined style={{ color: "#999999", fontSize: 16 }} />
              }
              value={filters.search}
              onChange={(e) => handleFilterChange("search", e.target.value)}
              style={{
                borderRadius: 2,
                height: 36,
                fontSize: 13,
                border: "1px solid #d9d9d9",
              }}
              allowClear
            />

            {/* Filter Dropdowns */}
            <Row gutter={[12, 12]}>
              <Col xs={24} sm={8} md={6}>
                <Text
                  strong
                  style={{
                    display: "block",
                    marginBottom: 6,
                    fontSize: 12,
                    color: "#000000",
                  }}
                >
                  Department
                </Text>
                <Select
                  style={{ width: "100%" }}
                  placeholder="All Departments"
                  value={filters.department}
                  onChange={(value) => handleFilterChange("department", value)}
                  allowClear
                >
                  {departments.map((dept) => (
                    <Option key={dept} value={dept}>
                      {dept}
                    </Option>
                  ))}
                </Select>
              </Col>

              <Col xs={24} sm={8} md={6}>
                <Text
                  strong
                  style={{
                    display: "block",
                    marginBottom: 6,
                    fontSize: 12,
                    color: "#000000",
                  }}
                >
                  Location
                </Text>
                <Select
                  style={{ width: "100%" }}
                  placeholder="All Locations"
                  value={filters.location}
                  onChange={(value) => handleFilterChange("location", value)}
                  allowClear
                >
                  {locations.map((loc) => (
                    <Option key={loc} value={loc}>
                      {loc}
                    </Option>
                  ))}
                </Select>
              </Col>

              <Col xs={24} sm={8} md={6}>
                <Text
                  strong
                  style={{
                    display: "block",
                    marginBottom: 6,
                    fontSize: 12,
                    color: "#000000",
                  }}
                >
                  Employment Type
                </Text>
                <Select
                  style={{ width: "100%" }}
                  placeholder="All Types"
                  value={filters.employmentType}
                  onChange={(value) =>
                    handleFilterChange("employmentType", value)
                  }
                  allowClear
                >
                  {employmentTypes.map((type) => (
                    <Option key={type} value={type}>
                      {type}
                    </Option>
                  ))}
                </Select>
              </Col>

              {activeFilterCount > 0 && (
                <Col xs={24} sm={24} md={6}>
                  <div style={{ marginTop: 22 }}>
                    <a
                      onClick={clearFilters}
                      style={{ color: "#C74634", cursor: "pointer" }}
                    >
                      Clear all filters ({activeFilterCount})
                    </a>
                  </div>
                </Col>
              )}
            </Row>
          </Space>
        </Card>
      </motion.div>

      {/* Results Header */}
      <div style={{ marginBottom: 20 }}>
        <Title
          level={3}
          style={{
            marginBottom: 4,
            fontSize: 20,
            fontWeight: 600,
            color: "#000000",
          }}
        >
          {filteredJobs.length}{" "}
          {filteredJobs.length === 1 ? "Position" : "Positions"} Available
        </Title>
        <Text style={{ fontSize: 13, color: "#666666" }}>
          Explore career opportunities that match your skills and aspirations
        </Text>
      </div>

      {/* Job Cards Grid */}
      {filteredJobs.length > 0 ? (
        <Row gutter={[20, 20]}>
          {filteredJobs.map((job, index) => (
            <Col xs={24} sm={24} md={12} lg={8} key={job.id}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <JobCard job={job} onViewDetails={onSelectJob} />
              </motion.div>
            </Col>
          ))}
        </Row>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Card
            style={{
              textAlign: "center",
              padding: "60px 20px",
              borderRadius: 0,
              border: "1px solid #e8e8e8",
            }}
          >
            <Empty
              description={
                <Space direction="vertical" size="small">
                  <Text strong style={{ fontSize: 15, color: "#000000" }}>
                    No positions found
                  </Text>
                  <Text style={{ fontSize: 13, color: "#666666" }}>
                    Try adjusting your filters or search criteria
                  </Text>
                </Space>
              }
            />
          </Card>
        </motion.div>
      )}
    </div>
  );
}
