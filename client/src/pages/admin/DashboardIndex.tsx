import { Navigate } from 'react-router-dom';
import { useInvitationList } from '../../hooks/use-invitation';

// Bare /dashboard: redirect to the first invitation's editor/content tab.
// While the list is loading, show a spinner. If the user has no invitations,
// render the empty state inline rather than bouncing through a non-existent
// /dashboard/__empty__ route.
export default function DashboardIndex() {
  const { data: invitations = [], isLoading } = useInvitationList();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-dark" />
      </div>
    );
  }

  if (invitations.length > 0) {
    return <Navigate to={`/dashboard/${invitations[0].id}/editor/content`} replace />;
  }

  // Empty state — same UI as AdminDashboard would render. We don't redirect
  // to a sentinel path; just render the empty header + message.
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-semibold">WedLove</h1>
        </div>
      </header>
      <div className="max-w-2xl mx-auto py-16 px-4 text-center">
        <h2 className="text-2xl font-semibold mb-2">Bạn chưa có thiệp nào</h2>
        <p className="text-gray-600">Tạo thiệp cưới đầu tiên của bạn để bắt đầu.</p>
      </div>
    </div>
  );
}
