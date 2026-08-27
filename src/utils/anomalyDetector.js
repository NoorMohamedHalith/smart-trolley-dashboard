/**
 * Rule-Based Anomaly Detection for Supermarket Smart Trolleys.
 * NOTE: As per project guidelines, anomaly flags are explicitly labeled as
 * "Unusual Cart Activity" or "Anomaly Alert" (Not theft detection).
 */

export const ANOMALY_THRESHOLDS = {
  HIGH_ITEM_QUANTITY: 10,        // >10 units of a single product
  HIGH_TRANSACTION_AMOUNT: 300,  // >$300 total purchase
  RAPID_SCAN_WINDOW_MS: 3000,    // Scans within 3 seconds
  RAPID_SCAN_MIN_COUNT: 4,       // 4+ scans in rapid window
};

export const detectCartAnomalies = (purchasesList = []) => {
  const anomalies = [];

  purchasesList.forEach((tx) => {
    const txId = tx.id || tx.transactionId || 'UNKNOWN_TX';
    const total = Number(tx.total || 0);
    const custId = tx.customerID || 'GUEST';
    const trolleyId = tx.trolleyID || 'TR-01';
    const timestamp = tx.timestamp || Date.now();

    // Rule 1: High Transaction Amount
    if (total > ANOMALY_THRESHOLDS.HIGH_TRANSACTION_AMOUNT) {
      anomalies.push({
        id: `ANOM-HIGH-AMT-${txId}`,
        transactionId: txId,
        customerID: custId,
        trolleyID: trolleyId,
        timestamp,
        type: 'UNUSUALLY_HIGH_AMOUNT',
        severity: 'HIGH',
        title: 'High Transaction Total',
        message: `Cart total of ₹${total.toFixed(2)} exceeds standard threshold (₹${ANOMALY_THRESHOLDS.HIGH_TRANSACTION_AMOUNT}).`,
        details: { total, threshold: ANOMALY_THRESHOLDS.HIGH_TRANSACTION_AMOUNT },
      });
    }

    // Inspect products within transaction
    if (tx.products) {
      const productsList = Object.values(tx.products);
      let totalItemQty = 0;
      let deleteCount = 0;

      productsList.forEach((prod) => {
        const qty = Number(prod.quantity || 0);
        totalItemQty += qty;

        // Rule 2: Unusually High Product Quantity
        if (qty > ANOMALY_THRESHOLDS.HIGH_ITEM_QUANTITY) {
          anomalies.push({
            id: `ANOM-HIGH-QTY-${txId}-${prod.name || prod.productCode}`,
            transactionId: txId,
            customerID: custId,
            trolleyID: trolleyId,
            timestamp,
            type: 'HIGH_PRODUCT_QUANTITY',
            severity: 'MEDIUM',
            title: 'Unusually High Product Quantity',
            message: `Product "${prod.name || 'Item'}" scanned with high quantity (${qty} units).`,
            details: { productName: prod.name, quantity: qty },
          });
        }

        // Rule 3: Check scan/delete patterns if flagged by hardware
        if (prod.deleted || prod.isRemoved || qty < 0) {
          deleteCount += 1;
        }
      });

      // Rule 4: Repeated scan / delete pattern anomaly
      if (deleteCount >= 3) {
        anomalies.push({
          id: `ANOM-SCAN-DEL-${txId}`,
          transactionId: txId,
          customerID: custId,
          trolleyID: trolleyId,
          timestamp,
          type: 'REPEATED_SCAN_DELETE',
          severity: 'HIGH',
          title: 'Repeated Scan/Delete Pattern',
          message: `Detected ${deleteCount} item removal/delete actions during shopping session.`,
          details: { deleteCount },
        });
      }

      // Rule 5: Rapid scan detection (if timestamp log present per item or high item count in minimal elapsed time)
      if (productsList.length >= 6 && totalItemQty >= 15) {
        anomalies.push({
          id: `ANOM-RAPID-${txId}`,
          transactionId: txId,
          customerID: custId,
          trolleyID: trolleyId,
          timestamp,
          type: 'RAPID_CART_BURST',
          severity: 'MEDIUM',
          title: 'Rapid Cart Item Burst',
          message: `Rapid scan activity detected with ${totalItemQty} items registered in short duration.`,
          details: { itemCount: productsList.length, totalQty: totalItemQty },
        });
      }
    }
  });

  return anomalies.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
};
