import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdmin } from '@/hooks/useAdmin';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

const ProtectedRoute = ({ children, requireAdmin = false }: ProtectedRouteProps) => {
  const navigate = useNavigate();
  const { user, isAdmin, isLoading } = useAdmin();

  // Obfuscated admin path
  const ADMIN_LOGIN_PATH = "/774a4656a61940c59a0f5df32b7784d6";

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        navigate(ADMIN_LOGIN_PATH);
      } else if (requireAdmin && !isAdmin) {
        navigate(ADMIN_LOGIN_PATH);
      }
    }
  }, [isLoading, user, isAdmin, requireAdmin, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-zinc-900 to-zinc-800">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
      </div>
    );
  }

  if (!user || (requireAdmin && !isAdmin)) {
    return null;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
