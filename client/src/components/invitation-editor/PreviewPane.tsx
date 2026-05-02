import { useEffect, useRef, useState, useCallback } from 'react';
import type { PreviewPaneProps } from './types';

type DeviceSize = 'mobile' | 'tablet' | 'desktop';

const DEVICE_SIZES: Record<DeviceSize, { width: string; label: string; icon: string }> = {
  mobile: { width: '375px', label: 'Mobile', icon: '📱' },
  tablet: { width: '768px', label: 'Tablet', icon: '📟' },
  desktop: { width: '100%', label: 'Desktop', icon: '🖥️' },
};

export default function PreviewPane({ draft, originalSlug }: PreviewPaneProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [iframeSrc, setIframeSrc] = useState<string>('about:blank');
  const [deviceSize, setDeviceSize] = useState<DeviceSize>('mobile');
  const isInitialized = useRef(false);

  // Initial load - set iframe src once
  useEffect(() => {
    if (!draft || !originalSlug || isInitialized.current) return;

    const draftData = encodeURIComponent(JSON.stringify(draft));
    const previewUrl = `/invitation/${originalSlug}?preview=true#draft=${draftData}`;
    setIframeSrc(previewUrl);
    isInitialized.current = true;
  }, [draft, originalSlug]);

  // Subsequent updates - use postMessage for real-time sync
  useEffect(() => {
    if (!draft || !isInitialized.current) return;

    const timer = setTimeout(() => {
      const iframe = iframeRef.current;
      if (iframe?.contentWindow) {
        iframe.contentWindow.postMessage(
          { type: 'WEDLOVE_PREVIEW_UPDATE', data: draft },
          window.location.origin
        );
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [draft]);

  // Force reload preview
  const handleRefresh = useCallback(() => {
    if (!draft || !originalSlug) return;
    const draftData = encodeURIComponent(JSON.stringify(draft));
    const previewUrl = `/invitation/${originalSlug}?preview=true#draft=${draftData}`;
    setIframeSrc(previewUrl);
  }, [draft, originalSlug]);

  if (!originalSlug) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-100 rounded-xl">
        <p className="text-gray-500">Đang tải...</p>
      </div>
    );
  }

  const isReady = iframeSrc !== 'about:blank';
  const currentDevice = DEVICE_SIZES[deviceSize];

  return (
    <div className="h-full flex flex-col bg-gray-100 rounded-xl overflow-hidden">
      {/* Preview Header */}
      <div className="bg-white px-3 py-2.5 border-b flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="flex gap-1.5 shrink-0">
            <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
            <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
          </div>
          <span className="text-xs text-gray-500 font-mono truncate">{originalSlug}.wedlove.pro</span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {/* Device Size Toggle */}
          {(Object.keys(DEVICE_SIZES) as DeviceSize[]).map((size) => (
            <button
              key={size}
              onClick={() => setDeviceSize(size)}
              className={`text-xs px-1.5 py-1 rounded transition-colors ${
                deviceSize === size
                  ? 'bg-gray-900 text-white'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
              title={DEVICE_SIZES[size].label}
            >
              {DEVICE_SIZES[size].icon}
            </button>
          ))}

          {/* Refresh */}
          <button
            onClick={handleRefresh}
            className="text-xs text-gray-400 hover:text-gray-600 px-1.5 py-1"
            title="Tải lại preview"
          >
            🔄
          </button>

          {/* Status Indicator */}
          <span className="relative flex h-2 w-2">
            {isReady ? (
              <>
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
              </>
            ) : (
              <span className="relative inline-flex rounded-full h-2 w-2 bg-yellow-500" />
            )}
          </span>
        </div>
      </div>

      {/* Preview Iframe */}
      <div className="flex-1 p-2 md:p-4 flex items-start justify-center overflow-auto">
        <div
          className="bg-white rounded-lg shadow-lg overflow-hidden relative transition-all duration-300"
          style={{
            width: currentDevice.width,
            maxWidth: '100%',
            height: '100%',
          }}
        >
          {!isReady && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-50 z-10">
              <div className="flex flex-col items-center gap-3 text-gray-500">
                <div className="w-8 h-8 border-2 border-gray-300 border-t-primary rounded-full animate-spin" />
                <span className="text-sm">Đang tải preview...</span>
              </div>
            </div>
          )}
          <iframe
            ref={iframeRef}
            src={iframeSrc}
            className="w-full h-full border-0"
            title="Preview"
            sandbox="allow-same-origin allow-scripts"
          />
        </div>
      </div>
    </div>
  );
}
