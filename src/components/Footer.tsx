import Link from "next/link";
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  ArrowUpRight,
  Shield,
  Award,
  Globe,
  CheckCircle2,
} from "lucide-react";
import NewsletterForm from "./NewsletterForm";
import {
  LinkedinIcon,
  FacebookIcon,
  TwitterIcon,
  InstagramIcon,
} from "./BrandIcons";

const quickLinks = [
  { href: "/about", label: "About Us" },
  { href: "/services", label: "Our Services" },
  { href: "/projects", label: "Projects" },
  { href: "/careers", label: "Careers" },
  { href: "/news", label: "News & Blog" },
  { href: "/contact", label: "Contact Us" },
];

const services = [
  "Commercial Building",
  "Health Center Construction",
  "Bridge Construction",
  "Road Construction",
  "Water & Dam Structures",
  "Heavy Machinery Import",
];

const socials = [
  {
    Icon: LinkedinIcon,
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/asaminew-teshome-83156618?utm_source=share_via&utm_content=profile&utm_medium=member_android",
  },
  {
    Icon: FacebookIcon,
    label: "Facebook",
    href: "https://www.facebook.com/share/1LpcZSNLKV/",
  },
  // Add real URLs when available
  // { Icon: TwitterIcon, label: "Twitter", href: "https://twitter.com/..." },
  // { Icon: InstagramIcon, label: "Instagram", href: "https://instagram.com/..." },
];

export default function Footer() {
  return (
    <footer className="bg-slate-950 text-slate-300">
      {/* Top: trust + newsletter */}
      <div className="border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 grid md:grid-cols-2 gap-8 items-center">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-accent mb-2">
              Stay informed
            </div>
            <h3 className="text-2xl font-bold text-white">
              Subscribe to corporate updates
            </h3>
            <p className="text-slate-400 text-sm mt-2 max-w-md">
              Get the latest news on our projects, services, and career opportunities.
            </p>
          </div>
          <NewsletterForm />
        </div>
      </div>

      {/* Main grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10">
          {/* Company Info */}
          <div className="lg:col-span-4">
            <Link href="/" className="flex items-center gap-3 mb-5">
              <div className="relative">
                <div className="w-11 h-11 bg-gradient-to-br from-primary to-primary-light rounded-lg flex items-center justify-center font-bold text-white text-base shadow-md shadow-primary/30">
                  AT
                </div>
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-accent rounded-full border-2 border-slate-950" />
              </div>
              <div>
                <div className="font-bold text-lg text-white leading-tight">
                  Asaminew Teshome
                </div>
                <div className="text-[11px] uppercase tracking-[0.18em] text-accent font-semibold">
                  Construction Group
                </div>
              </div>
            </Link>
            <p className="text-slate-400 text-sm leading-relaxed mb-6">
              A trusted Ethiopian construction partner delivering buildings, roads,
              bridges, and water infrastructure with engineering excellence for over
              14 years.
            </p>

            {/* Trust badges */}
            <div className="space-y-2.5">
              <div className="flex items-center gap-2 text-xs text-slate-300">
                <Shield size={14} className="text-accent" />
                Licensed & Insured Contractor
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-300">
                <Award size={14} className="text-accent" />
                ISO-Aligned Quality Management
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-300">
                <Globe size={14} className="text-accent" />
                Operating Across Multiple Regions
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-300">
                <CheckCircle2 size={14} className="text-accent" />
                HSE Compliant Operations
              </div>
            </div>

            {/* Socials */}
            <div className="flex items-center gap-2 mt-6">
              {socials.map(({ Icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="w-9 h-9 inline-flex items-center justify-center bg-slate-900 hover:bg-accent text-slate-400 hover:text-slate-950 rounded-lg border border-slate-800 hover:border-accent transition-all"
                >
                  <Icon size={14} />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="lg:col-span-2">
            <h3 className="text-white font-bold text-sm uppercase tracking-wider mb-5">
              Company
            </h3>
            <ul className="space-y-2.5">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-slate-400 hover:text-accent transition-colors flex items-center gap-1.5 text-sm group"
                  >
                    <ArrowUpRight
                      size={12}
                      className="opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all"
                    />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div className="lg:col-span-3">
            <h3 className="text-white font-bold text-sm uppercase tracking-wider mb-5">
              Services
            </h3>
            <ul className="space-y-2.5">
              {services.map((s) => (
                <li
                  key={s}
                  className="text-slate-400 text-sm flex items-start gap-2"
                >
                  <span className="w-1 h-1 bg-accent rounded-full mt-2 shrink-0" />
                  {s}
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="lg:col-span-3">
            <h3 className="text-white font-bold text-sm uppercase tracking-wider mb-5">
              Headquarters
            </h3>
            <ul className="space-y-4">
              <li className="flex gap-3 text-sm">
                <MapPin size={16} className="text-accent shrink-0 mt-0.5" />
                <div className="text-slate-400">
                  Addis Ababa, Nifas Silk Lafto
                  <br />
                  Ethiopia
                </div>
              </li>
              <li className="flex gap-3 text-sm">
                <Phone size={16} className="text-accent shrink-0 mt-0.5" />
                <div className="text-slate-400">
                  <div>+251 91 123 5933</div>
                  <div>+251 93 010 0200</div>
                </div>
              </li>
              <li className="flex gap-3 text-sm">
                <Mail size={16} className="text-accent shrink-0 mt-0.5" />
                <a
                  href="mailto:asaminewteshome2025@gmail.com"
                  className="text-slate-400 hover:text-accent transition-colors break-all"
                >
                  asaminewteshome2025@gmail.com
                </a>
              </li>
              <li className="flex gap-3 text-sm">
                <Clock size={16} className="text-accent shrink-0 mt-0.5" />
                <div className="text-slate-400">
                  Mon–Fri: 8:00 AM – 5:00 PM
                  <br />
                  Sat: 8:00 AM – 12:30 PM
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-slate-800 bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-slate-500">
          <p>
            © {new Date().getFullYear()} Asaminew Teshome Construction Group. All rights reserved.
          </p>
          <div className="flex items-center gap-5">
            <Link href="#" className="hover:text-accent transition-colors">
              Privacy Policy
            </Link>
            <Link href="#" className="hover:text-accent transition-colors">
              Terms of Service
            </Link>
            <span className="hidden sm:inline text-slate-700">·</span>
            <span className="hidden sm:inline">Designed for excellence</span>
          </div>
        </div>
      </div>
    </footer>
  );
}