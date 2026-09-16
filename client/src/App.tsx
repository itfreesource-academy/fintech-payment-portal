import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';

import { DashboardPage } from './pages/DashboardPage';
import { KycPage } from './pages/KycPage';
import { AmlPage } from './pages/AmlPage';
import { FraudPage } from './pages/FraudPage';
import { BankingPage } from './pages/BankingPage';
import { InsurancePage } from './pages/InsurancePage';
import { PiiVaultPage } from './pages/PiiVaultPage';
import { PlaygroundPage } from './pages/PlaygroundPage';
import { SwaggerPage } from './pages/SwaggerPage';

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
          <Navbar />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/kyc" element={<KycPage />} />
              <Route path="/aml" element={<AmlPage />} />
              <Route path="/fraud" element={<FraudPage />} />
              <Route path="/banking" element={<BankingPage />} />
              <Route path="/insurance" element={<InsurancePage />} />
              <Route path="/pii" element={<PiiVaultPage />} />
              <Route path="/playground" element={<PlaygroundPage />} />
              <Route path="/docs" element={<SwaggerPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
