"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronRight } from "lucide-react"

type Segment = { href?: string; label: string; icon?: React.ReactNode; count?: number }

export default function Breadcrumbs({ segments }: { segments: Segment[] }) {
  const pathname = usePathname()

  // Small screens: show compact (first ... last). Larger screens show full trail.
  const first = segments[0]
  const last = segments[segments.length - 1]

  const itemListElement = segments.map((seg, idx) => ({
    '@type': 'ListItem',
    position: idx + 1,
    name: seg.label,
    item: seg.href || undefined,
  }))

  return (
    <nav aria-label="breadcrumb" className="text-sm">
      {/* structured data for SEO */}
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement,
          }),
        }}
      />
      {/* full breadcrumb for md+ */}
      <ol className="hidden md:flex items-center gap-2 text-gray-600 overflow-auto">
        {segments.map((seg, idx) => {
          const isLast = idx === segments.length - 1
          // Treat a segment as active if the pathname starts with the segment href.
          // For root ('/'), require exact match to avoid marking everything active.
          const active = Boolean(
            seg.href && pathname && (seg.href === "/" ? pathname === "/" : pathname.startsWith(seg.href))
          )
          return (
            <li key={idx} className="flex items-center max-w-xs md:max-w-sm">
              {seg.href && !isLast ? (
                <Link
                  href={seg.href}
                  className={`truncate inline-flex items-center gap-2 hover:text-green-600 focus:outline-none focus:ring-2 focus:ring-green-100 rounded ${active ? 'text-green-600 font-semibold' : 'text-gray-600'}`}
                  title={seg.label}
                >
                  {seg.icon && <span className="flex-shrink-0">{seg.icon}</span>}
                  <span className="truncate">{seg.label}</span>
                  {typeof seg.count === 'number' && (
                    <span className="ml-2 inline-flex items-center justify-center px-2 py-0.5 text-xs font-semibold rounded-full bg-green-50 text-green-700">{seg.count}</span>
                  )}
                </Link>
              ) : isLast ? (
                <span aria-current="page" className="truncate text-black font-semibold inline-flex items-center gap-2" title={seg.label}>
                  {seg.icon && <span className="flex-shrink-0">{seg.icon}</span>}
                  <span className="truncate">{seg.label}</span>
                  {typeof seg.count === 'number' && (
                    <span className="ml-2 inline-flex items-center justify-center px-2 py-0.5 text-xs font-semibold rounded-full bg-green-50 text-green-700">{seg.count}</span>
                  )}
                </span>
              ) : (
                <span className="truncate text-gray-600 inline-flex items-center gap-2" title={seg.label}>
                  {seg.icon && <span className="flex-shrink-0">{seg.icon}</span>}
                  <span className="truncate">{seg.label}</span>
                </span>
              )}

              {!isLast && (
                <ChevronRight className="h-4 w-4 text-gray-500 mx-2 flex-shrink-0" aria-hidden />
              )}
            </li>
          )
        })}
      </ol>

      {/* compact breadcrumb for small screens */}
      <ol className="flex md:hidden items-center gap-2 text-gray-600">
        {/* Show only if we have more than 2 segments */}
        {segments.length > 2 && first && (
          <>
            <li className="truncate max-w-[30%]">
              {first.href ? (
                <Link href={first.href} className="truncate text-gray-600 hover:text-green-600" title={first.label}>{first.label}</Link>
              ) : (
                <span className="truncate text-gray-600" title={first.label}>{first.label}</span>
              )}
            </li>
            <ChevronRight className="h-4 w-4 text-gray-500 mx-1" aria-hidden />
            <li className="truncate text-gray-500">…</li>
            <ChevronRight className="h-4 w-4 text-gray-500 mx-1" aria-hidden />
          </>
        )}

        {/* Show previous segment if we have more than 1 segment */}
        {segments.length > 1 && segments.length > 2 && (
          <>
            <li className="truncate max-w-[35%]">
              {segments[segments.length - 2].href ? (
                <Link 
                  href={segments[segments.length - 2].href!} 
                  className="truncate text-gray-600 hover:text-green-600" 
                  title={segments[segments.length - 2].label}
                >
                  {segments[segments.length - 2].label}
                </Link>
              ) : (
                <span className="truncate text-gray-600" title={segments[segments.length - 2].label}>
                  {segments[segments.length - 2].label}
                </span>
              )}
            </li>
            <ChevronRight className="h-4 w-4 text-gray-500 mx-1" aria-hidden />
          </>
        )}

        {/* Show first and last for 2 segments only */}
        {segments.length === 2 && first && (
          <>
            <li className="truncate max-w-[40%]">
              {first.href ? (
                <Link href={first.href} className="truncate text-gray-600 hover:text-green-600" title={first.label}>{first.label}</Link>
              ) : (
                <span className="truncate text-gray-600" title={first.label}>{first.label}</span>
              )}
            </li>
            <ChevronRight className="h-4 w-4 text-gray-500 mx-1" aria-hidden />
          </>
        )}

        {/* Always show the current page */}
        {last && (
          <li className="truncate max-w-[50%]">
            {last.href ? (
              <Link href={last.href} className="truncate text-black font-semibold" title={last.label}>{last.label}</Link>
            ) : (
              <span className="truncate text-black font-semibold" title={last.label}>{last.label}</span>
            )}
          </li>
        )}
      </ol>
    </nav>
  )
}
