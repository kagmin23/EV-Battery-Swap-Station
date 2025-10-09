import { Button } from "antd"
import { HomeOutlined } from "@ant-design/icons"
import { Link } from "react-router-dom"

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-neutral-900 px-4">
      <div className="text-center">
        <h1 className="text-7xl md:text-9xl font-bold text-blue-600 mb-4">404</h1>
        <h2 className="text-2xl md:text-3xl font-semibold text-neutral-900 dark:text-neutral-100 mb-4">Oops! Page not found.</h2>
        <p className="text-neutral-500 dark:text-neutral-400 mb-8 text-lg">The page you're looking for doesn't exist or has been moved.</p>
        <Link to="/">
          <Button type="primary" size="large" icon={<HomeOutlined />} className="font-medium">
            Go Home
          </Button>
        </Link>
      </div>
    </div>
  )
}
