// Application constants

export const SIDEBAR_MENU = {
  dashboard: {
    label: "Dashboard",
    href: "/",
    icon: "LayoutDashboard",
  },
  billingSystem: {
    label: "Billing System",
    href: "/billing",
    icon: "FileText",
  },
  onlineOrders: {
    label: "Online Orders",
    children: [
      { label: "Upcoming Orders", href: "/orders/upcoming" },
      { label: "In Delivery Orders", href: "/orders/in-delivery" },
      { label: "Completed Orders", href: "/orders/completed" },
      { label: "Return Orders", href: "/orders/return" },
      { label: "Cancelled Orders", href: "/orders/cancelled" },
      { label: "Replaced Orders", href: "/orders/replaced" },
    ],
  },
  inventory: {
    label: "Inventory",
    children: [
      { label: "Total Items", href: "/inventory/total" },
      { label: "Low Quantity Item", href: "/inventory/low-quantity" },
      { label: "Add Item", href: "/inventory/add" },
      { label: "Re Stock Item", href: "/inventory/restock" },
      { label: "Offline Orders", href: "/inventory/offline-orders" },
    ],
  },
  finance: {
    label: "Finance & Accounts",
    children: [
      { label: "Payments", href: "/finance/payments" },
      { label: "Transactions", href: "/finance/transactions" },
      { label: "Bank Details", href: "/finance/bank-details" },
    ],
  },
  manage: {
    label: "Manage",
    children: [
      { label: "Employees", href: "/manage/employees" },
      { label: "Customer Care", href: "/manage/customer-care" },
      { label: "Tickets", href: "/manage/tickets" },
      { label: "Profile", href: "/manage/profile" },
    ],
  },
};

