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
    <Card className="bg-gradient-to-r from-purple-600 to-purple-700 text-white p-6 md:p-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex-1">
          <h2 className="text-2xl md:text-3xl font-bold mb-2">
            {greeting}{ownerName ? `, ${ownerName}` : ''}
          </h2>

          <p className="text-purple-100 text-sm md:text-base mb-4">
            Welcome back{storeName ? ` to ${storeName}` : ''}.
          </p>

          <p className="text-purple-200 text-xs md:text-base">
            {currentTime}
          </p>
        </div>

        <div className="hidden md:block">
          {imageSrc && (
            <div className="w-32 h-32 relative">
              <Image
                src={imageSrc}
                alt={imageAlt}
                width={128}
                height={128}
                className="object-contain"
              />
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};