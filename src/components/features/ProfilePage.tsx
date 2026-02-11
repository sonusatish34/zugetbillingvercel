'use client';

import React, { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { DateRangePicker, DateRange } from '@/components/ui/DateRangePicker';
import { ProfileData, PaymentHistoryItem, StoreSetting, InvoiceStatistics } from '@/types';
import { Edit, Mail, Phone, Building2, Heart, CheckCircle, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';

interface ProfilePageProps {
  profileData: ProfileData;
  paymentHistory: PaymentHistoryItem[];
  storeSetting: StoreSetting;
  invoiceStatistics: InvoiceStatistics;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({
  profileData,
  paymentHistory,
  storeSetting,
  invoiceStatistics,
}) => {
  const [freeDelivery, setFreeDelivery] = useState(storeSetting.freeDelivery);
  const [dateRange, setDateRange] = useState<DateRange>({
    startDate: null,
    endDate: null,
  });

  const defaultStartDate = useMemo(() => {
    const today = new Date();
    const start = new Date(today);
    start.setDate(today.getDate() - 7);
    return start;
  }, []);

  const defaultEndDate = useMemo(() => new Date(), []);

  // Initialize date range on mount
  React.useEffect(() => {
    if (!dateRange.startDate && !dateRange.endDate) {
      setDateRange({
        startDate: defaultStartDate,
        endDate: defaultEndDate,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const dateRangeText = useMemo(() => {
    if (dateRange.startDate && dateRange.endDate) {
      return `${format(dateRange.startDate, 'dd MMM yyyy')} - ${format(dateRange.endDate, 'dd MMM yyyy')}`;
    }
    return 'Select date range';
  }, [dateRange]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profile Section */}
        <Card>
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold text-primary mb-4">Profile</h2>
            <div className="space-y-4">
              <div className="flex flex-col items-center text-center">
                <div className="w-24 h-24 rounded-full bg-gray-100 dark:bg-slate-700 flex items-center justify-center mb-4 overflow-hidden">
                  {profileData.profileImage ? (
                    <img 
                      src={profileData.profileImage} 
                      alt={profileData.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 dark:bg-slate-600 rounded-full" />
                  )}
                </div>
                <p className="text-sm text-secondary mb-1">Store id: {profileData.storeId}</p>
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-xl font-bold text-primary">{profileData.name}</h3>
                  <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" aria-label="Verified" />
                </div>
                <p className="text-sm text-secondary mb-4">{profileData.location}</p>
                <Button variant="outline" size="sm" className="mb-4">
                  <Edit className="w-4 h-4 mr-2" aria-hidden="true" />
                  Edit Profile
                </Button>
              </div>
              <div className="space-y-3 pt-4 border-t border-gray-200 dark:border-slate-700">
                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-secondary mt-0.5 flex-shrink-0" aria-hidden="true" />
                  <div>
                    <p className="text-xs text-secondary mb-1">Email Address</p>
                    <p className="text-sm text-primary">{profileData.email}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-secondary mt-0.5 flex-shrink-0" aria-hidden="true" />
                  <div>
                    <p className="text-xs text-secondary mb-1">Phone</p>
                    <p className="text-sm text-primary">{profileData.phone}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Building2 className="w-5 h-5 text-secondary mt-0.5 flex-shrink-0" aria-hidden="true" />
                  <div>
                    <p className="text-xs text-secondary mb-1">Company</p>
                    <p className="text-sm text-primary">{profileData.company}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Heart className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" aria-hidden="true" />
                  <div>
                    <p className="text-xs text-secondary mb-1">Favorite For</p>
                    <p className="text-sm text-primary">{profileData.favoriteFor}</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notes Section */}
        <Card>
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold text-primary mb-4">Notes</h2>
            <p className="text-sm text-secondary leading-relaxed">
              Keep in mind that in order to be deductible, your employees' pay must be reasonable and necessary for conducting business to qualify for Keep in mind that in order to be deductible, your employees' pay must be reasonable and necessary for conducting business to qualify for
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Invoice Statistics */}
        <Card>
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold text-primary mb-4">Invoice Statistics</h2>
            <div className="mb-4">
              <DateRangePicker
                value={dateRange}
                onChange={setDateRange}
                placeholder={dateRangeText}
              />
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-purple-600" aria-hidden="true" />
                  <span className="text-sm text-secondary">Total Earnings</span>
                </div>
                <span className="text-lg font-bold text-primary">{invoiceStatistics.invoiced}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-600" aria-hidden="true" />
                  <span className="text-sm text-secondary">Received</span>
                </div>
                <span className="text-lg font-bold text-primary">{invoiceStatistics.received}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-purple-600" aria-hidden="true" />
                  <span className="text-sm text-secondary">Pending</span>
                </div>
                <span className="text-lg font-bold text-primary">{invoiceStatistics.outstanding}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-600" aria-hidden="true" />
                  <span className="text-sm text-secondary">Offline</span>
                </div>
                <span className="text-lg font-bold text-primary">{invoiceStatistics.total}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-600" aria-hidden="true" />
                  <span className="text-sm text-secondary">Zuget</span>
                </div>
                <span className="text-lg font-bold text-primary">{invoiceStatistics.total}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payments History */}
        <Card>
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold text-primary mb-4">Payments History</h2>
            <div className="space-y-3">
              {paymentHistory.map((payment) => (
                <div 
                  key={payment.id} 
                  className="flex items-center justify-between p-3 border border-gray-200 dark:border-slate-700 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-100 dark:bg-slate-700 rounded flex items-center justify-center flex-shrink-0">
                      {payment.method === 'Paypal' ? (
                        <span className="text-xs font-bold text-blue-600 dark:text-blue-400">PP</span>
                      ) : (
                        <span className="text-xs font-bold text-purple-600 dark:text-purple-400">S</span>
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-primary">
                        {payment.method} #{payment.invoiceNumber}
                      </p>
                      <p className="text-xs text-secondary">{payment.date}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-primary">{payment.amount}</span>
                    {payment.status === 'Paid' && (
                      <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" aria-label="Paid" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Online Store Setting */}
      <Card>
        <CardContent className="p-6">
          <h2 className="text-lg font-semibold text-primary mb-4">Online Store Setting</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-slate-700 rounded-lg">
              <span className="text-sm text-primary">I will Provide Free Delivery To Customer</span>
              <button
                onClick={() => setFreeDelivery(!freeDelivery)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 ${
                  freeDelivery ? 'bg-green-600' : 'bg-gray-300 dark:bg-slate-600'
                }`}
                role="switch"
                aria-checked={freeDelivery}
                aria-label="Toggle free delivery"
                type="button"
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    freeDelivery ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
            <div className="space-y-2">
              <button className="w-full flex items-center justify-between p-3 border border-gray-200 dark:border-slate-700 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors">
                <span className="text-sm text-primary">Return Settings</span>
                <ChevronRight className="w-5 h-5 text-secondary" aria-hidden="true" />
              </button>
              <div className="ml-4 space-y-2">
                <select className="input-base w-full text-sm">
                  <option>Order Can Return In 3 Hours</option>
                </select>
                <select className="input-base w-full text-sm">
                  <option>Return Per Order 3 items</option>
                </select>
              </div>
              <button className="w-full flex items-center justify-between p-3 border border-gray-200 dark:border-slate-700 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors">
                <span className="text-sm text-primary">Store Timings</span>
                <ChevronRight className="w-5 h-5 text-secondary" aria-hidden="true" />
              </button>
              <button className="w-full flex items-center justify-between p-3 border border-gray-200 dark:border-slate-700 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors">
                <span className="text-sm text-primary">Store Display Images</span>
                <ChevronRight className="w-5 h-5 text-secondary" aria-hidden="true" />
              </button>
              <button className="w-full flex items-center justify-between p-3 border border-gray-200 dark:border-slate-700 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors">
                <span className="text-sm text-primary">Special Adds</span>
                <ChevronRight className="w-5 h-5 text-secondary" aria-hidden="true" />
              </button>
              <button className="w-full flex items-center justify-between p-3 border border-gray-200 dark:border-slate-700 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors">
                <span className="text-sm text-primary">Custom Discounts</span>
                <ChevronRight className="w-5 h-5 text-secondary" aria-hidden="true" />
              </button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

