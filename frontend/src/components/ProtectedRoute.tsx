import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import LoadingSpinner from "./LoadingSpinner";

export function ProtectedRoute() {
  const { isAuthenticated, isLoading, isAdmin } = useAuthStore();
  if (isLoading) return <LoadingSpinner label="Checking your session..." />;
  if (!isAuthenticated || isAdmin) return <Navigate to="/login" replace />;
  return <Outlet />;
}

export function AdminProtectedRoute({ allowedRoles }: { allowedRoles?: string[] }) {
  const { isAuthenticated, isLoading, isAdmin, account } = useAuthStore();
  if (isLoading) return <LoadingSpinner label="Checking your session..." />;
  if (!isAuthenticated || !isAdmin) return <Navigate to="/admin/login" replace />;
  if (allowedRoles && account?.role && !allowedRoles.includes(account.role)) {
    return <Navigate to="/admin" replace />;
  }
  return <Outlet />;
}
