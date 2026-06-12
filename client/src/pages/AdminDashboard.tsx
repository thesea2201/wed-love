import { useNavigate, NavLink, Link, Outlet, useParams } from 'react-router-dom';
import { useInvitationList } from '../hooks/use-invitation';

// Layout route for the admin dashboard. Renders the header, the invitation
// selector, the top-level tab strip, and an <Outlet /> for the child route
// (EditorTab / GuestsTab / AnalyticsTab). The selected invitation comes from
// the :invId URL param so reload, deep links, and back/forward all preserve
// the current view.
export default function AdminDashboard() {
  const navigate = useNavigate();
  const { invId } = useParams<{ invId: string }>();

  const { data: invitations = [], isLoading } = useInvitationList();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-dark" />
      </div>
    );
  }

  // No invitations at all — empty state, not a redirect loop.
  if (invitations.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
            <h1 className="text-xl font-semibold">WedLove</h1>
            <div className="flex items-center gap-4">
              <Link to="/settings" className="text-sm text-gray-600 hover:text-gray-900">
                Cài đặt
              </Link>
              <button onClick={handleLogout} className="text-sm text-gray-600 hover:text-gray-900">
                Đăng xuất
              </button>
            </div>
          </div>
        </header>
        <div className="max-w-2xl mx-auto py-16 px-4 text-center">
          <h2 className="text-2xl font-semibold mb-2">Bạn chưa có thiệp nào</h2>
          <p className="text-gray-600">Tạo thiệp cưới đầu tiên của bạn để bắt đầu.</p>
        </div>
      </div>
    );
  }

  // Resolve the current invitation from the URL. If the URL id doesn't match
  // any invitation (deleted, typo, etc.), don't redirect silently — the user
  // might have a typo or stale link. Show a 404-ish message and a way back.
  const currentInvitation = invitations.find((i) => i.id === invId);
  if (!currentInvitation) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
            <h1 className="text-xl font-semibold">WedLove</h1>
            <button onClick={handleLogout} className="text-sm text-gray-600 hover:text-gray-900">
              Đăng xuất
            </button>
          </div>
        </header>
        <div className="max-w-2xl mx-auto py-16 px-4 text-center">
          <h2 className="text-2xl font-semibold mb-2">Thiệp không tồn tại</h2>
          <p className="text-gray-600 mb-6">
            Thiệp này có thể đã bị xoá hoặc bạn không có quyền truy cập.
          </p>
          <Link
            to={`/dashboard/${invitations[0].id}/editor/content`}
            className="inline-block px-4 py-2 bg-dark text-white rounded-lg text-sm font-medium hover:bg-gray-800"
          >
            Quay lại thiệp đầu tiên
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-semibold">WedLove</h1>
          <div className="flex items-center gap-4">
            <Link to="/settings" className="text-sm text-gray-600 hover:text-gray-900">
              Cài đặt
            </Link>
            <button onClick={handleLogout} className="text-sm text-gray-600 hover:text-gray-900">
              Đăng xuất
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Invitation selector + status + view link */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6 flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <span className="text-sm text-gray-500 whitespace-nowrap">Thiệp:</span>
            <select
              value={currentInvitation.id}
              onChange={(e) => {
                // Switching invitations is itself a URL change. We always
                // land on the editor's content tab so the user sees a known
                // state after switching.
                const next = e.target.value;
                navigate(`/dashboard/${next}/editor/content`);
              }}
              className="flex-1 max-w-md px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {invitations.map((inv) => (
                <option key={inv.id} value={inv.id}>
                  {inv.title || inv.slug}
                </option>
              ))}
            </select>
            <span
              className={`px-2 py-1 rounded text-xs whitespace-nowrap ${
                currentInvitation.isPublished
                  ? 'bg-green-100 text-green-700'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              {currentInvitation.isPublished ? 'Đã xuất bản' : 'Bản nháp'}
            </span>
          </div>
          {currentInvitation.isPublished && (
            <a
              href={`/invitation/${currentInvitation.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-primary hover:underline whitespace-nowrap"
            >
              Xem thiệp →
            </a>
          )}
        </div>

        {/* Top-level tabs — URL-driven so reload preserves the active tab. */}
        <div className="bg-white rounded-xl shadow-sm mb-6">
          <nav className="flex border-b overflow-x-auto scrollbar-hide">
            <TopTab
              to={`/dashboard/${currentInvitation.id}/editor/content`}
              label="Trình chỉnh sửa"
              icon="✏️"
            />
            <TopTab
              to={`/dashboard/${currentInvitation.id}/guests`}
              label="Khách mời"
              icon="👥"
            />
            <TopTab
              to={`/dashboard/${currentInvitation.id}/analytics`}
              label="Analytics"
              icon="📊"
            />
          </nav>
        </div>

        {/* Child route renders here */}
        <Outlet />
      </div>
    </div>
  );
}

function TopTab({
  to,
  label,
  icon,
}: {
  to: string;
  label: string;
  icon: string;
}) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center gap-1 sm:gap-2 px-4 sm:px-6 py-3 text-xs sm:text-sm font-medium transition-colors border-b-2 whitespace-nowrap ${
          isActive
            ? 'border-primary text-primary'
            : 'border-transparent text-gray-500 hover:text-gray-700'
        }`
      }
    >
      <span className="text-base">{icon}</span>
      <span>{label}</span>
    </NavLink>
  );
}
