import './App.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Dashboard from './features/staff/page/Dashboard'
import Home from './components/common/home'
import Header from './components/common/header'
import Footer from './components/common/footer'
function App() {
  return (
    <>
      <BrowserRouter>
        <Header />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/staff/dashboard" element={<Dashboard />} />
        </Routes>
        <Footer />
      </BrowserRouter>
    </>
  )
}

export default App
