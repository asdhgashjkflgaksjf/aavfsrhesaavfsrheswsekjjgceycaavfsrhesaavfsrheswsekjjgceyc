import { useTheme } from "next-themes";
import { Toaster as Sonner, toast } from "sonner";
import { CheckCircle, XCircle, AlertTriangle, Info, Loader2 } from "lucide-react";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      position="top-center"
      expand={true}
      richColors={false}
      closeButton={true}
      duration={4000}
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-zinc-800/95 group-[.toaster]:backdrop-blur-xl group-[.toaster]:text-foreground group-[.toaster]:border group-[.toaster]:border-zinc-700/50 group-[.toaster]:shadow-2xl group-[.toaster]:shadow-black/20 group-[.toaster]:rounded-xl",
          title: "group-[.toast]:font-semibold group-[.toast]:text-white",
          description: "group-[.toast]:text-zinc-400 group-[.toast]:text-sm",
          actionButton: 
            "group-[.toast]:bg-gradient-to-r group-[.toast]:from-amber-500 group-[.toast]:to-amber-600 group-[.toast]:text-zinc-900 group-[.toast]:font-semibold group-[.toast]:hover:from-amber-600 group-[.toast]:hover:to-amber-700",
          cancelButton: 
            "group-[.toast]:bg-zinc-700/50 group-[.toast]:text-zinc-300 group-[.toast]:hover:bg-zinc-600/50",
          closeButton:
            "group-[.toast]:bg-zinc-700/50 group-[.toast]:text-zinc-400 group-[.toast]:hover:bg-zinc-600/50 group-[.toast]:hover:text-white group-[.toast]:border-zinc-600",
          success:
            "group-[.toaster]:border-emerald-500/30 group-[.toaster]:bg-gradient-to-r group-[.toaster]:from-zinc-800/95 group-[.toaster]:to-emerald-900/20",
          error:
            "group-[.toaster]:border-red-500/30 group-[.toaster]:bg-gradient-to-r group-[.toaster]:from-zinc-800/95 group-[.toaster]:to-red-900/20",
          warning:
            "group-[.toaster]:border-amber-500/30 group-[.toaster]:bg-gradient-to-r group-[.toaster]:from-zinc-800/95 group-[.toaster]:to-amber-900/20",
          info:
            "group-[.toaster]:border-blue-500/30 group-[.toaster]:bg-gradient-to-r group-[.toaster]:from-zinc-800/95 group-[.toaster]:to-blue-900/20",
          loading:
            "group-[.toaster]:border-amber-500/30",
        },
      }}
      icons={{
        success: <CheckCircle className="w-5 h-5 text-emerald-400" />,
        error: <XCircle className="w-5 h-5 text-red-400" />,
        warning: <AlertTriangle className="w-5 h-5 text-amber-400" />,
        info: <Info className="w-5 h-5 text-blue-400" />,
        loading: <Loader2 className="w-5 h-5 text-amber-400 animate-spin" />,
      }}
      {...props}
    />
  );
};

export { Toaster, toast };
