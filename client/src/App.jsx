import { Routes, Route, Navigate } from "react-router-dom";
import Landing from "./pages/Landing.jsx";
import StudentLogin from "./pages/student/StudentLogin.jsx";
import StudentRegister from "./pages/student/StudentRegister.jsx";
import AdminLogin from "./pages/admin/AdminLogin.jsx";
import AdminRegister from "./pages/admin/AdminRegister.jsx";
import ForgotPassword from "./pages/ForgotPassword.jsx";
import ResetPassword from "./pages/ResetPassword.jsx";
import StudentDashboard from "./pages/student/StudentDashboard.jsx";
import StudentCompanies from "./pages/student/StudentCompanies.jsx";
import StudentDrives from "./pages/student/StudentDrives.jsx";
import StudentApplications from "./pages/student/StudentApplications.jsx";
import StudentResume from "./pages/student/StudentResume.jsx";
import StudentProfile from "./pages/student/StudentProfile.jsx";
import StudentNotifications from "./pages/student/StudentNotifications.jsx";
import AdminDashboard from "./pages/admin/AdminDashboard.jsx";
import AdminStudents from "./pages/admin/AdminStudents.jsx";
import AdminCompanies from "./pages/admin/AdminCompanies.jsx";
import AdminDrives from "./pages/admin/AdminDrives.jsx";
import AdminApplications from "./pages/admin/AdminApplications.jsx";
import AdminAnalytics from "./pages/admin/AdminAnalytics.jsx";
import AdminNotifications from "./pages/admin/AdminNotifications.jsx";
import AdminReports from "./pages/admin/AdminReports.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/student/login" element={<StudentLogin />} />
      <Route path="/student/register" element={<StudentRegister />} />
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin/register" element={<AdminRegister />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      <Route path="/student/dashboard" element={<StudentDashboard />} />
      <Route path="/student/companies" element={<StudentCompanies />} />
      <Route path="/student/drives" element={<StudentDrives />} />
      <Route path="/student/applications" element={<StudentApplications />} />
      <Route path="/student/resume" element={<StudentResume />} />
      <Route path="/student/profile" element={<StudentProfile />} />
      <Route path="/student/notifications" element={<StudentNotifications />} />

      <Route path="/admin/dashboard" element={<AdminDashboard />} />
      <Route path="/admin/students" element={<AdminStudents />} />
      <Route path="/admin/companies" element={<AdminCompanies />} />
      <Route path="/admin/drives" element={<AdminDrives />} />
      <Route path="/admin/applications" element={<AdminApplications />} />
      <Route path="/admin/analytics" element={<AdminAnalytics />} />
      <Route path="/admin/notifications" element={<AdminNotifications />} />
      <Route path="/admin/reports" element={<AdminReports />} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
