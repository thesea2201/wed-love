import { useState, useEffect } from 'react';
import api from '../utils/api';
import ImportGuestsModal from './guest-import/ImportGuestsModal';

interface Guest {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  rsvpStatus: string;
  rsvpAttendees: number;
  customMessage?: string;
}

interface Props {
  invitationId: string;
}

export default function GuestList({ invitationId }: Props) {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [newGuest, setNewGuest] = useState({ name: '', email: '', phone: '', customMessage: '' });
  const [adding, setAdding] = useState(false);
  const [importMessage, setImportMessage] = useState<string>('');

  useEffect(() => {
    const fetchGuests = async () => {
      try {
        const res = await api.get('/guests', { params: { invitationId } });
        setGuests(res.data.guests);
      } catch (err) {
        console.error('Failed to fetch guests:', err);
      } finally {
        setLoading(false);
      }
    };
    if (invitationId) fetchGuests();
  }, [invitationId]);

  const handleAddGuest = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdding(true);
    try {
      const res = await api.post('/guests', {
        invitationId,
        name: newGuest.name,
        email: newGuest.email || undefined,
        phone: newGuest.phone || undefined,
        customMessage: newGuest.customMessage || undefined,
      });
      setGuests([res.data, ...guests]);
      setNewGuest({ name: '', email: '', phone: '', customMessage: '' });
      setShowAddModal(false);
    } catch (err) {
      console.error('Failed to add guest:', err);
    }
    setAdding(false);
  };

  const handleExport = async () => {
    try {
      const res = await api.get('/guests/export', { params: { invitationId } });
      const blob = new Blob([JSON.stringify(res.data.data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'guests.json';
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export failed:', err);
    }
  };

  const handleImportSuccess = async (importedCount: number) => {
    setShowImportModal(false);
    setImportMessage(`Đã import ${importedCount} khách thành công`);
    try {
      const res = await api.get('/guests', { params: { invitationId } });
      setGuests(res.data.guests);
    } catch (err) {
      console.error('Failed to reload guests:', err);
    }
    setTimeout(() => setImportMessage(''), 4000);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm">
      <div className="p-4 sm:p-6 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h3 className="text-lg font-semibold">Danh sách khách ({guests.length})</h3>
        <div className="flex gap-2 sm:gap-3">
          <button onClick={() => setShowImportModal(true)} className="flex-1 sm:flex-none px-3 sm:px-4 py-2 text-sm border rounded-lg hover:bg-gray-50 whitespace-nowrap">
            📤 Import CSV
          </button>
          <button onClick={handleExport} className="flex-1 sm:flex-none px-3 sm:px-4 py-2 text-sm border rounded-lg hover:bg-gray-50 whitespace-nowrap">
            📥 Export
          </button>
          <button 
            onClick={() => setShowAddModal(true)}
            className="flex-1 sm:flex-none px-3 sm:px-4 py-2 text-sm bg-dark text-white rounded-lg whitespace-nowrap"
          >
            + Thêm khách
          </button>
        </div>
      </div>

      {importMessage && (
        <div className="mx-4 sm:mx-6 mt-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
          ✓ {importMessage}
        </div>
      )}

      {loading ? (
        <div className="p-8 text-center text-gray-400">Loading guests...</div>
      ) : guests.length === 0 ? (
        <div className="p-8 text-center text-gray-400">Chưa có khách mời. Thêm khách đầu tiên!</div>
      ) : (
        <div className="divide-y">
          {guests.map((guest) => (
            <div key={guest.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0">
              <div className="min-w-0">
                <p className="font-medium truncate">{guest.name}</p>
                <p className="text-sm text-gray-500 truncate">{guest.email || guest.phone || '-'}</p>
              </div>
              <div className="flex items-center gap-2 sm:gap-3">
                <span className={`px-2 sm:px-3 py-1 rounded-full text-xs capitalize whitespace-nowrap ${
                  guest.rsvpStatus === 'attending' ? 'bg-green-100 text-green-700' :
                  guest.rsvpStatus === 'declined' ? 'bg-red-100 text-red-700' :
                  'bg-yellow-100 text-yellow-700'
                }`}>
                  {guest.rsvpStatus === 'attending' ? 'Tham dự' :
                   guest.rsvpStatus === 'declined' ? 'Từ chối' :
                   'Chưa phản hồi'}
                </span>
                {guest.rsvpAttendees > 0 && (
                  <span className="text-sm text-gray-500 whitespace-nowrap">+{guest.rsvpAttendees}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <form onSubmit={handleAddGuest} className="bg-white rounded-xl p-6 w-full max-w-md">
            <h4 className="text-lg font-semibold mb-4">Thêm khách mời</h4>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Tên khách"
                value={newGuest.name}
                onChange={(e) => setNewGuest({ ...newGuest, name: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg"
                required
              />
              <input
                type="email"
                placeholder="Email (không bắt buộc)"
                value={newGuest.email}
                onChange={(e) => setNewGuest({ ...newGuest, email: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg"
              />
              <input
                type="tel"
                placeholder="Số điện thoại (không bắt buộc)"
                value={newGuest.phone}
                onChange={(e) => setNewGuest({ ...newGuest, phone: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg"
              />
              <textarea
                placeholder="Lời nhắn riêng cho khách này"
                value={newGuest.customMessage}
                onChange={(e) => setNewGuest({ ...newGuest, customMessage: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg h-20"
              />
            </div>
            <div className="flex gap-3 mt-6">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="flex-1 px-4 py-2 border rounded-lg"
              >
                Hủy
              </button>
              <button type="submit" disabled={adding} className="flex-1 px-4 py-2 bg-dark text-white rounded-lg disabled:opacity-50">
                Thêm
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
