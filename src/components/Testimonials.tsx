import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    name: "Budi Santoso",
    location: "Jakarta",
    rating: 5,
    text: "Pelayanan sangat profesional dan emas tiba dengan aman. Sertifikat lengkap dan asli. Sangat recommended untuk investasi emas!",
    avatar: "BS",
  },
  {
    name: "Sri Wahyuni",
    location: "Surabaya",
    rating: 5,
    text: "Sudah 3x order di sini, selalu puas. Harga kompetitif dan pengiriman cepat dengan asuransi. Terima kasih Logam Mulia!",
    avatar: "SW",
  },
  {
    name: "Ahmad Fauzi",
    location: "Bandung",
    rating: 5,
    text: "Pertama kali beli emas online dan tidak mengecewakan. Proses mudah, CS responsif, dan produk sesuai deskripsi.",
    avatar: "AF",
  },
  {
    name: "Dewi Lestari",
    location: "Medan",
    rating: 5,
    text: "Investasi emas jadi mudah dengan Logam Mulia. Buyback juga tersedia dengan harga bagus. Terpercaya!",
    avatar: "DL",
  },
];

const Testimonials = () => {
  return (
    <section id="testimoni" className="py-20 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-secondary/20 to-background" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/30 mb-4">
            <Star className="w-4 h-4 text-primary fill-primary" />
            <span className="text-sm text-primary font-medium">Testimoni Pelanggan</span>
          </div>
          <h2 className="font-serif text-4xl md:text-5xl font-bold mb-4">
            Apa Kata <span className="text-gold-gradient">Mereka?</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Ribuan pelanggan puas telah mempercayakan investasi emas mereka kepada kami.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {testimonials.map((testimonial, index) => (
            <div 
              key={testimonial.name}
              className="card-luxury rounded-xl p-6 hover-lift animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <Quote className="w-8 h-8 text-primary/30 mb-4" />
              
              <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                "{testimonial.text}"
              </p>
              
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-gold flex items-center justify-center">
                  <span className="text-primary-foreground font-semibold text-sm">
                    {testimonial.avatar}
                  </span>
                </div>
                <div>
                  <p className="font-semibold text-foreground">{testimonial.name}</p>
                  <p className="text-xs text-muted-foreground">{testimonial.location}</p>
                </div>
              </div>
              
              <div className="flex gap-1 mt-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-primary fill-primary" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
