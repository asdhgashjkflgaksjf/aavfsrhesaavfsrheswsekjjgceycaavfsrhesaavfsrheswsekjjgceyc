import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Plus, Edit2, Trash2, Loader2, Package, Star, 
  RefreshCw, ImageIcon, Info, Check, AlertTriangle, Link, Download
} from 'lucide-react';
import { toast } from 'sonner';
import { useGoldPrices } from '@/hooks/useGoldPrices';

interface Product {
  id: string;
  name: string;
  weight: string;
  description: string | null;
  original_price: number;
  discounted_price: number;
  discount: number;
  sold: number;
  is_best_seller: boolean;
  is_active: boolean;
  image_url: string | null;
  sort_order: number;
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

// Available weight options
const WEIGHT_OPTIONS = [
  "0.5 Gram",
  "1 Gram", 
  "2 Gram",
  "3 Gram",
  "5 Gram",
  "10 Gram",
  "25 Gram",
  "50 Gram",
  "100 Gram"
];

const defaultProduct: Partial<Product> = {
  name: '',
  weight: '',
  description: '',
  original_price: 0,
  discounted_price: 0,
  discount: 0,
  sold: 0,
  is_best_seller: false,
  is_active: true,
  image_url: '',
  sort_order: 0
};

const ProductManagement = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [formData, setFormData] = useState<Partial<Product>>(defaultProduct);
  const [imageUrl, setImageUrl] = useState('');
  const [isDownloadingImage, setIsDownloadingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  // Fetch gold prices
  const { data: goldPrices, isLoading: isLoadingPrices } = useGoldPrices();

  // Download image from URL and upload to Supabase Storage
  const handleDownloadFromUrl = async () => {
    if (!imageUrl.trim()) {
      toast.error('Masukkan URL gambar terlebih dahulu');
      return;
    }

    setIsDownloadingImage(true);
    try {
      // Fetch the image
      const response = await fetch(imageUrl);
      if (!response.ok) {
        throw new Error('Gagal mengunduh gambar');
      }

      const blob = await response.blob();
      
      // Check file size (max 5MB)
      if (blob.size > 5 * 1024 * 1024) {
        toast.error('Ukuran gambar maksimal 5MB');
        return;
      }

      // Check if it's an image
      if (!blob.type.startsWith('image/')) {
        toast.error('URL harus mengarah ke file gambar');
        return;
      }

      // Generate filename
      const ext = blob.type.split('/')[1] || 'jpg';
      const fileName = `product-${Date.now()}.${ext}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(fileName, blob, {
          contentType: blob.type,
          upsert: true
        });

      if (uploadError) {
        // If bucket doesn't exist, try to create it or use the URL directly
        console.error('Upload error:', uploadError);
        // Fallback: use the URL directly
        setFormData({ ...formData, image_url: imageUrl });
        setImagePreview(imageUrl);
        toast.success('URL gambar berhasil ditambahkan');
        setImageUrl('');
        return;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('product-images')
        .getPublicUrl(fileName);

      setFormData({ ...formData, image_url: urlData.publicUrl });
      setImagePreview(urlData.publicUrl);
      toast.success('Gambar berhasil diunduh dan diupload!');
      setImageUrl('');
    } catch (err) {
      console.error('Error downloading image:', err);
      // Fallback: use the URL directly
      setFormData({ ...formData, image_url: imageUrl });
      setImagePreview(imageUrl);
      toast.success('URL gambar berhasil ditambahkan');
      setImageUrl('');
    } finally {
      setIsDownloadingImage(false);
    }
  };

  // Get price for a specific weight
  const getPriceForWeight = (weight: string): number => {
    if (!goldPrices || goldPrices.length === 0) return 0;
    const priceData = goldPrices.find(p => p.weight === weight);
    return priceData?.price || 0;
  };

  // Calculate discounted price based on original price and discount percentage
  const calculateDiscountedPrice = (originalPrice: number, discountPercent: number): number => {
    return Math.round(originalPrice * (1 - discountPercent / 100));
  };

  // Handle weight change - auto-set price based on gold prices
  const handleWeightChange = (weight: string) => {
    const originalPrice = getPriceForWeight(weight);
    const discountedPrice = calculateDiscountedPrice(originalPrice, formData.discount || 0);
    setFormData({ 
      ...formData, 
      weight, 
      original_price: originalPrice,
      discounted_price: discountedPrice
    });
  };

  // Handle discount change - recalculate discounted price
  const handleDiscountChange = (discountPercent: number) => {
    const discount = Math.min(100, Math.max(0, discountPercent)); // Clamp 0-100
    const discountedPrice = calculateDiscountedPrice(formData.original_price || 0, discount);
    setFormData({
      ...formData,
      discount,
      discounted_price: discountedPrice
    });
  };

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('sort_order', { ascending: true });

      if (error) throw error;
      setProducts(data as Product[]);
    } catch (err) {
      console.error('Error fetching products:', err);
      toast.error('Gagal memuat produk');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleOpenDialog = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setFormData(product);
      setImagePreview(product.image_url);
    } else {
      setEditingProduct(null);
      setFormData({ ...defaultProduct, sort_order: products.length + 1 });
      setImagePreview(null);
    }
    setImageUrl('');
    setShowDialog(true);
  };

  const handleCloseDialog = () => {
    setShowDialog(false);
    setEditingProduct(null);
    setFormData(defaultProduct);
    setImageUrl('');
    setImagePreview(null);
  };

  const handleSave = async () => {
    if (!formData.name || !formData.weight) {
      toast.error('Nama dan berat produk harus diisi');
      return;
    }

    setIsSaving(true);
    try {
      const productData = {
        name: formData.name,
        weight: formData.weight,
        description: formData.description || null,
        original_price: Number(formData.original_price) || 0,
        discounted_price: Number(formData.discounted_price) || 0,
        discount: Number(formData.discount) || 0,
        sold: Number(formData.sold) || 0,
        is_best_seller: formData.is_best_seller || false,
        is_active: formData.is_active ?? true,
        image_url: formData.image_url || null,
        sort_order: Number(formData.sort_order) || 0
      };

      if (editingProduct?.id) {
        const { error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', editingProduct.id);

        if (error) throw error;
        toast.success('Produk berhasil diperbarui');
      } else {
        const { error } = await supabase
          .from('products')
          .insert([productData]);

        if (error) throw error;
        toast.success('Produk berhasil ditambahkan');
      }

      handleCloseDialog();
      fetchProducts();
    } catch (err) {
      console.error('Error saving product:', err);
      toast.error('Gagal menyimpan produk');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!productToDelete) return;

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productToDelete.id);

      if (error) throw error;
      toast.success('Produk berhasil dihapus');
      setShowDeleteDialog(false);
      setProductToDelete(null);
      fetchProducts();
    } catch (err) {
      console.error('Error deleting product:', err);
      toast.error('Gagal menghapus produk');
    } finally {
      setIsSaving(false);
    }
  };

  const toggleActive = async (product: Product) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({ is_active: !product.is_active })
        .eq('id', product.id);

      if (error) throw error;
      toast.success(`Produk ${!product.is_active ? 'diaktifkan' : 'dinonaktifkan'}`);
      fetchProducts();
    } catch (err) {
      console.error('Error toggling product:', err);
      toast.error('Gagal mengubah status produk');
    }
  };

  return (
    <Card className="bg-zinc-800/50 border-zinc-700/50">
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <CardTitle className="text-white flex items-center gap-2">
              <Package className="w-5 h-5 text-amber-500" />
              Manajemen Produk
            </CardTitle>
            <CardDescription className="text-zinc-400">
              Kelola produk emas yang ditampilkan di toko
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={fetchProducts}
              disabled={isLoading}
              className="border-zinc-600 text-zinc-300 hover:bg-zinc-700"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
            <Button
              onClick={() => handleOpenDialog()}
              className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-zinc-900"
            >
              <Plus className="w-4 h-4 mr-2" />
              Tambah Produk
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-12 h-12 mx-auto text-zinc-500 mb-4" />
            <p className="text-zinc-400">Belum ada produk</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-zinc-700 hover:bg-transparent">
                  <TableHead className="text-zinc-400 w-16">Foto</TableHead>
                  <TableHead className="text-zinc-400">Nama</TableHead>
                  <TableHead className="text-zinc-400">Harga</TableHead>
                  <TableHead className="text-zinc-400">Diskon</TableHead>
                  <TableHead className="text-zinc-400">Terjual</TableHead>
                  <TableHead className="text-zinc-400">Status</TableHead>
                  <TableHead className="text-zinc-400 text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => (
                  <TableRow key={product.id} className="border-zinc-700 hover:bg-zinc-700/30">
                    <TableCell>
                      {product.image_url ? (
                        <img 
                          src={product.image_url} 
                          alt={product.name}
                          className="w-12 h-12 object-cover rounded-lg border border-zinc-600"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-zinc-700 flex items-center justify-center">
                          <ImageIcon className="w-5 h-5 text-zinc-500" />
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="text-white font-medium">{product.name}</p>
                        <p className="text-xs text-zinc-400">{product.weight}</p>
                        {product.is_best_seller && (
                          <Badge className="mt-1 bg-amber-500/20 text-amber-400 border-amber-500/30">
                            <Star className="w-3 h-3 mr-1 fill-amber-400" />
                            Terlaris
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="text-zinc-400 line-through text-xs">{formatCurrency(product.original_price)}</p>
                        <p className="text-amber-400 font-medium">{formatCurrency(product.discounted_price)}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="destructive" className="bg-red-500/20 text-red-400 border-red-500/30">
                        {product.discount}%
                      </Badge>
                    </TableCell>
                    <TableCell className="text-zinc-300">{product.sold.toLocaleString()}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={product.is_active}
                          onCheckedChange={() => toggleActive(product)}
                        />
                        <span className={`text-sm ${product.is_active ? 'text-green-400' : 'text-zinc-500'}`}>
                          {product.is_active ? 'Aktif' : 'Nonaktif'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenDialog(product)}
                          className="text-zinc-400 hover:text-white"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setProductToDelete(product);
                            setShowDeleteDialog(true);
                          }}
                          className="text-red-400 hover:text-red-300 hover:bg-red-500/20"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>

      {/* Add/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="bg-zinc-800 border-zinc-700 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {editingProduct ? <Edit2 className="w-5 h-5 text-amber-500" /> : <Plus className="w-5 h-5 text-amber-500" />}
              {editingProduct ? 'Edit Produk' : 'Tambah Produk Baru'}
            </DialogTitle>
            <DialogDescription className="text-zinc-400">
              {editingProduct ? 'Perbarui informasi produk' : 'Isi detail produk baru'}
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="col-span-2">
              <Label className="text-zinc-300">Nama Produk *</Label>
              <Input
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="bg-zinc-700/50 border-zinc-600 text-white mt-1"
                placeholder="Emas Antam 1 Gram"
              />
            </div>

            <div>
              <Label className="text-zinc-300">Berat *</Label>
              <Select
                value={formData.weight || ''}
                onValueChange={handleWeightChange}
              >
                <SelectTrigger className="bg-zinc-700/50 border-zinc-600 text-white mt-1">
                  <SelectValue placeholder="Pilih berat" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-800 border-zinc-700">
                  {WEIGHT_OPTIONS.map((weight) => (
                    <SelectItem key={weight} value={weight} className="text-white hover:bg-zinc-700">
                      {weight}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-zinc-300">Urutan</Label>
              <Input
                type="number"
                value={formData.sort_order || 0}
                onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })}
                className="bg-zinc-700/50 border-zinc-600 text-white mt-1"
              />
            </div>

            {/* Price Display - Auto calculated */}
            <div className="col-span-2 bg-zinc-700/30 rounded-lg p-4 border border-zinc-600/50">
              <div className="flex items-start gap-2 mb-3">
                <Info className="w-4 h-4 text-amber-500 mt-0.5" />
                <p className="text-sm text-zinc-400">
                  Harga otomatis berdasarkan harga emas {formData.weight || '(pilih berat)'} hari ini
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-zinc-400 text-xs">Harga Asli (Otomatis)</Label>
                  <p className="text-lg font-semibold text-white">
                    {formData.original_price ? formatCurrency(formData.original_price) : '-'}
                  </p>
                </div>
                <div>
                  <Label className="text-zinc-400 text-xs">Harga Setelah Diskon</Label>
                  <p className="text-lg font-semibold text-amber-400">
                    {formData.discounted_price ? formatCurrency(formData.discounted_price) : '-'}
                  </p>
                </div>
              </div>
            </div>

            <div>
              <Label className="text-zinc-300">Diskon (%)</Label>
              <Input
                type="number"
                min={0}
                max={100}
                value={formData.discount || ''}
                onChange={(e) => handleDiscountChange(parseInt(e.target.value) || 0)}
                className="bg-zinc-700/50 border-zinc-600 text-white mt-1"
                placeholder="0"
              />
              <p className="text-xs text-zinc-500 mt-1">Masukkan persentase diskon (0-100)</p>
            </div>

            <div>
              <Label className="text-zinc-300">Terjual</Label>
              <Input
                type="number"
                value={formData.sold || ''}
                onChange={(e) => setFormData({ ...formData, sold: parseInt(e.target.value) || 0 })}
                className="bg-zinc-700/50 border-zinc-600 text-white mt-1"
                placeholder="0"
              />
            </div>

            {/* Image Upload Section */}
            <div className="col-span-2 space-y-3">
              <Label className="text-zinc-300 flex items-center gap-2">
                <ImageIcon className="w-4 h-4" />
                Gambar Produk
              </Label>
              
              {/* Image Preview */}
              {(imagePreview || formData.image_url) && (
                <div className="flex items-start gap-3 p-3 bg-zinc-700/30 rounded-lg border border-zinc-600/50">
                  <img 
                    src={imagePreview || formData.image_url || ''} 
                    alt="Preview"
                    className="w-24 h-24 object-cover rounded-lg border border-zinc-600"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/placeholder.svg';
                    }}
                  />
                  <div className="flex-1">
                    <p className="text-sm text-zinc-400 mb-2">Gambar saat ini</p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setFormData({ ...formData, image_url: '' });
                        setImagePreview(null);
                      }}
                      className="border-red-500/50 text-red-400 hover:bg-red-500/20"
                    >
                      <Trash2 className="w-3 h-3 mr-1" />
                      Hapus Gambar
                    </Button>
                  </div>
                </div>
              )}

              {/* URL Input */}
              <div className="flex gap-2">
                <div className="flex-1">
                  <Input
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    className="bg-zinc-700/50 border-zinc-600 text-white"
                    placeholder="Masukkan URL gambar..."
                  />
                </div>
                <Button
                  type="button"
                  onClick={handleDownloadFromUrl}
                  disabled={isDownloadingImage || !imageUrl.trim()}
                  className="bg-amber-500/20 text-amber-400 border border-amber-500/50 hover:bg-amber-500/30"
                >
                  {isDownloadingImage ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Download className="w-4 h-4 mr-1" />
                      Ambil
                    </>
                  )}
                </Button>
              </div>
              <p className="text-xs text-zinc-500">
                Masukkan URL gambar, lalu klik "Ambil" untuk mengunduh dan menyimpan gambar
              </p>
            </div>

            <div className="col-span-2">
              <Label className="text-zinc-300">Deskripsi</Label>
              <Textarea
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="bg-zinc-700/50 border-zinc-600 text-white mt-1"
                placeholder="Deskripsi produk..."
                rows={3}
              />
            </div>

            <div className="flex items-center gap-3">
              <Switch
                checked={formData.is_best_seller || false}
                onCheckedChange={(checked) => setFormData({ ...formData, is_best_seller: checked })}
              />
              <Label className="text-zinc-300">Produk Terlaris</Label>
            </div>

            <div className="flex items-center gap-3">
              <Switch
                checked={formData.is_active ?? true}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
              <Label className="text-zinc-300">Aktif</Label>
            </div>
          </div>

          <DialogFooter className="mt-6">
            <Button
              variant="outline"
              onClick={handleCloseDialog}
              className="border-zinc-600 text-zinc-300 hover:bg-zinc-700"
            >
              Batal
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-zinc-900"
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Check className="w-4 h-4 mr-2" />
              )}
              Simpan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="bg-zinc-800 border-zinc-700 text-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-400">
              <AlertTriangle className="w-5 h-5" />
              Hapus Produk
            </DialogTitle>
            <DialogDescription className="text-zinc-400">
              Apakah Anda yakin ingin menghapus produk "{productToDelete?.name}"? Tindakan ini tidak dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-6">
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              className="border-zinc-600 text-zinc-300 hover:bg-zinc-700"
            >
              Batal
            </Button>
            <Button
              onClick={handleDelete}
              disabled={isSaving}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Trash2 className="w-4 h-4 mr-2" />
              )}
              Hapus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default ProductManagement;