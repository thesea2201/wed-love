import { useState } from 'react';
import type { ContentTabProps } from './types';
import CharCounter from './CharCounter';

export default function ContentTab({ draft, onChange }: ContentTabProps) {
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [generatingStory, setGeneratingStory] = useState(false);

  // Format date for input (YYYY-MM-DD)
  const formatDateForInput = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toISOString().split('T')[0];
    } catch {
      return '';
    }
  };

  // Generate AI story suggestions
  const generateAIStory = async () => {
    setGeneratingStory(true);
    // Simulate AI generation (will integrate with real API later)
    await new Promise((r) => setTimeout(r, 1500));
    const suggestions = [
      {
        title: 'Gặp gỡ tình cờ',
        text: 'Chúng tôi gặp nhau lần đầu tiên một cách thật tình cờ. Một buổi chiều mưa ở quán cà phê quen thuộc. Ly cà phê đổ nhẹ đã bắt đầu một câu chuyện kéo dài đến tận khi quán đóng cửa.\n\nBa năm sau, trên đỉnh núi lúc hoàng hôn, anh đã quỳ xuống. Chị đáp lời trước khi anh kịp hỏi xong.\n\n"Trong cả thế giới này, không có trái tim nào dành cho em như trái tim anh. Trong cả thế giới này, không có tình yêu nào dành cho anh như tình yêu em."',
      },
      {
        title: 'Tình yêu vượt thời gian',
        text: 'Từ những ngày đầu bên nhau, chúng tôi đã biết đây là điều đặc biệt. Qua bao thăng trầm, những chuyến đi xa, và những buổi tối chỉ có hai người, tình yêu của chúng tôi ngày càng sâu sắc.\n\nHôm nay, chúng tôi chính thức bắt đầu chương mới của cuộc đời. Cảm ơn bạn đã là một phần trong hành trình này.',
      },
      {
        title: 'Hai trái tim chung nhịp',
        text: 'Anh là bình minh của em. Em là hoàng hôn của anh. Giữa hai điểm đó là cả một ngày dài tuyệt đẹp mà chúng ta cùng nhau tạo nên.\n\nChúng tôi rất hạnh phúc được chia sẻ ngày trọng đại này với những người thân yêu nhất.',
      },
    ];
    setGeneratingStory(false);
    return suggestions;
  };

  const [aiSuggestions, setAiSuggestions] = useState<{ title: string; text: string }[]>([]);

  const handleGenerateClick = async () => {
    const suggestions = await generateAIStory();
    setAiSuggestions(suggestions);
  };

  return (
    <div className="space-y-6">
      {/* Couple Names */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h3 className="font-semibold mb-4 text-lg">Tên cô dâu & chú rể</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-600 mb-2">
              Tên chú rể <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={draft.groomName}
              onChange={(e) => onChange({ groomName: e.target.value })}
              placeholder="Ví dụ: An"
              maxLength={100}
              className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
              required
            />
            <CharCounter current={draft.groomName.length} max={100} />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-2">
              Tên cô dâu <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={draft.brideName}
              onChange={(e) => onChange({ brideName: e.target.value })}
              placeholder="Ví dụ: Linh"
              maxLength={100}
              className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
              required
            />
            <CharCounter current={draft.brideName.length} max={100} />
          </div>
        </div>
      </div>

      {/* Wedding Title */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h3 className="font-semibold mb-4 text-lg">Tiêu đề thiệp cưới</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-600 mb-2">
              Tiêu đề chính <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={draft.title}
              onChange={(e) => onChange({ title: e.target.value })}
              placeholder="Ví dụ: An & Linh"
              maxLength={200}
              className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
              required
            />
            <div className="flex items-center justify-between mt-1">
              <p className="text-xs text-gray-500">
                Hiển thị trên tab trình duyệt và khi share link
              </p>
              <CharCounter current={draft.title.length} max={200} />
            </div>
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-2">
              Phụ đề <span className="text-gray-400 text-xs">(hiển thị trên hero section)</span>
            </label>
            <input
              type="text"
              value={draft.subtitle || ''}
              onChange={(e) => onChange({ subtitle: e.target.value || null })}
              placeholder="Ví dụ: Cùng hai bên gia đình"
              maxLength={2000}
              className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
            />
            <div className="flex items-center justify-between mt-1">
              <p className="text-xs text-gray-500">
                Hiển thị phía trên tên cô dâu chú rể. Mặc định: "Cùng hai bên gia đình"
              </p>
              <CharCounter current={(draft.subtitle || '').length} max={2000} />
            </div>
          </div>
        </div>
      </div>

      {/* Wedding Date */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h3 className="font-semibold mb-4 text-lg">Ngày cưới</h3>
        <div>
          <label className="block text-sm text-gray-600 mb-2">
            Ngày tổ chức <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            value={formatDateForInput(draft.weddingDate)}
            onChange={(e) =>
              onChange({ weddingDate: e.target.value ? new Date(e.target.value).toISOString() : draft.weddingDate })
            }
            className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            Dùng cho countdown và hiển thị ngày trên thiệp
          </p>
        </div>
      </div>

      {/* Venue Information */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h3 className="font-semibold mb-4 text-lg">Địa điểm tổ chức</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-600 mb-2">Tên nhà hàng/địa điểm</label>
            <input
              type="text"
              value={draft.venue || ''}
              onChange={(e) => onChange({ venue: e.target.value || null })}
              placeholder="Ví dụ: Trống Đồng Palace"
              maxLength={2000}
              className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
            />
            <CharCounter current={(draft.venue || '').length} max={2000} />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-2">Địa chỉ đầy đủ</label>
            <textarea
              value={draft.venueAddress || ''}
              onChange={(e) => onChange({ venueAddress: e.target.value || null })}
              placeholder="Ví dụ: 135A Nguyễn Hữu Cảnh, Quận 1, TP.HCM"
              maxLength={2000}
              rows={3}
              className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none resize-none"
            />
            <div className="flex justify-end mt-1">
              <CharCounter current={(draft.venueAddress || '').length} max={2000} />
            </div>
          </div>
        </div>
      </div>

      {/* Ceremony Times */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h3 className="font-semibold mb-4 text-lg">Thời gian</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-600 mb-2">Lễ cưới</label>
            <input
              type="text"
              value={draft.ceremonyTime || ''}
              onChange={(e) => onChange({ ceremonyTime: e.target.value || null })}
              placeholder="Ví dụ: 9:00 sáng"
              maxLength={2000}
              className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
            />
            <CharCounter current={(draft.ceremonyTime || '').length} max={2000} />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-2">Tiệc cưới</label>
            <input
              type="text"
              value={draft.receptionTime || ''}
              onChange={(e) => onChange({ receptionTime: e.target.value || null })}
              placeholder="Ví dụ: 6:00 chiều"
              maxLength={2000}
              className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
            />
            <CharCounter current={(draft.receptionTime || '').length} max={2000} />
          </div>
        </div>
      </div>

      {/* Love Story */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-lg">Câu chuyện tình yêu</h3>
          <button
            onClick={() => {
              setShowAIAssistant(!showAIAssistant);
              if (!showAIAssistant) {
                handleGenerateClick();
              }
            }}
            className="text-sm bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2"
          >
            <span>✨</span>
            {showAIAssistant ? 'Đóng gợi ý' : 'Gợi ý từ AI'}
          </button>
        </div>

        {showAIAssistant && (
          <div className="mb-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-4 border border-purple-100">
            <h4 className="text-sm font-medium text-purple-800 mb-3">Chọn một gợi ý:</h4>
            {generatingStory ? (
              <div className="flex items-center gap-2 text-purple-600">
                <div className="w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
                <span className="text-sm">Đang tạo gợi ý...</span>
              </div>
            ) : (
              <div className="space-y-2">
                {aiSuggestions.map((suggestion, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      onChange({ story: suggestion.text });
                      setShowAIAssistant(false);
                    }}
                    className="w-full text-left p-3 bg-white rounded-lg border border-purple-200 hover:border-purple-400 hover:shadow-sm transition-all"
                  >
                    <div className="font-medium text-sm text-purple-700">{suggestion.title}</div>
                    <div className="text-xs text-gray-500 mt-1 line-clamp-2">{suggestion.text}</div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        <textarea
          value={draft.story || ''}
          onChange={(e) => onChange({ story: e.target.value || null })}
          placeholder="Chia sẻ câu chuyện tình yêu của hai bạn..."
          maxLength={2000}
          rows={8}
          className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none resize-y"
        />
        <div className="flex items-center justify-between mt-2">
          <p className="text-xs text-gray-500">
            Hỗ trợ xuống dòng. Mỗi đoạn văn sẽ được hiển thị riêng biệt.
          </p>
          <CharCounter current={(draft.story || '').length} max={2000} />
        </div>
      </div>
    </div>
  );
}
