import logo from '@/assets/images/bid-market.png';

export default function AboutHero() {
  return (
    <section className="mx-auto max-w-3xl space-y-6 text-center">
      <div className="flex items-center justify-center gap-3">
        <img src={logo} alt="Bid Market logo" className="h-12 w-auto" />
        <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
          Bid Market
        </h1>
      </div>
      <p className="text-muted-foreground text-lg leading-relaxed">
        A modern online auction platform for bidding and selling items in real
        time.
      </p>
    </section>
  );
}
