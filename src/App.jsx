import React, { useState } from 'react';
import { DatabaseProvider } from './context/DatabaseContext';
import { Layout } from './components/layout/Layout';
import { OverviewPage } from './pages/Overview';
import { TransactionsPage } from './pages/Transactions';
import { CustomersPage } from './pages/Customers';
import { ProductsPage } from './pages/Products';
import { AnalyticsPage } from './pages/Analytics';
import { TrolleysPage } from './pages/Trolleys';
import { AlertsPage } from './pages/Alerts';

export function App() {
  const [activeTab, setActiveTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');

  const handleNavigate = (tab) => {
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderCurrentPage = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewPage onNavigate={handleNavigate} />;
      case 'transactions':
        return <TransactionsPage searchQuery={searchQuery} />;
      case 'customers':
        return <CustomersPage />;
      case 'products':
        return <ProductsPage />;
      case 'analytics':
        return <AnalyticsPage />;
      case 'trolleys':
        return <TrolleysPage />;
      case 'alerts':
        return <AlertsPage />;
      default:
        return <OverviewPage onNavigate={handleNavigate} />;
    }
  };

  return (
    <DatabaseProvider>
      <Layout 
        activeTab={activeTab} 
        setActiveTab={setActiveTab}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      >
        {renderCurrentPage()}
      </Layout>
    </DatabaseProvider>
  );
}

export default App;
