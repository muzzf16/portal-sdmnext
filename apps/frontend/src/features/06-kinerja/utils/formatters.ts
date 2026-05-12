export const formatKpiValue = (val: number, unit: string) => {
    const u = (unit || '').toLowerCase();
    const isNominal = u.includes('rp') || u.includes('nominal') || u.includes('rupiah');

    if (isNominal) {
        if (val >= 1000000000) {
            const num = val / 1000000000;
            const formatted = parseFloat(num.toFixed(1));
            return `Rp ${formatted} Milyar`;
        }
        if (val >= 1000000) {
            const num = val / 1000000;
            const formatted = parseFloat(num.toFixed(1));
            return `Rp ${formatted} Juta`;
        }
        return new Intl.NumberFormat('id-ID', { 
            style: 'currency', 
            currency: 'IDR', 
            maximumFractionDigits: 0 
        }).format(val);
    }

    return `${val.toLocaleString('id-ID')} ${unit || '%'}`;
};
