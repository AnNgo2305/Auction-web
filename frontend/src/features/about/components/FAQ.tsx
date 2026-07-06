import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/shared/ui/accordion';
import { CircleHelp } from 'lucide-react';

const faq = [
  {
    question: 'Is Bid Market a real auction platform?',
    answer:
      'Bid Market is not a real commercial or production-grade auction platform. ' +
      'It is a personal project built to simulate a real-world auction system for learning and portfolio purposes. ' +
      'The system is intentionally designed to replicate core auction behaviors such as bidding flow, item listing, and user interactions in a realistic way, ' +
      'but it does not operate as a live marketplace with real economic value or external users at scale. ' +
      'The project focuses on demonstrating how a modern auction platform can be structured from a frontend perspective, including UI design, state management, routing, and user experience considerations. ' +
      'Its primary purpose is educational rather than commercial.',
  },
  {
    question: 'Does the platform support real payments or money transfer?',
    answer:
      'The platform does not integrate with traditional payment gateways such as banking APIs, credit cards, or third-party processors like Stripe in a production contexts. ' +
      'However, it does include a QR-based payment flow implemented for learning purposes, which helps demonstrate how modern applications can simulate or integrate real-world payment experiences. ' +
      'This feature is meant strictly for educational exploration of payment UX, and it is not intended to handle real financial transactions or production-level money movement. ' +
      'The implementation allows experimentation with payment-related workflows, transaction states, and user interactions while avoiding the complexity and regulatory requirements of handling actual financial operations.',
  },
  {
    question: 'What technologies are used in this project?',
    answer:
      'This project is built using React, TypeScript, and Tailwind CSS for the frontend layer, combined with shadcn/ui components to ensure a consistent and modern UI system. ' +
      'It follows common frontend architectural practices such as reusable component design, separation of UI and logic layers, and scalable folder structure patterns. ' +
      'The overall goal is to mirror how production-grade frontend applications are typically structured in real development environments. ' +
      'Additional tools such as React Router and TanStack Query are used to manage routing, server state, and asynchronous data handling, helping create a development experience that is closer to real-world projects.',
  },
  {
    question: 'What is the main goal of building this project?',
    answer:
      'The main goal of this project is to improve practical frontend development skills by building a realistic auction platform simulation. ' +
      'It focuses on implementing core product-like features such as authentication flows, auction lifecycle handling, and interactive UI behavior. ' +
      'Additionally, the project is designed to strengthen understanding of scalable UI architecture and real-world application patterns commonly used in modern web systems. ' +
      'By working on a feature-rich domain such as online auctions, the project provides opportunities to explore component design, data management strategies, user workflows, and overall application structure in a meaningful contexts.',
  },
  {
    question: 'Can users actually create and manage auctions?',
    answer:
      'Yes, users can create, view, and interact with auction listings within the system in a fully functional UI environment. ' +
      'The experience is designed to closely resemble a real-world auction platform, including listing creation, bidding interactions, and state updates. ' +
      'However, all data is still managed in a controlled simulation layer and is not connected to a full production backend or external marketplace infrastructure. ' +
      'This allows the project to showcase important user flows and interface behaviors while remaining focused on frontend development objectives rather than large-scale deployment concerns.',
  },
];

export default function AboutFAQ() {
  return (
    <section className="space-y-8">
      <div className="space-y-2 text-center">
        <h2 className="text-2xl font-semibold tracking-tight">FAQ</h2>
        <p className="text-muted-foreground text-sm">
          Frequently asked questions about the project
        </p>
      </div>
      <div className="mx-auto">
        <Accordion type="single" collapsible className="space-y-3">
          {faq.map((item, index) => (
            <AccordionItem
              key={index}
              value={`item-${index}`}
              className="rounded-lg border border-white/10 bg-white/5 px-4 shadow-sm transition-all duration-200 hover:bg-white/10 hover:shadow-md"
            >
              <AccordionTrigger className="py-4 text-left hover:no-underline">
                <div className="flex items-center gap-3">
                  <CircleHelp className="text-primary h-5 w-5 shrink-0" />
                  <span className="text-sm font-medium">{item.question}</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground pb-4 text-sm leading-relaxed">
                {item.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
