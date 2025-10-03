"use client"

import { useState } from "react"
import { Button, Drawer, Menu } from "antd"
import {
  MenuOutlined,
  HomeOutlined,
  CustomerServiceOutlined,
  DollarOutlined,
  InfoCircleOutlined,
  PhoneOutlined,
} from "@ant-design/icons"
import { Link, useLocation } from "react-router-dom"


export default function Header() {
  const [drawerVisible, setDrawerVisible] = useState(false)
  const { pathname } = useLocation()

  const menuItems = [
    { key: "home", label: "Home", icon: <HomeOutlined />, href: "/" },
    { key: "services", label: "Services", icon: <CustomerServiceOutlined />, href: "/services" },
    { key: "pricing", label: "Pricing", icon: <DollarOutlined />, href: "/pricing" },
    { key: "about", label: "About Us", icon: <InfoCircleOutlined />, href: "/about" },
    { key: "contact", label: "Contact", icon: <PhoneOutlined />, href: "/contact" },
  ]

  return (
    <header className="sticky top-0 z-50 border-b border-neutral-200 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="w-full max-w-7xl mx-auto px-4">
        <div className="h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <img src="/logo.png" alt="EV Battery Swap" className="h-8 w-auto" />
            <span className="text-neutral-900 text-xl font-bold">EV Battery Swap</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            {menuItems.map((item) => (
              <Link
                key={item.key}
                to={item.href}
                className={`text-sm font-medium transition-colors hover:text-blue-600 ${
                  pathname === item.href ? 'text-blue-600' : 'text-neutral-700'
                }`}
                aria-current={pathname === item.href ? 'page' : undefined}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="hidden md:block">
            <Button type="primary" size="large" className="font-medium">
              Sign In
            </Button>
          </div>

          <Button
            className="md:hidden"
            type="text"
            icon={<MenuOutlined className="text-xl" />}
            onClick={() => setDrawerVisible(true)}
          />
        </div>
      </div>
      <Drawer title="Menu" placement="right" onClose={() => setDrawerVisible(false)} open={drawerVisible} width={280}>
        <Menu
          mode="vertical"
          selectedKeys={[menuItems.find((m) => m.href === pathname)?.key || '']}
          items={menuItems.map((item) => ({
            ...item,
            label: <Link to={item.href}>{item.label}</Link>,
          }))}
          className="border-none"
        />
        <div className="mt-6 px-4">
          <Button type="primary" size="large" block className="font-medium">
            Sign In
          </Button>
        </div>
      </Drawer>
    </header>
  )
}
