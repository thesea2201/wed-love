import { motion } from 'framer-motion';
import { SECTION_TYPE_LABELS } from '../../utils/sections';
import type { SectionProps } from '../../types';

export default function LivestreamSection({ invitation }: SectionProps) {
  const primaryColor = invitation.primaryColor || '#c8956c';
  const label = SECTION_TYPE_LABELS.livestream.nameVi;

  return (
    <section
      className="py-12 md:py-24 px-3 md:px-4 bg-white"
      data-skeleton="true"
    >
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="w-full mx-auto text-center"
      >
        <h2
          className="font-display text-2xl md:text-4xl mb-3 md:mb-4"
          style={{ color: primaryColor }}
        >
          {label}
        </h2>
        <p className="text-gray-500 text-sm md:text-base">
          Tính năng đang phát triển. Sẽ sớm ra mắt.
        </p>
      </motion.div>
    </section>
  );
}
