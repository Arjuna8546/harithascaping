import { BrowserRouter, Routes, Route } from "react-router-dom";

import Header from "./components/Header";
import Footer from "./components/Footer";

import Home     from "./pages/Home";
import About    from "./pages/About";
import Services from "./pages/Services";
import Projects from "./pages/Projects";
import Gallery  from "./pages/Gallery";
import Contact  from "./pages/Contact";

export default function App() {
  return (
    <BrowserRouter>
      <div className="flex flex-col min-h-screen">
        <Header />

        <main className="flex-1">
          <Routes>
            <Route path="/"         element={<Home />} />
            <Route path="/about"    element={<About />} />
            <Route path="/services" element={<Services />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/blogs"  element={<Gallery />} />
            <Route path="/contact"  element={<Contact />} />
            {/* Fallback — redirect unknown paths to home */}
            <Route path="*"         element={<Home />} />
          </Routes>
        </main>

        <Footer />
      </div>
    </BrowserRouter>
  );
}
