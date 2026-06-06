import { motion } from 'framer-motion';
import type { SectionProps } from '../../types';

export default function StorySection({ config, invitation }: SectionProps) {
  const { layout = 'split', imagePosition = 'left' } = config;
  const story = invitation.story;
  const storyImage = config.imageUrl || invitation.gallery[0] || 'https://images.unsplash.com/photo-1519741497674-611481863552?w=800';
  const isSplit = layout === 'split';
  const isFull = layout === 'full';

  return (
    <section className="py-12 md:py-24 px-3 md:px-4 bg-white">
      <div className="w-full mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="font-display text-2xl md:text-4xl text-center mb-6 md:mb-8"
        >
          Câu Chuyện Tình Yêu
        </motion.h2>

        {isFull ? (
          // Full layout: stacked vertically, image on top, full width
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="space-y-8"
          >
            <div className="w-full aspect-[16/9] rounded-2xl overflow-hidden">
              <img
                src={storyImage}
                alt="Cặp đôi"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="text-left space-y-4">
              {story ? (
                story.split('\n').filter(Boolean).map((paragraph, i) => (
                  <p key={i} className="text-gray-600 leading-relaxed">{paragraph}</p>
                ))
              ) : (
                <>
                  <p className="text-gray-600 leading-relaxed">
                    Chúng tôi gặp nhau lần đầu tiên một cách thật tình cờ. Một buổi chiều mưa ở quán cà phê quen thuộc.
                    Ly cà phê đổ nhẹ đã bắt đầu một câu chuyện kéo dài đến tận khi quán đóng cửa.
                  </p>
                  <p className="text-gray-600 leading-relaxed">
                    Ba năm sau, trên đỉnh núi lúc hoàng hôn, anh đã quỳ xuống. Chị đáp lời trước khi anh kịp hỏi xong.
                  </p>
                  <p className="text-gray-600 leading-relaxed italic">
                    "Trong cả thế giới này, không có trái tim nào dành cho em như trái tim anh. Trong cả thế giới này, không có tình yêu nào dành cho anh như tình yêu em."
                  </p>
                </>
              )}
            </div>
          </motion.div>
        ) : (
          // Split layout: side by side on desktop
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className={`grid md:grid-cols-2 gap-8 items-center ${imagePosition === 'right' ? 'md:grid-flow-dense' : ''}`}
          >
            <div className={`aspect-[3/4] rounded-2xl overflow-hidden ${imagePosition === 'right' ? 'md:col-start-2' : ''}`}>
              <img
                src={storyImage}
                alt="Cặp đôi"
                className="w-full h-full object-cover"
              />
            </div>
            <div className={`text-left space-y-4 ${imagePosition === 'right' ? 'md:col-start-1 md:row-start-1' : ''}`}>
              {story ? (
                story.split('\n').filter(Boolean).map((paragraph, i) => (
                  <p key={i} className="text-gray-600 leading-relaxed">{paragraph}</p>
                ))
              ) : (
                <>
                  <p className="text-gray-600 leading-relaxed">
                    Chúng tôi gặp nhau lần đầu tiên một cách thật tình cờ. Một buổi chiều mưa ở quán cà phê quen thuộc.
                    Ly cà phê đổ nhẹ đã bắt đầu một câu chuyện kéo dài đến tận khi quán đóng cửa.
                  </p>
                  <p className="text-gray-600 leading-relaxed">
                    Ba năm sau, trên đỉnh núi lúc hoàng hôn, anh đã quỳ xuống. Chị đáp lời trước khi anh kịp hỏi xong.
                  </p>
                  <p className="text-gray-600 leading-relaxed italic">
                    "Trong cả thế giới này, không có trái tim nào dành cho em như trái tim anh. Trong cả thế giới này, không có tình yêu nào dành cho anh như tình yêu em."
                  </p>
                </>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
}
