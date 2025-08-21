'use client';

import { AlertTriangle } from 'lucide-react';

export default function BrokenVideoWidget() {
  return (
    <div className="border border-red-300 my-4 mx-2 text-red-700 dark:text-red-900 dark:border-red-800 p-4 rounded-xl flex items-center gap-3">
      <AlertTriangle className="w-5 h-5 flex-shrink-0" />
      <div>
        <p className="font-semibold text-sm">Missing Video Data</p>
        <p className="text-xs text-red-600 dark:text-red-900">
          Unable to render video. Metadata is incomplete or unavailable.
        </p>
      </div>
    </div>
  );
}
