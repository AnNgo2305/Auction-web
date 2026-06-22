import {
  FaFacebook,
  FaInstagram,
  FaYoutube,
  FaXTwitter,
  FaEnvelope,
  FaPhone,
  FaLocationDot,
} from 'react-icons/fa6';
import logo from '@/assets/images/bid-market.png';

const footerSections = [
  {
    title: 'Quick Links',
    links: [
      'About Us',
      'How It Works',
      'Careers',
      'Blog',
      'Press'
    ],
  },
  {
    title: 'Auctions',
    links: [
      'Browse Auctions',
      'Live Auctions',
      'Ending Soon',
      'Featured Items',
      'Categories',
    ],
  },
  {
    title: 'Selling',
    links: [
      'Start Selling',
      'Seller Guide',
      'Seller Fees',
      'Verification',
      'Policies',
    ],
  },
  {
    title: 'Account',
    links: [
      'Login',
      'Register',
      'My Account',
      'Watchlist',
      'My Bids',
    ],
  },
  {
    title: 'Help',
    links: [
      'Help Center',
      'FAQ',
      'Contact Us',
      'Privacy Policy',
      'Terms of Service',
    ],
  },
];

export default function Footer() {
  return (
    <footer className="text-foreground rounded-t-4xl bg-(--footer)">
      <div className="mx-auto px-15 py-10">
        <div className="grid gap-12 pb-5 lg:grid-cols-[1fr_2fr]">
          <div className="max-w-md">
            <div className="flex items-center gap-3">
              <img
                src={logo}
                alt="Bid Market"
                className="h-20 w-auto object-contain"
              />
              <div>
                <h2 className="text-2xl font-bold tracking-wide">Bid Market</h2>
                <p className="text-muted-foreground text-sm">
                  Online Auction Platform
                </p>
              </div>
            </div>
            <p className="text-muted-foreground mt-4 text-sm">
              A modern online auction platform where users can discover, bid,
              buy, and sell items through secure and transparent auctions.
            </p>
            <div className="my-6 h-px w-full bg-white" />
            <div className="mt-6">
              <p className="mb-2 text-sm font-medium">
                Get auction updates and exclusive offers
              </p>
              <div className="flex gap-1">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="bg-background flex-1 rounded-md border px-3 py-2 text-sm"
                />
                <button className="bg-background text-foreground hover:bg-background/90 rounded-md px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors">
                  Subscribe
                </button>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-8 md:grid-cols-3 xl:grid-cols-5">
            {footerSections.map((section) => (
              <div key={section.title}>
                <h3 className="mb-4 font-semibold">{section.title}</h3>
                <ul className="text-muted-foreground space-y-2 text-sm">
                  {section.links.map((link) => (
                    <li key={link}>{link}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <div className="text-muted-foreground py-6 text-sm">
          <div className="flex flex-col items-center gap-3 md:items-start">
            <div className="flex items-center gap-2 text-white/80">
              <FaEnvelope className="text-white/60" size={14} />
              <span>Email: support@bidmarket.com</span>
            </div>
            <div className="flex items-center gap-2 text-white/80">
              <FaPhone className="text-white/60" size={14} />
              <span>Phone: +84 123 456 789</span>
            </div>
            <div className="flex items-center gap-2 text-white/80">
              <FaLocationDot className="text-white/60" size={14} />
              <span>Location: Hanoi, Vietnam</span>
            </div>
          </div>
        </div>
        <div className="flex flex-col items-center justify-between gap-4 py-1 text-sm md:flex-row">
          <div className="text-muted-foreground flex items-center gap-5">
            <FaFacebook size={18} />
            <FaInstagram size={18} />
            <FaYoutube size={18} />
            <FaXTwitter size={18} />
          </div>
          <p className="text-muted-foreground">
            © {new Date().getFullYear()} Bid Market. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};