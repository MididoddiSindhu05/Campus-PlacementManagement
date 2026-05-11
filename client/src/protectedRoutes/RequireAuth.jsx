import { Navigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import Spinner from "../components/Spinner.jsx";

export default function RequireAuth({ children, roles }) {
  const { token, user, loading } = useSelector((s) => s.auth);
  const loc = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (!token || !user) {
    const to = roles?.includes("student") ? "/student/login" : "/admin/login";
    return <Navigate to={to} replace state={{ from: loc.pathname }} />;
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
}
