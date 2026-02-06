
# TCI Care v.1 - Technical Documentation (Updated)

### 1. New Features Implemented
- **Direct Image Upload:** ใช้ `HTML5 File API` ร่วมกับ attribute `capture="environment"` เพื่อเรียกใช้กล้องมือถือโดยตรง.
- **TCI Spin Animation:** ใช้ CSS Keyframes `spin-slow` ร่วมกับ SVG Gear Icon เพื่อความสวยงามและบ่งบอกสถานะ Maintenance.
- **Enhanced Data Analysis:** แยกสี Palette ของแผนก (15 สี) และประเภทปัญหา (5 สี) ออกจากกันใน Dashboard เพื่อให้อ่านข้อมูลง่ายขึ้น.
- **Job History Management:** แยก Logic งานที่ "เสร็จสมบูรณ์" ออกจาก Active List เพื่อความรวดเร็วในการทำงานของช่าง.

### 2. แนวทางการบันทึกรูปภาพลง Google Drive (GAS Implementation)
ในระบบจริง เมื่อมีการเลือกไฟล์ใน `UserPage.tsx`:
1.  Frontend จะส่ง `base64Data` ไปที่ฟังก์ชัน `uploadFile(base64, name)` ใน Apps Script.
2.  Apps Script จะใช้ `DriveApp.createFile(blob)` เพื่อสร้างไฟล์ใน Folder ที่กำหนด.
3.  Set Permission เป็น `Anyone with link can view`.
4.  คืนค่า `file.getUrl()` กลับมาบันทึกลงใน Sheet คอลัมน์ ImageURL.

### 3. โครงสร้าง Google Sheets (คงเดิม)
ระบบยังคงใช้โครงสร้าง 9 คอลัมน์เดิม เพื่อให้สามารถย้ายงานไป History ได้โดยไม่ต้องแก้ไข Database.

### 4. สรุปสี Dashboard
- **Departments:** 15 สี (Blue, Green, Amber, Red, Purple, Pink, Cyan, Indigo, Teal, Orange, Lime, Fuchsia, Slate, Brown, Blue-Dark).
- **Types:** Software (Orange), Hardware (Pink), Network (Purple), Printer (Indigo), Other (Teal).
