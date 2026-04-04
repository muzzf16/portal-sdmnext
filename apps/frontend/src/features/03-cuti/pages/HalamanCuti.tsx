import React from 'react';
import DaftarCuti from '../components/DaftarCuti';
import KelolaJatahCuti from '../components/KelolaJatahCuti';
import PerhitunganSisaCuti from '../components/PerhitunganSisaCuti';


const HalamanCuti: React.FC = () => {
  return (
    <div>
      <h1 className="text-3xl font-bold text-primary-dark-blue dark:text-white">Cuti &amp; Izin</h1>
      <KelolaJatahCuti />
      <DaftarCuti />
      <PerhitunganSisaCuti />
    </div>
  );
};

export default HalamanCuti;
