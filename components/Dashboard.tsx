
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Aircraft, Status, AircraftActivity } from '../types';

interface DashboardProps {
  fleet: Aircraft[];
  activities: AircraftActivity[];
  startDate: Date;
  endDate: Date;
  currentTime: Date;
}

const Dashboard: React.FC<DashboardProps> = ({ fleet, activities, startDate, endDate, currentTime }) => {
  const total = fleet.length;

  const faalList = fleet.filter(a => a.durum === Status.FAAL);
  const bakimList = fleet.filter(a => !faalList.includes(a) && a.durumAyrintisi && (
    (a.durumAyrintisi || '').toUpperCase().includes('BAKIM') || 
    (a.durumAyrintisi || '').toUpperCase().includes('KABUL') || 
    (a.durumAyrintisi || '').toUpperCase().includes('TEKNİK BÜLTEN')
  ));
  const parcaBeklerList = fleet.filter(a => !faalList.includes(a) && !bakimList.includes(a) && a.durumAyrintisi && (a.durumAyrintisi || '').toUpperCase().includes('PARÇA BEKLER'));
  const arizaList = fleet.filter(a => !faalList.includes(a) && !bakimList.includes(a) && !parcaBeklerList.includes(a));

  const chartData = [
    { name: 'Faal', value: faalList.length, color: '#10b981', aircrafts: faalList },
    { name: 'Bakım', value: bakimList.length, color: '#eab308', aircrafts: bakimList },
    { name: 'Arıza', value: arizaList.length, color: '#ef4444', aircrafts: arizaList },
  ];

  if (parcaBeklerList.length > 0) {
    chartData.push({ name: 'Parça Bekler', value: parcaBeklerList.length, color: '#f97316', aircrafts: parcaBeklerList });
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-4 rounded-xl shadow-2xl border border-gray-100 max-h-64 overflow-y-auto min-w-[150px]">
          <p className="text-sm font-black text-gray-800 mb-2 border-b pb-1 uppercase tracking-tighter">
            {data.name}: {data.value} Adet
          </p>
          <div className="flex flex-col gap-1">
            {data.aircrafts.map((a: Aircraft, i: number) => (
              <div key={i} className="flex justify-between items-center text-[10px] gap-4">
                <span className="font-bold text-gray-700">{a.kuyrukNo}</span>
                <span className="text-gray-400 italic">({a.tip})</span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  const renderCustomizedLabel = (props: any) => {
    const { cx, cy, midAngle, innerRadius, outerRadius, percent, payload } = props;
    if (!percent || percent === 0 || !payload || !payload.color) return null;
    const radius = outerRadius * 1.2;
    const x = cx + radius * Math.cos(-midAngle * Math.PI / 180);
    const y = cy + radius * Math.sin(-midAngle * Math.PI / 180);

    return (
      <text x={x} y={y} fill={payload.color} textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontSize={14} fontWeight="900" style={{ filter: 'drop-shadow(0 1px 1px rgba(0,0,0,0.1))' }}>
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
      <div className="bg-white/95 backdrop-blur p-6 rounded-2xl shadow-xl border-b-4 border-gray-300">
        <span className="text-gray-400 text-xs font-black uppercase tracking-widest">Toplam Filo Gücü</span>
        <div className="text-5xl font-black text-gray-800 mt-1">{total} <span className="text-xl font-bold text-gray-400">Ünite</span></div>
      </div>
      <div className="bg-white/95 backdrop-blur p-6 rounded-2xl shadow-xl border-b-4 border-green-500">
        <span className="text-green-600 text-xs font-black uppercase tracking-widest">Göreve Hazır (Faal Adedi)</span>
        <div className="text-5xl font-black text-green-700 mt-1">{faalList.length}</div>
      </div>
      <div className="bg-white/95 backdrop-blur p-6 rounded-2xl shadow-xl border-b-4 border-red-500">
        <span className="text-red-600 text-xs font-black uppercase tracking-widest">Gayrı Faal Adedi</span>
        <div className="text-5xl font-black text-red-700 mt-1">{total - faalList.length}</div>
      </div>
      <div className="bg-white/95 backdrop-blur p-4 rounded-2xl shadow-xl h-48 border-b-4 border-blue-500 flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={35}
              outerRadius={55}
              paddingAngle={5}
              dataKey="value"
              label={renderCustomizedLabel}
              labelLine={false}
              animationBegin={0}
              animationDuration={800}
            >
              {chartData.map((entry, index) => (
                entry && entry.color ? <Cell key={`cell-${index}`} fill={entry.color} stroke="none" /> : null
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Dashboard;
