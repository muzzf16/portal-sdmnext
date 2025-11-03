import pdfMake from 'pdfmake/build/pdfmake';
import 'pdfmake/build/vfs_fonts';

// pdfMake should automatically have vfs after importing vfs_fonts

/**
 * Converts an image URL to a data URL
 * @param url The image URL to convert
 * @returns A promise that resolves to the data URL
 */
const convertImageToDataURL = (url: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    // Check if it's a data URL already
    if (url.startsWith('data:')) {
      resolve(url);
      return;
    }
    
    // For external URLs, we need to fetch and convert to data URL
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    
    img.onload = function() {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.height = img.height;
        canvas.width = img.width;
        ctx!.drawImage(img, 0, 0);
        
        const dataURL = canvas.toDataURL('image/jpeg');
        resolve(dataURL);
      } catch (error) {
        reject(error);
      }
    };
    
    img.onerror = function() {
      reject(new Error('Could not load image'));
    };
    
    // Add a short timeout to prevent hanging
    setTimeout(() => {
      reject(new Error('Image loading timeout'));
    }, 10000);
    
    img.src = url;
  });
};

// Import the types from the global types file to ensure consistency
import { Pegawai, RiwayatJabatan, Pelatihan } from '../../types';

type EmployeeData = Pegawai;
type JobHistory = RiwayatJabatan;
type Training = Pelatihan;

/**
 * Generates a dynamic PDF for employee details
 * @param employeeData The main employee data
 * @param jobHistories Job history records for the employee
 * @param trainings Training records for the employee
 */
export const generateEmployeePDF = async (
  employeeData: EmployeeData,
  jobHistories: JobHistory[] = [],
  trainings: Training[] = []
): Promise<void> => {
  // Handle the avatar image to convert to data URL if needed
  let avatarImage = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='; // Default placeholder
  
  if (employeeData.avatarUrl) {
    try {
      // Check if it's already a data URL
      if (employeeData.avatarUrl.startsWith('data:')) {
        avatarImage = employeeData.avatarUrl;
      } else {
        // Convert external image to data URL
        avatarImage = await convertImageToDataURL(employeeData.avatarUrl);
      }
    } catch (error) {
      console.warn('Failed to load avatar image for PDF, using placeholder:', error);
      // Use default placeholder if image loading fails
      avatarImage = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
    }
  }

  // Prepare document definition
  const docDefinition = {
    info: {
      title: `Profil Pegawai - ${employeeData.name}`,
      author: 'HRMS BPR BAPERA BATANG',
      subject: 'Employee Profile',
      keywords: 'employee, profile, pdf',
      creationDate: new Date(),
    },
    pageSize: 'A4',
    pageMargins: [40, 40, 40, 40],
    
    content: [
      // Header with company logo and info
      {
        columns: [
          {
            width: '70%',
            stack: [
              {
                text: 'HRMS BPR BAPERA BATANG',
                style: 'companyName'
              },
              {
                text: 'SISTEM MANAJEMEN SUMBER DAYA MANUSIA',
                style: 'companySubtitle'
              }
            ]
          },
          {
            width: '30%',
            alignment: 'right',
            image: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', // Placeholder for company logo
            width: 80
          }
        ],
        margin: [0, 0, 0, 20]
      },
      
      // Title
      {
        text: 'PROFIL PEGAWAI',
        style: 'title'
      },
      
      // Summary section
      {
        style: 'summarySection',
        table: {
          widths: ['auto', '*', 'auto'],
          body: [
            [
              {
                image: avatarImage,
                width: 60,
                height: 60,
                margin: [0, 5, 10, 5],
                rowSpan: 2
              },
              [
                { text: employeeData.name, style: 'employeeName' },
                { 
                  text: `${employeeData.position} - ${employeeData.department}`, 
                  style: 'employeePosition' 
                }
              ],
              {
                stack: [
                  { 
                    text: employeeData.isActive !== 0 && employeeData.statusKaryawan !== 'nonaktif' ? 'Status: AKTIF' : 'Status: NONAKTIF', 
                    style: 'status' 
                  },
                  { 
                    text: `NIK: ${employeeData.nip || '-'}`, 
                    style: 'nik' 
                  }
                ],
                margin: [10, 15, 0, 0]
              }
            ],
            ['', '', ''] // Empty row to align with the avatar
          ]
        },
        layout: 'noBorders',
        margin: [0, 0, 0, 20]
      },
      
      // Personal Information Section
      {
        text: 'INFORMASI PRIBADI',
        style: 'sectionHeader'
      },
      {
        style: 'infoSection',
        table: {
          widths: [120, '*'],
          body: [
            ['Nama Lengkap', employeeData.name || '-'],
            ['NIK', employeeData.nip || '-'],
            ['Tempat, Tanggal Lahir', employeeData.pob && employeeData.dob ? `${employeeData.pob}, ${new Date(employeeData.dob).toLocaleDateString('id-ID')}` : '-'],
            ['Jenis Kelamin', employeeData.jenis_kelamin === 'L' ? 'Laki-laki' : employeeData.jenis_kelamin === 'P' ? 'Perempuan' : '-'],
            ['Agama', employeeData.religion || '-'],
            ['Status Perkawinan', employeeData.maritalStatus || '-'],
            ['Jumlah Anak', employeeData.numberOfChildren ? employeeData.numberOfChildren.toString() : '0'],
            ['Email', employeeData.email || '-'],
            ['Telepon', employeeData.phone || '-'],
            ['Alamat', employeeData.address || '-']
          ]
        },
        layout: {
          hLineWidth: function (i: any, node: any) {
            return (i === 0 || i === node.table.body.length) ? 2 : 0.5;
          },
          vLineWidth: function (i: any, node: any) {
            return 0;
          },
          hLineColor: function (i: any, node: any) {
            return i === 0 || i === node.table.body.length ? '#1e40af' : '#e5e7eb';
          }
        }
      },
      
      // Employment Information Section
      {
        text: 'INFORMASI KEPEGAWAIAN', 
        style: 'sectionHeader'
      },
      {
        style: 'infoSection',
        table: {
          widths: [120, '*'],
          body: [
            ['Unit Kerja', employeeData.department || '-'],
            ['Posisi', employeeData.position || '-'],
            ['Pangkat', employeeData.pangkat || '-'],
            ['Golongan', employeeData.golongan || '-'],
            ['Tanggal Bergabung', employeeData.joinDate ? new Date(employeeData.joinDate).toLocaleDateString('id-ID') : '-'],
            ['Masa Kerja', employeeData.joinDate 
              ? `${Math.floor((new Date().getTime() - new Date(employeeData.joinDate).getTime()) / (1000 * 60 * 60 * 24 * 365))} tahun` 
              : '-'],
            ['Status Kepegawaian', employeeData.isActive !== 0 && employeeData.statusKaryawan !== 'nonaktif' ? 'Aktif' : 'Nonaktif'],
            ['Sisa Cuti', employeeData.leaveBalance ? `${employeeData.leaveBalance} hari` : '0 hari']
          ]
        },
        layout: {
          hLineWidth: function (i: any, node: any) {
            return (i === 0 || i === node.table.body.length) ? 2 : 0.5;
          },
          vLineWidth: function (i: any, node: any) {
            return 0;
          },
          hLineColor: function (i: any, node: any) {
            return i === 0 || i === node.table.body.length ? '#1e40af' : '#e5e7eb';
          }
        }
      },
      
      // Job History Section
      ...(jobHistories && jobHistories.length > 0 ? [
        {
          text: 'RIWAYAT JABATAN',
          style: 'sectionHeader'
        },
        {
          style: 'infoSection',
          table: {
            widths: ['auto', '*', '*', 'auto'],
            headerRows: 1,
            body: [
              [
                { text: 'No', style: 'tableHeader', bold: true },
                { text: 'Jabatan Lama', style: 'tableHeader', bold: true },
                { text: 'Jabatan Baru', style: 'tableHeader', bold: true },
                { text: 'Tanggal Perubahan', style: 'tableHeader', bold: true }
              ],
              ...jobHistories.map((job, index) => [
                index + 1,
                { text: job.jabatan_lama || '-', style: 'tableCell' },
                { text: job.jabatan_baru || '-', style: 'tableCell' },
                { text: job.tanggal_perubahan ? new Date(job.tanggal_perubahan).toLocaleDateString('id-ID') : '-', style: 'tableCell' }
              ])
            ]
          },
          layout: {
            hLineWidth: function (i: any, node: any) {
              return 0.5;
            },
            vLineWidth: function (i: any, node: any) {
              return 0;
            },
            hLineColor: function (i: any, node: any) {
              return '#e5e7eb';
            }
          }
        }
      ] : []),
      
      // Training & Certificates Section
      ...(trainings && trainings.length > 0 ? [
        {
          text: 'RIWAYAT PELATIHAN & SERTIFIKAT',
          style: 'sectionHeader'
        },
        {
          style: 'infoSection',
          table: {
            widths: ['auto', '*', 'auto', 'auto'],
            headerRows: 1,
            body: [
              [
                { text: 'No', style: 'tableHeader', bold: true },
                { text: 'Nama Pelatihan', style: 'tableHeader', bold: true },
                { text: 'Penyelenggara', style: 'tableHeader', bold: true },
                { text: 'Tanggal', style: 'tableHeader', bold: true }
              ],
              ...trainings.map((training, index) => [
                index + 1,
                { text: training.nama_pelatihan || training.trainingName || '-', style: 'tableCell' },
                { text: training.penyelenggara || training.organizer || '-', style: 'tableCell' },
                { text: training.tanggal_mulai || training.startDate 
                  ? new Date(training.tanggal_mulai || training.startDate).toLocaleDateString('id-ID') 
                  : '-', style: 'tableCell' }
              ])
            ]
          },
          layout: {
            hLineWidth: function (i: any, node: any) {
              return 0.5;
            },
            vLineWidth: function (i: any, node: any) {
              return 0;
            },
            hLineColor: function (i: any, node: any) {
              return '#e5e7eb';
            }
          }
        }
      ] : []),
      
      // Footer
      {
        text: [
          { text: 'Dicetak pada: ', fontSize: 9, color: '#6b7280' },
          { text: new Date().toLocaleDateString('id-ID'), fontSize: 9, color: '#6b7280' },
          { text: ' | ', fontSize: 9, color: '#6b7280' },
          { text: '© ' + new Date().getFullYear() + ' HRMS BPR BAPERA BATANG', fontSize: 9, color: '#6b7280' }
        ],
        margin: [0, 30, 0, 0],
        alignment: 'center'
      }
    ],
    
    styles: {
      companyName: {
        fontSize: 16,
        bold: true,
        color: '#1e40af',
        alignment: 'left'
      },
      companySubtitle: {
        fontSize: 10,
        color: '#4b5563',
        alignment: 'left',
        margin: [0, 5, 0, 0]
      },
      title: {
        fontSize: 18,
        bold: true,
        alignment: 'center',
        margin: [0, 5, 0, 15],
        color: '#1e3a8a',
        decoration: 'underline'
      },
      summarySection: {
        margin: [0, 0, 0, 15]
      },
      employeeName: {
        fontSize: 16,
        bold: true,
        color: '#1e40af'
      },
      employeePosition: {
        fontSize: 12,
        color: '#374151',
        margin: [0, 3, 0, 0]
      },
      status: {
        fontSize: 10,
        color: employeeData.isActive !== 0 && employeeData.statusKaryawan !== 'nonaktif' ? '#10b981' : '#ef4444',
        bold: true
      },
      nik: {
        fontSize: 10,
        color: '#6b7280',
        margin: [0, 3, 0, 0]
      },
      sectionHeader: {
        fontSize: 14,
        bold: true,
        decoration: 'underline',
        color: '#1e3a8a',
        margin: [0, 15, 0, 10]
      },
      infoSection: {
        margin: [0, 5, 0, 15]
      },
      tableHeader: {
        fillColor: '#e5e7eb',
        bold: true,
        fontSize: 10,
        padding: [8, 8, 8, 8]
      },
      tableCell: {
        fontSize: 10,
        padding: [8, 8, 8, 8]
      }
    },
    
    defaultStyle: {
      fontSize: 10,
      color: '#374151'
    }
  };

  // Create and download the PDF
  pdfMake.createPdf(docDefinition).download(`Profil_Pegawai_${employeeData.name}.pdf`);
};