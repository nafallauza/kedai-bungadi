import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import './index.css';
import { SessionProvider } from './lib/session';
import { CustomerLayout, RequireTable, StaffLayout } from './components/layouts';
import LandingPage from './pages/LandingPage';
import DemoPage from './pages/DemoPage';
import StaffLoginPage from './pages/StaffLoginPage';
import NotFoundPage from './pages/NotFoundPage';
import { ScanPage, TableEntryPage } from './pages/customer/TablePages';
import MenuPage from './pages/customer/MenuPage';
import CartPage from './pages/customer/CartPage';
import PaymentPage from './pages/customer/PaymentPage';
import { MyOrdersPage, OrderStatusPage } from './pages/customer/OrderPages';
import CashierPage from './pages/staff/CashierPage';
import SummaryPage from './pages/admin/SummaryPage';
import MenuAdminPage from './pages/admin/MenuAdminPage';
import TablesPage from './pages/admin/TablesPage';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <SessionProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/demo" element={<DemoPage />} />
          <Route path="/masuk" element={<StaffLoginPage />} />

          {/* Pelanggan: /menu terbuka untuk umum; keranjang & pembayaran wajib scan QR meja */}
          <Route element={<CustomerLayout />}>
            <Route path="/pesan" element={<ScanPage />} />
            <Route path="/meja/:code" element={<TableEntryPage />} />
            <Route path="/menu" element={<MenuPage />} />
            <Route element={<RequireTable />}>
              <Route path="/keranjang" element={<CartPage />} />
              <Route path="/pembayaran" element={<PaymentPage />} />
            </Route>
            <Route path="/pesanan" element={<MyOrdersPage />} />
            <Route path="/pesanan/:id" element={<OrderStatusPage />} />
          </Route>

          {/* Staf kedai: kasir/dapur & admin (dilindungi gerbang masuk staf) */}
          <Route element={<StaffLayout />}>
            <Route path="/kasir" element={<CashierPage />} />
            <Route path="/admin" element={<SummaryPage />} />
            <Route path="/admin/menu" element={<MenuAdminPage />} />
            <Route path="/admin/meja" element={<TablesPage />} />
          </Route>

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </SessionProvider>
  </StrictMode>,
);
