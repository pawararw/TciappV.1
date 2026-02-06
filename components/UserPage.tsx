
import React, { useState, useRef } from 'react';
import { DEPARTMENTS, REQUEST_TYPES } from '../constants';

interface Props {
  onSubmit: (data: any) => void;
  onAdminLogin: () => void;
}

const UserPage: React.FC<Props> = ({ onSubmit, onAdminLogin }) => {
  const [formData, setFormData] = useState({
    requesterName: '',
    department: DEPARTMENTS[0],
    type: REQUEST_TYPES[0],
    details: '',
    imageUrl: ''
  });
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      const reader = new FileReader();
      reader.onloadend = () => {
        // In real app, you would upload this base64 to Google Apps Script
        // which saves to Google Drive and returns a permanent URL.
        setFormData({ ...formData, imageUrl: reader.result as string });
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.requesterName || !formData.details) {
      alert('กรุณากรอกข้อมูลให้ครบถ้วน');
      return;
    }
    onSubmit(formData);
    setFormData({
      requesterName: '',
      department: DEPARTMENTS[0],
      type: REQUEST_TYPES[0],
      details: '',
      imageUrl: ''
    });
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="bg-blue-600 p-6 text-white flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <h1 className="text-2xl font-bold flex items-center">
            TCI
            <svg className="w-6 h-6 ml-1 text-blue-200 animate-spin-slow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1Z" />
            </svg>
            <span className="ml-2">Care v.1</span>
          </h1>
          <p className="opacity-80 hidden md:block">| Online Maintenance</p>
        </div>
        <button 
          onClick={onAdminLogin}
          className="text-sm bg-blue-500 hover:bg-blue-400 px-4 py-2 rounded-lg transition-colors border border-blue-400"
        >
          Staff Login
        </button>
      </div>

      <form onSubmit={handleSubmit} className="p-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">ชื่อผู้แจ้ง (Requester Name)</label>
            <input
              type="text"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              placeholder="กรอกชื่อ-นามสกุล"
              value={formData.requesterName}
              onChange={(e) => setFormData({ ...formData, requesterName: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">แผนก (Department)</label>
            <select
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
            >
              {DEPARTMENTS.map(dept => <option key={dept} value={dept}>{dept}</option>)}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">ประเภท (Type)</label>
            <select
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            >
              {REQUEST_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">รูปภาพประกอบ (Photo)</label>
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className={`flex-1 flex items-center justify-center space-x-2 px-4 py-2 border-2 border-dashed rounded-lg transition-all ${
                  formData.imageUrl ? 'border-green-400 bg-green-50 text-green-700' : 'border-gray-300 hover:border-blue-400 text-gray-500'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>{formData.imageUrl ? 'เปลี่ยนรูปภาพ' : 'ถ่ายภาพ / อัปโหลด'}</span>
              </button>
              {formData.imageUrl && (
                <div className="w-10 h-10 rounded-lg overflow-hidden border">
                  <img src={formData.imageUrl} className="w-full h-full object-cover" alt="preview" />
                </div>
              )}
            </div>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*" 
              capture="environment" 
              onChange={handleFileChange}
            />
            {isUploading && <p className="text-xs text-blue-500 animate-pulse">กำลังประมวลผลภาพ...</p>}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">รายละเอียด (Details)</label>
          <textarea
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            placeholder="อธิบายอาการหรือปัญหาที่พบ..."
            value={formData.details}
            onChange={(e) => setFormData({ ...formData, details: e.target.value })}
          />
        </div>

        <button
          type="submit"
          disabled={isUploading}
          className={`w-full font-bold py-4 rounded-xl shadow-lg transform hover:-translate-y-1 transition-all duration-200 ${
            isUploading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          {isUploading ? 'กรุณารอสักครู่...' : 'ส่งแจ้งซ่อม (Submit Request)'}
        </button>
      </form>
    </div>
  );
};

export default UserPage;
