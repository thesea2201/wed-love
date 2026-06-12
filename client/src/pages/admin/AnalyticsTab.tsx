import { useParams, Navigate } from 'react-router-dom';
import { useAnalytics } from '../../hooks/use-analytics';

export default function AnalyticsTab() {
  const { invId } = useParams<{ invId: string }>();
  const { data, isLoading, isError } = useAnalytics(invId ?? '');

  if (!invId) return <Navigate to="/dashboard" replace />;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-3 text-gray-500">
          <div className="w-5 h-5 border-2 border-gray-300 border-t-primary rounded-full animate-spin" />
          <span>Đang tải analytics...</span>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p>Không thể tải dữ liệu analytics.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h2 className="text-xl font-semibold mb-4">Analytics</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-gray-50 rounded-lg">
          <div className="text-sm text-gray-500">Lượt xem</div>
          <div className="text-2xl font-semibold mt-1">{data?.views ?? 0}</div>
        </div>
        <div className="p-4 bg-gray-50 rounded-lg">
          <div className="text-sm text-gray-500">Tổng khách mời</div>
          <div className="text-2xl font-semibold mt-1">{data?.totalGuests ?? 0}</div>
        </div>
        <div className="p-4 bg-gray-50 rounded-lg">
          <div className="text-sm text-gray-500">Xác nhận tham dự</div>
          <div className="text-2xl font-semibold mt-1">{data?.attending ?? 0}</div>
        </div>
      </div>
    </div>
  );
}
