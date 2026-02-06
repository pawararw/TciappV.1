
/**
 * TCI Care v.1 - Backend Script
 * Database: Google Sheets (Sheet: Tickets)
 */

const SHEET_NAME = 'Tickets';

function doGet(e) {
  const tickets = getAllTickets();
  return ContentService.createTextOutput(JSON.stringify(tickets))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  let result;
  try {
    const params = JSON.parse(e.postData.contents);
    const action = params.action;

    if (action === 'create') {
      result = createTicket(params.data);
    } else if (action === 'update') {
      result = updateTicketStatus(params.ticketId, params.status, params.fixDetail);
    } else {
      result = { success: false, message: 'Invalid action' };
    }
  } catch (error) {
    result = { success: false, message: error.toString() };
  }

  return ContentService.createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

function getAllTickets() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow([
      'ticketId', 'requestDate', 'requesterName', 'department', 'type', 
      'detail', 'imageUrl', 'status', 'technician', 'fixDetail', 
      'startDate', 'closeDate', 'month'
    ]);
  }
  
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const rows = data.slice(1);
  
  return rows.map(row => {
    let obj = {};
    headers.forEach((header, i) => {
      obj[header] = row[i];
    });
    // Map internal keys to frontend expectations
    return {
      id: obj.ticketId,
      timestamp: obj.requestDate,
      requesterName: obj.requesterName,
      department: obj.department,
      type: obj.type,
      details: obj.detail,
      imageUrl: obj.imageUrl,
      status: obj.status,
      resolutionDetails: obj.fixDetail,
      updateTime: obj.closeDate,
      technician: obj.technician,
      startDate: obj.startDate
    };
  });
}

function createTicket(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_NAME);
  const now = new Date();
  
  // Generate Ticket ID (Example: TCI-XXXX)
  const ticketId = 'TCI-' + Math.random().toString(36).substring(2, 7).toUpperCase();
  const month = now.getMonth() + 1;
  
  // A:ticketId, B:requestDate, C:requesterName, D:department, E:type, F:detail, G:imageUrl, H:status, I:technician, J:fixDetail, K:startDate, L:closeDate, M:month
  sheet.appendRow([
    ticketId,           // A
    now,                // B
    data.requesterName, // C
    data.department,    // D
    data.type,          // E
    data.details,       // F
    data.imageUrl || '',// G
    '🆕 แจ้งใหม่',       // H
    '',                 // I
    '',                 // J
    '',                 // K
    '',                 // L
    month               // M
  ]);
  
  return { success: true, ticketId: ticketId };
}

function updateTicketStatus(ticketId, status, fixDetail) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_NAME);
  const data = sheet.getDataRange().getValues();
  const now = new Date();
  
  let foundRow = -1;
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === ticketId) {
      foundRow = i + 1;
      break;
    }
  }
  
  if (foundRow === -1) {
    return { success: false, message: 'Ticket not found' };
  }

  // Update Status (Column H)
  sheet.getRange(foundRow, 8).setValue(status);
  
  if (status === '👨‍🔧 กำลังดำเนินการ') {
    // Column K: startDate
    sheet.getRange(foundRow, 11).setValue(now);
  } else if (status === '✅ เสร็จสมบูรณ์') {
    // Column J: fixDetail
    sheet.getRange(foundRow, 10).setValue(fixDetail || '');
    // Column L: closeDate
    sheet.getRange(foundRow, 12).setValue(now);
  }
  
  return { success: true };
}
