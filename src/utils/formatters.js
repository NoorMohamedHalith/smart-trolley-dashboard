/**
 * Utility functions for formatting currencies, dates, and aggregating database structures.
 */

// Format monetary values
export const formatCurrency = (amount) => {
  const numericAmount = typeof amount === 'number' ? amount : parseFloat(amount) || 0;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numericAmount);
};

// Format timestamps into readable date & time
export const formatDate = (timestamp) => {
  if (!timestamp) return 'N/A';
  let date;
  if (typeof timestamp === 'number') {
    date = new Date(timestamp);
  } else if (typeof timestamp === 'string') {
    date = new Date(timestamp);
    if (isNaN(date.getTime())) {
      date = new Date(parseInt(timestamp) || Date.now());
    }
  } else {
    date = new Date();
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).format(date);
};

// Relative time formatter (e.g. "3 mins ago")
export const formatRelativeTime = (timestamp) => {
  if (!timestamp) return 'Unknown';
  let timeMs = typeof timestamp === 'number' ? timestamp : new Date(timestamp).getTime();
  if (isNaN(timeMs)) return 'Unknown';

  const diffSeconds = Math.floor((Date.now() - timeMs) / 1000);
  if (diffSeconds < 10) return 'Just now';
  if (diffSeconds < 60) return `${diffSeconds}s ago`;
  
  const diffMinutes = Math.floor(diffSeconds / 60);
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;

  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
};

// Aggregate purchases into product metrics
export const aggregateProductSales = (purchasesList = []) => {
  const map = {};

  purchasesList.forEach((tx) => {
    if (!tx.products) return;
    const productsObj = tx.products;
    Object.keys(productsObj).forEach((pCode) => {
      const prod = productsObj[pCode];
      const code = pCode || prod.productCode || prod.id || 'UNKNOWN';
      const name = prod.name || code;
      const qty = Number(prod.quantity || 0);
      const price = Number(prod.price || 0);
      const revenue = qty * price;

      if (!map[code]) {
        map[code] = {
          code,
          name,
          price,
          totalQtySold: 0,
          totalRevenue: 0,
          transactionCount: 0,
        };
      }
      map[code].totalQtySold += qty;
      map[code].totalRevenue += revenue;
      map[code].transactionCount += 1;
    });
  });

  return Object.values(map).sort((a, b) => b.totalQtySold - a.totalQtySold);
};

// Aggregate purchases into customer profile metrics
export const aggregateCustomerStats = (purchasesList = []) => {
  const map = {};

  purchasesList.forEach((tx) => {
    const custId = tx.customerID || 'GUEST';
    const amount = Number(tx.total || 0);
    const ts = tx.timestamp || Date.now();

    if (!map[custId]) {
      map[custId] = {
        customerID: custId,
        purchaseCount: 0,
        totalSpent: 0,
        lastPurchaseTimestamp: ts,
        lastTrolleyID: tx.trolleyID || 'TR-01',
        history: [],
      };
    }

    map[custId].purchaseCount += 1;
    map[custId].totalSpent += amount;
    map[custId].history.push(tx);

    const txTime = new Date(ts).getTime();
    const currLastTime = new Date(map[custId].lastPurchaseTimestamp).getTime();
    if (txTime > currLastTime) {
      map[custId].lastPurchaseTimestamp = ts;
    }
  });

  return Object.values(map).sort((a, b) => b.totalSpent - a.totalSpent);
};

// Group transactions by days / weeks / months for analytics charts
export const generateAnalyticsData = (purchasesList = []) => {
  if (!purchasesList.length) {
    return { daily: [], weekly: [], monthly: [], customerVolume: [], atvTrend: [] };
  }

  // Sort chronologically
  const sorted = [...purchasesList].sort((a, b) => {
    return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
  });

  const dailyMap = {};
  const monthlyMap = {};

  sorted.forEach((tx) => {
    const dateObj = new Date(tx.timestamp || Date.now());
    const dayKey = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const monthKey = dateObj.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
    const amount = Number(tx.total || 0);

    // Daily
    if (!dailyMap[dayKey]) {
      dailyMap[dayKey] = { date: dayKey, sales: 0, transactions: 0, customers: new Set() };
    }
    dailyMap[dayKey].sales += amount;
    dailyMap[dayKey].transactions += 1;
    if (tx.customerID) dailyMap[dayKey].customers.add(tx.customerID);

    // Monthly
    if (!monthlyMap[monthKey]) {
      monthlyMap[monthKey] = { month: monthKey, sales: 0, transactions: 0 };
    }
    monthlyMap[monthKey].sales += amount;
    monthlyMap[monthKey].transactions += 1;
  });

  const dailyArray = Object.keys(dailyMap).map((key) => ({
    date: key,
    sales: Number(dailyMap[key].sales.toFixed(2)),
    transactions: dailyMap[key].transactions,
    customers: dailyMap[key].customers.size,
    avgTransactionValue: Number((dailyMap[key].sales / (dailyMap[key].transactions || 1)).toFixed(2)),
  }));

  const monthlyArray = Object.keys(monthlyMap).map((key) => ({
    month: key,
    sales: Number(monthlyMap[key].sales.toFixed(2)),
    transactions: monthlyMap[key].transactions,
    avgTransactionValue: Number((monthlyMap[key].sales / (monthlyMap[key].transactions || 1)).toFixed(2)),
  }));

  return {
    daily: dailyArray,
    monthly: monthlyArray,
  };
};
