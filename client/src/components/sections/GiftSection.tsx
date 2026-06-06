import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import type { SectionProps } from '../../types';

interface Bank {
  id: string;
  name: string;
  code: string;
  shortName: string;
  logo: string;
}

const VIETQR_BANKS: Bank[] = [
  { id: '970415', name: 'Ngân hàng TMCP Công Thương Việt Nam', code: 'ICB', shortName: 'VietinBank', logo: 'https://api.vietqr.io/img/ICB.png' },
  { id: '970436', name: 'Ngân hàng TMCP Ngoại Thương Việt Nam', code: 'VCB', shortName: 'Vietcombank', logo: 'https://api.vietqr.io/img/VCB.png' },
  { id: '970418', name: 'Ngân hàng TMCP Đầu tư và Phát triển Việt Nam', code: 'BIDV', shortName: 'BIDV', logo: 'https://api.vietqr.io/img/BIDV.png' },
  { id: '970405', name: 'Ngân hàng Nông nghiệp và Phát triển Nông thôn Việt Nam', code: 'VBA', shortName: 'Agribank', logo: 'https://api.vietqr.io/img/VBA.png' },
  { id: '970448', name: 'Ngân hàng TMCP Phát triển Thành phố Hồ Chí Minh', code: 'HDB', shortName: 'HDBank', logo: 'https://api.vietqr.io/img/HDB.png' },
  { id: '970422', name: 'Ngân hàng TMCP Quân Đội', code: 'MB', shortName: 'MB Bank', logo: 'https://api.vietqr.io/img/MB.png' },
  { id: '970416', name: 'Ngân hàng TMCP Á Châu', code: 'ACB', shortName: 'ACB', logo: 'https://api.vietqr.io/img/ACB.png' },
  { id: '970432', name: 'Ngân hàng TMCP Việt Nam Thịnh Vượng', code: 'VPB', shortName: 'VPBank', logo: 'https://api.vietqr.io/img/VPB.png' },
  { id: '970437', name: 'Ngân hàng TMCP Phương Đông', code: 'OCB', shortName: 'OCB', logo: 'https://api.vietqr.io/img/OCB.png' },
  { id: '970441', name: 'Ngân hàng TMCP Sài Gòn Thương Tín', code: 'STB', shortName: 'Sacombank', logo: 'https://api.vietqr.io/img/STB.png' },
  { id: '970440', name: 'Ngân hàng TMCP Tiên Phong', code: 'TPB', shortName: 'TPBank', logo: 'https://api.vietqr.io/img/TPB.png' },
  { id: '970423', name: 'Ngân hàng TMCP Kỹ Thương Việt Nam', code: 'TCB', shortName: 'Techcombank', logo: 'https://api.vietqr.io/img/TCB.png' },
  { id: '970425', name: 'Ngân hàng TMCP Quốc Tế Việt Nam', code: 'VIB', shortName: 'VIB', logo: 'https://api.vietqr.io/img/VIB.png' },
  { id: '970429', name: 'Ngân hàng TMCP Sài Gòn', code: 'SCB', shortName: 'SCB', logo: 'https://api.vietqr.io/img/SCB.png' },
  { id: '970443', name: 'Ngân hàng TMCP An Bình', code: 'ABB', shortName: 'ABBANK', logo: 'https://api.vietqr.io/img/ABB.png' },
  { id: '970454', name: 'Ngân hàng TMCP Bản Việt', code: 'VCCB', shortName: 'VietCapital Bank', logo: 'https://api.vietqr.io/img/VCCB.png' },
  { id: '970449', name: 'Ngân hàng TMCP Bưu Điện Liên Việt', code: 'LPB', shortName: 'LienVietPostBank', logo: 'https://api.vietqr.io/img/LPB.png' },
  { id: '970457', name: 'Ngân hàng TMCP Đại Chúng Việt Nam', code: 'PVCB', shortName: 'PVcomBank', logo: 'https://api.vietqr.io/img/PVCB.png' },
  { id: '970438', name: 'Ngân hàng TMCP Đông Nam Á', code: 'SEAB', shortName: 'SeABank', logo: 'https://api.vietqr.io/img/SEAB.png' },
  { id: '970406', name: 'Ngân hàng TMCP Đông Á', code: 'DAB', shortName: 'DongA Bank', logo: 'https://api.vietqr.io/img/DAB.png' },
  { id: '970458', name: 'Ngân hàng TMCP Kiên Long', code: 'KLB', shortName: 'Kienlongbank', logo: 'https://api.vietqr.io/img/KLB.png' },
  { id: '970455', name: 'Ngân hàng TMCP Nam Á', code: 'NAB', shortName: 'Nam A Bank', logo: 'https://api.vietqr.io/img/NAB.png' },
  { id: '970419', name: 'Ngân hàng TMCP Quốc Dân', code: 'NCB', shortName: 'NCB', logo: 'https://api.vietqr.io/img/NCB.png' },
  { id: '970400', name: 'Ngân hàng TMCP Sài Gòn Công Thương', code: 'SGB', shortName: 'Saigonbank', logo: 'https://api.vietqr.io/img/SGB.png' },
  { id: '970403', name: 'Ngân hàng TMCP Xuất Nhập Khẩu Việt Nam', code: 'EIB', shortName: 'Eximbank', logo: 'https://api.vietqr.io/img/EIB.png' },
  { id: '970442', name: 'Ngân hàng TMCP Việt Á', code: 'VAB', shortName: 'VietABank', logo: 'https://api.vietqr.io/img/VAB.png' },
  { id: '970433', name: 'Ngân hàng TMCP Việt Bank', code: 'VBB', shortName: 'VietBank', logo: 'https://api.vietqr.io/img/VBB.png' },
];

function generateVietQRUrl(bankCode: string, accountNumber: string, amount = 0, description = '') {
  // Using compact template for clean QR
  return `https://img.vietqr.io/image/${bankCode}-${accountNumber}-compact.png?amount=${amount}&addInfo=${encodeURIComponent(description)}`;
}

function BankCard({ bankId, accountNumber, accountName, compact = false }: { bankId: string; accountNumber: string; accountName: string; compact?: boolean }) {
  const [copied, setCopied] = useState(false);
  const [downloaded, setDownloaded] = useState(false);
  const bank = VIETQR_BANKS.find(b => b.id === bankId || b.code === bankId);
  const qrUrl = generateVietQRUrl(bank?.code || bankId, accountNumber);

  const copyAccount = async () => {
    try {
      await navigator.clipboard.writeText(accountNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const downloadQR = async () => {
    try {
      const response = await fetch(qrUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `qr-${accountNumber}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      setDownloaded(true);
      setTimeout(() => setDownloaded(false), 2000);
    } catch (err) {
      console.error('Failed to download QR:', err);
    }
  };

  return (
    <div className={`bg-white rounded-xl ${compact ? 'p-3' : 'p-4'} shadow-sm`}>
      {/* Bank Info Header */}
      <div className="flex items-center gap-3 mb-3">
        {bank && (
          <img src={bank.logo} alt={bank.shortName} className={`object-contain ${compact ? 'w-8 h-8' : 'w-10 h-10'}`} />
        )}
        <div className="flex-1 min-w-0">
          <p className={`font-semibold text-gray-900 truncate ${compact ? 'text-sm' : 'text-base'}`}>
            {accountName}
          </p>
          <p className="text-xs text-gray-500 truncate">
            {bank?.shortName || bank?.name || 'Ngân hàng'}
          </p>
        </div>
      </div>

      {/* Account Number with Copy */}
      <div className={`flex items-center justify-between bg-gray-50 rounded-lg ${compact ? 'px-2 py-1.5 mb-3' : 'px-3 py-2 mb-4'}`}>
        <span className={`font-mono text-gray-700 ${compact ? 'text-sm' : 'text-base'}`}>{accountNumber}</span>
        <button
          onClick={copyAccount}
          className={`text-xs flex items-center gap-1 transition-colors ${
            copied 
              ? 'text-green-600 font-medium' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
          title={copied ? 'Đã sao chép!' : 'Sao chép số tài khoản'}
        >
          {copied ? (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Đã sao chép</span>
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <span className="hidden sm:inline">Sao chép</span>
            </>
          )}
        </button>
      </div>

      {/* QR Code */}
      <div className="text-center">
        <img
          src={qrUrl}
          alt="VietQR"
          className={`mx-auto object-contain rounded-lg border ${compact ? 'w-32 h-32' : 'w-40 h-40'}`}
        />
        <button
          onClick={downloadQR}
          className={`mt-2 flex items-center gap-1 mx-auto transition-colors ${
            downloaded 
              ? 'text-green-600 font-medium' 
              : 'text-gray-500 hover:text-gray-700'
          } ${compact ? 'text-[10px]' : 'text-xs'}`}
        >
          {downloaded ? (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Đã tải về</span>
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              <span>Tải QR về</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}

export default function GiftSection({ config, invitation }: SectionProps) {
  const {
    customMessage = '',
    showBrideSide = true,
    showGroomSide = true,
    brideBankId = '',
    brideAccountNumber = '',
    brideAccountName = '',
    groomBankId = '',
    groomAccountNumber = '',
    groomAccountName = '',
    displayMode = 'inline',
  } = config;

  const [activeTab, setActiveTab] = useState<'bride' | 'groom'>('bride');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const giftMessage = customMessage || `Mừng cưới ${invitation.groomName} & ${invitation.brideName}`;
  const primaryColor = invitation.primaryColor || '#c8956c';
  const secondaryColor = invitation.secondaryColor || '#f5f0eb';

  // If only one side is shown, don't show tabs
  const showTabs = showBrideSide && showGroomSide;
  const hasBrideInfo = brideBankId && brideAccountNumber && brideAccountName;
  const hasGroomInfo = groomBankId && groomAccountNumber && groomAccountName;

  // Determine which side to show based on activeTab and visibility settings
  // When tabs are hidden (only one side shown), ignore activeTab
  const shouldShowBride = showTabs
    ? activeTab === 'bride'
    : showBrideSide;
  const shouldShowGroom = showTabs
    ? activeTab === 'groom'
    : showGroomSide;

  const GiftContent = ({ compact = false }: { compact?: boolean }) => (
    <>
      {/* Side Selection Tabs */}
      {showTabs && (
        <div className={`flex rounded-lg p-1 ${compact ? 'mb-3' : 'mb-4 md:mb-6'}`} style={{ backgroundColor: secondaryColor }}>
          <button
            onClick={() => setActiveTab('bride')}
            className={`flex-1 py-2 px-2 rounded-md text-xs font-medium transition-all truncate ${compact ? '' : 'md:px-4 md:text-sm'}`}
            style={{
              backgroundColor: activeTab === 'bride' ? primaryColor : 'transparent',
              color: activeTab === 'bride' ? '#ffffff' : '#374151',
            }}
          >
            Nhà gái
          </button>
          <button
            onClick={() => setActiveTab('groom')}
            className={`flex-1 py-2 px-2 rounded-md text-xs font-medium transition-all truncate ${compact ? '' : 'md:px-4 md:text-sm'}`}
            style={{
              backgroundColor: activeTab === 'groom' ? primaryColor : 'transparent',
              color: activeTab === 'groom' ? '#ffffff' : '#374151',
            }}
          >
            Nhà trai
          </button>
        </div>
      )}

      {/* Gift Content - Bank Transfer Only */}
      <div className={compact ? 'space-y-3' : 'space-y-4'}>
        {/* Bride Side */}
        {shouldShowBride && hasBrideInfo && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className={`rounded-2xl overflow-hidden ${compact ? 'p-3' : 'p-3 md:p-6'}`}
            style={{ backgroundColor: `${primaryColor}10` }}
          >
            <div className={`flex items-center gap-2 ${compact ? 'mb-3' : 'mb-4'}`}>
              <span className={compact ? 'text-lg' : 'text-lg md:text-2xl'}>👰</span>
              <h3 className={`font-semibold text-sm truncate ${compact ? '' : 'md:text-base'}`}>Nhà gái - {invitation.brideName}</h3>
            </div>
            <BankCard
              bankId={brideBankId}
              accountNumber={brideAccountNumber}
              accountName={brideAccountName}
              compact={compact}
            />
          </motion.div>
        )}

        {/* Groom Side */}
        {shouldShowGroom && hasGroomInfo && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className={`rounded-2xl overflow-hidden ${compact ? 'p-3' : 'p-3 md:p-6'}`}
            style={{ backgroundColor: `${primaryColor}10` }}
          >
            <div className={`flex items-center gap-2 ${compact ? 'mb-3' : 'mb-4'}`}>
              <span className={compact ? 'text-lg' : 'text-lg md:text-2xl'}>🤵</span>
              <h3 className={`font-semibold text-sm truncate ${compact ? '' : 'md:text-base'}`}>Nhà trai - {invitation.groomName}</h3>
            </div>
            <BankCard
              bankId={groomBankId}
              accountNumber={groomAccountNumber}
              accountName={groomAccountName}
              compact={compact}
            />
          </motion.div>
        )}
      </div>

      {/* Fallback message */}
      {!hasBrideInfo && !hasGroomInfo && (
        <p className="text-center text-gray-500 py-8">
          Thông tin ngân hàng chưa được cập nhật.
        </p>
      )}
    </>
  );

  // Modal Mode: show floating gift button
  if (displayMode === 'modal') {
    return (
      <>
        {/* Floating Gift Button */}
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          onClick={() => setIsModalOpen(true)}
          className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full shadow-lg flex items-center justify-center text-2xl"
          style={{ backgroundColor: primaryColor }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          🎁
        </motion.button>

        {/* Modal */}
        <AnimatePresence>
          {isModalOpen && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsModalOpen(false)}
                className="fixed inset-0 bg-black/50 z-50"
              />
              {/* Bottom Sheet Modal */}
              <motion.div
                initial={{ opacity: 0, y: '100%' }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                drag="y"
                dragConstraints={{ top: 0, bottom: 100 }}
                dragElastic={0.2}
                onDragEnd={(_, info) => {
                  if (info.offset.y > 80 || info.velocity.y > 300) {
                    setIsModalOpen(false);
                  }
                }}
                className="fixed bottom-0 left-0 right-0 md:left-1/2 md:-translate-x-1/2 md:bottom-auto md:top-1/2 md:-translate-y-1/2 md:w-full md:max-w-sm md:rounded-2xl h-[60%] md:h-auto bg-white rounded-t-2xl z-50 flex flex-col shadow-2xl touch-none"
              >
                {/* Drag Handle - larger touch area */}
                <div
                  onClick={() => setIsModalOpen(false)}
                  className="flex flex-col items-center pt-2 pb-2 cursor-pointer"
                >
                  <div className="w-10 h-1 bg-gray-300 rounded-full" />
                  <div className="w-20 h-4 -mt-2" aria-hidden="true" />
                </div>
                {/* Header */}
                <div className="flex items-center justify-between px-4 pb-3 border-b">
                  <div>
                    <h2 className="font-display text-lg">Mừng Cưới</h2>
                    <p className="text-gray-500 text-xs">{giftMessage}</p>
                  </div>
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-500 text-sm"
                  >
                    ✕
                  </button>
                </div>
                {/* Compact Content - no scroll */}
                <div className="p-4 overflow-hidden">
                  <GiftContent compact />
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </>
    );
  }

  // Inline Mode (default)
  return (
    <section className="py-12 md:py-24 px-3 md:px-4 bg-white">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="w-full mx-auto"
      >
        <div className="text-center mb-6 md:mb-8">
          <h2 className="font-display text-2xl md:text-4xl mb-2 md:mb-3">Mừng Cưới</h2>
          <p className="text-gray-500 text-sm md:text-base">{giftMessage}</p>
        </div>
        <GiftContent />
      </motion.div>
    </section>
  );
}

export { VIETQR_BANKS, generateVietQRUrl };

