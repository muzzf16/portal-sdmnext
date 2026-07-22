import express from 'express';
import LaporanKepatuhanController from './src/modules/laporan-kepatuhan/laporan-kepatuhan.controller';

// Mock request and response to test the controller logic directly
const runTest = async () => {
    console.log('Testing LaporanKepatuhanController...');
    
    let mockResponse: any = {};
    const res: any = {
        status: (code: number) => {
            mockResponse.statusCode = code;
            return res;
        },
        json: (data: any) => {
            mockResponse.data = data;
            return res;
        }
    };
    const next = (err: any) => { mockResponse.error = err; };

    // 1. Create a report
    console.log('1. Testing create...');
    const reqCreate: any = {
        body: {
            nama_laporan: 'Laporan SLIK OJK',
            ketentuan: 'Berdasarkan POJK',
            periode: 'Januari 2026',
            tata_cara: 'Via APOLO',
            batas_akhir: '2026-02-12',
            bagian: 'Kasubid Analisa Kredit',
            employee_id: null // We will leave it null for testing
        }
    };
    await LaporanKepatuhanController.create(reqCreate, res, next);
    console.log('Create Response:', mockResponse);
    const createdId = mockResponse.data?.data?.id;

    if (createdId) {
        // 2. Get All
        console.log('2. Testing getAll...');
        const reqGetAll: any = { query: {} };
        await LaporanKepatuhanController.getAll(reqGetAll, res, next);
        console.log(`Found ${mockResponse.data?.data?.length} reports`);

        // 3. Update
        console.log('3. Testing update (Mark as Completed)...');
        const reqUpdate: any = {
            params: { id: createdId },
            body: { status: 'completed' }
        };
        await LaporanKepatuhanController.update(reqUpdate, res, next);
        console.log('Update Response:', mockResponse.data?.data?.status);

        // 4. Delete
        console.log('4. Testing delete...');
        const reqDelete: any = { params: { id: createdId } };
        await LaporanKepatuhanController.delete(reqDelete, res, next);
        console.log('Delete Response:', mockResponse.data);
    }
    
    console.log('Test completed.');
};

runTest();
