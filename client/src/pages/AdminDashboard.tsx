import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useInvitationList, useInvitationAdmin, useUpdateInvitation, useUpdateSections, usePublishInvitation } from '../hooks/use-invitation';
import { useAnalytics } from '../hooks/use-analytics';
import GuestList from '../components/GuestList';
import InvitationEditor from '../components/InvitationEditor';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'editor' | 'guests' | 'analytics'>('editor');
  const [selectedInvitationId, setSelectedInvitationId] = useState<string>('');
  const navigate = useNavigate();

  const { data: invitations = [], isLoading } = useInvitationList();
  const { data: analyticsData } = useAnalytics(selectedInvitationId);

  // Auto-select first invitation
  if (!selectedInvitationId && invitations.length > 0) {
    setSelectedInvitationId(invitations[0].id);
  }

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

  const selectedInvitation = invitations.find((i) => i.id === selectedInvitationId);

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

      <div className="max-w-7xl mx-auto px-4 py-6">
        {invitations.length > 0 && (
          <div className="mb-4 flex flex-col sm:flex-row gap-3 sm:items-center">
            <select
              value={selectedInvitationId}
              onChange={(e) => setSelectedInvitationId(e.target.value)}
              className="px-3 py-2 border rounded-lg bg-white w-full sm:w-auto"
            >
              {invitations.map((inv) => (
                <option key={inv.id} value={inv.id}>
                  {inv.title} {inv.isPublished ? '✅' : '📝'}
                </option>
              ))}
            </select>
            {selectedInvitation && (
              <a
                href={`/invitation/${selectedInvitation.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary hover:underline sm:ml-3 flex items-center gap-1"
              >
                Xem thiệp →
              </a>
            )}
          </div>
        )}

        <div className="flex gap-2 mb-6 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
          {([
            { key: 'editor', label: 'Trình soạn', icon: '✏️' },
            { key: 'guests', label: 'Khách mời', icon: '👥' },
            { key: 'analytics', label: 'Thống kê', icon: '📊' },
          ] as const).map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 rounded-lg whitespace-nowrap flex items-center gap-2 ${
                activeTab === tab.key
                  ? 'bg-dark text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              <span className="sm:hidden">{tab.icon}</span>
              <span className="hidden sm:inline">{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {activeTab === 'editor' && selectedInvitationId && (
          <InvitationEditor invitationId={selectedInvitationId} />
        )}
        {activeTab === 'guests' && selectedInvitationId && (
          <GuestList invitationId={selectedInvitationId} />
        )}
        {activeTab === 'analytics' && (
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold mb-4">Thống kê</h3>
            {analyticsData ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-primary/10 rounded-lg p-4 text-center">
                  <div className="text-3xl font-bold text-primary">{analyticsData.views}</div>
                  <div className="text-sm text-gray-600">Lượt xem</div>
                </div>
                <div className="bg-green-100 rounded-lg p-4 text-center">
                  <div className="text-3xl font-bold text-green-600">{analyticsData.attending}</div>
                  <div className="text-sm text-gray-600">Sẽ tham dự</div>
                </div>
                <div className="bg-blue-100 rounded-lg p-4 text-center">
                  <div className="text-3xl font-bold text-blue-600">{analyticsData.totalGuests}</div>
                  <div className="text-sm text-gray-600">Tổng khách mời</div>
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-400 py-8">Đang tải thống kê...</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
