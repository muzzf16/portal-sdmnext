// src/features/01-pegawai/utils/printProfile.ts
/**
 * Utility function to generate and print employee profile as PDF
 * This is a simplified version - in a real application, you would use
 * a library like jsPDF or react-pdf to generate actual PDFs
 */

export const printEmployeeProfile = (employeeData: any) => {
  // In a real implementation, this would generate a PDF
  // For now, we'll simulate with a print dialog
  
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Profil Pegawai - ${employeeData.name}</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              margin: 20px;
              color: #333;
            }
            .header {
              text-align: center;
              border-bottom: 2px solid #333;
              padding-bottom: 10px;
              margin-bottom: 20px;
            }
            .profile-section {
              margin-bottom: 20px;
            }
            .section-title {
              font-size: 18px;
              font-weight: bold;
              margin-bottom: 10px;
              color: #1e3a8a;
            }
            .info-row {
              display: flex;
              margin-bottom: 8px;
            }
            .info-label {
              width: 200px;
              font-weight: bold;
            }
            .info-value {
              flex: 1;
            }
            @media print {
              .no-print {
                display: none;
              }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>PROFIL PEGAWAI</h1>
            <h2>${employeeData.name}</h2>
            <p>${employeeData.position} - ${employeeData.department}</p>
          </div>
          
          <!-- Personal Information -->
          <div class="profile-section">
            <div class="section-title">Informasi Pribadi</div>
            <div class="info-row">
              <div class="info-label">Nama Lengkap:</div>
              <div class="info-value">${employeeData.name || '-'}</div>
            </div>
            <div class="info-row">
              <div class="info-label">NIK:</div>
              <div class="info-value">${employeeData.nip || '-'}</div>
            </div>
            <div class="info-row">
              <div class="info-label">Email:</div>
              <div class="info-value">${employeeData.email || '-'}</div>
            </div>
            <div class="info-row">
              <div class="info-label">Telepon:</div>
              <div class="info-value">${employeeData.phone || '-'}</div>
            </div>
            <div class="info-row">
              <div class="info-label">Alamat:</div>
              <div class="info-value">${employeeData.address || '-'}</div>
            </div>
          </div>
          
          <!-- Employment Information -->
          <div class="profile-section">
            <div class="section-title">Informasi Kepegawaian</div>
            <div class="info-row">
              <div class="info-label">Unit Kerja:</div>
              <div class="info-value">${employeeData.department || '-'}</div>
            </div>
            <div class="info-row">
              <div class="info-label">Posisi:</div>
              <div class="info-value">${employeeData.position || '-'}</div>
            </div>
            <div class="info-row">
              <div class="info-label">Pangkat:</div>
              <div class="info-value">${employeeData.pangkat || '-'}</div>
            </div>
            <div class="info-row">
              <div class="info-label">Golongan:</div>
              <div class="info-value">${employeeData.golongan || '-'}</div>
            </div>
            <div class="info-row">
              <div class="info-label">Tanggal Bergabung:</div>
              <div class="info-value">${employeeData.joinDate ? new Date(employeeData.joinDate).toLocaleDateString('id-ID') : '-'}</div>
            </div>
            <div class="info-row">
              <div class="info-label">Status:</div>
              <div class="info-value">${employeeData.isActive !== false ? 'Aktif' : 'Nonaktif'}</div>
            </div>
          </div>
          
          <div style="margin-top: 30px; text-align: center; font-size: 12px; color: #666;">
            <p>Dicetak pada: ${new Date().toLocaleDateString('id-ID')}</p>
            <p>© ${new Date().getFullYear()} HRMS BPR BAPERA BATANG</p>
          </div>
          
          <div style="margin-top: 20px; text-align: center;" class="no-print">
            <button onclick="window.print()" style="
              background-color: #1e3a8a;
              color: white;
              border: none;
              padding: 10px 20px;
              border-radius: 5px;
              cursor: pointer;
              font-size: 16px;
            ">
              Cetak Profil
            </button>
            <button onclick="window.close()" style="
              background-color: #666;
              color: white;
              border: none;
              padding: 10px 20px;
              border-radius: 5px;
              cursor: pointer;
              font-size: 16px;
              margin-left: 10px;
            ">
              Tutup
            </button>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
  }
};