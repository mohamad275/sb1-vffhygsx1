"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.testEmailSender = exports.scheduledPDFEmailer = void 0;
// src/index.ts
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const nodemailer = require("nodemailer");
// Initialize Firebase Admin
admin.initializeApp();
// Email configuration
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'ainlifeai@gmail.com',
        pass: 'auctfvwvdfntjmpw' // Replace with your app password
    }
});
// Function to send email
async function sendEmail(pdfUrl) {
    const mailOptions = {
        from: 'ainlifeai@gmail.com',
        to: 'mohamad99darwish@gmail.com',
        subject: 'تقرير يومي',
        html: `
      <div dir="rtl">
        <h2>التقرير اليومي</h2>
        <p>مرفق رابط تقرير اليوم:</p>
        <a href="${pdfUrl}">تحميل التقرير</a>
      </div>
    `
    };
    try {
        await transporter.sendMail(mailOptions);
        console.log('Email sent successfully');
    }
    catch (error) {
        console.error('Error sending email:', error);
        throw error;
    }
}
// Scheduled function
exports.scheduledPDFEmailer = functions
    .region('europe-west1')
    .pubsub.schedule('0 5 * * *')
    .timeZone('Asia/Jerusalem')
    .onRun(async (context) => {
    try {
        // Format the date for the filename
        const today = new Date();
        const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
        const fileName = `report-${dateStr}.pdf`;
        // Get the file from storage
        const bucket = admin.storage().bucket();
        const file = bucket.file(`reports/${fileName}`);
        // Check if file exists
        const [exists] = await file.exists();
        if (!exists) {
            console.error('PDF file not found for today');
            return null;
        }
        // Get signed URL
        const [url] = await file.getSignedUrl({
            action: 'read',
            expires: Date.now() + 24 * 60 * 60 * 1000, // 24 hour expiration
        });
        // Send email
        await sendEmail(url);
        console.log('Daily report email sent successfully');
        return null;
    }
    catch (error) {
        console.error('Error in scheduled function:', error);
        return null;
    }
});
// Test function (HTTP endpoint)
exports.testEmailSender = functions.https.onRequest(async (req, res) => {
    try {
        const bucket = admin.storage().bucket();
        const [files] = await bucket.getFiles({ prefix: 'reports/' });
        if (files.length === 0) {
            res.status(404).send('No PDF files found');
            return;
        }
        const latestFile = files
            .sort((a, b) => b.metadata.timeCreated.localeCompare(a.metadata.timeCreated))[0];
        const [url] = await latestFile.getSignedUrl({
            action: 'read',
            expires: Date.now() + 24 * 60 * 60 * 1000,
        });
        await sendEmail(url);
        res.send('Test email sent successfully');
    }
    catch (error) {
        console.error('Error:', error);
        res.status(500).send('Error sending test email');
    }
});
//# sourceMappingURL=index.js.map