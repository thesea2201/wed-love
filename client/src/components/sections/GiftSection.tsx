import { motion } from 'framer-motion';
import { useState } from 'react';
import type { SectionProps } from '../../types';

export default function GiftSection({ config, invitation }: SectionProps) {
  const {
    methods = ['bank_transfer'],
    showBankQR = true,
    customMessage = '',
    showBrideSide = true,
    showGroomSide = true,
    brideQR = '',
    groomQR = '',
    brideBankInfo = '',
    groomBankInfo = '',
  } = config;

  const [activeTab, setActiveTab] = useState<'bride' | 'groom'>('bride');

  const giftMessage = customMessage || `Mừng cưới ${invitation.groomName} & ${invitation.brideName}`;
  const primaryColor = invitation.primaryColor || '#c8956c';
  const secondaryColor = invitation.secondaryColor || '#f5f0eb';

  // If only one side is shown, don't show tabs
  const showTabs = showBrideSide && showGroomSide;
  const hasBrideInfo = brideQR || brideBankInfo;
  const hasGroomInfo = groomQR || groomBankInfo;

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

        {/* Side Selection Tabs */}
        {showTabs && (
          <div className="flex rounded-lg p-1 mb-4 md:mb-6" style={{ backgroundColor: secondaryColor }}>
            <button
              onClick={() => setActiveTab('bride')}
              className="flex-1 py-2 px-2 md:px-4 rounded-md text-xs md:text-sm font-medium transition-all truncate"
              style={{
                backgroundColor: activeTab === 'bride' ? primaryColor : 'transparent',
                color: activeTab === 'bride' ? '#ffffff' : '#374151',
              }}
            >
              Nhà gái
            </button>
            <button
              onClick={() => setActiveTab('groom')}
              className="flex-1 py-2 px-2 md:px-4 rounded-md text-xs md:text-sm font-medium transition-all truncate"
              style={{
                backgroundColor: activeTab === 'groom' ? primaryColor : 'transparent',
                color: activeTab === 'groom' ? '#ffffff' : '#374151',
              }}
            >
              Nhà trai
            </button>
          </div>
        )}

        {/* Gift Content */}
        <div className="space-y-4">
          {/* Bride Side */}
          {(activeTab === 'bride' || (!showTabs && showBrideSide)) && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="rounded-2xl p-3 md:p-6 overflow-hidden"
              style={{ backgroundColor: `${primaryColor}10` }}
            >
              <div className="flex items-center gap-2 mb-3 md:mb-4">
                <span className="text-lg md:text-2xl">👰</span>
                <h3 className="font-semibold text-sm md:text-base truncate">Nhà gái - {invitation.brideName}</h3>
              </div>

              {methods.includes('bank_transfer') && (
                <div className="mb-3 md:mb-4">
                  <p className="text-xs md:text-sm text-gray-600 mb-2 md:mb-3">Chuyển khoản ngân hàng</p>
                  {brideBankInfo && (
                    <p className="text-xs md:text-sm text-gray-700 mb-2 md:mb-3 bg-white/50 p-2 rounded break-all">{brideBankInfo}</p>
                  )}
                  {showBankQR && hasBrideInfo && (
                    <div className="bg-white rounded-xl p-2 md:p-4 text-center">
                      {brideQR ? (
                        <img src={brideQR} alt="QR Nhà gái" className="w-28 h-28 md:w-40 md:h-40 mx-auto object-contain" />
                      ) : (
                        <div className="w-28 h-28 md:w-40 md:h-40 mx-auto bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 text-xs md:text-sm">
                          Mã QR nhà gái
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {methods.includes('momo') && (
                <div className="bg-pink-50 rounded-xl p-3 md:p-4">
                  <h4 className="font-medium text-pink-700 mb-1 text-sm">Ví MoMo</h4>
                  <p className="text-xs md:text-sm text-pink-600">Quét mã QR MoMo để gửi mừng cưới</p>
                </div>
              )}
            </motion.div>
          )}

          {/* Groom Side */}
          {(activeTab === 'groom' || (!showTabs && showGroomSide)) && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="rounded-2xl p-3 md:p-6 overflow-hidden"
              style={{ backgroundColor: `${primaryColor}10` }}
            >
              <div className="flex items-center gap-2 mb-3 md:mb-4">
                <span className="text-lg md:text-2xl">🤵</span>
                <h3 className="font-semibold text-sm md:text-base truncate">Nhà trai - {invitation.groomName}</h3>
              </div>

              {methods.includes('bank_transfer') && (
                <div className="mb-3 md:mb-4">
                  <p className="text-xs md:text-sm text-gray-600 mb-2 md:mb-3">Chuyển khoản ngân hàng</p>
                  {groomBankInfo && (
                    <p className="text-xs md:text-sm text-gray-700 mb-2 md:mb-3 bg-white/50 p-2 rounded break-all">{groomBankInfo}</p>
                  )}
                  {showBankQR && hasGroomInfo && (
                    <div className="bg-white rounded-xl p-2 md:p-4 text-center">
                      {groomQR ? (
                        <img src={groomQR} alt="QR Nhà trai" className="w-28 h-28 md:w-40 md:h-40 mx-auto object-contain" />
                      ) : (
                        <div className="w-28 h-28 md:w-40 md:h-40 mx-auto bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 text-xs md:text-sm">
                          Mã QR nhà trai
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {methods.includes('momo') && (
                <div className="bg-pink-50 rounded-xl p-3 md:p-4">
                  <h4 className="font-medium text-pink-700 mb-1 text-sm">Ví MoMo</h4>
                  <p className="text-xs md:text-sm text-pink-600">Quét mã QR MoMo để gửi mừng cưới</p>
                </div>
              )}
            </motion.div>
          )}
        </div>

        {/* Fallback message */}
        {!showBrideSide && !showGroomSide && (
          <p className="text-center text-gray-500 py-8">
            Thông tin mừng cưới chưa được cập nhật.
          </p>
        )}
      </motion.div>
    </section>
  );
}
