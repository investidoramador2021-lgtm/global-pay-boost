const stats = [
  { value: "500+", label: "Cryptocurrencies" },
  { value: "<60s", label: "Avg. Settlement" },
  { value: "0", label: "Hidden Fees" },
  { value: "24/7", label: "Uptime" },
];

const TrustBanner = () => {
  return (
    <section className="bg-hero-gradient py-8 sm:py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 gap-4 sm:gap-8 lg:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="font-display text-2xl font-extrabold text-primary-foreground sm:text-3xl lg:text-4xl">
                {stat.value}
              </div>
              <div className="mt-0.5 font-body text-xs text-primary-foreground/70 sm:mt-1 sm:text-sm">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrustBanner;
