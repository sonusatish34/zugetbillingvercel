'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { Card } from '@/components/ui/Card';

interface WelcomeBannerProps {
  imageSrc?: string;
  imageAlt?: string;
  storeName?: string;
  storeId?: string;
  ownerName?: string;
}

export const WelcomeBanner: React.FC<WelcomeBannerProps> = ({
  imageSrc,
  imageAlt = 'Welcome illustration',
  storeName,
  ownerName,
}) => {
  const [currentTime, setCurrentTime] = useState('');
  const [greeting, setGreeting] = useState('');

  const updateTimeAndGreeting = () => {
    const now = new Date();
    const hour = now.getHours();

    if (hour < 12) {
      setGreeting('Good Morning');
    } else if (hour < 16) {
      setGreeting('Good Afternoon');
    } else {
      setGreeting('Good Evening');
    }

    setCurrentTime(
      `${formatDate(now)} ${now.toLocaleTimeString()}`
    );
  };

  useEffect(() => {
    updateTimeAndGreeting(); // run immediately

    const interval = setInterval(updateTimeAndGreeting, 1000);

    return () => clearInterval(interval);
  }, []);
  const formatDate = (date: Date) => {
    const day = date.getDate();

    const getOrdinal = (n: number) => {
      if (n > 3 && n < 21) return 'th';
      switch (n % 10) {
        case 1: return 'st';
        case 2: return 'nd';
        case 3: return 'rd';
        default: return 'th';
      }
    };

    const month = date.toLocaleString('default', { month: 'short' });
    const year = date.getFullYear();

    return `${day}${getOrdinal(day)} ${month} ${year}`;
  };
  return (
    <Card className="bg-linear-to-r from-purple-600 to-purple-700 text-white p-4 sm:p-6 md:p-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6">
        <div className="flex-1 min-w-0">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-2 truncate">
            {greeting}{ownerName ? `, ${ownerName}` : ''}
          </h2>

          <p className="text-purple-100 text-xs sm:text-sm md:text-base mb-3 sm:mb-4 line-clamp-2 capitalize">
            Welcome back{storeName ? ` to ${storeName}` : ''}.
          </p>

          <p className="text-purple-200 text-xs sm:text-sm md:text-base">
            {currentTime}
          </p>
        </div>

        <div className="hidden md:block shrink-0">
          {imageSrc && (
            <div className="w-24 h-32 sm:w-28 sm:h-28 md:w-48 lg:h-48 relative ">
              <Image
                src={imageSrc}
                alt={imageAlt}
                width={400}
                height={408}
                className="object-contain w-full h-full rounded-md"
              />
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};