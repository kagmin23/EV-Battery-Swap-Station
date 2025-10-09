import {
    MailOutlined,
    PhoneOutlined,
    TwitterOutlined,
    FacebookOutlined,
    LinkedinOutlined,
    InstagramOutlined,
  } from "@ant-design/icons"
  import { Link } from "react-router-dom"
  
  export default function Footer() {
    const quickLinks = [
      { label: "Home", href: "/" },
      { label: "Services", href: "/services" },
      { label: "Pricing", href: "/pricing" },
      { label: "About Us", href: "/about" },
      { label: "Contact", href: "/contact" },
    ]
  
    const socialLinks = [
      { icon: <TwitterOutlined />, href: "#", label: "Twitter" },
      { icon: <FacebookOutlined />, href: "#", label: "Facebook" },
      { icon: <LinkedinOutlined />, href: "#", label: "LinkedIn" },
      { icon: <InstagramOutlined />, href: "#", label: "Instagram" },
    ]
  
    return (
      <footer className="bg-neutral-50 border-t border-neutral-200">
        <div className="w-full max-w-7xl mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-10">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <img src="/logo.png" alt="EV Battery Swap" className="h-8 w-auto" />
                <span className="text-xl font-bold text-neutral-900">EV Battery Swap</span>
              </div>
              <p className="text-neutral-600 text-sm leading-relaxed">
                Power your ride, anytime. Sustainable energy solutions for the modern electric vehicle driver.
              </p>
            </div>

            <div>
              <h3 className="text-neutral-900 font-semibold mb-3">Quick Links</h3>
              <ul className="space-y-2">
                {quickLinks.map((link) => (
                  <li key={link.href}>
                    <Link to={link.href} className="text-neutral-600 hover:text-blue-600 transition-colors text-sm">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-neutral-900 font-semibold mb-3">Contact</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-neutral-600">
                  <MailOutlined className="text-blue-600" />
                  <a href="mailto:info@evbatteryswap.com" className="hover:text-blue-600 transition-colors">
                    duong3nana203@gmail.com
                  </a>
                </div>
                <div className="flex items-center gap-2 text-sm text-neutral-600">
                  <PhoneOutlined className="text-blue-600" />
                  <a href="tel:+1234567890" className="hover:text-blue-600 transition-colors">
                    +84 827 577 752
                  </a>
                </div>
                <div className="flex gap-4 mt-4">
                  {socialLinks.map((social) => (
                    <a key={social.label} href={social.href} aria-label={social.label} className="text-neutral-600 hover:text-blue-600 transition-colors text-lg">
                      {social.icon}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-neutral-200">
            <p className="text-center text-sm text-neutral-500">© 2025 EV Battery Swap. All rights reserved.</p>
          </div>
        </div>
      </footer>
    )
  }
  