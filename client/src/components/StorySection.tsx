import { motion } from 'framer-motion';

interface Props {
  story?: string;
}

export default function StorySection({ story }: Props) {
  return (
    <section className="py-24 px-4 bg-white">
      <div className="max-w-4xl mx-auto text-center">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="font-display text-4xl mb-8"
        >
          Our Story
        </motion.h2>
        
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="grid md:grid-cols-2 gap-8 items-center"
        >
          <div className="aspect-[3/4] rounded-2xl overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1522673607200-1645062cd958?w=800"
              alt="Couple"
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
                  We first met in the most unexpected way. It was a rainy Tuesday afternoon at our favorite coffee shop. 
                  An accidentally spilled latte led to a conversation that lasted until the shop closed.
                </p>
                <p className="text-gray-600 leading-relaxed">
                  Three years later, on a mountaintop at sunset, he got down on one knee. 
                  She said yes before he even finished asking.
                </p>
                <p className="text-gray-600 leading-relaxed italic">
                  "In all the world, there is no heart for me like yours. In all the world, there is no love for you like mine."
                </p>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
