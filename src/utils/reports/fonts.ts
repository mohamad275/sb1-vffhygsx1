import { jsPDF } from 'jspdf';

export const loadAmiriFont = async (doc: jsPDF): Promise<void> => {
  try {
    const fontPath = '/fonts/Amiri-Regular.ttf';
    const response = await fetch(fontPath);
    
    if (!response.ok) {
      throw new Error('Failed to load Amiri font');
    }
    
    const fontArrayBuffer = await response.arrayBuffer();
    const fontBase64 = arrayBufferToBase64(fontArrayBuffer);
    
    doc.addFileToVFS('Amiri-Regular.ttf', fontBase64);
    doc.addFont('Amiri-Regular.ttf', 'Amiri', 'normal');
    doc.setFont('Amiri');
    
    // كتابة النص بالعربية
    const text = "";
    
    // تحديد الإحداثيات للتأكد من أن النص يظهر من اليمين لليسار
    const x = 200; // تحديد الإحداثي X (من اليمين)
    const y = 50;  // تحديد الإحداثي Y
    
    // استخدم `text` مع إحداثيات العكسية
    doc.text(text, x, y, { align: 'right' });
    
  } catch (error) {
    console.error('Error loading font:', error);
    throw new Error('فشل في تحميل الخط العربي');
  }
};

const arrayBufferToBase64 = (buffer: ArrayBuffer): string => {
  const binary = new Uint8Array(buffer).reduce(
    (data, byte) => data + String.fromCharCode(byte),
    ''
  );
  return btoa(binary);
};
