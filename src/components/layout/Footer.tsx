import { Link } from "react-router-dom";
import BrandMark from "@/components/layout/BrandMark";

export default function Footer() {
  return (
    <footer className="border-t border-border/70 bg-slate-950 text-slate-300">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-4 md:gap-8">
          <div className="col-span-1 md:col-span-1">
            <BrandMark className="mb-4" compact />
            <p className="max-w-sm text-sm leading-6 text-slate-400">
              Uganda's leading platform for student hostel discovery. Find
              verified hostels near your university with ease.
            </p>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-white/90">
              Universities
            </h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>Makerere University</li>
              <li>Kyambogo University</li>
              <li>MUBS</li>
              <li>KIU</li>
              <li>UCU</li>
              <li>Nkumba University</li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-white/90">
              Quick Links
            </h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <Link
                  to="/search"
                  className="transition-colors hover:text-white"
                >
                  Browse Hostels
                </Link>
              </li>
              <li>
                <Link
                  to="/auth?mode=signup"
                  className="transition-colors hover:text-white"
                >
                  Student Registration
                </Link>
              </li>
              <li>
                <Link to="/faq" className="transition-colors hover:text-white">
                  FAQs
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-white/90">
              Contact Us
            </h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li className="flex items-start gap-2 leading-6">
                <span>Kampala, Uganda Plot 123, Jinja Road</span>
              </li>
              <li className="flex items-center gap-2 leading-6">
                <span>+256 700 123 456</span>
              </li>
              <li className="flex items-center gap-2 leading-6">
                <span>info@kajuhousing.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-slate-800 pt-8 text-center text-xs text-slate-500">
          <p>© {new Date().getFullYear()} Uni-Nest. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
