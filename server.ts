import express from "express";
import { createServer as createViteServer } from "vite";
import nodemailer from "nodemailer";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  // Email API route
  app.post("/api/send-email", async (req, res) => {
    const { formData } = req.body;
    
    if (!formData) {
      return res.status(400).json({ error: "No data provided" });
    }

    const { personalInfo, jobInfo, appointment, termination, attachments } = formData;

    const toAr = (str: any) => {
      if (str === null || str === undefined) return "";
      const s = String(str);
      const arabicDigits = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];
      return s.replace(/\d/g, (d) => arabicDigits[parseInt(d)]);
    };

    const row = (label: string, value: any) => `
      <div style="margin-bottom: 15px; border-bottom: 1px solid #f0f0f0; padding-bottom: 8px;">
        <div style="font-size: 11px; color: #888; margin-bottom: 4px;">${label}</div>
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span style="font-weight: bold; color: #2e1065; font-size: 14px;">${toAr(value)}</span>
          <span style="font-size: 10px; color: #2e1065; background: #f1e6ff; padding: 2px 8px; border-radius: 4px; cursor: pointer; border: 1px solid #2e1065;">نسخ</span>
        </div>
      </div>
    `;

    // Create a transporter using the provided credentials
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER || "r.iifaanis@gmail.com",
        pass: process.env.EMAIL_PASS || "xuchzkkqxbulobpl",
      },
    });

    const emailHtml = `
      <div dir="rtl" style="font-family: 'Cairo', sans-serif; background-color: #f4f7f6; padding: 20px; color: #333; line-height: 1.6;">
        <div style="max-width: 600px; margin: 0 auto; background: #fff; padding: 30px; border-radius: 20px; border: 1px solid #e1e8ed; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
          
          <div style="text-align: center; margin-bottom: 30px;">
             <h2 style="color: #2e1065; margin: 0; padding-bottom: 10px; border-bottom: 2px solid #f1e6ff; display: inline-block;">إشعار استلام بيانات طلب</h2>
             <p style="font-size: 12px; color: #666; margin-top: 10px;">بوابة التحول الرقمي - ريفانس المالية</p>
          </div>
          
          <div style="background: #fdfbf7; border-radius: 12px; padding: 20px; margin-bottom: 20px;">
            <h3 style="color: #2e1065; margin-top: 0; border-right: 4px solid #2e1065; padding-right: 10px; font-size: 16px;">المعلومات الشخصية</h3>
            ${row("الاسم الكامل", personalInfo.name)}
            ${row("رقم الهوية", personalInfo.idNumber)}
          </div>

          <div style="background: #fdfbf7; border-radius: 12px; padding: 20px; margin-bottom: 20px;">
            <h3 style="color: #2e1065; margin-top: 0; border-right: 4px solid #2e1065; padding-right: 10px; font-size: 16px;">معلومات الوظيفة</h3>
            ${row("الوحدة / الإدارة", jobInfo.unit)}
            ${row("الرتبة", jobInfo.rank)}
            ${row("الرقم العام", jobInfo.generalNumber)}
            ${row("المسمى الوظيفي", jobInfo.job)}
          </div>

          <div style="background: #fdfbf7; border-radius: 12px; padding: 20px; margin-bottom: 20px;">
            <h3 style="color: #2e1065; margin-top: 0; border-right: 4px solid #2e1065; padding-right: 10px; font-size: 16px;">تفاصيل التعيين</h3>
            ${row("تاريخ المباشرة", appointment.startDate || "غير محدد")}
            ${row("رقم القرار", appointment.decisionNumber)}
            ${row("تاريخ القرار", appointment.decisionDate || "غير محدد")}
          </div>

          <div style="background: #fdfbf7; border-radius: 12px; padding: 20px; margin-bottom: 20px;">
            <h3 style="color: #2e1065; margin-top: 0; border-right: 4px solid #2e1065; padding-right: 10px; font-size: 16px;">إنهاء الخدمة</h3>
            ${row("تاريخ إنهاء الخدمة", termination.terminationDate || "غير محدد")}
            ${row("رقم القرار", termination.decisionNumber)}
            ${row("تاريخ القرار (هجري)", termination.decisionDate || "غير محدد")}
          </div>

          <div style="margin-top: 20px; padding: 15px; background-color: #2e1065; color: white; border-radius: 12px; text-align: center;">
            <p style="margin: 0; font-size: 13px;">تم إرفاق صورة الهوية الوطنية مع هذا البريد.</p>
          </div>

          <div style="margin-top: 30px; text-align: center; font-size: 11px; color: #999; border-top: 1px solid #eee; padding-top: 20px;">
            <p>© ٢٠٢٦ ريفانس المالية - جميع الحقوق محفوظة</p>
          </div>
        </div>
      </div>
    `;

    const mailOptions: any = {
      from: `"بوابة ريفانس المالية" <${process.env.EMAIL_USER || "r.iifaanis@gmail.com"}>`,
      to: "r.iifaanis@gmail.com",
      subject: `بيانات موظف جديد: ${personalInfo.name}`,
      html: emailHtml,
      attachments: []
    };

    // Add ID attachment if provided
    if (attachments && attachments.idFileBase64) {
      mailOptions.attachments.push({
        filename: attachments.idFileName || "national_id.png",
        path: attachments.idFileBase64
      });
    }

    try {
      await transporter.sendMail(mailOptions);
      res.status(200).json({ message: "Email sent successfully" });
    } catch (error) {
      console.error("Error sending email:", error);
      res.status(500).json({ error: "Failed to send email" });
    }
  });

  // Vite middleware setup
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
