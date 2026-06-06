import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useEffect, ReactNode } from 'react';
import Login from '@/pages/Login';
import MainScene from '@/pages/MainScene';
import { useLibraryStore } from '@/store';

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const location = useLocation();
  const { currentUser, isInitialized, init } = useLibraryStore();

  useEffect(() => {
    if (!isInitialized) {
      init();
    }
  }, [isInitialized, init]);

  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

const PublicRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { currentUser } = useLibraryStore();
  const location = useLocation();

  if (currentUser) {
    const from = (location.state as { from?: { pathname?: string } })?.from?.pathname || '/main/home';
    return <Navigate to={from} replace />;
  }

  return <>{children}</>;
};

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />
      <Route
        path="/main/*"
        element={
          <ProtectedRoute>
            <MainScene />
          </ProtectedRoute>
        }
      />
      <Route
        path="/"
        element={<Navigate to="/login" replace />}
      />
      <Route
        path="*"
        element={<Navigate to="/login" replace />}
      />
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <AppRoutes />
    </Router>
  );
};

export default App;
