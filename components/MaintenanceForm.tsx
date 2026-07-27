
import React, { useState } from 'react';
import { Aircraft, Status, StatusType } from '../types';

interface MaintenanceFormProps {
  aircraft: Aircraft;
  onSave: (updated: Partial<Aircraft>) => void;
  onCancel: () => void;
}

const MaintenanceForm: React.FC<MaintenanceFormProps> = ({ aircraft, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    durum: aircraft.durum,
    durumTipi: aircraft.durumTipi,
    durumAyrintisi: aircraft.durumAyrintisi,
    konum: aircraft.konum,
    aciklama: aircraft.aciklama
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      guncellemeTarihi: new Date().toISOString().replace('T', ' ').substring(0, 16)
    });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <form onSubmit={handleSubmit} className="bg-white w-full max-w-md rounded-2xl overflow-hidden shadow-2xl animate-in fade-in slide-in-from-bottom-4">
        <div className="bg-[#1b5e20] text-white p-4">
          <h2 className="text-lg font-bold">Durum Güncelle: {aircraft.kuyrukNo}</h2>
        </div>
        
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Durum</label>
            <select 
              value={formData.durum}
              onChange={(e) => setFormData({...formData, durum: e.target.value as Status})}
              className="w-full p-2 border rounded-lg bg-gray-50 font-medium"
            >
              <option value={Status.FAAL}>FAAL</option>
              <option value={Status.FAAL_YANGIN_GOREVI_YAPAMAZ}>FAAL YANGIN GÖREVİ YAPAMAZ</option>
              <option value={Status.GAYRI_FAAL}>GAYRI FAAL</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Durum Tipi</label>
              <select 
                value={formData.durumTipi}
                onChange={(e) => setFormData({...formData, durumTipi: e.target.value as StatusType})}
                className="w-full p-2 border rounded-lg bg-gray-50 font-medium"
              >
                <option value={StatusType.NONE}>Yok</option>
                <option value={StatusType.BAKIM}>Bakım</option>
                <option value={StatusType.ARIZA}>Arıza</option>
                <option value={StatusType.DIGER}>Diğer</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Konum</label>
              <input 
                type="text"
                value={formData.konum}
                onChange={(e) => setFormData({...formData, konum: e.target.value.toUpperCase()})}
                className="w-full p-2 border rounded-lg bg-gray-50 font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Ayrıntı</label>
            <input 
              type="text"
              value={formData.durumAyrintisi}
              placeholder="Örn: 200H Bakım, Motor Arızası"
              onChange={(e) => setFormData({...formData, durumAyrintisi: e.target.value})}
              className="w-full p-2 border rounded-lg bg-gray-50 font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Açıklama</label>
            <textarea 
              value={formData.aciklama}
              onChange={(e) => setFormData({...formData, aciklama: e.target.value})}
              rows={3}
              className="w-full p-2 border rounded-lg bg-gray-50 font-medium"
              placeholder="Arıza detayları veya operasyonel notlar..."
            ></textarea>
          </div>
        </div>

        <div className="bg-gray-50 p-4 border-t flex justify-end space-x-3">
          <button type="button" onClick={onCancel} className="px-4 py-2 text-sm font-bold text-gray-500 hover:text-gray-700">İptal</button>
          <button type="submit" className="px-6 py-2 text-sm font-bold text-white bg-green-600 hover:bg-green-700 rounded-lg shadow-md">Kaydet</button>
        </div>
      </form>
    </div>
  );
};

export default MaintenanceForm;
