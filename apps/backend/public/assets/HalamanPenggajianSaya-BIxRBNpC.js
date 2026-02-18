import{a as $,r as l,j as i}from"./index-Bxn4Ppb0.js";import{g as k}from"./penggajianApi-CGovfwx-.js";import{D as I}from"./DetailPenggajian-Mu3BSFOM.js";import{C as v}from"./Card-B5gIPDWn.js";import{S}from"./Select-eP7tFnZ9.js";import{B as D}from"./Button-DUMgwkrX.js";import{u as N}from"./useCompanySettings-BrmREYMD.js";import{u as z}from"./usePegawai-DT9mRqQ7.js";import"./arrow-left-CKRuQRfv.js";import"./useQuery-C_kx9Ks3.js";import"./employeeApi-DGMoOg0N.js";const L=(a,n,t)=>{const s=window.open("","_blank");if(!s){alert("Please allow pop-ups to print the payslip.");return}const p=a.incomes.reduce((e,r)=>e+r.amount,0),o=a.deductions.reduce((e,r)=>e+r.amount,0),f=a.baseSalary+p-o,c=`
    <html>
      <head>
        <title>Slip Gaji - ${a.period} - ${n.name}</title>
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
              <h1>${(t==null?void 0:t.companyName)||"Nama Perusahaan"}</h1>
              <p>${(t==null?void 0:t.address)||"Alamat Perusahaan"}</p>
            </div>
            ${t!=null&&t.logo?`<img src="${t.logo}" alt="Company Logo" class="company-logo">`:""}
          </header>

          <div class="payslip-title">
            <h2>SLIP GAJI</h2>
            <p>Periode: ${a.period}</p>
          </div>

          <dl class="employee-details">
            <div class="detail-item">
              <dt>Nama Karyawan</dt>
              <dd>${n.name}</dd>
            </div>
            <div class="detail-item">
              <dt>NIP</dt>
              <dd>${n.nip}</dd>
            </div>
            <div class="detail-item">
              <dt>Jabatan</dt>
              <dd>${n.position}</dd>
            </div>
            <div class="detail-item">
              <dt>Tanggal Pembayaran</dt>
              <dd>${new Date(a.tanggalPembayaran).toLocaleDateString("id-ID")}</dd>
            </div>
          </dl>

          <div class="salary-details">
            <div class="earnings">
              <h3 class="section-title">Pendapatan</h3>
              <div class="salary-item">
                <span>Gaji Pokok</span>
                <span>Rp ${a.baseSalary.toLocaleString("id-ID")}</span>
              </div>
              ${a.incomes.map(e=>`
                <div class="salary-item">
                  <span>${e.name}</span>
                  <span>Rp ${e.amount.toLocaleString("id-ID")}</span>
                </div>
              `).join("")}
              <div class="total-row">
                <span>Total Pendapatan</span>
                <span>Rp ${(a.baseSalary+p).toLocaleString("id-ID")}</span>
              </div>
            </div>
            <div class="deductions">
              <h3 class="section-title">Potongan</h3>
              ${a.deductions.map(e=>`
                <div class="salary-item">
                  <span>${e.name}</span>
                  <span>Rp ${e.amount.toLocaleString("id-ID")}</span>
                </div>
              `).join("")}
              <div class="total-row">
                <span>Total Potongan</span>
                <span>Rp ${o.toLocaleString("id-ID")}</span>
              </div>
            </div>
          </div>

          <div class="net-salary">
            <div class="net-salary-row">
              <span class="net-salary-label">Gaji Bersih</span>
              <span class="net-salary-amount">Rp ${f.toLocaleString("id-ID")}</span>
            </div>
          </div>

          <div class="footer">
            <p>Ini adalah slip gaji yang dibuat secara otomatis. Harap simpan untuk referensi Anda.</p>
          </div>
        </div>
      </body>
    </html>
  `;s.document.write(c),s.document.close(),s.focus(),setTimeout(()=>{s.print(),s.close()},600)},W=()=>{const{user:a}=$(),[n,t]=l.useState([]),[s,p]=l.useState(""),[o,f]=l.useState(null),[c,e]=l.useState(!0),[r,j]=l.useState(null),{data:x}=N();console.log("Company Settings:",x);const{pegawai:b}=z((a==null?void 0:a.employeeId)||"");l.useEffect(()=>{(async()=>{if(a)try{e(!0);const{data:m}=await k({}),g=m.filter(u=>u.employeeId===a.employeeId);if(t(g),g.length>0){const u=g.reduce((h,y)=>y.period>h?y.period:h,g[0].period);p(u)}e(!1)}catch{j("Gagal memuat data penggajian"),e(!1)}})()},[a]),l.useEffect(()=>{if(s){const d=n.find(m=>m.period===s);f(d||null)}},[s,n]);const w=()=>{if(!o||!b){alert("Pilih periode gaji terlebih dahulu atau data pegawai tidak ditemukan.");return}L(o,b,x)},P=[...new Set(n.map(d=>d.period))];return i.jsxs("div",{className:"p-6 bg-gray-50 min-h-screen",children:[i.jsx("h1",{className:"text-3xl font-bold text-primary-dark-blue mb-6",children:"Penggajian Saya"}),i.jsxs(v,{className:"p-4 mb-6",children:[i.jsx("h2",{className:"text-xl font-bold mb-4",children:"Pilih Periode"}),i.jsxs("div",{className:"flex items-center space-x-4",children:[i.jsx(S,{id:"periode-gaji",label:"Periode Gaji",value:s,onChange:d=>p(d.target.value),options:P.map(d=>({value:d,label:d})),className:"w-[280px]"}),i.jsx(D,{onClick:w,disabled:!o,children:"Cetak Slip Gaji"})]})]}),c&&i.jsx("p",{children:"Memuat data penggajian..."}),r&&i.jsx("p",{className:"text-red-500",children:r}),!c&&!r&&o&&i.jsx(I,{payrollId:o.id}),!c&&!o&&i.jsx(v,{className:"p-6",children:i.jsx("p",{children:"Data gaji untuk periode yang dipilih tidak ditemukan."})})]})};export{W as default};
