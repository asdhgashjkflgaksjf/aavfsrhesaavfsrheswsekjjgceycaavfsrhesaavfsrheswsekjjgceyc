import { MessageCircle } from "lucide-react";
import { useContactSettings } from "@/hooks/useContactSettings";

const FloatingWhatsApp = () => {
  const { data: contactSettings } = useContactSettings();
  const whatsappNumber = contactSettings?.whatsapp_number || "6282261152700";

  return (
    <a
      href={`https://wa.me/${whatsappNumber}?text=Halo,%20saya%20ingin%20bertanya%20tentang%20emas%20Antam`}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-[#25D366] hover:bg-[#20BA5C] rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 group"
      aria-label="Chat via WhatsApp"
    >
      <MessageCircle className="w-7 h-7 text-white" />
      
      {/* Tooltip */}
      <span className="absolute right-full mr-3 px-3 py-2 bg-card border border-border rounded-lg text-sm font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
        Chat dengan kami
      </span>
      
      {/* Ping animation */}
      <span className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-30" />
    </a>
  );
};

export default FloatingWhatsApp;
