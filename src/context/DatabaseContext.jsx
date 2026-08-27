import React, { createContext, useContext, useState, useEffect } from 'react';
import { database, ref, onValue, set, isFirebaseConfigured } from '../firebase';
import { aggregateProductSales, aggregateCustomerStats, generateAnalyticsData } from '../utils/formatters';
import { detectCartAnomalies } from '../utils/anomalyDetector';

const DatabaseContext = createContext();

// Sample seed data generator (Only used if user explicitly clicks "Seed Data")
export const MOCK_SEED_DATA = {
  purchases: {
    'TX-1001': {
      customerID: 'CUST-8041',
      trolleyID: 'TR-01',
      total: 84.50,
      timestamp: Date.now() - 1000 * 60 * 15,
      paymentStatus: 'Completed',
      products: {
        'P-101': { name: 'Organic Milk 1L', price: 4.50, quantity: 2 },
        'P-102': { name: 'Whole Wheat Bread', price: 3.20, quantity: 1 },
      }
    }
  },
  trolleys: {
    'TR-01': { trolleyID: 'TR-01', status: 'Online', currentCustomerID: 'CUST-8041', lastActivity: Date.now(), batteryLevel: 95, activeItemCount: 2 },
  },
  inventory: {
    'P-101': { code: 'P-101', name: 'Organic Milk 1L', price: 4.50, stock: 45, lowStockThreshold: 15, category: 'Dairy' },
  }
};

export const DatabaseProvider = ({ children }) => {
  const [purchases, setPurchases] = useState([]);
  const [trolleys, setTrolleys] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isUsingFallback, setIsUsingFallback] = useState(false);
  const [lowStockThreshold, setLowStockThreshold] = useState(10);

  // Initialize Pure Realtime Listeners
  useEffect(() => {
    let unsubscribePurchases = null;
    let unsubscribeTrolleys = null;
    let unsubscribeInventory = null;

    if (database) {
      setLoading(true);
      setError(null);

      try {
        // Purchases Real-Time Listener
        const purchasesRef = ref(database, 'purchases');
        unsubscribePurchases = onValue(
          purchasesRef,
          (snapshot) => {
            setIsConnected(true);
            setIsUsingFallback(false);
            if (snapshot.exists()) {
              const data = snapshot.val();
              const list = Object.keys(data).map((key) => ({
                id: key,
                transactionId: key,
                ...data[key],
              }));
              setPurchases(list);
            } else {
              setPurchases([]); // Empty real database = 0 purchases (No dummy data!)
            }
            setLoading(false);
          },
          (err) => {
            console.error('Firebase Purchases Listener Error:', err);
            setError(err.message || 'Firebase Database Permission Denied or Connection Failure.');
            setIsConnected(false);
            setLoading(false);
          }
        );

        // Trolleys Real-Time Listener
        const trolleysRef = ref(database, 'trolleys');
        unsubscribeTrolleys = onValue(
          trolleysRef,
          (snapshot) => {
            if (snapshot.exists()) {
              const data = snapshot.val();
              const list = Object.keys(data).map((key) => ({
                id: key,
                trolleyID: key,
                ...data[key],
              }));
              setTrolleys(list);
            } else {
              setTrolleys([]);
            }
          },
          (err) => console.warn('Firebase Trolleys listener warning:', err)
        );

        // Inventory Real-Time Listener
        const inventoryRef = ref(database, 'inventory');
        unsubscribeInventory = onValue(
          inventoryRef,
          (snapshot) => {
            if (snapshot.exists()) {
              const data = snapshot.val();
              const list = Object.keys(data).map((key) => ({
                id: key,
                code: key,
                ...data[key],
              }));
              setInventory(list);
            } else {
              setInventory([]);
            }
          },
          (err) => console.warn('Firebase Inventory listener warning:', err)
        );
      } catch (err) {
        console.error('Firebase setup exception:', err);
        setError(err.message);
        setLoading(false);
      }
    } else {
      setIsConnected(false);
      setLoading(false);
    }

    return () => {
      if (unsubscribePurchases) unsubscribePurchases();
      if (unsubscribeTrolleys) unsubscribeTrolleys();
      if (unsubscribeInventory) unsubscribeInventory();
    };
  }, []);

  // Manual seed utility (Only triggers on explicit user button click)
  const seedFirebaseDatabase = async () => {
    if (!database) {
      throw new Error('Firebase Database is not initialized. Please click "Firebase Config" to set your URL & API Key.');
    }
    setLoading(true);
    try {
      await set(ref(database, 'purchases'), MOCK_SEED_DATA.purchases);
      await set(ref(database, 'trolleys'), MOCK_SEED_DATA.trolleys);
      await set(ref(database, 'inventory'), MOCK_SEED_DATA.inventory);
      setIsUsingFallback(false);
      setIsConnected(true);
      setLoading(false);
      return { success: true, message: 'Firebase Realtime Database successfully seeded!' };
    } catch (err) {
      setLoading(false);
      console.error('Failed to seed Firebase:', err);
      throw new Error(err.message || 'Firebase write failed. Ensure Database Security Rules permit read/write.');
    }
  };

  // Derived Realtime Calculations
  const todayTimestamp = new Date().setHours(0, 0, 0, 0);

  const todayPurchases = purchases.filter((tx) => {
    const txTime = new Date(tx.timestamp).getTime();
    return txTime >= todayTimestamp || isNaN(txTime);
  });

  const todaySales = todayPurchases.reduce((acc, tx) => acc + Number(tx.total || 0), 0);
  const totalSales = purchases.reduce((acc, tx) => acc + Number(tx.total || 0), 0);
  
  const customerSet = new Set(purchases.map((tx) => tx.customerID).filter(Boolean));
  const totalCustomers = customerSet.size;

  const totalItemsSold = purchases.reduce((acc, tx) => {
    if (!tx.products) return acc;
    const prods = Object.values(tx.products);
    return acc + prods.reduce((sum, p) => sum + Number(p.quantity || 0), 0);
  }, 0);

  const totalTransactions = purchases.length;

  const activeTrolleysList = trolleys.filter((t) => t.status === 'Online');

  const lowStockProducts = inventory.filter((prod) => {
    const threshold = prod.lowStockThreshold || lowStockThreshold;
    return Number(prod.stock || 0) <= threshold;
  });

  const anomalies = detectCartAnomalies(purchases);

  const productMetrics = aggregateProductSales(purchases);
  const customerMetrics = aggregateCustomerStats(purchases);
  const analyticsData = generateAnalyticsData(purchases);

  const value = {
    purchases,
    trolleys,
    inventory,
    loading,
    error,
    isConnected,
    isUsingFallback,
    todaySales,
    totalSales,
    totalCustomers,
    totalItemsSold,
    totalTransactions,
    activeTrolleysCount: activeTrolleysList.length,
    activeTrolleys: activeTrolleysList,
    lowStockProducts,
    lowStockThreshold,
    setLowStockThreshold,
    anomalies,
    productMetrics,
    customerMetrics,
    analyticsData,
    seedFirebaseDatabase,
    isFirebaseConfigured,
  };

  return <DatabaseContext.Provider value={value}>{children}</DatabaseContext.Provider>;
};

export const useDatabase = () => {
  const context = useContext(DatabaseContext);
  if (!context) {
    throw new Error('useDatabase must be used within a DatabaseProvider');
  }
  return context;
};
