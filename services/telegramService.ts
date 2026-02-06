
import { TELEGRAM_CONFIG } from '../constants';
import { MaintenanceRequest, RequestStatus } from '../types';

export const sendTelegramMessage = async (text: string) => {
  const url = `https://api.telegram.org/bot${TELEGRAM_CONFIG.BOT_TOKEN}/sendMessage`;
  try {
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: TELEGRAM_CONFIG.CHAT_ID,
        text,
        parse_mode: 'HTML'
      })
    });
  } catch (error) {
    console.error('Telegram Notify Error:', error);
  }
};

export const notifyNewRequest = (req: MaintenanceRequest) => {
  const message = `⚠️ New Maintenance Request\n\n🆔 Ticket ID: ${req.id}\n👤 Requester: ${req.requesterName}\n🏢 Department: ${req.department}\n📂 Category: ${req.type}\n📝 Details: ${req.details}`;
  sendTelegramMessage(message);
};

export const notifyStatusUpdate = (req: MaintenanceRequest) => {
  let message = '';
  if (req.status === RequestStatus.PENDING) {
    message = `⚙️ Ticket Status Updated\n\n🆔 Ticket ID: ${req.id}\n👤 Requester: ${req.requesterName}\n📊 New Status: 👨‍🔧 In Progress`;
  } else if (req.status === RequestStatus.COMPLETED) {
    message = `⚙️ Ticket Status Updated\n\n🆔 Ticket ID: ${req.id}\n👤 Requester: ${req.requesterName}\n📊 New Status: ✅ Completed\n🛠 Resolution Details: ${req.resolutionDetails}`;
  }
  sendTelegramMessage(message);
};
