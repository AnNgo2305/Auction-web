import FAQ from '@/features/about/components/FAQ';
import Feature from '@/features/about/components/Feature';
import Hero from '@/features/about/components/Hero';
import Purpose from '@/features/about/components/Purpose';
import TechStack from '@/features/about/components/TechStack';

export default function AboutPage() {
  return (
    <main className="container mx-auto space-y-24 py-16">
      <Hero />
      <Purpose />
      <Feature />
      <TechStack />
      <FAQ />
    </main>
  );
}
