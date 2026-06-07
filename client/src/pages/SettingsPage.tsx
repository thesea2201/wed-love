import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../stores/auth-store';
import { useToast } from '../components/Toast';
import { useConfirm } from '../components/ConfirmDialog';

export default function SettingsPage() {
  const { user, fetchMe, logout, changePassword, deleteAccount } = useAuthStore();
  const toast = useToast();
  const confirm = useConfirm();
  const navigate = useNavigate();

  const [isLoadingUser, setIsLoadingUser] = useState(!user);

  // Current password form
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChanging, setIsChanging] = useState(false);
  const [changeError, setChangeError] = useState<string | null>(null);

  // Delete account form
  const [deletePassword, setDeletePassword] = useState('');
  const [showDeleteForm, setShowDeleteForm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setIsLoadingUser(true);
      fetchMe()
        .catch(() => {
          toast.error('Không thể tải thông tin tài khoản');
        })
        .finally(() => setIsLoadingUser(false));
    }
  }, [user, fetchMe, toast]);

  const validatePasswordForm = (): string | null => {
    if (!currentPassword) return 'Vui lòng nhập mật khẩu hiện tại';
    if (newPassword.length < 8) return 'Mật khẩu mới phải có ít nhất 8 ký tự';
    if (newPassword === currentPassword) return 'Mật khẩu mới phải khác mật khẩu hiện tại';
    if (newPassword !== confirmPassword) return 'Xác nhận mật khẩu không khớp';
    return null;
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setChangeError(null);
    const validationError = validatePasswordForm();
    if (validationError) {
      setChangeError(validationError);
      return;
    }
    setIsChanging(true);
    try {
      await changePassword(currentPassword, newPassword);
      toast.success('Đã đổi mật khẩu');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      const message = err.response?.data?.error || 'Đổi mật khẩu thất bại';
      setChangeError(message);
    } finally {
      setIsChanging(false);
    }
  };

  const handleLogout = () => {
    logout();
    toast.info('Đã đăng xuất');
    navigate('/login');
  };

  const handleDeleteAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setDeleteError(null);
    if (!deletePassword) {
      setDeleteError('Vui lòng nhập mật khẩu để xác nhận');
      return;
    }
    const ok = await confirm({
      title: 'Xóa tài khoản vĩnh viễn?',
      message: 'Tài khoản và tất cả thiệp cưới, khách mời, ảnh sẽ bị xóa vĩnh viễn. Hành động này không thể hoàn tác.',
      confirmLabel: 'Xóa tài khoản',
      cancelLabel: 'Hủy',
      variant: 'danger',
    });
    if (!ok) return;
    setIsDeleting(true);
    try {
      await deleteAccount(deletePassword);
      toast.success('Tài khoản đã được xóa');
      navigate('/');
    } catch (err: any) {
      const message = err.response?.data?.error || 'Xóa tài khoản thất bại';
      setDeleteError(message);
      setIsDeleting(false);
    }
  };

  if (isLoadingUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-dark" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/dashboard" className="text-sm text-gray-600 hover:text-gray-900">
              ← Quay lại
            </Link>
            <h1 className="text-xl font-semibold">Cài đặt tài khoản</h1>
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        {/* Account info */}
        <section className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="font-semibold text-lg mb-4">Thông tin tài khoản</h2>
          {user ? (
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <dt className="text-gray-500">Email</dt>
                <dd className="font-medium">{user.email}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Tên chú rể</dt>
                <dd className="font-medium">{user.groomName}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Tên cô dâu</dt>
                <dd className="font-medium">{user.brideName}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Ngày cưới</dt>
                <dd className="font-medium">
                  {new Date(user.weddingDate).toLocaleDateString('vi-VN')}
                </dd>
              </div>
            </dl>
          ) : (
            <p className="text-sm text-gray-500">Không có thông tin tài khoản.</p>
          )}
        </section>

        {/* Change password */}
        <section className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="font-semibold text-lg mb-4">Đổi mật khẩu</h2>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label htmlFor="current-password" className="block text-sm text-gray-600 mb-1">
                Mật khẩu hiện tại
              </label>
              <input
                id="current-password"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                autoComplete="current-password"
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
              />
            </div>
            <div>
              <label htmlFor="new-password" className="block text-sm text-gray-600 mb-1">
                Mật khẩu mới <span className="text-gray-400 text-xs">(ít nhất 8 ký tự)</span>
              </label>
              <input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                autoComplete="new-password"
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
              />
            </div>
            <div>
              <label htmlFor="confirm-password" className="block text-sm text-gray-600 mb-1">
                Xác nhận mật khẩu mới
              </label>
              <input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
              />
            </div>
            {changeError && (
              <p data-testid="change-error" className="text-sm text-red-600">
                {changeError}
              </p>
            )}
            <button
              type="submit"
              disabled={isChanging}
              className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 disabled:opacity-50"
            >
              {isChanging ? 'Đang lưu...' : 'Đổi mật khẩu'}
            </button>
          </form>
        </section>

        {/* Logout */}
        <section className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="font-semibold text-lg mb-2">Phiên đăng nhập</h2>
          <p className="text-sm text-gray-600 mb-4">Đăng xuất khỏi tất cả thiết bị.</p>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50"
          >
            Đăng xuất
          </button>
        </section>

        {/* Danger zone */}
        <section className="bg-white rounded-xl p-6 shadow-sm border border-red-100">
          <h2 className="font-semibold text-lg text-red-600 mb-2">Vùng nguy hiểm</h2>
          {!showDeleteForm ? (
            <>
              <p className="text-sm text-gray-600 mb-4">
                Xóa tài khoản sẽ xóa vĩnh viễn tất cả thiệp cưới, khách mời và ảnh của bạn.
                Hành động này không thể hoàn tác.
              </p>
              <button
                onClick={() => setShowDeleteForm(true)}
                className="px-4 py-2 bg-red-50 text-red-600 border border-red-200 rounded-lg text-sm font-medium hover:bg-red-100"
              >
                Tôi muốn xóa tài khoản
              </button>
            </>
          ) : (
            <form onSubmit={handleDeleteAccount} className="space-y-4">
              <p className="text-sm text-gray-700">
                Nhập mật khẩu của bạn để xác nhận xóa vĩnh viễn tài khoản.
              </p>
              <input
                type="password"
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
                placeholder="Mật khẩu của bạn"
                autoComplete="current-password"
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-200 focus:border-red-400 outline-none"
              />
              {deleteError && (
                <p data-testid="delete-error" className="text-sm text-red-600">
                  {deleteError}
                </p>
              )}
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={isDeleting}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50"
                >
                  {isDeleting ? 'Đang xóa...' : 'Xóa tài khoản vĩnh viễn'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowDeleteForm(false);
                    setDeletePassword('');
                    setDeleteError(null);
                  }}
                  disabled={isDeleting}
                  className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50"
                >
                  Hủy
                </button>
              </div>
            </form>
          )}
        </section>
      </div>
    </div>
  );
}
