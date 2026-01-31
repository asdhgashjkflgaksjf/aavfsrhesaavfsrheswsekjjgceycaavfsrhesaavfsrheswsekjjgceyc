import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { Shield, Loader2, CheckCircle, AlertTriangle, Lock, Mail, Key } from 'lucide-react';
import { toast } from 'sonner';

const AdminSetup = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingAdmin, setIsCheckingAdmin] = useState(true);
  const [adminExists, setAdminExists] = useState(false);
  const [setupComplete, setSetupComplete] = useState(false);
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    setupKey: '',
  });

  // Check if admin already exists
  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const { data } = await supabase
          .from('user_roles')
          .select('id')
          .eq('role', 'admin')
          .limit(1);
        
        if (data && data.length > 0) {
          setAdminExists(true);
        }
      } catch (err) {
        console.error('Error checking admin:', err);
      } finally {
        setIsCheckingAdmin(false);
      }
    };
    checkAdmin();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('setup-admin', {
        body: {
          email: formData.email,
          password: formData.password,
          setupKey: formData.setupKey,
        },
      });

      if (error) {
        throw new Error(error.message || 'Gagal membuat admin');
      }

      if (data?.exists) {
        toast.error('Admin sudah ada!', {
          description: 'Silakan login dengan akun admin yang sudah terdaftar.',
        });
        setAdminExists(true);
        return;
      }

      if (data?.success) {
        setSetupComplete(true);
        toast.success('Admin berhasil dibuat!', {
          description: `Email: ${formData.email}`,
        });
      }
    } catch (err: any) {
      console.error('Setup error:', err);
      toast.error('Gagal membuat admin', {
        description: err.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isCheckingAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-zinc-900 to-zinc-800">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
      </div>
    );
  }

  if (adminExists || setupComplete) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 p-4">
        <Card className="w-full max-w-md bg-zinc-800/50 border-zinc-700/50 backdrop-blur-sm">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 border border-emerald-500/30">
                <CheckCircle className="w-8 h-8 text-emerald-500" />
              </div>
              <h2 className="text-xl font-bold text-white">
                {setupComplete ? 'Admin Berhasil Dibuat!' : 'Admin Sudah Ada'}
              </h2>
              <p className="text-zinc-400 text-sm">
                {setupComplete 
                  ? 'Silakan login dengan akun yang baru dibuat.' 
                  : 'Akun admin sudah terdaftar dalam sistem.'
                }
              </p>
              <Button
                onClick={() => navigate('/774a4656a61940c59a0f5df32b7784d6')}
                className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-zinc-900 font-semibold"
              >
                Lanjut ke Login Admin
              </Button>
            </div>
          </CardContent>
        </Card>
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
          <h1 className="text-2xl font-bold text-white">Setup Admin</h1>
          <p className="text-zinc-400 text-sm mt-1">Konfigurasi akun administrator pertama</p>
        </div>

        <Card className="bg-zinc-800/50 border-zinc-700/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Lock className="w-5 h-5 text-amber-500" />
              Buat Akun Admin
            </CardTitle>
            <CardDescription className="text-zinc-400">
              Masukkan kredensial untuk akun admin
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4 p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-amber-200">
                <p className="font-medium">Peringatan Keamanan</p>
                <p className="text-amber-300/80 mt-1">
                  Pastikan Anda menyimpan kredensial dengan aman.
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-zinc-300 flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Email Admin
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  disabled={isLoading}
                  className="bg-zinc-700/50 border-zinc-600 text-white placeholder:text-zinc-500 focus:border-amber-500 focus:ring-amber-500/20"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-zinc-300 flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  disabled={isLoading}
                  className="bg-zinc-700/50 border-zinc-600 text-white placeholder:text-zinc-500 focus:border-amber-500 focus:ring-amber-500/20"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="setupKey" className="text-zinc-300 flex items-center gap-2">
                  <Key className="w-4 h-4" />
                  Setup Key
                </Label>
                <Input
                  id="setupKey"
                  type="password"
                  value={formData.setupKey}
                  onChange={(e) => setFormData(prev => ({ ...prev, setupKey: e.target.value }))}
                  disabled={isLoading}
                  className="bg-zinc-700/50 border-zinc-600 text-white placeholder:text-zinc-500 focus:border-amber-500 focus:ring-amber-500/20"
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-zinc-900 font-semibold"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Memproses...
                  </>
                ) : (
                  'Buat Admin'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminSetup;
