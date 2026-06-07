import { Link } from 'react-router-dom';
import TemplateCard from '../components/TemplateCard';
import { TEMPLATE_OPTIONS } from '../components/invitation-editor/types';

function IconHeart({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
    </svg>
  );
}

function IconLayout({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
    </svg>
  );
}

function IconImage({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
    </svg>
  );
}

function IconCalendar({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5m-9-6h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
    </svg>
  );
}

function IconMapPin({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
    </svg>
  );
}

function IconMusic({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 9l10.5-3m0 6.553v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 11-.99-3.467l2.31-.66a2.25 2.25 0 001.632-2.163zm0 0V2.25L9 5.25v10.303m0 0v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 01-.99-3.467l2.31-.66A2.25 2.25 0 009 15.553z" />
    </svg>
  );
}

function IconUsers({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
    </svg>
  );
}

function IconGift({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 11.25v8.25a1.5 1.5 0 01-1.5 1.5H5.25a1.5 1.5 0 01-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 109.375 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 1114.625 7.5H12m0 0V21m-8.625-9.75h18c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125h-18c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
    </svg>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-[80rem] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <IconHeart className="w-6 h-6 text-rose-500" />
            <span className="font-display text-xl font-semibold text-gray-900">WedLove</span>
          </div>
          <Link
            to="/login"
            className="px-5 py-2 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors"
          >
            Đăng nhập
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-rose-50 via-white to-pink-50" />
        <div className="relative max-w-[80rem] mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32 text-center">
          <h1 className="font-display text-4xl md:text-6xl font-bold text-gray-900 leading-tight mb-6">
            Thiệp cưới online
            <br />
            <span className="text-rose-500">dành cho bạn</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-[42rem] mx-auto mb-10">
            Tạo thiệp cưới điện tử đẹp mắt, gửi lời mời dễ dàng và quản lý khách mời
            — tất cả trong một nền tảng.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/login"
              className="px-8 py-3.5 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 transition-colors text-lg"
            >
              Bắt đầu miễn phí
            </Link>
            <a
              href="#features"
              className="px-8 py-3.5 bg-white text-gray-900 border border-gray-200 rounded-xl font-medium hover:bg-gray-50 transition-colors text-lg"
            >
              Tìm hiểu thêm
            </a>
          </div>
        </div>
      </section>

      {/* Trust strip */}
      <section className="py-8 border-y border-gray-100 bg-white">
        <div className="max-w-[64rem] mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div>
            <div className="text-2xl md:text-3xl font-display font-bold text-gray-900">5</div>
            <div className="text-xs md:text-sm text-gray-500 mt-1">Mẫu thiệp đẹp</div>
          </div>
          <div>
            <div className="text-2xl md:text-3xl font-display font-bold text-gray-900">12+</div>
            <div className="text-xs md:text-sm text-gray-500 mt-1">Loại section</div>
          </div>
          <div>
            <div className="text-2xl md:text-3xl font-display font-bold text-gray-900">QR</div>
            <div className="text-xs md:text-sm text-gray-500 mt-1">Mời từng khách</div>
          </div>
          <div>
            <div className="text-2xl md:text-3xl font-display font-bold text-rose-500">Miễn phí</div>
            <div className="text-xs md:text-sm text-gray-500 mt-1">Dùng thử không giới hạn</div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 bg-gray-50">
        <div className="max-w-[80rem] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl font-bold text-gray-900 mb-4">
              Mọi thứ bạn cần cho đám cưới
            </h2>
            <p className="text-gray-600 text-lg max-w-[42rem] mx-auto">
              WedLove cung cấp đầy đủ công cụ để bạn tạo và quản lý thiệp cưới một cách chuyên nghiệp.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={<IconLayout className="w-6 h-6" />}
              title="Mẫu thiệp đa dạng"
              description="Chọn từ nhiều mẫu thiệp đẹp với các phong cách cinematic, vintage, modern, minimal."
            />
            <FeatureCard
              icon={<IconImage className="w-6 h-6" />}
              title="Album ảnh cưới"
              description="Chia sẻ album ảnh cưới với giao diện gallery đẹp mắt và dễ duyệt."
            />
            <FeatureCard
              icon={<IconCalendar className="w-6 h-6" />}
              title="Đếm ngược ngày cưới"
              description="Thêm countdown timer để mọi người cùng háo hức chờ đón ngày trọng đại."
            />
            <FeatureCard
              icon={<IconMapPin className="w-6 h-6" />}
              title="Bản đồ sự kiện"
              description="Tích hợp bản đồ địa điểm để khách mời dễ dàng tìm đường đến đám cưới."
            />
            <FeatureCard
              icon={<IconMusic className="w-6 h-6" />}
              title="Nhạc nền"
              description="Thêm bài hát yêu thích để tạo không khí lãng mạn cho thiệp cưới."
            />
            <FeatureCard
              icon={<IconUsers className="w-6 h-6" />}
              title="Quản lý khách mời"
              description="Theo dõi danh sách khách mời, phản hồi tham dự và thống kê dễ dàng."
            />
          </div>
        </div>
      </section>

      {/* Template Gallery */}
      <section id="templates" className="py-20">
        <div className="max-w-[80rem] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              5 mẫu thiệp đẹp, sẵn sàng dùng
            </h2>
            <p className="text-gray-600 text-lg max-w-[42rem] mx-auto">
              Mỗi mẫu có bố cục section, màu sắc và font chữ riêng — click vào
              bất kỳ mẫu nào để xem thử trước khi tạo thiệp của bạn.
            </p>
          </div>
          <div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            data-testid="template-grid"
          >
            {TEMPLATE_OPTIONS.map((template) => (
              <TemplateCard key={template.id} template={template} />
            ))}
          </div>
          <p className="text-center text-sm text-gray-500 mt-8">
            Bạn có thể đổi mẫu bất cứ lúc nào trong editor — không ảnh hưởng đến dữ liệu đã nhập.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="max-w-[56rem] mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-gray-900 rounded-3xl px-8 py-16 md:px-16 md:py-20">
            <IconGift className="w-12 h-12 text-rose-400 mx-auto mb-6" />
            <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-4">
              Sẵn sàng cho đám cưới của bạn?
            </h2>
            <p className="text-gray-300 text-lg mb-10 max-w-[36rem] mx-auto">
              Tạo thiệp cưới miễn phí ngay hôm nay và chia sẻ niềm hạnh phúc với mọi người.
            </p>
            <Link
              to="/login"
              className="inline-block px-8 py-3.5 bg-rose-500 text-white rounded-xl font-medium hover:bg-rose-600 transition-colors text-lg"
            >
              Tạo thiệp cưới ngay
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-8">
        <div className="max-w-[80rem] mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-500 text-sm">
          <div className="flex items-center justify-center gap-2 mb-2">
            <IconHeart className="w-4 h-4 text-rose-500" />
            <span className="font-display font-medium text-gray-900">WedLove</span>
          </div>
          <p>Thiệp cưới online dành cho cặp đôi Việt Nam</p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-lg transition-shadow">
      <div className="w-12 h-12 bg-rose-50 rounded-xl flex items-center justify-center text-rose-500 mb-4">
        {icon}
      </div>
      <h3 className="font-medium text-gray-900 text-lg mb-2">{title}</h3>
      <p className="text-gray-600 text-sm leading-relaxed">{description}</p>
    </div>
  );
}
