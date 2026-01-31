import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface ContactSettings {
  whatsapp_number: string;
  phone_number: string;
  email: string;
}

const DEFAULT_SETTINGS: ContactSettings = {
  whatsapp_number: "6282261152700",
  phone_number: "+62 822-6115-2700",
  email: "info@logammulia.com",
};

export const useContactSettings = () => {
  return useQuery({
    queryKey: ["contact-settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("settings")
        .select("key, value")
        .in("key", ["whatsapp_number", "phone_number", "contact_email"]);

      if (error) throw error;

      const settings: ContactSettings = { ...DEFAULT_SETTINGS };
      
      data?.forEach((item) => {
        if (item.key === "whatsapp_number" && item.value) {
          settings.whatsapp_number = item.value;
        } else if (item.key === "phone_number" && item.value) {
          settings.phone_number = item.value;
        } else if (item.key === "contact_email" && item.value) {
          settings.email = item.value;
        }
      });

      return settings;
    },
  });
};

export const useUpdateContactSettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (settings: Partial<ContactSettings>) => {
      const updates = [];

      if (settings.whatsapp_number !== undefined) {
        updates.push(
          supabase
            .from("settings")
            .upsert({ key: "whatsapp_number", value: settings.whatsapp_number }, { onConflict: "key" })
        );
      }

      if (settings.phone_number !== undefined) {
        updates.push(
          supabase
            .from("settings")
            .upsert({ key: "phone_number", value: settings.phone_number }, { onConflict: "key" })
        );
      }

      if (settings.email !== undefined) {
        updates.push(
          supabase
            .from("settings")
            .upsert({ key: "contact_email", value: settings.email }, { onConflict: "key" })
        );
      }

      const results = await Promise.all(updates);
      const errors = results.filter((r) => r.error);
      if (errors.length > 0) {
        throw new Error("Failed to update settings");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contact-settings"] });
    },
  });
};
