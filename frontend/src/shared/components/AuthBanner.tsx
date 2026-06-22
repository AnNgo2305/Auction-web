import authBannerImage from '@/assets/images/auth-banner.png';

interface PageBannerProps {
  title: string;
}

export default function PageBanner({ title }: PageBannerProps) {
  return (
    <section className="relative h-64 overflow-hidden md:h-80 lg:h-96">
      <img
        src={authBannerImage}
        alt={title}
        className="absolute inset-0 h-full w-full object-cover object-center"
      />
      <div className="absolute inset-0 bg-linear-to-r from-black/70 via-black/50 to-black/30" />
      <div className="relative z-10 flex h-full flex-col justify-start px-6 py-3 text-white md:px-10">
        <p className="text-3xl leading-tight font-bold md:text-2xl">{title}</p>
        <p className="mt-2 text-sm text-white/80 md:text-base">
          <span className="font-medium text-green-500">Home</span>
          <span className="mx-1">/</span>
          <span>{title}</span>
        </p>
      </div>
    </section>
  );
}
