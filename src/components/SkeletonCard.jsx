import React from 'react'

export function SkeletonCard() {
  return (
    <div className="bg-white border border-gray-100 rounded-xl p-4">
      <div className="flex gap-3">
        <div className="skeleton w-12 h-12 rounded-lg flex-shrink-0" />
        <div className="flex-1">
          <div className="skeleton h-3.5 w-3/4 mb-2" />
          <div className="skeleton h-3 w-2/5 mb-3" />
          <div className="flex gap-2">
            <div className="skeleton h-5 w-16 rounded-full" />
            <div className="skeleton h-5 w-16 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  )
}

export function SkeletonDetail() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="bg-white border border-gray-100 rounded-xl p-4">
        <div className="flex gap-4">
          <div className="skeleton w-20 h-20 rounded-xl flex-shrink-0" />
          <div className="flex-1">
            <div className="skeleton h-4 w-3/4 mb-2" />
            <div className="skeleton h-3 w-2/5 mb-4" />
            <div className="flex gap-4">
              <div className="skeleton w-10 h-10 rounded-full" />
              <div className="skeleton w-10 h-10 rounded-full" />
            </div>
          </div>
        </div>
      </div>
      <div className="bg-white border border-gray-100 rounded-xl p-4 h-40" />
      <div className="bg-white border border-gray-100 rounded-xl p-4 h-32" />
    </div>
  )
}
