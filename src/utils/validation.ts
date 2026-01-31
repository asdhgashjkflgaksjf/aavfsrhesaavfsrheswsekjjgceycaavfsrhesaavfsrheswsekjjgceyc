import { z } from "zod";

// Indonesian phone number validation (08xxxxxxxxxx or +628xxxxxxxxxx)
const phoneRegex = /^(\+62|62|0)8[1-9][0-9]{7,10}$/;

// Name validation - must have at least 2 words, letters only
const nameRegex = /^[a-zA-Z\u00C0-\u024F\s]+$/;

export const customerFormSchema = z.object({
  name: z
    .string()
    .min(6, "Mohon masukkan nama lengkap Anda")
    .max(100, "Nama terlalu panjang")
    .regex(nameRegex, "Nama tidak boleh mengandung angka atau simbol")
    .refine(
      (val) => val.trim().split(/\s+/).length >= 2,
      "Mohon masukkan nama depan dan belakang"
    ),
  
  email: z
    .string()
    .email("Alamat email tidak valid")
    .max(255, "Email terlalu panjang")
    .refine(
      (val) => !val.includes("test@") && !val.includes("example.com"),
      "Mohon gunakan alamat email aktif Anda"
    ),
  
  phone: z
    .string()
    .min(10, "Nomor WhatsApp terlalu pendek")
    .max(15, "Nomor WhatsApp terlalu panjang")
    .regex(phoneRegex, "Format nomor tidak valid, contoh: 08123456789")
    .refine(
      (val) => {
        // Check for repeated digits (like 08111111111)
        const digits = val.replace(/\D/g, "");
        const uniqueDigits = new Set(digits.slice(-8));
        return uniqueDigits.size >= 3;
      },
      "Mohon masukkan nomor WhatsApp yang valid"
    ),
  
  address: z
    .string()
    .min(20, "Mohon lengkapi alamat pengiriman Anda")
    .max(500, "Alamat terlalu panjang")
    .refine(
      (val) => val.trim().split(/\s+/).length >= 5,
      "Alamat belum lengkap, sertakan nama jalan, nomor, kota & kode pos"
    )
    .refine(
      (val) => {
        // Check for common gibberish patterns
        const lowercased = val.toLowerCase();
        const gibberishPatterns = [
          /^[a-z]{1,2}(\s[a-z]{1,2})+$/,
          /(.)\1{4,}/,
          /asdf|qwerty|zxcv/i,
        ];
        return !gibberishPatterns.some((pattern) => pattern.test(lowercased));
      },
      "Mohon masukkan alamat yang valid"
    ),
  
  shippingMethod: z.string().min(1, "Pilih metode pengiriman"),
});

export type CustomerFormData = z.infer<typeof customerFormSchema>;

export const validateField = (
  field: keyof CustomerFormData,
  value: string,
  fullData?: Partial<CustomerFormData>
): { isValid: boolean; error?: string } => {
  try {
    const schema = customerFormSchema.shape[field];
    schema.parse(value);
    return { isValid: true };
  } catch (err) {
    if (err instanceof z.ZodError) {
      return { isValid: false, error: err.errors[0]?.message };
    }
    return { isValid: false, error: "Data tidak valid" };
  }
};

export const validateForm = (
  data: Partial<CustomerFormData>
): { isValid: boolean; errors: Record<string, string> } => {
  const result = customerFormSchema.safeParse(data);
  
  if (result.success) {
    return { isValid: true, errors: {} };
  }
  
  const errors: Record<string, string> = {};
  result.error.errors.forEach((err) => {
    const field = err.path[0] as string;
    if (!errors[field]) {
      errors[field] = err.message;
    }
  });
  
  return { isValid: false, errors };
};
