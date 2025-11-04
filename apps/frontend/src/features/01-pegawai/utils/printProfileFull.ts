import pdfMake from 'pdfmake/build/pdfmake';
import 'pdfmake/build/vfs_fonts';
import { TDocumentDefinitions } from 'pdfmake/interfaces';
import { Pegawai, EducationHistory } from '../../types'; // Import EducationHistory
import type { RiwayatJabatan, Pelatihan } from '../../../../types/types';

// ==================================================================================
// TYPES
// ==================================================================================
type EmployeeData = Pegawai;
type JobHistory = RiwayatJabatan;
type Training = Pelatihan;

// ==================================================================================
// HELPER: IMAGE TO DATA URL
// ==================================================================================
const convertImageToDataURL = (url: string): Promise<string> => {
  // ... (rest of the function is unchanged)
  return new Promise((resolve, reject) => {
    if (url.startsWith('data:')) {
      resolve(url);
      return;
    }
    
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    
    img.onload = function() {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }
        canvas.height = img.height;
        canvas.width = img.width;
        ctx.drawImage(img, 0, 0);
        const dataURL = canvas.toDataURL('image/jpeg');
        resolve(dataURL);
      } catch (error) {
        reject(error);
      }
    };
    
    img.onerror = () => reject(new Error('Could not load image'));
    setTimeout(() => reject(new Error('Image loading timeout')), 10000);
    img.src = url;
  });
};

// ==================================================================================
// PDF GENERATION LOGIC
// ==================================================================================
export const generateProfilePDF = async (
  employeeData: EmployeeData,
  jobHistories: JobHistory[] = [],
  trainings: Training[] = []
): Promise<void> => {
  // ... (rest of the function is unchanged)
  let avatarImage = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
  
  if (employeeData.avatarUrl) {
    try {
      avatarImage = await convertImageToDataURL(employeeData.avatarUrl);
    } catch (error) {
      console.warn('Failed to load avatar image for PDF, using placeholder:', error);
    }
  }

  const content: any[] = [
    { canvas: [{ type: 'line', x1: 0, y1: 5, x2: 515, y2: 5, lineWidth: 1, lineColor: '#1E3A8A' }], margin: [0, 10, 0, 20] },
    {
      columns: [
        { image: avatarImage, width: 80, height: 80, alignment: 'center' },
        {
          width: '*',
          margin: [20, 0, 0, 0],
          stack: [
            { text: employeeData.name, style: 'employeeName' },
            { text: employeeData.position, style: 'employeePosition' },
            { text: `NIK: ${employeeData.nip || '-'}`, style: 'employeeNik' },
            {
              text: (employeeData.isActive !== 0 && employeeData.statusKaryawan !== 'nonaktif' ? 'AKTIF' : 'NONAKTIF'),
              fontSize: 10,
              bold: true,
              background: (employeeData.isActive !== 0 && employeeData.statusKaryawan !== 'nonaktif' ? '#D1FAE5' : '#FEE2E2'),
              color: (employeeData.isActive !== 0 && employeeData.statusKaryawan !== 'nonaktif' ? '#065F46' : '#991B1B'),
              margin: [0, 5, 0, 0]
            }
          ]
        }
      ]
    },
    {
      columns: [
        {
          width: '50%',
          stack: [
            { text: 'Informasi Pribadi', style: 'sectionHeader' },
            {
              style: 'infoTable',
              table: {
                widths: ['auto', '*'],
                body: [
                  [{ text: 'Email', style: 'label' }, { text: employeeData.email || '-', style: 'value' }],
                  [{ text: 'Telepon', style: 'label' }, { text: employeeData.phone || '-', style: 'value' }],
                  [{ text: 'Alamat', style: 'label' }, { text: employeeData.address || '-', style: 'value' }],
                  [{ text: 'TTL', style: 'label' }, { text: employeeData.pob && employeeData.dob ? `${employeeData.pob}, ${new Date(employeeData.dob).toLocaleDateString('id-ID')}` : '-', style: 'value' }],
                  [{ text: 'Gender', style: 'label' }, { text: employeeData.jenis_kelamin === 'L' ? 'Laki-laki' : 'Perempuan', style: 'value' }],
                  [{ text: 'Agama', style: 'label' }, { text: employeeData.religion || '-', style: 'value' }],
                  [{ text: 'Status', style: 'label' }, { text: employeeData.maritalStatus || '-', style: 'value' }],
                ]
              },
              layout: 'noBorders'
            }
          ],
          margin: [0, 0, 10, 0]
        },
        {
          width: '50%',
          stack: [
            { text: 'Informasi Kepegawaian', style: 'sectionHeader' },
            {
              style: 'infoTable',
              table: {
                widths: ['auto', '*'],
                body: [
                  [{ text: 'Departemen', style: 'label' }, { text: employeeData.department || '-', style: 'value' }],
                  [{ text: 'Jabatan', style: 'label' }, { text: employeeData.position || '-', style: 'value' }],
                  [{ text: 'Pangkat', style: 'label' }, { text: employeeData.pangkat || '-', style: 'value' }],
                  [{ text: 'Golongan', style: 'label' }, { text: employeeData.golongan || '-', style: 'value' }],
                  [{ text: 'Tgl. Bergabung', style: 'label' }, { text: employeeData.joinDate ? new Date(employeeData.joinDate).toLocaleDateString('id-ID') : '-', style: 'value' }],
                  [{ text: 'Sisa Cuti', style: 'label' }, { text: `${employeeData.leaveBalance || '0'} hari`, style: 'value' }],
                ]
              },
              layout: 'noBorders'
            }
          ],
          margin: [10, 0, 0, 0]
        }
      ],
      margin: [0, 20, 0, 0]
    }
  ];

  if (jobHistories && jobHistories.length > 0) {
    content.push({ text: 'Riwayat Jabatan', style: 'sectionHeader' });
    content.push({
      table: {
        headerRows: 1,
        widths: ['auto', '*', '*', 'auto'],
        body: [
          ['No', 'Jabatan Lama', 'Jabatan Baru', 'Tanggal Perubahan'].map(h => ({ text: h, style: 'tableHeader' })),
          ...jobHistories.map((job, index) => [
            (index + 1).toString(),
            job.jabatan_lama || '-',
            job.jabatan_baru || '-',
            job.tanggal_perubahan ? new Date(job.tanggal_perubahan).toLocaleDateString('id-ID') : '-'
          ])
        ]
      },
      layout: {
        hLineWidth: (i: number, node: { table: { body: any[][] } }) => (i === 0 || i === node.table.body.length) ? 1 : 0.5,
        vLineWidth: () => 0,
        hLineColor: (i: number) => (i === 0 ? '#1E3A8A' : '#D1D5DB'),
      }
    });
  }

  if (trainings && trainings.length > 0) {
    content.push({ text: 'Riwayat Pelatihan & Sertifikat', style: 'sectionHeader' });
    content.push({
      table: {
        headerRows: 1,
        widths: ['auto', '*', '*', 'auto'],
        body: [
          ['No', 'Nama Pelatihan', 'Penyelenggara', 'Tanggal'].map(h => ({ text: h, style: 'tableHeader' })),
          ...trainings.map((training, index) => [
            (index + 1).toString(),
            training.nama_pelatihan || '-',
            training.penyelenggara || '-',
            training.tanggal_mulai ? new Date(training.tanggal_mulai).toLocaleDateString('id-ID') : '-'
          ])
        ]
      },
      layout: {
        hLineWidth: (i: number, node: { table: { body: any[][] } }) => (i === 0 || i === node.table.body.length) ? 1 : 0.5,
        vLineWidth: () => 0,
        hLineColor: (i: number) => (i === 0 ? '#1E3A8A' : '#D1D5DB'),
      }
    });
  }

  const docDefinition: TDocumentDefinitions = {
    pageSize: 'A4',
    pageMargins: [40, 60, 40, 60],
    header: {
      margin: [40, 20, 40, 0],
      columns: [
        { text: 'HRMS BPR BAPERA BATANG', style: 'companyName' },
        { text: 'PROFIL PEGAWAI', style: 'documentTitle', alignment: 'right' }
      ]
    },
    footer: (currentPage, pageCount) => ({
      margin: [40, 20, 40, 0],
      columns: [
        { text: `© ${new Date().getFullYear()} HRMS BPR BAPERA BATANG`, style: 'footerText' },
        { text: `Halaman ${currentPage} dari ${pageCount}`, style: 'footerText', alignment: 'right' }
      ]
    }),
    content,
    styles: {
      companyName: { fontSize: 14, bold: true, color: '#1E3A8A' },
      documentTitle: { fontSize: 14, color: '#4B5563' },
      footerText: { fontSize: 8, color: '#6B7280' },
      employeeName: { fontSize: 24, bold: true, color: '#111827', margin: [0, 0, 0, 2] },
      employeePosition: { fontSize: 16, color: '#4B5563' },
      employeeNik: { fontSize: 12, color: '#6B7280', margin: [0, 8, 0, 8] },
      sectionHeader: { fontSize: 14, bold: true, color: '#1E3A8A', margin: [0, 20, 0, 10] },
      infoTable: { margin: [0, 5, 0, 15] },
      label: { bold: true, color: '#374151', margin: [0, 2, 10, 2] },
      value: { color: '#111827', margin: [0, 2, 0, 2] },
      tableHeader: { bold: true, fontSize: 10, color: 'white', fillColor: '#1E3A8A', margin: [5, 5, 5, 5] },
    },
    defaultStyle: {
      fontSize: 10,
      color: '#111827',
    }
  };

  pdfMake.createPdf(docDefinition).download(`Profil_Pegawai_${employeeData.name}.pdf`);
};


// ==================================================================================
// HTML PRINTING LOGIC
// ==================================================================================
export const printProfileFull = (
  employee: EmployeeData,
  jobHistory: JobHistory[],
  trainings: Training[],
) => {
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Please allow pop-ups to print the profile.');
    return;
  }

  const educations = employee.educationHistory || [];

  const html = `
    <html>
      <head>
        <title>Profil Pegawai - ${employee.name}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
          body { font-family: 'Inter', sans-serif; margin: 0; background-color: #f3f4f6; color: #111827; }
          .container { max-width: 900px; margin: 40px auto; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 10px rgba(0,0,0,0.1); overflow: hidden; }
          .header { display: flex; align-items: center; background: linear-gradient(135deg, #1E3A8A, #2563EB); color: #fff; padding: 30px; gap: 24px; }
          .photo { flex-shrink: 0; width: 120px; height: 120px; border-radius: 100%; overflow: hidden; background-color: #e5e7eb; display: flex; align-items: center; justify-content: center; }
          .photo img { width: 100%; height: 100%; object-fit: cover; }
          .photo-placeholder { font-size: 2rem; color: #9ca3af; }
          .header-info { flex: 1; }
          .header-info h1 { margin: 0; font-size: 2rem; font-weight: 700; }
          .header-info p { margin: 6px 0 0; font-size: 1.1rem; color: #E5E7EB; }
          .content { padding: 40px; }
          .section { margin-bottom: 32px; }
          .section-title { font-size: 1.25rem; font-weight: 700; color: #1E3A8A; border-bottom: 2px solid #E5E7EB; padding-bottom: 8px; margin-bottom: 20px; }
          .info-grid { display: grid; grid-template-columns: 200px 1fr; row-gap: 10px; }
          .info-grid dt { font-weight: 600; color: #4B5563; }
          .info-grid dd { margin: 0; }
          .timeline { margin-top: 10px; }
          .item { margin-bottom: 20px; padding-left: 20px; border-left: 3px solid #1E3A8A; }
          .item h4 { margin: 0; font-size: 1.1rem; font-weight: 600; color: #1E3A8A; }
          .item p { margin: 4px 0 0; color: #4B5563; }
          @media print { body { background-color: #ffffff; } .container { box-shadow: none; margin: 0; border-radius: 0; } }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="photo">
              ${employee.avatarUrl ? `<img src="${employee.avatarUrl}" alt="Foto Profil">` : `<span class="photo-placeholder">👤</span>`}
            </div>
            <div class="header-info">
              <h1>${employee.name}</h1>
              <p>${employee.position || '-'} • ${employee.department || '-'}</p>
            </div>
          </div>
          <div class="content">
            <div class="section">
              <h3 class="section-title">Informasi Pribadi</h3>
              <dl class="info-grid">
                <dt>NIP</dt><dd>${employee.nip || '-'}</dd>
                <dt>Tempat, Tanggal Lahir</dt><dd>${employee.pob || '-'}, ${employee.dob ? new Date(employee.dob).toLocaleDateString('id-ID') : '-'}</dd>
                <dt>Alamat</dt><dd>${employee.address || '-'}</dd>
                <dt>Email</dt><dd>${employee.email || '-'}</dd>
                <dt>No. HP</dt><dd>${employee.phone || '-'}</dd>
                <dt>Agama</dt><dd>${employee.religion || '-'}</dd>
                <dt>Status</dt><dd>${employee.maritalStatus || '-'}</dd>
                <dt>Jumlah Anak</dt><dd>${employee.numberOfChildren || '-'}</dd>
              </dl>
            </div>
            <div class="section">
              <h3 class="section-title">Informasi Kepegawaian</h3>
              <dl class="info-grid">
                <dt>Departemen</dt><dd>${employee.department || '-'}</dd>
                <dt>Jabatan</dt><dd>${employee.position || '-'}</dd>
                <dt>Status Kerja</dt><dd>${employee.statusKaryawan || '-'}</dd>
                <dt>Tanggal Masuk</dt><dd>${employee.joinDate ? new Date(employee.joinDate).toLocaleDateString('id-ID') : '-'}</dd>
              </dl>
            </div>
            ${jobHistory.length > 0 ? `
            <div class="section">
              <h3 class="section-title">Riwayat Jabatan</h3>
              <div class="timeline">
                ${jobHistory.map(j => `
                  <div class="item">
                    <h4>${j.jabatan_baru}</h4>
                    <p>Sejak ${new Date(j.tanggal_perubahan).toLocaleDateString('id-ID')} — Jabatan Lama: ${j.jabatan_lama}</p>
                  </div>
                `).join('')}
              </div>
            </div>` : ''}
            ${educations.length > 0 ? `
            <div class="section">
              <h3 class="section-title">Riwayat Pendidikan</h3>
              <div class="timeline">
                ${educations.map(e => `
                  <div class="item">
                    <h4>${e.institution}</h4>
                    <p>${e.level} • Lulus ${e.graduationYear}</p>
                  </div>
                `).join('')}
              </div>
            </div>` : ''}
            ${trainings.length > 0 ? `
            <div class="section">
              <h3 class="section-title">Pelatihan & Sertifikasi</h3>
              <div class="timeline">
                ${trainings.map(t => `
                  <div class="item">
                    <h4>${t.nama_pelatihan}</h4>
                    <p>${t.penyelenggara || '-'} • ${t.tanggal_mulai ? new Date(t.tanggal_mulai).toLocaleDateString('id-ID') : '-'} - ${t.tanggal_selesai ? new Date(t.tanggal_selesai).toLocaleDateString('id-ID') : '-'}</p>
                  </div>
                `).join('')}
              </div>
            </div>` : ''}
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
