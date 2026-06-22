import { Card } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { Database, Globe, Server, Cloud } from 'lucide-react';
import { cn } from '@/shared/lib/utils.ts';

const techStack = {
  frontend: [
    'React',
    'Vite',
    'TypeScript',
    'Tailwind CSS',
    'shadcn/ui',
    'TanStack Query',
    'Zustand',
    'React Hook Form',
    'Zod validation',
    'React Router',
    'Axios',
  ],

  backend: [
    'NestJS',
    'Typescript',
    'JWT Authentication',
    'Cookie-based auth flow',
    'Socket.IO',
    'NestJS Event Emitter',
    'BullMQ',
    'NestJS Schedule',
    'Class Validator',
    'Class Transformer',
    'Nodemailer',
    'Multer',
    'Prisma ORM',
  ],

  database: ['MySQL', 'Redis'],

  infra: ['AWS S3', 'AWS EC2', 'AWS ElastiCache', 'AWS IAM', 'AWS CloudWatch', 'AWS RDS'],
};

const sections = [
  {
    title: 'Frontend',
    icon: Globe,
    className: 'border-cyan-500/20',
    iconClass: 'text-cyan-400',
    values: techStack.frontend,
  },
  {
    title: 'Backend',
    icon: Server,
    className: 'border-emerald-500/20',
    iconClass: 'text-emerald-400',
    values: techStack.backend,
  },
  {
    title: 'Database',
    icon: Database,
    className: 'border-orange-500/20',
    iconClass: 'text-orange-400',
    values: techStack.database,
  },
  {
    title: 'Infrastructure',
    icon: Cloud,
    className: 'border-violet-500/20',
    iconClass: 'text-violet-400',
    values: techStack.infra,
  },
];

export default function AboutTechStack() {
  return (
    <section className="mx-auto max-w-5xl space-y-10">
      <div className="space-y-2 text-center">
        <h2 className="text-2xl font-semibold">Tech Stack</h2>
        <p className="text-muted-foreground text-sm">
          Full-stack architecture including realtime and cloud infrastructure
        </p>
      </div>
      <div className="grid gap-5 md:grid-cols-4">
        {sections.map((section) => (
          <Card
            key={section.title}
            className={cn(
              'space-y-4 bg-white/5 p-5 transition-all hover:-translate-y-1',
              section.className,
            )}
          >
            <div className="flex items-center justify-center gap-3">
              <section.icon className={cn('h-5 w-5', section.iconClass)} />
              <h3 className="font-semibold">{section.title}</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {section.values.map((item) => (
                <Badge key={item} variant="secondary">
                  {item}
                </Badge>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
}
