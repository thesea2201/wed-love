import { PrismaClient } from '../src/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import bcrypt from 'bcryptjs';
import 'dotenv/config';

const pool = new pg.Pool({
  host: 'localhost',
  port: 5432,
  database: 'wedlove',
  user: 'wedlove',
  password: 'wedlove123',
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const cinematicSections = [
  { id: 's1', type: 'hero', order: 0, visible: true, config: { showCountdown: true, parallax: true, greetingStyle: 'formal' } },
  { id: 's2', type: 'story', order: 1, visible: true, config: { layout: 'split', imagePosition: 'left' } },
  { id: 's3', type: 'event', order: 2, visible: true, config: { showDressCode: true, dressCodeText: 'Áo dài / Vest', showReception: true } },
  { id: 's4', type: 'gallery', order: 3, visible: true, config: { columns: 3, lightbox: true, allowGuestUpload: false } },
  { id: 's5', type: 'rsvp', order: 4, visible: true, config: { showDietary: true, dietaryOptions: ['Ăn chay', 'Dị ứng đậu phộng', 'Dị ứng hải sản'], maxAttendees: 5 } },
  { id: 's6', type: 'map', order: 5, visible: true, config: {} },
  { id: 's7', type: 'gift', order: 6, visible: true, config: { methods: ['momo', 'bank_transfer'], showBankQR: true, customMessage: '' } },
];

async function main() {
  console.log('Seeding database...');

  const hashedPassword = await bcrypt.hash('123456', 12);

  const user = await prisma.user.upsert({
    where: { email: 'demo@wedlove.pro' },
    update: {},
    create: {
      email: 'demo@wedlove.pro',
      password: hashedPassword,
      groomName: 'An',
      brideName: 'Linh',
      weddingDate: new Date('2026-06-15'),
      role: 'couple',
      plan: 'free',
    },
  });

  console.log(`Created user: ${user.email}`);

  const invitation = await prisma.invitation.upsert({
    where: { slug: 'an-va-linh-demo' },
    update: { sections: cinematicSections as any },
    create: {
      userId: user.id,
      slug: 'an-va-linh-demo',
      template: 'cinematic',
      title: 'An & Linh',
      subtitle: 'Cùng hai bên gia đình',
      primaryColor: '#c8956c',
      secondaryColor: '#f5f0eb',
      fontFamily: 'Playfair Display',
      groomName: user.groomName,
      brideName: user.brideName,
      weddingDate: user.weddingDate,
      venue: 'Trống Đồng Palace',
      venueAddress: '135A Nguyễn Hữu Cảnh, Quận 1, TP.HCM',
      ceremonyTime: '9:00 sáng',
      receptionTime: '6:00 chiều',
      story: 'Chúng tôi gặp nhau lần đầu tiên một buổi chiều mưa ở quán cà phê quen thuộc. Ly cà phê đổ nhẹ đã bắt đầu một câu chuyện kéo dài đến tận khi quán đóng cửa.\n\nBa năm sau, trên đỉnh núi lúc hoàng hôn, anh đã quỳ xuống. Chị đáp lời trước khi anh kịp hỏi xong.\n\n"Trong cả thế giới này, không có trái tim nào dành cho em như trái tim anh. Trong cả thế giới này, không có tình yêu nào dành cho anh như tình yêu em."',
      coverPhoto: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=1920',
      sections: cinematicSections as any,
      status: 'published',
      isPublished: true,
      publishedAt: new Date(),
    },
  });

  console.log(`Created invitation: ${invitation.slug}`);

  await prisma.guest.deleteMany({ where: { invitationId: invitation.id } });

  const guests = [
    { name: 'Chị Linh', email: 'linh@email.com', customMessage: 'Cảm ơn chị Linh đã đồng hành cùng tụi em. Chị là người bạn thân nhất!', sharedPhoto: 'https://images.unsplash.com/photo-1522673607200-1645062cd958?w=800', relationship: 'Bạn thân' },
    { name: 'Anh Minh', email: 'minh@email.com', customMessage: null, relationship: 'Đồng nghiệp' },
    { name: 'Cô Hoa', phone: '0901234567', customMessage: 'Cô là người đã nuôi dậy chú rể từ nhỏ. Rất mong cô sẽ có mặt!', relationship: 'Cô ruột' },
    { name: 'Chú Tùng', phone: '0912345678', customMessage: null, relationship: 'Chú ruột' },
    { name: 'Bạn Hùng', email: 'hung@email.com', customMessage: 'Hùng ơi, nhớ mang theo cây guitar nhé! Nhạc sống không thể thiếu bạn!', relationship: 'Bạn đại học' },
  ];

  for (const g of guests) {
    const token = Math.random().toString(36).substring(2) + Date.now().toString(36);
    await prisma.guest.create({
      data: {
        invitationId: invitation.id,
        token,
        name: g.name,
        email: g.email || null,
        phone: g.phone || null,
        customMessage: g.customMessage,
        sharedPhoto: g.sharedPhoto || null,
        relationship: g.relationship || null,
      },
    });
  }

  console.log(`Created ${guests.length} guests`);
  console.log('\n--- Thông tin đăng nhập ---');
  console.log('Email: demo@wedlove.pro');
  console.log('Mật khẩu: 123456');
  console.log('Slug thiệp: an-va-linh-demo');
  console.log('------------------------\n');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
