'use client'

import React, { useEffect, useState, FC } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { 
  ShoppingBagIcon, 
  UsersIcon, 
  CurrencyDollarIcon,
  ChartBarIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon
} from '@heroicons/react/24/outline'

interface Product {
  id: string
  name: string
  price: number
  oldPrice?: number | null
  images: string[]
  category: string
  isAvailable: boolean
  unitType: 'WEIGHT' | 'PIECE'
  description?: string | null
  createdAt: string
}

interface Order {
  id: string
  customerName: string
  customerPhone: string
  customerAddress: string
  status: 'PENDING' | 'CONFIRMED' | 'PREPARING' | 'READY' | 'DELIVERED' | 'CANCELLED'
  total: number
  deliveryFee: number
  createdAt: string
  orderItems: {
    id: string
    quantity: number
    price: number
    product: {
      name: string
    }
  }[]
}

interface Customer {
  id: string
  name: string
  phone: string
  address?: string | null
  createdAt: string
  _count: {
    orders: number
  }
}

interface AdminData {
  products: Product[]
  orders: Order[]
  customers: Customer[]
  stats: {
    totalProducts: number
    totalOrders: number
    totalCustomers: number
    totalRevenue: number
  }
}


// Accordion component for products (fix: move outside main component)
const ProductsAccordion: FC<{ products: Product[] }> = ({ products }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="bg-white rounded-lg shadow mb-8">
      <button
        className="w-full flex items-center justify-between px-6 py-4 border-b border-gray-200 focus:outline-none"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <span className="text-lg font-semibold text-gray-900">أحدث المنتجات</span>
        <span className={`transition-transform ${open ? 'rotate-180' : ''}`}>▼</span>
      </button>
      {open && (
        <div className="overflow-x-auto">
          <div className="flex space-x-2 rtl:space-x-reverse px-6 py-2">
            <Link href="/admin/products/new" className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600">
              إضافة منتج
            </Link>
            <Link href="/admin/products" className="text-red-500 hover:text-red-600">
              عرض الكل
            </Link>
          </div>
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">المنتج</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">القسم</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">السعر</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الحالة</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {products.map((product) => (
                <tr key={product.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <Image
                          className="h-10 w-10 rounded object-cover"
                          src={product.images[0] || '/placeholder.jpg'}
                          alt={product.name}
                          width={40}
                          height={40}
                        />
                      </div>
                      <div className="mr-4">
                        <div className="text-sm font-medium text-gray-900">{product.name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.category}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div>
                      <div className="font-medium">{typeof product.price === 'number' ? product.price.toFixed(2) : '—'} ج.م</div>
                      {typeof product.oldPrice === 'number' && product.oldPrice > 0 && (
                        <div className="text-gray-500 line-through text-xs">{product.oldPrice.toFixed(2)} ج.م</div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      product.isAvailable 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {product.isAvailable ? 'متاح' : 'غير متاح'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex space-x-2 rtl:space-x-reverse">
                      <button className="text-blue-600 hover:text-blue-900">
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button className="text-red-600 hover:text-red-900">
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

const AdminDashboard: React.FC = () => {
  const [data, setData] = useState<AdminData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Polling for new orders every 10 seconds
  useEffect(() => {
    fetchAdminData();
    const interval = setInterval(fetchAdminData, 10000);
    return () => clearInterval(interval);
  }, []);
  // Track the latest order to show notification
  const [lastOrderId, setLastOrderId] = useState<string | null>(null);
  const [newOrder, setNewOrder] = useState<Order | null>(null);

  useEffect(() => {
    if (data && data.orders.length > 0) {
      const latest = data.orders[0];
      if (lastOrderId && latest.id !== lastOrderId) {
        setNewOrder(latest);
      }
      setLastOrderId(latest.id);
    }
  }, [data, lastOrderId]);

  const fetchAdminData = async () => {
    try {
      const response = await fetch('/api/admin/dashboard')
      if (!response.ok) {
        throw new Error('فشل في تحميل البيانات')
      }
      const result = await response.json()
      setData(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'حدث خطأ')
    } finally {
      setLoading(false)
    }
  }

  const orderStatusColors = {
    PENDING: 'bg-yellow-100 text-yellow-800',
    CONFIRMED: 'bg-blue-100 text-blue-800',
    PREPARING: 'bg-orange-100 text-orange-800',
    PROCESSING: 'bg-purple-100 text-purple-800',
    READY: 'bg-green-100 text-green-800',
    DELIVERED: 'bg-green-100 text-green-800',
    CANCELLED: 'bg-red-100 text-red-800',
  }

  const orderStatusNames = {
    PENDING: 'في الانتظار',
    CONFIRMED: 'مؤكد',
    PREPARING: 'يتم التحضير',
    PROCESSING: 'قيد المعالجة',
    READY: 'جاهز للتسليم',
    DELIVERED: 'تم التسليم',
    CANCELLED: 'ملغي',
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">جاري تحميل لوحة الإدارة...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={fetchAdminData}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            إعادة المحاولة
          </button>
        </div>
      </div>
    )
  }

  if (!data) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* New Order Notification */}
      {newOrder && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-green-100 border border-green-400 text-green-800 px-6 py-4 rounded-lg shadow-lg flex flex-col items-center rtl:text-right" style={{minWidth:'320px',maxWidth:'90vw'}}>
          <div className="flex items-center mb-2">
            <span className="font-bold text-lg ml-2">طلب جديد!</span>
            <span className="text-xs text-gray-500">رقم الطلب: #{newOrder.id.slice(-8)}</span>
          </div>
          <div className="mb-1">العميل: <span className="font-semibold">{newOrder.customerName}</span></div>
          <div className="mb-1">رقم الهاتف: <span className="font-semibold">{newOrder.customerPhone}</span></div>
          <div className="mb-1">العنوان: <span className="font-semibold">{newOrder.customerAddress}</span></div>
          <div className="mb-2">إجمالي المبلغ: <span className="font-semibold">{typeof newOrder.total === 'number' ? newOrder.total.toFixed(2) : '—'} ج.م</span></div>
          <button onClick={() => setNewOrder(null)} className="mt-2 bg-green-500 text-white px-4 py-1 rounded hover:bg-green-600">إغلاق</button>
        </div>
      )}
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">لوحة الإدارة</h1>
            <Link 
              href="/"
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
              العودة للمتجر
            </Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <ShoppingBagIcon className="h-8 w-8 text-blue-500" />
              <div className="mr-4">
                <p className="text-sm font-medium text-gray-500">إجمالي المنتجات</p>
                <p className="text-2xl font-bold text-gray-900">{data.stats.totalProducts}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <CurrencyDollarIcon className="h-8 w-8 text-green-500" />
              <div className="mr-4">
                <p className="text-sm font-medium text-gray-500">إجمالي الطلبات</p>
                <p className="text-2xl font-bold text-gray-900">{data.stats.totalOrders}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <UsersIcon className="h-8 w-8 text-purple-500" />
              <div className="mr-4">
                <p className="text-sm font-medium text-gray-500">إجمالي العملاء</p>
                <p className="text-2xl font-bold text-gray-900">{data.stats.totalCustomers}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <ChartBarIcon className="h-8 w-8 text-red-500" />
              <div className="mr-4">
                <p className="text-sm font-medium text-gray-500">إجمالي المبيعات</p>
                <p className="text-2xl font-bold text-gray-900">{typeof data.stats.totalRevenue === 'number' ? data.stats.totalRevenue.toFixed(2) : '—'} ج.م</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-lg shadow mb-8 w-full">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">متابعة الطلبات</h2>
              <Link href="/admin/orders" className="text-red-500 hover:text-red-600">
                عرض الكل
              </Link>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-right font-medium text-gray-500 uppercase tracking-wider">رقم الطلب</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-500 uppercase tracking-wider">العميل</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-500 uppercase tracking-wider">الهاتف</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-500 uppercase tracking-wider">العنوان</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-500 uppercase tracking-wider">الحالة</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-500 uppercase tracking-wider">المبلغ</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-500 uppercase tracking-wider">المنتجات</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-500 uppercase tracking-wider">التاريخ</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-500 uppercase tracking-wider">تحديث الحالة</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data.orders.map((order) => (
                  <tr key={order.id} className="align-top">
                    <td className="px-4 py-3 font-bold text-gray-800">#{order.id.slice(-8)}</td>
                    <td className="px-4 py-3 text-gray-900">{order.customerName}</td>
                    <td className="px-4 py-3 text-gray-900">{order.customerPhone}</td>
                    <td className="px-4 py-3 max-w-xs truncate text-gray-900" title={order.customerAddress}>{order.customerAddress}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${orderStatusColors[order.status as keyof typeof orderStatusColors]}`}
                        style={{color:'#222'}}>
                        {orderStatusNames[order.status as keyof typeof orderStatusNames]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-900">{typeof order.total === 'number' ? order.total.toFixed(2) : '—'} ج.م</td>
                    <td className="px-4 py-3">
                      <ul className="list-disc rtl:list-inside text-xs text-gray-900">
                        {order.orderItems.map((item) => (
                          <li key={item.id}>{item.product.name} × {item.quantity}</li>
                        ))}
                      </ul>
                    </td>
                    <td className="px-4 py-3 text-gray-900">{new Date(order.createdAt).toLocaleString('ar-EG')}</td>
                    <td className="px-4 py-3">
                      <select
                        className="border rounded px-2 py-1 text-xs"
                        value={order.status}
                        onChange={async (e) => {
                          const newStatus = e.target.value as Order['status'];
                          try {
                            const res = await fetch(`/api/admin/orders/${order.id}/status`, {
                              method: 'PATCH',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ status: newStatus })
                            });
                            if (res.ok) {
                              fetchAdminData();
                            } else {
                              alert('فشل في تحديث حالة الطلب');
                            }
                          } catch {
                            alert('حدث خطأ أثناء تحديث الحالة');
                          }
                        }}
                      >
                        {Object.keys(orderStatusNames).map((status) => (
                          <option key={status} value={status}>
                            {orderStatusNames[status as keyof typeof orderStatusNames]}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Products Accordion */}
        <ProductsAccordion products={data.products} />

        {/* Recent Customers */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">أحدث العملاء</h2>
              <Link href="/admin/customers" className="text-red-500 hover:text-red-600">
                عرض الكل
              </Link>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    الاسم
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    رقم الهاتف
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    عدد الطلبات
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    تاريخ التسجيل
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    الإجراءات
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data.customers.map((customer) => (
                  <tr key={customer.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {customer.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {customer.phone}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {customer._count.orders}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(customer.createdAt).toLocaleDateString('ar-EG')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex space-x-2 rtl:space-x-reverse">
                        <button className="text-blue-600 hover:text-blue-900">
                          <EyeIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard
