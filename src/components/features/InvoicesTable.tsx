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
          <Button variant="outline" size="sm" className="text-xs sm:text-sm">
            View all Invoices
          </Button>
        }
      />
      <CardContent>
        <div className="overflow-x-auto -mx-3 sm:-mx-4 md:mx-0">
          <div className="inline-block min-w-full px-3 sm:px-4 md:px-0">
            <table className="w-full text-xs sm:text-sm">
              <thead>
                <tr>
                  <th className="table-header whitespace-nowrap">ID</th>
                  <th className="table-header whitespace-nowrap">Created On</th>
                  <th className="table-header whitespace-nowrap">Amount</th>
                  <th className="table-header whitespace-nowrap">Paid</th>
                  <th className="table-header whitespace-nowrap">Payment Mode</th>
                  <th className="table-header whitespace-nowrap">Due Date</th>
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
        </div>
      </CardContent>
    </Card>
  );
};

