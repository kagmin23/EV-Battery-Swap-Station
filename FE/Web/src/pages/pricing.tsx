import Header from "../components/common/header"
import Footer from "../components/common/footer"
 

export default function PricingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <section className="max-w-6xl mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-3">Pricing Plans</h1>
            <p className="text-neutral-500">Affordable battery swap pricing</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { name: 'Basic', price: '$9', features: ['1 swap / month', 'Email support'] },
              { name: 'Standard', price: '$19', features: ['5 swaps / month', 'Priority support'] },
              { name: 'Pro', price: '$39', features: ['Unlimited swaps', '24/7 support'] },
            ].map((plan) => (
              <div key={plan.name} className="rounded-xl border border-neutral-200 p-6 bg-white shadow-sm">
                <h3 className="text-xl font-semibold mb-1">{plan.name}</h3>
                <p className="text-3xl font-bold mb-4">{plan.price}<span className="text-base font-normal">/mo</span></p>
                <ul className="space-y-2 text-neutral-600">
                  {plan.features.map((f) => (<li key={f}>• {f}</li>))}
                </ul>
                <button className="mt-6 w-full rounded-lg bg-blue-600 text-white py-2 font-medium hover:bg-blue-500">Choose</button>
              </div>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
