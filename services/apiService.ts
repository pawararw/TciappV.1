
import { MaintenanceRequest, RequestStatus } from '../types';

/**
 * แทนที่ URL นี้ด้วย Web App URL ที่ได้จากการ Deploy Google Apps Script
 * สำคัญ: ต้องเป็น URL ที่ได้จากปุ่ม "Deploy" > "New Deployment" ใน Apps Script Editor
 */
export const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwySvqkG4vmg1hbE1M7nsTEMjEGJIpFc1jVQz_xIhN57N0dt8Ia85ppe6HNzmjpRVCY/exec';

const isPlaceholder = () => SCRIPT_URL.includes('_placeholder_url');

export const apiService = {
  async getAllTickets(): Promise<MaintenanceRequest[]> {
    if (isPlaceholder()) {
      console.warn('API URL is still a placeholder. Please deploy your Google Apps Script and update SCRIPT_URL in apiService.ts');
      throw new Error('CONFIGURATION_REQUIRED');
    }

    try {
      const response = await fetch(SCRIPT_URL, {
        method: 'GET',
        redirect: 'follow',
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('API Error (getAllTickets):', error);
      throw error;
    }
  },

  async createTicket(data: any) {
    if (isPlaceholder()) throw new Error('CONFIGURATION_REQUIRED');

    try {
      // หมายเหตุ: ไม่ใส่ Content-Type: application/json เพื่อหลีกเลี่ยง CORS Preflight (OPTIONS) 
      // ซึ่ง Google Apps Script ไม่รองรับโดยตรง แต่จะรับข้อมูลผ่าน e.postData.contents ได้ปกติ
      const response = await fetch(SCRIPT_URL, {
        method: 'POST',
        body: JSON.stringify({
          action: 'create',
          data: data
        }),
        redirect: 'follow'
      });
      return await response.json();
    } catch (error) {
      console.error('API Error (createTicket):', error);
      return { success: false };
    }
  },

  async updateStatus(ticketId: string, status: RequestStatus, fixDetail?: string) {
    if (isPlaceholder()) throw new Error('CONFIGURATION_REQUIRED');

    try {
      const response = await fetch(SCRIPT_URL, {
        method: 'POST',
        body: JSON.stringify({
          action: 'update',
          ticketId,
          status,
          fixDetail: fixDetail || ''
        }),
        redirect: 'follow'
      });
      return await response.json();
    } catch (error) {
      console.error('API Error (updateStatus):', error);
      return { success: false };
    }
  }
};
