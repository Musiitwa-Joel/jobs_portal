import { Layout, theme } from "antd";
import { motion } from "framer-motion";
import DarkMode from "./darkmode.png";
import LightMode from "./nkumba-university.svg";
import PayForm from "./contents/PayForm";
import "./Content.css";

const { Content: AntContent } = Layout;
const { useToken } = theme;

interface ContentProps {
  isDarkMode: boolean;
}

export function Content({ isDarkMode }: ContentProps) {
  const { token } = useToken();

  // Debugging statements
  console.log("isDarkMode:", isDarkMode);
  console.log("Selected image:", isDarkMode ? DarkMode : LightMode);

  return (
    <AntContent
      style={{ background: token.colorBgLayout }}
      className="p-8 transition-colors duration-300 content-container"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="motion-container"
      >
        <div className="flex justify-center mb-4">
          <img
            src={isDarkMode ? DarkMode : LightMode}
            alt="Theme Image"
            className="h-20 w-auto"
          />
        </div>

        <div>
          <PayForm />
        </div>
      </motion.div>
    </AntContent>
  );
}
