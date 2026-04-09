import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { ConfigProvider } from "./ConfigContext";
import PortfolioPage from "./pages/PortfolioPage";
import AdminPage from "./pages/AdminPage";

export default function App() {
  return (
    <ConfigProvider>
      <BrowserRouter>
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: "#1a1a1a",
              color: "#F5F0EB",
              border: "1px solid rgba(255,255,255,0.1)",
            },
          }}
        />
        <Routes>
          <Route path="/" element={<PortfolioPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="*" element={<PortfolioPage />} />
        </Routes>
      </BrowserRouter>
    </ConfigProvider>
  );
}
