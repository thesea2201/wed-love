import { DuplicateGroup } from './parseCsv';

interface Props {
  duplicates: DuplicateGroup[];
  onChoice: (choice: 'skip' | 'keep') => void;
  onCancel: () => void;
}

export default function DuplicateDialog({ duplicates, onChoice, onCancel }: Props) {
  const totalDupRows = duplicates.reduce((s, d) => s + d.rowIndices.length, 0);
  const wouldSkip = totalDupRows - duplicates.length;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-xl w-full max-w-md p-6">
        <h3 className="text-lg font-semibold mb-2">⚠️ Phát hiện dữ liệu trùng lặp</h3>
        <p className="text-sm text-gray-600 mb-4">
          File có <span className="font-semibold">{duplicates.length}</span> nhóm trùng
          (tổng <span className="font-semibold">{totalDupRows}</span> dòng). Bạn muốn xử lý thế nào?
        </p>

        <div className="max-h-40 overflow-y-auto bg-gray-50 rounded-lg p-3 mb-4 text-sm space-y-1">
          {duplicates.map((d, i) => (
            <div key={i} className="text-gray-700">
              <span className="font-medium">{d.preview}</span>
              <span className="text-gray-500"> — dòng {d.rowIndices.join(', ')}</span>
            </div>
          ))}
        </div>

        <div className="space-y-2">
          <button
            onClick={() => onChoice('skip')}
            className="w-full px-4 py-3 bg-primary text-white rounded-lg hover:opacity-90 text-left"
          >
            <div className="font-medium">Bỏ qua {wouldSkip} dòng trùng</div>
            <div className="text-xs opacity-90">Giữ lại 1 dòng đầu tiên của mỗi nhóm</div>
          </button>
          <button
            onClick={() => onChoice('keep')}
            className="w-full px-4 py-3 border rounded-lg hover:bg-gray-50 text-left"
          >
            <div className="font-medium">Import tất cả {totalDupRows} dòng</div>
            <div className="text-xs text-gray-500">Có thể tạo khách trùng trong database</div>
          </button>
          <button
            onClick={onCancel}
            className="w-full px-4 py-2 text-sm text-gray-500 hover:text-gray-700"
          >
            Hủy
          </button>
        </div>
      </div>
    </div>
  );
}
