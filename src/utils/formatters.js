/**
 * Utility functions for formatting currencies (Indian Rupee ₹), dates, and aggregating database structures.
 */

// Format monetary values to Indian Rupee (₹)
export const formatCurrency = (amount) => {
  const numericAmount = typeof amount === 'number' ? amount : parseFloat(amount) || 0;
  return `₹${numericAmount.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

// Format timestamps into readable date & time (Handles Unix timestamps, ISO strings, seconds, milliseconds)
export const formatDate = (timestamp) => {
  if (!timestamp) {
    return new Intl.DateTimeFormat('en-IN', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }).format(new Date());
  }

  let date;
  if (typeof timestamp === 'number') {
    // If timestamp is in seconds (10 digits), convert to milliseconds
    const timeMs = timestamp < 10000000000 ? timestamp * 1000 : timestamp;
    date = new Date(timeMs);
  } else if (typeof timestamp === 'string') {
    const trimmed = timestamp.trim();
    const parsedNum = parseFloat(trimmed);
    if (!isNaN(parsedNum) && /^\d+$/.test(trimmed)) {
      const timeMs = parsedNum < 10000000000 ? parsedNum * 1000 : parsedNum;
      date = new Date(timeMs);
    } else {
      date = new Date(trimmed);
    }
  } else if (timestamp instanceof Date) {
    date = timestamp;
  } else {
    date = new Date();
  }

  if (isNaN(date.getTime())) {
    date = new Date(); // Robust fallback to current date/time if parsing fails
  }

  return new Intl.DateTimeFormat('en-IN', {
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
  if (!timestamp) return 'Just now';
  let timeMs;

  if (typeof timestamp === 'number') {
    timeMs = timestamp < 10000000000 ? timestamp * 1000 : timestamp;
  } else if (typeof timestamp === 'string') {
    const trimmed = timestamp.trim();
    const parsedNum = parseFloat(trimmed);
    if (!isNaN(parsedNum) && /^\d+$/.test(trimmed)) {
      timeMs = parsedNum < 10000000000 ? parsedNum * 1000 : parsedNum;
    } else {
      timeMs = new Date(trimmed).getTime();
    }
  } else {
    timeMs = Date.now();
  }

  if (isNaN(timeMs)) return 'Just now';

  const diffSeconds = Math.floor((Date.now() - timeMs) / 1000);
  if (diffSeconds < 10 || diffSeconds < 0) return 'Just now';
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
    if (isNaN(currLastTime) || txTime > currLastTime) {
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

  const sorted = [...purchasesList].sort((a, b) => {
    const timeA = new Date(a.timestamp).getTime() || 0;
    const timeB = new Date(b.timestamp).getTime() || 0;
    return timeA - timeB;
  });

  const dailyMap = {};
  const monthlyMap = {};

  sorted.forEach((tx) => {
    let dateObj = new Date(tx.timestamp);
    if (isNaN(dateObj.getTime())) dateObj = new Date();

    const dayKey = dateObj.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
    const monthKey = dateObj.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' });
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
