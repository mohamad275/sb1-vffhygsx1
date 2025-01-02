import * as functions from 'firebase-functions';
import { exportToPDF } from './utils/pd'; // افترض أن هذه الدالة موجودة في مجلد utils
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// تهيئة Firebase Admin
initializeApp();
const db = getFirestore();

// الدالة المجدولة لتصدير PDF يومياً
export const scheduledReportExport = functions.pubsub
  .schedule('50 20 * * *') // ضبط الوقت للتنفيذ يومياً في الساعة 8:20 مساءً (بتوقيت الرياض)
  .timeZone('Asia/Riyadh')
  .onRun(async (context) => {
    try {
      // جلب البيانات من Firestore (يمكنك تخصيص هذه الدالة لجلب بياناتك الفعلية)
      const data = await fetchDataFromFirestore();
      
      // تصدير التقرير إلى PDF
      await exportToPDF(data);

      console.log('تم تصدير التقرير بنجاح');
    } catch (error) {
      console.error('حدث خطأ أثناء التصدير:', error);
    }
  });

// دالة لجلب البيانات من Firestore
async function fetchDataFromFirestore() {
  const [ingredients, mixes, productions, sales, purchases, notes] = await Promise.all([
    db.collection('ingredients').get(),
    db.collection('mixes').get(),
    db.collection('productions').get(),
    db.collection('sales').get(),
    db.collection('purchases').get(),
    db.collection('notes').get()
  ]);

  return {
    ingredients: ingredients.docs.map(doc => ({ id: doc.id, ...doc.data() })),
    mixes: mixes.docs.map(doc => ({ id: doc.id, ...doc.data() })),
    productions: productions.docs.map(doc => ({ id: doc.id, ...doc.data() })),
    sales: sales.docs.map(doc => ({ id: doc.id, ...doc.data() })),
    purchases: purchases.docs.map(doc => ({ id: doc.id, ...doc.data() })),
    notes: notes.docs.map(doc => ({ id: doc.id, ...doc.data() }))
  };
}
