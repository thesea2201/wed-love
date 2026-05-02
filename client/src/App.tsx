import { Routes, Route, Navigate } from 'react-router-dom';
import InvitationView from './pages/InvitationView';
import AdminDashboard from './pages/AdminDashboard';
import AuthPage from './pages/AuthPage';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem('token');
  if (!token) return <Navigate to="/" replace />;
  return <>{children}</>;
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<AuthPage />} />
      <Route path="/dashboard" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
      <Route path="/invitation/:slug" element={<InvitationView />} />
    </Routes>
  );
}

export default App;
