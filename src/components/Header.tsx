import { Layout, Button, Drawer } from "antd";
import { MenuOutlined } from "@ant-design/icons";
import { useState } from "react";
import { motion } from "framer-motion";
import LightModeLogo from "./nkumba-university.svg";
import DarkModeLogo from "./darkmode.png";

const { Header: AntHeader } = Layout;

interface HeaderProps {
  isDarkMode: boolean;
  onThemeChange: (checked: boolean) => void;
  currentView: "listings" | "detail" | "apply" | "success" | "tracking";
  onNavigate: (view: "listings" | "tracking") => void;
}

export function Header({
  isDarkMode,
  onThemeChange,
  currentView,
  onNavigate,
}: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      <AntHeader
        style={{
          background: "#ffffff",
          borderBottom: "1px solid #e8e8e8",
          height: 56,
          lineHeight: "56px",
          padding: "0 32px",
          position: "sticky",
          top: 0,
          zIndex: 1000,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {/* Logo Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          style={{
            display: "flex",
            alignItems: "center",
            height: "100%",
          }}
        >
          <a
            href="https://nkumbauniversity.ac.ug"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "flex",
              alignItems: "center",
              height: "100%",
            }}
          >
            <img
              src={isDarkMode ? DarkModeLogo : LightModeLogo}
              alt="Nkumba University"
              style={{
                height: 36,
                width: "auto",
                transition: "opacity 0.3s",
              }}
              onMouseOver={(e) => (e.currentTarget.style.opacity = "0.8")}
              onMouseOut={(e) => (e.currentTarget.style.opacity = "1")}
            />
          </a>
        </motion.div>

        {/* Desktop Navigation */}
        <nav
          style={{
            display: "flex",
            alignItems: "center",
            gap: 4,
          }}
          className="hidden md:flex"
        >
          <Button
            type="text"
            onClick={() => onNavigate("listings")}
            style={{
              height: 36,
              fontSize: 13,
              fontWeight: 500,
              color:
                currentView === "listings" ||
                currentView === "detail" ||
                currentView === "apply"
                  ? "#C74634"
                  : "#000000",
              borderBottom:
                currentView === "listings" ||
                currentView === "detail" ||
                currentView === "apply"
                  ? "2px solid #C74634"
                  : "2px solid transparent",
              borderRadius: 0,
              padding: "0 16px",
            }}
          >
            Job Openings
          </Button>
          <Button
            type="text"
            onClick={() => onNavigate("tracking")}
            style={{
              height: 36,
              fontSize: 13,
              fontWeight: 500,
              color: currentView === "tracking" ? "#C74634" : "#000000",
              borderBottom:
                currentView === "tracking"
                  ? "2px solid #C74634"
                  : "2px solid transparent",
              borderRadius: 0,
              padding: "0 16px",
            }}
          >
            Track Application
          </Button>
        </nav>

        {/* Mobile Menu Button */}
        <Button
          type="text"
          icon={<MenuOutlined style={{ fontSize: 16 }} />}
          onClick={() => setMobileMenuOpen(true)}
          style={{
            height: 36,
            width: 36,
            display: "none",
          }}
          className="flex md:hidden"
        />
      </AntHeader>

      {/* Mobile Drawer */}
      <Drawer
        title="Menu"
        placement="right"
        onClose={() => setMobileMenuOpen(false)}
        open={mobileMenuOpen}
        width={240}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <Button
            type={
              currentView === "listings" ||
              currentView === "detail" ||
              currentView === "apply"
                ? "primary"
                : "default"
            }
            block
            onClick={() => {
              onNavigate("listings");
              setMobileMenuOpen(false);
            }}
          >
            Job Openings
          </Button>
          <Button
            type={currentView === "tracking" ? "primary" : "default"}
            block
            onClick={() => {
              onNavigate("tracking");
              setMobileMenuOpen(false);
            }}
          >
            Track Application
          </Button>
        </div>
      </Drawer>

      <style>
        {`
          @media (max-width: 768px) {
            .ant-layout-header {
              padding: 0 20px !important;
            }
            .hidden {
              display: none !important;
            }
            .flex {
              display: flex !important;
            }
          }
          @media (min-width: 769px) {
            .md\\:flex {
              display: flex !important;
            }
            .md\\:hidden {
              display: none !important;
            }
          }
        `}
      </style>
    </>
  );
}
