import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import HomePage from "./pages/HomePage";
import PropertyPage from "./pages/PropertyPage";
import AboutPage from "./pages/AboutPage";
import IzhsPage from "./pages/IzhsPage";
import IndustrialPage from "./pages/IndustrialPage";
import InvestPage from "./pages/InvestPage";
import ProjectsPage from "./pages/ProjectsPage";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import ConsentPage from "./pages/ConsentPage";
import NotFound from "./pages/NotFound";

// Админка
import AdminLayout from "./pages/admin/AdminLayout";
import AdminLogin from "./pages/admin/AdminLogin";
import RequestsPage from "./pages/admin/RequestsPage";
import PlotsPage from "./pages/admin/PlotsPage";
import PrivateRoute from "./admin/PrivateRoute";

export default function App() {
  return (
    <Routes>
      {/* Публичные страницы */}
      <Route
        path="/"
        element={
          <Layout>
            <HomePage />
          </Layout>
        }
      />
      <Route
        path="/property/:id"
        element={
          <Layout>
            <PropertyPage />
          </Layout>
        }
      />
      <Route
        path="/about"
        element={
          <Layout>
            <AboutPage />
          </Layout>
        }
      />
      <Route
        path="/plots/izhs"
        element={
          <Layout>
            <IzhsPage />
          </Layout>
        }
      />
      <Route
        path="/plots/industrial"
        element={
          <Layout>
            <IndustrialPage />
          </Layout>
        }
      />
      <Route
        path="/plots/invest"
        element={
          <Layout>
            <InvestPage />
          </Layout>
        }
      />
      <Route
        path="/projects"
        element={
          <Layout>
            <ProjectsPage />
          </Layout>
        }
      />
      <Route
        path="/privacy"
        element={
          <Layout>
            <PrivacyPolicy />
          </Layout>
        }
      />
      <Route
        path="/consent"
        element={
          <Layout>
            <ConsentPage />
          </Layout>
        }
      />

      <Route
        path="*"
        element={
          <Layout>
            <NotFound />
          </Layout>
        }
      />

      {/* Админ-панель */}
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin" element={<PrivateRoute />}>
        <Route element={<AdminLayout />}>
          <Route index element={<RequestsPage />} />   {/* ← вот эта строка */}
          <Route path="requests" element={<RequestsPage />} />
          <Route path="plots" element={<PlotsPage />} />
        </Route>
      </Route>
    </Routes>
  );
}
