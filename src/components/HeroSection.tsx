import { Button } from "@/components/ui/button";
import { ChevronDown, Shield, Truck, Award, Gem } from "lucide-react";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-24">
      {/* Background - Light mode: warm cream/gold, Dark mode: dark elegant */}
      <div className="absolute inset-0 bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 dark:from-zinc-900 dark:via-zinc-800 dark:to-zinc-900 transition-colors duration-300" />
      
      {/* Decorative gold pattern overlay */}
      <div className="absolute inset-0 opacity-5 dark:opacity-10" 
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23D4AF37' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />
      
      {/* Decorative elements */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-400/10 dark:bg-amber-500/5 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-yellow-400/15 dark:bg-yellow-500/10 rounded-full blur-3xl" />
      <div className="absolute top-1/3 right-1/3 w-64 h-64 bg-orange-300/10 dark:bg-amber-500/5 rounded-full blur-3xl" />
      
      {/* Gold lines decoration */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-500/50 dark:via-amber-500/30 to-transparent" />
      <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-500/50 dark:via-amber-500/30 to-transparent" />
      
      {/* Side decorative lines */}
      <div className="absolute top-24 left-8 w-px h-32 bg-gradient-to-b from-amber-500/50 dark:from-amber-500/30 to-transparent hidden md:block" />
      <div className="absolute top-24 right-8 w-px h-32 bg-gradient-to-b from-amber-500/50 dark:from-amber-500/30 to-transparent hidden md:block" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* ANTAM Logo/Brand Badge */}
          <div className="flex justify-center mb-6 animate-fade-in">
            <div className="flex items-center gap-3 px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500/20 via-yellow-400/20 to-amber-500/20 dark:from-amber-500/20 dark:via-yellow-500/20 dark:to-amber-500/20 border border-amber-500/30 backdrop-blur-sm">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500 to-yellow-600 flex items-center justify-center shadow-lg">
                <Gem className="w-5 h-5 text-white" />
              </div>
              <div className="text-left">
                <p className="text-xs font-medium text-amber-700 dark:text-amber-400 uppercase tracking-wider">Official Partner</p>
                <p className="text-lg font-bold text-amber-800 dark:text-amber-300">PT ANTAM Tbk</p>
              </div>
            </div>
          </div>
          
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-100 dark:bg-amber-500/10 border border-amber-300 dark:border-amber-500/30 mb-8 animate-fade-in" style={{ animationDelay: "0.1s" }}>
            <Award className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <span className="text-sm text-amber-700 dark:text-amber-300 font-medium">Toko Emas Terpercaya Sejak 2015</span>
          </div>
          
          {/* Main heading */}
          <h1 className="font-serif text-5xl md:text-7xl font-bold mb-6 animate-fade-in" style={{ animationDelay: "0.15s" }}>
            <span className="text-zinc-800 dark:text-white">Investasi </span>
            <span className="text-amber-600 dark:text-amber-400">Emas Antam</span>
            <br />
            <span className="text-zinc-800 dark:text-white">Masa Depan Cerah</span>
          </h1>
          
          {/* Subtitle */}
          <p className="text-lg md:text-xl text-zinc-600 dark:text-zinc-300 mb-10 max-w-2xl mx-auto animate-fade-in" style={{ animationDelay: "0.2s" }}>
            Dapatkan emas batangan Antam asli bersertifikat dengan harga terbaik. 
            Pengiriman aman dan bergaransi ke seluruh Indonesia.
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12 animate-fade-in" style={{ animationDelay: "0.25s" }}>
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white font-bold px-8 py-6 text-lg shadow-xl shadow-amber-500/25"
              asChild
            >
              <a href="#produk">
                BELI EMAS SEKARANG
              </a>
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="border-2 border-amber-500 text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-500/10 font-bold px-8 py-6 text-lg"
              asChild
            >
              <a href="#harga">
                Lihat Harga Hari Ini
              </a>
            </Button>
          </div>
          
          {/* Trust badges */}
          <div className="flex flex-wrap justify-center gap-6 md:gap-8 animate-fade-in" style={{ animationDelay: "0.3s" }}>
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/80 dark:bg-zinc-800/80 backdrop-blur-sm border border-amber-200 dark:border-zinc-700">
              <Shield className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              <span className="text-sm text-zinc-700 dark:text-zinc-300 font-medium">100% Asli Bersertifikat</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/80 dark:bg-zinc-800/80 backdrop-blur-sm border border-amber-200 dark:border-zinc-700">
              <Truck className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              <span className="text-sm text-zinc-700 dark:text-zinc-300 font-medium">Pengiriman Asuransi</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/80 dark:bg-zinc-800/80 backdrop-blur-sm border border-amber-200 dark:border-zinc-700">
              <Award className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              <span className="text-sm text-zinc-700 dark:text-zinc-300 font-medium">Garansi Buyback</span>
            </div>
          </div>
        </div>
        
        {/* Scroll indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="p-2 rounded-full bg-amber-100 dark:bg-amber-500/20 border border-amber-300 dark:border-amber-500/30">
            <ChevronDown className="w-5 h-5 text-amber-600 dark:text-amber-400" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
