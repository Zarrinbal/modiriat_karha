
// This utility requires the 'xlsx' library.
// You can add it to your project using: npm install xlsx
// Or include it via CDN in your index.html: <script src="https://cdn.jsdelivr.net/npm/xlsx/dist/xlsx.full.min.js"></script>

declare var XLSX: any;

export const exportToExcel = (data: any[], fileName: string): void => {
  if (typeof XLSX === 'undefined') {
    console.error("XLSX library is not loaded. Please include it in your project.");
    alert("ویژگی خروجی اکسل در دسترس نیست. لطفا کتابخانه مورد نیاز را بارگذاری کنید.");
    return;
  }
  
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');
  
  // Set RTL direction for the sheet
  if (!worksheet['!cols']) worksheet['!cols'] = [];
  if (!worksheet['!rows']) worksheet['!rows'] = [];
  worksheet['!cols'].forEach(col => { col.width = 20; }); // Set column width
  worksheet['!protect'] = { sheet: true };
  worksheet['!rightToLeft'] = true;

  XLSX.writeFile(workbook, `${fileName}.xlsx`);
};
