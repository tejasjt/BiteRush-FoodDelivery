import { Link } from "@tanstack/react-router";
import { Instagram, Twitter, Facebook, MapPin, Phone, Mail } from "lucide-react";
import { Logo } from "./Logo";

export function SiteFooter() {
  return (
    <footer className="gradient-dark mt-24 text-[oklch(0.95_0.01_140)]">
      <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-4">
        <div className="space-y-4">
          <Logo />
          <p className="max-w-xs text-sm opacity-70">
            Fresh kitchens across Bengaluru, delivered hot in under 40 minutes. Real food, honest pricing.
          </p>
          <div className="flex gap-3 opacity-80">
            <Instagram className="size-4" />
            <Twitter className="size-4" />
            <Facebook className="size-4" />
          </div>
        </div>

        <div>
          <h3 className="mb-4 text-sm font-semibold tracking-wide uppercase opacity-90">Explore</h3>
          <ul className="space-y-2.5 text-sm opacity-70">
            <li>
              <Link to="/menu">Full menu</Link>
            </li>
            <li>
              <Link to="/categories">Categories</Link>
            </li>
            <li>
              <Link to="/orders">Track an order</Link>
            </li>
            <li>
              <Link to="/cart">Your cart</Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="mb-4 text-sm font-semibold tracking-wide uppercase opacity-90">Company</h3>
          <ul className="space-y-2.5 text-sm opacity-70">
            <li>
              <Link to="/about">About BiteRush</Link>
            </li>
            <li>
              <Link to="/contact">Contact & support</Link>
            </li>
            <li>
              <Link to="/register">Create an account</Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="mb-4 text-sm font-semibold tracking-wide uppercase opacity-90">Reach us</h3>
          <ul className="space-y-2.5 text-sm opacity-70">
            <li className="flex gap-2">
              <MapPin className="mt-0.5 size-4 shrink-0" /> 14, Church Street, Bengaluru 560001
            </li>
            <li className="flex gap-2">
              <Phone className="mt-0.5 size-4 shrink-0" /> +91 80 4567 1200
            </li>
            <li className="flex gap-2">
              <Mail className="mt-0.5 size-4 shrink-0" /> hello@biterush.in
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-2 px-4 py-5 text-xs opacity-60 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p>© {new Date().getFullYear()} BiteRush Foods Pvt. Ltd. All rights reserved.</p>
          <p>Demo platform — payments are simulated, no money is charged.</p>
        </div>
      </div>
    </footer>
  );
}