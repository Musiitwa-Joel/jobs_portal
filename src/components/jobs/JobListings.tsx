import { useState, useMemo, useEffect } from "react";
import {
  Input,
  Select,
  Row,
  Col,
  Typography,
  Space,
  Card,
  Empty,
  Button,
  Spin,
  Alert,
} from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { motion } from "framer-motion";
import { useQuery } from "@apollo/client";
import {
  JobPosting,
  JobPostingFilters,
  JobPostingConnection,
} from "../../../types/job";
import { JobCard } from "./JobCard";
import { JOB_POSTINGS_QUERY } from "../../gql/queries";

const { Title, Text } = Typography;
const { Option } = Select;

interface JobListingsProps {
  onSelectJob: (jobId: string) => void;
}

const PAGE_LIMIT = 100;

type FiltersState = JobPostingFilters & {
  search: string;
  employmentType?: string;
};

export function JobListings({ onSelectJob }: JobListingsProps) {
  const [filters, setFilters] = useState<FiltersState>({
    department: undefined,
    workLocation: undefined,
    employmentType: undefined,
    search: "",
  });
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const handle = window.setTimeout(() => {
      setDebouncedSearch(filters.search.trim());
    }, 400);
    return () => window.clearTimeout(handle);
  }, [filters.search]);

  const serverFilter = useMemo(() => {
    const filter: Record<string, unknown> = {};
    if (debouncedSearch) {
      filter.search = debouncedSearch;
    }
    if (filters.department) {
      filter.department = filters.department;
    }
    filter.status = "ACTIVE";
    return Object.keys(filter).length ? filter : undefined;
  }, [debouncedSearch, filters.department]);

  const { data, loading, error, refetch } = useQuery<{
    jobPostings: JobPostingConnection;
  }>(JOB_POSTINGS_QUERY, {
    variables: {
      limit: PAGE_LIMIT,
      offset: 0,
      filter: serverFilter,
    },
    fetchPolicy: "cache-and-network",
    notifyOnNetworkStatusChange: true,
  });

  const postings = data?.jobPostings?.data ?? [];

  const filteredJobs: JobPosting[] = useMemo(() => {
    return postings.filter((job) => {
      const matchesVisibility =
        job.visibility === "EXTERNAL" || job.visibility === "BOTH";
      const matchesLocation =
        !filters.workLocation || job.workLocation === filters.workLocation;
      const matchesEmploymentType =
        !filters.employmentType ||
        job.employmentType === filters.employmentType;
      const matchesSearch = debouncedSearch
        ? [job.jobTitle, job.jobSummary, job.department, job.jobCode]
            .filter(Boolean)
            .some((value) =>
              String(value)
                .toLowerCase()
                .includes(debouncedSearch.toLowerCase())
            )
        : true;
      return (
        matchesVisibility &&
        matchesLocation &&
        matchesEmploymentType &&
        matchesSearch
      );
    });
  }, [postings, filters.workLocation, filters.employmentType, debouncedSearch]);

  const handleFilterChange = <K extends keyof FiltersState>(
    key: K,
    value: FiltersState[K] | null
  ) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value === null || value === "" ? undefined : value,
    }));
  };

  const clearFilters = () => {
    setFilters({
      department: undefined,
      workLocation: undefined,
      employmentType: undefined,
      search: "",
    });
  };

  const activeFilterCount = Object.entries(filters).filter(([key, value]) => {
    if (key === "search") {
      return Boolean(value);
    }
    return value !== undefined && value !== "";
  }).length;

  const departmentOptions = useMemo(() => {
    const set = new Set<string>();
    postings.forEach((job) => {
      if (job.department) {
        set.add(job.department);
      }
    });
    return Array.from(set).sort();
  }, [postings]);

  const locationOptions = useMemo(() => {
    const set = new Set<string>();
    postings.forEach((job) => {
      if (job.workLocation) {
        set.add(job.workLocation);
      }
    });
    if (filters.workLocation && !set.has(filters.workLocation)) {
      set.add(filters.workLocation);
    }
    return Array.from(set).sort();
  }, [postings, filters.workLocation]);

  const employmentTypeOptions = useMemo(() => {
    const set = new Set<string>();
    postings.forEach((job) => {
      if (job.employmentType) {
        set.add(job.employmentType);
      }
    });
    if (filters.employmentType && !set.has(filters.employmentType)) {
      set.add(filters.employmentType);
    }
    return Array.from(set).sort();
  }, [postings, filters.employmentType]);

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
            <Row gutter={[12, 12]} align="bottom">
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
                  {departmentOptions.map((dept) => (
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
                  value={filters.workLocation}
                  onChange={(value) =>
                    handleFilterChange("workLocation", value)
                  }
                  allowClear
                >
                  {locationOptions.map((loc) => (
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
                  {employmentTypeOptions.map((type) => (
                    <Option key={type} value={type}>
                      {type}
                    </Option>
                  ))}
                </Select>
              </Col>
              <Col xs={24} sm={8} md={6}>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-start",
                    gap: 12,
                    height: "100%",
                    justifyContent:
                      activeFilterCount > 0 ? "space-between" : "flex-end",
                  }}
                >
                  {activeFilterCount > 0 && (
                    <a
                      onClick={clearFilters}
                      style={{ color: "#C74634", cursor: "pointer" }}
                    >
                      Clear all filters ({activeFilterCount})
                    </a>
                  )}
                  <Button onClick={() => refetch()} disabled={loading} block>
                    Refresh Listings
                  </Button>
                </div>
              </Col>
            </Row>
          </Space>
        </Card>
      </motion.div>

      {error && (
        <Alert
          type="error"
          showIcon
          message="Unable to load job postings"
          description={error.message}
          style={{ marginBottom: 24 }}
        />
      )}

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
      {loading ? (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            padding: "60px 0",
          }}
        >
          <Spin size="large" />
        </div>
      ) : filteredJobs.length > 0 ? (
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
