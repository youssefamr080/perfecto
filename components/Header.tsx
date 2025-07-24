'use client'

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, Search, ShoppingBag, UserCircle, X } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import PowerfulSearchBar from './PowerfulSearchBar';
import { AppCategory } from '@/types';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [categories, setCategories] = useState<AppCategory[]>([]);
  const { itemCount } = useCart();
  const { user, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories');
        if (response.ok) {
          const data = await response.json();
          setCategories(data);
        } else {
          console.error('Failed to fetch categories');
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
    fetchCategories();
  }, []);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50 border-b border-gray-200">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top bar with contact info */}
        <div className="hidden md:flex justify-between items-center py-2 text-sm text-gray-500">
        </div>

        {/* Main header */}
        <div className="flex items-center justify-between py-4">
          {/* Logo */}
          <div className="flex items-center lg:flex-none">
            <Link href="/" className="flex items-center space-x-2 rtl:space-x-reverse">
              <Image 
                src="/images/about/c3b0c8fc-b22d-4c2d-bd19-a7a69e537e82-removebg-preview (2).png"
                alt="Perfecto Logo"
                width={40}
                height={40}
                className="h-10 w-10"
              />
              <span className="text-2xl font-bold text-red-600">perfecto</span>
            </Link>
          </div>

          {/* Desktop Navigation - Centered */}
          <div className="flex-grow hidden lg:flex items-center justify-center">
            <nav className="flex items-center space-x-8 rtl:space-x-reverse">
              <div className="group relative">
                <button className="text-gray-700 font-medium hover:text-red-600 transition-colors flex items-center">
                  الأقسام
                  <svg className="w-4 h-4 ml-1 rtl:mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </button>
                <div className="absolute hidden group-hover:block bg-white shadow-lg rounded-md mt-2 py-2 w-56 z-10 border border-gray-100">
                  {categories.map(category => (
                    <Link key={category.id} href={`/categories/${category.slug}`} className="block px-4 py-2 text-gray-700 hover:bg-red-50 hover:text-red-600">
                      {category.name}
                    </Link>
                  ))}
                </div>
              </div>
              <Link href="/discounts" className="text-gray-700 font-medium hover:text-red-600 transition-colors">العروض</Link>
            </nav>
          </div>

          {/* Icons */}
          <div className="flex items-center space-x-4 rtl:space-x-reverse">
            <button onClick={() => setIsSearchOpen(true)} className="text-gray-600 hover:text-red-600 transition-colors">
              <Search className="w-6 h-6" />
            </button>
            <div className="group relative">
              <Link href={user ? "/profile" : "/login"} className="text-gray-600 hover:text-red-600 transition-colors">
                <UserCircle className="w-6 h-6" />
              </Link>
              {user && (
                <div className="absolute hidden group-hover:block bg-white shadow-lg rounded-md mt-2 py-2 w-48 z-10 right-0 border border-gray-100">
                  <div className="px-4 py-3 text-gray-800 border-b font-medium">مرحباً, {user.name}</div>
                  <Link href="/profile" className="block px-4 py-2 text-gray-700 hover:bg-red-50 hover:text-red-600">حسابي</Link>
                  <Link href="/orders" className="block px-4 py-2 text-gray-700 hover:bg-red-50 hover:text-red-600">طلباتي</Link>
                  <button onClick={handleLogout} className="w-full text-right block px-4 py-2 text-gray-700 hover:bg-red-50 hover:text-red-600">تسجيل الخروج</button>
                </div>
              )}
            </div>
            <Link href="/cart" className="relative text-gray-600 hover:text-red-600 transition-colors">
              <ShoppingBag className="w-6 h-6" />
              {itemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </Link>
            <button onClick={() => setIsMenuOpen(true)} className="lg:hidden text-gray-600 hover:text-red-600 transition-colors">
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`fixed top-0 right-0 h-full w-72 bg-white shadow-lg z-50 transform transition-transform ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-bold text-red-600">القائمة</h2>
          <button onClick={() => setIsMenuOpen(false)}>
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>
        <nav className="p-4">
          <div className="py-2 px-4">
            <h3 className="font-semibold mb-2 text-gray-800">الأقسام</h3>
            {categories.map(category => (
              <Link key={category.id} href={`/categories/${category.slug}`} className="block py-1.5 px-2 text-sm rounded hover:bg-red-50 hover:text-red-600 text-gray-600">
                {category.name}
              </Link>
            ))}
          </div>
          <Link href="/discounts" className="block py-2 px-4 rounded hover:bg-red-50 hover:text-red-600">العروض</Link>
          <div className="border-t mt-4 pt-4">
          </div>
        </nav>
      </div>

      {/* Search Overlay */}
      {isSearchOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-start pt-20 px-4">
          <div className="bg-white p-4 rounded-lg w-full max-w-3xl relative shadow-2xl">
            <button onClick={() => setIsSearchOpen(false)} className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 transition-colors">
              <X className="w-6 h-6" />
            </button>
            <PowerfulSearchBar />
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
