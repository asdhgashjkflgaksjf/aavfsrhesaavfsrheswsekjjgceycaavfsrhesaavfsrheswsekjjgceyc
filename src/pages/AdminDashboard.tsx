import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAdmin } from '@/hooks/useAdmin';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Shield, LogOut, Package, CheckCircle, Clock, Truck, 
  Eye, Search, Filter, RefreshCw, Loader2, AlertTriangle,
  X, User, Phone, Mail, MapPin, Calendar, CreditCard, Image,
  Key, Settings, Trash2, ShoppingBag, QrCode, TrendingUp, Phone as PhoneIcon,
  MessageCircle, Download, FileText, Printer
} from 'lucide-react';
import { toast } from 'sonner';
import html2canvas from 'html2canvas';
import ChangePasswordModal from '@/components/admin/ChangePasswordModal';
import ProductManagement from '@/components/admin/ProductManagement';
import QRCodeSettings from '@/components/admin/QRCodeSettings';
import GoldPriceManagement from '@/components/admin/GoldPriceManagement';
import ContactSettings from '@/components/admin/ContactSettings';
import OrderInvoice from '@/components/admin/OrderInvoice';
import PaymentProofImage from '@/components/admin/PaymentProofImage';

interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  customer_address: string;
  product_name: string;
  product_weight: string;
  product_price: number;
  quantity: number;
  total_price: number;
  shipping_method: string;
  status: string;
  confirmation_code: string | null;
  payment_proof_url: string | null;
  created_at: string;
  updated_at: string;
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const getStatusBadge = (status: string) => {
  const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; className: string }> = {
    'pending_payment': { label: 'Menunggu Pembayaran', variant: 'secondary', className: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
    'payment_uploaded': { label: 'Bukti Diupload', variant: 'outline', className: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
    'processing': { label: 'Diproses', variant: 'default', className: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
    'shipped': { label: 'Dikirim', variant: 'default', className: 'bg-green-500/20 text-green-400 border-green-500/30' },
    'completed': { label: 'Selesai', variant: 'default', className: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
    'cancelled': { label: 'Dibatalkan', variant: 'destructive', className: 'bg-red-500/20 text-red-400 border-red-500/30' }
  };

  const config = statusConfig[status] || { label: status, variant: 'secondary', className: '' };
  
  return (
    <Badge variant={config.variant} className={config.className}>
      {config.label}
    </Badge>
  );
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user, isAdmin, isLoading: authLoading, signOut } = useAdmin();
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [isDownloadingInvoice, setIsDownloadingInvoice] = useState(false);
  const invoiceRef = useRef<HTMLDivElement>(null);

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    processing: 0,
    shipped: 0,
    revenue: 0
  });

  // Obfuscated admin path
  const ADMIN_LOGIN_PATH = "/774a4656a61940c59a0f5df32b7784d6";

  // Redirect if not admin
  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) {
      navigate(ADMIN_LOGIN_PATH);
    }
  }, [authLoading, user, isAdmin, navigate]);

  // Fetch orders
  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const ordersData = data as Order[];
      setOrders(ordersData);
      setFilteredOrders(ordersData);

      // Calculate stats
      setStats({
        total: ordersData.length,
        pending: ordersData.filter(o => o.status === 'pending_payment' || o.status === 'payment_uploaded').length,
        processing: ordersData.filter(o => o.status === 'processing').length,
        shipped: ordersData.filter(o => o.status === 'shipped' || o.status === 'completed').length,
        revenue: ordersData
          .filter(o => o.status !== 'cancelled')
          .reduce((sum, o) => sum + o.total_price, 0)
      });
    } catch (err) {
      console.error('Error fetching orders:', err);
      toast.error('Gagal memuat data pesanan');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user && isAdmin) {
      fetchOrders();
    }
  }, [user, isAdmin]);

  // Filter orders
  useEffect(() => {
    let filtered = orders;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(order =>
        order.order_number.toLowerCase().includes(query) ||
        order.customer_name.toLowerCase().includes(query) ||
        order.customer_email.toLowerCase().includes(query) ||
        order.customer_phone.includes(query)
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    setFilteredOrders(filtered);
  }, [searchQuery, statusFilter, orders]);

  // Update order status with WhatsApp notification
  const updateOrderStatus = async (orderId: string, newStatus: string, trackingNumber?: string) => {
    setIsUpdating(true);
    try {
      // Find the order to get customer details
      const orderToUpdate = orders.find(o => o.id === orderId);
      if (!orderToUpdate) {
        throw new Error('Order not found');
      }

      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);

      if (error) throw error;

      // Prepare WhatsApp notification
      try {
        const { data: notifData, error: notifError } = await supabase.functions.invoke('send-whatsapp-notification', {
          body: {
            orderId,
            newStatus,
            customerName: orderToUpdate.customer_name,
            customerPhone: orderToUpdate.customer_phone,
            orderNumber: orderToUpdate.order_number,
            productName: orderToUpdate.product_name,
            productWeight: orderToUpdate.product_weight,
            quantity: orderToUpdate.quantity,
            totalPrice: orderToUpdate.total_price,
            shippingMethod: orderToUpdate.shipping_method,
            trackingNumber
          }
        });

        if (notifError) {
          console.error('WhatsApp notification error:', notifError);
        } else if (notifData?.whatsappUrl) {
          // Open WhatsApp in new tab
          window.open(notifData.whatsappUrl, '_blank');
          toast.success('Status diperbarui! Silakan kirim pesan WhatsApp ke pelanggan.');
        }
      } catch (notifErr) {
        console.error('Error preparing WhatsApp notification:', notifErr);
        toast.success('Status pesanan berhasil diperbarui');
      }

      fetchOrders();
      setSelectedOrder(null);
    } catch (err) {
      console.error('Error updating order:', err);
      toast.error('Gagal memperbarui status pesanan');
    } finally {
      setIsUpdating(false);
    }
  };

const handleSignOut = async () => {
    await signOut();
    navigate(ADMIN_LOGIN_PATH);
  };

  // Generate WhatsApp contact URL with professional message
  const generateWhatsAppContactUrl = (order: Order): string => {
    // Clean phone number - remove all non-numeric, add 62 country code
    let phone = order.customer_phone.replace(/\D/g, '');
    if (phone.startsWith('0')) {
      phone = '62' + phone.substring(1);
    } else if (!phone.startsWith('62')) {
      phone = '62' + phone;
    }

    const message = `Assalamualaikum Bapak/Ibu *${order.customer_name}*,

Perkenalkan, saya dari *Logam Mulia Gold*.

Saya ingin menghubungi Anda terkait pesanan berikut:

📦 *Detail Pesanan*
━━━━━━━━━━━━━━━━━━
No. Pesanan: *${order.order_number}*
Produk: ${order.product_name}
Berat: ${order.product_weight}
Jumlah: ${order.quantity} pcs
Total: ${formatCurrency(order.total_price)}
Pengiriman: ${order.shipping_method}
Status: ${getStatusLabel(order.status)}
━━━━━━━━━━━━━━━━━━

Mohon konfirmasi apakah data pesanan di atas sudah sesuai.

Terima kasih atas kepercayaan Anda berbelanja di *Logam Mulia Gold*. 🙏

_Pesan ini dikirim oleh Admin Logam Mulia Gold_`;

    return `https://api.whatsapp.com/send/?phone=${phone}&text=${encodeURIComponent(message)}`;
  };

  const getStatusLabel = (status: string): string => {
    const labels: Record<string, string> = {
      'pending_payment': 'Menunggu Pembayaran',
      'payment_uploaded': 'Bukti Pembayaran Diupload',
      'processing': 'Sedang Diproses',
      'shipped': 'Dalam Pengiriman',
      'completed': 'Selesai',
      'cancelled': 'Dibatalkan'
    };
    return labels[status] || status;
  };

  const handleWhatsAppContact = (order: Order) => {
    const url = generateWhatsAppContactUrl(order);
    window.open(url, '_blank');
  };

  // Helper to convert image to base64 for html2canvas compatibility
  const imageToBase64 = (imgSrc: string): Promise<string> => {
    return new Promise<string>((resolve, reject) => {
      const imgEl = document.createElement('img');
      imgEl.crossOrigin = 'anonymous';
      imgEl.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = imgEl.naturalWidth;
        canvas.height = imgEl.naturalHeight;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(imgEl, 0, 0);
          resolve(canvas.toDataURL('image/png'));
        } else {
          reject(new Error('Failed to get canvas context'));
        }
      };
      imgEl.onerror = () => reject(new Error('Failed to load image'));
      imgEl.src = imgSrc;
    });
  };

  // Download Invoice as Image
  const handleDownloadInvoice = async (order: Order) => {
    setIsDownloadingInvoice(true);
    
    // Set selected order first to render the invoice
    setSelectedOrder(order);
    
    // Wait for render
    await new Promise(resolve => setTimeout(resolve, 500));

    // Ensure fonts are ready
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (document as any).fonts?.ready;
    } catch {
      // ignore
    }
    
    try {
      if (invoiceRef.current) {
        const el = invoiceRef.current;

        // Convert all images to base64 data URLs for html2canvas compatibility
        const imgs = Array.from(el.querySelectorAll('img'));
        const originalSrcs: string[] = [];
        
        for (const img of imgs) {
          originalSrcs.push(img.src);
          try {
            // Skip if already base64
            if (!img.src.startsWith('data:')) {
              const base64 = await imageToBase64(img.src);
              img.src = base64;
            }
          } catch {
            console.warn('Could not convert image to base64:', img.src);
          }
        }

        // Wait for images to update
        await new Promise(resolve => setTimeout(resolve, 100));

        const canvas = await html2canvas(el, {
          scale: 3,
          backgroundColor: '#ffffff',
          useCORS: true,
          allowTaint: true,
          logging: false,
          imageTimeout: 15000,
          scrollX: 0,
          scrollY: 0,
          width: el.scrollWidth,
          height: el.scrollHeight,
          onclone: (doc) => {
            const wrapper = doc.getElementById('invoice-capture-wrapper');
            if (wrapper) {
              wrapper.setAttribute(
                'style',
                'position:absolute;left:0;top:0;transform:none;width:650px;background:#fff;'
              );
            }
          },
        });
        
        // Restore original sources
        imgs.forEach((img, i) => {
          if (originalSrcs[i]) {
            img.src = originalSrcs[i];
          }
        });
        
        const link = document.createElement('a');
        link.download = `Invoice-${order.order_number}.png`;
        link.href = canvas.toDataURL('image/png', 1.0);
        link.click();
        
        toast.success('Invoice berhasil didownload!');
      }
    } catch (err) {
      console.error('Error downloading invoice:', err);
      toast.error('Gagal mendownload invoice');
    } finally {
      setIsDownloadingInvoice(false);
    }
  };

  // Print Invoice
  const handlePrintInvoice = () => {
    if (invoiceRef.current) {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
          <head>
            <title>Invoice - ${selectedOrder?.order_number}</title>
            <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
            <style>
              @media print {
                body { margin: 0; padding: 20px; }
              }
            </style>
          </head>
          <body>
            ${invoiceRef.current.outerHTML}
            <script>
              window.onload = function() { window.print(); window.close(); }
            </script>
          </body>
          </html>
        `);
        printWindow.document.close();
      }
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-zinc-900 to-zinc-800">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
      </div>
    );
  }

  if (!user || !isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900">
      {/* Header */}
      <header className="bg-zinc-800/50 backdrop-blur-sm border-b border-zinc-700/50 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center">
                <Shield className="w-5 h-5 text-zinc-900" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-white">Admin Dashboard</h1>
                <p className="text-xs text-zinc-400">{user.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowPasswordModal(true)}
                className="text-zinc-400 hover:text-white hover:bg-zinc-700"
              >
                <Key className="w-4 h-4 mr-2" />
                Ubah Password
              </Button>
              <Link to="/">
                <Button variant="outline" size="sm" className="border-zinc-600 text-zinc-300 hover:bg-zinc-700">
                  Lihat Toko
                </Button>
              </Link>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSignOut}
                className="text-zinc-400 hover:text-white hover:bg-zinc-700"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-zinc-800/50 border-zinc-700/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                  <Package className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{stats.total}</p>
                  <p className="text-xs text-zinc-400">Total Pesanan</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-zinc-800/50 border-zinc-700/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-yellow-500/20 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-yellow-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{stats.pending}</p>
                  <p className="text-xs text-zinc-400">Menunggu</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-zinc-800/50 border-zinc-700/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                  <Truck className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{stats.processing}</p>
                  <p className="text-xs text-zinc-400">Diproses</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-zinc-800/50 border-zinc-700/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <p className="text-lg font-bold text-white">{formatCurrency(stats.revenue)}</p>
                  <p className="text-xs text-zinc-400">Pendapatan</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs for Orders and Products */}
        <Tabs defaultValue="orders" className="w-full">
          <TabsList className="bg-zinc-800/50 border border-zinc-700/50 mb-4 flex-wrap h-auto gap-1">
            <TabsTrigger value="orders" className="data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-400">
              <ShoppingBag className="w-4 h-4 mr-2" />
              Pesanan
            </TabsTrigger>
            <TabsTrigger value="products" className="data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-400">
              <Package className="w-4 h-4 mr-2" />
              Produk
            </TabsTrigger>
            <TabsTrigger value="prices" className="data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-400">
              <TrendingUp className="w-4 h-4 mr-2" />
              Harga Emas
            </TabsTrigger>
            <TabsTrigger value="qris" className="data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-400">
              <QrCode className="w-4 h-4 mr-2" />
              QRIS
            </TabsTrigger>
            <TabsTrigger value="contact" className="data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-400">
              <PhoneIcon className="w-4 h-4 mr-2" />
              Kontak
            </TabsTrigger>
          </TabsList>

          <TabsContent value="orders">
            {/* Orders Table */}
            <Card className="bg-zinc-800/50 border-zinc-700/50">
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-white">Daftar Pesanan</CardTitle>
                <CardDescription className="text-zinc-400">
                  Kelola semua pesanan dari pelanggan
                </CardDescription>
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                  <Input
                    placeholder="Cari pesanan..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 bg-zinc-700/50 border-zinc-600 text-white placeholder:text-zinc-500 w-full sm:w-64"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="bg-zinc-700/50 border-zinc-600 text-white w-full sm:w-48">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Filter Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Status</SelectItem>
                    <SelectItem value="pending_payment">Menunggu Pembayaran</SelectItem>
                    <SelectItem value="payment_uploaded">Bukti Diupload</SelectItem>
                    <SelectItem value="processing">Diproses</SelectItem>
                    <SelectItem value="shipped">Dikirim</SelectItem>
                    <SelectItem value="completed">Selesai</SelectItem>
                    <SelectItem value="cancelled">Dibatalkan</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={fetchOrders}
                  disabled={isLoading}
                  className="border-zinc-600 text-zinc-300 hover:bg-zinc-700"
                >
                  <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="text-center py-12">
                <Package className="w-12 h-12 mx-auto text-zinc-500 mb-4" />
                <p className="text-zinc-400">Tidak ada pesanan ditemukan</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-zinc-700 hover:bg-transparent">
                      <TableHead className="text-zinc-400">Order #</TableHead>
                      <TableHead className="text-zinc-400">Pelanggan</TableHead>
                      <TableHead className="text-zinc-400">Produk</TableHead>
                      <TableHead className="text-zinc-400">Total</TableHead>
                      <TableHead className="text-zinc-400">Status</TableHead>
                      <TableHead className="text-zinc-400">Tanggal</TableHead>
                      <TableHead className="text-zinc-400 text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredOrders.map((order) => (
                      <TableRow key={order.id} className="border-zinc-700 hover:bg-zinc-700/30">
                        <TableCell className="font-mono text-amber-400 text-sm">
                          {order.order_number}
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="text-white font-medium">{order.customer_name}</p>
                            <p className="text-xs text-zinc-400">{order.customer_phone}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="text-white">{order.product_name}</p>
                            <p className="text-xs text-zinc-400">{order.product_weight} × {order.quantity}</p>
                          </div>
                        </TableCell>
                        <TableCell className="text-white font-medium">
                          {formatCurrency(order.total_price)}
                        </TableCell>
                        <TableCell>{getStatusBadge(order.status)}</TableCell>
                        <TableCell className="text-zinc-400 text-sm">
                          {formatDate(order.created_at)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDownloadInvoice(order)}
                              disabled={isDownloadingInvoice}
                              className="text-amber-400 hover:text-amber-300 hover:bg-amber-500/20"
                              title="Download Invoice"
                            >
                              {isDownloadingInvoice && selectedOrder?.id === order.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <FileText className="w-4 h-4" />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleWhatsAppContact(order)}
                              className="text-green-400 hover:text-green-300 hover:bg-green-500/20"
                              title="Hubungi via WhatsApp"
                            >
                              <MessageCircle className="w-4 h-4" />
                            </Button>
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setSelectedOrder(order)}
                                  className="text-zinc-400 hover:text-white"
                                >
                                  <Eye className="w-4 h-4" />
                                </Button>
                              </DialogTrigger>
                            <DialogContent className="bg-zinc-800 border-zinc-700 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle className="flex items-center gap-2">
                                  <Package className="w-5 h-5 text-amber-500" />
                                  Detail Pesanan
                                </DialogTitle>
                                <DialogDescription className="text-zinc-400">
                                  Order #{order.order_number}
                                </DialogDescription>
                              </DialogHeader>

                              <div className="space-y-6 mt-4">
                                {/* Status Section */}
                                <div className="flex items-center justify-between p-4 rounded-lg bg-zinc-700/30">
                                  <div>
                                    <p className="text-sm text-zinc-400 mb-1">Status Pesanan</p>
                                    {getStatusBadge(order.status)}
                                  </div>
                                  {order.confirmation_code && (
                                    <div className="text-right">
                                      <p className="text-sm text-zinc-400 mb-1">Kode Konfirmasi</p>
                                      <p className="font-mono text-lg text-amber-400 font-bold">{order.confirmation_code}</p>
                                    </div>
                                  )}
                                </div>

                                {/* Customer Info */}
                                <div>
                                  <h4 className="text-sm font-medium text-zinc-300 mb-3">Informasi Pelanggan</h4>
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div className="flex items-center gap-2 p-3 rounded-lg bg-zinc-700/30">
                                      <User className="w-4 h-4 text-zinc-400" />
                                      <div>
                                        <p className="text-xs text-zinc-400">Nama</p>
                                        <p className="text-white">{order.customer_name}</p>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-2 p-3 rounded-lg bg-zinc-700/30">
                                      <Phone className="w-4 h-4 text-zinc-400" />
                                      <div className="flex-1">
                                        <p className="text-xs text-zinc-400">Telepon</p>
                                        <p className="text-white">{order.customer_phone}</p>
                                      </div>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleWhatsAppContact(order)}
                                        className="text-green-400 hover:text-green-300 hover:bg-green-500/20 h-8 px-2"
                                        title="Hubungi via WhatsApp"
                                      >
                                        <MessageCircle className="w-4 h-4 mr-1" />
                                        <span className="text-xs">WhatsApp</span>
                                      </Button>
                                    </div>
                                    <div className="flex items-center gap-2 p-3 rounded-lg bg-zinc-700/30">
                                      <Mail className="w-4 h-4 text-zinc-400" />
                                      <div>
                                        <p className="text-xs text-zinc-400">Email</p>
                                        <p className="text-white">{order.customer_email}</p>
                                      </div>
                                    </div>
                                    <div className="flex items-start gap-2 p-3 rounded-lg bg-zinc-700/30">
                                      <MapPin className="w-4 h-4 text-zinc-400 mt-0.5" />
                                      <div>
                                        <p className="text-xs text-zinc-400">Alamat</p>
                                        <p className="text-white text-sm">{order.customer_address}</p>
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                {/* Order Details */}
                                <div>
                                  <h4 className="text-sm font-medium text-zinc-300 mb-3">Detail Pesanan</h4>
                                  <div className="p-4 rounded-lg bg-zinc-700/30 space-y-3">
                                    <div className="flex justify-between">
                                      <span className="text-zinc-400">Produk</span>
                                      <span className="text-white">{order.product_name}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-zinc-400">Berat</span>
                                      <span className="text-white">{order.product_weight}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-zinc-400">Jumlah</span>
                                      <span className="text-white">{order.quantity}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-zinc-400">Pengiriman</span>
                                      <span className="text-white">{order.shipping_method}</span>
                                    </div>
                                    <div className="border-t border-zinc-600 pt-3 flex justify-between">
                                      <span className="text-zinc-300 font-medium">Total</span>
                                      <span className="text-amber-400 font-bold">{formatCurrency(order.total_price)}</span>
                                    </div>
                                  </div>
                                </div>

                                {/* Payment Proof */}
                                {order.payment_proof_url && (
                                  <div>
                                    <h4 className="text-sm font-medium text-zinc-300 mb-3 flex items-center gap-2">
                                      <Image className="w-4 h-4" />
                                      Bukti Pembayaran
                                    </h4>
                                    <div className="rounded-lg overflow-hidden border border-zinc-600">
                                      <PaymentProofImage
                                        paymentProofUrl={order.payment_proof_url}
                                        className="w-full max-h-64"
                                      />
                                    </div>
                                  </div>
                                )}

                                {/* Invoice Actions */}
                                <div>
                                  <h4 className="text-sm font-medium text-zinc-300 mb-3 flex items-center gap-2">
                                    <FileText className="w-4 h-4" />
                                    Invoice Pelanggan
                                  </h4>
                                  <div className="flex gap-2">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleDownloadInvoice(order)}
                                      disabled={isDownloadingInvoice}
                                      className="border-amber-500/50 text-amber-400 hover:bg-amber-500/20 flex-1"
                                    >
                                      {isDownloadingInvoice ? (
                                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                      ) : (
                                        <Download className="w-4 h-4 mr-2" />
                                      )}
                                      Download Invoice
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={handlePrintInvoice}
                                      className="border-zinc-500/50 text-zinc-400 hover:bg-zinc-500/20"
                                    >
                                      <Printer className="w-4 h-4 mr-2" />
                                      Print
                                    </Button>
                                  </div>
                                  <p className="text-xs text-zinc-500 mt-2">
                                    Download atau print invoice untuk dikirim ke pelanggan via WhatsApp
                                  </p>
                                </div>

                                {/* Actions */}
                                <div>
                                  <h4 className="text-sm font-medium text-zinc-300 mb-3">Update Status</h4>
                                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => updateOrderStatus(order.id, 'processing')}
                                      disabled={isUpdating || order.status === 'processing'}
                                      className="border-purple-500/50 text-purple-400 hover:bg-purple-500/20"
                                    >
                                      {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Proses'}
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => updateOrderStatus(order.id, 'shipped')}
                                      disabled={isUpdating || order.status === 'shipped'}
                                      className="border-blue-500/50 text-blue-400 hover:bg-blue-500/20"
                                    >
                                      {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Kirim'}
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => updateOrderStatus(order.id, 'completed')}
                                      disabled={isUpdating || order.status === 'completed'}
                                      className="border-green-500/50 text-green-400 hover:bg-green-500/20"
                                    >
                                      {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Selesai'}
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => updateOrderStatus(order.id, 'cancelled')}
                                      disabled={isUpdating || order.status === 'cancelled'}
                                      className="border-red-500/50 text-red-400 hover:bg-red-500/20"
                                    >
                                      {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Batalkan'}
                                    </Button>
                                  </div>
                                </div>

                                {/* Timestamps */}
                                <div className="flex items-center gap-4 text-xs text-zinc-500 pt-4 border-t border-zinc-700">
                                  <div className="flex items-center gap-1">
                                    <Calendar className="w-3 h-3" />
                                    Dibuat: {formatDate(order.created_at)}
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <RefreshCw className="w-3 h-3" />
                                    Diupdate: {formatDate(order.updated_at)}
                                  </div>
                                </div>
                              </div>
                            </DialogContent>
                            </Dialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
          </TabsContent>

          <TabsContent value="products">
            <ProductManagement />
          </TabsContent>

          <TabsContent value="prices">
            <GoldPriceManagement />
          </TabsContent>

          <TabsContent value="qris">
            <QRCodeSettings />
          </TabsContent>

          <TabsContent value="contact">
            <ContactSettings />
          </TabsContent>
        </Tabs>
      </main>

      {/* Password Change Modal */}
      <ChangePasswordModal 
        isOpen={showPasswordModal} 
        onClose={() => setShowPasswordModal(false)} 
      />

      {/* Hidden Invoice for Download/Print */}
      {selectedOrder && (
        <div 
          id="invoice-capture-wrapper"
          className="fixed top-0"
          style={{ 
            left: 0,
            transform: 'translateX(-120%)',
            width: '650px',
            backgroundColor: '#ffffff'
          }}
        >
          <OrderInvoice ref={invoiceRef} order={selectedOrder} />
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
