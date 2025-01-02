// functions/scheduledReport.js
const { schedule } = require('@netlify/functions');
const { connectToDatabase } = require('../utils/db');
const { exportToPDF } = require('../utils/reports/pdfExporter');

const handler = async (event) => {
  try {
    // اتصال بقاعدة البيانات
    const db = await connectToDatabase();
    
    // جلب البيانات المطلوبة
    const ingredients = await db.collection('ingredients').find({}).toArray();
    const mixes = await db.collection('mixes').find({}).toArray();
    const productions = await db.collection('productions').find({}).toArray();
    const sales = await db.collection('sales').find({}).toArray();
    const purchases = await db.collection('purchases').find({}).toArray();
    const notes = await db.collection('notes').find({}).toArray();

    // إنشاء التقرير
    await exportToPDF({
      ingredients,
      mixes,
      productions,
      sales,
      purchases,
      notes
    });

    // يمكنك هنا إضافة كود لحفظ التقرير في خدمة تخزين مثل S3 أو إرساله بالبريد الإلكتروني

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'تم إنشاء التقرير بنجاح' })
    };
  } catch (error) {
    console.error('Error generating report:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'فشل في إنشاء التقرير' })
    };
  }
};

// تشغيل الوظيفة كل يوم الساعة 7:05 صباحاً
exports.handler = schedule('0 2 * * *', handler);// functions/scheduledReport.js
const { schedule } = require('@netlify/functions');
const { connectToDatabase } = require('../utils/db');
const { exportToPDF } = require('../utils/reports/pdfExporter');

const handler = async (event) => {
  try {
    // اتصال بقاعدة البيانات
    const db = await connectToDatabase();
    
    // جلب البيانات المطلوبة
    const ingredients = await db.collection('ingredients').find({}).toArray();
    const mixes = await db.collection('mixes').find({}).toArray();
    const productions = await db.collection('productions').find({}).toArray();
    const sales = await db.collection('sales').find({}).toArray();
    const purchases = await db.collection('purchases').find({}).toArray();
    const notes = await db.collection('notes').find({}).toArray();

    // إنشاء التقرير
    await exportToPDF({
      ingredients,
      mixes,
      productions,
      sales,
      purchases,
      notes
    });

    // يمكنك هنا إضافة كود لحفظ التقرير في خدمة تخزين مثل S3 أو إرساله بالبريد الإلكتروني

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'تم إنشاء التقرير بنجاح' })
    };
  } catch (error) {
    console.error('Error generating report:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'فشل في إنشاء التقرير' })
    };
  }
};

// تشغيل الوظيفة كل يوم الساعة 7:05 صباحاً
exports.handler = schedule('0 2 * * *', handler);