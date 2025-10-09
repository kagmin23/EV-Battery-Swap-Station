import Header from "../components/common/header"
import Footer from "../components/common/footer"
 

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <section className="max-w-4xl mx-auto px-4 py-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">About Us</h1>
          <p className="text-neutral-600 leading-relaxed">
            We build a sustainable EV battery swapping network to keep you moving.
            Our mission is to reduce downtime, extend battery lifecycle, and make clean energy more accessible.
          </p>
        </section>
      </main>
      <Footer />
    </div>
  )
}
