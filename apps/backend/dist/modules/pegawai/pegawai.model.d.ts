export interface Pegawai {
    id: string;
    nip: string;
    name: string;
    email: string;
    position: string;
    pangkat: string;
    golongan: string;
    department: string;
    joinDate: string;
    avatarUrl: string;
    leaveBalance: number;
    isActive: number;
    address: string;
    phone: string;
    pob: string;
    dob: string;
    religion: string;
    maritalStatus: string;
    numberOfChildren: number;
    educationHistory: any[];
    workHistory: any[];
    trainingCertificates: any[];
    payrollInfo: {
        baseSalary: number;
        incomes: any[];
        deductions: any[];
    };
}
//# sourceMappingURL=pegawai.model.d.ts.map