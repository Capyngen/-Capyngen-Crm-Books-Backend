# Fulfillment & Dispatch Modules - Complete REST API Specification

This specification documents the complete suite of APIs under the **Fulfillment & Dispatch** navigation menu of the Enterprise ERP suite:

1. **Order Fulfillment (Queue)**
2. **Sales Orders**
3. **Packages & Slips**
4. **Shipments & Tracking**
5. **Delivery Challans**
6. **Sales Returns (RMA & Reverse Logistics)**
7. **Customers**

---

## 1. Global Authentication & Scoping

All endpoints require standard JWT Bearer authentication and tenant organization scoping.

### Common Request Headers
| Header | Type | Required | Description | Example |
| :--- | :--- | :--- | :--- | :--- |
| `Authorization` | `string` | **Yes** | Standard JWT Bearer token | `Bearer eyJhbGciOi...` |
| `Content-Type` | `string` | **Yes** | Payload format | `application/json` |

---

## 2. API Endpoints Summary

| Module | Route Prefix | Primary Action Endpoints |
| :--- | :--- | :--- |
| **1. Order Fulfillment** | `/api/v1/inventory/fulfillment` | `POST /:id/advance-stage` |
| **2. Sales Orders** | `/api/v1/inventory/sales/sales-orders` | `POST /:id/fulfill`, `POST /:id/convert-to-invoice`, `POST /:id/convert-to-delivery-challan` |
| **3. Packages & Slips** | `/api/v1/inventory/packages` | `GET /:id`, `PUT /:id`, `DELETE /:id` |
| **4. Shipments & Tracking** | `/api/v1/inventory/shipments` | `POST /:id/carrier`, `GET /:id/packing-slip` |
| **5. Delivery Challans** | `/api/v1/inventory/sales/delivery-challans` | `POST /:id/convert-to-invoice` |
| **6. Sales Returns (RMA)** | `/api/v1/inventory/sales/returns` | `POST /:id/receive` |
| **7. Customers** | `/api/v1/inventory/sales/customers` | `GET /:id/transactions`, `GET /:id/statement` |

---

## 3. Detailed Module Specifications

---

### Module 1: Order Fulfillment (Queue)
Manages wave picking, warehouse bin fulfillment queues, and stage progressions (`To Pick` -> `Picked` -> `Packed` -> `Shipped`).

#### 1.1 List Fulfillment Queue
- **Method**: `GET`
- **URL**: `/api/v1/inventory/fulfillment`
- **Query Parameters**:
  | Param | Type | Required | Description |
  | :--- | :--- | :--- | :--- |
  | `stage` | `string` | No | `To Pick`, `Picked`, `Packed`, `Shipped`, or `All` |
  | `priority` | `string` | No | `Urgent`, `High`, `Standard` |
  | `search` | `string` | No | Filter by waveNumber, salesOrderNumber, or customerName |
  | `page` | `number` | No | Default `1` |
  | `limit` | `number` | No | Default `50` |

#### Response (`200 OK`)
```json
{
  "success": true,
  "count": 1,
  "total": 1,
  "data": [
    {
      "_id": "673f2a1b9f4a123456789001",
      "orgId": "6aa797278d301b4735f1d322",
      "waveNumber": "WAVE-2026-0001",
      "salesOrderNumber": "SO-00042",
      "customerName": "Acme Motors Pvt Ltd",
      "warehouseName": "Main Central Warehouse",
      "pickBin": "BIN-F-01",
      "itemsCount": 5,
      "priority": "Urgent",
      "stage": "To Pick",
      "date": "2026-10-22T00:00:00.000Z",
      "createdAt": "2026-10-22T07:15:00.000Z"
    }
  ]
}
```

#### 1.2 Create Fulfillment Wave / Task
- **Method**: `POST`
- **URL**: `/api/v1/inventory/fulfillment`
- **Request Body**:
```json
{
  "salesOrderNumber": "SO-00042",
  "customerName": "Acme Motors Pvt Ltd",
  "warehouseName": "Main Central Warehouse",
  "pickBin": "BIN-F-01",
  "itemsCount": 5,
  "priority": "Urgent",
  "stage": "To Pick"
}
```
- **Response (`201 Created`)**:
```json
{
  "success": true,
  "data": {
    "_id": "673f2a1b9f4a123456789001",
    "waveNumber": "WAVE-2026-0001",
    "salesOrderNumber": "SO-00042",
    "stage": "To Pick",
    "createdAt": "2026-10-22T07:15:00.000Z"
  }
}
```

#### 1.3 Advance Fulfillment Stage
Moves order sequentially: `To Pick` ➔ `Picked` ➔ `Packed` ➔ `Shipped`.
- **Method**: `POST`
- **URL**: `/api/v1/inventory/fulfillment/:id/advance-stage`
- **Payload**: None required (`{}`)
- **Response (`200 OK`)**:
```json
{
  "success": true,
  "message": "Fulfillment advanced to stage Picked",
  "data": {
    "_id": "673f2a1b9f4a123456789001",
    "waveNumber": "WAVE-2026-0001",
    "stage": "Picked",
    "updatedAt": "2026-10-22T07:16:30.000Z"
  }
}
```

---

### Module 2: Sales Orders
Comprehensive sales order management including reservation, partial fulfillment, backorders, and conversions.

#### 2.1 List Sales Orders
- **Method**: `GET`
- **URL**: `/api/v1/inventory/sales/sales-orders`
- **Query Parameters**:
  | Param | Type | Required | Description |
  | :--- | :--- | :--- | :--- |
  | `status` | `string` | No | `Draft`, `Confirmed`, `Partially Fulfilled`, `Fulfilled`, `Invoiced`, `Void` |
  | `customerId` | `string` | No | Filter by Customer ObjectId |
  | `search` | `string` | No | Search across order numbers and references |
  | `page` | `number` | No | Default `1` |
  | `limit` | `number` | No | Default `50` |

#### Response (`200 OK`)
```json
{
  "success": true,
  "count": 1,
  "total": 1,
  "data": [
    {
      "_id": "673f2a1b9f4a123456789002",
      "salesOrderNumber": "SO-00042",
      "customer": "673f1d248b9f4a1234567899",
      "orderDate": "2026-10-22T00:00:00.000Z",
      "expectedShipmentDate": "2026-10-25T00:00:00.000Z",
      "items": [
        {
          "item": "673f1d248b9f4a1234567888",
          "name": "Heavy Duty Brake Disc",
          "quantity": 10,
          "rate": 2500,
          "amount": 25000
        }
      ],
      "total": 29500,
      "status": "Confirmed",
      "fulfillmentStatus": "Unfulfilled"
    }
  ]
}
```

#### 2.2 Create Sales Order
- **Method**: `POST`
- **URL**: `/api/v1/inventory/sales/sales-orders`
- **Request Body**:
```json
{
  "customer": "673f1d248b9f4a1234567899",
  "salesOrderNumber": "SO-00042",
  "orderDate": "2026-10-22T00:00:00.000Z",
  "expectedShipmentDate": "2026-10-25T00:00:00.000Z",
  "items": [
    {
      "item": "673f1d248b9f4a1234567888",
      "name": "Heavy Duty Brake Disc",
      "quantity": 10,
      "rate": 2500,
      "taxRate": 18
    }
  ],
  "notes": "Deliver to North Hub Bay"
}
```

#### 2.3 Partial / Full Order Fulfillment
- **Method**: `POST`
- **URL**: `/api/v1/inventory/sales/sales-orders/:id/fulfill`
- **Request Body**:
```json
{
  "items": [
    {
      "itemId": "673f1d248b9f4a1234567888",
      "quantityToFulfill": 6
    }
  ]
}
```
- **Response (`200 OK`)**:
```json
{
  "success": true,
  "data": {
    "originalOrderId": "673f2a1b9f4a123456789002",
    "fulfillmentStatus": "Partially Fulfilled",
    "backorderCreated": true,
    "backorder": {
      "salesOrderNumber": "SO-00042-BO1",
      "status": "Backordered",
      "items": [{ "quantity": 4 }]
    }
  }
}
```

---

### Module 3: Packages & Slips
Generates packing slips, tracks weight and dimensions, and marks warehouse packing completion.

#### 3.1 List Packages
- **Method**: `GET`
- **URL**: `/api/v1/inventory/packages`
- **Query Parameters**:
  | Param | Type | Required | Description |
  | :--- | :--- | :--- | :--- |
  | `status` | `string` | No | `Draft`, `Packed`, `Shipped`, `Delivered`, `Cancelled` |

#### Response (`200 OK`)
```json
{
  "success": true,
  "data": [
    {
      "_id": "673f2a1b9f4a123456789003",
      "packageNumber": "PKG-356067",
      "salesOrderNumber": "SO-00042",
      "customer": "Acme Motors Pvt Ltd",
      "warehouse": "Main Central Warehouse",
      "packageDate": "2026-10-22T07:18:00.000Z",
      "weightKg": 4.5,
      "dimensions": "40x30x20 cm",
      "carrier": "Standard Express",
      "trackingNumber": "TRK-SPINNY-991",
      "status": "Packed",
      "items": [
        {
          "name": "Heavy Duty Brake Disc",
          "quantity": 2,
          "unit": "pcs"
        }
      ]
    }
  ]
}
```

#### 3.2 Create Package
- **Method**: `POST`
- **URL**: `/api/v1/inventory/packages`
- **Request Body**:
```json
{
  "salesOrderNumber": "SO-00042",
  "customer": "Acme Motors Pvt Ltd",
  "warehouse": "Main Central Warehouse",
  "weightKg": 4.5,
  "dimensions": "40x30x20 cm",
  "carrier": "BlueDart Logistics",
  "trackingNumber": "BD-7712399",
  "status": "Packed",
  "items": [
    {
      "name": "Heavy Duty Brake Disc",
      "sku": "BRK-HD-001",
      "quantity": 2,
      "unit": "pcs"
    }
  ],
  "notes": "Packed in double-walled corrugated box"
}
```
- **Response (`201 Created`)**:
```json
{
  "success": true,
  "data": {
    "_id": "673f2a1b9f4a123456789003",
    "packageNumber": "PKG-356067",
    "status": "Packed",
    "createdAt": "2026-10-22T07:18:00.000Z"
  }
}
```

---

### Module 4: Shipments & Tracking
Outbound shipment logistics, carrier integration, tracking numbers, and packing slips.

#### 4.1 List Shipments
- **Method**: `GET`
- **URL**: `/api/v1/inventory/shipments`
- **Query Parameters**:
  | Param | Type | Required | Description |
  | :--- | :--- | :--- | :--- |
  | `status` | `string` | No | `Draft`, `Picked`, `Packed`, `Shipped`, `Delivered`, `Cancelled` |

#### Response (`200 OK`)
```json
{
  "success": true,
  "data": [
    {
      "_id": "673f2a1b9f4a123456789004",
      "shipmentNumber": "SHP-2026-0042",
      "packageNumber": "PKG-356067",
      "customerName": "Acme Motors Pvt Ltd",
      "date": "2026-10-22T07:20:00.000Z",
      "carrier": "BlueDart Express",
      "trackingNumber": "BD-88912301",
      "shippingCost": 350,
      "status": "Shipped",
      "deliveryAddress": "Plot 12, Industrial Area, Sector 5, Gurugram, Haryana"
    }
  ]
}
```

#### 4.2 Create Shipment
- **Method**: `POST`
- **URL**: `/api/v1/inventory/shipments`
- **Request Body**:
```json
{
  "shipmentNumber": "SHP-2026-0042",
  "packageNumber": "PKG-356067",
  "customerName": "Acme Motors Pvt Ltd",
  "carrier": "BlueDart Express",
  "trackingNumber": "BD-88912301",
  "trackingUrl": "https://track.bluedart.com/BD-88912301",
  "shippingCost": 350,
  "shippingMethod": "Air Priority",
  "deliveryAddress": "Plot 12, Industrial Area, Sector 5, Gurugram, Haryana",
  "status": "Shipped"
}
```

#### 4.3 Carrier Integration Mock
- **Method**: `POST`
- **URL**: `/api/v1/inventory/shipments/:id/carrier`
- **Request Body**:
```json
{
  "carrier": "Delhivery Express",
  "serviceLevel": "Surface Express"
}
```
- **Response (`200 OK`)**:
```json
{
  "success": true,
  "trackingNumber": "DLV-987123456",
  "shippingLabelUrl": "https://api.erp.internal/labels/DLV-987123456.pdf"
}
```

---

### Module 5: Delivery Challans
Material movement under GST compliance (Job Work, Supply on Approval, Inter-facility transit).

#### 5.1 List Delivery Challans
- **Method**: `GET`
- **URL**: `/api/v1/inventory/sales/delivery-challans`
- **Query Parameters**:
  | Param | Type | Required | Description |
  | :--- | :--- | :--- | :--- |
  | `status` | `string` | No | `Draft`, `Open`, `Delivered`, `Returned`, `Closed` |

#### Response (`200 OK`)
```json
{
  "success": true,
  "data": [
    {
      "_id": "673f2a1b9f4a123456789005",
      "challanNumber": "DC-00042",
      "challanDate": "2026-10-22T07:22:00.000Z",
      "customer": {
        "_id": "673f1d248b9f4a1234567899",
        "displayName": "Acme Motors Pvt Ltd"
      },
      "challanType": "Job Work",
      "status": "Delivered",
      "total": 15000,
      "ewayBillNumber": "EWB-991283019283"
    }
  ]
}
```

#### 5.2 Create Delivery Challan
- **Method**: `POST`
- **URL**: `/api/v1/inventory/sales/delivery-challans`
- **Request Body**:
```json
{
  "customer": "673f1d248b9f4a1234567899",
  "challanDate": "2026-10-22T07:22:00.000Z",
  "challanType": "Job Work",
  "referenceNumber": "REF-JW-101",
  "ewayBillNumber": "EWB-991283019283",
  "items": [
    {
      "item": "673f1d248b9f4a1234567888",
      "description": "Brake Discs for Precision CNC Turning",
      "quantity": 10,
      "rate": 1500,
      "amount": 15000
    }
  ],
  "total": 15000,
  "status": "Open"
}
```

#### 5.3 Convert Challan to Tax Invoice
- **Method**: `POST`
- **URL**: `/api/v1/inventory/sales/delivery-challans/:id/convert-to-invoice`
- **Response (`201 Created`)**:
```json
{
  "success": true,
  "message": "Delivery Challan converted to Tax Invoice successfully",
  "data": {
    "invoiceId": "673f2a1b9f4a123456789099",
    "invoiceNumber": "INV-00088",
    "total": 17700
  }
}
```

---

### Module 6: Sales Returns (RMA & Reverse Logistics)
Customer return merchandise authorization, quality inspection condition, restock bin allocation, and credit note issuance.

#### 6.1 List Sales Returns (RMA)
- **Method**: `GET`
- **URL**: `/api/v1/inventory/sales/returns`
- **Query Parameters**:
  | Param | Type | Required | Description |
  | :--- | :--- | :--- | :--- |
  | `status` | `string` | No | `RMA Requested`, `RMA Approved`, `Received & Restocked`, `Credit Note Issued`, `Rejected` |
  | `search` | `string` | No | Filter by RMA number or customer |

#### Response (`200 OK`)
```json
{
  "success": true,
  "count": 1,
  "total": 1,
  "data": [
    {
      "_id": "673f2a1b9f4a123456789006",
      "rmaNumber": "RMA-2026-0001",
      "salesOrderNumber": "SO-00042",
      "customerName": "Acme Motors Pvt Ltd",
      "items": [
        {
          "name": "Brake Rotor Disc - Defective",
          "quantity": 1,
          "condition": "Restockable (Good)",
          "restockBin": "BIN-RESTOCK-01"
        }
      ],
      "condition": "Restockable (Good)",
      "status": "RMA Approved",
      "returnDate": "2026-10-22T07:25:00.000Z"
    }
  ]
}
```

#### 6.2 Authorize Return Merchandise Authorization (RMA)
- **Method**: `POST`
- **URL**: `/api/v1/inventory/sales/returns`
- **Request Body**:
```json
{
  "salesOrderNumber": "SO-00042",
  "customerName": "Acme Motors Pvt Ltd",
  "item": "Brake Rotor Disc - Defective",
  "returnQty": 1,
  "condition": "Restockable (Good)",
  "reason": "Customer ordered excess stock",
  "status": "RMA Approved"
}
```
- **Response (`201 Created`)**:
```json
{
  "success": true,
  "data": {
    "_id": "673f2a1b9f4a123456789006",
    "rmaNumber": "RMA-2026-0001",
    "status": "RMA Approved",
    "createdAt": "2026-10-22T07:25:00.000Z"
  }
}
```

#### 6.3 Receive & Restock Returned Goods
- **Method**: `POST`
- **URL**: `/api/v1/inventory/sales/returns/:id/receive`
- **Payload**: None required (`{}`)
- **Response (`200 OK`)**:
```json
{
  "success": true,
  "message": "Items received, inspected, and restocked into inventory",
  "data": {
    "_id": "673f2a1b9f4a123456789006",
    "rmaNumber": "RMA-2026-0001",
    "status": "Received & Restocked",
    "receivedBy": "warehouse_inspector@spinny.com",
    "receivedAt": "2026-10-22T07:26:15.000Z"
  }
}
```

---

### Module 7: Customers
Customer master catalog, credit limit controls, transaction history, and account statements.

#### 7.1 List Customers
- **Method**: `GET`
- **URL**: `/api/v1/inventory/sales/customers`
- **Query Parameters**:
  | Param | Type | Required | Description |
  | :--- | :--- | :--- | :--- |
  | `status` | `string` | No | `Active`, `Inactive` |
  | `search` | `string` | No | Search across name, email, company, and phone |

#### Response (`200 OK`)
```json
{
  "success": true,
  "data": [
    {
      "_id": "673f1d248b9f4a1234567899",
      "displayName": "Acme Motors Pvt Ltd",
      "companyName": "Acme Corporation",
      "email": "procurement@acme.com",
      "phone": "+91 9811223344",
      "receivables": 45000,
      "unusedCredits": 2500,
      "currency": "INR",
      "status": "Active"
    }
  ]
}
```

#### 7.2 Create Customer
- **Method**: `POST`
- **URL**: `/api/v1/inventory/sales/customers`
- **Request Body**:
```json
{
  "customerType": "business",
  "displayName": "Acme Motors Pvt Ltd",
  "companyName": "Acme Corporation",
  "email": "procurement@acme.com",
  "phone": "+91 9811223344",
  "currency": "INR",
  "paymentTerms": "net30",
  "billingAddress": {
    "street": "Plot 12, Sector 5",
    "city": "Gurugram",
    "state": "Haryana",
    "zipCode": "122001",
    "country": "India"
  },
  "gstin": "06AAAAA0000A1Z5"
}
```

#### 7.3 Get Customer Statement & Transactions
- **Method**: `GET`
- **URL**: `/api/v1/inventory/sales/customers/:id/statement`
- **Query Parameters**:
  * `startDate` (ISO string)
  * `endDate` (ISO string)
- **Response (`200 OK`)**:
```json
{
  "success": true,
  "data": {
    "customerId": "673f1d248b9f4a1234567899",
    "openingBalance": 0,
    "invoicedAmount": 54500,
    "paidAmount": 9500,
    "balanceDue": 45000,
    "transactions": [
      {
        "date": "2026-10-20",
        "type": "Invoice",
        "reference": "INV-00088",
        "amount": 54500,
        "balance": 45000
      }
    ]
  }
}
```
