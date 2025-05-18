import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

interface Column {
  header: string;
  key: string;
  width: number;
}

export const exportToExcel = async <T extends Record<string, any>>(
  data: T[],
  columns: Column[],
  fileName: string,
  transformedData?: T[]
): Promise<void> => {
  // Create a new workbook and worksheet
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Sheet 1');

  // Set the columns
  worksheet.columns = columns;

  // Add header row styling
  worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFF' } };
  worksheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: '1E40AF' }, // primary-800
  };
  
  // Add the rows
  worksheet.addRows(transformedData || data);

  // Apply borders to all cells
  worksheet.eachRow((row, rowNumber) => {
    row.eachCell((cell) => {
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      };
      
      // Align number cells to the right
      if (typeof cell.value === 'number') {
        cell.alignment = { horizontal: 'right' };
      }
    });
    
    // Add alternating row colors
    if (rowNumber > 1) {
      row.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: rowNumber % 2 === 0 ? 'F9FAFB' : 'FFFFFF' }, // gray-50 and white
      };
    }
  });

  // Auto-filter the headers
  worksheet.autoFilter = {
    from: { row: 1, column: 1 },
    to: { row: 1, column: columns.length },
  };

  // Write to a buffer
  const buffer = await workbook.xlsx.writeBuffer();
  
  // Create a Blob from the buffer
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  
  // Save the file using FileSaver
  saveAs(blob, `${fileName}_${new Date().toISOString().split('T')[0]}.xlsx`);
};