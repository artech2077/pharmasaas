# API Specification
```yaml
openapi: 3.0.3
info:
  title: PharmaSaaS API
  version: 1.0.0
  description: >
    REST APIs that power reconciliation, inventory, forecasting, and compliance workflows.
    All requests require Clerk-issued bearer tokens and tenant scoping headers.
servers:
  - url: https://api.pharmasaas.com
    description: Production
  - url: https://staging.api.pharmasaas.com
    description: Staging sandbox
security:
  - bearerAuth: []
  - clerkSession: []
paths:
  /api/cash-sessions:
    get:
      summary: List cash sessions for current tenant
      parameters:
        - in: query
          name: status
          schema:
            type: string
            enum: [open, pending_reconciliation, closed]
        - in: query
          name: from
          schema:
            type: string
            format: date-time
        - in: query
          name: to
          schema:
            type: string
            format: date-time
      responses:
        '200':
          description: Cash sessions
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/CashSessionList'
    post:
      summary: Open a new cash session
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/OpenCashSessionRequest'
      responses:
        '201':
          description: Session created
          headers:
            Location:
              schema:
                type: string
        '409':
          description: Session already open for register
  /api/cash-sessions/{sessionId}:
    get:
      summary: Get session details
      parameters:
        - $ref: '#/components/parameters/SessionId'
      responses:
        '200':
          description: Session detail
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/CashSession'
  /api/cash-sessions/{sessionId}/close:
    post:
      summary: Close session and move to reconciliation
      parameters:
        - $ref: '#/components/parameters/SessionId'
      responses:
        '202':
          description: Session pending reconciliation
  /api/reconciliations:
    post:
      summary: Start reconciliation on a cash session
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/CreateReconciliationRequest'
      responses:
        '201':
          description: Reconciliation started
    get:
      summary: List reconciliation records
      responses:
        '200':
          description: Reconciliation collection
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReconciliationList'
  /api/reconciliations/{reconciliationId}:
    patch:
      summary: Append resolution steps
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/AddResolutionStepRequest'
      responses:
        '200':
          description: Updated reconciliation
    post:
      summary: Submit reconciliation for approval / closure
      responses:
        '202':
          description: Submitted for approval
  /api/inventory/items:
    get:
      summary: Search inventory catalog
      parameters:
        - in: query
          name: q
          schema:
            type: string
        - in: query
          name: status
          schema:
            type: string
            enum: [healthy, low, critical, out]
      responses:
        '200':
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/InventoryItemList'
    post:
      summary: Create or import inventory item
      requestBody:
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/CreateInventoryItemRequest'
      responses:
        '201':
          description: Item created
  /api/inventory/items/{itemId}:
    patch:
      summary: Update pricing/metadata
      requestBody:
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/UpdateInventoryItemRequest'
      responses:
        '200':
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/InventoryItem'
  /api/inventory/items/{itemId}/counts:
    post:
      summary: Record stock count or adjustment
      requestBody:
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/InventoryAdjustmentRequest'
      responses:
        '201':
          description: Adjustment logged
  /api/forecasts/snapshots:
    get:
      summary: Retrieve forecast snapshots for dashboard
      parameters:
        - in: query
          name: horizonDays
          schema:
            type: integer
            default: 7
      responses:
        '200':
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ForecastSnapshotList'
  /api/forecasts/feedback:
    post:
      summary: Capture feedback on forecast accuracy
      requestBody:
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/ForecastFeedbackRequest'
      responses:
        '202':
          description: Feedback accepted
  /api/supplier-orders:
    post:
      summary: Create supplier order
      requestBody:
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/CreateSupplierOrderRequest'
      responses:
        '201':
          description: Order created
    get:
      summary: List supplier orders
      responses:
        '200':
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/SupplierOrderList'
  /api/supplier-orders/{orderId}/receive:
    post:
      summary: Receive goods and update batches
      requestBody:
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/ReceiveSupplierOrderRequest'
      responses:
        '200':
          description: Receipt processed
  /api/reports/cash-journal:
    get:
      summary: Generate cash journal report
      parameters:
        - in: query
          name: date
          required: true
          schema:
            type: string
            format: date
      responses:
        '200':
          description: Report download link
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReportLink'
  /api/audit-log:
    get:
      summary: Query audit trail
      parameters:
        - in: query
          name: eventType
          schema:
            type: string
        - in: query
          name: from
          schema:
            type: string
            format: date-time
        - in: query
          name: to
          schema:
            type: string
            format: date-time
      responses:
        '200':
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/AuditLogList'
components:
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT
    clerkSession:
      type: apiKey
      in: header
      name: Clerk-Session-Id
  parameters:
    SessionId:
      in: path
      name: sessionId
      required: true
      schema:
        type: string
    ReconciliationId:
      in: path
      name: reconciliationId
      required: true
      schema:
        type: string
  schemas:
    CashSession:
      type: object
      required: [id, tenantId, status, expectedTotals]
      properties:
        id:
          type: string
        tenantId:
          type: string
        status:
          type: string
          enum: [open, pending_reconciliation, closed]
        openedAt:
          type: string
          format: date-time
        expectedTotals:
          $ref: '#/components/schemas/CashBreakdown'
        offlineTransactionCount:
          type: integer
    CashSessionList:
      type: object
      properties:
        data:
          type: array
          items:
            $ref: '#/components/schemas/CashSession'
    CashBreakdown:
      type: object
      properties:
        madCash:
          type: number
          format: float
        card:
          type: number
          format: float
        mobileWallet:
          type: number
          format: float
        other:
          type: number
          format: float
    OpenCashSessionRequest:
      type: object
      required: [registerId, openingFloat]
      properties:
        registerId:
          type: string
        openingFloat:
          $ref: '#/components/schemas/CashBreakdown'
    Reconciliation:
      type: object
      required: [id, cashSessionId, status, variance]
      properties:
        id:
          type: string
        cashSessionId:
          type: string
        status:
          type: string
          enum: [draft, escalated, closed]
        countedTotals:
          $ref: '#/components/schemas/CashBreakdown'
        variance:
          type: number
          format: float
        resolutionSteps:
          type: array
          items:
            $ref: '#/components/schemas/ReconciliationStep'
    ReconciliationStep:
      type: object
      required: [type, description, amountImpact]
      properties:
        type:
          type: string
          enum: [adjustment, transaction_fix, escalation, write_off]
        description:
          type: string
        amountImpact:
          type: number
        performedBy:
          type: string
        performedAt:
          type: string
          format: date-time
    CreateReconciliationRequest:
      type: object
      required: [cashSessionId, countedTotals]
      properties:
        cashSessionId:
          type: string
        countedTotals:
          $ref: '#/components/schemas/CashBreakdown'
        notes:
          type: string
    AddResolutionStepRequest:
      type: object
      required: [step]
      properties:
        step:
          $ref: '#/components/schemas/ReconciliationStep'
    InventoryItem:
      type: object
      required: [id, name, category, currentStock]
      properties:
        id:
          type: string
        name:
          type: string
        category:
          type: string
        barcode:
          type: string
        stockStatus:
          type: string
          enum: [healthy, low, critical, out]
        reorderPoint:
          type: integer
        reorderQuantity:
          type: integer
        unitCost:
          type: number
        retailPrice:
          type: number
    InventoryItemList:
      type: object
      properties:
        data:
          type: array
          items:
            $ref: '#/components/schemas/InventoryItem'
    CreateInventoryItemRequest:
      type: object
      required: [name, category, unitCost, retailPrice]
      properties:
        name:
          type: string
        frenchLabel:
          type: string
        category:
          type: string
        reorderPoint:
          type: integer
        reorderQuantity:
          type: integer
        unitCost:
          type: number
        retailPrice:
          type: number
        expiryTracked:
          type: boolean
    UpdateInventoryItemRequest:
      type: object
      properties:
        reorderPoint:
          type: integer
        reorderQuantity:
          type: integer
        unitCost:
          type: number
        retailPrice:
          type: number
        status:
          type: string
    InventoryAdjustmentRequest:
      type: object
      required: [quantityDelta, reason]
      properties:
        quantityDelta:
          type: integer
        reason:
          type: string
          enum: [count, damage, expiry, correction]
        note:
          type: string
    ForecastSnapshot:
      type: object
      required: [id, inventoryItemId, expectedDemand]
      properties:
        id:
          type: string
        inventoryItemId:
          type: string
        generatedAt:
          type: string
          format: date-time
        horizonDays:
          type: integer
        expectedDemand:
          type: number
          format: float
        confidenceLow:
          type: number
        confidenceHigh:
          type: number
        recommendedOrderQty:
          type: number
        rationale:
          type: string
    ForecastSnapshotList:
      type: object
      properties:
        data:
          type: array
          items:
            $ref: '#/components/schemas/ForecastSnapshot'
    ForecastFeedbackRequest:
      type: object
      required: [snapshotId, verdict]
      properties:
        snapshotId:
          type: string
        verdict:
          type: string
          enum: [accurate, under, over]
        comment:
          type: string
    SupplierOrder:
      type: object
      required: [id, supplierId, status, totalAmount]
      properties:
        id:
          type: string
        supplierId:
          type: string
        status:
          type: string
          enum: [draft, submitted, partially_received, closed, cancelled]
        expectedDeliveryDate:
          type: string
          format: date
        totalAmount:
          type: number
        lineItems:
          type: array
          items:
            $ref: '#/components/schemas/SupplierOrderLine'
    SupplierOrderLine:
      type: object
      properties:
        inventoryItemId:
          type: string
        quantityOrdered:
          type: integer
        quantityReceived:
          type: integer
        unitCost:
          type: number
        batchNumber:
          type: string
    SupplierOrderList:
      type: object
      properties:
        data:
          type: array
          items:
            $ref: '#/components/schemas/SupplierOrder'
    CreateSupplierOrderRequest:
      type: object
      required: [supplierId, lineItems]
      properties:
        supplierId:
          type: string
        lineItems:
          type: array
          items:
            $ref: '#/components/schemas/SupplierOrderLine'
    ReceiveSupplierOrderRequest:
      type: object
      required: [deliveryDate, lineItems]
      properties:
        deliveryDate:
          type: string
          format: date
        lineItems:
          type: array
          items:
            type: object
            required: [lineId, quantityReceived, expiryDate]
            properties:
              lineId:
                type: string
              quantityReceived:
                type: integer
              expiryDate:
                type: string
                format: date
              batchNumber:
                type: string
    ReportLink:
      type: object
      required: [url, expiresAt]
      properties:
        url:
          type: string
          format: uri
        expiresAt:
          type: string
          format: date-time
    AuditLogEntry:
      type: object
      required: [id, eventType, performedBy, performedAt]
      properties:
        id:
          type: string
        eventType:
          type: string
        performedBy:
          type: string
        performedAt:
          type: string
          format: date-time
        resourceType:
          type: string
        resourceId:
          type: string
        metadata:
          type: object
          additionalProperties: true
        hash:
          type: string
    AuditLogList:
      type: object
      properties:
        data:
          type: array
          items:
            $ref: '#/components/schemas/AuditLogEntry'
```
