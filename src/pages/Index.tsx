import { useState } from "react";
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import PriceTable from "@/components/PriceTable";
import ProductGrid from "@/components/ProductGrid";
import QRISPaymentModal from "@/components/QRISPaymentModal";
import Testimonials from "@/components/Testimonials";
import Footer from "@/components/Footer";
import FloatingWhatsApp from "@/components/FloatingWhatsApp";

interface SelectedProduct {
  name: string;
  weight: string;
  price: number;
  image: string;
}

const Index = () => {
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<SelectedProduct | null>(null);
  const [quantity, setQuantity] = useState(1);

  const handleBuy = (product: SelectedProduct) => {
    setSelectedProduct(product);
    setQuantity(1);
    setCheckoutOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <HeroSection />
        <PriceTable />
        <ProductGrid onBuy={handleBuy} />
        <Testimonials />
      </main>
      <Footer />
      <FloatingWhatsApp />
      {selectedProduct && (
        <QRISPaymentModal 
          isOpen={checkoutOpen} 
          onClose={() => setCheckoutOpen(false)} 
          product={selectedProduct}
          quantity={quantity}
        />
      )}
    </div>
  );
};

export default Index;
