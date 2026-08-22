"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  Menu,
  X,
  Phone,
  Mail,
  Clock,
  Globe,
  ChevronDown,
  ArrowUpRight,
} from "lucide-react";
import {
  LinkedinIcon,
  FacebookIcon,
  TwitterIcon,
} from "./BrandIcons";
import { images } from "@/lib/images";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About Us" },
  { href: "/services", label: "Services" },
  { href: "/projects", label: "Projects" },
  { href: "/careers", label: "Careers" },
  { href: "/news", label: "News" },
  { href: "/contact", label: "Contact" },
];

const utilitySocials = [
  { Icon: LinkedinIcon, label: "LinkedIn" },
  { Icon: FacebookIcon, label: "Facebook" },
  { Icon: TwitterIcon, label: "Twitter" },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      {/* Global utility bar */}
      <div className="bg-slate-950 text-slate-300 text-xs border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex flex-wrap justify-between items-center gap-y-2">
          <div className="flex items-center gap-5 flex-wrap">
            <span className="flex items-center gap-1.5">
              <Phone size={12} className="text-accent" />
              <span>+251 91 123 5933</span>
            </span>
            <span className="hidden md:flex items-center gap-1.5">
              <Mail size={12} className="text-accent" />
              <span>asaminewteshome2025@gmail.com</span>
            </span>
            <span className="hidden lg:flex items-center gap-1.5">
              <Clock size={12} className="text-accent" />
              <span>Mon–Fri: 8:00 AM – 5:00 PM</span>
            </span>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-3">
              {utilitySocials.map(({ Icon, label }) => (
                <a
                  key={label}
                  href="#"
                  aria-label={label}
                  className="hover:text-accent transition-colors"
                >
                  <Icon size={13} />
                </a>
              ))}
            </div>
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-white/5 border border-white/10 rounded-full text-[11px]">
              <Globe size={11} className="text-accent" />
              <span>EN</span>
              <ChevronDown size={10} />
            </div>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Prominent Image Logo (No extra side text) */}
            <Link href="/" className="flex items-center group shrink-0 py-2">
              <div className="relative w-48 sm:w-60 h-12 sm:h-14 shrink-0 transition-transform group-hover:scale-105">
                <Image
                  src={images.logo.main}
                  alt="Asaminew Teshome Construction Group"
                  fill
                  className="object-contain object-left"
                  priority
                  unoptimized
                />
              </div>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => {
                const active = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`relative px-3.5 py-2 rounded-md text-sm font-medium transition-all ${
                      active
                        ? "text-primary"
                        : "text-slate-700 hover:text-primary"
                    }`}
                  >
                    {link.label}
                    {active && (
                      <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-accent rounded-full" />
                    )}
                  </Link>
                );
              })}
            </div>

            {/* CTA + mobile toggle */}
            <div className="flex items-center gap-2">
              <Link
                href="/contact"
                className="hidden lg:inline-flex items-center gap-1.5 bg-primary hover:bg-primary-light text-white font-semibold px-4 py-2.5 rounded-lg transition-all text-sm shadow-sm shadow-primary/20"
              >
                Get a Quote
                <ArrowUpRight size={14} />
              </Link>
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="lg:hidden text-slate-700 p-2 rounded-md hover:bg-slate-100 transition-colors"
                aria-label="Toggle menu"
              >
                {isOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="lg:hidden border-t border-slate-200 bg-white">
            <div className="px-4 py-3 space-y-1">
              {navLinks.map((link) => {
                const active = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-md text-sm font-medium transition-all ${
                      active
                        ? "bg-primary/5 text-primary"
                        : "text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    {link.label}
                    <ArrowUpRight
                      size={14}
                      className={active ? "text-primary" : "text-slate-400"}
                    />
                  </Link>
                );
              })}
              <Link
                href="/contact"
                onClick={() => setIsOpen(false)}
                className="mt-3 inline-flex w-full justify-center items-center gap-1.5 bg-primary text-white font-semibold px-4 py-2.5 rounded-md text-sm"
              >
                Get a Quote
                <ArrowUpRight size={14} />
              </Link>
            </div>
          </div>
        )}
      </nav>
    </>
  );
}