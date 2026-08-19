import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireOnboarding?: boolean;
}

export default function ProtectedRoute({ children, requireOnboarding = true }: ProtectedRouteProps) {
  const { user, loading, hasProfile, hasSurvey } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a1628]">
        <div className="text-cyan-400 text-xl animate-pulse">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/register" replace />;
  }

  if (requireOnboarding && (!hasProfile || !hasSurvey)) {
    return <Navigate to="/onboarding" replace />;
  }

  return <>{children}</>;
}
