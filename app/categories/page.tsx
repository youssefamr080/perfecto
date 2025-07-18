'use client'

import React from 'react'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

// جميع الأقسام والفئات
const allCategories = [
	{
		id: 'meat',
		name: 'اللحوم والمصنعات',
		description: 'لحوم طازجة ومصنعات عالية الجودة',
		subcategories: [
			{ id: 'luncheon', name: 'اللانشون', href: '/category/luncheon' },
			{ id: 'pastrami', name: 'البسطرمة', href: '/category/pastrami' },
			{ id: 'kofta', name: 'الكفتة', href: '/category/kofta' },
			{ id: 'sausage', name: 'السجق', href: '/category/sausage' },
			{
				id: 'ground-meat',
				name: 'اللحمة المفرومة',
				href: '/category/ground-meat',
			},
			{ id: 'liver', name: 'الكبدة', href: '/category/liver' },
	  { id: 'burger', name: 'البرجر', href: '/category/burger' },
	  
		],
	},
	{
		id: 'dairy',
		name: 'الألبان ومنتجاتها',
		description: 'منتجات ألبان طازجة ومتنوعة',
		subcategories: [
			{ id: 'yogurt', name: 'الزبادي', href: '/category/yogurt' },
			{ id: 'milk', name: 'اللبن', href: '/category/milk' },
			{ id: 'cheese', name: 'الجبن', href: '/category/cheese' },
		],
	},
	{
		id: 'honey',
		name: 'العسل والطحينة',
		description: 'عسل طبيعي وطحينة فاخرة',
		subcategories: [
			{ id: 'honey', name: 'العسل', href: '/category/honey' },
			{ id: 'tahini', name: 'الطحينة', href: '/category/tahini' },
		],
	},
	{
		id: 'other',
		name: 'أقسام أخرى',
		description: 'منتجات متنوعة وعالية الجودة',
		subcategories: [
			{ id: 'eggs', name: 'البيض', href: '/category/eggs' },
			{ id: 'halawa', name: 'الحلاوة الطحينية', href: '/category/halawa' },
			{ id: 'butter', name: 'سمنه', href: '/category/butter' },
		],
	},
]

export default function CategoriesPage() {
	return (
		<>
			<div className="min-h-screen bg-gray-50 py-8">
				<div className="container mx-auto px-4">
					{/* Header */}
					<div className="text-center mb-12">
						<h1 className="text-3xl md:text-4xl font-bold text-black mb-4">
							جميع الأقسام
						</h1>
						<p className="text-lg text-black max-w-2xl mx-auto">
							اكتشف مجموعتنا الكاملة من المنتجات الطازجة وعالية الجودة
						</p>
					</div>

					{/* Categories Grid */}
					<div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
						{allCategories.map((category) => (
							<div
								key={category.id}
								className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden"
							>
								<div className="p-6">
									<h2 className="text-2xl font-bold text-black mb-3">
										{category.name}
									</h2>
									<p className="text-black mb-6">
										{category.description}
									</p>

									{/* Subcategories */}
									<div className="space-y-3">
										{category.subcategories.map((sub) => (
											<Link
												key={sub.id}
												href={sub.href}
												className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-red-50 transition-all duration-200 group"
											>
												<span className="font-medium text-black group-hover:text-red-600 transition-colors">{sub.name}</span>
												<ArrowRight className="w-5 h-5 text-black group-hover:text-red-600 transition-colors" />
											</Link>
										))}
									</div>
								</div>
							</div>
						))}
					</div>

					{/* Back to Home */}
					<div className="text-center mt-12">
						<Link
							href="/"
							className="inline-flex items-center space-x-2 rtl:space-x-reverse bg-red-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-red-700 transition-colors"
						>
							<ArrowRight className="w-5 h-5 rotate-180" />
							<span>العودة للرئيسية</span>
						</Link>
					</div>
				</div>
			</div>
		</>
	)
}
