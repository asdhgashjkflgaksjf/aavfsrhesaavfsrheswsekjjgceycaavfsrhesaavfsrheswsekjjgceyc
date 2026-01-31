import { Shield, AlertTriangle, BadgeCheck, Award } from "lucide-react";
import ThemeToggle from "./ThemeToggle";
import logoAntam from "@/assets/logo-antam.png";
const Header = () => {
  return <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4">
        {/* Fraud Warning Banner - Responsive */}
        <div className="flex items-center justify-center gap-1.5 sm:gap-2 py-1.5 sm:py-2 text-[10px] sm:text-xs bg-destructive/10 border-b border-destructive/20 -mx-4 px-4">
          <AlertTriangle className="w-3 h-3 text-destructive flex-shrink-0" />
          <span className="text-destructive font-medium text-center">
            Hati-hati penipuan! Transaksi resmi hanya melalui website ini.
          </span>
        </div>
        
        {/* Top bar with badges - Hidden on mobile */}
        <div className="hidden sm:flex items-center justify-between py-2 text-xs border-b border-border/50">
          <div className="flex items-center gap-4 text-muted-foreground">
            <span className="flex items-center gap-1">
              <Shield className="w-3 h-3 text-primary" />
              100% Emas Asli Bersertifikat
            </span>
            <span className="flex items-center gap-1">
              <BadgeCheck className="w-3 h-3 text-primary" />
              LBMA Certified
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-muted-foreground flex items-center gap-1">
              <Award className="w-3 h-3 text-primary" />
              Official Partner PT ANTAM Tbk
            </span>
          </div>
        </div>
        
        {/* Main header */}
        <div className="flex items-center justify-between py-3 sm:py-4">
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Antam Logo */}
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg overflow-hidden bg-white dark:bg-white/10 p-1 flex items-center justify-center">
              <img alt="Logo Antam" className="w-full h-full object-contain border-secondary-foreground" src="/lovable-uploads/31590dc9-b940-4c7f-8ec1-01abf1e1e894.png" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-serif font-bold text-gold-gradient">LOGAM MULIA</h1>
              <p className="text-[10px] sm:text-xs text-muted-foreground">Official Butik Mas Antam</p>
            </div>
            
            {/* Trust badges inline - Desktop only */}
            <div className="hidden lg:flex items-center gap-2 ml-4 pl-4 border-l border-border">
              <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-primary/10 text-[10px] text-primary font-medium">
                <BadgeCheck className="w-3 h-3" />
                Verified
              </div>
              <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-green-500/10 text-[10px] text-green-600 dark:text-green-400 font-medium">
                <Shield className="w-3 h-3" />
                Trusted
              </div>
            </div>
          </div>
          
          <nav className="hidden md:flex items-center gap-6">
            <a href="#harga" className="text-sm text-muted-foreground hover:text-primary transition-colors">Harga Hari Ini</a>
            <a href="#produk" className="text-sm text-muted-foreground hover:text-primary transition-colors">Produk</a>
            <a href="#testimoni" className="text-sm text-muted-foreground hover:text-primary transition-colors">Testimoni</a>
            <a href="#kontak" className="text-sm text-muted-foreground hover:text-primary transition-colors">Kontak</a>
          </nav>
          
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Mobile trust badge */}
            <div className="flex sm:hidden items-center gap-1 px-2 py-1 rounded-full bg-primary/10 text-[10px] text-primary font-medium">
              <BadgeCheck className="w-3 h-3" />
              Official
            </div>
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>;
};
export default Header;