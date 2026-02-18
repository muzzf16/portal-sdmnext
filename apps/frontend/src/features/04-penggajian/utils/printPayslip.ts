
import { Penggajian } from '../types';
import { Pegawai } from '../../01-pegawai/types';
import { CompanySettings } from '../../pengaturan/types';

export const printPayslip = (
  payroll: Penggajian,
  employee: Pegawai,
  companySettings?: CompanySettings
) => {
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Please allow pop-ups to print the payslip.');
    return;
  }

  const totalIncome = payroll.incomes.reduce((sum, item) => sum + item.amount, 0);
  const totalDeductions = payroll.deductions.reduce((sum, item) => sum + item.amount, 0);
  const netSalary = payroll.baseSalary + totalIncome - totalDeductions;

  const html = `
    <html>
      <head>
        <title>Slip Gaji - ${payroll.period} - ${employee.name}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
          body {
            font-family: 'Inter', sans-serif;
            margin: 0;
            padding: 20px;
            background-color: #f9fafb;
            color: #1f2937;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .payslip-container {
            max-width: 800px;
            margin: 0 auto;
            background-color: #ffffff;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
          }
          .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            padding: 24px;
            border-bottom: 1px solid #e5e7eb;
            background-color: #f3f4f6;
            border-top-left-radius: 8px;
            border-top-right-radius: 8px;
          }
          .company-details h1 {
            margin: 0;
            font-size: 1.5rem;
            font-weight: 700;
            color: #111827;
          }
          .company-details p {
            margin: 4px 0 0;
            font-size: 0.875rem;
            color: #6b7280;
          }
          .company-logo {
            max-width: 150px;
            max-height: 60px;
            object-fit: contain;
          }
          .payslip-title {
            text-align: center;
            padding: 16px;
          }
          .payslip-title h2 {
            margin: 0;
            font-size: 1.25rem;
            font-weight: 600;
            color: #374151;
          }
          .payslip-title p {
            margin: 4px 0 0;
            font-size: 0.875rem;
            color: #6b7280;
          }
          .employee-details {
            padding: 24px;
            border-bottom: 1px solid #e5e7eb;
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 16px;
          }
          .detail-item {
            display: flex;
            flex-direction: column;
          }
          .detail-item dt {
            font-size: 0.875rem;
            font-weight: 600;
            color: #6b7280;
            margin-bottom: 4px;
          }
          .detail-item dd {
            font-size: 1rem;
            font-weight: 500;
            margin: 0;
          }
          .salary-details {
            display: grid;
            grid-template-columns: 1fr 1fr;
            padding: 24px;
          }
          .earnings, .deductions {
            padding-right: 24px;
          }
          .deductions {
            padding-right: 0;
            padding-left: 24px;
            border-left: 1px solid #e5e7eb;
          }
          .section-title {
            font-size: 1.125rem;
            font-weight: 700;
            color: #111827;
            margin-top: 0;
            margin-bottom: 16px;
            border-bottom: 2px solid #f3f4f6;
            padding-bottom: 8px;
          }
          .salary-item {
            display: flex;
            justify-content: space-between;
            margin-bottom: 8px;
          }
          .salary-item span {
            font-size: 0.95rem;
          }
          .total-row {
            display: flex;
            justify-content: space-between;
            font-weight: 700;
            margin-top: 16px;
            padding-top: 8px;
            border-top: 1px solid #e5e7eb;
          }
          .net-salary {
            padding: 24px;
            background-color: #f3f4f6;
            border-bottom-left-radius: 8px;
            border-bottom-right-radius: 8px;
          }
          .net-salary-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          .net-salary-label {
            font-size: 1.25rem;
            font-weight: 700;
          }
          .net-salary-amount {
            font-size: 1.5rem;
            font-weight: 700;
            color: #16a34a; /* green-600 */
          }
          .footer {
            padding: 24px;
            text-align: center;
            font-size: 0.875rem;
            color: #6b7280;
          }
          @media print {
            body { background-color: #ffffff; padding: 0; }
            .payslip-container { box-shadow: none; border: none; margin: 0; border-radius: 0; }
          }
        </style>
      </head>
      <body>
        <div class="payslip-container">
          <header class="header">
            <div class="company-details">
              <h1>${companySettings?.companyName || 'Nama Perusahaan'}</h1>
              <p>${companySettings?.address || 'Alamat Perusahaan'}</p>
            </div>
            ${companySettings?.logo ? `<img src="${companySettings.logo}" alt="Company Logo" class="company-logo">` : ''}
          </header>

          <div class="payslip-title">
            <h2>SLIP GAJI</h2>
            <p>Periode: ${payroll.period}</p>
          </div>

          <dl class="employee-details">
            <div class="detail-item">
              <dt>Nama Karyawan</dt>
              <dd>${employee.name}</dd>
            </div>
            <div class="detail-item">
              <dt>NIP</dt>
              <dd>${employee.nip}</dd>
            </div>
            <div class="detail-item">
              <dt>Jabatan</dt>
              <dd>${employee.position}</dd>
            </div>
            <div class="detail-item">
              <dt>Tanggal Pembayaran</dt>
              <dd>${payroll.tanggalPembayaran ? new Date(payroll.tanggalPembayaran).toLocaleDateString('id-ID') : '-'}</dd>
            </div>
          </dl>

          <div class="salary-details">
            <div class="earnings">
              <h3 class="section-title">Pendapatan</h3>
              <div class="salary-item">
                <span>Gaji Pokok</span>
                <span>Rp ${payroll.baseSalary.toLocaleString('id-ID')}</span>
              </div>
              ${payroll.incomes.map(item => `
                <div class="salary-item">
                  <span>${item.name}</span>
                  <span>Rp ${item.amount.toLocaleString('id-ID')}</span>
                </div>
              `).join('')}
              <div class="total-row">
                <span>Total Pendapatan</span>
                <span>Rp ${(payroll.baseSalary + totalIncome).toLocaleString('id-ID')}</span>
              </div>
            </div>
            <div class="deductions">
              <h3 class="section-title">Potongan</h3>
              ${payroll.deductions.map(item => `
                <div class="salary-item">
                  <span>${item.name}</span>
                  <span>Rp ${item.amount.toLocaleString('id-ID')}</span>
                </div>
              `).join('')}
              <div class="total-row">
                <span>Total Potongan</span>
                <span>Rp ${totalDeductions.toLocaleString('id-ID')}</span>
              </div>
            </div>
          </div>

          <div class="net-salary">
            <div class="net-salary-row">
              <span class="net-salary-label">Gaji Bersih</span>
              <span class="net-salary-amount">Rp ${netSalary.toLocaleString('id-ID')}</span>
            </div>
          </div>

          <div class="footer">
            <p>Ini adalah slip gaji yang dibuat secara otomatis. Harap simpan untuk referensi Anda.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
  printWindow.focus();
  setTimeout(() => {
    printWindow.print();
    printWindow.close();
  }, 600);
};
