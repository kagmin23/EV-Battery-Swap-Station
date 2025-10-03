import Header from "../components/common/header"
import Footer from "../components/common/footer"
 

export default function ServicesPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <section className="max-w-6xl mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-3">Our Services</h1>
            <p className="text-neutral-500">Battery swap services for your EV</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-xl border border-neutral-200 p-6 bg-white shadow-sm">
              <h3 className="text-xl font-semibold mb-2">Fast Swap</h3>
              <p className="text-neutral-600">Quick battery swapping in minutes.</p>
            </div>
            <div className="rounded-xl border border-neutral-200 p-6 bg-white shadow-sm">
              <h3 className="text-xl font-semibold mb-2">Membership</h3>
              <p className="text-neutral-600">Save more with flexible plans.</p>
            </div>
            <div className="rounded-xl border border-neutral-200 p-6 bg-white shadow-sm">
              <h3 className="text-xl font-semibold mb-2">24/7 Support</h3>
              <p className="text-neutral-600">We are here anytime you need.</p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
