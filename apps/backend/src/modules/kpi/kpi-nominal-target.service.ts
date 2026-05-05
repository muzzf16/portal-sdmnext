import { openDb } from '../../config/db';

export interface KpiNominalTarget {
    id: number;
    employee_id: string;
    category: 'npl' | 'kredit' | 'dana';
    target_amount: number;
    notes?: string;
    updated_by?: string;
    created_at?: string;
    updated_at?: string;
}

export interface EmployeeNominalTargets {
    npl: number;
    kredit: number;
    dana: number;
}

// Default fallback values
const DEFAULTS: EmployeeNominalTargets = {
    npl: 50000000,
    kredit: 100000000,
    dana: 100000000,
};

export class KpiNominalTargetService {
    /**
     * Get all nominal targets (admin view)
     */
    static async getAll(): Promise<KpiNominalTarget[]> {
        const db = await openDb();
        return db.all('SELECT * FROM kpi_nominal_targets ORDER BY employee_id, category');
    }

    /**
     * Get dynamic defaults from activity library
     */
    static async getDynamicDefaults(): Promise<EmployeeNominalTargets> {
        const db = await openDb();
        const libraryItems = await db.all(
            "SELECT activityName, default_nominal FROM activity_library WHERE activityName LIKE '%NPL%' OR activityName LIKE '%PEMASARAN KREDIT%' OR activityName LIKE '%PEMASARAN DANA%'"
        );

        const result = { ...DEFAULTS };
        for (const item of libraryItems) {
            const name = (item.activityName || '').toUpperCase();
            if (item.default_nominal !== null && item.default_nominal !== undefined) {
                if (name.includes('NPL')) result.npl = item.default_nominal;
                else if (name.includes('PEMASARAN KREDIT')) result.kredit = item.default_nominal;
                else if (name.includes('PEMASARAN DANA')) result.dana = item.default_nominal;
            }
        }
        return result;
    }

    /**
     * Get nominal targets for a specific employee
     */
    static async getByEmployeeId(employeeId: string): Promise<EmployeeNominalTargets> {
        const db = await openDb();
        const rows = await db.all(
            'SELECT category, target_amount FROM kpi_nominal_targets WHERE employee_id = ?',
            employeeId
        ) as Pick<KpiNominalTarget, 'category' | 'target_amount'>[];

        const dynamicDefaults = await this.getDynamicDefaults();
        const result: EmployeeNominalTargets = { ...dynamicDefaults };
        for (const row of rows) {
            if (row.category === 'npl') result.npl = row.target_amount;
            else if (row.category === 'kredit') result.kredit = row.target_amount;
            else if (row.category === 'dana') result.dana = row.target_amount;
        }
        return result;
    }

    /**
     * Get nominal targets for multiple employees at once (batch)
     */
    static async getByEmployeeIds(employeeIds: string[]): Promise<Record<string, EmployeeNominalTargets>> {
        if (employeeIds.length === 0) return {};

        const db = await openDb();
        const placeholders = employeeIds.map(() => '?').join(',');
        const rows = await db.all(
            `SELECT employee_id, category, target_amount FROM kpi_nominal_targets WHERE employee_id IN (${placeholders})`,
            ...employeeIds
        ) as Pick<KpiNominalTarget, 'employee_id' | 'category' | 'target_amount'>[];

        const dynamicDefaults = await this.getDynamicDefaults();
        const result: Record<string, EmployeeNominalTargets> = {};
        for (const empId of employeeIds) {
            result[empId] = { ...dynamicDefaults };
        }
        for (const row of rows) {
            if (!result[row.employee_id]) {
                result[row.employee_id] = { ...dynamicDefaults };
            }
            if (row.category === 'npl') result[row.employee_id].npl = row.target_amount;
            else if (row.category === 'kredit') result[row.employee_id].kredit = row.target_amount;
            else if (row.category === 'dana') result[row.employee_id].dana = row.target_amount;
        }
        return result;
    }

    /**
     * Set/update a nominal target for an employee + category (upsert)
     */
    static async upsert(
        employeeId: string,
        category: 'npl' | 'kredit' | 'dana',
        targetAmount: number,
        updatedBy?: string,
        notes?: string
    ): Promise<KpiNominalTarget> {
        const db = await openDb();
        const now = new Date().toISOString();

        await db.run(
            `INSERT INTO kpi_nominal_targets (employee_id, category, target_amount, notes, updated_by, created_at, updated_at)
             VALUES (?, ?, ?, ?, ?, ?, ?)
             ON CONFLICT(employee_id, category)
             DO UPDATE SET target_amount = ?, notes = ?, updated_by = ?, updated_at = ?`,
            employeeId, category, targetAmount, notes || null, updatedBy || null, now, now,
            targetAmount, notes || null, updatedBy || null, now
        );

        const result = await db.get(
            'SELECT * FROM kpi_nominal_targets WHERE employee_id = ? AND category = ?',
            employeeId, category
        ) as KpiNominalTarget;

        return result;
    }

    /**
     * Bulk upsert targets for an employee (all 3 categories at once)
     */
    static async bulkUpsert(
        employeeId: string,
        targets: Partial<EmployeeNominalTargets>,
        updatedBy?: string
    ): Promise<EmployeeNominalTargets> {
        if (targets.npl !== undefined) {
            await this.upsert(employeeId, 'npl', targets.npl, updatedBy);
        }
        if (targets.kredit !== undefined) {
            await this.upsert(employeeId, 'kredit', targets.kredit, updatedBy);
        }
        if (targets.dana !== undefined) {
            await this.upsert(employeeId, 'dana', targets.dana, updatedBy);
        }
        return this.getByEmployeeId(employeeId);
    }

    /**
     * Get default values (for reference)
     */
    static getDefaults(): EmployeeNominalTargets {
        return { ...DEFAULTS };
    }
}
