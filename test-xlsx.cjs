const XLSX = require('xlsx');
console.log('XLSX版本:', XLSX.version);

const exportData = {
  '运营概览': [
    { 指标: '日期', 值: '2026-06-07' },
    { 指标: '总借阅量', 值: 288 },
  ],
  '各区域借阅量': [
    { 区域: '书架主区', 借阅量: 150 },
  ],
};

const wb = XLSX.utils.book_new();
Object.entries(exportData).forEach(([sheetName, data]) => {
  const ws = XLSX.utils.json_to_sheet(data);
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  console.log('工作表', sheetName, '添加成功');
});

const filename = '测试导出_2026-06-07.xlsx';
XLSX.writeFile(wb, filename);
console.log('导出成功！文件名:', filename);
