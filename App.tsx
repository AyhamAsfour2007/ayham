
import React, { useState, useMemo, useRef } from 'react';
import { 
  ShoppingBag, 
  Settings, 
  Search, 
  Plus, 
  Trash2, 
  X,
  Phone,
  Cpu,
  Smartphone,
  Package,
  Save,
  Edit2,
  AlertCircle,
  Menu,
  Upload,
  Image as ImageIcon,
  ExternalLink,
  CheckCircle,
  CheckSquare,
  Square
} from 'lucide-react';
import { Product, Category, CartItem, ViewState, SparePartType } from './types';
import { INITIAL_PRODUCTS, BRANDS } from './constants';

const WHATSAPP_NUMBER = '970598000890';

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>('CUSTOMER');
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category | 'ALL'>('ALL');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAdminAuth, setIsAdminAuth] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');

  // Admin Selection States
  const [selectedProductIds, setSelectedProductIds] = useState<Set<string>>(new Set());
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Cart Logic
  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.product.id !== id));
  };

  const updateCartQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.product.id === id) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const cartTotal = useMemo(() => 
    cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0),
  [cart]);

  // Filtering Logic
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            p.brand.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'ALL' || p.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [products, searchQuery, selectedCategory]);

  // Admin Login
  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPassword === 'admin1235') {
      setIsAdminAuth(true);
    } else {
      alert('كلمة مرور خاطئة');
    }
  };

  // Image Upload Handling
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && editingProduct) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditingProduct({ ...editingProduct, image: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  // Product Management Actions
  const openAddModal = () => {
    setEditingProduct({
      id: '',
      name: '',
      description: '',
      price: 0,
      category: Category.PHONES_NEW,
      brand: BRANDS[0],
      image: 'https://placehold.co/400x400?text=اختر+صورة',
      stock: 0,
      sparePartType: SparePartType.NONE
    });
    setIsProductModalOpen(true);
  };

  const openEditModal = (product: Product) => {
    setEditingProduct({ ...product });
    setIsProductModalOpen(true);
  };

  const saveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    if (editingProduct.id) {
      setProducts(prev => prev.map(p => p.id === editingProduct.id ? editingProduct : p));
    } else {
      const newProduct = { ...editingProduct, id: Math.random().toString(36).substr(2, 9) };
      setProducts(prev => [newProduct, ...prev]);
    }
    setIsProductModalOpen(false);
    setEditingProduct(null);
  };

  const deleteProduct = (id: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذا المنتج؟')) {
      setProducts(prev => prev.filter(p => p.id !== id));
      const newSelection = new Set(selectedProductIds);
      newSelection.delete(id);
      setSelectedProductIds(newSelection);
    }
  };

  const deleteSelectedProducts = () => {
    if (window.confirm(`هل أنت متأكد من حذف ${selectedProductIds.size} منتجات محددة؟`)) {
      setProducts(prev => prev.filter(p => !selectedProductIds.has(p.id)));
      setSelectedProductIds(new Set());
    }
  };

  const deleteAllProducts = () => {
    if (window.confirm('⚠️ تنبيه هام: هل أنت متأكد من حذف جميع المنتجات في المتجر؟ لا يمكن التراجع عن هذه الخطوة.')) {
      setProducts([]);
      setSelectedProductIds(new Set());
    }
  };

  const toggleProductSelection = (id: string) => {
    const newSelection = new Set(selectedProductIds);
    if (newSelection.has(id)) {
      newSelection.delete(id);
    } else {
      newSelection.add(id);
    }
    setSelectedProductIds(newSelection);
  };

  const toggleSelectAll = () => {
    if (selectedProductIds.size === filteredProducts.length) {
      setSelectedProductIds(new Set());
    } else {
      setSelectedProductIds(new Set(filteredProducts.map(p => p.id)));
    }
  };

  const updateInlineValue = (id: string, field: keyof Product, value: string | number) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  const toggleView = () => {
    if (view === 'CUSTOMER') {
      setView('ADMIN');
    } else {
      setView('CUSTOMER');
      setIsAdminAuth(false);
      setAdminPassword('');
    }
  };

  const handleCheckout = () => {
    const dateStr = new Date().toLocaleString('ar-EG');
    let invoice = `📄 *فاتورة طلب جديدة*\n`;
    invoice += `━━━━━━━━━━━━━━━\n`;
    invoice += `📅 التاريخ: ${dateStr}\n\n`;
    invoice += `*المنتجات:*\n`;
    
    cart.forEach((item, index) => {
      const subtotal = item.product.price * item.quantity;
      invoice += `${index + 1}. *${item.product.name}*\n`;
      invoice += `   الكمية: ${item.quantity} | السعر: ${item.product.price} ₪\n`;
      invoice += `   المجموع: ${subtotal} ₪\n`;
      invoice += `┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈\n`;
    });
    
    invoice += `\n💰 *الإجمالي الكلي: ${cartTotal} ₪*`;
    invoice += `\n\nيرجى تأكيد الطلب للبدء في التجهيز.`;

    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(invoice)}`;
    window.open(whatsappUrl, '_blank');
    setCart([]);
    setIsCartOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-lg text-white">
              <Smartphone size={24} />
            </div>
            <h1 className="text-xl font-bold text-gray-800">متجر الفارس</h1>
          </div>

          <div className="flex-1 max-w-lg mx-8 hidden md:block">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text" 
                placeholder="ابحث عن هاتف، شاشة، أو قطعة غيار..."
                className="w-full pr-10 pl-4 py-2 bg-gray-100 border-none rounded-full focus:ring-2 focus:ring-blue-500 outline-none text-right"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={toggleView}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl font-bold transition-all ${view === 'ADMIN' ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-600'}`}
              title={view === 'ADMIN' ? 'العودة للمتجر' : 'دخول الإدارة'}
            >
              {view === 'ADMIN' ? <ExternalLink size={18} /> : <Settings size={18} />}
              <span className="hidden sm:inline">{view === 'ADMIN' ? 'عرض المتجر' : 'الإدارة'}</span>
            </button>
            {view === 'CUSTOMER' && (
              <button 
                onClick={() => setIsCartOpen(true)}
                className="relative p-2 bg-blue-100 text-blue-600 rounded-full"
              >
                <ShoppingBag size={20} />
                {cart.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full font-bold">
                    {cart.length}
                  </span>
                )}
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-6 flex gap-6">
        {view === 'CUSTOMER' ? (
          <>
            {/* Sidebar Filters */}
            <aside className="hidden lg:block w-64 space-y-6">
              <div>
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <Menu className="rotate-180" size={18} /> التصنيفات
                </h3>
                <div className="space-y-1">
                  <button 
                    onClick={() => setSelectedCategory('ALL')}
                    className={`w-full text-right px-4 py-2 rounded-lg transition-colors ${selectedCategory === 'ALL' ? 'bg-blue-600 text-white' : 'hover:bg-gray-200'}`}
                  >
                    الكل
                  </button>
                  {Object.values(Category).map((cat) => (
                    <button 
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`w-full text-right px-4 py-2 rounded-lg transition-colors ${selectedCategory === cat ? 'bg-blue-600 text-white' : 'hover:bg-gray-200'}`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
            </aside>

            {/* Product Grid */}
            <section className="flex-1">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800">
                  {selectedCategory === 'ALL' ? 'أحدث المنتجات' : selectedCategory}
                </h2>
                <p className="text-gray-500 text-sm">عرض {filteredProducts.length} منتج</p>
              </div>

              {filteredProducts.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-dashed">
                  <Package size={64} className="mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-500 text-lg">لم يتم العثور على منتجات</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredProducts.map(product => (
                    <div key={product.id} className="bg-white rounded-2xl shadow-sm overflow-hidden group border border-transparent hover:border-blue-500 transition-all duration-300">
                      <div className="relative aspect-square overflow-hidden bg-gray-100">
                        <img 
                          src={product.image} 
                          alt={product.name}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        <div className="absolute top-2 left-2 flex flex-col gap-1">
                          <span className="bg-white/90 backdrop-blur px-2 py-1 rounded-md text-[10px] font-bold shadow-sm">
                            {product.brand}
                          </span>
                          {product.category === Category.PHONES_USED && (
                            <span className="bg-orange-500 text-white px-2 py-1 rounded-md text-[10px] font-bold shadow-sm">
                              مستعمل
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="p-4">
                        <h3 className="font-bold text-gray-800 line-clamp-1 mb-1">{product.name}</h3>
                        <p className="text-xs text-gray-500 mb-3 h-8 line-clamp-2">{product.description}</p>
                        <div className="flex items-center justify-between">
                          <div className="flex flex-col">
                            <span className="text-blue-600 font-bold text-lg">{product.price} ₪</span>
                            <span className="text-[10px] text-gray-400">شامل الضريبة</span>
                          </div>
                          <button 
                            onClick={() => addToCart(product)}
                            className="bg-blue-600 text-white p-2 rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
                          >
                            <Plus size={20} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </>
        ) : (
          /* Admin View */
          <div className="w-full">
            {!isAdminAuth ? (
              <div className="max-w-md mx-auto mt-20 bg-white p-8 rounded-2xl shadow-xl border">
                <div className="text-center mb-6">
                  <div className="bg-orange-100 text-orange-600 p-4 rounded-full w-fit mx-auto mb-4">
                    <Settings size={32} />
                  </div>
                  <h2 className="text-2xl font-bold">لوحة تحكم الإدارة</h2>
                  <p className="text-gray-500">يرجى إدخال كلمة المرور للمتابعة</p>
                </div>
                <form onSubmit={handleAdminLogin} className="space-y-4">
                  <div>
                    <input 
                      type="password" 
                      placeholder="كلمة المرور"
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-center"
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      autoFocus
                    />
                  </div>
                  <button className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors">
                    دخول النظام
                  </button>
                  <p className="text-center text-[10px] text-gray-400 mt-4">كلمة المرور التجريبية: admin123</p>
                </form>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex flex-col md:flex-row items-center justify-between bg-white p-6 rounded-2xl shadow-sm gap-4 border">
                  <div>
                    <div className="flex items-center gap-2">
                       <h2 className="text-2xl font-bold text-gray-800">إدارة المنتجات</h2>
                       <span className="bg-green-100 text-green-600 px-2 py-0.5 rounded text-[10px] font-bold">نشط</span>
                    </div>
                    <p className="text-gray-500">تحكم بأسعار ومخزون وصور متجرك</p>
                  </div>
                  <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                       <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                       <input 
                         type="text" 
                         placeholder="بحث في المنتجات..."
                         className="w-full pr-10 pl-4 py-2 bg-gray-50 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                         value={searchQuery}
                         onChange={(e) => setSearchQuery(e.target.value)}
                       />
                    </div>
                    <button 
                      onClick={openAddModal}
                      className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-100 transition-all whitespace-nowrap"
                    >
                      <Plus size={20} /> إضافة منتج
                    </button>
                  </div>
                </div>

                {/* Multi-Select Action Bar */}
                {products.length > 0 && (
                  <div className="bg-white p-4 rounded-xl border flex flex-wrap items-center justify-between gap-4 shadow-sm animate-pop-in">
                    <div className="flex items-center gap-4">
                      <button 
                        onClick={toggleSelectAll}
                        className="flex items-center gap-2 text-gray-600 hover:text-blue-600 font-bold transition-colors"
                      >
                        {selectedProductIds.size === filteredProducts.length && filteredProducts.length > 0 ? (
                          <CheckSquare className="text-blue-600" size={20} />
                        ) : (
                          <Square size={20} />
                        )}
                        <span>تحديد الكل</span>
                      </button>
                      {selectedProductIds.size > 0 && (
                        <span className="text-blue-600 font-bold text-sm bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
                          تم تحديد {selectedProductIds.size} منتج
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {selectedProductIds.size > 0 && (
                        <button 
                          onClick={deleteSelectedProducts}
                          className="flex items-center gap-2 bg-red-100 text-red-600 px-4 py-2 rounded-lg font-bold hover:bg-red-200 transition-colors"
                        >
                          <Trash2 size={18} /> حذف المحدد
                        </button>
                      )}
                      <button 
                        onClick={deleteAllProducts}
                        className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-red-700 transition-colors"
                      >
                        <AlertCircle size={18} /> حذف جميع المنتجات
                      </button>
                    </div>
                  </div>
                )}

                <div className="bg-white rounded-2xl shadow-sm overflow-hidden border">
                  <div className="overflow-x-auto">
                    <table className="w-full text-right border-collapse">
                      <thead className="bg-gray-50 border-b">
                        <tr>
                          <th className="px-6 py-4 w-12 text-center">
                            <input 
                              type="checkbox" 
                              checked={selectedProductIds.size === filteredProducts.length && filteredProducts.length > 0}
                              onChange={toggleSelectAll}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                            />
                          </th>
                          <th className="px-6 py-4 font-bold text-gray-600 text-sm">المنتج</th>
                          <th className="px-6 py-4 font-bold text-gray-600 text-sm">التصنيف</th>
                          <th className="px-6 py-4 font-bold text-gray-600 text-sm">السعر (₪)</th>
                          <th className="px-6 py-4 font-bold text-gray-600 text-sm">المخزون</th>
                          <th className="px-6 py-4 font-bold text-gray-600 text-sm text-center">إجراءات</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {filteredProducts.map(p => (
                          <tr key={p.id} className={`hover:bg-gray-50/50 transition-colors group ${selectedProductIds.has(p.id) ? 'bg-blue-50/30' : ''}`}>
                            <td className="px-6 py-4 text-center">
                               <input 
                                  type="checkbox" 
                                  checked={selectedProductIds.has(p.id)}
                                  onChange={() => toggleProductSelection(p.id)}
                                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                               />
                            </td>
                            <td className="px-6 py-4" onClick={() => toggleProductSelection(p.id)}>
                              <div className="flex items-center gap-3 cursor-pointer">
                                <img src={p.image} alt="" className="w-12 h-12 rounded-lg object-cover border bg-gray-50" />
                                <div>
                                  <div className="font-bold text-gray-800">{p.name}</div>
                                  <div className="text-[10px] text-gray-400">{p.brand}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className="bg-blue-50 text-blue-600 px-2 py-1 rounded-md text-[10px] font-bold">
                                {p.category}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                               <div className="relative inline-block w-24">
                                  <input 
                                    type="number"
                                    value={p.price}
                                    onChange={(e) => updateInlineValue(p.id, 'price', Number(e.target.value))}
                                    className="w-full bg-transparent border-b border-transparent focus:border-blue-500 focus:bg-white px-2 py-1 rounded outline-none font-bold text-blue-600 transition-all text-center"
                                  />
                               </div>
                            </td>
                            <td className="px-6 py-4 text-center">
                               <div className="flex items-center justify-center gap-2">
                                  <input 
                                    type="number"
                                    value={p.stock}
                                    onChange={(e) => updateInlineValue(p.id, 'stock', Number(e.target.value))}
                                    className={`w-16 bg-transparent border-b border-transparent focus:border-blue-500 focus:bg-white px-2 py-1 rounded outline-none font-bold transition-all text-center ${p.stock < 3 ? 'text-red-500' : 'text-gray-700'}`}
                                  />
                                  {p.stock < 3 && <AlertCircle size={14} className="text-red-500" />}
                               </div>
                            </td>
                            <td className="px-6 py-4 text-center">
                              <div className="flex items-center justify-center gap-2">
                                <button 
                                  onClick={() => openEditModal(p)}
                                  className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                  title="تعديل كامل"
                                >
                                  <Edit2 size={18} />
                                </button>
                                <button 
                                  onClick={() => deleteProduct(p.id)}
                                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                  title="حذف"
                                >
                                  <Trash2 size={18} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {filteredProducts.length === 0 && (
                    <div className="py-20 text-center flex flex-col items-center gap-4">
                      <Package size={48} className="text-gray-200" />
                      <p className="text-gray-400 font-bold">لا توجد منتجات لعرضها</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Product Edit/Add Modal */}
      {isProductModalOpen && editingProduct && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsProductModalOpen(false)} />
          <div className="relative bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-pop-in max-h-[90vh] flex flex-col">
             <div className="p-6 border-b flex items-center justify-between bg-white sticky top-0 z-10">
                <div className="flex items-center gap-2">
                   <div className="bg-blue-100 text-blue-600 p-2 rounded-lg">
                      {editingProduct.id ? <Edit2 size={20} /> : <Plus size={20} />}
                   </div>
                   <h3 className="text-xl font-bold">{editingProduct.id ? 'تعديل تفاصيل المنتج' : 'إضافة منتج جديد'}</h3>
                </div>
                <button onClick={() => setIsProductModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                  <X size={24} />
                </button>
             </div>
             
             <form onSubmit={saveProduct} className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* Image Section */}
                <div className="flex flex-col md:flex-row gap-6 items-start">
                   <div className="relative w-full md:w-48 aspect-square bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl overflow-hidden flex flex-col items-center justify-center group">
                      {editingProduct.image ? (
                        <>
                          <img src={editingProduct.image} className="w-full h-full object-cover" alt="Preview" />
                          <div 
                            className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                            onClick={() => fileInputRef.current?.click()}
                          >
                            <Upload className="text-white" size={32} />
                          </div>
                        </>
                      ) : (
                        <div 
                          className="flex flex-col items-center gap-2 text-gray-400 cursor-pointer"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          <ImageIcon size={40} />
                          <span className="text-xs font-bold">رفع صورة</span>
                        </div>
                      )}
                      <input 
                        type="file" 
                        ref={fileInputRef}
                        className="hidden" 
                        accept="image/*"
                        onChange={handleImageUpload}
                      />
                   </div>
                   <div className="flex-1 space-y-4 w-full text-right">
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">اسم المنتج</label>
                        <input 
                          required
                          type="text" 
                          className="w-full px-4 py-2 bg-gray-50 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all text-right"
                          value={editingProduct.name}
                          onChange={e => setEditingProduct({...editingProduct, name: e.target.value})}
                          placeholder="مثلاً: iPhone 15 Pro Max"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">وصف قصير</label>
                        <textarea 
                          className="w-full px-4 py-2 bg-gray-50 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500 h-20 resize-none transition-all text-right"
                          value={editingProduct.description}
                          onChange={e => setEditingProduct({...editingProduct, description: e.target.value})}
                          placeholder="أدخل تفاصيل ومواصفات المنتج..."
                        />
                      </div>
                   </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-right">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">السعر بالشيكل (₪)</label>
                    <div className="relative">
                      <input 
                        required
                        type="number" 
                        className="w-full px-4 py-2 bg-gray-50 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500 pl-10 transition-all font-bold text-blue-600 text-right"
                        value={editingProduct.price}
                        onChange={e => setEditingProduct({...editingProduct, price: Number(e.target.value)})}
                      />
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">₪</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">الكمية المتوفرة (المخزون)</label>
                    <input 
                      required
                      type="number" 
                      className="w-full px-4 py-2 bg-gray-50 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all text-right"
                      value={editingProduct.stock}
                      onChange={e => setEditingProduct({...editingProduct, stock: Number(e.target.value)})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">التصنيف الرئيسي</label>
                    <select 
                      className="w-full px-4 py-2 bg-gray-50 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all text-right"
                      value={editingProduct.category}
                      onChange={e => setEditingProduct({...editingProduct, category: e.target.value as Category})}
                    >
                      {Object.values(Category).map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">الماركة / الشركة</label>
                    <select 
                      className="w-full px-4 py-2 bg-gray-50 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all text-right"
                      value={editingProduct.brand}
                      onChange={e => setEditingProduct({...editingProduct, brand: e.target.value})}
                    >
                      {BRANDS.map(b => <option key={b} value={b}>{b}</option>)}
                    </select>
                  </div>
                  {editingProduct.category === Category.SPARE_PARTS && (
                    <div className="col-span-1 md:col-span-2">
                      <label className="block text-sm font-bold text-gray-700 mb-1">نوع قطعة الغيار</label>
                      <select 
                        className="w-full px-4 py-2 bg-gray-50 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all text-right"
                        value={editingProduct.sparePartType}
                        onChange={e => setEditingProduct({...editingProduct, sparePartType: e.target.value as SparePartType})}
                      >
                        {Object.values(SparePartType).map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                  )}
                </div>

                <div className="pt-6 border-t flex gap-3 sticky bottom-0 bg-white">
                   <button 
                     type="button" 
                     onClick={() => setIsProductModalOpen(false)}
                     className="flex-1 px-4 py-3 bg-gray-100 rounded-xl font-bold hover:bg-gray-200 transition-colors"
                   >
                     إلغاء
                   </button>
                   <button 
                     type="submit"
                     className="flex-[2] px-8 py-3 bg-blue-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-blue-700 shadow-xl shadow-blue-100 transition-all"
                   >
                     <CheckCircle size={20} /> حفظ وإنهاء
                   </button>
                </div>
             </form>
          </div>
        </div>
      )}

      {/* Cart Drawer */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsCartOpen(false)} />
          <div className="absolute inset-y-0 left-0 max-w-md w-full bg-white shadow-2xl flex flex-col animate-slide-left">
            <div className="p-6 flex items-center justify-between border-b">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <ShoppingBag size={24} /> سلة المشتريات
              </h2>
              <button onClick={() => setIsCartOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4 text-right">
              {cart.length === 0 ? (
                <div className="text-center py-20">
                  <ShoppingBag size={64} className="mx-auto text-gray-200 mb-4" />
                  <p className="text-gray-500">السلة فارغة حالياً</p>
                </div>
              ) : (
                cart.map(item => (
                  <div key={item.product.id} className="flex gap-4 p-3 bg-gray-50 rounded-xl border">
                    <img src={item.product.image} className="w-20 h-20 rounded-lg object-cover bg-white" alt="" />
                    <div className="flex-1">
                      <h4 className="font-bold text-sm mb-1">{item.product.name}</h4>
                      <p className="text-blue-600 font-bold mb-2">{item.product.price} ₪</p>
                      <div className="flex items-center gap-3">
                        <button 
                          onClick={() => updateCartQuantity(item.product.id, -1)}
                          className="w-8 h-8 flex items-center justify-center bg-white border border-gray-200 rounded-lg hover:border-blue-500"
                        >-</button>
                        <span className="font-bold">{item.quantity}</span>
                        <button 
                          onClick={() => updateCartQuantity(item.product.id, 1)}
                          className="w-8 h-8 flex items-center justify-center bg-white border border-gray-200 rounded-lg hover:border-blue-500"
                        >+</button>
                      </div>
                    </div>
                    <button 
                      onClick={() => removeFromCart(item.product.id)}
                      className="text-red-500 hover:text-red-700 self-start"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))
              )}
            </div>

            {cart.length > 0 && (
              <div className="p-6 border-t space-y-4">
                <div className="flex items-center justify-between text-lg font-bold">
                  <span>الإجمالي:</span>
                  <span className="text-blue-600">{cartTotal} ₪</span>
                </div>
                <button 
                  onClick={handleCheckout}
                  className="w-full bg-green-600 text-white py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 hover:bg-green-700 shadow-xl shadow-green-100 transition-all"
                >
                  <Phone size={20} /> إتمام الطلب عبر واتساب
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Quick Access Mobile Nav (Customer Only) */}
      {view === 'CUSTOMER' && (
        <nav className="md:hidden fixed bottom-0 inset-x-0 bg-white border-t py-3 flex justify-around items-center z-40 px-4 shadow-up">
          <button 
            onClick={() => setSelectedCategory('ALL')}
            className={`flex flex-col items-center gap-1 ${selectedCategory === 'ALL' ? 'text-blue-600 font-bold' : 'text-gray-400'}`}
          >
            <Smartphone size={20} />
            <span className="text-[10px]">الرئيسية</span>
          </button>
          <button 
            onClick={() => setSelectedCategory(Category.PHONES_NEW)}
            className={`flex flex-col items-center gap-1 ${selectedCategory === Category.PHONES_NEW ? 'text-blue-600 font-bold' : 'text-gray-400'}`}
          >
            <Package size={20} />
            <span className="text-[10px]">هواتف</span>
          </button>
          <button 
            onClick={() => setSelectedCategory(Category.SPARE_PARTS)}
            className={`flex flex-col items-center gap-1 ${selectedCategory === Category.SPARE_PARTS ? 'text-blue-600 font-bold' : 'text-gray-400'}`}
          >
            <Cpu size={20} />
            <span className="text-[10px]">قطع غيار</span>
          </button>
          <button 
            onClick={() => setIsCartOpen(true)}
            className="flex flex-col items-center gap-1 text-gray-400 relative"
          >
            <ShoppingBag size={20} />
            <span className="text-[10px]">السلة</span>
            {cart.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[8px] w-4 h-4 flex items-center justify-center rounded-full">
                {cart.length}
              </span>
            )}
          </button>
        </nav>
      )}

      {/* Footer (Desktop) */}
      <footer className="hidden md:block bg-white border-t mt-12 py-10">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8 text-right">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-blue-600 p-1.5 rounded-lg text-white">
                <Smartphone size={18} />
              </div>
              <h4 className="font-bold text-lg text-gray-800">متجر الفارس</h4>
            </div>
            <p className="text-gray-500 text-sm leading-relaxed">
              وجهتكم الأولى لأفضل الهواتف الذكية والإكسسوارات وخدمات الصيانة الاحترافية. نحن نضمن الجودة والتميز.
            </p>
          </div>
          <div>
            <h4 className="font-bold mb-4 text-gray-800">روابط سريعة</h4>
            <ul className="space-y-2 text-sm text-gray-500">
              <li className="hover:text-blue-600 cursor-pointer">الأسئلة الشائعة</li>
              <li className="hover:text-blue-600 cursor-pointer">سياسة الضمان</li>
              <li className="hover:text-blue-600 cursor-pointer">من نحن</li>
              <li className="hover:text-blue-600 cursor-pointer">تواصل معنا</li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4 text-gray-800">طرق الدفع</h4>
            <div className="flex flex-wrap gap-2">
              <span className="px-2 py-1 bg-gray-100 rounded text-xs font-bold text-gray-600">شيكل كاش</span>
              <span className="px-2 py-1 bg-gray-100 rounded text-xs font-bold text-gray-600"> الاستلام عند الدفع</span>
             
            </div>
          </div>
          <div>
            <h4 className="font-bold mb-4 text-gray-800">اشترك في النشرة</h4>
            <div className="flex gap-2">
              <input type="email" placeholder="بريدك الإلكتروني" className="bg-gray-100 rounded-lg px-3 py-2 text-sm outline-none w-full text-right" />
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold">اشترك</button>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 mt-8 pt-8 border-t text-center text-sm text-gray-400">
          جميع الحقوق محفوظة © {new Date().getFullYear()} متجر الفارس
        </div>
      </footer>
      
      {/* Animation & Extra Styles */}
      <style>{`
        @keyframes slide-left {
          from { transform: translateX(-100%); }
          to { transform: translateX(0); }
        }
        @keyframes pop-in {
          0% { transform: scale(0.95); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        .animate-slide-left {
          animation: slide-left 0.3s ease-out;
        }
        .animate-pop-in {
          animation: pop-in 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .shadow-up {
          box-shadow: 0 -4px 12px rgba(0,0,0,0.05);
        }
      `}</style>
    </div>
  );
};

export default App;
