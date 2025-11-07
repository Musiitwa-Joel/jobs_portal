import { useState, useEffect } from "react";
import { ConfigProvider, Layout, theme } from "antd";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import themeConfig from "./theme/themeConfig";
import { JobListings } from "./components/jobs/JobListings";
import { JobDetail } from "./components/jobs/JobDetail";
import { ApplicationForm } from "./components/jobs/ApplicationForm";
import { ApplicationSuccess } from "./components/jobs/ApplicationSuccess";
import { ApplicationTracking } from "./components/jobs/ApplicationTracking";

type ViewType = "listings" | "detail" | "apply" | "success" | "tracking";

function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [currentView, setCurrentView] = useState<ViewType>("listings");
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [referenceNumber, setReferenceNumber] = useState<string>("");

  const { defaultAlgorithm, darkAlgorithm, compactAlgorithm } = theme;

  // Scroll to top whenever the view changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentView]);

  const handleSelectJob = (jobId: string) => {
    setSelectedJobId(jobId);
    setCurrentView("detail");
  };

  const handleApplyForJob = (jobId: string) => {
    setSelectedJobId(jobId);
    setCurrentView("apply");
  };

  const handleBackToListings = () => {
    setCurrentView("listings");
    setSelectedJobId(null);
  };

  const handleBackToDetail = () => {
    setCurrentView("detail");
  };

  const handleApplicationSuccess = (refNumber: string) => {
    setReferenceNumber(refNumber);
    setCurrentView("success");
  };

  const handleNavigate = (view: "listings" | "tracking") => {
    setCurrentView(view);
    if (view === "listings") {
      setSelectedJobId(null);
    }
  };

  const renderContent = () => {
    switch (currentView) {
      case "listings":
        return <JobListings onSelectJob={handleSelectJob} />;

      case "detail":
        return selectedJobId ? (
          <JobDetail
            jobId={selectedJobId}
            onBack={handleBackToListings}
            onApply={handleApplyForJob}
          />
        ) : (
          <JobListings onSelectJob={handleSelectJob} />
        );

      case "apply":
        return selectedJobId ? (
          <ApplicationForm
            jobId={selectedJobId}
            onBack={handleBackToDetail}
            onSuccess={handleApplicationSuccess}
          />
        ) : (
          <JobListings onSelectJob={handleSelectJob} />
        );

      case "success":
        return (
          <ApplicationSuccess
            referenceNumber={referenceNumber}
            onBackToHome={handleBackToListings}
          />
        );

      case "tracking":
        return <ApplicationTracking />;

      default:
        return <JobListings onSelectJob={handleSelectJob} />;
    }
  };

  return (
    <ConfigProvider
      theme={{
        ...themeConfig,
        algorithm: isDarkMode
          ? [darkAlgorithm, compactAlgorithm]
          : [defaultAlgorithm, compactAlgorithm],
      }}
    >
      <Layout className="min-h-screen transition-colors duration-300">
        <Header
          isDarkMode={isDarkMode}
          onThemeChange={setIsDarkMode}
          currentView={currentView}
          onNavigate={handleNavigate}
        />
        <Layout.Content
          style={{
            minHeight: "calc(100vh - 64px)",
          }}
        >
          {renderContent()}
        </Layout.Content>
        <Footer isDarkMode={isDarkMode} />
      </Layout>
    </ConfigProvider>
  );
}

export default App;
