import pdfMake from 'pdfmake/build/pdfmake';
import 'pdfmake/build/vfs_fonts';
import { TDocumentDefinitions } from 'pdfmake/interfaces';
import { Pegawai } from '../../types';
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
  companyLogoUrl?: string
) => {
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Please allow pop-ups to print the profile.');
    return;
  }

  const educations = Array.isArray(employee.educationHistory) ? employee.educationHistory : [];

  const html = `
    <html>
      <head>
        <title>CV - ${employee.name}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap');
          
          :root {
            --primary-color: #2d3748; /* slate-800 */
            --secondary-color: #4a5568; /* slate-600 */
            --accent-color: #2563eb; /* blue-600 */
            --background-color: #f7fafc; /* gray-100 */
            --text-color: #1a202c; /* gray-900 */
            --text-light-color: #718096; /* gray-500 */
          }

          body { 
            font-family: 'Roboto', sans-serif; 
            margin: 0; 
            background-color: var(--background-color); 
            color: var(--text-color);
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }

          .cv-container {
            display: grid;
            grid-template-columns: 1fr 2.5fr;
            max-width: 1000px; 
            min-height: 1414px; /* A4 height */
            margin: 20px auto; 
            background-color: #ffffff; 
            box-shadow: 0 10px 25px rgba(0,0,0,0.1);
          }

          .left-column {
            background-color: var(--primary-color);
            color: #fff;
            padding: 40px 30px;
          }

          .right-column {
            padding: 40px 50px;
          }
          
          .photo-container {
            text-align: center;
            margin-bottom: 30px;
          }

          .photo {
            width: 160px;
            height: 160px;
            border-radius: 50%;
            object-fit: cover;
            border: 5px solid var(--accent-color);
          }

          .left-section {
            margin-bottom: 30px;
          }

          .left-title {
            font-size: 1.2rem;
            font-weight: 700;
            color: #fff;
            border-bottom: 2px solid var(--accent-color);
            padding-bottom: 8px;
            margin-bottom: 15px;
            text-transform: uppercase;
          }

          .contact-item {
            margin-bottom: 15px;
            word-wrap: break-word;
          }
          
          .contact-item strong {
            display: block;
            color: var(--text-light-color);
            font-size: 0.8rem;
            margin-bottom: 2px;
            color: #a0aec0; /* gray-400 */
          }

          .contact-item span {
            font-size: 0.95rem;
          }
          
          .skills-list {
            list-style: none;
            padding: 0;
            margin: 0;
          }
          
          .skills-list li {
            background-color: var(--secondary-color);
            color: #fff;
            padding: 6px 12px;
            border-radius: 5px;
            margin-bottom: 8px;
            font-size: 0.9rem;
          }

          .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            border-bottom: 3px solid var(--primary-color);
            padding-bottom: 20px;
            margin-bottom: 30px;
          }

          .header h1 {
            font-size: 2.8rem;
            font-weight: 700;
            margin: 0;
            color: var(--primary-color);
          }
          
          .header h2 {
            font-size: 1.5rem;
            font-weight: 400;
            margin: 5px 0 0;
            color: var(--secondary-color);
          }

          .company-logo {
            max-width: 120px;
            max-height: 50px;
            object-fit: contain;
          }

          .right-section {
            margin-bottom: 40px;
          }

          .right-title {
            font-size: 1.5rem;
            font-weight: 700;
            color: var(--primary-color);
            margin-bottom: 20px;
            text-transform: uppercase;
            letter-spacing: 1px;
          }

          .summary {
            font-size: 1rem;
            line-height: 1.6;
            text-align: justify;
          }
          
          .timeline-item {
            position: relative;
            padding-bottom: 25px;
            padding-left: 30px;
          }

          .timeline-item:last-child {
            padding-bottom: 0px;
          }

          .timeline-item::before {
            content: '';
            position: absolute;
            left: 5px;
            top: 5px;
            width: 12px;
            height: 12px;
            border: 2px solid var(--accent-color);
            background-color: #fff;
            border-radius: 50%;
            z-index: 1;
          }
          
          .timeline-item::after {
            content: '';
            position: absolute;
            left: 11px;
            top: 18px;
            bottom: -5px;
            width: 2px;
            background-color: #cbd5e0; /* gray-300 */
          }

           .timeline-item:last-child::after {
            display: none;
          }
          
          .item-header h4 {
            font-size: 1.1rem;
            font-weight: 700;
            margin: 0;
          }
          
          .item-header h5 {
            font-size: 1rem;
            font-weight: 500;
            color: var(--secondary-color);
            margin: 5px 0;
          }
          
          .item-date {
            font-size: 0.9rem;
            color: var(--text-light-color);
            margin-bottom: 10px;
          }

          .item-description {
            font-size: 0.95rem;
            line-height: 1.5;
          }

          @media print { 
            body { background-color: #ffffff; } 
            .cv-container { margin: 0; box-shadow: none; border: none; }
          }
        </style>
      </head>
      <body>
        <div class="cv-container">
          <aside class="left-column">
            <div class="photo-container">
              ${employee.avatarUrl ? `<img src="${employee.avatarUrl}" alt="Foto Profil" class="photo">` : ''}
            </div>
            
            <section class="left-section">
              <h3 class="left-title">Kontak</h3>
               <div class="contact-item">
                  <strong>Email</strong>
                  <span>${employee.email || '-'}</span>
              </div>
              <div class="contact-item">
                  <strong>Telepon</strong>
                  <span>${employee.phone || '-'}</span>
              </div>
              <div class="contact-item">
                  <strong>Alamat</strong>
                  <span>${employee.address || '-'}</span>
              </div>
            </section>
            
            <section class="left-section">
              <h3 class="left-title">Informasi Pribadi</h3>
              <div class="contact-item">
                  <strong>Tempat, Tgl Lahir</strong>
                  <span>${employee.pob || '-'}, ${employee.dob ? new Date(employee.dob).toLocaleDateString('id-ID') : '-'}</span>
              </div>
              <div class="contact-item">
                  <strong>Jenis Kelamin</strong>
                  <span>${employee.jenis_kelamin === 'L' ? 'Laki-laki' : 'Perempuan'}</span>
              </div>
              <div class="contact-item">
                  <strong>Status</strong>
                  <span>${employee.maritalStatus || '-'}</span>
              </div>
            </section>

          </aside>
          
          <main class="right-column">
            <header class="header">
              <div>
                <h1>${employee.name}</h1>
                <h2>${employee.position || '-'}</h2>
              </div>
              ${companyLogoUrl ? `<img src="${companyLogoUrl}" alt="Company Logo" class="company-logo">` : ''}
            </header>

            <section class="right-section">
                <h3 class="right-title">Ringkasan Profesional</h3>
                <p class="summary">
                    Profesional yang berdedikasi dan berpengalaman sebagai ${employee.position} di ${employee.department} dengan ${jobHistory.length > 0 ? `pengalaman lebih dari ${new Date().getFullYear() - new Date(jobHistory[0].tanggal_perubahan).getFullYear()} tahun` : 'rekam jejak yang terbukti'} dalam industri. Memiliki kemampuan dalam... (Deskripsi singkat bisa ditambahkan di sini).
                </p>
            </section>

            ${jobHistory.length > 0 ? `
            <section class="right-section">
              <h3 class="right-title">Riwayat Pekerjaan</h3>
              <div class="timeline">
                ${jobHistory.map(job => `
                  <div class="timeline-item">
                    <div class="item-header">
                      <h4>${job.jabatan_baru}</h4>
                      <h5>${employee.department}</h5>
                    </div>
                    <p class="item-date">${new Date(job.tanggal_perubahan).toLocaleDateString('id-ID', { year: 'numeric', month: 'long' })} (Jabatan Sebelumnya: ${job.jabatan_lama})</p>
                  </div>
                `).join('')}
              </div>
            </section>` : ''}

            ${educations.length > 0 ? `
            <section class="right-section">
                <h3 class="right-title">Riwayat Pendidikan</h3>
                <div class="timeline">
                    ${educations.map(edu => `
                        <div class="timeline-item">
                            <div class="item-header">
                                <h4>${edu.institution}</h4>
                                <h5>${edu.level} - ${edu.major || ''}</h5>
                            </div>
                            <p class="item-date">Lulus ${edu.graduationYear}</p>
                        </div>
                    `).join('')}
                </div>
            </section>` : ''}
            
            ${trainings.length > 0 ? `
            <section class="right-section">
              <h3 class="right-title">Pelatihan & Sertifikasi</h3>
              <div class="timeline">
                ${trainings.map(t => `
                  <div class="timeline-item">
                    <div class="item-header">
                      <h4>${t.nama_pelatihan}</h4>
                      <h5>${t.penyelenggara}</h5>
                    </div>
                     <p class="item-date">${new Date(t.tanggal_mulai).toLocaleDateString('id-ID')} - ${new Date(t.tanggal_selesai).toLocaleDateString('id-ID')}</p>
                     ${t.nomor_sertifikat ? `<p class="item-description">No. Sertifikat: ${t.nomor_sertifikat}</p>`:''}
                  </div>
                `).join('')}
              </div>
            </section>` : ''}

          </main>
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
