/**
 * โครงสร้างหลัก (Base Layout) - Table Based Structure
 */
function baseTemplate(content, orgName, bannerText, bannerColor) {
    return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link href="https://fonts.googleapis.com/css2?family=Kanit:wght@300;400;500;600&family=Poppins:wght@300;400;500;600&display=swap" rel="stylesheet">
    <style>
      body { margin: 0; padding: 0; }
      table { border-collapse: collapse; mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
      .card-table {
        background-color: #333333; 
        border-radius: 8px;
        overflow: hidden;
        box-shadow: 0 4px 10px rgba(0,0,0,0.1);
      }
    </style>
  </head>
  <body style="margin: 0; padding: 0; font-family: 'Kanit', 'Poppins', 'Sarabun', Arial, sans-serif; background-color: #f4f6f9;">
    <table width="100%" border="0" cellspacing="0" cellpadding="0">
        <tr>
            <td align="center" style="padding: 20px;">
                <table class="card-table" width="600" border="0" cellspacing="0" cellpadding="0" style="width: 100%; max-width: 600px; background-color: #333333; border-radius: 8px; overflow: hidden; margin: 0 auto;">
                    <tr>
                        <td style="background-color: ${bannerColor}; padding: 30px; text-align: center; color: white; font-size: 26px; font-weight: 600;">
                        ${bannerText}
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 40px; text-align: left; font-size: 18px; line-height: 1.8; color: #333333; background-color: #ffffff;">
                        ${content}
                        </td>
                    </tr>
                    <tr>
                        <td style="background-color: #333333; padding: 15px; text-align: center; color: white; font-size: 14px; border-top: 1px solid #333333;">
                        Copyright &copy; ${new Date().getFullYear()} | ${orgName}<br>
                        This is an automated message, please do not reply.
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
  </body>
  </html>
  `;
}

/**
 * 1. Template แจ้งสถานะ User (Created / Updated / Resolved) - ภาษาไทย
 */
function userStatusUpdateTemplate(data, orgName) {
    let icon = "🔔";
    let titleText = data.STATUS;
    let message = "";
    let themeColor = "#345C72";
    let btnText = "ดูรายละเอียดงาน";

    // ปรับการแสดงผล Status Label ให้สวยงามในตารางเนื้อหา
    let displayStatus = data.STATUS;

    switch (data.STATUS) {
        case 'NEW':
        case 'OPEN':
            icon = "⭐";
            titleText = "ส่งคำร้องเรียบร้อย";
            message = "ระบบได้รับคำร้องของท่านเรียบร้อยแล้ว และกำลังส่งเรื่องให้ฝ่าย IT";
            break;
        case 'PENDING':
            icon = "⏳";
            titleText = "รับทราบเรื่องแล้ว";
            message = "ฝ่าย IT ได้รับทราบเรื่องแล้ว อยู่ระหว่างรอการดำเนินการ";
            displayStatus = "PENDING (รับทราบเรื่องแล้ว)";
            break;
        case 'APPROVED':
            icon = "✅";
            titleText = "อนุมัติแล้ว (Approved)";
            message = "คำร้องของท่านได้รับการอนุมัติเรียบร้อยแล้ว ระบบกำลังส่งต่อให้ฝ่าย IT ดำเนินการ";
            break;
        case 'IN_PROGRESS':
        case 'IN PROGRESS':
            icon = "⚙️";
            titleText = "กำลังดำเนินการ";
            // ✅ ใช้ข้อความกลางที่ครอบคลุมทั้งการซื้อของ (Purchasing) และการซ่อม (Fixing)
            message = `ขณะนี้เจ้าหน้าที่กำลังอยู่ระหว่าง <b>ดำเนินการแก้ไข/จัดหาอุปกรณ์</b> ให้ท่านตามขั้นตอน`;
            displayStatus = "IN PROGRESS (กำลังดำเนินการ)";
            break;
        case 'RESOLVED':
        case 'CLOSED':
            icon = "✅";
            titleText = "ดำเนินการเสร็จสิ้น";
            // ✅ ปรับข้อความให้น่าสนใจและเชิญชวนให้ประเมิน
            message = `ขณะนี้ปัญหาของท่านได้รับการแก้ไขเรียบร้อยแล้ว <br><span style="color: #666; font-size: 16px;">ความพึงพอใจของท่านสำคัญต่อเรามาก รบกวนสละเวลาให้คะแนนเพื่อปิดงานครับ</span>`;
            displayStatus = "RESOLVED (ดำเนินการเสร็จสิ้น)";
            btnText = "ตรวจสอบสถานะการดำเนินการ";

            // ✅ แก้ไข: ลิงก์กลับไปที่หน้าเดิม (MyTicketDetailView) พร้อมส่งคะแนนไปใน URL
            const feedbackUrl = (score) => `${data.LINK}${data.LINK.includes('?') ? '&' : '?'}score=${score}`;

            message += `
            <div style="margin-top: 25px; text-align: center; background: #fafafa; padding: 20px; border-radius: 12px; border: 1px dashed #ddd;">
                <p style="margin: 0 0 15px 0; font-weight: bold; color: #345C72; font-size: 16px;">กรุณาให้คะแนนความพึงพอใจ</p>
                <div style="font-size: 32px; letter-spacing: 10px;">
                    <a href="${feedbackUrl(1)}" style="text-decoration: none;">⭐</a>
                    <a href="${feedbackUrl(2)}" style="text-decoration: none;">⭐</a>
                    <a href="${feedbackUrl(3)}" style="text-decoration: none;">⭐</a>
                    <a href="${feedbackUrl(4)}" style="text-decoration: none;">⭐</a>
                    <a href="${feedbackUrl(5)}" style="text-decoration: none;">⭐</a>
                </div>
                <p style="margin: 10px 0 0 0; font-size: 13px; color: #888;">(คลิกที่ดาวเพื่อประเมินและปิดเคสทันที)</p>
            </div>
            `;
            break;
        case 'REJECTED':
            icon = "❌";
            titleText = "ไม่ได้รับอนุมัติ (Rejected)";
            message = "คำร้องของท่านไม่ผ่านการอนุมัติ กรุณาตรวจสอบรายละเอียดในระบบ";
            break;
    }

    const content = `
        <p>ถึงคุณ <b>${data.REQUESTER} San</b>,</p>
        <p>${message}</p>
        <br>
        
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f8f9fa; padding: 20px; border-radius: 8px;">
            <tr>
                <td style="padding: 8px; font-weight: bold; width: 130px; font-size: 18px;">หมายเลข:</td>
                <td style="padding: 8px; font-size: 18px;">${data.TICKET_NO}</td>
            </tr>
            <tr>
                <td style="padding: 8px; font-weight: bold; font-size: 18px;">หัวข้อปัญหา:</td>
                <td style="padding: 8px; font-size: 18px;">${data.SUBJECT}</td>
            </tr>
            <tr>
                <td style="padding: 8px; font-weight: bold; font-size: 18px;">สถานะ:</td>
                <td style="padding: 8px; color: ${themeColor}; font-weight: bold; font-size: 18px;">${displayStatus}</td>
            </tr>
        </table>
        <br><br>

        <table cellspacing="0" cellpadding="0" style="margin: auto;">
            <tr>
                <td align="center" style="background-color: ${themeColor}; padding: 14px 30px; border-radius: 6px;">
                    <a href="${data.LINK}" target="_blank" style="color: #ffffff; text-decoration: none; font-weight: bold; font-size: 18px;">${btnText}</a>
                </td>
            </tr>
        </table>
        
        <div style="text-align: center; margin-top: 25px; font-size: 14px; color: #888;">
            หากปุ่มไม่ทำงาน คลิกที่ลิงก์: <a href="${data.LINK}" style="color: ${themeColor};">${data.LINK}</a>
        </div>
    `;

    return baseTemplate(content, orgName, `${icon} ${titleText}`, themeColor);
}

/**
 * 2. Template แจ้ง IT (New Ticket) - ภาษาไทย
 */
function itNewTicketTemplate(data, orgName) {
    const themeColor = "#345C72";

    const content = `
        <p>ถึง <b>IT Teams</b>,</p>
        <p>มีคำร้องใหม่เข้ามาในระบบ กรุณาตรวจสอบและรับงานเพื่อดำเนินการต่อ</p>
        <br>

        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f8f9fa; padding: 20px; border-radius: 8px;">
            <tr>
                <td style="padding: 8px; font-weight: bold; width: 130px; font-size: 18px;">หมายเลข:</td>
                <td style="padding: 8px; font-size: 18px;">${data.TICKET_NO}</td>
            </tr>
            <tr>
                <td style="padding: 8px; font-weight: bold; font-size: 18px;">ผู้แจ้ง:</td>
                <td style="padding: 8px; font-size: 18px;">${data.REQUESTER} (${data.DEPARTMENT})</td>
            </tr>
            <tr>
                <td style="padding: 8px; font-weight: bold; font-size: 18px;">หัวข้อปัญหา:</td>
                <td style="padding: 8px; font-size: 18px;">${data.SUBJECT}</td>
            </tr>
            <tr>
                <td style="padding: 8px; font-weight: bold; vertical-align: top; font-size: 18px;">รายละเอียด:</td>
                <td style="padding: 8px; font-size: 18px;">${data.DESCRIPTION}</td>
            </tr>
        </table>
        <br><br>

        <table cellspacing="0" cellpadding="0" style="margin: auto;">
            <tr>
                <td align="center" style="background-color: ${themeColor}; padding: 14px 30px; border-radius: 6px;">
                    <a href="${data.LINK}" target="_blank" style="color: #ffffff; text-decoration: none; font-weight: bold; font-size: 18px;">รับงานทันที</a>
                </td>
            </tr>
        </table>
        
        <div style="text-align: center; margin-top: 25px; font-size: 14px; color: #888;">
            หากปุ่มไม่ทำงาน คลิกที่ลิงก์: <a href="${data.LINK}" style="color: ${themeColor};">${data.LINK}</a>
        </div>
    `;

    return baseTemplate(content, orgName, "📢 มีงานใหม่ในระบบ", themeColor);
}

/**
 * 3. Template ขออนุมัติ (Manager) - ภาษาอังกฤษ
 */
function managerApprovalTemplate(data, orgName) {
    const themeColor = "#345C72";

    const content = `
        <p>Dear <b>${data.APPROVER_NAME}</b>,</p>
        <p>A new support request from <b>${data.REQUESTER}</b> is pending your approval. Please review the details below.</p>
        <br>

        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f8f9fa; padding: 20px; border-radius: 8px;">
            <tr>
                <td style="padding: 8px; font-weight: bold; width: 140px; font-size: 18px;">Ticket No:</td>
                <td style="padding: 8px; font-size: 18px;">${data.TICKET_NO}</td>
            </tr>
            <tr>
                <td style="padding: 8px; font-weight: bold; font-size: 18px;">Requester:</td>
                <td style="padding: 8px; font-size: 18px;">${data.REQUESTER}</td>
            </tr>
            <tr>
                <td style="padding: 8px; font-weight: bold; font-size: 18px;">Subject:</td>
                <td style="padding: 8px; font-size: 18px;">${data.SUBJECT}</td>
            </tr>
            <tr>
                <td style="padding: 8px; font-weight: bold; vertical-align: top; font-size: 18px;">Description:</td>
                <td style="padding: 8px; font-size: 18px;">${data.DESCRIPTION}</td>
            </tr>
        </table>
        <br><br>

        <table cellspacing="0" cellpadding="0" style="margin: auto;">
            <tr>
                <td align="center" style="background-color: ${themeColor}; padding: 14px 30px; border-radius: 6px;">
                    <a href="${data.LINK}" target="_blank" style="color: #ffffff; text-decoration: none; font-weight: bold; font-size: 18px;">Review & Approve</a>
                </td>
            </tr>
        </table>
        
        <div style="text-align: center; margin-top: 25px; font-size: 14px; color: #888;">
            If the button doesn't work, click the link: <a href="${data.LINK}" style="color: ${themeColor};">${data.LINK}</a>
        </div>
    `;

    return baseTemplate(content, orgName, "📝 Approval Request", themeColor);
}

module.exports = {
    itNewTicketTemplate,
    managerApprovalTemplate,
    userStatusUpdateTemplate
};