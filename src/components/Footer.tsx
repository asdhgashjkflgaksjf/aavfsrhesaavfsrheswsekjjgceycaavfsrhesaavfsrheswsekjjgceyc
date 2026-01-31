import { Mail, MapPin, Shield, Award, Truck } from "lucide-react";
import accreditation1 from "@/assets/accreditation-1.webp";
import accreditation2 from "@/assets/accreditation-2.webp";
import accreditation3 from "@/assets/accreditation-3.webp";
import accreditation4 from "@/assets/accreditation-4.webp";
import accreditation5 from "@/assets/accreditation-5.webp";

const accreditationImages = [
  { src: accreditation1, alt: "Sertifikasi Antam" },
  { src: accreditation2, alt: "Bersertifikat SNI" },
  { src: accreditation3, alt: "Member LBMA" },
  { src: accreditation4, alt: "ISO Certified" },
  { src: accreditation5, alt: "Trusted Partner" },
];

const Footer = () => {
  return (
    <footer id="kontak" className="bg-secondary/30 border-t border-border">
      {/* Trust badges section */}
      <div className="border-b border-border">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center gap-4 p-4 rounded-lg bg-card/50">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h4 className="font-semibold">100% Emas Asli</h4>
                <p className="text-sm text-muted-foreground">Bersertifikat Antam</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4 p-4 rounded-lg bg-card/50">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                <Truck className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h4 className="font-semibold">Pengiriman Aman</h4>
                <p className="text-sm text-muted-foreground">Diasuransikan 100%</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4 p-4 rounded-lg bg-card/50">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                <Award className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h4 className="font-semibold">Garansi Buyback</h4>
                <p className="text-sm text-muted-foreground">Harga kompetitif</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main footer */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-gradient-gold flex items-center justify-center">
                <span className="text-primary-foreground font-serif font-bold text-lg">LM</span>
              </div>
              <div>
                <h3 className="font-serif font-bold text-gold-gradient">LOGAM MULIA</h3>
                <p className="text-xs text-muted-foreground">Official Butik Mas Antam</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Toko emas terpercaya sejak 2015. Kami menyediakan emas batangan Antam asli dengan sertifikat resmi.
            </p>
          </div>
          
          {/* Quick links */}
          <div>
            <h4 className="font-semibold mb-4">Menu</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#harga" className="hover:text-primary transition-colors">Harga Hari Ini</a></li>
              <li><a href="#produk" className="hover:text-primary transition-colors">Produk</a></li>
              <li><a href="#testimoni" className="hover:text-primary transition-colors">Testimoni</a></li>
              <li><a href="#kontak" className="hover:text-primary transition-colors">Kontak</a></li>
            </ul>
          </div>
          
          {/* Products */}
          <div>
            <h4 className="font-semibold mb-4">Produk</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>Emas Antam 0.5 Gram</li>
              <li>Emas Antam 1 Gram</li>
              <li>Emas Antam 5 Gram</li>
              <li>Emas Antam 10 Gram</li>
              <li>Emas Antam 25+ Gram</li>
            </ul>
          </div>
          
          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-4">Hubungi Kami</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-primary" />
                <a href="mailto:customerservices@antam.com" className="hover:text-primary transition-colors">
                  customerservices@antam.com
                </a>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-foreground">PT ANTAM Tbk</p>
                  <p>Unit Bisnis Pengolahan dan Pemurnian Logam Mulia</p>
                  <p>Gedung Graha Dipta. Jalan Pemuda, No.1</p>
                  <p>Jatinegara Kaum, Pulo Gadung, Jakarta 13250</p>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
        
      {/* Accreditation Section with Gold Strip Design */}
      <div className="relative">
        {/* Gold strip at top */}
        <div className="h-2 bg-gradient-to-r from-amber-600 via-yellow-400 to-amber-600" />
        
        {/* Dark blue background section */}
        <div className="bg-[#1a2744] py-8">
          <div className="container mx-auto px-4">
            <div className="text-center mb-6">
              <h4 className="text-sm font-semibold text-amber-400 uppercase tracking-wider mb-6">
                Akreditasi & Sertifikasi
              </h4>
              <div className="flex flex-wrap items-center justify-center gap-6 md:gap-8">
                {accreditationImages.map((img, index) => (
                  <div 
                    key={index} 
                    className="h-10 md:h-12 opacity-90 hover:opacity-100 transition-opacity"
                  >
                    <img
                      src={img.src}
                      alt={img.alt}
                      className="h-full w-auto object-contain brightness-0 invert"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Gold strip at bottom */}
        <div className="h-1 bg-gradient-to-r from-amber-600 via-yellow-400 to-amber-600" />
      </div>

      {/* Copyright */}
      <div className="bg-[#0f172a] py-4 text-center text-sm text-gray-400">
        <p>&copy; {new Date().getFullYear()} Logam Mulia. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
