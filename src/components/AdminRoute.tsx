import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../store';

export default function AdminRoute() {
  const { user, loading } = useSelector((state: RootState) => state.auth);

  if (loading) return null;

  if (!user || user.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
