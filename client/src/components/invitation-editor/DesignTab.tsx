import { TEMPLATE_OPTIONS, FONT_OPTIONS, type DesignTabProps } from './types';
import { getSectionsForTemplate } from '../../utils/sections';
import ImageUpload from '../ImageUpload';

export default function DesignTab({ draft, onChange }: DesignTabProps) {
  const handleTemplateChange = (templateId: string) => {
    const template = TEMPLATE_OPTIONS.find((t) => t.id === templateId);
    if (!template || templateId === draft.template) return;
    onChange({
      template: templateId,
      primaryColor: template.primaryColor,
      fontFamily: template.fontFamily,
      sections: getSectionsForTemplate(templateId),
    });
  };

  return (
    <div className="space-y-6">
      {/* Template Selection */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h3 className="font-semibold mb-4 text-lg">Template thiệp cưới</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {TEMPLATE_OPTIONS.map((template) => (
            <button
              key={template.id}
              onClick={() => handleTemplateChange(template.id)}
              className={`p-4 rounded-xl border-2 text-left transition-all ${
                draft.template === template.id
                  ? 'border-primary bg-primary/5'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="aspect-video rounded-lg overflow-hidden mb-3">
                <img
                  src={template.preview}
                  alt={template.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="font-medium">{template.name}</div>
              <div className="text-sm text-gray-500">{template.nameVi}</div>
              {draft.template === template.id && (
                <div className="mt-2 text-xs text-primary font-medium">✓ Đang chọn</div>
              )}
            </button>
          ))}
        </div>
        <p className="text-sm text-gray-500 mt-4">
          Chọn template sẽ cập nhật màu sắc, font chữ và sections mặc định. Bạn có thể tùy chỉnh thêm bên dưới.
        </p>
      </div>

      {/* Colors */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h3 className="font-semibold mb-4 text-lg">Màu sắc</h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm text-gray-600 mb-2">Màu chính</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={draft.primaryColor}
                onChange={(e) => onChange({ primaryColor: e.target.value })}
                className="w-16 h-16 rounded-lg cursor-pointer border-0"
              />
              <div className="flex-1">
                <input
                  type="text"
                  value={draft.primaryColor}
                  onChange={(e) => onChange({ primaryColor: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm font-mono"
                />
                <p className="text-xs text-gray-500 mt-1">Dùng cho tiêu đề, nút bấm, nhấn mạnh</p>
              </div>
            </div>
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-2">Màu phụ</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={draft.secondaryColor || '#ffffff'}
                onChange={(e) =>
                  onChange({ secondaryColor: e.target.value || null })
                }
                className="w-16 h-16 rounded-lg cursor-pointer border-0"
              />
              <div className="flex-1">
                <input
                  type="text"
                  value={draft.secondaryColor || ''}
                  onChange={(e) =>
                    onChange({ secondaryColor: e.target.value || null })
                  }
                  className="w-full px-3 py-2 border rounded-lg text-sm font-mono"
                  placeholder="#ffffff"
                />
                <p className="text-xs text-gray-500 mt-1">Dùng cho nền, viền nhẹ</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Typography */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h3 className="font-semibold mb-4 text-lg">Font chữ</h3>
        <div>
          <label className="block text-sm text-gray-600 mb-2">Font chính</label>
          <select
            value={draft.fontFamily}
            onChange={(e) => onChange({ fontFamily: e.target.value })}
            className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
          >
            {FONT_OPTIONS.map((font) => (
              <option key={font} value={font}>
                {font}
              </option>
            ))}
          </select>
          <div
            className="mt-4 p-4 bg-gray-50 rounded-lg text-center"
            style={{ fontFamily: draft.fontFamily }}
          >
            <p className="text-2xl">{draft.groomName} & {draft.brideName}</p>
            <p className="text-sm mt-2 text-gray-500" style={{ fontFamily: 'system-ui' }}>
              Xem trước với "{draft.fontFamily}"
            </p>
          </div>
        </div>
      </div>

      {/* Cover Photo */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h3 className="font-semibold mb-4 text-lg">Ảnh bìa</h3>
        <ImageUpload
          currentUrl={draft.coverPhoto || ''}
          gallery={draft.gallery}
          onUpload={(url) => onChange({ coverPhoto: url })}
          onAddToGallery={(urls) => onChange({ gallery: [...draft.gallery, ...urls] })}
          label=""
        />
        <p className="text-sm text-gray-500 mt-3">
          Ảnh bìa hiển thị ở hero section. Khuyến nghị kích thước 1920x1080px hoặc lớn hơn.
        </p>
      </div>

      {/* Background Music */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h3 className="font-semibold mb-4 text-lg">Nhạc nền</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-600 mb-2">
              Link nhạc (URL .mp3 / .m4a)
            </label>
            <input
              type="url"
              value={draft.musicUrl || ''}
              onChange={(e) => onChange({ musicUrl: e.target.value || null })}
              placeholder="https://example.com/bai-hat-cuoi.mp3"
              className="w-full px-3 py-2 border rounded-lg text-sm font-mono focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
            />
            <p className="text-xs text-gray-500 mt-1">
              Dán link trực tiếp đến file nhạc (mp3, m4a, wav). Để trống nếu không dùng nhạc nền.
            </p>
            {draft.musicUrl && (
              <audio src={draft.musicUrl} controls preload="none" className="w-full mt-3" />
            )}
          </div>
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={!!draft.musicAutoplay}
              onChange={(e) => onChange({ musicAutoplay: e.target.checked })}
              className="w-4 h-4 mt-1"
            />
            <div>
              <div className="font-medium text-sm">Tự động phát khi mở thiệp</div>
              <div className="text-xs text-gray-500 mt-0.5">
                Trình duyệt có thể chặn — khách cần nhấn tương tác trước. Nút phát sẽ hiện ở góc dưới phải.
              </div>
            </div>
          </label>
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={!!draft.musicFadeIn}
              onChange={(e) => onChange({ musicFadeIn: e.target.checked })}
              className="w-4 h-4 mt-1"
            />
            <div>
              <div className="font-medium text-sm">Fade in khi bắt đầu</div>
              <div className="text-xs text-gray-500 mt-0.5">
                Âm lượng tăng dần từ 0 → 100% trong 2 giây, dễ chịu hơn khi mở thiệp.
              </div>
            </div>
          </label>
        </div>
      </div>
    </div>
  );
}
