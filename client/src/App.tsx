import { Routes, Route, Navigate } from 'react-router-dom';
import InvitationView from './pages/InvitationView';
import AdminDashboard from './pages/AdminDashboard';
import AuthPage from './pages/AuthPage';
import LandingPage from './pages/LandingPage';
import DemoView from './pages/DemoView';
import SettingsPage from './pages/SettingsPage';
import DashboardIndex from './pages/admin/DashboardIndex';
import EditorTab from './pages/admin/EditorTab';
import GuestsTab from './pages/admin/GuestsTab';
import AnalyticsTab from './pages/admin/AnalyticsTab';
import WishesModerationPage from './pages/admin/WishesModerationPage';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem('token');
  if (!token) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<AuthPage />} />
      <Route
        path="/dashboard"
        element={<ProtectedRoute><DashboardIndex /></ProtectedRoute>}
      />
      <Route
        path="/dashboard/:invId"
        element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>}
      >
        <Route path="editor/:editorTab" element={<EditorTab />} />
        <Route path="guests" element={<GuestsTab />} />
        <Route path="analytics" element={<AnalyticsTab />} />
      </Route>
      <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
      <Route
        path="/dashboard/:invId/wishes"
        element={<ProtectedRoute><WishesModerationPage /></ProtectedRoute>}
      />
      <Route path="/invitation/:slug" element={<InvitationView />} />
      <Route path="/demo/:templateId" element={<DemoView />} />
    </Routes>
  );
}

export default App;
