import {
  CreditCard,
  Gavel,
  LayoutDashboard,
  MessageCircle,
  MessageSquare,
  PlusCircle,
} from 'lucide-react';
import { Card, CardContent } from '@/shared/ui/card';

export default function AboutFeatures() {
  return (
    <section className="mx-auto max-w-5xl space-y-6">
      <div className="space-y-2 text-center">
        <h2 className="text-2xl font-semibold">Features</h2>
        <p className="text-muted-foreground text-sm">
          Core functionality provided by the platform.
        </p>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardContent className="space-y-4 p-6">
            <Gavel className="h-8 w-8" />
            <div className="space-y-2">
              <h3 className="font-semibold">Real-time Bidding</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Users can place bids instantly and receive live updates during
                active auctions.
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="space-y-4 p-6">
            <PlusCircle className="h-8 w-8" />
            <div className="space-y-2">
              <h3 className="font-semibold">Auction Creation</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Create auction listings with item information, images, and
                bidding configurations.
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="space-y-4 p-6">
            <CreditCard className="h-8 w-8" />
            <div className="space-y-2">
              <h3 className="font-semibold">Secure Payments</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Complete auction transactions through a secure and reliable
                payment workflow.
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="space-y-4 p-6">
            <MessageCircle className="h-8 w-8" />
            <div className="space-y-2">
              <h3 className="font-semibold">Real-time Chat</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Enable communication between buyers and sellers through instant
                messaging.
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="space-y-4 p-6">
            <LayoutDashboard className="h-8 w-8" />
            <div className="space-y-2">
              <h3 className="font-semibold">Auction Management</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Manage listings, bids, participants, and auction status from a
                centralized dashboard.
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="space-y-4 p-6">
            <MessageSquare className="h-8 w-8" />
            <div className="space-y-2">
              <h3 className="font-semibold">Comments & Reviews</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Users can leave comments and feedback on auction items, helping
                buyers evaluate product quality and seller reputation. This
                improves trust and interaction within the marketplace.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
