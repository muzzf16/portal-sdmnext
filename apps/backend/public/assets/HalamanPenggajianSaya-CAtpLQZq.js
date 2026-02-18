import{j as e,g as k,a as $,r as c}from"./index-C16ccCUI.js";import{g as I}from"./penggajianApi-Q1NY97Dz.js";import{D as N}from"./DetailPenggajian-CtGEKvSG.js";import{C as v}from"./Card-hn3Iq0Yo.js";import{B as D}from"./Button-odyuiJPQ.js";import{u as S}from"./useCompanySettings-D7Wceu3O.js";import{u as z}from"./usePegawai-BJlEtKSU.js";import"./arrow-left-Dw3tOudp.js";import"./useQuery-D1H_989J.js";import"./employeeApi-BGBa5uPe.js";const L=({label:a,id:o,options:i,error:t,className:n,...r})=>e.jsxs("div",{className:"mb-4",children:[e.jsx("label",{htmlFor:o,className:"block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1",children:a}),e.jsx("select",{id:o,className:k("block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm",t?"border-red-500 focus:ring-red-500 focus:border-red-500":"border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100",n),...r,children:i.map(l=>e.jsx("option",{value:l.value,children:l.label},l.value))}),t&&e.jsx("p",{className:"mt-1 text-sm text-red-600 dark:text-red-400",children:t})]}),C=(a,o,i)=>{const t=window.open("","_blank");if(!t){alert("Please allow pop-ups to print the payslip.");return}const n=a.incomes.reduce((s,p)=>s+p.amount,0),r=a.deductions.reduce((s,p)=>s+p.amount,0),l=a.baseSalary+n-r,m=`
    <html>
      <head>
        <title>Slip Gaji - ${a.period} - ${o.name}</title>
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
              <h1>${(i==null?void 0:i.companyName)||"Nama Perusahaan"}</h1>
              <p>${(i==null?void 0:i.address)||"Alamat Perusahaan"}</p>
            </div>
            ${i!=null&&i.logo?`<img src="${i.logo}" alt="Company Logo" class="company-logo">`:""}
          </header>

          <div class="payslip-title">
            <h2>SLIP GAJI</h2>
            <p>Periode: ${a.period}</p>
          </div>

          <dl class="employee-details">
            <div class="detail-item">
              <dt>Nama Karyawan</dt>
              <dd>${o.name}</dd>
            </div>
            <div class="detail-item">
              <dt>NIP</dt>
              <dd>${o.nip}</dd>
            </div>
            <div class="detail-item">
              <dt>Jabatan</dt>
              <dd>${o.position}</dd>
            </div>
            <div class="detail-item">
              <dt>Tanggal Pembayaran</dt>
              <dd>${a.tanggalPembayaran?new Date(a.tanggalPembayaran).toLocaleDateString("id-ID"):"-"}</dd>
            </div>
          </dl>

          <div class="salary-details">
            <div class="earnings">
              <h3 class="section-title">Pendapatan</h3>
              <div class="salary-item">
                <span>Gaji Pokok</span>
                <span>Rp ${a.baseSalary.toLocaleString("id-ID")}</span>
              </div>
              ${a.incomes.map(s=>`
                <div class="salary-item">
                  <span>${s.name}</span>
                  <span>Rp ${s.amount.toLocaleString("id-ID")}</span>
                </div>
              `).join("")}
              <div class="total-row">
                <span>Total Pendapatan</span>
                <span>Rp ${(a.baseSalary+n).toLocaleString("id-ID")}</span>
              </div>
            </div>
            <div class="deductions">
              <h3 class="section-title">Potongan</h3>
              ${a.deductions.map(s=>`
                <div class="salary-item">
                  <span>${s.name}</span>
                  <span>Rp ${s.amount.toLocaleString("id-ID")}</span>
                </div>
              `).join("")}
              <div class="total-row">
                <span>Total Potongan</span>
                <span>Rp ${r.toLocaleString("id-ID")}</span>
              </div>
            </div>
          </div>

          <div class="net-salary">
            <div class="net-salary-row">
              <span class="net-salary-label">Gaji Bersih</span>
              <span class="net-salary-amount">Rp ${l.toLocaleString("id-ID")}</span>
            </div>
          </div>

          <div class="footer">
            <p>Ini adalah slip gaji yang dibuat secara otomatis. Harap simpan untuk referensi Anda.</p>
          </div>
        </div>
      </body>
    </html>
  `;t.document.write(m),t.document.close(),t.focus(),setTimeout(()=>{t.print(),t.close()},600)},M=()=>{const{user:a}=$(),[o,i]=c.useState([]),[t,n]=c.useState(""),[r,l]=c.useState(null),[m,s]=c.useState(!0),[p,j]=c.useState(null),{data:x}=S();console.log("Company Settings:",x);const{pegawai:b}=z((a==null?void 0:a.employeeId)||"");c.useEffect(()=>{(async()=>{if(a)try{s(!0);const{data:f}=await I({}),u=f.filter(g=>g.employeeId===a.employeeId&&(g.status==="Final"||g.status==="Paid"));if(i(u),u.length>0){const g=u.reduce((h,y)=>y.period>h?y.period:h,u[0].period);n(g)}s(!1)}catch{j("Gagal memuat data penggajian"),s(!1)}})()},[a]),c.useEffect(()=>{if(t){const d=o.find(f=>f.period===t);l(d||null)}},[t,o]);const w=()=>{if(!r||!b){alert("Pilih periode gaji terlebih dahulu atau data pegawai tidak ditemukan.");return}C(r,b,x)},P=[...new Set(o.map(d=>d.period))];return e.jsxs("div",{className:"p-6 bg-gray-50 min-h-screen",children:[e.jsx("h1",{className:"text-3xl font-bold text-primary-dark-blue mb-6",children:"Penggajian Saya"}),e.jsxs(v,{className:"p-4 mb-6",children:[e.jsx("h2",{className:"text-xl font-bold mb-4",children:"Pilih Periode"}),e.jsxs("div",{className:"flex items-center space-x-4",children:[e.jsx(L,{id:"periode-gaji",label:"Periode Gaji",value:t,onChange:d=>n(d.target.value),options:P.map(d=>({value:d,label:d})),className:"w-[280px]"}),e.jsx(D,{onClick:w,disabled:!r,children:"Cetak Slip Gaji"})]})]}),m&&e.jsx("p",{children:"Memuat data penggajian..."}),p&&e.jsx("p",{className:"text-red-500",children:p}),!m&&!p&&r&&e.jsx(N,{payrollId:r.id}),!m&&!r&&e.jsx(v,{className:"p-6",children:e.jsx("p",{children:"Data gaji untuk periode yang dipilih tidak ditemukan."})})]})};export{M as default};
