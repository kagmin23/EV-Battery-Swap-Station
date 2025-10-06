import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './components/common/home';
import Header from './components/common/header';
import Footer from './components/common/footer';
import AdminRouter from './routes/adminRouter';
import StaffRouter from './routes/staffRouter';
import DriverRouter from './routes/driverRouter';

function App() {
  return (
    <>
      <BrowserRouter>
        <Header />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/admin/*" element={<AdminRouter />} />
          <Route path="/staff/*" element={<StaffRouter />} />
          <Route path="/driver/*" element={<DriverRouter />} />
        </Routes>
        <Footer />
      </BrowserRouter>
    </>
  );
}

export default App;
