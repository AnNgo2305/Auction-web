import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/shared/ui/carousel';
import { Card } from '@/shared/ui/card';
import feSlide from '@/assets/images/fe.png';
import beSlide from '@/assets/images/be.png';
import dbSlide from '@/assets/images/db.png';
import architectureSlide from '@/assets/images/architecture.png';
import infraSlide from '@/assets/images/infra.png';

export default function AboutPurpose() {
  return (
    <section className="mx-auto max-w-9/12 space-y-6">
      <div className="space-y-2 text-center">
        <h2 className="text-2xl font-semibold">Purpose</h2>
      </div>
      <Carousel className="w-full">
        <CarouselContent>
          <CarouselItem>
            <Card className="gap-0 overflow-hidden border-white/10 bg-white/5 p-0">
              <div className="h-full w-full overflow-hidden">
                <img
                  src={feSlide}
                  alt="Frontend Development"
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="space-y-2 bg-black/20 p-6 text-center backdrop-blur-md">
                <h3 className="text-lg font-semibold">Frontend Development</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Focus on building a modern, responsive, and component-driven
                  UI using React and TypeScript.
                </p>
              </div>
            </Card>
          </CarouselItem>
          <CarouselItem>
            <Card className="overflow-hidden border-white/10 bg-white/5 p-0 gap-0">
              <div className="h-full w-full overflow-hidden">
                <img
                  src={beSlide}
                  alt="Backend System Design"
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="space-y-2 bg-black/20 p-6 text-center backdrop-blur-md">
                <h3 className="text-lg font-semibold">Backend System Design</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Design REST APIs, authentication flows, and real-time
                  communication using Socket.IO.
                </p>
              </div>
            </Card>
          </CarouselItem>
          <CarouselItem>
            <Card className="overflow-hidden border-white/10 bg-white/5 p-0 gap-0">
              <div className="h-full w-full overflow-hidden">
                <img
                  src={dbSlide}
                  alt="Database Design"
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="space-y-2 bg-black/20 p-6 text-center backdrop-blur-md">
                <h3 className="text-lg font-semibold">Database Design</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Work with Prisma ORM and relational database modeling for
                  structured auction data.
                </p>
              </div>
            </Card>
          </CarouselItem>
          <CarouselItem>
            <Card className="overflow-hidden border-white/10 bg-white/5 p-0 gap-0">
              <div className="h-full w-full overflow-hidden">
                <img
                  src={architectureSlide}
                  alt="Architecture & Design"
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="space-y-2 bg-black/20 p-6 text-center backdrop-blur-md">
                <h3 className="text-lg font-semibold">Architecture & Design</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Build modular system architecture with separation of concerns
                  and scalable patterns.
                </p>
              </div>
            </Card>
          </CarouselItem>
          <CarouselItem>
            <Card className="overflow-hidden border-white/10 bg-white/5 p-0 gap-0">
              <div className="h-full w-full overflow-hidden">
                <img
                  src={infraSlide}
                  alt="AWS Cloud Integration"
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="space-y-2 bg-black/20 p-6 text-center backdrop-blur-md">
                <h3 className="text-lg font-semibold">AWS Cloud Integration</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Use AWS S3 and IAM for secure file storage and cloud-ready
                  deployment practices.
                </p>
              </div>
            </Card>
          </CarouselItem>
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </section>
  );
}
