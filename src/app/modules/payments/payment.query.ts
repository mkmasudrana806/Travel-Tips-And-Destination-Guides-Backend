export const PAYMENT_QUERY_OPTIONS = {
  searchableFields: ["transactionId", "email", "username"],
  filterableFields: [
    "user",
    "email",
    "status",
    "subscriptionType",
    "paymentProvider",
    "paymentDate",
  ],
  sortableFields: ["paymentDate", "amount", "expiresAt", "createdAt"],
  selectableFields: [
    "user",
    "username",
    "email",
    "amount",
    "paymentDate",
    "expiresAt",
    "status",
    "subscriptionType",
    "paymentProvider",
  ],
};
