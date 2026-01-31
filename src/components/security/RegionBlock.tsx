import React from 'react';
import { ShieldX, Globe, AlertTriangle, Lock } from 'lucide-react';

const RegionBlock: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[hsl(30,15%,4%)] via-[hsl(30,10%,8%)] to-[hsl(30,15%,4%)] flex items-center justify-center p-4">
      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-md w-full">
        {/* Main card */}
        <div className="bg-gradient-to-b from-[hsl(30,10%,10%)] to-[hsl(30,10%,6%)] rounded-2xl border border-red-500/20 shadow-2xl overflow-hidden">
          {/* Top accent bar */}
          <div className="h-1 bg-gradient-to-r from-red-500 via-orange-500 to-red-500" />
          
          <div className="p-8 text-center">
            {/* Icon with glow */}
            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-24 h-24 bg-red-500/20 rounded-full blur-xl animate-pulse" />
              </div>
              <div className="relative w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-red-500/20 to-orange-500/20 border border-red-500/30 flex items-center justify-center">
                <ShieldX className="w-10 h-10 text-red-400" />
              </div>
            </div>
            
            {/* Title */}
            <h1 className="text-2xl font-serif font-bold text-[hsl(40,20%,95%)] mb-2">
              Akses Dibatasi
            </h1>
            
            <p className="text-[hsl(30,10%,55%)] text-sm mb-6">
              Layanan ini hanya tersedia untuk wilayah Indonesia
            </p>
            
            {/* Info box */}
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-6">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <div className="text-left">
                  <p className="text-sm text-red-300 font-medium mb-1">
                    Lokasi Tidak Terdeteksi di Indonesia
                  </p>
                  <p className="text-xs text-[hsl(30,10%,55%)]">
                    Sistem kami mendeteksi bahwa Anda mengakses dari luar wilayah yang didukung.
                  </p>
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[hsl(43,30%,20%)]/30"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="px-3 bg-[hsl(30,10%,8%)] text-[hsl(30,10%,55%)] text-xs">
                  INFO
                </span>
              </div>
            </div>

            {/* Steps to resolve */}
            <div className="space-y-3 text-left mb-6">
              <div className="flex items-center gap-3 p-3 bg-[hsl(30,8%,12%)]/50 rounded-lg border border-[hsl(43,30%,20%)]/20">
                <div className="w-8 h-8 rounded-full bg-[hsl(43,74%,49%)]/10 flex items-center justify-center flex-shrink-0">
                  <Globe className="w-4 h-4 text-[hsl(43,74%,49%)]" />
                </div>
                <div>
                  <p className="text-sm text-[hsl(40,20%,95%)] font-medium">Gunakan Koneksi Indonesia</p>
                  <p className="text-xs text-[hsl(30,10%,55%)]">Pastikan IP Anda berasal dari Indonesia</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-[hsl(30,8%,12%)]/50 rounded-lg border border-[hsl(43,30%,20%)]/20">
                <div className="w-8 h-8 rounded-full bg-[hsl(43,74%,49%)]/10 flex items-center justify-center flex-shrink-0">
                  <Lock className="w-4 h-4 text-[hsl(43,74%,49%)]" />
                </div>
                <div>
                  <p className="text-sm text-[hsl(40,20%,95%)] font-medium">Nonaktifkan VPN</p>
                  <p className="text-xs text-[hsl(30,10%,55%)]">VPN dapat mengubah lokasi yang terdeteksi</p>
                </div>
              </div>
            </div>

            {/* Error code */}
            <div className="bg-[hsl(30,8%,12%)] rounded-lg p-3 border border-[hsl(43,30%,20%)]/20">
              <p className="text-xs font-mono text-[hsl(30,10%,55%)]">
                Error Code: <span className="text-red-400">REGION_BLOCKED_ID</span>
              </p>
            </div>
          </div>

          {/* Bottom security badge */}
          <div className="bg-[hsl(30,8%,6%)] border-t border-[hsl(43,30%,20%)]/20 px-6 py-3">
            <p className="text-xs text-[hsl(30,10%,55%)] text-center flex items-center justify-center gap-2">
              <Lock className="w-3 h-3" />
              Dilindungi oleh Sistem Keamanan Premium
            </p>
          </div>
        </div>

        {/* Support link */}
        <p className="text-center mt-4 text-xs text-[hsl(30,10%,55%)]">
          Butuh bantuan? Hubungi{' '}
          <a 
            href="https://wa.me/6281234567890" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-[hsl(43,74%,49%)] hover:underline"
          >
            Customer Support
          </a>
        </p>
      </div>
    </div>
  );
};

export default RegionBlock;