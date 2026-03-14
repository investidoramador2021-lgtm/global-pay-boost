import { motion } from "framer-motion";

const stats = [
  { value: "500+", label: "Cryptocurrencies" },
  { value: "2 min", label: "Avg. Exchange Time" },
  { value: "0", label: "Hidden Fees" },
  { value: "24/7", label: "Support Available" },
];

const TrustBanner = () => {
  return (
    <section className="bg-hero-gradient py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: i * 0.08 }}
              className="text-center"
            >
              <div className="font-display text-3xl font-extrabold text-primary-foreground sm:text-4xl">
                {stat.value}
              </div>
              <div className="mt-1 font-body text-sm text-primary-foreground/70">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrustBanner;
