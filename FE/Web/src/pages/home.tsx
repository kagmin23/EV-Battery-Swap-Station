import Header from "../components/common/header"
import Footer from "../components/common/footer"
 

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 flex items-center justify-center">
        <div className="text-center py-16">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">Welcome to EV Battery Swap</h1>
          <p className="text-lg text-neutral-500">Power your ride, anytime</p>
        </div>
      </main>
      <Footer />
    </div>
  )
}
