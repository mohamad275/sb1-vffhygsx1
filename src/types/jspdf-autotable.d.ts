declare module 'jspdf-autotable' {
  import { jsPDF } from 'jspdf';

  export default function autoTable(doc: jsPDF, options: any): jsPDF;
}

interface jsPDF {
  autoTable: (options: any) => void;
}
