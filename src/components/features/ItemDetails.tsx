'use client';

import React, { memo } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ItemDetail, OrderItem } from '@/types';
import { ArrowLeft, Upload, Plus } from 'lucide-react';
import Link from 'next/link';

interface ItemDetailsProps {
  itemDetail: ItemDetail;
}

const SizePriceBox = memo<{ size: string; quantity: number; quantityLeft: number; price: string }>(({ size, quantity, quantityLeft, price }) => (
  <div className="border border-gray-200 dark:border-slate-700 rounded-lg p-4 text-center">
    <p className="text-lg font-semibold text-primary mb-2">{size}</p>
    <p className="text-sm text-secondary mb-1">Q: {quantity}, {quantityLeft}L</p>
    <p className="text-sm font-medium text-primary">Price: {price}</p>
  </div>
));

SizePriceBox.displayName = 'SizePriceBox';

export const ItemDetails: React.FC<ItemDetailsProps> = ({ itemDetail }) => {
  return (
    <div className="space-y-6">
      {/* Header with Back Button */}
      <div className="flex items-center gap-4">
        <Link 
          href="/inventory/total" 
          className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          aria-label="Go back to Total Items"
        >
          <ArrowLeft className="w-5 h-5 text-primary" aria-hidden="true" />
        </Link>
        <h1 className="text-2xl font-bold text-primary">Item Details</h1>
      </div>

      {/* Item Info Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-primary mb-2">{itemDetail.name}</h2>
          <p className="text-sm text-secondary">
            Bar Code: {itemDetail.barcode} | {itemDetail.category} | Qty: {itemDetail.quantity} | Qty Left: {itemDetail.quantityLeft} Aqty: {itemDetail.alertQuantity}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            size="sm" 
            className="h-10 px-4"
            aria-label="Export item"
            type="button"
          >
            <Upload className="w-4 h-4 mr-2" aria-hidden="true" />
            <span>Export</span>
          </Button>
          <Button 
            variant="primary" 
            size="sm" 
            className="h-10 px-4"
            aria-label="Add new item"
            type="button"
          >
            <Plus className="w-4 h-4 mr-2" aria-hidden="true" />
            <span>Add Item</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Size and Price Grid */}
          <Card>
            <CardContent className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {itemDetail.sizes.map((sizeData, index) => (
                  <SizePriceBox
                    key={`${sizeData.size}-${index}`}
                    size={sizeData.size}
                    quantity={sizeData.quantity}
                    quantityLeft={sizeData.quantityLeft}
                    price={sizeData.price}
                  />
                ))}
              </div>
              <p className="text-xs text-secondary mt-4 text-center">
                Max Upload Size 800x800px. PNG / JPEG file, Maximum Upload size 5MB
              </p>
            </CardContent>
          </Card>

          {/* Item Overview Table */}
          {itemDetail.overview && (
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full" role="table" aria-label="Item overview">
                    <caption className="sr-only">
                      Item overview showing category, quantity, sizes, price, sales, and remaining stock
                    </caption>
                    <thead>
                      <tr role="row">
                        <th className="table-header" scope="col" role="columnheader">Id</th>
                        <th className="table-header" scope="col" role="columnheader">Category</th>
                        <th className="table-header" scope="col" role="columnheader">Quantity</th>
                        <th className="table-header" scope="col" role="columnheader">Sizes</th>
                        <th className="table-header" scope="col" role="columnheader">Price</th>
                        <th className="table-header" scope="col" role="columnheader">Online Sold</th>
                        <th className="table-header" scope="col" role="columnheader">Offline Sold</th>
                        <th className="table-header" scope="col" role="columnheader">Total</th>
                        <th className="table-header" scope="col" role="columnheader">Remaining</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr role="row" className="table-row">
                        <td className="table-cell text-primary font-medium" role="gridcell">{itemDetail.overview.id}</td>
                        <td className="table-cell" role="gridcell">{itemDetail.overview.category}</td>
                        <td className="table-cell" role="gridcell">{itemDetail.overview.quantity}</td>
                        <td className="table-cell text-xs" role="gridcell">{itemDetail.overview.sizes}</td>
                        <td className="table-cell" role="gridcell">{itemDetail.overview.price}</td>
                        <td className="table-cell" role="gridcell">{itemDetail.overview.onlineSold}</td>
                        <td className="table-cell" role="gridcell">{itemDetail.overview.offlineSold}</td>
                        <td className="table-cell text-primary font-medium" role="gridcell">{itemDetail.overview.total}</td>
                        <td className="table-cell text-primary font-medium" role="gridcell">{itemDetail.overview.remaining}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}

          {/* History Table */}
          {itemDetail.history && itemDetail.history.length > 0 && (
            <Card>
              <CardContent>
                <h3 className="text-lg font-semibold text-primary mb-4">History</h3>
                <div className="overflow-x-auto">
                  <table className="w-full" role="table" aria-label="Item history">
                    <caption className="sr-only">
                      Item history showing past transactions and status changes
                    </caption>
                    <thead>
                      <tr role="row">
                        <th className="table-header" scope="col" role="columnheader">Id</th>
                        <th className="table-header" scope="col" role="columnheader">Category</th>
                        <th className="table-header" scope="col" role="columnheader">Quantity</th>
                        <th className="table-header" scope="col" role="columnheader">Price</th>
                        <th className="table-header" scope="col" role="columnheader">Order Created Time</th>
                        <th className="table-header" scope="col" role="columnheader">Pickup Time</th>
                        <th className="table-header" scope="col" role="columnheader">Order From</th>
                        <th className="table-header" scope="col" role="columnheader">Order Status</th>
                        <th className="table-header" scope="col" role="columnheader">Amount Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {itemDetail.history.map((historyItem, index) => (
                        <tr key={`${historyItem.id}-${index}`} role="row" className="table-row">
                          <td className="table-cell text-primary font-medium" role="gridcell">{historyItem.id}</td>
                          <td className="table-cell" role="gridcell">{historyItem.category}</td>
                          <td className="table-cell" role="gridcell">{historyItem.quantity}</td>
                          <td className="table-cell" role="gridcell">{historyItem.price}</td>
                          <td className="table-cell" role="gridcell">{historyItem.orderCreatedTime}</td>
                          <td className="table-cell" role="gridcell">{historyItem.pickupTime || '-'}</td>
                          <td className="table-cell" role="gridcell">{historyItem.orderFrom || '-'}</td>
                          <td className="table-cell" role="gridcell">
                            <span className="badge-info px-2 py-1 rounded text-xs">{historyItem.orderStatus}</span>
                          </td>
                          <td className="table-cell" role="gridcell">
                            <span className={`px-2 py-1 rounded text-xs ${
                              historyItem.amountStatus === 'Received' 
                                ? 'badge-success' 
                                : 'badge-info'
                            }`}>
                              {historyItem.amountStatus || '-'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column - Images */}
        <div>
          <Card>
            <CardContent>
              <h3 className="text-lg font-semibold text-primary mb-4">Gallery Images</h3>
              <div className="grid grid-cols-1 gap-4">
                {itemDetail.images && itemDetail.images.length > 0 ? (
                  itemDetail.images.map((image, index) => (
                    <div key={index} className="w-full h-32 bg-gray-100 dark:bg-slate-700 rounded-lg flex items-center justify-center overflow-hidden">
                      <img
                        src={image}
                        alt={`Gallery image ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))
                ) : (
                  <div className="w-full h-32 bg-gray-100 dark:bg-slate-700 rounded-lg flex items-center justify-center">
                    <span className="text-secondary text-sm">No images</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

