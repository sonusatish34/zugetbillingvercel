import React from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Invoice } from '@/types';

interface InvoicesTableProps {
  invoices: Invoice[];
}

export const InvoicesTable: React.FC<InvoicesTableProps> = ({ invoices }) => {
  return (
    <Card>
      <CardHeader
        title="Invoices"
        action={
          <Button variant="outline" size="sm">
            View all Invoices
          </Button>
        }
      />
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="table-header">ID</th>
                <th className="table-header">Created On</th>
                <th className="table-header">Amount</th>
                <th className="table-header">Paid</th>
                <th className="table-header">Payment Mode</th>
                <th className="table-header">Due Date</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((invoice, index) => (
                <tr key={index} className="table-row">
                  <td className="table-cell text-primary font-medium">{invoice.id}</td>
                  <td className="table-cell">{invoice.createdOn}</td>
                  <td className="table-cell text-primary font-medium">{invoice.amount}</td>
                  <td className="table-cell">{invoice.paid}</td>
                  <td className="table-cell">{invoice.paymentMode}</td>
                  <td className="table-cell">{invoice.dueDate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};

