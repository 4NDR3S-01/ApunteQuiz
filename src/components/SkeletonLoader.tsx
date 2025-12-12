'use client';

import React from 'react';

interface SkeletonLoaderProps {
  className?: string;
  lines?: number;
  width?: string;
  height?: string;
}

export function SkeletonLoader({ 
  className = '', 
  lines = 3,
  width = '100%',
  height = '1rem'
}: SkeletonLoaderProps) {
  return (
    <div className={`animate-pulse space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="bg-gray-200 dark:bg-gray-700 rounded"
          style={{
            width: i === lines - 1 ? '75%' : width,
            height
          }}
          aria-hidden="true"
        />
      ))}
    </div>
  );
}

export function SkeletonCard({ className = '' }: { className?: string }) {
  return (
    <div className={`a11y-card rounded-lg p-6 ${className}`}>
      <div className="animate-pulse space-y-4">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded" />
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6" />
        </div>
        <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
      </div>
    </div>
  );
}

export function SkeletonQuizCard({ className = '' }: { className?: string }) {
  return (
    <div className={`a11y-card rounded-lg p-6 ${className}`}>
      <div className="animate-pulse space-y-4">
        <div className="flex items-center justify-between">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20" />
        </div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full" />
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-4/5" />
        <div className="flex gap-2">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-24" />
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-24" />
        </div>
      </div>
    </div>
  );
}
