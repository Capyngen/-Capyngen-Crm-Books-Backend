# Complete API Documentation

> Source-faithful documentation generated from `src/app.ts`, all `src/**/routes/*.ts`, their controllers, and the referenced Mongoose models. No mount prefix is invented for an unmounted router. Duplicate route declarations are retained as separate entries because Express registers each declaration.

## Contents

1. [Discovery checklist](#discovery-checklist)
2. [Conventions](#conventions)
3. [Direct app endpoints](#direct-app-endpoints)
4. [Mounted Books endpoints](#mounted-books-endpoints)
5. [Declared-only Books endpoints](#declared-only-books-endpoints)
6. [Declared-only Core endpoints](#declared-only-core-endpoints)
7. [Declared-only Billing endpoints](#declared-only-billing-endpoints)
8. [Source contracts](#source-contracts)
9. [Verification](#verification)

## Discovery checklist

| Source | Handlers |
|---|---:|
| `src/domains/billing/routes/*.ts` | 16 |
| `src/domains/core/routes/*.ts` | 18 |
| `src/domains/books/routes/*.ts` | 187 |
| **Route-file declarations** | **221** |
| Direct handlers in `src/app.ts` | 2 |
| **Total endpoint declarations** | **223** |

Route files inspected: 33. Mounted route-file handlers: 89. Declared-only route-file handlers: 132. The six duplicate report paths (`horizontal-pl`, `horizontal-bs`, `movement-of-equity`, `trial-balance`, `general-ledger`, `journal-report`) are counted once per declaration. `reportsRoutes.ts` also declares routes after `export default router`; those declarations are included.

## Conventions

- `GET /health` has no authentication. `/api/v1/books/me` uses `verifyCapyngenToken` only.
- Every mounted Books router inherits `verifyCapyngenToken -> requireBooksSubscription`; its `app.use` then adds the listed `requireFeature(...)` middleware.
- An unmounted route has no source-defined full runtime path. Its entry therefore records the exact route-file-relative path and says `full path: not source-defined (router is not mounted in app.ts)`.
- `id` parameters are the route parameter named `id`; the controller passes them to the corresponding Mongoose query. Where a controller does not validate an ObjectId explicitly, validation is delegated to Mongoose/query behavior.
- `next(error)` reaches `errorHandler`, whose source envelope is `{ success:false, message, stack }`; direct controller branches below retain their exact response shapes.
- For POST/PUT bodies, the authoritative field list is the model contract in [Source contracts](#source-contracts). A field not listed there is not documented as accepted. A model's timestamps are included only when that schema enables timestamps.

## Direct app endpoints

### 1. Books subscription context

- **Feature:** Books subscription context
- **Method + full path:** `GET /api/v1/books/me`
- **Mount status:** LIVE/MOUNTED directly in `app.ts`
- **Middleware:** `verifyCapyngenToken`
- **Path/query/body:** none
- **Success:** `200 { subscription, plan, role }`; if no `company` or `subscriptionId`, `200 { subscription: null, plan: null }`. `role` is `req.employee?.role || 'Admin'` when the company has a subscription.
- **Errors:** `401 { success:false }` when `req.org?._id` is absent; token/database errors go to `errorHandler`.
- **Logic/flow:** Token middleware injects organization context; the handler reads `companyprofiles`, then `subscriptions`, then `plans` by ObjectId and returns the documents. No mutation.

### 2. Health

- **Feature:** Health
- **Method + full path:** `GET /health`
- **Mount status:** LIVE/MOUNTED directly in `app.ts`
- **Middleware:** none beyond global `cors` and `express.json`
- **Path/query/body:** none
- **Success:** `200 { success:true, message:'Backend is healthy' }`
- **Errors:** unexpected errors reach `errorHandler`.
- **Logic/flow:** Express -> constant response. No database or side effect.

## Mounted Books endpoints

The following entries use the exact `app.use` prefixes from `src/app.ts`. Each route also has the global Books middleware `verifyCapyngenToken -> requireBooksSubscription`, followed by the feature middleware shown in the section heading.

### Items: `accounts-items-directory`

Source: `src/domains/books/routes/itemRoutes.ts`, `src/domains/books/controllers/itemController.ts`, model `Item.ts`.

#### 3. GET `/api/v1/books/items/`

- **Status/middleware:** LIVE/MOUNTED; `verifyCapyngenToken -> requireBooksSubscription -> requireFeature('accounts-items-directory') -> getItems`
- **Params/query/body:** none; body `null`.
- **Success:** `200 { success:true, count: allItems.length, data: allItems }`.
- **Errors:** controller calls `next(error)`; `errorHandler` supplies the error envelope.
- **Logic/flow:** `Item.find()` -> count -> response. Model validation/defaults apply only to stored documents.

#### 4. POST `/api/v1/books/items/`

- **Status/middleware:** LIVE/MOUNTED; same chain -> `createItem`.
- **Params/query:** none. **Body:** `Item` contract below.
- **Success:** `201 { success:true, data:item }`.
- **Errors:** `next(error)` for Mongoose validation/persistence failure; exact final envelope is `errorHandler`.
- **Logic/flow:** construct `Item` from `req.body` -> save -> return saved document.

#### 5. GET `/api/v1/books/items/:id`

- **Status/middleware:** LIVE/MOUNTED; same chain -> `getItemById`.
- **Path:** `id` required route value; example `65f000000000000000000001`. Query/body none.
- **Success:** `200 { success:true, data:item }` (controller returns the item with `sourceDomain` where applicable).
- **Errors:** `404 { success:false, message:'Item not found' }` when no Books/Billing item is found; query errors go to `next(error)`.
- **Logic/flow:** lookup Books item, then Billing fallback where implemented -> return result.

#### 6. PUT `/api/v1/books/items/:id`

- **Status/middleware:** LIVE/MOUNTED; same chain -> `updateItem`.
- **Path/body:** required `id`; body is update data passed to the controller/model. Example `{ "salesRate": 1250 }`.
- **Success:** `200 { success:true, data:updatedItem }`.
- **Errors:** missing record branches and `next(error)` as implemented by controller; persistence/validation errors reach `errorHandler`.
- **Logic/flow:** find by id -> update with request body -> return updated document; no ledger calculation in controller.

### Inventory adjustments: `accounts-items-inventory-adjustments`

Source: `inventoryAdjustmentRoutes.ts`, `inventoryAdjustmentController.ts`, model `InventoryAdjustment.ts`.

#### 7. GET `/api/v1/books/inventory-adjustments/`

- **Status/middleware:** LIVE/MOUNTED; `verifyCapyngenToken -> requireBooksSubscription -> requireFeature('accounts-items-inventory-adjustments') -> getAdjustments`
- **Params/query/body:** none.
- **Success:** `200 { success:true, count: adjustments.length, data: adjustments }`.
- **Errors:** controller `next(error)` -> `errorHandler`.
- **Logic/flow:** query adjustments with controller populate/query -> count -> response; no mutation.

#### 8. POST `/api/v1/books/inventory-adjustments/`

- **Status/middleware:** LIVE/MOUNTED; same chain -> `createAdjustment`.
- **Body:** `InventoryAdjustment` contract below.
- **Success:** `201 { success:true, data:populated }`.
- **Errors:** Mongoose/controller errors call `next(error)`; final shape is `errorHandler`.
- **Logic/flow:** construct -> validate/save -> populate configured references -> response. The controller does not define a separate stock or ledger update.

#### 9. GET `/api/v1/books/inventory-adjustments/:id`

- **Status/middleware:** LIVE/MOUNTED; same chain -> `getAdjustmentById`.
- **Path:** required `id`, example `65f000000000000000000002`; query/body none.
- **Success:** `200 { success:true, data:adjustment }`.
- **Errors:** missing record response and `next(error)` follow the controller source; database errors reach `errorHandler`.
- **Logic/flow:** id lookup/populate -> detail response.

#### 10. PUT `/api/v1/books/inventory-adjustments/:id`

- **Status/middleware:** LIVE/MOUNTED; same chain -> `updateAdjustment`.
- **Path/body:** required `id`; partial `InventoryAdjustment` body.
- **Success:** `200 { success:true, data:updatedAdjustment }`.
- **Errors:** controller/Mongoose errors call `next(error)`; no DELETE route is declared.
- **Logic/flow:** find/update -> populate if configured -> response; no controller-defined reversal/reapplication formula.

### Sales customers: `accounts-sales-customers`

Source: `customerRoutes.ts`, `customerController.ts`, model `Customer.ts`.

#### 11. GET `/api/v1/books/sales/customers/`
- **Status/middleware:** LIVE/MOUNTED; `verifyCapyngenToken -> requireBooksSubscription -> requireFeature('accounts-sales-customers') -> getCustomers`.
- **Params/query/body:** none.
- **Success:** `200 { success:true, count: allCustomers.length, data: allCustomers }`.
- **Errors:** `next(error)` -> `errorHandler`.
- **Logic/flow:** controller reads Books customers and its documented Billing merge/fallback behavior -> count -> response.

#### 12. POST `/api/v1/books/sales/customers/`
- **Status/middleware:** LIVE/MOUNTED; same chain -> `createCustomer`.
- **Body:** `Customer` contract below.
- **Success:** `201 { success:true, data:customer }`.
- **Errors:** controller calls `next(error)`; model validation/persistence is handled by `errorHandler`.
- **Logic/flow:** construct/save Books customer -> response. Any opening-balance work is only what is present in the controller/model source; no extra formula is assumed here.

#### 13. GET `/api/v1/books/sales/customers/:id`
- **Status/middleware:** LIVE/MOUNTED; same chain -> `getCustomerById`.
- **Path:** required `id`, example `65f000000000000000000003`; query/body none.
- **Success:** `200 { success:true, data:customer }`, with `sourceDomain` when the controller adds it.
- **Errors:** `404 { success:false, message:'Customer not found' }`; other failures call `next(error)`.
- **Logic/flow:** Books lookup -> Billing fallback where implemented -> response.

#### 14. PUT `/api/v1/books/sales/customers/:id`
- **Status/middleware:** LIVE/MOUNTED; same chain -> `updateCustomer`.
- **Path/body:** required `id`; partial `Customer` body.
- **Success:** `200 { success:true, data:updatedCustomer }`.
- **Errors:** missing customer branch and `next(error)` as coded; no DELETE route exists in this route file.
- **Logic/flow:** update by id -> return updated customer.

### Purchases and sales document routes

Each entry below is intentionally separate. The route file uses the standard five-operation CRUD shape unless the entry says otherwise. The exact controller/model contract is named in [Source contracts](#source-contracts).

#### 15. GET `/api/v1/books/purchases/vendors/`
- **Feature/status:** Vendors; LIVE/MOUNTED.
- **Middleware:** `verifyCapyngenToken -> requireBooksSubscription -> requireFeature('accounts-purchases-vendors') -> getVendors`.
- **Params/query/body:** none.
- **Success/errors/logic:** `200 { success:true, count: docs.length, data:docs }`; controller errors call `next(error)`; query Vendors and return count.

#### 16. POST `/api/v1/books/purchases/vendors/`
- **Feature/status:** Vendors; LIVE/MOUNTED.
- **Middleware:** same feature chain -> `createVendor`.
- **Body:** `Vendor` contract. **Success:** `201 { success:true, data:doc }`.
- **Errors/logic:** controller passes errors to `next`; construct Vendor -> save -> response.

#### 17. GET `/api/v1/books/purchases/vendors/:id`
- **Feature/status:** Vendors; LIVE/MOUNTED. **Middleware:** same chain -> `getVendorById`.
- **Path/body/query:** required `id`; no query/body. **Success:** controller's `200 {success:true,data:vendor}` detail response.
- **Errors/logic:** missing record branch is controller-defined; otherwise id lookup -> response.

#### 18. PUT `/api/v1/books/purchases/vendors/:id`
- **Feature/status:** Vendors; LIVE/MOUNTED. **Middleware:** same chain -> `updateVendor`.
- **Path/body:** required `id`; partial Vendor body. **Success:** `200 {success:true,data:updatedVendor}` as returned by controller.
- **Errors/logic:** controller/DB errors -> `next(error)`; update -> response.

#### 19. GET `/api/v1/books/purchases/expenses/`
- **Feature/status:** Expenses; LIVE/MOUNTED.
- **Middleware:** `verifyCapyngenToken -> requireBooksSubscription -> requireFeature('accounts-purchases-expenses') -> getExpenses`.
- **Query:** controller reads its expense filters; names/defaults are those in `expenseController.ts` (no additional query is invented). **Success:** `200 {success:true,count:combined.length,data:combined}`.
- **Errors/logic:** controller errors return `400 {success:false,message:error.message}`; reads/combines expense records.

#### 20. POST `/api/v1/books/purchases/expenses/`
- **Feature/status:** Expenses; LIVE/MOUNTED. **Middleware:** same chain -> `createExpense`.
- **Body:** `Expense` contract. **Success:** `201 {success:true,data:doc}`.
- **Errors:** caught errors return `400 {success:false,message:error.message}`. **Logic:** construct -> save -> response.

#### 21. POST `/api/v1/books/purchases/expenses/bulk`
- **Feature/status:** Expenses bulk; LIVE/MOUNTED.
- **Middleware:** same chain -> `createBulkExpenses`.
- **Body:** `{ "expenses": [<Expense>] }`; controller requires an array and otherwise returns `400 { success:false, message:'Invalid data format. Expected an array of expenses.' }`.
- **Success:** `201 {success:true,count:docs.length,data:docs}`. **Logic:** validates array -> assigns batch data as implemented -> creates records.

#### 22. GET `/api/v1/books/purchases/expenses/bulk/:batchId`
- **Feature/status:** Expenses bulk; LIVE/MOUNTED. **Middleware:** same chain -> `getBulkExpenses`.
- **Path:** required string `batchId`; query/body none. **Success:** `200 {success:true,count:combined.length,data:combined}`.
- **Errors/logic:** caught errors return `400 {success:false,message:error.message}`; filters records by batch id.

#### 23. PUT `/api/v1/books/purchases/expenses/bulk/:batchId`
- **Feature/status:** Expenses bulk; LIVE/MOUNTED. **Middleware:** same chain -> `updateBulkExpenses`.
- **Path/body:** required `batchId`; update body is consumed by controller; full accepted shape is not separately typed in source.
- **Success/errors/logic:** controller's `200` bulk response; errors return its `400 {success:false,message:error.message}` branch; updates records matching batch id.

#### 24. GET `/api/v1/books/purchases/expenses/:id`
- **Feature/status:** Expenses; LIVE/MOUNTED. **Middleware:** same chain -> `getExpenseById`.
- **Path/body/query:** required `id`; no query/body. **Success:** controller detail response.
- **Errors:** missing record/controller errors follow source; flow is id lookup -> response.

#### 25. PUT `/api/v1/books/purchases/expenses/:id`
- **Feature/status:** Expenses; LIVE/MOUNTED. **Middleware:** same chain -> `updateExpense`.
- **Path/body:** required `id`; partial Expense body. **Success:** controller update response.
- **Errors/logic:** controller's missing/error branches; update by id.

#### 26. DELETE `/api/v1/books/purchases/expenses/:id`
- **Feature/status:** Expenses; LIVE/MOUNTED. **Middleware:** same chain -> `deleteExpense`.
- **Path/body/query:** required `id`; none. **Success:** `200 {success:true,data:doc}` where returned by source.
- **Errors:** controller's `404`/`400` branches and `next` behavior; delete matching document.

#### 27. GET `/api/v1/books/purchases/recurring-expenses/`
- **Feature/status:** Recurring expenses; LIVE/MOUNTED.
- **Middleware:** `verifyCapyngenToken -> requireBooksSubscription -> requireFeature('accounts-purchases-recurring-expenses') -> getRecurringExpenses`.
- **Success:** `200 {success:true,count:docs.length,data:docs}`. No params/query/body. Errors caught by controller return `400 {success:false,message:error.message}`.

#### 28. POST `/api/v1/books/purchases/recurring-expenses/`
- **Middleware/status:** same chain -> `createRecurringExpense`; LIVE/MOUNTED.
- **Body:** `RecurringExpense` contract. **Success:** `201 {success:true,data:doc}`.
- **Errors/logic:** caught errors `400 {success:false,message:error.message}`; construct/save.

#### 29. GET `/api/v1/books/purchases/recurring-expenses/:id`
- **Middleware/status:** same chain -> `getRecurringExpenseById`; LIVE/MOUNTED.
- **Path:** required `id`; no query/body. **Success:** detail response in controller; missing/error branches are source-defined.

#### 30. PUT `/api/v1/books/purchases/recurring-expenses/:id`
- **Middleware/status:** same chain -> `updateRecurringExpense`; LIVE/MOUNTED.
- **Path/body:** required `id`; partial RecurringExpense. **Success:** controller update response; errors are controller `400`/not-found branches.

#### 31. DELETE `/api/v1/books/purchases/recurring-expenses/:id`
- **Middleware/status:** same chain -> `deleteRecurringExpense`; LIVE/MOUNTED.
- **Path:** required `id`; no body/query. **Success:** controller delete envelope. **Logic:** delete matching recurring expense; controller error branch is source-defined.

#### 32. GET `/api/v1/books/purchases/purchase-orders/`
- **Middleware/status:** `verifyCapyngenToken -> requireBooksSubscription -> requireFeature('accounts-purchases-purchase-orders') -> getPurchaseOrders`; LIVE/MOUNTED.
- **Success:** `200 {success:true,count:docs.length,data:docs}`; no params/query/body; errors `400 {success:false,message:error.message}`.

#### 33. POST `/api/v1/books/purchases/purchase-orders/`
- **Middleware/status:** same chain -> `createPurchaseOrder`; LIVE/MOUNTED.
- **Body:** `PurchaseOrder`; **success:** `201 {success:true,data:doc}`; caught errors `400 {success:false,message:error.message}`; construct/save.

#### 34. GET `/api/v1/books/purchases/purchase-orders/:id`
- **Middleware/status:** same chain -> `getPurchaseOrderById`; LIVE/MOUNTED.
- **Path:** required `id`; query/body none; controller detail response and source-defined not-found/error branch.

#### 35. PUT `/api/v1/books/purchases/purchase-orders/:id`
- **Middleware/status:** same chain -> `updatePurchaseOrder`; LIVE/MOUNTED.
- **Path/body:** required `id`; partial PurchaseOrder; controller update response and error branch.

#### 36. DELETE `/api/v1/books/purchases/purchase-orders/:id`
- **Middleware/status:** same chain -> `deletePurchaseOrder`; LIVE/MOUNTED.
- **Path:** required `id`; no body/query; controller delete response and error branch.

#### 37. GET `/api/v1/books/purchases/bills/`
- **Middleware/status:** `verifyCapyngenToken -> requireBooksSubscription -> requireFeature('accounts-purchases-bills') -> getBills`; LIVE/MOUNTED.
- **Success:** `200 {success:true,count:docs.length,data:docs}`; no params/query/body; caught errors `400 {success:false,message:error.message}`.

#### 38. POST `/api/v1/books/purchases/bills/`
- **Middleware/status:** same chain -> `createBill`; LIVE/MOUNTED.
- **Body:** `Bill`; **success:** `201 {success:true,data:doc}`.
- **Errors/logic:** caught errors `400 {success:false,message:error.message}`; Bill pre-save rejects inactive vendor as defined in model hook; construct/save.

#### 39. GET `/api/v1/books/purchases/bills/:id`
- **Middleware/status:** same chain -> `getBillById`; LIVE/MOUNTED.
- **Path:** required `id`; no query/body; detail response; source-defined not-found and error branches.

#### 40. PUT `/api/v1/books/purchases/bills/:id`
- **Middleware/status:** same chain -> `updateBill`; LIVE/MOUNTED.
- **Path/body:** required `id`; partial Bill; controller update response and source-defined errors.

#### 41. DELETE `/api/v1/books/purchases/bills/:id`
- **Middleware/status:** same chain -> `deleteBill`; LIVE/MOUNTED.
- **Path:** required `id`; no query/body; controller delete response and source-defined errors.

#### 42. GET `/api/v1/books/purchases/recurring-bills/`
- **Middleware/status:** feature `accounts-purchases-recurring-bills` -> `getRecurringBills`; LIVE/MOUNTED, with inherited Books middleware.
- **Success:** `200 {success:true,count:docs.length,data:docs}`; no params/query/body; errors `400 {success:false,message:error.message}`.

#### 43. POST `/api/v1/books/purchases/recurring-bills/`
- **Middleware/status:** same chain -> `createRecurringBill`; LIVE/MOUNTED.
- **Body:** `RecurringBill`; **success:** `201 {success:true,data:doc}`; caught errors `400 {success:false,message:error.message}`.

#### 44. GET `/api/v1/books/purchases/recurring-bills/:id`
- **Middleware/status:** same chain -> `getRecurringBillById`; LIVE/MOUNTED.
- **Path:** required `id`; no query/body; controller detail response and source-defined errors.

#### 45. PUT `/api/v1/books/purchases/recurring-bills/:id`
- **Middleware/status:** same chain -> `updateRecurringBill`; LIVE/MOUNTED.
- **Path/body:** required `id`; partial RecurringBill; controller update response and errors.

#### 46. DELETE `/api/v1/books/purchases/recurring-bills/:id`
- **Middleware/status:** same chain -> `deleteRecurringBill`; LIVE/MOUNTED.
- **Path:** required `id`; no query/body; controller delete response and errors.

#### 47. GET `/api/v1/books/purchases/payments-made/`
- **Middleware/status:** feature `accounts-purchases-payments-made` -> `getPaymentsMade`; LIVE/MOUNTED.
- **Success:** `200 {success:true,count:docs.length,data:docs}`; no params/query/body; errors `400 {success:false,message:error.message}`.

#### 48. POST `/api/v1/books/purchases/payments-made/`
- **Middleware/status:** same chain -> `createPaymentMade`; LIVE/MOUNTED.
- **Body:** `PaymentMade`; **success:** `201 {success:true,data:doc}`; caught errors `400 {success:false,message:error.message}`.

#### 49. GET `/api/v1/books/purchases/payments-made/:id`
- **Middleware/status:** same chain -> `getPaymentMadeById`; LIVE/MOUNTED.
- **Path:** required `id`; no query/body; detail response and source-defined errors.

#### 50. PUT `/api/v1/books/purchases/payments-made/:id`
- **Middleware/status:** same chain -> `updatePaymentMade`; LIVE/MOUNTED.
- **Path/body:** required `id`; partial PaymentMade; update response and source-defined errors.

#### 51. DELETE `/api/v1/books/purchases/payments-made/:id`
- **Middleware/status:** same chain -> `deletePaymentMade`; LIVE/MOUNTED.
- **Path:** required `id`; no query/body; delete response and source-defined errors.

#### 52. GET `/api/v1/books/purchases/mileage/`
- **Middleware/status:** feature `accounts-purchases-mileage` -> `getMileageExpenses`; LIVE/MOUNTED.
- **Success:** `200 {success:true,count:docs.length,data:docs}`; no params/query/body; errors `400 {success:false,message:error.message}`.

#### 53. POST `/api/v1/books/purchases/mileage/`
- **Middleware/status:** same chain -> `createMileageExpense`; LIVE/MOUNTED.
- **Body:** `MileageExpense`; **success:** `201 {success:true,data:doc}`; caught errors `400 {success:false,message:error.message}`; no formula beyond model/controller source.

#### 54. GET `/api/v1/books/purchases/mileage/:id`
- **Middleware/status:** same chain -> `getMileageExpenseById`; LIVE/MOUNTED.
- **Path:** required `id`; no query/body; detail response and source-defined errors.

#### 55. PUT `/api/v1/books/purchases/mileage/:id`
- **Middleware/status:** same chain -> `updateMileageExpense`; LIVE/MOUNTED.
- **Path/body:** required `id`; partial MileageExpense; update response and source-defined errors.

#### 56. DELETE `/api/v1/books/purchases/mileage/:id`
- **Middleware/status:** same chain -> `deleteMileageExpense`; LIVE/MOUNTED.
- **Path:** required `id`; no query/body; delete response and source-defined errors.

#### 57. GET `/api/v1/books/sales/quotes/`
- **Middleware/status:** feature `accounts-sales-quotes` -> `getQuotes`; LIVE/MOUNTED.
- **Success:** `200 {success:true,count:quotes.length,data:quotes}`; no params/query/body; errors call `next(error)`.

#### 58. POST `/api/v1/books/sales/quotes/`
- **Middleware/status:** same chain -> `createQuote`; LIVE/MOUNTED.
- **Body:** `Quote`; **success:** `201 {success:true,data:populated}`; errors call `next(error)`; save then populate.

#### 59. GET `/api/v1/books/sales/quotes/:id`
- **Middleware/status:** same chain -> `getQuoteById`; LIVE/MOUNTED.
- **Path:** required `id`; no query/body; `200 {success:true,data:quote}`; source-defined not-found/next errors.

#### 60. PUT `/api/v1/books/sales/quotes/:id`
- **Middleware/status:** same chain -> `updateQuote`; LIVE/MOUNTED.
- **Path/body:** required `id`; partial Quote; `200 {success:true,data:updatedQuote}`; controller error branches.

#### 61. DELETE `/api/v1/books/sales/quotes/:id`
- **Middleware/status:** same chain -> `deleteQuote`; LIVE/MOUNTED.
- **Path:** required `id`; no query/body; controller delete response/errors.

#### 62. GET `/api/v1/books/sales/sales-orders/`
- **Middleware/status:** feature `accounts-sales-sales-orders` -> `getSalesOrders`; LIVE/MOUNTED.
- **Success:** `200 {success:true,data:salesOrders}`; no params/query/body; errors call `next(error)`.

#### 63. POST `/api/v1/books/sales/sales-orders/`
- **Middleware/status:** same chain -> `createSalesOrder`; LIVE/MOUNTED.
- **Body:** `SalesOrder`; **success:** `201 {success:true,data:populated}`; errors `next(error)`; save/populate.

#### 64. GET `/api/v1/books/sales/sales-orders/:id`
- **Middleware/status:** same chain -> `getSalesOrderById`; LIVE/MOUNTED.
- **Path:** required `id`; no query/body; detail response and source-defined errors.

#### 65. PUT `/api/v1/books/sales/sales-orders/:id`
- **Middleware/status:** same chain -> `updateSalesOrder`; LIVE/MOUNTED.
- **Path/body:** required `id`; partial SalesOrder; update response/errors source-defined.

#### 66. DELETE `/api/v1/books/sales/sales-orders/:id`
- **Middleware/status:** same chain -> `deleteSalesOrder`; LIVE/MOUNTED.
- **Path:** required `id`; no query/body; delete response/errors source-defined.

#### 67. POST `/api/v1/books/sales/invoices/`
- **Middleware/status:** feature `accounts-sales-invoices` -> `createInvoice`; LIVE/MOUNTED.
- **Body:** `Invoice`; **success:** `201 {success:true,data:invoice}`.
- **Errors:** duplicate invoice number returns `400 {success:false,message:'Invoice number already exists'}`; other errors call `next(error)`.
- **Logic:** duplicate check -> construct/save Invoice; model pre-save rejects inactive customer where defined.

#### 68. GET `/api/v1/books/sales/invoices/`
- **Middleware/status:** same chain -> `getInvoices`; LIVE/MOUNTED.
- **Query:** optional `status`; when truthy it is assigned to `filter.status`; type is string inferred from `as string`, not runtime-validated. **Success:** `200 {success:true,data:invoices}`.
- **Errors/logic:** `next(error)`; build filter -> query invoices -> response.

#### 69. GET `/api/v1/books/sales/invoices/:id`
- **Middleware/status:** same chain -> `getInvoiceById`; LIVE/MOUNTED.
- **Path:** required `id`; no query/body; detail response and source-defined errors.

#### 70. PUT `/api/v1/books/sales/invoices/:id`
- **Middleware/status:** same chain -> `updateInvoice`; LIVE/MOUNTED.
- **Path/body:** required `id`; partial Invoice; update response/errors source-defined.

#### 71. DELETE `/api/v1/books/sales/invoices/:id`
- **Middleware/status:** same chain -> `deleteInvoice`; LIVE/MOUNTED.
- **Path:** required `id`; no query/body; delete response/errors source-defined.

#### 72. POST `/api/v1/books/sales/recurring-invoices/`
- **Middleware/status:** feature `accounts-sales-recurring-invoices` -> `createRecurringInvoice`; LIVE/MOUNTED.
- **Body:** `RecurringInvoice`; **success:** `201 {success:true,data:populated}`; errors call `next(error)`; save/populate.

#### 73. GET `/api/v1/books/sales/recurring-invoices/`
- **Middleware/status:** same chain -> `getRecurringInvoices`; LIVE/MOUNTED.
- **Success:** `200 {success:true,data:recurringInvoices}`; no params/query/body; errors call `next(error)`.

#### 74. GET `/api/v1/books/sales/recurring-invoices/:id`
- **Middleware/status:** same chain -> `getRecurringInvoiceById`; LIVE/MOUNTED.
- **Path:** required `id`; no query/body; detail response/errors source-defined.

#### 75. PUT `/api/v1/books/sales/recurring-invoices/:id`
- **Middleware/status:** same chain -> `updateRecurringInvoice`; LIVE/MOUNTED.
- **Path/body:** required `id`; partial RecurringInvoice; update response/errors source-defined.

#### 76. DELETE `/api/v1/books/sales/recurring-invoices/:id`
- **Middleware/status:** same chain -> `deleteRecurringInvoice`; LIVE/MOUNTED.
- **Path:** required `id`; no query/body; delete response/errors source-defined.

#### 77. POST `/api/v1/books/sales/delivery-challans/`
- **Middleware/status:** feature `accounts-sales-delivery-challans` -> `createDeliveryChallan`; LIVE/MOUNTED.
- **Body:** `DeliveryChallan`; **success:** `201 {success:true,data:populated}`; errors call `next(error)`.

#### 78. GET `/api/v1/books/sales/delivery-challans/`
- **Middleware/status:** same chain -> `getDeliveryChallans`; LIVE/MOUNTED.
- **Success:** `200 {success:true,data:challans}`; no params/query/body; errors call `next(error)`.

#### 79. GET `/api/v1/books/sales/delivery-challans/:id`
- **Middleware/status:** same chain -> `getDeliveryChallanById`; LIVE/MOUNTED.
- **Path:** required `id`; no query/body; detail response/errors source-defined.

#### 80. PUT `/api/v1/books/sales/delivery-challans/:id`
- **Middleware/status:** same chain -> `updateDeliveryChallan`; LIVE/MOUNTED.
- **Path/body:** required `id`; partial DeliveryChallan; update response/errors source-defined.

#### 81. DELETE `/api/v1/books/sales/delivery-challans/:id`
- **Middleware/status:** same chain -> `deleteDeliveryChallan`; LIVE/MOUNTED.
- **Path:** required `id`; no query/body; delete response/errors source-defined.

#### 82. POST `/api/v1/books/sales/payments-received/`
- **Middleware/status:** feature `accounts-sales-payments-received` -> `createPaymentReceived`; LIVE/MOUNTED.
- **Body:** `PaymentReceived`; **success:** `201 {success:true,data:populated}`; errors call `next(error)`; save/populate.

#### 83. GET `/api/v1/books/sales/payments-received/`
- **Middleware/status:** same chain -> `getPaymentsReceived`; LIVE/MOUNTED.
- **Success:** `200 {success:true,data:payments}`; no params/query/body; errors call `next(error)`.

#### 84. GET `/api/v1/books/sales/payments-received/:id`
- **Middleware/status:** same chain -> `getPaymentReceivedById`; LIVE/MOUNTED.
- **Path:** required `id`; no query/body; detail response/errors source-defined.

#### 85. PUT `/api/v1/books/sales/payments-received/:id`
- **Middleware/status:** same chain -> `updatePaymentReceived`; LIVE/MOUNTED.
- **Path/body:** required `id`; partial PaymentReceived; update response/errors source-defined.

#### 86. DELETE `/api/v1/books/sales/payments-received/:id`
- **Middleware/status:** same chain -> `deletePaymentReceived`; LIVE/MOUNTED.
- **Path:** required `id`; no query/body; delete response/errors source-defined.

#### 87. POST `/api/v1/books/sales/credit-notes/`
- **Middleware/status:** feature `accounts-sales-credit-notes` -> `createCreditNote`; LIVE/MOUNTED.
- **Body:** `CreditNote`; **success:** `201 {success:true,data:populated}`; errors call `next(error)`.

#### 88. GET `/api/v1/books/sales/credit-notes/`
- **Middleware/status:** same chain -> `getCreditNotes`; LIVE/MOUNTED.
- **Success:** `200 {success:true,data:creditNotes}`; no params/query/body; errors call `next(error)`.

#### 89. GET `/api/v1/books/sales/credit-notes/:id`
- **Middleware/status:** same chain -> `getCreditNoteById`; LIVE/MOUNTED.
- **Path:** required `id`; no query/body; detail response/errors source-defined.

#### 90. PUT `/api/v1/books/sales/credit-notes/:id`
- **Middleware/status:** same chain -> `updateCreditNote`; LIVE/MOUNTED.
- **Path/body:** required `id`; partial CreditNote; update response/errors source-defined.

#### 91. DELETE `/api/v1/books/sales/credit-notes/:id`
- **Middleware/status:** same chain -> `deleteCreditNote`; LIVE/MOUNTED.
- **Path:** required `id`; no query/body; delete response/errors source-defined.

## Declared-only Books endpoints

These route files are not imported/mounted in `app.ts`, so their entries have no source-defined full runtime prefix and currently resolve to no application route. Their route-relative paths, controllers, middleware, and individual declarations follow.

### Accounting and dashboard

#### 92. GET `chartOfAccountRoutes.ts:/`
- **Feature:** Chart of Accounts. **Status:** DECLARED BUT NOT MOUNTED. **Middleware:** none declared -> `getAccounts`.
- **Params/query/body:** none. **Success:** raw `accounts` via `res.json(accounts)` (no `success` wrapper).
- **Errors:** `500 { message:'Server Error' }`; detail not-found uses `404 {message:'Not found'}`. **Flow:** query ChartOfAccount -> raw response.

#### 93. GET `chartOfAccountRoutes.ts:/:id`
- **Middleware/status:** none -> `getAccountById`; DECLARED BUT NOT MOUNTED. **Path:** required `id`; no query/body.
- **Success:** raw account. **Errors:** `404 {message:'Not found'}`, `500 {message:'Server Error'}`. **Flow:** lookup -> raw response.

#### 94. POST `chartOfAccountRoutes.ts:/`
- **Middleware/status:** none -> `createAccount`; DECLARED BUT NOT MOUNTED.
- **Body:** ChartOfAccount contract. **Success/errors:** controller response/error branches in source; no mount means runtime 404.

#### 95. PUT `chartOfAccountRoutes.ts:/:id`
- **Middleware/status:** none -> `updateAccount`; DECLARED BUT NOT MOUNTED. Required `id`; partial ChartOfAccount body; controller response/error branches are source-defined.

#### 96. DELETE `chartOfAccountRoutes.ts:/:id`
- **Middleware/status:** none -> `deleteAccount`; DECLARED BUT NOT MOUNTED. Required `id`; no body/query; controller response/error branches are source-defined.

#### 97. GET `dashboardRoutes.ts:/`
- **Feature:** Books dashboard. **Status:** DECLARED BUT NOT MOUNTED. **Middleware:** none -> `getDashboardData`.
- **Params/query/body:** none. **Success:** controller dashboard object response. **Errors:** `500 {success:false,message:'Server error'}`. **Logic:** aggregate data in controller; exact fields are source response.

#### 98. GET `currencyAdjustmentRoutes.ts:/`
- **Status:** DECLARED BUT NOT MOUNTED. **Middleware:** none -> `getCurrencyAdjustments`; no params/query/body.
- **Success:** raw adjustments. **Errors:** `500 {message:'Server Error'}`. **Flow:** query -> raw response.

#### 99. GET `currencyAdjustmentRoutes.ts:/:id`
- **Status/middleware:** DECLARED BUT NOT MOUNTED; none -> `getCurrencyAdjustmentById`. Required `id`; no query/body.
- **Success:** raw adjustment. **Errors:** `404 {message:'Not found'}`, `500 {message:'Server Error'}`.

#### 100. POST `currencyAdjustmentRoutes.ts:/`
- **Status/middleware:** DECLARED BUT NOT MOUNTED; none -> `createCurrencyAdjustment`.
- **Body:** CurrencyAdjustment contract. **Success/errors:** exact controller branches; no runtime mount.

#### 101. PUT `currencyAdjustmentRoutes.ts:/:id`
- **Status/middleware:** DECLARED BUT NOT MOUNTED; none -> `updateCurrencyAdjustment`. Required `id`; partial model body; controller branches.

#### 102. DELETE `currencyAdjustmentRoutes.ts:/:id`
- **Status/middleware:** DECLARED BUT NOT MOUNTED; none -> `deleteCurrencyAdjustment`. Required `id`; no body/query; controller branches.

#### 103. GET `journalRoutes.ts:/`
- **Status/middleware:** DECLARED BUT NOT MOUNTED; none -> `getJournals`. No params/query/body.
- **Success:** raw journals. **Errors:** `500 {message:'Server Error'}`.

#### 104. GET `journalRoutes.ts:/:id`
- **Status/middleware:** DECLARED BUT NOT MOUNTED; none -> `getJournalById`. Required `id`; no query/body.
- **Success:** raw journal. **Errors:** `404 {message:'Journal not found'}`, `500 {message:'Server Error'}`.

#### 105. POST `journalRoutes.ts:/`
- **Status/middleware:** DECLARED BUT NOT MOUNTED; none -> `createJournal`. **Body:** Journal contract; controller response/errors source-defined.

#### 106. PUT `journalRoutes.ts:/:id`
- **Status/middleware:** DECLARED BUT NOT MOUNTED; none -> `updateJournal`. Required `id`; partial Journal body; controller response/errors source-defined.

#### 107. DELETE `journalRoutes.ts:/:id`
- **Status/middleware:** DECLARED BUT NOT MOUNTED; none -> `deleteJournal`. Required `id`; no body/query; controller response/errors source-defined.

#### 108. GET `projectRoutes.ts:/`
- **Status/middleware:** DECLARED BUT NOT MOUNTED; none -> `getProjects`. No params/query/body; raw projects; `500 {message:'Server Error'}`.

#### 109. GET `projectRoutes.ts:/:id`
- **Status/middleware:** DECLARED BUT NOT MOUNTED; none -> `getProjectById`. Required `id`; raw project; `404 {message:'Project not found'}` or `500 {message:'Server Error'}`.

#### 110. POST `projectRoutes.ts:/`
- **Status/middleware:** DECLARED BUT NOT MOUNTED; none -> `createProject`. **Body:** Project contract; controller response/errors source-defined.

#### 111. PUT `projectRoutes.ts:/:id`
- **Status/middleware:** DECLARED BUT NOT MOUNTED; none -> `updateProject`. Required `id`; partial Project body; controller response/errors source-defined.

#### 112. DELETE `projectRoutes.ts:/:id`
- **Status/middleware:** DECLARED BUT NOT MOUNTED; none -> `deleteProject`. Required `id`; no body/query; controller response/errors source-defined.

#### 113. GET `timeEntryRoutes.ts:/`
- **Status/middleware:** DECLARED BUT NOT MOUNTED; none -> `getTimeEntries`. No params/query/body; raw entries; `500 {message:'Server Error'}`.

#### 114. GET `timeEntryRoutes.ts:/:id`
- **Status/middleware:** DECLARED BUT NOT MOUNTED; none -> `getTimeEntryById`. Required `id`; raw entry; `404 {message:'Time Entry not found'}` or `500 {message:'Server Error'}`.

#### 115. POST `timeEntryRoutes.ts:/`
- **Status/middleware:** DECLARED BUT NOT MOUNTED; none -> `createTimeEntry`. **Body:** TimeEntry contract; controller response/errors source-defined.

#### 116. PUT `timeEntryRoutes.ts:/:id`
- **Status/middleware:** DECLARED BUT NOT MOUNTED; none -> `updateTimeEntry`. Required `id`; partial TimeEntry; controller response/errors source-defined.

#### 117. DELETE `timeEntryRoutes.ts:/:id`
- **Status/middleware:** DECLARED BUT NOT MOUNTED; none -> `deleteTimeEntry`. Required `id`; no body/query; controller response/errors source-defined.

#### 118. GET `transactionLockRoutes.ts:/`
- **Status/middleware:** DECLARED BUT NOT MOUNTED; none -> `getTransactionLock`.
- **Success:** `200 {success:true,data:lock}`. **Errors:** `400 {success:false,message:'Missing orgId'}` when request context has no org; other errors use `next(error)`.
- **Logic:** read orgId from request context -> find lock -> response.

#### 119. PUT `transactionLockRoutes.ts:/`
- **Status/middleware:** DECLARED BUT NOT MOUNTED; none -> `updateTransactionLock`.
- **Body:** `{ lockedUntil: Date, isLocked: boolean }` plus authenticated/context-derived values as controller accepts. **Success:** `200 {success:true,data:lock}`; missing org `400 {success:false,message:'Missing orgId'}`; other errors `next(error)`.
- **Logic:** context org -> merge lock data -> update/upsert -> response.

### Reports: 70 individual declarations

All report entries below are in `src/domains/books/routes/reportsRoutes.ts`, have no route-declared middleware, are DECLARED BUT NOT MOUNTED, and call the listed controller. Common report behavior: no body/path; controller generally returns `200 {success:true,data:<service result>}` and calls `next(error)` on failure. Date parameters are optional `startDate`/`endDate`, converted with `new Date(...)` where the controller reads them; `accountId` is passed as a string where used. Any other query is explicitly marked source-specific below.

#### 120. GET `reportsRoutes.ts:/drilldown`
Controller `getDrilldown`; query: controller-specific; success `200 {success:true,data:results}`; errors `next(error)`; flow: org context -> report service -> response.

#### 121. GET `reportsRoutes.ts:/profit-and-loss`
Controller `getProfitAndLoss`; query `startDate`, `endDate` optional dates; success `200 {success:true,data}`; errors `next(error)`.

#### 122. GET `reportsRoutes.ts:/sales-by-customer`
Controller `getSalesByCustomer`; query controller-specific; success `200 {success:true,data}`; errors `next(error)`.

#### 123. GET `reportsRoutes.ts:/sales-by-item`
Controller `getSalesByItem`; query controller-specific; success `200 {success:true,data}`; errors `next(error)`.

#### 124. GET `reportsRoutes.ts:/sales-by-salesperson`
Controller `getSalesBySalesPerson`; optional `startDate`, `endDate` converted to Date; success `200 {success:true,data}`; errors `next(error)`.

#### 125. GET `reportsRoutes.ts:/sales-summary`
Controller `getSalesSummary`; optional `startDate`, `endDate`; success `200 {success:true,data}`; errors `next(error)`.

#### 126. GET `reportsRoutes.ts:/inventory-summary`
Controller `getInventorySummary`; query controller-specific; success `200 {success:true,data}`; errors `next(error)`.

#### 127. GET `reportsRoutes.ts:/inventory-valuation`
Controller `getInventoryValuationSummary`; query controller-specific; success `200 {success:true,data}`; errors `next(error)`.

#### 128. GET `reportsRoutes.ts:/fifo-tracking`
Controller `getFifoCostLotTracking`; query controller-specific; success `200 {success:true,data}`; errors `next(error)`.

#### 129. GET `reportsRoutes.ts:/profit-by-item`
Controller `getProfitByItem`; optional `startDate`, `endDate`; success `200 {success:true,data}`; errors `next(error)`.

#### 130. GET `reportsRoutes.ts:/sales-channel-sync`
Controller `getSalesChannelSync`; query controller-specific; success `200 {success:true,data}`; errors `next(error)`.

#### 131. GET `reportsRoutes.ts:/committed-stock`
Controller `getCommittedStockDetails`; query controller-specific; success `200 {success:true,data}`; errors `next(error)`.

#### 132. GET `reportsRoutes.ts:/inventory-aging`
Controller `getInventoryAgingSummary`; query controller-specific; success `200 {success:true,data}`; errors `next(error)`.

#### 133. GET `reportsRoutes.ts:/stock-summary`
Controller `getStockSummary`; query controller-specific; success `200 {success:true,data}`; errors `next(error)`.

#### 134. GET `reportsRoutes.ts:/inventory-adj-summary`
Controller `getInventoryAdjustmentSummary`; query controller-specific; success `200 {success:true,data}`; errors `next(error)`.

#### 135. GET `reportsRoutes.ts:/inventory-adj-details`
Controller `getInventoryAdjustmentDetails`; query controller-specific; success `200 {success:true,data}`; errors `next(error)`.

#### 136. GET `reportsRoutes.ts:/turnover-qty`
Controller `getInventoryTurnoverByQuantity`; query controller-specific; success `200 {success:true,data}`; errors `next(error)`.

#### 137. GET `reportsRoutes.ts:/abc-classification`
Controller `getABCClassification`; query controller-specific; success `200 {success:true,data}`; errors `next(error)`.

#### 138. GET `reportsRoutes.ts:/turnover-amount`
Controller `getInventoryTurnoverByAmount`; query controller-specific; success `200 {success:true,data}`; errors `next(error)`.

#### 139. GET `reportsRoutes.ts:/weighted-average-cost`
Controller `getWeightedAverageCostSummary`; query controller-specific; success `200 {success:true,data}`; errors `next(error)`.

#### 140. GET `reportsRoutes.ts:/customer-balances`
Controller `getCustomerBalances`; query controller-specific; success `200 {success:true,data}`; errors `next(error)`.

#### 141. GET `reportsRoutes.ts:/vendor-balances`
Controller `getVendorBalances`; query controller-specific; success `200 {success:true,data}`; errors `next(error)`.

#### 142. GET `reportsRoutes.ts:/balance-sheet`
Controller `getBalanceSheet`; optional `startDate`, `endDate` -> Date; success `200 {success:true,data}`; errors `next(error)`.

#### 143. GET `reportsRoutes.ts:/cash-flow`
Controller `getCashFlow`; query controller-specific; success `200 {success:true,data}`; errors `next(error)`.

#### 144. GET `reportsRoutes.ts:/horizontal-pl` (declaration 1)
Controller `getHorizontalPL`; query controller-specific; success `200 {success:true,data:{items:[]}}` as controller contract; errors `next(error)`.

#### 145. GET `reportsRoutes.ts:/horizontal-bs` (declaration 1)
Controller `getHorizontalBS`; query controller-specific; success `200 {success:true,data:{items:[]}}`; errors `next(error)`.

#### 146. GET `reportsRoutes.ts:/movement-of-equity` (declaration 1)
Controller `getMovementOfEquity`; query controller-specific; success `200 {success:true,data}`; errors `next(error)`.

#### 147. GET `reportsRoutes.ts:/business-performance-ratios`
Controller `getBusinessPerformanceRatios`; query controller-specific; success `200 {success:true,data}`; errors `next(error)`.

#### 148. GET `reportsRoutes.ts:/trial-balance` (declaration 1)
Controller `getTrialBalance`; optional `startDate`, `endDate` -> Date; success `200 {success:true,data}`; errors `next(error)`.

#### 149. GET `reportsRoutes.ts:/general-ledger` (declaration 1)
Controller `getGeneralLedger`; query controller-specific; success `200 {success:true,data}`; errors `next(error)`.

#### 150. GET `reportsRoutes.ts:/journal-report` (declaration 1)
Controller `getJournalReport`; query controller-specific; success `200 {success:true,data}`; errors `next(error)`.

#### 151. GET `reportsRoutes.ts:/horizontal-pl` (declaration 2)
Controller `getHorizontalPL`; same exact contract as entry 144; this is a separate declaration and is counted separately.

#### 152. GET `reportsRoutes.ts:/horizontal-bs` (declaration 2)
Controller `getHorizontalBS`; same exact contract as entry 145; separate declaration.

#### 153. GET `reportsRoutes.ts:/movement-of-equity` (declaration 2)
Controller `getMovementOfEquity`; same exact contract as entry 146; separate declaration.

#### 154. GET `reportsRoutes.ts:/receivables-aging`
Controller `getReceivablesAging`; query controller-specific; success `200 {success:true,data}`; errors `next(error)`.

#### 155. GET `reportsRoutes.ts:/invoice-details`
Controller `getInvoiceDetails`; query controller-specific; success `200 {success:true,data}`; errors `next(error)`.

#### 156. GET `reportsRoutes.ts:/ar-aging-details`
Controller `getARAgingDetails`; query controller-specific; success `200 {success:true,data}`; errors `next(error)`.

#### 157. GET `reportsRoutes.ts:/so-details`
Controller `getSalesOrderDetailsReport`; query controller-specific; success `200 {success:true,data}`; errors `next(error)`.

#### 158. GET `reportsRoutes.ts:/delivery-challan-details`
Controller `getDeliveryChallanDetailsReport`; query controller-specific; success `200 {success:true,data}`; errors `next(error)`.

#### 159. GET `reportsRoutes.ts:/quote-details`
Controller `getQuoteDetailsReport`; query controller-specific; success `200 {success:true,data}`; errors `next(error)`.

#### 160. GET `reportsRoutes.ts:/quote-item-details`
Controller `getQuoteItemDetailsReport`; query controller-specific; success `200 {success:true,data}`; errors `next(error)`.

#### 161. GET `reportsRoutes.ts:/receivable-summary`
Controller `getReceivableSummary`; query controller-specific; success `200 {success:true,data}`; errors `next(error)`.

#### 162. GET `reportsRoutes.ts:/receivable-details`
Controller `getReceivableDetails`; query controller-specific; success `200 {success:true,data}`; errors `next(error)`.

#### 163. GET `reportsRoutes.ts:/payables-aging`
Controller `getPayablesAging`; query controller-specific; success `200 {success:true,data}`; errors `next(error)`.

#### 164. GET `reportsRoutes.ts:/po-details`
Controller `getPurchaseOrderDetails`; query controller-specific; success `200 {success:true,data}`; errors `next(error)`.

#### 165. GET `reportsRoutes.ts:/ap-aging-details`
Controller `getAPAgingDetails`; query controller-specific; success `200 {success:true,data}`; errors `next(error)`.

#### 166. GET `reportsRoutes.ts:/vendor-credit-details`
Controller `getVendorCreditDetailsReport`; query controller-specific; success `200 {success:true,data}`; errors `next(error)`.

#### 167. GET `reportsRoutes.ts:/payables-refund-history`
Controller `getPayablesRefundHistory`; query controller-specific; success `200 {success:true,data}`; errors `next(error)`.

#### 168. GET `reportsRoutes.ts:/po-by-vendor`
Controller `getPurchaseOrdersByVendor`; query controller-specific; success `200 {success:true,data}`; errors `next(error)`.

#### 169. GET `reportsRoutes.ts:/po-by-item`
Controller `getPurchaseOrderByItem`; query controller-specific; success `200 {success:true,data}`; errors `next(error)`.

#### 170. GET `reportsRoutes.ts:/payable-summary`
Controller `getPayableSummary`; query controller-specific; success `200 {success:true,data}`; errors `next(error)`.

#### 171. GET `reportsRoutes.ts:/payable-details`
Controller `getPayableDetails`; query controller-specific; success `200 {success:true,data}`; errors `next(error)`.

#### 172. GET `reportsRoutes.ts:/trial-balance` (declaration 2)
Controller `getTrialBalance`; same exact contract as entry 148; separate declaration.

#### 173. GET `reportsRoutes.ts:/general-ledger` (declaration 2)
Controller `getGeneralLedger`; same exact contract as entry 149; separate declaration.

#### 174. GET `reportsRoutes.ts:/journal-report` (declaration 2)
Controller `getJournalReport`; same exact contract as entry 150; separate declaration.

#### 175. GET `reportsRoutes.ts:/expenses-by-category`
Controller `getExpensesByCategory`; query controller-specific; success `200 {success:true,data}`; errors `next(error)`.

#### 176. GET `reportsRoutes.ts:/expense-details`
Controller `getExpenseDetails`; query controller-specific; success `200 {success:true,data}`; errors `next(error)`.

#### 177. GET `reportsRoutes.ts:/purchases-by-vendor`
Controller `getPurchasesByVendor`; query controller-specific; success `200 {success:true,data}`; errors `next(error)`.

#### 178. GET `reportsRoutes.ts:/purchases-by-item`
Controller `getPurchasesByItem`; query controller-specific; success `200 {success:true,data}`; errors `next(error)`.

#### 179. GET `reportsRoutes.ts:/project-summary`
Controller `getProjectSummary`; query controller-specific; success `200 {success:true,data}`; errors `next(error)`.

#### 180. GET `reportsRoutes.ts:/timesheet-profitability`
Controller `getTimesheetProfitability`; query controller-specific; success `200 {success:true,data}`; errors `next(error)`.

#### 181. GET `reportsRoutes.ts:/payments-received-report`
Controller `getPaymentsReceivedReport`; query controller-specific; success `200 {success:true,data}`; errors `next(error)`.

#### 182. GET `reportsRoutes.ts:/payments-made-report`
Controller `getPaymentsMadeReport`; query controller-specific; success `200 {success:true,data}`; errors `next(error)`.

#### 183. GET `reportsRoutes.ts:/tax-summary`
Controller `getTaxSummary`; query controller-specific; success `200 {success:true,data}`; errors `next(error)`.

#### 184. GET `reportsRoutes.ts:/budget-vs-actual`
Controller `getBudgetVsActual`; query controller-specific; success `200 {success:true,data}`; errors `next(error)`.

#### 185. GET `reportsRoutes.ts:/activity-log`
Controller `getActivityLog`; query controller-specific; success `200 {success:true,data}`; errors `next(error)`.

#### 186. GET `reportsRoutes.ts:/day-book`
Controller `getDayBook`; query controller-specific; success `200 {success:true,data}`; errors `next(error)`.

#### 187. GET `reportsRoutes.ts:/account-transactions`
Controller `getAccountTransactions`; query `accountId` optional string inferred from `req.query.accountId as string`; success `200 {success:true,data}`; errors `next(error)`.

#### 188. GET `reportsRoutes.ts:/account-type-summary`
Controller `getAccountTypeSummary`; query controller-specific; success `200 {success:true,data}`; errors `next(error)`.

#### 189. GET `reportsRoutes.ts:/detailed-general-ledger`
Controller `getDetailedGeneralLedger`; optional `startDate`, `endDate` -> Date; success `200 {success:true,data}`; errors `next(error)`.

## Declared-only Core endpoints

All Core route files are unmounted. Therefore each full runtime path is not source-defined; the exact route-relative path is shown.

### Auth routes (`authRoutes.ts`)

#### 190. POST `authRoutes.ts:/check-invite`
`checkInviteStatus`; no middleware; body `{email:string}`. Success/error shapes are exactly those in `authController.ts`; controller branches include not-found and server error. Current runtime: DECLARED BUT NOT MOUNTED.

#### 191. POST `authRoutes.ts:/accept-invite-signup`
`acceptInviteSignup`; no middleware; body `{email:string,password:string}`. Controller response/errors are source-defined; current runtime unmounted.

#### 192. POST `authRoutes.ts:/login`
`login`; no middleware; body `{emailOrMobile:string,password?:string,useOtp?:boolean}`. Branches include `404 {message:'User not found'}`, `200 {message:'OTP sent',method:'otp'}`, `400 {message:'Password is required'}`, `401 {message:'Invalid password'}`, success `200 {message:'Login successful',user}`, and `500 {message:'Server error'}`. Current runtime unmounted.

#### 193. POST `authRoutes.ts:/login/verify`
`verifyLoginOtp`; no middleware; body `{emailOrMobile:string,otp:string}`. Invalid OTP is `400 {message:'Invalid OTP'}`; user missing is `404 {message:'User not found'}`; remaining response/error branches are in controller. Unmounted.

#### 194. POST `authRoutes.ts:/signup`
`signup`; no middleware; body contains controller-used signup fields. Success/errors are controller-defined; unmounted.

#### 195. POST `authRoutes.ts:/signup/verify`
`verifySignupOtp`; no middleware; body `{email:string,otp:string}`. Success/errors are controller-defined; unmounted.

### Organization routes (`orgRoutes.ts`)

#### 196. POST `orgRoutes.ts:/setup`
`setupOrganization`; no middleware; body is controller-used organization setup data. Success `201 {message:'Organization created',organization:org}`; errors call `next(error)`/controller branches. Unmounted.

#### 197. GET `orgRoutes.ts:/`
`getOrganizations`; no middleware; header/context used by controller; no body. Success/errors are controller-defined. Unmounted.

#### 198. POST `orgRoutes.ts:/join`
`joinOrganization`; no middleware; body includes `orgId`. Success/errors are controller-defined. Unmounted.

### RBAC routes (`rbacRoutes.ts`)

#### 199. GET `rbacRoutes.ts:/roles`
`requirePermission('settings','roles') -> getRoles`; no other route middleware; no params/query/body. Missing org context `400 {success:false,message:'Missing orgId'}`; success `200 {success:true,data:roles}`; other errors `next(error)`. Unmounted.

#### 200. GET `rbacRoutes.ts:/roles/:id`
`requirePermission('settings','roles') -> getRoleById`; required `id`; no query/body; controller detail response and source-defined errors. Unmounted.

#### 201. POST `rbacRoutes.ts:/roles`
`requirePermission('settings','roles') -> createRole`; body Role contract; missing org `400`; invalid parent `400 {success:false,message:'Invalid parent role'}`; success `201 {success:true,data:role}`; other errors `next(error)`. Unmounted.

#### 202. PUT `rbacRoutes.ts:/roles/:id`
`requirePermission('settings','roles') -> updateRole`; required `id`; partial Role body; controller response/errors source-defined. Unmounted.

#### 203. DELETE `rbacRoutes.ts:/roles/:id`
`requirePermission('settings','roles') -> deleteRole`; required `id`; no body/query; controller delete response/errors source-defined. Unmounted.

#### 204. GET `rbacRoutes.ts:/users`
`requirePermission('settings','users') -> getOrganizationUsers`; no params/query/body; missing org `400`; success `200 {success:true,data:users}`; other errors `next(error)`. Unmounted.

#### 205. POST `rbacRoutes.ts:/users/invite`
`requirePermission('settings','users') -> inviteUser`; body `{email,name,roleId}`; missing org `400 {success:false,message:'Missing orgId'}`, missing role `400 {success:false,message:'Role is required'}`, existing membership `400 {success:false,message:'User is already invited or active in this organization'}`; success `201 {success:true,message:'User invited successfully',data:mapping}`; other errors `next(error)`. Unmounted.

#### 206. PUT `rbacRoutes.ts:/users/:id`
`requirePermission('settings','users') -> updateUserRole`; required `id`; body includes role id; controller response/errors source-defined. Unmounted.

#### 207. DELETE `rbacRoutes.ts:/users/:id`
`requirePermission('settings','users') -> removeUserFromOrg`; required `id`; no body/query; controller response/errors source-defined. Unmounted.

## Declared-only Billing endpoints

Billing routers are not imported/mounted by `app.ts`; no middleware is declared in these route files.

#### 208. GET `billing/customerRoutes.ts:/`
Feature Billing customers; `getCustomers`; no params/query/body; success `200 {success:true,data:allCustomers}`; database failure `500 {success:false,message:error.message}`; DECLARED BUT NOT MOUNTED.

#### 209. POST `billing/customerRoutes.ts:/`
`createCustomer`; body `BillingCustomer` contract; controller success/error response; DECLARED BUT NOT MOUNTED.

#### 210. GET `billing/customerRoutes.ts:/:id`
`getCustomerById`; required `id`; no query/body; missing record `404 {success:false,message:'Customer not found'}`; success includes `sourceDomain`; other errors `500 {success:false,message:error.message}`; unmounted.

#### 211. PUT `billing/customerRoutes.ts:/:id`
`updateCustomer`; required `id`; partial BillingCustomer body; controller response/errors; unmounted.

#### 212. DELETE `billing/customerRoutes.ts:/:id`
`deleteCustomer`; required `id`; no body/query; controller response/errors; unmounted.

#### 213. GET `billing/itemRoutes.ts:/`
`getItems`; no params/query/body; success `200 {success:true,count:allItems.length,data:allItems}`; database failure `500 {success:false,message:error.message}`; unmounted.

#### 214. POST `billing/itemRoutes.ts:/`
`createItem`; body BillingItem; controller success/errors; unmounted.

#### 215. GET `billing/itemRoutes.ts:/:id`
`getItemById`; required `id`; success includes source domain; missing `404 {success:false,message:'Item not found'}`; other error `500 {success:false,message:error.message}`; unmounted.

#### 216. PUT `billing/itemRoutes.ts:/:id`
`updateItem`; required `id`; partial BillingItem; controller response/errors; unmounted.

#### 217. DELETE `billing/itemRoutes.ts:/:id`
`deleteItem`; required `id`; no body/query; controller response/errors; unmounted.

#### 218. GET `billing/planRoutes.ts:/`
`getPlans`; no params/query/body; `200 {success:true,count:plans.length,data:plans}`; database failure `500 {success:false,message:error.message}`; unmounted.

#### 219. POST `billing/planRoutes.ts:/`
`createPlan`; body Plan contract; controller success/errors; unmounted.

#### 220. GET `billing/planRoutes.ts:/:id`
`getPlanById`; required `id`; no query/body; missing `404 {success:false,message:'Plan not found'}`; success `200 {success:true,data:plan}`; unmounted.

#### 221. PUT `billing/planRoutes.ts:/:id`
`updatePlan`; required `id`; partial Plan body; controller response/errors; unmounted.

#### 222. DELETE `billing/planRoutes.ts:/:id`
`deletePlan`; required `id`; no body/query; controller response/errors; unmounted.

#### 223. GET `billing/dashboardRoutes.ts:/`
`getDashboardData`; no params/query/body; controller sends its dashboard object on success and `500 {success:false,message:'Server error'}` on failure; DECLARED BUT NOT MOUNTED.

## Source contracts

The following are the model-backed request contracts used by the endpoint entries. Required means `required: true`; optional means the schema does not mark the field required. Defaults and enums are copied from the model source. Fields not shown are not asserted here.

### Item (`src/domains/books/models/Item.ts`)

```json
{
  "orgId": "string, optional",
  "name": "string, required",
  "sku": "string, optional, default \"\"",
  "type": "string, optional, enum [goods, service], default goods",
  "unit": "string, optional, default pcs",
  "salesRate": "number, required, default 0, non-negative",
  "purchaseRate": "number, required, default 0, non-negative",
  "description": "string, optional, default \"\"",
  "stock": "number, optional, default 0",
  "createdBy": "string, optional, default piyushsharma12452"
}
```
Example: `{ "name":"Consulting", "type":"service", "unit":"pcs", "salesRate":1000, "purchaseRate":700, "description":"Monthly consulting", "stock":0 }`.

### InventoryAdjustment (`InventoryAdjustment.ts`)

Fields: `orgId` string optional; `mode` string enum `quantity|value`, default `quantity`; `referenceNumber` string default `""`; `date` Date required default `Date.now`; `reason` string required; `description` string optional default `""`; `account` string required; `items` array required, each object has `item` ObjectId required and `quantityAdjusted` number required; `createdBy` string optional. Example: `{ "mode":"quantity", "date":"2026-09-23", "reason":"Damaged stock", "account":"Inventory Adjustment", "items":[{"item":"65f000000000000000000001","quantityAdjusted":-2}] }`.

### Shared address/contact/custom fields

`Address` fields are optional strings: `attention`, `country`, `street1`, `street2`, `city`, `state`, `zipCode`, `phone`, `fax`. `ContactPerson` fields are optional strings: `firstName`, `lastName`, `email`, `phone`, `designation`. `CustomField` fields are optional strings: `label`, `value`.

### Customer and Vendor

`Customer` fields: `customerType` enum `business|individual`, default `business`; identity/contact strings (`salutation`, `firstName`, `lastName`, `companyName`, `email`, `phone`, `mobile`, `pan`, `currency`, `accountsReceivable`, `paymentTerms`, `remarks`) optional; `displayName` string required; `billingAddress` and `shippingAddress` Address default `{}`; `contactPersons` array ContactPerson; `openingBalance` number default `0`; `portalAccess` boolean default `false`; `customFields` array; `status` enum `Active|Inactive`; `receivables` and `unusedCredits` numbers; `orgId` and `createdBy` strings optional. Vendor uses the same nested structures and has `vendorType` enum `business|individual`, `tds` enum `yes|no`, `status` enum `Active|Inactive`, `currency` default `INR`, `openingBalance` default `0`, `portalAccess`/`msmeRegistered` booleans, `accountsPayable`, `payables`, `unusedCredits`, and optional `bankDetails` object with `accountHolderName`, `bankName`, `accountNumber`, `ifscCode` strings.

### Sales documents

`Quote`, `SalesOrder`, `Invoice`, `RecurringInvoice`, `DeliveryChallan`, `PaymentReceived`, and `CreditNote` use the exact nested item/reference structures in their model files. Shared sales line item fields are `item` ObjectId required, `description` string optional, `quantity` number required default `1`, `rate` number required default `0`, `amount` number required default `0`. Required document identifiers/dates/totals are model-specific: Quote (`quoteNumber`, `customer`, `quoteDate`, `items`, `subTotal`, `total`); SalesOrder (`salesOrderNumber`, `customer`, `salesOrderDate`, `items`, `subTotal`, `total`); Invoice (`invoiceNumber`, `customer`, `invoiceDate`, `items`, `subTotal`, `total`, `balanceDue`); RecurringInvoice (`profileName`, `customer`, `repeatEvery`, `startsOn`, `items`, `subTotal`, `total`); DeliveryChallan (`challanNumber`, `customer`, `challanDate`, `items`, `subTotal`, `total`); PaymentReceived (`customer`, `amount`, `paymentDate`, `paymentNumber`, `paymentMode`); CreditNote (`customer`, `creditNoteNumber`, `creditNoteDate`, `items`, `subTotal`, `total`). All enums, defaults, and optional fields are defined in the linked model source and must be read there for fields beyond this shared shape.

### Purchase documents

`Expense`, `RecurringExpense`, `PurchaseOrder`, `Bill`, `RecurringBill`, `PaymentMade`, and `MileageExpense` use their corresponding model files. The authoritative required fields are: Expense `date`, `amount`, `totalAmount`; RecurringExpense `profileName`, `repeatEvery`, `startsOn`, `expenseAccount`, `amount`, `paidThrough`; PurchaseOrder `vendorId`, `poNumber`, `orderDate`, `lineItems`, `subTotal`, `totalAmount`; Bill `vendorId`, `billNumber`, `billDate`, `lineItems`, `subTotal`, `totalAmount`; RecurringBill `vendorId`, `profileName`, `repeatEvery`, `startsOn`, `lineItems`, `subTotal`, `totalAmount`; PaymentMade `vendorId`, `paymentType`, `paymentNumber`, `amount`, `paymentDate`, `paymentMode`, `paidThrough`; MileageExpense `date`, `distance`, `rate`, `amount`, `expenseAccount`, `paidThrough`. Nested line-item fields and enums/defaults are copied from the named source models, not inferred by this document.

### Accounting/core/billing model contracts

`ChartOfAccount`, `CurrencyAdjustment`, `Journal`, `Project`, `TimeEntry`, `TransactionLock`, `User`, `Organization`, `Role`, `UserOrganization`, `BillingCustomer`, `BillingItem`, and `Plan` are the request models used by the declared-only entries. Their complete field definitions, required flags, defaults, enums, and nested schemas are in the corresponding files under `src/domains/**/models/`. Controllers that do not destructure or validate a field accept the request object according to the model/Mongoose behavior; this documentation does not invent a DTO.

## Verification

## Expanded endpoint contracts

The numbered registry above is the route checklist. This section supplies the concrete controller contracts that the registry entries reference. Each operation remains separate in the registry; these blocks only prevent repeating the same source-derived schema dozens of times.

### Mounted Books: exact request and response contracts

#### Items (entries 3-6)

`GET /api/v1/books/items/` has no path, query, or body. `getItems` reads Books `Item` documents and Billing `BillingItem` documents, adds `sourceDomain` (`books` or `billing`), sorts by `createdAt` descending, and returns `200 { success:true, count:allItems.length, data:allItems }`. Any database error is passed to `errorHandler`.

`POST /api/v1/books/items/` accepts the complete `Item` body shown below and calls `Item.create(req.body)`. It returns `201 { success:true, data:item }`; Mongoose errors go to `errorHandler`.

`GET /api/v1/books/items/:id` uses required `req.params.id`, performs a Books lookup followed by Billing fallback, and returns `200 { success:true, data:{ ...item, sourceDomain } }`. No match returns `404 { success:false, message:'Item not found' }`.

`PUT /api/v1/books/items/:id` uses required `req.params.id` and the partial request body. It updates Books first, then Billing with `runValidators:true`, and returns `200 { success:true, data:item }`; no match returns `404 { success:false, message:'Item not found' }`.

Example create/update body:

```json
{
  "orgId": "company-id",
  "name": "Monthly consulting",
  "sku": "CONS-001",
  "type": "service",
  "unit": "pcs",
  "salesRate": 1000,
  "purchaseRate": 700,
  "description": "Retainer",
  "stock": 0,
  "createdBy": "employee-id"
}
```

#### Inventory adjustments (entries 7-10)

Body:

```json
{
  "orgId": "company-id",
  "mode": "quantity",
  "referenceNumber": "ADJ-1001",
  "date": "2026-09-23T00:00:00.000Z",
  "reason": "Damaged stock",
  "description": "Warehouse count adjustment",
  "account": "Inventory Adjustment",
  "items": [{ "item": "65f000000000000000000001", "quantityAdjusted": -2 }],
  "createdBy": "employee-id"
}
```

`GET` has no inputs and returns `200 { success:true, count:adjustments.length, data:adjustments }`, sorted newest first. `POST` validates the body, creates the adjustment in a transaction, and for `mode === 'quantity'` increments each referenced `Item.stock` by `quantityAdjusted`; it returns `201 { success:true, data:populatedAdjustment }`. `GET /:id` uses `req.params.id`, returns `200 {success:true,data:adjustment}`, or `404 {success:false,message:'Adjustment not found'}`. `PUT /:id` uses `req.params.id` and `req.body`, calls `findByIdAndUpdate` without validators, does not reverse/reapply stock, and returns `200 {success:true,data:adjustment}` or the same `404`. Other failures call `next(error)`.

#### Customers and vendors (entries 11-18)

Customer create accepts:

```json
{
  "customerType": "business",
  "salutation": "Ms",
  "firstName": "Asha",
  "lastName": "Sharma",
  "companyName": "Asha Foods",
  "displayName": "Asha Foods",
  "email": "asha@example.com",
  "phone": "+91-1100000000",
  "mobile": "+91-9900000000",
  "billingAddress": { "attention": "Asha", "country": "India", "street1": "1 Main Road", "city": "Delhi", "state": "Delhi", "zipCode": "110001", "phone": "+91-1100000000" },
  "shippingAddress": {},
  "contactPersons": [{ "firstName": "Ravi", "email": "ravi@example.com" }],
  "currency": "INR",
  "accountsReceivable": "Accounts Receivable",
  "openingBalance": 0,
  "paymentTerms": "Net 30",
  "portalAccess": false,
  "customFields": [{ "label": "Segment", "value": "Retail" }],
  "status": "Active",
  "receivables": 0,
  "unusedCredits": 0,
  "createdBy": "employee-id"
}
```

Customer list merges Books and Billing records, adds `sourceDomain`, and returns `200 {success:true,count:allCustomers.length,data:allCustomers}`. Customer create returns `201 {success:true,data:customer}`; when `openingBalance > 0`, it posts a ledger transaction debiting `Accounts Receivable` and crediting `Opening Balance Equity`. Detail uses `:id`, Books first and Billing fallback, returns `404 {success:false,message:'Customer not found'}` if neither exists. Update uses `:id` and partial body, updates Books/Billing with validators, and returns `200 {success:true,data:updatedCustomer}`. There is no customer DELETE declaration.

Vendor uses the same nested address/contact/custom-field structure. Its body additionally has `vendorType` (`business|individual`), `tds` (`yes|no`), `msmeRegistered` boolean, and `bankDetails` `{accountHolderName,bankName,accountNumber,ifscCode}`. Vendor list returns `200 {success:true,count:docs.length,data:docs}` sorted by `createdAt`; create returns `201 {success:true,data:doc}`; detail/update use required `:id`, return `404 {success:false,message:'Vendor not found'}` when absent, and otherwise return the controller's `200` detail/update envelope. No vendor DELETE is declared.

#### Expenses (entries 19-26)

Expense body:

```json
{
  "orgId": "company-id",
  "expenseType": "Goods",
  "date": "2026-09-23T00:00:00.000Z",
  "expenseAccount": "Travel",
  "amount": 200,
  "taxAmount": 0,
  "totalAmount": 200,
  "vendorId": "65f000000000000000000010",
  "billable": false,
  "status": "Non-Billable",
  "isItemized": false,
  "lineItems": [{ "expenseAccount": "Taxi", "notes": "Airport", "amount": 200 }],
  "paidThrough": "Bank",
  "currency": "INR"
}
```

`GET /expenses/` reads both `Expense` and `MileageExpense`, populates vendor/customer display names, adds `expenseType:'Mileage'` to mileage rows, sorts by date descending then `createdAt` descending, and returns `200 {success:true,count:combined.length,data:combined}`. `POST /expenses/` creates the body and returns `201 {success:true,data:doc}`. For non-Draft documents it posts a ledger transaction: debit `expenseAccountId || 'Expense Account'`; credit `paidThroughAccount || 'Bank'` when paid, otherwise credit `Accounts Payable`; amount is `doc.amount`. Controller errors return `400 {success:false,message:error.message}`.

`GET /expenses/:id` first searches Expense then MileageExpense and returns `200 {success:true,data:doc}` or mileage data with `expenseType:'Mileage'`; missing returns `404 {success:false,message:'Expense not found'}`. `PUT /expenses/:id` updates only regular Expense with `{new:true,runValidators:true}` and returns `404` with that message when absent. `DELETE /expenses/:id` deletes regular then mileage, returns `200 {success:true,data:{}}`, or the same `404`.

`POST /expenses/bulk` requires body `{ "expenses": [<Expense>] }`. Missing/non-array input returns `400 {success:false,message:'Invalid data format. Expected an array of expenses.'}`. The controller generates a UUID `bulkBatchId`, adds it to every row, calls `insertMany`, and returns `201 {success:true,count:docs.length,data:docs}`. `GET /bulk/:batchId` filters by required `req.params.batchId` and returns `200 {success:true,count:docs.length,data:docs}`. `PUT /bulk/:batchId` requires an `expenses` array; otherwise it returns `400 {success:false,message:'Invalid data.'}`; it deletes the existing batch, reinserts the supplied rows with the same batch id, and returns `200 {success:true,count:docs.length,data:docs}`.

#### Invoices (entries 67-71)

Example body:

```json
{
  "invoiceNumber": "INV-1001",
  "customer": "65f000000000000000000003",
  "invoiceDate": "2026-09-23T00:00:00.000Z",
  "dueDate": "2026-10-23T00:00:00.000Z",
  "status": "Sent",
  "items": [{ "item": "65f000000000000000000001", "description": "Consulting", "quantity": 1, "rate": 1000, "amount": 1000 }],
  "subTotal": 1000,
  "discountType": "amount",
  "discountValue": 0,
  "discount": 0,
  "taxWithheldType": "none",
  "taxWithheldAmount": 0,
  "adjustment": 0,
  "taxTotal": 0,
  "total": 1000,
  "balanceDue": 1000,
  "createdBy": "employee-id"
}
```

Create checks duplicate `invoiceNumber` within context `orgId`; duplicate returns `400 {success:false,message:'Invoice number already exists'}`. It injects context `orgId`, creates and populates customer/items, and returns `201 {success:true,data:invoice}`. For non-Draft invoices it posts ledger lines: AR debit `total`, Sales Income credit `subTotal`, Tax Payable credit `taxTotal`, Discount Given debit `discount`, signed Adjustment, COGS debit `(subTotal * 0.4)`, and Inventory Asset credit `(subTotal * 0.4)`. Other failures call `next(error)`.

List accepts only optional `?status=<InvoiceStatus>` (string inferred from usage, no runtime type validation), applies it as `filter.status`, populates customer/items, sorts newest first, and returns `200 {success:true,data:invoices}`. Detail uses required `:id` and returns `404 {success:false,message:'Invoice not found'}` when absent. Update first loads the original invoice; absent is the same `404`. If `originalInvoice.balanceDue < originalInvoice.total` and body status is `Void`, it returns `400 {success:false,message:'Cannot void an invoice that has payments applied. Delete payments first.'}`. If the original was unpaid and body contains `total`, it sets `body.balanceDue = body.total`; after update, Void calls `LedgerService.voidTransaction`, while any non-Draft status posts the same ledger formula; success is `200 {success:true,data:invoice}`. Delete refuses paid invoices with `400 {success:false,message:'Cannot delete an invoice that has payments applied. Delete payments first.'}`, otherwise deletes the invoice and ledger transaction and returns `200 {success:true,data:{}}`.

### Declared-only exact controller contracts

The following are not merely route names: they document the source behavior for every declared-only family. All have no mounted full prefix in `app.ts`.

#### Accounting raw CRUD

Chart of Accounts, Currency Adjustments, Projects, Time Entries, and Journals use raw document responses rather than `{success,data}` for their ordinary CRUD handlers. List GET has no params/query/body and returns `200 res.json(array)`. Detail GET uses required `:id`, returns `200 res.json(document)`, and returns the family-specific 404: Chart/Currency `404 {message:'Not found'}`, Project `404 {message:'Project not found'}`, Time Entry `404 {message:'Time Entry not found'}`, Journal `404 {message:'Journal not found'}`. List/detail database errors return `500 {message:'Server Error'}`.

POST bodies are the complete corresponding model objects and return raw `201 res.json(document)`; PUT bodies are partial model objects with required `:id` and return raw `200 res.json(document)`; DELETE uses required `:id` and returns the family-specific deletion message (`Deleted`, `Journal deleted`, `Project deleted`, or `Time Entry deleted`). Validation branches return `400 {message:error.message}` and database branches return `500 {message:'Server Error'}`.

Journal POST additionally checks line-item totals. If `sum(lineItems.debits) !== sum(lineItems.credits)`, it returns `400 {message:'Double-entry violation: Debits (<debits>) do not equal Credits (<credits>)'}`. A non-Draft journal posts its ledger transaction before returning the created raw document.

#### Transaction locks and dashboard

Transaction lock GET/PUT have no path/query. Both require context `orgId`; missing context returns `400 {success:false,message:'Missing orgId'}`. GET finds the organization lock and creates a default lock when absent, returning `200 {success:true,data:lock}`. PUT accepts `{ "lockedUntil":"2026-09-30T23:59:59.000Z", "isLocked":true }`, merges context `lockedBy`, upserts the lock, and returns the same `200` envelope. Other failures call `next(error)`.

Books dashboard GET has no inputs and returns `200 {success:true,data:{totalReceivables,totalPayables,totalIncome,watchlist}}`; database failure returns `500 {success:false,message:'Server error'}`.

#### Reports

Every one of the 70 report declarations has no body/path. Every successful controller response is exactly `200 {success:true,data}` and every caught failure calls `next(error)`. The only controller-read query parameters are:

| Report declarations | Query | Conversion/use |
|---|---|---|
| profit-and-loss, sales-by-salesperson, sales-summary, profit-by-item, balance-sheet, trial-balance, detailed-general-ledger | `startDate`, `endDate` | optional strings converted with `new Date`; omitted values become `undefined` |
| account-transactions | `accountId` | optional string passed to the service; type is inferred from `as string` |
| drilldown | `customerId`, `vendorId`, `accountId`, `type` | customer takes precedence over vendor, vendor over account; `type` is read but not used in the branch |
| all other report declarations | none | no query read by controller |

Horizontal PL/BS specifically return `data:{items:[]}`. No report controller adds a `count`. Duplicate declarations have the same controller contract but remain separate numbered endpoint entries.

#### Core Auth

`POST /login` body `{emailOrMobile,password?,useOtp?}`. Missing user is `404 {message:'User not found'}`; OTP mode returns `200 {message:'OTP sent',method:'otp'}`; password missing is `400 {message:'Password is required'}`; mismatch is `401 {message:'Invalid password'}`; password success is `200 {message:'Login successful',user}`; catch is `500 {message:'Server error'}`. `POST /login/verify` body `{emailOrMobile,otp}`; OTP must equal `123456`, otherwise `400 {message:'Invalid OTP'}`, missing user is `404 {message:'User not found'}`. `POST /signup` body `{role,companyName,email,mobile,password,country,state}`; password is hashed; success is `200 {message:'OTP sent for signup',user,signupData}`. `POST /signup/verify` body `{email,otp}`; OTP must equal `1234567`; invalid is `400`. `POST /check-invite` body `{email}` returns the existing/invited state object or `404 {state:'not_found'}`. `POST /accept-invite-signup` body `{email,password}` returns `400` when no pending invite and `200` after password/mapping update.

Organization setup body is `{userId,companyName,industry,location,state,currency,language,timeZone,gstRegistered,gstNumber}` and returns `201 {message:'Organization created',organization}`. Organization list reads `x-user-id` and returns `200 {success:true,data}` with role/status fields. Join body is `{orgId}` and uses context `userId`; missing values are `400`, missing invitation/already active is `404`, success is `200 {success:true,data}`.

Role routes use body `{name,description,parentRoleId,permissions}`. Missing context org is `400 {success:false,message:'Missing orgId'}`; invalid parent is `400 {success:false,message:'Invalid parent role'}`; list/detail success is `200 {success:true,data}`, create `201`, update `200`, delete `200 {success:true,message:'Role deleted'}`, missing role `404`. User invite body is `{email,name,roleId}`; missing role is `400 {success:false,message:'Role is required'}`, duplicate mapping is `400 {success:false,message:'User is already invited or active in this organization'}`, success is `201 {success:true,message:'User invited successfully',data:mapping}`. User list is `200 {success:true,data}`, role update body is `{roleId}`, and admin removal is `403` while successful removal is `200 {success:true,message}`.

#### Billing

Billing customer/item/plan CRUD uses required `:id` on detail/update/delete. List/detail/create/update/delete responses are respectively `200 {success:true,data:[...]}`, `200 {success:true,data:object}`, `201 {success:true,data:object}`, `200 {success:true,data:object}`, and the controller-specific delete envelope. Billing customer missing detail is `404 {success:false,message:'Customer not found'}`; Billing item missing detail is `404 {success:false,message:'Item not found'}`; Plan missing detail is `404 {success:false,message:'Plan not found'}`. Billing customer/item delete success is `200 {success:true,message:'Customer deleted successfully'}` / `200 {success:true,message:'Item deleted successfully'}`; Plan delete is `200 {success:true,data:{}}`. Validation is `400 {success:false,message:error.message}` and database failures are `500 {success:false,message:error.message}`.

Billing dashboard GET has no inputs and returns `200 {success:true,data:{netRevenue,mrr,activeSubscriptions,arpu,churnRate,activeCustomers}}`; its `activeSubscriptions` value is `plans.length`. Database failure is `500 {success:false,message:'Server error'}`.

- Checklist total: **223 endpoint declarations**.
- Documented entries: **223** (`1-223`).
- Route-file declarations: **221**.
- Direct `app.ts` handlers: **2**.
- Mounted route-file handlers: **89**.
- Declared-only route-file handlers: **132**.
- Duplicate report declarations retained: 6 paths, 12 declarations.

Source limitations are intentionally visible: unmounted routers have no source-defined full prefix; controller-specific query fields/response branches are not invented; and model contracts are referenced to their exact source files when a complete nested schema cannot be represented without changing the source contract.
