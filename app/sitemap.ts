import type { MetadataRoute } from 'next'
import type { SupabaseClient } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import type { Database } from '@/lib/database.types'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = (process.env.NEXT_PUBLIC_SITE_URL || 'https://perfecto-phi.vercel.app').replace(/\/$/, '')
  const now = new Date()

  const staticEntries: MetadataRoute.Sitemap = [
    { url: `${base}/`, lastModified: now, changeFrequency: 'daily', priority: 1 },
    { url: `${base}/categories`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${base}/offers`, lastModified: now, changeFrequency: 'daily', priority: 0.8 },
    { url: `${base}/search`, lastModified: now, changeFrequency: 'daily', priority: 0.6 },
  ]

  const db = supabase as unknown as SupabaseClient<Database>

  try {
    type BasicRow = { id: string; updated_at?: string | null; created_at?: string | null }
    const [categoriesRes, subcategoriesRes, productsRes] = await Promise.all([
      db.from('categories').select('id, updated_at, created_at').eq('is_active', true),
      db.from('subcategories').select('id, updated_at, created_at').eq('is_active', true),
      db.from('products').select('id, updated_at, created_at').eq('is_available', true),
    ])

    const categories = (categoriesRes.data ?? []) as BasicRow[]
    const subcategories = (subcategoriesRes.data ?? []) as BasicRow[]
    const products = (productsRes.data ?? []) as BasicRow[]

    const dynamicEntries: MetadataRoute.Sitemap = [
      ...categories.map((c) => ({
        url: `${base}/category/${c.id}`,
        lastModified: c.updated_at ? new Date(c.updated_at) : c.created_at ? new Date(c.created_at) : now,
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      })),
      ...subcategories.map((s) => ({
        url: `${base}/subcategory/${s.id}`,
        lastModified: s.updated_at ? new Date(s.updated_at) : s.created_at ? new Date(s.created_at) : now,
        changeFrequency: 'weekly' as const,
        priority: 0.6,
      })),
      ...products.map((p) => ({
        url: `${base}/product/${p.id}`,
        lastModified: p.updated_at ? new Date(p.updated_at) : p.created_at ? new Date(p.created_at) : now,
        changeFrequency: 'weekly' as const,
        priority: 0.5,
      })),
    ]

    return [...staticEntries, ...dynamicEntries]
  } catch (e) {
    console.error('sitemap generation failed, returning static entries only', e)
    return staticEntries
  }
}
