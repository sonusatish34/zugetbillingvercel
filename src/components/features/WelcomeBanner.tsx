import React from 'react';
import Image from 'next/image';
import { Card } from '@/components/ui/Card';

interface WelcomeBannerProps {
  imageSrc?: string;
  imageAlt?: string;
}

export const WelcomeBanner: React.FC<WelcomeBannerProps> = ({
  imageSrc,
  imageAlt = 'Welcome illustration',
}) => {
  return (
    <Card className="bg-gradient-to-r from-purple-600 to-purple-700 text-white p-6 md:p-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex-1">
          <h2 className="text-2xl md:text-3xl font-bold mb-2">Good Morning, Shekhar</h2>
          <p className="text-purple-100 text-sm md:text-base mb-4">
            You have 15+ invoices saved to draft that has to send to customers
          </p>
          <p className="text-purple-200 text-xs md:text-sm">
            Friday, 24 Mar 2025 11:24 AM
          </p>
        </div>
        <div className="hidden md:block">
          {imageSrc ? (
            <div className="w-32 h-32 relative">
              <Image
                src={imageSrc}
                alt={imageAlt}
                width={128}
                height={128}
                className="object-contain"
              />
            </div>
          ) : (
            <div className="w-32 h-32 bg-purple-500/20 rounded-lg flex items-center justify-center">
              <svg
                className="w-20 h-20 text-white/50"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

