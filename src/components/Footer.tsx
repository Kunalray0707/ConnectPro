import React from 'react';
import { Link } from 'react-router-dom';
import { Zap, Linkedin, Github, Instagram, Mail } from 'lucide-react';


const Footer: React.FC = () => {
  return (
    <footer className="bg-[hsl(var(--cp-dark))] text-[hsl(var(--cp-dark-fg))] border-t border-white/10">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[hsl(var(--cp-indigo))] to-[hsl(var(--cp-violet))] flex items-center justify-center">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <span className="font-heading text-xl font-bold text-white">
                Connect<span className="text-[hsl(var(--cp-indigo-light))]">Pro</span>
              </span>
            </Link>
            <p className="text-sm text-white/60 leading-relaxed max-w-xs">
              The unified platform connecting professionals, businesses, and opportunities across every industry.
            </p>
            <div className="flex items-center gap-3 mt-6">
              {[
                {
                  icon: Github,
                  label: 'GitHub',
                  href: 'https://github.com/Kunalray0707',
                },
                {
                  icon: Linkedin,
                  label: 'LinkedIn',
                  href: 'https://www.linkedin.com/in/kunal-ray-3483812b9/',
                },
                {
                  icon: Instagram,
                  label: 'Instagram',
                  href: 'https://www.instagram.com/hiiikunall/',
                },
                {
                  icon: Mail,
                  label: 'Email',
                  href: 'mailto:me.kunalray@gmail.com',
                },
              ].map(({ icon: Icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  target={href.startsWith('mailto:') ? undefined : '_blank'}
                  rel={href.startsWith('mailto:') ? undefined : 'noreferrer'}
                  aria-label={label}
                  className="w-9 h-9 rounded-lg bg-white/10 hover:bg-[hsl(var(--cp-indigo))]/40 flex items-center justify-center text-white/60 hover:text-white transition-all duration-200 inline-flex"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}

            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">Product</h3>
            <ul className="space-y-3">
              {['Discover', 'Marketplace', 'Dashboard', 'AI Matching', 'Verification'].map((item) => (
                <li key={item}>
                  <Link to="/discover" className="text-sm text-white/60 hover:text-white transition-colors duration-200">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">Company</h3>
            <ul className="space-y-3">
              {['About', 'Careers', 'Blog', 'Press', 'Partners'].map((item) => (
                <li key={item}>
                  <Link to="/about" className="text-sm text-white/60 hover:text-white transition-colors duration-200">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">Legal</h3>
            <ul className="space-y-3">
              {['Privacy Policy', 'Terms of Service', 'Cookie Policy', 'GDPR', 'Security'].map((item) => (
                <li key={item}>
                  <Link to="/" className="text-sm text-white/60 hover:text-white transition-colors duration-200">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-white/40">© 2026 ConnectPro. All rights reserved.</p>
          <p className="text-xs text-white/40">Built for professionals, by professionals.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;