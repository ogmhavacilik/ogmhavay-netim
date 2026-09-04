import React, { useState, useMemo } from 'react';
import { Aircraft, Status } from '../types';
import { MapPin, Plane, Helicopter, ShieldCheck, AlertTriangle, Download, Search, LayoutGrid, Table, ArrowUpDown, Filter, FileSpreadsheet, Globe } from 'lucide-react';
import { exportLocationStatusToExcel, exportLocationStatusToHtml } from '../src/services/locationStatusExcelService';

interface LocationStatusGridProps {
  fleet: Aircraft[];
  onSelectAircraft?: (aircraft: Aircraft) => void;
  onExportExcel?: () => void;
  searchTermExternal?: string;
  filterTypeExternal?: string;
}

// Standart bilinen filo tipleri
const KNOWN_TYPES = ['T-70', 'AT-802', 'Bell-429', 'B-360', 'C-650'];

// Helikopter tipleri tespiti (T-70, Bell 429 vb.)
export const isHelicopterType = (tip?: string): boolean => {
  if (!tip) return false;
  const t = tip.toLocaleUpperCase('tr-TR');
  return t.includes('T-70') || t.includes('T70') || t.includes('BELL') || t.includes('429') || t.includes('HELİ') || t.includes('HELI');
};

// Hava aracı tipine göre simge seçimi (T-70 ve Bell-429 için Helikopter, diğerleri için Uçak)
export const getAircraftTypeIcon = (tip?: string, className = "w-4 h-4") => {
  if (isHelicopterType(tip)) {
    return <Helicopter className={className} />;
  }
  return <Plane className={className} />;
};

// Tabloda her ile farklı, göz yormayan, baskın olmayan hafif pastel renk dolguları
const LOCATION_ROW_STYLES = [
  {
    rowBg: 'bg-emerald-50/40 hover:bg-emerald-100/60',
    pinBg: 'bg-emerald-100 text-emerald-800 border-emerald-300/80',
    borderAccent: 'border-l-4 border-l-emerald-500',
    statBadge: 'bg-emerald-100/80 text-emerald-800'
  },
  {
    rowBg: 'bg-sky-50/40 hover:bg-sky-100/60',
    pinBg: 'bg-sky-100 text-sky-800 border-sky-300/80',
    borderAccent: 'border-l-4 border-l-sky-500',
    statBadge: 'bg-sky-100/80 text-sky-800'
  },
  {
    rowBg: 'bg-amber-50/40 hover:bg-amber-100/60',
    pinBg: 'bg-amber-100 text-amber-800 border-amber-300/80',
    borderAccent: 'border-l-4 border-l-amber-500',
    statBadge: 'bg-amber-100/80 text-amber-800'
  },
  {
    rowBg: 'bg-violet-50/35 hover:bg-violet-100/55',
    pinBg: 'bg-violet-100 text-violet-800 border-violet-300/80',
    borderAccent: 'border-l-4 border-l-violet-500',
    statBadge: 'bg-violet-100/80 text-violet-800'
  },
  {
    rowBg: 'bg-teal-50/40 hover:bg-teal-100/60',
    pinBg: 'bg-teal-100 text-teal-800 border-teal-300/80',
    borderAccent: 'border-l-4 border-l-teal-500',
    statBadge: 'bg-teal-100/80 text-teal-800'
  },
  {
    rowBg: 'bg-rose-50/35 hover:bg-rose-100/55',
    pinBg: 'bg-rose-100 text-rose-800 border-rose-300/80',
    borderAccent: 'border-l-4 border-l-rose-500',
    statBadge: 'bg-rose-100/80 text-rose-800'
  },
  {
    rowBg: 'bg-blue-50/40 hover:bg-blue-100/60',
    pinBg: 'bg-blue-100 text-blue-800 border-blue-300/80',
    borderAccent: 'border-l-4 border-l-blue-500',
    statBadge: 'bg-blue-100/80 text-blue-800'
  },
  {
    rowBg: 'bg-orange-50/35 hover:bg-orange-100/55',
    pinBg: 'bg-orange-100 text-orange-800 border-orange-300/80',
    borderAccent: 'border-l-4 border-l-orange-500',
    statBadge: 'bg-orange-100/80 text-orange-800'
  },
  {
    rowBg: 'bg-cyan-50/40 hover:bg-cyan-100/60',
    pinBg: 'bg-cyan-100 text-cyan-800 border-cyan-300/80',
    borderAccent: 'border-l-4 border-l-cyan-500',
    statBadge: 'bg-cyan-100/80 text-cyan-800'
  },
  {
    rowBg: 'bg-indigo-50/35 hover:bg-indigo-100/55',
    pinBg: 'bg-indigo-100 text-indigo-800 border-indigo-300/80',
    borderAccent: 'border-l-4 border-l-indigo-500',
    statBadge: 'bg-indigo-100/80 text-indigo-800'
  },
  {
    rowBg: 'bg-lime-50/40 hover:bg-lime-100/60',
    pinBg: 'bg-lime-100 text-lime-800 border-lime-300/80',
    borderAccent: 'border-l-4 border-l-lime-500',
    statBadge: 'bg-lime-100/80 text-lime-800'
  },
  {
    rowBg: 'bg-slate-50/70 hover:bg-slate-100/80',
    pinBg: 'bg-slate-200/80 text-slate-800 border-slate-300/80',
    borderAccent: 'border-l-4 border-l-slate-400',
    statBadge: 'bg-slate-200/80 text-slate-800'
  },
];

export const LocationStatusGrid: React.FC<LocationStatusGridProps> = ({
  fleet,
  onSelectAircraft,
  onExportExcel
}) => {
  const [localSearch, setLocalSearch] = useState('');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('Tümü');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<'TÜMÜ' | 'FAAL' | 'GAYRI_FAAL'>('TÜMÜ');
  const [viewMode, setViewMode] = useState<'matrix' | 'cards'>('matrix');
  const [sortByCount, setSortByCount] = useState(true);

  // Normalleştirilmiş konum adı (Öğretici kurallar: ANKARA (VIP) -> ANKARA, YANIKLAR/FETHİYE -> MUĞLA, BODRUM/GÜVERCİNLİK -> MUĞLA, MİLAS -> MUĞLA)
  const normalizeLocation = (loc?: string): string => {
    if (!loc) return 'BELİRTİLMEMİŞ';
    const clean = loc.trim().toLocaleUpperCase('tr-TR');
    if (clean === '-' || clean === '' || clean === 'YOK' || clean === 'BELIRTILMEMIS' || clean === 'BELİRTİLMEMİŞ') {
      return 'MERKEZ / BELİRTİLMEMİŞ';
    }

    // Öğretici Bilgi: ANKARA (VIP) ile ANKARA aynıdır -> ANKARA
    if (clean.includes('ANKARA') && clean.includes('VIP')) {
      return 'ANKARA';
    }

    // Öğretici Bilgi: YANIKLAR/FETHİYE ile MUĞLA aynıdır -> MUĞLA
    if (clean.includes('YANIKLAR') || clean.includes('FETHİYE') || clean.includes('FETHIYE')) {
      return 'MUĞLA';
    }

    // Öğretici Bilgi: BODRUM/GÜVERCİNLİK ile MUĞLA aynıdır -> MUĞLA
    if (clean.includes('BODRUM') || clean.includes('GÜVERCİNLİK') || clean.includes('GUVERCINLIK')) {
      return 'MUĞLA';
    }

    // Öğretici Bilgi: MİLAS ile MUĞLA aynıdır -> MUĞLA (AT-802 Muğla'da tek bölge)
    if (clean.includes('MİLAS') || clean.includes('MILAS')) {
      return 'MUĞLA';
    }

    return clean;
  };

  // Alt Konum / Meydan Detayı (Ör: Yanıklar / Fethiye, Bodrum / Güvercinlik, VIP)
  // NOT: MİLAS = MUĞLA'dır ve ayrıca belirtilmesine gerek yoktur (AT-802 Muğla'da tek bölge olduğu için detay gizlenir)
  const getSubLocationDetail = (aircraft: Aircraft, groupLoc?: string): string | null => {
    const raw = (aircraft.konum || '').trim();
    if (!raw || raw === '-' || raw === 'YOK' || raw.toLocaleUpperCase('tr-TR') === 'BELİRTİLMEMİŞ') {
      return null;
    }

    const upper = raw.toLocaleUpperCase('tr-TR');

    // 0. Öğretici Kural: MİLAS eşittir MUĞLA'dır ve ayrıca belirtilmez
    if (upper === 'MİLAS' || upper === 'MILAS' || upper === 'MUĞLA / MİLAS' || upper === 'MUĞLA/MİLAS' || upper === 'MUĞLA (MİLAS)' || upper === 'MİLAS MEYDAN' || upper === 'MILAS MEYDAN') {
      return null;
    }

    // 1. Bodrum / Güvercinlik
    if (upper.includes('BODRUM') && (upper.includes('GÜVERCİNLİK') || upper.includes('GUVERCINLIK'))) {
      return 'Bodrum / Güvercinlik';
    }
    if (upper.includes('BODRUM')) {
      return 'Bodrum';
    }
    if (upper.includes('GÜVERCİNLİK') || upper.includes('GUVERCINLIK')) {
      return 'Güvercinlik';
    }

    // 2. Yanıklar / Fethiye
    if (upper.includes('YANIKLAR') && (upper.includes('FETHİYE') || upper.includes('FETHIYE'))) {
      return 'Yanıklar / Fethiye';
    }
    if (upper.includes('FETHİYE') || upper.includes('FETHIYE')) {
      return 'Fethiye';
    }
    if (upper.includes('YANIKLAR')) {
      return 'Yanıklar';
    }

    // 3. VIP kontrolü
    if (upper.includes('VIP')) {
      return 'VIP';
    }

    // Milas içeriyorsa ve başka özel alt meydan yoksa ayrıca belirtme
    if (upper.includes('MİLAS') || upper.includes('MILAS')) {
      return null;
    }

    // 4. Parantez içi detay (örn: "ANKARA (VIP)")
    const parenMatch = raw.match(/\((.*?)\)/);
    if (parenMatch && parenMatch[1] && parenMatch[1].trim()) {
      const pText = parenMatch[1].trim();
      const pUpper = pText.toLocaleUpperCase('tr-TR');
      if (pUpper.includes('MİLAS') || pUpper.includes('MILAS')) {
        return null;
      }
      return pText;
    }

    // 5. Bölü işareti kontrolü (örn: "MUĞLA / BODRUM" veya "ANTALYA / KARAİN")
    if (raw.includes('/')) {
      const parts = raw.split('/').map(p => p.trim()).filter(Boolean);
      if (parts.length > 1) {
        let sub: string;
        if (groupLoc && parts[0].toLocaleUpperCase('tr-TR') === groupLoc.toLocaleUpperCase('tr-TR')) {
          sub = parts.slice(1).join(' / ');
        } else {
          sub = parts.join(' / ');
        }
        const subUpper = sub.toLocaleUpperCase('tr-TR');
        if (subUpper.includes('MİLAS') || subUpper.includes('MILAS')) {
          return null;
        }
        return sub;
      }
    }

    // 6. Eğer ham konum il isminden farklı bir alt merkezse (Milas hariç)
    if (groupLoc && upper !== groupLoc.toLocaleUpperCase('tr-TR')) {
      if (upper.includes('MİLAS') || upper.includes('MILAS')) {
        return null;
      }
      return raw;
    }

    return null;
  };

  // Dinamik uçak tipleri listesi
  const aircraftTypes = useMemo(() => {
    const set = new Set<string>(KNOWN_TYPES);
    fleet.forEach(a => {
      if (a.tip && a.tip.trim()) {
        set.add(a.tip.trim());
      }
    });
    return Array.from(set);
  }, [fleet]);

  // Filtrelenmiş liste
  const filteredFleet = useMemo(() => {
    return fleet.filter(a => {
      // Tip filtresi
      if (selectedTypeFilter !== 'Tümü' && a.tip !== selectedTypeFilter) {
        return false;
      }
      // Durum filtresi
      if (selectedStatusFilter === 'FAAL' && a.durum !== Status.FAAL && a.durum !== Status.FAAL_FIREBOSS_GOREVI_YAPAMAZ) {
        return false;
      }
      if (selectedStatusFilter === 'GAYRI_FAAL' && a.durum === Status.FAAL) {
        return false;
      }
      // Arama filtresi (Konum, Kuyruk No, Çağrı Kodu, Tip)
      if (localSearch.trim()) {
        const query = localSearch.trim().toLocaleLowerCase('tr-TR');
        const origLoc = (a.konum || '').toLocaleLowerCase('tr-TR');
        const normLoc = normalizeLocation(a.konum).toLocaleLowerCase('tr-TR');
        const tail = (a.kuyrukNo || '').toLocaleLowerCase('tr-TR');
        const call = (a.cagriKodu || '').toLocaleLowerCase('tr-TR');
        const tip = (a.tip || '').toLocaleLowerCase('tr-TR');
        if (!normLoc.includes(query) && !origLoc.includes(query) && !tail.includes(query) && !call.includes(query) && !tip.includes(query)) {
          return false;
        }
      }
      return true;
    });
  }, [fleet, selectedTypeFilter, selectedStatusFilter, localSearch]);

  // Konumlara göre gruplama
  const locationGroups = useMemo(() => {
    const map = new Map<string, Aircraft[]>();

    filteredFleet.forEach(aircraft => {
      const loc = normalizeLocation(aircraft.konum);
      if (!map.has(loc)) {
        map.set(loc, []);
      }
      map.get(loc)!.push(aircraft);
    });

    const groups = Array.from(map.entries()).map(([location, aircrafts]) => {
      const faalCount = aircrafts.filter(a => a.durum === Status.FAAL || a.durum === Status.FAAL_FIREBOSS_GOREVI_YAPAMAZ).length;
      const gayriFaalCount = aircrafts.length - faalCount;

      // Tiplere göre alt dağılım
      const byType: Record<string, Aircraft[]> = {};
      aircraftTypes.forEach(t => { byType[t] = []; });
      aircrafts.forEach(a => {
        const tipKey = a.tip?.trim() || 'Diğer';
        if (!byType[tipKey]) byType[tipKey] = [];
        byType[tipKey].push(a);
      });

      return {
        location,
        aircrafts,
        total: aircrafts.length,
        faalCount,
        gayriFaalCount,
        byType
      };
    });

    // Sıralama
    if (sortByCount) {
      groups.sort((a, b) => b.total - a.total || a.location.localeCompare(b.location, 'tr-TR'));
    } else {
      groups.sort((a, b) => a.location.localeCompare(b.location, 'tr-TR'));
    }

    return groups;
  }, [filteredFleet, aircraftTypes, sortByCount]);

  // Genel İstatistikler
  const stats = useMemo(() => {
    const totalLocations = locationGroups.length;
    const totalAircraft = filteredFleet.length;
    const totalFaal = filteredFleet.filter(a => a.durum === Status.FAAL || a.durum === Status.FAAL_FIREBOSS_GOREVI_YAPAMAZ).length;
    const totalGayriFaal = totalAircraft - totalFaal;
    return { totalLocations, totalAircraft, totalFaal, totalGayriFaal };
  }, [locationGroups, filteredFleet]);

  // Tip bazlı genel toplamlar (Tablo altı için)
  const columnTotals = useMemo(() => {
    const totals: Record<string, { total: number; faal: number; gayriFaal: number }> = {};
    aircraftTypes.forEach(t => {
      totals[t] = { total: 0, faal: 0, gayriFaal: 0 };
    });

    filteredFleet.forEach(a => {
      const tipKey = a.tip?.trim() || 'Diğer';
      if (!totals[tipKey]) {
        totals[tipKey] = { total: 0, faal: 0, gayriFaal: 0 };
      }
      totals[tipKey].total += 1;
      if (a.durum === Status.FAAL || a.durum === Status.FAAL_FIREBOSS_GOREVI_YAPAMAZ) {
        totals[tipKey].faal += 1;
      } else {
        totals[tipKey].gayriFaal += 1;
      }
    });

    return totals;
  }, [filteredFleet, aircraftTypes]);

  // Excel (.xls Web Sayfası Formatı) Dışa Aktarma
  const handleExportExcel = () => {
    exportLocationStatusToExcel({
      locationGroups,
      aircraftTypes,
      columnTotals,
      stats,
      getSubLocationDetail
    });
  };

  // Bağımsız Web Sayfası (.html Formatı) Dışa Aktarma
  const handleExportHtml = () => {
    exportLocationStatusToHtml({
      locationGroups,
      aircraftTypes,
      columnTotals,
      stats,
      getSubLocationDetail
    });
  };

  return (
    <div className="mb-24 animate-in fade-in duration-500">
      {/* Üst Başlık & İstatistik Kartları */}
      <div className="bg-gradient-to-br from-[#042414] via-[#02180d] to-[#010e07] border-2 border-emerald-600/30 rounded-[2.5rem] p-6 sm:p-8 shadow-2xl mb-8 relative overflow-hidden">
        {/* Dekoratif Işık Efekti */}
        <div className="absolute top-0 right-1/4 w-96 h-40 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 rounded-2xl text-emerald-400 shadow-lg shadow-emerald-950">
                <MapPin className="w-7 h-7 animate-pulse" />
              </div>
              <div>
                <span className="text-emerald-400 font-black text-xs uppercase tracking-[0.3em]">
                  OGM HAVA FİLOSU KONUŞLANMA
                </span>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white uppercase tracking-tight italic">
                  KONUM DURUM ÇİZELGESİ
                </h2>
              </div>
            </div>
            <p className="text-gray-300 text-xs sm:text-sm font-medium ml-1">
              Günlük durum raporundaki canlı il/meydan konuşlanmaları ve hava aracı tiplerine göre anlık konuşlu filo matrisi.
            </p>
          </div>

          {/* İstatistik Göstergeleri */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full lg:w-auto">
            <div className="bg-black/50 border border-emerald-500/20 rounded-2xl p-3.5 flex flex-col items-center justify-center shadow-lg">
              <span className="text-[10px] text-emerald-400 font-black uppercase tracking-wider">MEYDAN / İL</span>
              <span className="text-2xl font-black text-white mt-1">{stats.totalLocations}</span>
              <span className="text-[9px] text-gray-400">Konuşlu Üs</span>
            </div>
            <div className="bg-black/50 border border-blue-500/20 rounded-2xl p-3.5 flex flex-col items-center justify-center shadow-lg">
              <span className="text-[10px] text-blue-400 font-black uppercase tracking-wider">TOPLAM ARAÇ</span>
              <span className="text-2xl font-black text-white mt-1">{stats.totalAircraft}</span>
              <span className="text-[9px] text-gray-400">Envanter</span>
            </div>
            <div className="bg-black/50 border border-emerald-500/30 rounded-2xl p-3.5 flex flex-col items-center justify-center shadow-lg bg-emerald-950/20">
              <span className="text-[10px] text-emerald-400 font-black uppercase tracking-wider flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> FAAL
              </span>
              <span className="text-2xl font-black text-emerald-400 mt-1">{stats.totalFaal}</span>
              <span className="text-[9px] text-emerald-500/80">Göreve Hazır</span>
            </div>
            <div className="bg-black/50 border border-red-500/30 rounded-2xl p-3.5 flex flex-col items-center justify-center shadow-lg bg-red-950/20">
              <span className="text-[10px] text-red-400 font-black uppercase tracking-wider flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5 text-red-400" /> G. FAAL
              </span>
              <span className="text-2xl font-black text-red-400 mt-1">{stats.totalGayriFaal}</span>
              <span className="text-[9px] text-red-400/80">Bakım / Arıza</span>
            </div>
          </div>
        </div>

        {/* Kontrol & Filtre Çubuğu */}
        <div className="mt-6 pt-6 border-t border-white/10 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            {/* Arama Input */}
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-emerald-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                placeholder="Konum veya kuyruk ara (Muğla, OR-1019...)"
                className="w-full bg-black/60 text-white pl-10 pr-4 py-2.5 rounded-xl border border-white/15 outline-none font-bold text-xs focus:border-emerald-500 transition-all placeholder:text-gray-500 placeholder:font-normal"
              />
            </div>

            {/* Tip Seçimi */}
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-emerald-500 hidden sm:block" />
              <select
                value={selectedTypeFilter}
                onChange={(e) => setSelectedTypeFilter(e.target.value)}
                className="bg-black/60 text-white px-3 py-2.5 rounded-xl border border-white/15 outline-none font-bold text-xs focus:border-emerald-500 transition-all"
              >
                <option value="Tümü">Tüm Tipler</option>
                {aircraftTypes.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            {/* Durum Filtresi */}
            <div className="flex bg-black/60 p-1 rounded-xl border border-white/15">
              <button
                onClick={() => setSelectedStatusFilter('TÜMÜ')}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${
                  selectedStatusFilter === 'TÜMÜ' ? 'bg-emerald-600 text-white shadow' : 'text-gray-400 hover:text-white'
                }`}
              >
                TÜMÜ
              </button>
              <button
                onClick={() => setSelectedStatusFilter('FAAL')}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${
                  selectedStatusFilter === 'FAAL' ? 'bg-emerald-600 text-white shadow' : 'text-gray-400 hover:text-white'
                }`}
              >
                FAAL
              </button>
              <button
                onClick={() => setSelectedStatusFilter('GAYRI_FAAL')}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${
                  selectedStatusFilter === 'GAYRI_FAAL' ? 'bg-red-700 text-white shadow' : 'text-gray-400 hover:text-white'
                }`}
              >
                G. FAAL
              </button>
            </div>
          </div>

          {/* Sağ Butonlar (Sıralama, Görünüm Modu ve Excel) */}
          <div className="flex items-center gap-2.5 w-full md:w-auto justify-between md:justify-end">
            <button
              onClick={() => setSortByCount(!sortByCount)}
              title={sortByCount ? 'Alfabetik Sırala' : 'Uçak Sayısına Göre Sırala'}
              className="bg-black/60 hover:bg-white/10 text-gray-300 hover:text-white px-3 py-2.5 rounded-xl border border-white/15 text-xs font-bold flex items-center gap-1.5 transition-all"
            >
              <ArrowUpDown className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline text-[11px]">{sortByCount ? 'Sayıya Göre' : 'A-Z İsim'}</span>
            </button>

            {/* Görünüm Değiştirici */}
            <div className="flex bg-black/60 p-1 rounded-xl border border-white/15">
              <button
                onClick={() => setViewMode('matrix')}
                className={`p-2 rounded-lg transition-all flex items-center gap-1.5 text-xs font-black ${
                  viewMode === 'matrix' ? 'bg-emerald-600 text-white shadow' : 'text-gray-400 hover:text-white'
                }`}
                title="Matris Tablo Görünümü"
              >
                <Table className="w-4 h-4" />
                <span className="hidden sm:inline text-[10px] uppercase tracking-wider">Tablo</span>
              </button>
              <button
                onClick={() => setViewMode('cards')}
                className={`p-2 rounded-lg transition-all flex items-center gap-1.5 text-xs font-black ${
                  viewMode === 'cards' ? 'bg-emerald-600 text-white shadow' : 'text-gray-400 hover:text-white'
                }`}
                title="Şehir / Konum Kartları Görünümü"
              >
                <LayoutGrid className="w-4 h-4" />
                <span className="hidden sm:inline text-[10px] uppercase tracking-wider">Kartlar</span>
              </button>
            </div>

            {/* Excel / Web Sayfası İndir Butonları */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleExportExcel}
                title="Tüm renkleri, kutucukları ve tablo tasarımını koruyan Excel (.xls Web Sayfası) olarak indir"
                className="bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white px-4 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider shadow-lg shadow-emerald-950/40 flex items-center gap-2 transition-all cursor-pointer"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-200" />
                <span>EXCEL İNDİR</span>
              </button>

              <button
                onClick={handleExportHtml}
                title="Birebir web sayfası tasarımıyla HTML formatında indir"
                className="bg-emerald-950/80 hover:bg-emerald-900 active:scale-95 text-emerald-300 border border-emerald-600/50 hover:border-emerald-500 px-3.5 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider shadow-md flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Globe className="w-4 h-4 text-emerald-400" />
                <span className="hidden xl:inline text-[11px]">WEB SAYFASI</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* İÇERİK: MATRİS TABLO GÖRÜNÜMÜ */}
      {viewMode === 'matrix' ? (
        <div className="bg-white rounded-[2rem] p-4 sm:p-6 shadow-2xl border-4 border-emerald-800/20 overflow-hidden">
          <div className="overflow-x-auto pb-4">
            <table id="location-status-table" className="w-full text-left border-collapse min-w-[920px]">
              <thead>
                <tr className="bg-[#032514] text-white border-b-2 border-emerald-600">
                  <th className="py-4 px-3 font-black text-[11px] uppercase tracking-wider text-emerald-400 w-12 text-center rounded-tl-xl border-r border-emerald-700/60">
                    NO
                  </th>
                  <th className="py-4 px-5 font-black text-xs uppercase tracking-widest text-emerald-300 min-w-[190px] border-r border-emerald-700/60">
                    KONUM / MEYDAN (İL)
                  </th>
                  {aircraftTypes.map(tip => {
                    const isHeli = isHelicopterType(tip);
                    return (
                      <th
                        key={tip}
                        className="py-4 px-3 font-black text-xs uppercase tracking-wider text-center text-white min-w-[160px] border-r border-emerald-700/60 bg-emerald-950/40"
                      >
                        <div
                          className={`inline-flex items-center justify-center gap-2 py-1.5 px-3 rounded-xl border shadow-sm ${
                            isHeli
                              ? 'bg-amber-950/40 border-amber-500/40 text-amber-200'
                              : 'bg-emerald-900/60 border-emerald-600/50 text-emerald-100'
                          }`}
                        >
                          {getAircraftTypeIcon(tip, isHeli ? 'w-4 h-4 text-amber-400 shrink-0' : 'w-4 h-4 text-emerald-400 shrink-0')}
                          <span className="tracking-wide text-xs font-black">{tip}</span>
                        </div>
                      </th>
                    );
                  })}
                  <th className="py-4 px-5 font-black text-xs uppercase tracking-widest text-center text-emerald-300 min-w-[150px] rounded-tr-xl">
                    TOPLAM
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200/90">
                {locationGroups.length === 0 ? (
                  <tr>
                    <td colSpan={aircraftTypes.length + 3} className="text-center py-16 text-gray-500 font-bold">
                      Arama kriterlerine uygun konuşlanma kaydı bulunamadı.
                    </td>
                  </tr>
                ) : (
                  locationGroups.map((group, idx) => {
                    const rowStyle = LOCATION_ROW_STYLES[idx % LOCATION_ROW_STYLES.length];
                    return (
                      <tr
                        key={group.location}
                        className={`${rowStyle.rowBg} ${rowStyle.borderAccent} transition-colors border-b border-gray-200/90`}
                      >
                        {/* Sıra No - Tatlı Dikey Çizgi */}
                        <td className="py-4 px-3 text-center font-black text-xs text-gray-400 border-r border-gray-200/80">
                          {idx + 1}
                        </td>

                        {/* Konum / İl - Tatlı Dikey Çizgi */}
                        <td className="py-4 px-5 border-r border-gray-200/80">
                          <div className="flex items-center gap-3">
                            <div className={`w-9 h-9 rounded-xl ${rowStyle.pinBg} flex items-center justify-center shrink-0 shadow-sm border`}>
                              <MapPin className="w-4 h-4" />
                            </div>
                            <div>
                              <div className="font-black text-sm text-gray-900 tracking-wide uppercase">
                                {group.location}
                              </div>
                              <div className="text-[11px] font-semibold text-gray-600 flex items-center gap-2 mt-0.5">
                                <span className="font-bold text-gray-700">{group.total} Araç</span>
                                <span className="text-emerald-700 font-bold">({group.faalCount} Faal)</span>
                                {group.gayriFaalCount > 0 && (
                                  <span className="text-red-600 font-extrabold">({group.gayriFaalCount} G.Faal)</span>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Her Hava Aracı Tipi Sütunu - Tatlı Dikey Çizgi */}
                        {aircraftTypes.map(tip => {
                          const aircraftList = group.byType[tip] || [];
                          return (
                            <td key={tip} className="py-3 px-3 align-middle text-center border-r border-gray-200/80">
                              {aircraftList.length === 0 ? (
                                <span className="text-gray-300 font-bold text-base select-none">—</span>
                              ) : (
                                <div className="flex flex-wrap gap-1.5 justify-center items-center">
                                  {aircraftList.map(ac => {
                                    const isFaal = ac.durum === Status.FAAL || ac.durum === Status.FAAL_FIREBOSS_GOREVI_YAPAMAZ;
                                    const subDetail = getSubLocationDetail(ac, group.location);
                                    return (
                                      <button
                                        key={ac.kuyrukNo}
                                        onClick={() => onSelectAircraft && onSelectAircraft(ac)}
                                        title={`${ac.kuyrukNo} (${ac.cagriKodu || 'Çağrı Kodu Yok'})\nTip: ${ac.tip || tip}\nKonum: ${ac.konum || group.location}${subDetail ? ` (${subDetail})` : ''}\nDurum: ${ac.durum} - ${ac.durumTipi || ''}\nAyrıntı: ${ac.durumAyrintisi || '-'}\nKalan Faydalı: ${ac.faydaliSaat ?? '-'} saat\nDetay için tıklayın`}
                                        className={`group px-2.5 py-1.5 rounded-xl border text-xs font-black transition-all flex flex-col items-center shadow-sm hover:scale-105 hover:shadow-md cursor-pointer ${
                                          isFaal
                                            ? 'bg-white hover:bg-emerald-50 text-emerald-900 border-emerald-300/90'
                                            : 'bg-red-50 hover:bg-red-100 text-red-900 border-red-300/90'
                                        }`}
                                      >
                                        <div className="flex items-center gap-1.5">
                                          <span className={`w-2 h-2 rounded-full shrink-0 ${isFaal ? 'bg-emerald-600 animate-pulse' : 'bg-red-600'}`} />
                                          <span className="tracking-wider">{ac.kuyrukNo}</span>
                                        </div>
                                        {ac.cagriKodu && (
                                          <span className="text-[9px] font-bold text-gray-600 group-hover:text-gray-900 -mt-0.5">
                                            {ac.cagriKodu}
                                          </span>
                                        )}
                                        {subDetail && (
                                          <span
                                            className={`text-[8.5px] font-black tracking-tight leading-tight mt-0.5 px-1.5 py-0.5 rounded border ${
                                              isFaal
                                                ? 'text-emerald-800 bg-emerald-50 border-emerald-200/80'
                                                : 'text-red-800 bg-red-50 border-red-200/80'
                                            }`}
                                          >
                                            ({subDetail})
                                          </span>
                                        )}
                                        {!isFaal && (
                                          <span className="text-[8px] font-black uppercase text-red-700 mt-0.5 bg-red-200/70 px-1.5 rounded">
                                            {ac.durumTipi || 'BAKIMDA'}
                                          </span>
                                        )}
                                      </button>
                                    );
                                  })}
                                </div>
                              )}
                            </td>
                          );
                        })}

                        {/* Toplam Sütunu */}
                        <td className="py-4 px-5 text-center">
                          <div className="inline-flex flex-col items-center">
                            <span className="text-base font-black text-gray-900">{group.total}</span>
                            <div className="flex items-center gap-1.5 text-[10px] font-black mt-0.5">
                              <span className="text-emerald-700 bg-emerald-100/90 px-2 py-0.5 rounded-md">
                                {group.faalCount} FAAL
                              </span>
                              {group.gayriFaalCount > 0 && (
                                <span className="text-red-700 bg-red-100/90 px-2 py-0.5 rounded-md">
                                  {group.gayriFaalCount} G.F.
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
              {/* Genel Toplam Satırı */}
              <tfoot>
                <tr className="bg-[#032514] text-white font-black border-t-2 border-emerald-500">
                  <td colSpan={2} className="py-4 px-6 text-right uppercase tracking-widest text-emerald-400 text-xs border-r border-emerald-700/60">
                    GENEL TOPLAM ({stats.totalLocations} İL / MEYDAN):
                  </td>
                  {aircraftTypes.map(tip => {
                    const col = columnTotals[tip] || { total: 0, faal: 0, gayriFaal: 0 };
                    return (
                      <td key={tip} className="py-4 px-3 text-center border-r border-emerald-700/60 bg-emerald-950/40">
                        <div className="text-sm font-black text-white">{col.total}</div>
                        <div className="text-[9px] font-bold text-emerald-300 mt-0.5">
                          {col.faal} Faal {col.gayriFaal > 0 && <span className="text-red-300">/ {col.gayriFaal} G.F.</span>}
                        </div>
                      </td>
                    );
                  })}
                  <td className="py-4 px-5 text-center">
                    <div className="text-base font-black text-white">{stats.totalAircraft}</div>
                    <div className="text-[10px] font-black text-emerald-300 mt-0.5">
                      {stats.totalFaal} F / {stats.totalGayriFaal} GF
                    </div>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      ) : (
        /* İÇERİK: ŞEHİR / MEYDAN KARTLARI GÖRÜNÜMÜ */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {locationGroups.map(group => (
            <div
              key={group.location}
              className="bg-white rounded-[2rem] p-6 shadow-xl border-2 border-emerald-800/20 hover:border-emerald-500 transition-all flex flex-col justify-between"
            >
              {/* Kart Üst Başlık */}
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-emerald-100 text-emerald-800 rounded-xl border border-emerald-200 shadow-sm">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-gray-900 uppercase tracking-wide">
                        {group.location}
                      </h3>
                      <p className="text-[11px] font-bold text-gray-500">
                        Toplam {group.total} Konuşlu Hava Aracı
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] font-black">
                    <span className="bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-lg">
                      {group.faalCount} FAAL
                    </span>
                    {group.gayriFaalCount > 0 && (
                      <span className="bg-red-100 text-red-800 px-2.5 py-1 rounded-lg">
                        {group.gayriFaalCount} G.FAAL
                      </span>
                    )}
                  </div>
                </div>

                {/* Tiplere Göre Ayrılmış Uçak Listeleri */}
                <div className="space-y-4">
                  {aircraftTypes.map(tip => {
                    const aircraftList = group.byType[tip] || [];
                    if (aircraftList.length === 0) return null;
                    const isHeli = isHelicopterType(tip);

                    return (
                      <div key={tip} className="bg-gray-50/80 rounded-2xl p-3 border border-gray-200/80">
                        <div className="flex items-center justify-between mb-2 px-1">
                          <div className="flex items-center gap-1.5 text-xs font-black text-gray-800 uppercase tracking-wider">
                            {getAircraftTypeIcon(tip, isHeli ? 'w-4 h-4 text-amber-600' : 'w-4 h-4 text-emerald-600')}
                            <span>{tip}</span>
                          </div>
                          <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                            {aircraftList.length} Adet
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {aircraftList.map(ac => {
                            const isFaal = ac.durum === Status.FAAL || ac.durum === Status.FAAL_FIREBOSS_GOREVI_YAPAMAZ;
                            const subDetail = getSubLocationDetail(ac, group.location);
                            return (
                              <button
                                key={ac.kuyrukNo}
                                onClick={() => onSelectAircraft && onSelectAircraft(ac)}
                                className={`text-left p-2.5 rounded-xl border transition-all hover:scale-[1.02] cursor-pointer ${
                                  isFaal
                                    ? 'bg-white hover:bg-emerald-50/50 border-emerald-200 text-gray-900 shadow-sm'
                                    : 'bg-red-50/60 hover:bg-red-100/50 border-red-200 text-red-950 shadow-sm'
                                }`}
                              >
                                <div className="flex items-center justify-between">
                                  <span className="font-black text-xs text-gray-900">{ac.kuyrukNo}</span>
                                  <span className={`w-2 h-2 rounded-full ${isFaal ? 'bg-emerald-600' : 'bg-red-600'}`} />
                                </div>
                                <div className="flex flex-wrap items-center gap-1 text-[10px] font-bold text-gray-600 mt-0.5">
                                  <span>{ac.cagriKodu || '-'}</span>
                                  {subDetail && (
                                    <span className="text-[8.5px] font-black text-emerald-800 bg-emerald-100/90 border border-emerald-200/80 px-1.5 py-0.5 rounded">
                                      ({subDetail})
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center justify-between mt-2 pt-1 border-t border-gray-100 text-[9px] font-bold">
                                  <span className={isFaal ? 'text-emerald-700' : 'text-red-700'}>
                                    {isFaal ? 'FAAL' : (ac.durumTipi || 'BAKIMDA')}
                                  </span>
                                  {ac.faydaliSaat !== null && ac.faydaliSaat !== undefined && (
                                    <span className="text-gray-500">
                                      {ac.faydaliSaat} Saat
                                    </span>
                                  )}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Alt Bilgi */}
              <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-400 font-semibold">
                <span>OGM Havacılık Dairesi</span>
                <span className="text-emerald-700 font-black">Detay İçin Tıklayın →</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
