'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { 
  Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, 
  List, ListOrdered, Link as LinkIcon, Image as ImageIcon,
  Upload, X
} from 'lucide-react';

interface AddItemFormData {
  itemType: 'product' | 'service';
  name: string;
  code: string;
  category: string;
  sizes: Record<string, string>;
  alertQuantity: string;
  barcode: string;
  description: string;
  images: File[];
}

interface AddItemFormProps {
  onCancel?: () => void;
  onSubmit?: (data: AddItemFormData) => void;
}

export const AddItemForm: React.FC<AddItemFormProps> = ({ onCancel, onSubmit }) => {
  const [formData, setFormData] = useState<AddItemFormData>({
    itemType: 'product',
    name: '',
    code: '',
    category: '',
    sizes: { S: '', L: '', M: '', XL: '', XXL: '', XXXL: '' },
    alertQuantity: '',
    barcode: '',
    description: '',
    images: [],
  });

  const [errors, setErrors] = useState<Partial<Record<keyof AddItemFormData, string>>>({});

  // Memoized handlers
  const handleInputChange = useCallback((field: keyof AddItemFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  }, [errors]);

  const handleSizeChange = useCallback((size: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      sizes: { ...prev.sizes, [size]: value },
    }));
  }, []);

  const handleGenerateCode = useCallback(() => {
    const generatedCode = `ITEM-${Date.now().toString(36).toUpperCase()}`;
    handleInputChange('code', generatedCode);
  }, [handleInputChange]);

  const handleGenerateBarcode = useCallback(() => {
    const generatedBarcode = Math.random().toString(36).substring(2, 15).toUpperCase();
    handleInputChange('barcode', generatedBarcode);
  }, [handleInputChange]);

  const handleImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, ...files.slice(0, 5 - prev.images.length)],
      }));
    }
  }, []);

  const handleRemoveImage = useCallback((index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  }, []);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    // Basic validation
    const newErrors: Partial<Record<keyof AddItemFormData, string>> = {};
    if (!formData.name) newErrors.name = 'Name is required';
    if (!formData.code) newErrors.code = 'Code is required';
    if (!formData.category) newErrors.category = 'Category is required';
    
    setErrors(newErrors);
    if (Object.keys(newErrors).length === 0) {
      onSubmit?.(formData);
    }
  }, [formData, onSubmit]);

  const sizeLabels = useMemo(() => ['S', 'L', 'M', 'XL', 'XXL', 'XXXL'], []);

  return (
    <form onSubmit={handleSubmit} className="space-y-6" aria-label="Add new item form">
      {/* Item Type */}
      <div>
        <label className="block text-sm font-medium text-primary mb-3">Item Type</label>
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="itemType"
              value="product"
              checked={formData.itemType === 'product'}
              onChange={(e) => handleInputChange('itemType', e.target.value)}
              className="w-4 h-4 text-purple-600 focus:ring-purple-500"
              aria-label="Product item type"
            />
            <span className="text-primary">Product</span>
          </label>
        </div>
      </div>

      {/* Basic Details */}
      <Card>
        <CardContent className="space-y-4">
          <h3 className="text-lg font-semibold text-primary mb-4">Basic Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-primary mb-2">
                Name <span className="text-red-500">*</span>
              </label>
              <Input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Enter item name"
                aria-required="true"
                aria-invalid={!!errors.name}
                aria-describedby={errors.name ? 'name-error' : undefined}
                className={errors.name ? 'border-red-500' : ''}
              />
              {errors.name && (
                <p id="name-error" className="mt-1 text-sm text-red-600 dark:text-red-400" role="alert">
                  {errors.name}
                </p>
              )}
            </div>
            <div>
              <label htmlFor="code" className="block text-sm font-medium text-primary mb-2">
                Code <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-2">
                <Input
                  id="code"
                  type="text"
                  value={formData.code}
                  onChange={(e) => handleInputChange('code', e.target.value)}
                  placeholder="Placeholder"
                  aria-required="true"
                  aria-invalid={!!errors.code}
                  aria-describedby={errors.code ? 'code-error' : undefined}
                  className={errors.code ? 'border-red-500' : ''}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleGenerateCode}
                  aria-label="Generate code"
                  className="whitespace-nowrap"
                >
                  Generate
                </Button>
              </div>
              {errors.code && (
                <p id="code-error" className="mt-1 text-sm text-red-600 dark:text-red-400" role="alert">
                  {errors.code}
                </p>
              )}
            </div>
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-primary mb-2">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                id="category"
                value={formData.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
                className="input-base"
                aria-required="true"
                aria-invalid={!!errors.category}
                aria-describedby={errors.category ? 'category-error' : undefined}
              >
                <option value="">Select</option>
                <option value="womens">Womens</option>
                <option value="mens">Mens</option>
                <option value="kids">Kids</option>
                <option value="electronics">Electronics</option>
                <option value="accessories">Accessories</option>
              </select>
              {errors.category && (
                <p id="category-error" className="mt-1 text-sm text-red-600 dark:text-red-400" role="alert">
                  {errors.category}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quantities */}
      <Card>
        <CardContent className="space-y-4">
          <h3 className="text-lg font-semibold text-primary mb-4">Quantities</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {sizeLabels.map((size) => (
              <div key={size}>
                <label htmlFor={`size-${size}`} className="block text-sm font-medium text-primary mb-2">
                  {size} Quantity <span className="text-red-500">*</span>
                </label>
                <Input
                  id={`size-${size}`}
                  type="number"
                  value={formData.sizes[size]}
                  onChange={(e) => handleSizeChange(size, e.target.value)}
                  placeholder="0"
                  min="0"
                  aria-label={`${size} size quantity`}
                />
              </div>
            ))}
          </div>
          <div className="grid grid-cols-3 gap-4 mt-4">
            <div>
              <label htmlFor="size-xxxl" className="block text-sm font-medium text-primary mb-2">
                XXXL Quantity <span className="text-red-500">*</span>
              </label>
              <Input
                id="size-xxxl"
                type="number"
                value={formData.sizes.XXXL}
                onChange={(e) => handleSizeChange('XXXL', e.target.value)}
                placeholder="0"
                min="0"
                aria-label="XXXL size quantity"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-primary mb-2">Add Sizes</label>
              <div className="w-full h-12 border-2 border-dashed border-gray-300 dark:border-slate-600 rounded-lg flex items-center justify-center bg-gray-50 dark:bg-slate-800 cursor-pointer hover:border-purple-500 dark:hover:border-purple-500 transition-colors">
                <span className="text-sm text-secondary">Add Here +</span>
              </div>
            </div>
            <div>
              <label htmlFor="alert-quantity" className="block text-sm font-medium text-primary mb-2">
                Alert Quantity <span className="text-red-500">*</span>
              </label>
              <Input
                id="alert-quantity"
                type="number"
                value={formData.alertQuantity}
                onChange={(e) => handleInputChange('alertQuantity', e.target.value)}
                placeholder="0"
                min="0"
                aria-label="Alert quantity threshold"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Additional Details */}
      <Card>
        <CardContent className="space-y-4">
          <h3 className="text-lg font-semibold text-primary mb-4">Additional Details</h3>
          <div>
            <label htmlFor="barcode" className="block text-sm font-medium text-primary mb-2">
              Barcode <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2">
              <Input
                id="barcode"
                type="text"
                value={formData.barcode}
                onChange={(e) => handleInputChange('barcode', e.target.value)}
                placeholder="Placeholder"
                aria-label="Barcode"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleGenerateBarcode}
                aria-label="Generate barcode"
                className="whitespace-nowrap"
              >
                Generate
              </Button>
            </div>
          </div>
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-primary mb-2">
              Product Description
            </label>
            {/* Rich Text Editor Toolbar */}
            <div className="border border-gray-300 dark:border-slate-600 rounded-t-lg bg-gray-50 dark:bg-slate-800 p-2 flex items-center gap-2 flex-wrap" role="toolbar" aria-label="Text formatting toolbar">
              <button type="button" className="p-2 hover:bg-gray-200 dark:hover:bg-slate-700 rounded" aria-label="Bold">
                <Bold className="w-4 h-4" aria-hidden="true" />
              </button>
              <button type="button" className="p-2 hover:bg-gray-200 dark:hover:bg-slate-700 rounded" aria-label="Italic">
                <Italic className="w-4 h-4" aria-hidden="true" />
              </button>
              <button type="button" className="p-2 hover:bg-gray-200 dark:hover:bg-slate-700 rounded" aria-label="Underline">
                <Underline className="w-4 h-4" aria-hidden="true" />
              </button>
              <div className="w-px h-6 bg-gray-300 dark:bg-slate-600" aria-hidden="true" />
              <button type="button" className="p-2 hover:bg-gray-200 dark:hover:bg-slate-700 rounded" aria-label="Align left">
                <AlignLeft className="w-4 h-4" aria-hidden="true" />
              </button>
              <button type="button" className="p-2 hover:bg-gray-200 dark:hover:bg-slate-700 rounded" aria-label="Align center">
                <AlignCenter className="w-4 h-4" aria-hidden="true" />
              </button>
              <button type="button" className="p-2 hover:bg-gray-200 dark:hover:bg-slate-700 rounded" aria-label="Align right">
                <AlignRight className="w-4 h-4" aria-hidden="true" />
              </button>
              <div className="w-px h-6 bg-gray-300 dark:bg-slate-600" aria-hidden="true" />
              <button type="button" className="p-2 hover:bg-gray-200 dark:hover:bg-slate-700 rounded" aria-label="Bullet list">
                <List className="w-4 h-4" aria-hidden="true" />
              </button>
              <button type="button" className="p-2 hover:bg-gray-200 dark:hover:bg-slate-700 rounded" aria-label="Numbered list">
                <ListOrdered className="w-4 h-4" aria-hidden="true" />
              </button>
              <div className="w-px h-6 bg-gray-300 dark:bg-slate-600" aria-hidden="true" />
              <button type="button" className="p-2 hover:bg-gray-200 dark:hover:bg-slate-700 rounded" aria-label="Insert link">
                <LinkIcon className="w-4 h-4" aria-hidden="true" />
              </button>
              <button type="button" className="p-2 hover:bg-gray-200 dark:hover:bg-slate-700 rounded" aria-label="Insert image">
                <ImageIcon className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Enter Description"
              rows={6}
              className="input-base rounded-t-none resize-none"
              aria-label="Product description"
            />
          </div>
        </CardContent>
      </Card>

      {/* Gallery Images */}
      <Card>
        <CardContent className="space-y-4">
          <h3 className="text-lg font-semibold text-primary mb-4">Gallery Images</h3>
          <div className="space-y-4">
            <label
              htmlFor="image-upload"
              className="block w-full border-2 border-dashed border-gray-300 dark:border-slate-600 rounded-lg p-8 text-center cursor-pointer hover:border-purple-500 dark:hover:border-purple-500 transition-colors bg-gray-50 dark:bg-slate-800"
            >
              <input
                id="image-upload"
                type="file"
                accept="image/png,image/jpeg,image/jpg"
                multiple
                onChange={handleImageUpload}
                className="hidden"
                aria-label="Upload gallery images"
              />
              <Upload className="w-12 h-12 text-purple-600 dark:text-purple-400 mx-auto mb-2" aria-hidden="true" />
              <p className="text-primary font-medium mb-1">Drop Your Files or Browse</p>
              <p className="text-sm text-secondary">
                Max Upload Size 800x800px. PNG / JPEG file, Maximum Upload size 5MB
              </p>
            </label>
            {formData.images.length > 0 && (
              <div className="grid grid-cols-3 gap-4">
                {formData.images.map((image, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={URL.createObjectURL(image)}
                      alt={`Uploaded image ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg border border-gray-200 dark:border-slate-700"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)}
                      className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      aria-label={`Remove image ${index + 1}`}
                    >
                      <X className="w-4 h-4" aria-hidden="true" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-4 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          aria-label="Cancel and discard changes"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="primary"
          aria-label="Create new item"
        >
          Create New
        </Button>
      </div>
    </form>
  );
};

