
import React, { useState, useMemo } from 'react';
import { MaintenanceRequest, RequestStatus, ViewMode } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

interface Props {
  requests: MaintenanceRequest[];
  updateStatus: (id: string, status: RequestStatus, resolution?: string) => void;
  viewMode: ViewMode;
}

const AdminDashboard: React.FC<Props> = ({ requests, updateStatus, viewMode }) => {
  const [closingId, setClosingId] = useState<string | null>(null);
  const [resDetails, setResDetails] = useState('');
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Active Jobs (New & Pending)
  const activeRequests = useMemo(() => 
    requests.filter(req => req.status !== RequestStatus.COMPLETED),
    [requests]
  );

  // Completed Jobs for History
  const historyRequests = useMemo(() => 
    requests.filter(req => {
      const isCompleted = req.status === RequestStatus.COMPLETED;
      const date = new Date(req.timestamp);
      return isCompleted && (date.getMonth() + 1) === selectedMonth;
    }),
    [requests, selectedMonth]
  );

  const filteredByMonth = useMemo(() => {
    return requests.filter(req => {
      const date = new Date(req.timestamp);
      return (date.getMonth() + 1) === selectedMonth;
    });
  }, [requests, selectedMonth]);

  const stats = useMemo(() => {
    const data = filteredByMonth;
    const byDept: any = {};
    const byType: any = {};
    const byStatus = {
      new: data.filter(r => r.status === RequestStatus.NEW).length,
      pending: data.filter(r => r.status === RequestStatus.PENDING).length,
      done: data.filter(r => r.status === RequestStatus.COMPLETED).length,
    };

    data.forEach(r => {
      byDept[r.department] = (byDept[r.department] || 0) + 1;
      byType[r.type] = (byType[r.type] || 0) + 1;
    });

    return {
      byStatus,
      byDept: Object.keys(byDept).map(k => ({ name: k, count: byDept[k] })),
      byType: Object.keys(byType).map(k => ({ name: k, value: byType[k] })),
    };
  }, [filteredByMonth]);

  const handleExport = () => {
    const headers = ['ID', 'Timestamp', 'Requester', 'Department', 'Type', 'Details', 'Status', 'Resolution', 'Update Time'];
    const rows = filteredByMonth.map(r => [
      r.id, r.timestamp, r.requesterName, r.department, r.type, r.details, r.status, r.resolutionDetails || '', r.updateTime || ''
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].map(e => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `TCI_Maintenance_Report_Month_${selectedMonth}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const DEPT_COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#6366F1', '#14B8A6', '#F97316', '#84CC16', '#D946EF', '#64748B', '#78350F', '#1E40AF'];
  const TYPE_COLORS = ['#FB923C', '#F472B6', '#C084FC', '#818CF8', '#2DD4BF'];

  if (viewMode === 'DASHBOARD') {
    return (
      <div className="space-y-8 animate-in fade-in slide-in-from-right-4">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">System Dashboard</h1>
          <div className="flex space-x-4">
             <select 
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="bg-white border px-4 py-2 rounded-lg"
            >
              {[...Array(12)].map((_, i) => (
                <option key={i+1} value={i+1}>Month {i+1}</option>
              ))}
            </select>
            <button onClick={handleExport} className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors">
              Export CSV
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100">
            <p className="text-blue-600 text-sm font-bold uppercase">New Jobs</p>
            <h3 className="text-4xl font-black text-blue-900">{stats.byStatus.new}</h3>
          </div>
          <div className="bg-amber-50 p-6 rounded-2xl border border-amber-100">
            <p className="text-amber-600 text-sm font-bold uppercase">Processing</p>
            <h3 className="text-4xl font-black text-amber-900">{stats.byStatus.pending}</h3>
          </div>
          <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-100">
            <p className="text-emerald-600 text-sm font-bold uppercase">Finished</p>
            <h3 className="text-4xl font-black text-emerald-900">{stats.byStatus.done}</h3>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-2xl shadow-sm border">
            <h4 className="text-lg font-bold mb-6">Workload by Department</h4>
            <div className="h-[300px] w-full min-h-[300px]">
              {/* แก้ไข BUG #1: ใช้ height เป็นตัวเลข และ Render เฉพาะเมื่อมี data */}
              {stats.byDept.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={stats.byDept}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" fontSize={10} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                      {stats.byDept.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={DEPT_COLORS[index % DEPT_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-400 italic">ไม่มีข้อมูลแสดงในเดือนนี้</div>
              )}
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border">
            <h4 className="text-lg font-bold mb-6">Jobs by Category</h4>
            <div className="h-[300px] w-full min-h-[300px]">
              {/* แก้ไข BUG #1: ใช้ height เป็นตัวเลข และ Render เฉพาะเมื่อมี data */}
              {stats.byType.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={stats.byType}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {stats.byType.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={TYPE_COLORS[index % TYPE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-400 italic">ไม่มีข้อมูลแสดงในเดือนนี้</div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // History View
  if (viewMode === 'HISTORY') {
    return (
      <div className="animate-in fade-in slide-in-from-right-4">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Closed Jobs History</h1>
            <p className="text-gray-500">ประวัติงานที่ซ่อมเสร็จสมบูรณ์แล้ว</p>
          </div>
          <select 
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
            className="bg-white border px-4 py-2 rounded-lg"
          >
            {[...Array(12)].map((_, i) => (
              <option key={i+1} value={i+1}>Month {i+1}</option>
            ))}
          </select>
        </div>

        <div className="space-y-4">
          {historyRequests.length === 0 ? (
            <div className="bg-white p-12 text-center rounded-2xl border-2 border-dashed border-gray-200">
              <p className="text-gray-400">ไม่พบประวัติงานในเดือนนี้</p>
            </div>
          ) : (
            historyRequests.map(req => (
              <div key={req.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-bold">{req.id}</span>
                    <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold">{req.status}</span>
                  </div>
                  <span className="text-xs text-gray-400">ปิดงานเมื่อ: {new Date(req.updateTime!).toLocaleString('th-TH')}</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-bold">{req.requesterName} ({req.department})</h3>
                    <p className="text-sm text-blue-600 font-medium mb-2">{req.type}</p>
                    <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg border">{req.details}</p>
                  </div>
                  <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100">
                    <p className="text-xs font-bold text-emerald-700 uppercase mb-1">รายละเอียดการแก้ไข:</p>
                    <p className="text-sm text-emerald-900">{req.resolutionDetails}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  }

  // Active View (ADMIN)
  return (
    <div className="animate-in fade-in slide-in-from-right-4">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Active Requests</h1>
          <p className="text-gray-500">งานที่กำลังรอการดำเนินการ</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {activeRequests.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-2xl border-2 border-dashed border-gray-200">
            <p className="text-gray-400">ไม่มีงานค้างในขณะนี้</p>
          </div>
        ) : (
          activeRequests.map(req => (
            <div key={req.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold">{req.id}</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    req.status === RequestStatus.NEW ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                  }`}>
                    {req.status}
                  </span>
                  {req.imageUrl && (
                    <button 
                      onClick={() => setPreviewImage(req.imageUrl!)}
                      className="text-blue-500 hover:text-blue-700 text-xs font-bold flex items-center"
                    >
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      ดูรูปภาพ
                    </button>
                  )}
                </div>
                <h3 className="font-bold text-lg mb-1">{req.requesterName} <span className="text-gray-400 font-normal">| {req.department}</span></h3>
                <p className="text-sm text-gray-600 mb-2 font-medium">ประเภท: <span className="text-blue-600">{req.type}</span></p>
                <div className="bg-gray-50 p-4 rounded-xl text-sm text-gray-700 border border-gray-100">
                  {req.details}
                </div>
              </div>

              <div className="flex md:flex-col justify-center items-end space-y-2">
                {req.status === RequestStatus.NEW && (
                  <button
                    onClick={() => updateStatus(req.id, RequestStatus.PENDING)}
                    className="w-full md:w-32 flex items-center justify-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-all font-bold"
                  >
                    <span>▶</span><span>รับงาน</span>
                  </button>
                )}
                {req.status === RequestStatus.PENDING && (
                  <button
                    onClick={() => setClosingId(req.id)}
                    className="w-full md:w-32 flex items-center justify-center space-x-2 bg-red-600 text-white px-6 py-3 rounded-xl hover:bg-red-700 transition-all font-bold"
                  >
                    <span>⛔</span><span>ปิดงาน</span>
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Image Preview Modal */}
      {previewImage && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-[60]" onClick={() => setPreviewImage(null)}>
          <div className="max-w-3xl w-full bg-white rounded-3xl overflow-hidden p-2" onClick={e => e.stopPropagation()}>
            <img src={previewImage} className="w-full h-auto rounded-2xl" alt="Preview" />
            <button 
              onClick={() => setPreviewImage(null)}
              className="mt-4 w-full bg-gray-100 py-3 rounded-xl font-bold hover:bg-gray-200 transition-colors"
            >
              Close Preview
            </button>
          </div>
        </div>
      )}

      {/* Closing Work Modal */}
      {closingId && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white p-8 rounded-3xl w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
            <h3 className="text-2xl font-black mb-2 text-gray-800">บันทึกปิดงานซ่อม</h3>
            <textarea
              className="w-full p-4 border rounded-2xl mb-6 focus:ring-2 focus:ring-red-500 outline-none"
              rows={4}
              placeholder="ระบุสิ่งที่แก้ไข เพื่อปิดงาน..."
              value={resDetails}
              onChange={(e) => setResDetails(e.target.value)}
            />
            <div className="flex space-x-4">
              <button
                onClick={() => { setClosingId(null); setResDetails(''); }}
                className="flex-1 py-3 text-gray-500 font-bold hover:bg-gray-100 rounded-xl transition-colors"
              >
                ยกเลิก
              </button>
              <button
                onClick={() => {
                  if (!resDetails) return alert('กรุณากรอกรายละเอียด');
                  updateStatus(closingId, RequestStatus.COMPLETED, resDetails);
                  setClosingId(null);
                  setResDetails('');
                }}
                className="flex-1 bg-red-600 text-white py-3 rounded-xl font-bold hover:bg-red-700 transition-all shadow-lg shadow-red-100"
              >
                เสร็จสมบูรณ์
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
