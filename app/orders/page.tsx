'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { 
  MagnifyingGlassIcon,
  CheckCircleIcon,
  ClockIcon,
  TruckIcon,
  XCircleIcon,
  ChevronRightIcon,
  UserIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '@/contexts/AuthContext';
import LoginModal from '@/components/LoginModal';

interface OrderItem {
  id: string;
  productId: string;
  quantity: number;
  price: number;
  product: {
    id: string;
    name: string;
    unitType: 'WEIGHT' | 'PIECE';
  };
}

interface Order {
  id: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  status: 'PENDING' | 'CONFIRMED' | 'PREPARING' | 'READY' | 'DELIVERED' | 'CANCELLED';
  total: number;
  orderItems: OrderItem[];
  createdAt: string;
  deliveryFee: number;
  estimatedDelivery?: string;
  notes?: string;
}

export default function OrdersPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  
  const { user, isAuthenticated } = useAuth();

  const fetchOrders = useCallback(async () => {
    if (!isAuthenticated || !user) {
      setIsLoginModalOpen(true);
      return;
    }
    
    setLoading(true);
    try {
      let url = `/api/orders/user?userId=${user.id}`;
      if (searchQuery.trim()) {
        url += `&phone=${encodeURIComponent(searchQuery)}`;
      }
      
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setFilteredOrders(data);
      } else {
        console.error('Error fetching orders');
        setFilteredOrders([]);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      setFilteredOrders([]);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, user, searchQuery]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  useEffect(() => {
    if (searchQuery.trim() && isAuthenticated && user) {
      fetchOrders();
    } else if (!searchQuery.trim() && isAuthenticated && user) {
      fetchOrders();
    }
  }, [searchQuery, isAuthenticated, user, fetchOrders]);

  const getStatusIcon = (status: Order['status']) => {
    switch (status) {
      case 'PENDING':
        return <ClockIcon className="h-5 w-5 text-yellow-500" />;
      case 'CONFIRMED':
        return <CheckCircleIcon className="h-5 w-5 text-blue-500" />;
      case 'PREPARING':
        return <ClockIcon className="h-5 w-5 text-orange-500" />;
      case 'READY':
        return <TruckIcon className="h-5 w-5 text-purple-500" />;
      case 'DELIVERED':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'CANCELLED':
        return <XCircleIcon className="h-5 w-5 text-red-500" />;
      default:
        return <ClockIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusText = (status: Order['status']) => {
    switch (status) {
      case 'PENDING':
        return 'قيد المراجعة';
      case 'CONFIRMED':
        return 'تم التأكيد';
      case 'PREPARING':
        return 'قيد التحضير';
      case 'READY':
        return 'جاهز للتسليم';
      case 'DELIVERED':
        return 'تم التسليم';
      case 'CANCELLED':
        return 'ملغي';
      default:
        return 'غير معروف';
    }
  };

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'CONFIRMED':
        return 'bg-blue-100 text-blue-800';
      case 'PREPARING':
        return 'bg-orange-100 text-orange-800';
      case 'READY':
        return 'bg-purple-100 text-purple-800';
      case 'DELIVERED':
        return 'bg-green-100 text-green-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatPrice = (price: number) => {
    return `${price.toFixed(2)} ج.م`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Breadcrumb */}
          <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-4" dir="rtl">
            <Link href="/" className="hover:text-red-600">الرئيسية</Link>
            <ChevronRightIcon className="h-4 w-4 mx-2" />
            <span className="text-gray-900">تتبع الطلبات</span>
          </nav>

          <div className="flex items-center justify-between" dir="rtl">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">تتبع الطلبات</h1>
              <p className="text-gray-600 mt-2">
                {isAuthenticated 
                  ? `مرحباً ${user?.name}، هنا يمكنك متابعة جميع طلباتك`
                  : 'يرجى تسجيل الدخول لمتابعة طلباتك'
                }
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Login Required Message */}
        {!isAuthenticated && (
          <div className="bg-white rounded-lg shadow-sm p-8 mb-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <UserIcon className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">تسجيل الدخول مطلوب</h2>
            <p className="text-gray-600 mb-6">
              لتتمكن من تتبع طلباتك ومراجعة تاريخ الطلبات، يرجى تسجيل الدخول أولاً
            </p>
            <button
              onClick={() => setIsLoginModalOpen(true)}
              className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors font-medium"
            >
              تسجيل الدخول
            </button>
          </div>
        )}

        {/* Search Section */}
        {isAuthenticated && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <h2 className="text-lg font-bold text-gray-900 mb-4">البحث في الطلبات</h2>
            <div className="relative" dir="rtl">
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-900" />
              </div>
              <input
                type="text"
                className="block w-full pr-10 pl-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 text-gray-900 font-medium"
                placeholder="ابحث برقم الطلب أو رقم الهاتف..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        )}

        {/* Orders List */}
        {isAuthenticated && (
          <div className="space-y-6">
            {loading ? (
              <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
                <p className="text-gray-600">جاري تحميل الطلبات...</p>
              </div>
            ) : filteredOrders.length > 0 ? (
              filteredOrders.map((order) => (
                <div key={order.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
                  <div className="p-6" dir="rtl">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-4 rtl:space-x-reverse">
                        <div className="flex items-center space-x-2 rtl:space-x-reverse">
                          {getStatusIcon(order.status)}
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                            {getStatusText(order.status)}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">رقم الطلب</p>
                          <p className="font-medium">{order.id.slice(-8).toUpperCase()}</p>
                        </div>
                      </div>
                      <div className="text-left rtl:text-right">
                        <p className="text-sm text-gray-500">إجمالي الطلب</p>
                        <p className="text-lg font-bold text-gray-900">{formatPrice(order.total + order.deliveryFee)}</p>
                      </div>
                    </div>

                    <div className="border-t pt-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-gray-500">تاريخ الطلب</p>
                          <p className="font-medium">{formatDate(order.createdAt)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">العنوان</p>
                          <p className="font-medium">{order.customerAddress}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">عدد المنتجات</p>
                          <p className="font-medium">{order.orderItems.length} منتج</p>
                        </div>
                      </div>

                      {/* Order Items */}
                      <div className="space-y-2">
                        {order.orderItems.map((item) => (
                          <div key={item.id} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                            <div>
                              <p className="font-medium">{item.product.name}</p>
                              <p className="text-sm text-gray-500">
                                الكمية: {item.quantity} {item.product.unitType === 'WEIGHT' ? 'كيلو' : 'قطعة'}
                              </p>
                            </div>
                            <p className="font-medium">{formatPrice(item.price * item.quantity)}</p>
                          </div>
                        ))}
                      </div>

                      {/* Order Notes */}
                      {order.notes && (
                        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-500 mb-1">ملاحظات</p>
                          <p className="text-sm">{order.notes}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                <MagnifyingGlassIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">لم يتم العثور على طلبات</h3>
                <p className="text-gray-600 mb-6">
                  {searchQuery
                    ? 'لم يتم العثور على طلبات تطابق بحثك. تأكد من رقم الطلب أو رقم الهاتف.'
                    : 'لا توجد طلبات لعرضها في الوقت الحالي.'}
                </p>
                <Link
                  href="/"
                  className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  تصفح المنتجات
                </Link>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Login Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        redirectTo="/orders"
      />
    </div>
  );
}
