
export enum RequestStatus {
  NEW = '🆕 แจ้งใหม่',
  PENDING = '👨‍🔧 กำลังดำเนินการ',
  COMPLETED = '✅ เสร็จสมบูรณ์'
}

export interface MaintenanceRequest {
  id: string;
  timestamp: string;
  requesterName: string;
  department: string;
  type: string;
  details: string;
  imageUrl?: string;
  status: RequestStatus;
  resolutionDetails?: string;
  updateTime?: string;
}

export type ViewMode = 'USER' | 'LOGIN' | 'ADMIN' | 'DASHBOARD' | 'HISTORY';
