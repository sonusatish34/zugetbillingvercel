'use client';

import React, { useCallback } from 'react';
import { AddItemForm } from '@/components/features/AddItemForm';
import { useRouter } from 'next/navigation';

export default function AddItemPage() {
  const router = useRouter();

  const handleCancel = useCallback(() => {
    router.push('/inventory/total');
  }, [router]);

  const handleSubmit = useCallback((data: any) => {
    // TODO: Implement API call to create item
    console.log('Form submitted:', data);
    router.push('/inventory/total');
  }, [router]);

  return (
    <main className="space-y-6" role="main" aria-label="Add new item">
      <div>
        <h1 className="text-2xl font-bold text-primary mb-6">Add Item</h1>
        <AddItemForm onCancel={handleCancel} onSubmit={handleSubmit} />
      </div>
      
      {/* Footer */}
      <footer className="flex flex-col sm:flex-row items-center justify-between py-4 text-xs sm:text-sm text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-slate-700 mt-8 gap-2">
        <p>© 2025 ZuGet, All Rights Reserved</p>
        <p>Version: 1.3.8</p>
      </footer>
    </main>
  );
}
