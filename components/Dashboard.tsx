
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Aircraft, Status } from '../types';

interface DashboardProps {
  fleet: Aircraft[];
}

const Dashboard: React.FC<DashboardProps> = ({ fleet }) => {
  const total = fleet.length;
  const faal = fleet.filter(a => a.durum === Status.FAAL).length;
  const gayriFaal = total - faal;

  const chartData = [
    { name: 'Faal', value: faal, color: '#10b981' }, // Emerald 500
    { name: 'Gayrı Faal', value: gayriFaal, color: '#ef4444' }, // Red 500
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
      <div className="bg-white/95 backdrop-blur p-6 rounded-2xl shadow-xl border-b-4 border-gray-300">
        <span className="text-gray-400 text-xs font-black uppercase tracking-widest">Toplam Filo Gücü</span>
        <div className="text-5xl font-black text-gray-800 mt-1">{total} <span className="text-xl font-bold text-gray-400">Ünite</span></div>
      </div>
      <div className="bg-white/95 backdrop-blur p-6 rounded-2xl shadow-xl border-b-4 border-green-500">
        <span className="text-green-600 text-xs font-black uppercase tracking-widest">Göreve Hazır (Faal)</span>
        <div className="text-5xl font-black text-green-700 mt-1">{faal}</div>
      </div>
      <div className="bg-white/95 backdrop-blur p-6 rounded-2xl shadow-xl border-b-4 border-red-500">
        <span className="text-red-600 text-xs font-black uppercase tracking-widest">Gayrı Faal Durum</span>
        <div className="text-5xl font-black text-red-700 mt-1">{gayriFaal}</div>
      </div>
      <div className="bg-white/95 backdrop-blur p-4 rounded-2xl shadow-xl h-32 border-b-4 border-blue-500">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={25}
              outerRadius={40}
              paddingAngle={5}
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
              ))}
            </Pie>
            <Tooltip 
               contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Dashboard;
