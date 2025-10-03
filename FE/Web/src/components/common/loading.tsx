import { Spin } from "antd"

export default function Loading() {
  return (
    <div className="fixed inset-0 bg-white/80 dark:bg-black/60 flex items-center justify-center z-50">
      <div className="flex flex-col items-center gap-4">
        <Spin size="large" />
        <p className="text-gray-500 text-lg">Loading...</p>
      </div>
    </div>
  )
}
