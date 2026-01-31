import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useAdmin } from '@/hooks/useAdmin';
import { botDetector } from '@/utils/security/botDetector';
import { Shield, Loader2, AlertTriangle, Eye, EyeOff, Lock } from 'lucide-react';
import { toast } from 'sonner';

const AdminLogin = () => {
  const navigate = useNavigate();
  const { signIn, isLoading, isAdmin, user, error } = useAdmin();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [botCheckPassed, setBotCheckPassed] = useState(true);

  // Run bot detection on mount
  useEffect(() => {
    const result = botDetector.detect();
    if (result.isBot) {
      setBotCheckPassed(false);
      toast.error('Aktivitas mencurigakan terdeteksi');
    }
  }, []);

  // Obfuscated admin path
  const ADMIN_DASHBOARD_PATH = "/774a4656a61940c59a0f5df32b7784d6/dashboard";

  // Redirect if already logged in as admin
  useEffect(() => {
    if (!isLoading && user && isAdmin) {
      navigate(ADMIN_DASHBOARD_PATH);
    }
  }, [isLoading, user, isAdmin, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!botCheckPassed) {
      toast.error('Tidak dapat melanjutkan karena aktivitas mencurigakan');
      return;
    }

    if (!email || !password) {
      toast.error('Email dan password harus diisi');
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await signIn(email, password);
      
      if (result.error) {
        toast.error(result.error.message || 'Gagal login');
      } else {
        toast.success('Login berhasil');
      }
    } catch (err) {
      toast.error('Terjadi kesalahan saat login');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-zinc-900 to-zinc-800">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 p-4">
      <div className="w-full max-w-md">
        {/* Security Badge */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-amber-500/20 to-amber-600/20 border border-amber-500/30 mb-4">
            <Shield className="w-8 h-8 text-amber-500" />
          </div>
          <h1 className="text-2xl font-bold text-white">Admin Panel</h1>
          <p className="text-zinc-400 text-sm mt-1">Secure Access Only</p>
        </div>

        <Card className="bg-zinc-800/50 border-zinc-700/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Lock className="w-5 h-5 text-amber-500" />
              Login Admin
            </CardTitle>
            <CardDescription className="text-zinc-400">
              Masukkan kredensial admin Anda
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!botCheckPassed && (
              <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0" />
                <p className="text-sm text-red-400">
                  Aktivitas mencurigakan terdeteksi. Silakan coba lagi nanti.
                </p>
              </div>
            )}

            {error && (
              <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30">
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-zinc-300">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isSubmitting || !botCheckPassed}
                  className="bg-zinc-700/50 border-zinc-600 text-white placeholder:text-zinc-500 focus:border-amber-500 focus:ring-amber-500/20"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-zinc-300">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isSubmitting || !botCheckPassed}
                    className="bg-zinc-700/50 border-zinc-600 text-white placeholder:text-zinc-500 focus:border-amber-500 focus:ring-amber-500/20 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-300"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-zinc-900 font-semibold"
                disabled={isSubmitting || !botCheckPassed}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Memproses...
                  </>
                ) : (
                  'Login'
                )}
              </Button>
            </form>

            <div className="mt-6 pt-4 border-t border-zinc-700/50">
              <p className="text-xs text-zinc-500 text-center">
                🔒 Koneksi terenkripsi • Akses terbatas
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminLogin;
