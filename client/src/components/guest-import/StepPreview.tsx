import { GuestRow } from './parseCsv';

interface Props {
  rows: GuestRow[];
  skippedRowIndices: Set<number>;
  duplicates: { rowIndices: number[]; preview: string }[];
  onToggleRow: (rowIndex: number) => void;
}

export default function StepPreview({ rows, skippedRowIndices, duplicates, onToggleRow }: Props) {
  const dupIndices = new Set(duplicates.flatMap((d) => d.rowIndices));

  const validRows = rows.filter((r) => r.errors.length === 0);
  const errorRows = rows.filter((r) => r.errors.length > 0);

  return (
    <div>
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-blue-700">{rows.length}</div>
          <div className="text-xs text-blue-600">Tổng dòng</div>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-green-700">{validRows.length}</div>
          <div className="text-xs text-green-600">Hợp lệ</div>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-red-700">{errorRows.length}</div>
          <div className="text-xs text-red-600">Có lỗi</div>
        </div>
      </div>

      {duplicates.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4 text-sm text-yellow-800">
          ⚠️ Phát hiện {duplicates.length} nhóm trùng lặp ({duplicates.reduce((s, d) => s + d.rowIndices.length, 0)} dòng).
          Xử lý ở bước tiếp theo.
        </div>
      )}

      <div className="max-h-96 overflow-y-auto border rounded-lg">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 sticky top-0">
            <tr>
              <th className="px-3 py-2 text-left font-medium text-gray-600">#</th>
              <th className="px-3 py-2 text-left font-medium text-gray-600">Tên</th>
              <th className="px-3 py-2 text-left font-medium text-gray-600">Email</th>
              <th className="px-3 py-2 text-left font-medium text-gray-600">SĐT</th>
              <th className="px-3 py-2 text-left font-medium text-gray-600">Lời nhắn</th>
              <th className="px-3 py-2 text-left font-medium text-gray-600">Trạng thái</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {rows.map((row) => {
              const isError = row.errors.length > 0;
              const isSkipped = skippedRowIndices.has(row.rowIndex);
              const isDup = dupIndices.has(row.rowIndex);
              return (
                <tr
                  key={row.rowIndex}
                  className={`${
                    isError ? 'bg-red-50' : isSkipped ? 'bg-gray-100 opacity-60' : 'hover:bg-gray-50'
                  }`}
                >
                  <td className="px-3 py-2 text-gray-500 text-xs">{row.rowIndex}</td>
                  <td className="px-3 py-2 font-medium">{row.name || '—'}</td>
                  <td className="px-3 py-2 text-gray-600">{row.email || '—'}</td>
                  <td className="px-3 py-2 text-gray-600">{row.phone || '—'}</td>
                  <td className="px-3 py-2 text-gray-600 truncate max-w-xs">{row.customMessage || '—'}</td>
                  <td className="px-3 py-2">
                    {isError ? (
                      <div className="text-xs text-red-600">{row.errors.join(', ')}</div>
                    ) : isSkipped ? (
                      <span className="text-xs text-gray-500">Đã bỏ qua</span>
                    ) : isDup ? (
                      <span className="text-xs text-yellow-700">Trùng lặp</span>
                    ) : (
                      <span className="text-xs text-green-600">✓ Sẵn sàng</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {validRows.length === 0 && (
        <p className="text-center text-sm text-gray-500 mt-4">
          Không có dòng hợp lệ nào để import. Vui lòng sửa file và thử lại.
        </p>
      )}
    </div>
  );
}
