
import React, { useState, useEffect } from 'react';
import { ViewMode, MaintenanceRequest, RequestStatus } from './types';
import { notifyNewRequest, notifyStatusUpdate } from './services/telegramService';
import { apiService, SCRIPT_URL } from './services/apiService';
import UserPage from './components/UserPage';
import LoginPage from './components/LoginPage';
import AdminDashboard from './components/AdminDashboard';
import Sidebar from './components/Sidebar';

const App: React.FC = () => {
  const [view, setView] = useState<ViewMode>('USER');
  const [requests, setRequests] = useState<MaintenanceRequest[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const isConfigRequired = SCRIPT_URL.includes('_placeholder_url');

  useEffect(() => {
    if (!isConfigRequired) {
      fetchRequests();
    } else {
      setApiError('CONFIGURATION_REQUIRED');
    }
  }, [isConfigRequired]);

  const fetchRequests = async () => {
    setLoading(true);
    setApiError(null);
    try {
      const data = await apiService.getAllTickets();
      setRequests(data);
    } catch (error: any) {
      if (error.message === 'CONFIGURATION_REQUIRED') {
        setApiError('CONFIGURATION_REQUIRED');
      } else {
        setApiError('CONNECTION_FAILED');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleNewRequest = async (data: Omit<MaintenanceRequest, 'id' | 'status' | 'timestamp'>) => {
    setLoading(true);
    const result = await apiService.createTicket(data);
    if (result.success) {
      await fetchRequests();
      const tempReq: any = { ...data, id: result.ticketId, status: RequestStatus.NEW };
      notifyNewRequest(tempReq);
      alert('ส่งข้อมูลแจ้งซ่อมเรียบร้อยแล้ว!');
    } else {
      alert('เกิดข้อผิดพลาดในการบันทึกข้อมูล กรุณาตรวจสอบการเชื่อมต่อ');
    }
    setLoading(false);
  };

  const updateRequestStatus = async (id: string, status: RequestStatus, resolution?: string) => {
    setLoading(true);
    const result = await apiService.updateStatus(id, status, resolution);
    if (result.success) {
      await fetchRequests();
      const updatedReq = requests.find(r => r.id === id);
      if (updatedReq) {
        notifyStatusUpdate({ ...updatedReq, status, resolutionDetails: resolution });
      }
    } else {
      alert('ไม่สามารถอัปเดตสถานะได้ กรุณาตรวจสอบการเชื่อมต่อ');
    }
    setLoading(false);
  };

  const handleLogin = (success: boolean) => {
    if (success) {
      setIsLoggedIn(true);
      setView('ADMIN');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row relative">
      {/* Configuration Error Banner */}
      {apiError === 'CONFIGURATION_REQUIRED' && (
        <div className="fixed top-0 left-0 right-0 bg-amber-500 text-white p-2 text-center text-sm font-bold z-[110] shadow-md">
          ⚠️ ระบบยังไม่ได้เชื่อมต่อกับ Google Sheets: กรุณานำ URL จาก Apps Script มาใส่ใน apiService.ts
        </div>
      )}

      {apiError === 'CONNECTION_FAILED' && !loading && (
        <div className="fixed top-0 left-0 right-0 bg-red-600 text-white p-2 text-center text-sm font-bold z-[110] shadow-md flex justify-center items-center space-x-4">
          <span>⚠️ ไม่สามารถเชื่อมต่อฐานข้อมูลได้ (Failed to fetch)</span>
          <button onClick={fetchRequests} className="bg-white text-red-600 px-3 py-1 rounded-lg text-xs hover:bg-gray-100 transition-colors">ลองใหม่อีกครั้ง</button>
        </div>
      )}

      {loading && (
        <div className="fixed inset-0 bg-white/50 backdrop-blur-sm z-[100] flex items-center justify-center">
          <div className="flex flex-col items-center">
            <svg className="w-12 h-12 text-blue-600 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" strokeOpacity="0.2" />
              <path d="M12 2a10 10 0 0 1 10 10" />
            </svg>
            <p className="mt-2 font-bold text-blue-600">กำลังเชื่อมต่อฐานข้อมูล...</p>
          </div>
        </div>
      )}

      {isLoggedIn && (
        <Sidebar 
          currentView={view} 
          setView={setView} 
          onLogout={() => { setIsLoggedIn(false); setView('USER'); }} 
        />
      )}
      
      <main className="flex-1 overflow-y-auto p-4 md:p-8">
        {view === 'USER' && (
          <div className="max-w-2xl mx-auto">
            <UserPage onSubmit={handleNewRequest} onAdminLogin={() => setView('LOGIN')} />
          </div>
        )}

        {view === 'LOGIN' && (
          <div className="flex items-center justify-center min-h-[80vh]">
            <LoginPage onLogin={handleLogin} onCancel={() => setView('USER')} />
          </div>
        )}

        {isLoggedIn && (view === 'ADMIN' || view === 'DASHBOARD' || view === 'HISTORY') && (
          <AdminDashboard 
            requests={requests} 
            updateStatus={updateRequestStatus} 
            viewMode={view}
          />
        )}
      </main>
    </div>
  );
};

export default App;
