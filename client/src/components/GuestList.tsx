import { useState, useEffect } from 'react';
import api from '../utils/api';
import ImportGuestsModal from './guest-import/ImportGuestsModal';
import { useToast } from './Toast';
import { useConfirm } from './ConfirmDialog';

interface Guest {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  rsvpStatus: string;
  rsvpAttendees: number;
  customMessage?: string;
}

interface QrInfo {
  guestId: string;
  guestName: string;
  url: string;
  pngUrl: string;
  svgUrl: string;
  viewedAt: string | null;
  viewCount: number;
}

interface Props {
  invitationId: string;
}

export default function GuestList({ invitationId }: Props) {
  const toast = useToast();
  const confirm = useConfirm();
  const [guests, setGuests] = useState<Guest[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [newGuest, setNewGuest] = useState({ name: '', email: '', phone: '', customMessage: '' });
  const [adding, setAdding] = useState(false);
  const [importMessage, setImportMessage] = useState<string>('');

  const [showQrModal, setShowQrModal] = useState(false);
  const [qrGuest, setQrGuest] = useState<Guest | null>(null);
  const [qrInfo, setQrInfo] = useState<QrInfo | null>(null);
  const [qrLoading, setQrLoading] = useState(false);
  const [qrError, setQrError] = useState<string | null>(null);
  const [regenerating, setRegenerating] = useState(false);
  const [copied, setCopied] = useState(false);

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

  const openQrModal = async (guest: Guest) => {
    setQrGuest(guest);
    setQrInfo(null);
    setQrError(null);
    setShowAddModal(false);
    setShowQrModal(true);
    setCopied(false);
    setQrLoading(true);
    try {
      const res = await api.get(`/guests/${guest.id}/qr-info`);
      setQrInfo(res.data);
    } catch (err: any) {
      setQrError(err?.response?.data?.error || 'Failed to load QR code');
    } finally {
      setQrLoading(false);
    }
  };

  const closeQrModal = () => {
    setShowQrModal(false);
    setQrGuest(null);
    setQrInfo(null);
    setQrError(null);
    setCopied(false);
  };

  const handleRegenerateToken = async () => {
    if (!qrGuest) return;
    const ok = await confirm({
      title: 'Xoay mã QR',
      message: 'Tạo mã QR mới? Mã cũ và link cũ sẽ ngừng hoạt động.',
      confirmLabel: 'Tạo mới',
      variant: 'danger',
    });
    if (!ok) return;
    setRegenerating(true);
    try {
      await api.post(`/guests/${qrGuest.id}/regenerate-token`);
      const res = await api.get(`/guests/${qrGuest.id}/qr-info`);
      setQrInfo(res.data);
      toast.success('Đã tạo mã QR mới');
    } catch (err: any) {
      toast.error(err?.response?.data?.error || 'Không thể tạo mã QR mới');
    } finally {
      setRegenerating(false);
    }
  };

  const handleCopyLink = async () => {
    if (!qrInfo?.url) return;
    try {
      await navigator.clipboard.writeText(qrInfo.url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Copy failed — long-press the link to copy manually');
    }
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
                <button
                  onClick={() => openQrModal(guest)}
                  className="px-2 sm:px-3 py-1 sm:py-1.5 text-xs border rounded-lg hover:bg-gray-50 flex items-center gap-1.5"
                  title="View QR code"
                >
                  <span aria-hidden>📱</span> QR
                </button>
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

      {showQrModal && qrGuest && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={closeQrModal}
        >
          <div
            className="bg-white rounded-xl p-6 w-full max-w-sm"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h4 className="text-lg font-semibold">QR Code</h4>
                <p className="text-sm text-gray-500">{qrGuest.name}</p>
              </div>
              <button
                onClick={closeQrModal}
                className="text-gray-400 hover:text-gray-600 text-xl leading-none"
                aria-label="Close"
              >
                ×
              </button>
            </div>

            {qrLoading && (
              <div className="aspect-square bg-gray-50 rounded-lg flex items-center justify-center text-gray-400">
                Loading…
              </div>
            )}

            {qrError && (
              <div className="p-4 bg-red-50 text-red-700 rounded-lg text-sm">{qrError}</div>
            )}

            {qrInfo && !qrError && (
              <>
                <div className="aspect-square bg-white p-4 rounded-lg border">
                  <img
                    src={qrInfo.pngUrl}
                    alt={`QR code for ${qrInfo.guestName}`}
                    className="w-full h-full"
                  />
                </div>

                <div className="mt-4 space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Link:</span>
                    <button
                      onClick={handleCopyLink}
                      className="text-xs px-2 py-1 border rounded hover:bg-gray-50"
                    >
                      {copied ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                  <div className="font-mono text-xs bg-gray-50 p-2 rounded break-all">
                    {qrInfo.url}
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>
                      {qrInfo.viewCount === 0
                        ? 'Not yet opened'
                        : `Opened ${qrInfo.viewCount}× ${
                            qrInfo.viewedAt
                              ? `· first ${new Date(qrInfo.viewedAt).toLocaleDateString()}`
                              : ''
                          }`}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2 mt-4">
                  <a
                    href={qrInfo.pngUrl}
                    download={`qr-${qrInfo.guestName.replace(/[^a-zA-Z0-9_-]/g, '_')}.png`}
                    className="flex-1 text-center px-4 py-2 bg-dark text-white rounded-lg text-sm"
                  >
                    Download PNG
                  </a>
                  <button
                    onClick={handleRegenerateToken}
                    disabled={regenerating}
                    className="px-3 py-2 border rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50"
                    title="Invalidate current link and issue a new one"
                  >
                    {regenerating ? '…' : '↻ Rotate'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {showImportModal && (
        <ImportGuestsModal
          invitationId={invitationId}
          onClose={() => setShowImportModal(false)}
          onSuccess={handleImportSuccess}
        />
      )}
    </div>
  );
}
