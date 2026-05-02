import { useState } from 'react';
import type { SectionsTabProps } from './types';
import type { SectionConfig, SectionType } from '../../types';
import { SECTION_TYPE_LABELS, SECTION_TYPE_DESCRIPTIONS } from './types';

interface SectionTypeConfig {
  type: string;
  config: Record<string, any>;
}

const DEFAULT_CONFIGS: Record<string, SectionTypeConfig['config']> = {
  hero: { showCountdown: true, parallax: true, greetingStyle: 'formal' },
  story: { layout: 'split', imagePosition: 'left' },
  event: {
    events: [],
    showDressCode: true,
  },
  rsvp: { showDietary: true, dietaryOptions: ['Ăn chay', 'Dị ứng đậu phộng', 'Dị ứng hải sản'], maxAttendees: 5 },
  gallery: { columns: 3, lightbox: true, allowGuestUpload: false },
  countdown: { showSeconds: true, showLabels: true, style: 'boxed' },
  map: { provider: 'google', showDirections: true },
  music: { autoplay: false, fadeIn: true, showControls: true },
  gift: {
    methods: ['bank_transfer'],
    showBankQR: true,
    customMessage: '',
    showBrideSide: true,
    showGroomSide: true,
    brideQR: '',
    groomQR: '',
    brideBankInfo: '',
    groomBankInfo: '',
  },
};

const ALL_SECTION_TYPES = Object.keys(SECTION_TYPE_LABELS) as SectionType[];

export default function SectionsTab({ sections, onChange }: SectionsTabProps) {
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [editingSection, setEditingSection] = useState<string | null>(null);

  // Get visible sections sorted by order
  const visibleSections = sections
    .filter((s) => s.visible)
    .sort((a, b) => a.order - b.order);

  // Get hidden section types
  const visibleTypes = new Set(sections.filter((s) => s.visible).map((s) => s.type));
  const hiddenTypes = ALL_SECTION_TYPES.filter((type) => !visibleTypes.has(type));

  // Toggle section visibility
  const toggleSection = (sectionId: string) => {
    const updated = sections.map((s) =>
      s.id === sectionId ? { ...s, visible: !s.visible } : s
    );
    onChange(updated);
  };

  // Add a new section
  const addSection = (type: SectionType) => {
    const newSection: SectionConfig = {
      id: `${type}-${Date.now()}`,
      type,
      order: sections.length,
      visible: true,
      config: { ...DEFAULT_CONFIGS[type] },
    };
    onChange([...sections, newSection]);
  };

  // Remove a section
  const removeSection = (sectionId: string) => {
    const updated = sections.filter((s) => s.id !== sectionId);
    // Recalculate orders
    const recalculated = updated
      .filter((s) => s.visible)
      .sort((a, b) => a.order - b.order)
      .map((s, idx) => ({ ...s, order: idx }));
    onChange(recalculated.concat(updated.filter((s) => !s.visible)));
  };

  // Move section up/down
  const moveSection = (sectionId: string, direction: 'up' | 'down') => {
    const visible = visibleSections;
    const idx = visible.findIndex((s) => s.id === sectionId);
    if (idx === -1) return;

    const newIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (newIdx < 0 || newIdx >= visible.length) return;

    const newOrder = [...visible];
    [newOrder[idx], newOrder[newIdx]] = [newOrder[newIdx], newOrder[idx]];

    // Update order values
    const reordered = newOrder.map((s, i) => ({ ...s, order: i }));
    const hidden = sections.filter((s) => !s.visible);
    onChange([...reordered, ...hidden]);
  };

  // Update section config
  const updateSectionConfig = (sectionId: string, newConfig: Record<string, any>) => {
    const updated = sections.map((s) =>
      s.id === sectionId ? { ...s, config: { ...s.config, ...newConfig } } : s
    );
    onChange(updated);
  };

  return (
    <div className="space-y-6">
      {/* Active Sections */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-lg">Sections đang hiển thị</h3>
          <span className="text-sm text-gray-500">{visibleSections.length} sections</span>
        </div>

        <div className="space-y-3">
          {visibleSections.map((section, idx) => (
            <div
              key={section.id}
              className="border rounded-lg p-4 bg-white hover:shadow-sm transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex flex-col gap-1">
                    <button
                      onClick={() => moveSection(section.id, 'up')}
                      disabled={idx === 0}
                      className="text-gray-400 hover:text-gray-600 disabled:opacity-30"
                    >
                      ▲
                    </button>
                    <button
                      onClick={() => moveSection(section.id, 'down')}
                      disabled={idx === visibleSections.length - 1}
                      className="text-gray-400 hover:text-gray-600 disabled:opacity-30"
                    >
                      ▼
                    </button>
                  </div>
                  <div>
                    <div className="font-medium">{SECTION_TYPE_LABELS[section.type]}</div>
                    <div className="text-sm text-gray-500">
                      {SECTION_TYPE_DESCRIPTIONS[section.type]}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setEditingSection(editingSection === section.id ? null : section.id)}
                    className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    {editingSection === section.id ? 'Đóng' : 'Tùy chỉnh'}
                  </button>
                  <button
                    onClick={() => toggleSection(section.id)}
                    className="px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    Ẩn
                  </button>
                </div>
              </div>

              {/* Section Config Editor */}
              {editingSection === section.id && (
                <div className="mt-4 pt-4 border-t">
                  <SectionConfigEditor
                    type={section.type}
                    config={section.config}
                    onChange={(newConfig) => updateSectionConfig(section.id, newConfig)}
                  />
                </div>
              )}
            </div>
          ))}

          {visibleSections.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              Chưa có section nào được bật. Thêm section từ danh sách bên dưới.
            </div>
          )}
        </div>
      </div>

      {/* Add Sections */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h3 className="font-semibold mb-4 text-lg">Thêm section</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {hiddenTypes.map((type: SectionType) => (
            <button
              key={type}
              onClick={() => addSection(type)}
              className="flex items-center gap-3 p-3 border rounded-lg hover:border-primary hover:bg-primary/5 transition-all text-left"
            >
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-lg">
                {getSectionIcon(type)}
              </div>
              <div>
                <div className="font-medium">{SECTION_TYPE_LABELS[type]}</div>
                <div className="text-xs text-gray-500">{SECTION_TYPE_DESCRIPTIONS[type]}</div>
              </div>
              <span className="ml-auto text-primary text-xl">+</span>
            </button>
          ))}
        </div>
        {hiddenTypes.length === 0 && (
          <p className="text-center text-gray-500 py-4">
            Tất cả sections đã được thêm. Bạn có thể ẩn sections để thêm lại.
          </p>
        )}
      </div>

      {/* Hidden Sections */}
      {sections.filter((s) => !s.visible).length > 0 && (
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h3 className="font-semibold mb-4 text-lg">Sections đã ẩn</h3>
          <div className="space-y-2">
            {sections
              .filter((s) => !s.visible)
              .map((section) => (
                <div
                  key={section.id}
                  className="flex items-center justify-between p-3 border rounded-lg bg-gray-50"
                >
                  <span className="text-gray-600">{SECTION_TYPE_LABELS[section.type]}</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => toggleSection(section.id)}
                      className="px-3 py-1.5 text-sm text-primary hover:bg-primary/10 rounded-lg transition-colors"
                    >
                      Hiện
                    </button>
                    <button
                      onClick={() => removeSection(section.id)}
                      className="px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      Xóa
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Section-specific config editors
function SectionConfigEditor({
  type,
  config,
  onChange,
}: {
  type: string;
  config: Record<string, any>;
  onChange: (config: Record<string, any>) => void;
}) {
  switch (type) {
    case 'hero':
      return (
        <div className="space-y-4">
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={config.showCountdown}
              onChange={(e) => onChange({ showCountdown: e.target.checked })}
              className="w-4 h-4"
            />
            <span>Hiển thị đếm ngược</span>
          </label>
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={config.parallax}
              onChange={(e) => onChange({ parallax: e.target.checked })}
              className="w-4 h-4"
            />
            <span>Hiệu ứng parallax</span>
          </label>
          <div>
            <label className="block text-sm text-gray-600 mb-2">Kiểu chào hỏi</label>
            <select
              value={config.greetingStyle}
              onChange={(e) => onChange({ greetingStyle: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
            >
              <option value="formal">Trang trọng (Kính mời)</option>
              <option value="casual">Thân mật (Thân mến)</option>
            </select>
          </div>
        </div>
      );

    case 'story':
      return (
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-600 mb-2">Bố cục</label>
            <select
              value={config.layout}
              onChange={(e) => onChange({ layout: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
            >
              <option value="split">Chia đôi (ảnh + chữ)</option>
              <option value="full">Toàn chiều rộng</option>
            </select>
          </div>
          {config.layout === 'split' && (
            <div>
              <label className="block text-sm text-gray-600 mb-2">Vị trí ảnh</label>
              <select
                value={config.imagePosition}
                onChange={(e) => onChange({ imagePosition: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="left">Bên trái</option>
                <option value="right">Bên phải</option>
              </select>
            </div>
          )}
        </div>
      );

    case 'event':
      const events = config.events || [];
      return (
        <div className="space-y-5">
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={config.showDressCode !== false}
              onChange={(e) => onChange({ showDressCode: e.target.checked })}
              className="w-4 h-4 rounded"
            />
            <span>Hiển thị gợi ý trang phục</span>
          </label>

          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm text-gray-600">Sự kiện (tối đa 3)</label>
              <span className="text-xs text-gray-400">{events.length}/3</span>
            </div>

            <div className="space-y-3">
              {events.map((event: any, idx: number) => (
                <div key={event.id || idx} className="border rounded-lg p-3 bg-gray-50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-gray-500">Sự kiện {idx + 1}</span>
                    <button
                      onClick={() => {
                        const newEvents = events.filter((_: any, i: number) => i !== idx);
                        onChange({ events: newEvents });
                      }}
                      className="text-xs text-red-500 hover:text-red-700"
                    >
                      Xóa
                    </button>
                  </div>
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={event.name || ''}
                      onChange={(e) => {
                        const newEvents = [...events];
                        newEvents[idx] = { ...event, name: e.target.value };
                        onChange({ events: newEvents });
                      }}
                      placeholder="Tên sự kiện (VD: Lễ Vu Quy)"
                      className="w-full px-3 py-2 border rounded-lg text-sm"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={event.time || ''}
                        onChange={(e) => {
                          const newEvents = [...events];
                          newEvents[idx] = { ...event, time: e.target.value };
                          onChange({ events: newEvents });
                        }}
                        placeholder="Thời gian"
                        className="w-full px-3 py-2 border rounded-lg text-sm"
                      />
                      <input
                        type="text"
                        value={event.dressCode || ''}
                        onChange={(e) => {
                          const newEvents = [...events];
                          newEvents[idx] = { ...event, dressCode: e.target.value };
                          onChange({ events: newEvents });
                        }}
                        placeholder="Trang phục"
                        className="w-full px-3 py-2 border rounded-lg text-sm"
                      />
                    </div>
                    <input
                      type="text"
                      value={event.venue || ''}
                      onChange={(e) => {
                        const newEvents = [...events];
                        newEvents[idx] = { ...event, venue: e.target.value };
                        onChange({ events: newEvents });
                      }}
                      placeholder="Địa điểm"
                      className="w-full px-3 py-2 border rounded-lg text-sm"
                    />
                    <input
                      type="text"
                      value={event.address || ''}
                      onChange={(e) => {
                        const newEvents = [...events];
                        newEvents[idx] = { ...event, address: e.target.value };
                        onChange({ events: newEvents });
                      }}
                      placeholder="Địa chỉ chi tiết"
                      className="w-full px-3 py-2 border rounded-lg text-sm"
                    />
                    <input
                      type="text"
                      value={event.mapUrl || ''}
                      onChange={(e) => {
                        const newEvents = [...events];
                        newEvents[idx] = { ...event, mapUrl: e.target.value };
                        onChange({ events: newEvents });
                      }}
                      placeholder="Link Google Maps (share link)"
                      className="w-full px-3 py-2 border rounded-lg text-sm"
                    />
                  </div>
                </div>
              ))}
            </div>

            {events.length < 3 && (
              <button
                onClick={() => {
                  const newEvent = {
                    id: `event-${Date.now()}`,
                    name: '',
                    time: '',
                    venue: '',
                    address: '',
                    dressCode: '',
                    mapUrl: '',
                  };
                  onChange({ events: [...events, newEvent] });
                }}
                className="mt-3 w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-sm text-gray-500 hover:border-gray-400 hover:text-gray-600 transition-colors"
              >
                + Thêm sự kiện
              </button>
            )}
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-700">
            <p>Lưu ý: Nếu không nhập sự kiện, hệ thống sẽ tự động hiển thị từ thông tin lễ cưới/tiệc cưới đã nhập ở tab Nội dung.</p>
          </div>
        </div>
      );

    case 'gallery':
      return (
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-600 mb-2">Số cột</label>
            <select
              value={config.columns}
              onChange={(e) => onChange({ columns: Number(e.target.value) })}
              className="w-full px-3 py-2 border rounded-lg"
            >
              <option value={2}>2 cột</option>
              <option value={3}>3 cột</option>
              <option value={4}>4 cột</option>
            </select>
          </div>
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={config.lightbox}
              onChange={(e) => onChange({ lightbox: e.target.checked })}
              className="w-4 h-4"
            />
            <span>Cho phép click để phóng to</span>
          </label>
        </div>
      );

    case 'countdown':
      return (
        <div className="space-y-4">
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={config.showSeconds}
              onChange={(e) => onChange({ showSeconds: e.target.checked })}
              className="w-4 h-4"
            />
            <span>Hiển thị giây</span>
          </label>
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={config.showLabels}
              onChange={(e) => onChange({ showLabels: e.target.checked })}
              className="w-4 h-4"
            />
            <span>Hiển thị nhãn (Ngày, Giờ, Phút...)</span>
          </label>
        </div>
      );

    case 'rsvp':
      return (
        <div className="space-y-4">
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={config.showDietary}
              onChange={(e) => onChange({ showDietary: e.target.checked })}
              className="w-4 h-4"
            />
            <span>Hiển thị lựa chọn ăn kiêng</span>
          </label>
          <div>
            <label className="block text-sm text-gray-600 mb-2">Số khách tối đa</label>
            <input
              type="number"
              min={1}
              max={20}
              value={config.maxAttendees}
              onChange={(e) => onChange({ maxAttendees: Number(e.target.value) })}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>
        </div>
      );

    case 'gift':
      return (
        <div className="space-y-5">
          {/* Side Selection */}
          <div>
            <label className="block text-sm text-gray-600 mb-3">Hiển thị cho</label>
            <div className="space-y-2">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={config.showBrideSide !== false}
                  onChange={(e) => onChange({ showBrideSide: e.target.checked })}
                  className="w-4 h-4 rounded"
                />
                <span>Nhà gái (cô dâu)</span>
              </label>
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={config.showGroomSide !== false}
                  onChange={(e) => onChange({ showGroomSide: e.target.checked })}
                  className="w-4 h-4 rounded"
                />
                <span>Nhà trai (chú rể)</span>
              </label>
            </div>
          </div>

          {/* Bride Side Info */}
          {(config.showBrideSide !== false) && (
            <div className="border rounded-lg p-4 bg-pink-50/50">
              <h4 className="font-medium mb-3 text-pink-700">Thông tin nhà gái</h4>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Thông tin ngân hàng</label>
                  <input
                    type="text"
                    value={config.brideBankInfo || ''}
                    onChange={(e) => onChange({ brideBankInfo: e.target.value })}
                    placeholder="VD: MB Bank - 0123456789 - NGUYEN THI A"
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Link mã QR</label>
                  <input
                    type="text"
                    value={config.brideQR || ''}
                    onChange={(e) => onChange({ brideQR: e.target.value })}
                    placeholder="URL ảnh mã QR"
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Groom Side Info */}
          {(config.showGroomSide !== false) && (
            <div className="border rounded-lg p-4 bg-blue-50/50">
              <h4 className="font-medium mb-3 text-blue-700">Thông tin nhà trai</h4>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Thông tin ngân hàng</label>
                  <input
                    type="text"
                    value={config.groomBankInfo || ''}
                    onChange={(e) => onChange({ groomBankInfo: e.target.value })}
                    placeholder="VD: MB Bank - 0987654321 - NGUYEN VAN B"
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Link mã QR</label>
                  <input
                    type="text"
                    value={config.groomQR || ''}
                    onChange={(e) => onChange({ groomQR: e.target.value })}
                    placeholder="URL ảnh mã QR"
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                  />
                </div>
              </div>
            </div>
          )}

          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={config.showBankQR !== false}
              onChange={(e) => onChange({ showBankQR: e.target.checked })}
              className="w-4 h-4 rounded"
            />
            <span>Hiển thị mã QR ngân hàng</span>
          </label>

          <div>
            <label className="block text-sm text-gray-600 mb-2">Lời nhắn tùy chỉnh</label>
            <textarea
              value={config.customMessage || ''}
              onChange={(e) => onChange({ customMessage: e.target.value })}
              placeholder="VD: Mừng cưới được gửi trực tiếp đến cô dâu chú rể..."
              rows={2}
              className="w-full px-3 py-2 border rounded-lg text-sm"
            />
            <p className="text-xs text-gray-400 mt-1">Để trống để dùng lời nhắn mặc định</p>
          </div>
        </div>
      );

    default:
      return (
        <p className="text-sm text-gray-500">Section này không có tùy chỉnh thêm.</p>
      );
  }
}

function getSectionIcon(type: string): string {
  const icons: Record<string, string> = {
    hero: '🎯',
    story: '📖',
    event: '📅',
    rsvp: '✉️',
    gallery: '🖼️',
    countdown: '⏰',
    map: '🗺️',
    music: '🎵',
    gift: '🎁',
  };
  return icons[type] || '📦';
}
