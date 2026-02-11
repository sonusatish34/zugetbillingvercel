'use client';

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Upload } from 'lucide-react';

interface AddBankDetailsFormProps {
  onSubmit?: (data: {
    name: string;
    accountNumber: string;
    reEnterAccountNumber: string;
    ifscCode: string;
    checkImage?: File;
  }) => void;
}

export const AddBankDetailsForm: React.FC<AddBankDetailsFormProps> = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    name: '',
    accountNumber: '',
    reEnterAccountNumber: '',
    ifscCode: '',
    checkImage: null as File | null,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (field: string, value: string | File | null) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.accountNumber.trim()) {
      newErrors.accountNumber = 'Account number is required';
    }

    if (!formData.reEnterAccountNumber.trim()) {
      newErrors.reEnterAccountNumber = 'Please re-enter account number';
    }

    if (formData.accountNumber !== formData.reEnterAccountNumber) {
      newErrors.reEnterAccountNumber = 'Account numbers do not match';
    }

    if (!formData.ifscCode.trim()) {
      newErrors.ifscCode = 'IFSC code is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit?.({
        name: formData.name,
        accountNumber: formData.accountNumber,
        reEnterAccountNumber: formData.reEnterAccountNumber,
        ifscCode: formData.ifscCode,
        checkImage: formData.checkImage || undefined,
      });
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        <h2 className="text-lg font-semibold text-primary mb-6">Add Bank Details</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-primary mb-1">
              Name as Per Bank <span className="text-red-500">*</span>
            </label>
            <Input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              className={errors.name ? 'border-red-500' : ''}
              aria-label="Name as per bank"
              aria-required="true"
              aria-invalid={!!errors.name}
              aria-describedby={errors.name ? 'name-error' : undefined}
            />
            {errors.name && (
              <p id="name-error" className="text-sm text-red-600 dark:text-red-400 mt-1" role="alert">
                {errors.name}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="account-number" className="block text-sm font-medium text-primary mb-1">
              Enter Bank Account Number <span className="text-red-500">*</span>
            </label>
            <Input
              id="account-number"
              type="text"
              value={formData.accountNumber}
              onChange={(e) => handleChange('accountNumber', e.target.value)}
              className={errors.accountNumber ? 'border-red-500' : ''}
              aria-label="Bank account number"
              aria-required="true"
              aria-invalid={!!errors.accountNumber}
              aria-describedby={errors.accountNumber ? 'account-number-error' : undefined}
            />
            {errors.accountNumber && (
              <p id="account-number-error" className="text-sm text-red-600 dark:text-red-400 mt-1" role="alert">
                {errors.accountNumber}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="re-enter-account-number" className="block text-sm font-medium text-primary mb-1">
              Re - Enter Bank Account Number <span className="text-red-500">*</span>
            </label>
            <Input
              id="re-enter-account-number"
              type="text"
              value={formData.reEnterAccountNumber}
              onChange={(e) => handleChange('reEnterAccountNumber', e.target.value)}
              className={errors.reEnterAccountNumber ? 'border-red-500' : ''}
              aria-label="Re-enter bank account number"
              aria-required="true"
              aria-invalid={!!errors.reEnterAccountNumber}
              aria-describedby={errors.reEnterAccountNumber ? 're-enter-account-number-error' : undefined}
            />
            {errors.reEnterAccountNumber && (
              <p id="re-enter-account-number-error" className="text-sm text-red-600 dark:text-red-400 mt-1" role="alert">
                {errors.reEnterAccountNumber}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="ifsc-code" className="block text-sm font-medium text-primary mb-1">
              Enter Account IFSC Code <span className="text-red-500">*</span>
            </label>
            <Input
              id="ifsc-code"
              type="text"
              value={formData.ifscCode}
              onChange={(e) => handleChange('ifscCode', e.target.value.toUpperCase())}
              className={errors.ifscCode ? 'border-red-500' : ''}
              aria-label="IFSC code"
              aria-required="true"
              aria-invalid={!!errors.ifscCode}
              aria-describedby={errors.ifscCode ? 'ifsc-code-error' : undefined}
            />
            {errors.ifscCode && (
              <p id="ifsc-code-error" className="text-sm text-red-600 dark:text-red-400 mt-1" role="alert">
                {errors.ifscCode}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="check-upload" className="block text-sm font-medium text-primary mb-1">
              Upload Check / Passbook <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Input
                id="check-upload"
                type="file"
                accept="image/*,.pdf"
                onChange={(e) => handleChange('checkImage', e.target.files?.[0] || null)}
                className="cursor-pointer"
                aria-label="Upload check or passbook"
                aria-required="true"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <Upload className="w-5 h-5 text-secondary" aria-hidden="true" />
              </div>
            </div>
            {formData.checkImage && (
              <p className="text-sm text-secondary mt-1">{formData.checkImage.name}</p>
            )}
          </div>

          <div className="flex justify-end pt-4">
            <Button variant="primary" type="submit" className="px-6">
              Save Bank Details
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

