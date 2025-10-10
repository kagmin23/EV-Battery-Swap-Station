import Header from "../components/common/header"
import Footer from "../components/common/footer"
 

export default function ContactPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <section className="max-w-3xl mx-auto px-4 py-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Contact Us</h1>
          <form className="grid grid-cols-1 gap-4">
            <input className="border border-neutral-300 rounded-lg px-4 py-2" placeholder="Your name" />
            <input className="border border-neutral-300 rounded-lg px-4 py-2" placeholder="Email address" />
            <textarea className="border border-neutral-300 rounded-lg px-4 py-2 h-32" placeholder="Message" />
            <button className="rounded-lg bg-blue-600 text-white py-2 font-medium hover:bg-blue-500">Send</button>
          </form>
        </section>
      </main>
      <Footer />
    </div>
  )
}
