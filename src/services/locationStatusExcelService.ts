import { Aircraft, Status } from '../../types';

export interface LocationGroupData {
  location: string;
  aircrafts: Aircraft[];
  total: number;
  faalCount: number;
  gayriFaalCount: number;
  byType: Record<string, Aircraft[]>;
}

export interface LocationStatusStats {
  totalLocations: number;
  totalAircraft: number;
  totalFaal: number;
  totalGayriFaal: number;
}

export interface LocationStatusExcelOptions {
  locationGroups: LocationGroupData[];
  aircraftTypes: string[];
  columnTotals: Record<string, { total: number; faal: number; gayriFaal: number }>;
  stats: LocationStatusStats;
  dateStr?: string;
  getSubLocationDetail?: (ac: Aircraft, loc: string) => string | null;
}

// 12 Farklı Yumuşak/Pastel Satır Teması (Web arayüzüyle birebir eşleşen renkler)
const EXCEL_ROW_STYLES = [
  { rowBg: '#f0fdf4', accentBorder: '#10b981', pinBg: '#d1fae5', pinText: '#065f46' }, // Emerald
  { rowBg: '#f0f9ff', accentBorder: '#0284c7', pinBg: '#e0f2fe', pinText: '#0369a1' }, // Sky
  { rowBg: '#fffbeb', accentBorder: '#d97706', pinBg: '#fef3c7', pinText: '#92400e' }, // Amber
  { rowBg: '#faf5ff', accentBorder: '#7c3aed', pinBg: '#ede9fe', pinText: '#5b21b6' }, // Violet
  { rowBg: '#f0fdfa', accentBorder: '#0d9488', pinBg: '#ccfbf1', pinText: '#115e59' }, // Teal
  { rowBg: '#fff1f2', accentBorder: '#e11d48', pinBg: '#ffe4e6', pinText: '#9f1239' }, // Rose
  { rowBg: '#eff6ff', accentBorder: '#2563eb', pinBg: '#dbeafe', pinText: '#1e40af' }, // Blue
  { rowBg: '#fff7ed', accentBorder: '#ea580c', pinBg: '#ffedd5', pinText: '#9a3412' }, // Orange
  { rowBg: '#ecfeff', accentBorder: '#0891b2', pinBg: '#cffafe', pinText: '#155e75' }, // Cyan
  { rowBg: '#fdf4ff', accentBorder: '#c026d3', pinBg: '#fae8ff', pinText: '#86198f' }, // Fuchsia
  { rowBg: '#f7fee7', accentBorder: '#65a30d', pinBg: '#ecfccb', pinText: '#3f6212' }, // Lime
  { rowBg: '#eef2ff', accentBorder: '#4f46e5', pinBg: '#e0e7ff', pinText: '#3730a3' }, // Indigo
];

export const generateLocationStatusExcelHtml = ({
  locationGroups,
  aircraftTypes,
  columnTotals,
  stats,
  dateStr = new Date().toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
  getSubLocationDetail
}: LocationStatusExcelOptions): string => {
  const isHelicopter = (tip: string) => {
    const clean = tip.toUpperCase();
    return clean.includes('T-70') || clean.includes('T70') || clean.includes('BELL') || clean.includes('429');
  };

  const totalCols = 2 + aircraftTypes.length + 1; // NO + KONUM + TIPIER + TOPLAM

  // Tablo Başlıkları HTML
  const tableHeadersHtml = `
    <tr style="background-color: #032514; color: #ffffff;">
      <th style="width: 48px; padding: 12px 6px; font-size: 11px; font-weight: 900; text-align: center; vertical-align: middle; border: 1px solid #047857; color: #a7f3d0;">
        NO
      </th>
      <th style="width: 240px; padding: 12px 14px; font-size: 12px; font-weight: 900; text-align: left; vertical-align: middle; border: 1px solid #047857; color: #ffffff;">
        KONUM / MEYDAN (İL)
      </th>
      ${aircraftTypes.map(tip => {
        const isHeli = isHelicopter(tip);
        const badgeBg = isHeli ? '#451a03' : '#064e3b';
        const badgeBorder = isHeli ? '#d97706' : '#059669';
        const badgeColor = isHeli ? '#fef3c7' : '#d1fae5';
        const icon = isHeli ? '🚁' : '✈️';
        return `
          <th style="min-width: 140px; padding: 10px 8px; text-align: center; vertical-align: middle; border: 1px solid #047857;">
            <div style="display: inline-block; background-color: ${badgeBg}; border: 1px solid ${badgeBorder}; color: ${badgeColor}; padding: 4px 10px; border-radius: 8px; font-size: 11px; font-weight: 900; letter-spacing: 0.5px; white-space: nowrap;">
              <span>${icon} ${tip}</span>
            </div>
          </th>
        `;
      }).join('')}
      <th style="width: 130px; padding: 12px 8px; font-size: 12px; font-weight: 900; text-align: center; vertical-align: middle; border: 1px solid #047857; color: #6ee7b7;">
        TOPLAM
      </th>
    </tr>
  `;

  // Satırlar HTML
  const tableRowsHtml = locationGroups.map((group, idx) => {
    const style = EXCEL_ROW_STYLES[idx % EXCEL_ROW_STYLES.length];
    return `
      <tr style="background-color: ${style.rowBg};">
        <!-- NO -->
        <td style="text-align: center; vertical-align: middle; font-size: 12px; font-weight: 900; color: #64748b; border: 1px solid #cbd5e1; border-left: 5px solid ${style.accentBorder};">
          ${idx + 1}
        </td>

        <!-- KONUM / MEYDAN -->
        <td style="padding: 10px 14px; vertical-align: middle; border: 1px solid #cbd5e1; text-align: left;">
          <div style="display: inline-block; background-color: ${style.pinBg}; color: ${style.pinText}; border: 1px solid ${style.accentBorder}40; padding: 3px 8px; border-radius: 6px; font-size: 12px; font-weight: 900; letter-spacing: 0.5px; text-transform: uppercase;">
            📍 ${group.location}
          </div>
          <div style="font-size: 10.5px; font-weight: 700; color: #475569; margin-top: 4px;">
            <span style="font-weight: 900; color: #0f172a;">${group.total} Araç</span>
            <span style="color: #047857; font-weight: 800; margin-left: 4px;">(${group.faalCount} Faal)</span>
            ${group.gayriFaalCount > 0 ? `<span style="color: #dc2626; font-weight: 900; margin-left: 4px;">(${group.gayriFaalCount} G.Faal)</span>` : ''}
          </div>
        </td>

        <!-- HAVA ARACI TİPLERİ -->
        ${aircraftTypes.map(tip => {
          const aircraftList = group.byType[tip] || [];
          return `
            <td style="padding: 6px 4px; text-align: center; vertical-align: middle; border: 1px solid #cbd5e1;">
              ${aircraftList.length === 0 ? `
                <span style="color: #cbd5e1; font-size: 16px; font-weight: bold;">—</span>
              ` : `
                <table style="margin: 0 auto; border-collapse: separate; border-spacing: 4px;">
                  <tr>
                    ${aircraftList.map(ac => {
                      const isFaal = ac.durum === Status.FAAL || ac.durum === Status.FAAL_FIREBOSS_GOREVI_YAPAMAZ;
                      const subDetail = getSubLocationDetail ? getSubLocationDetail(ac, group.location) : null;
                      const cardBg = isFaal ? '#ffffff' : '#fef2f2';
                      const cardBorder = isFaal ? '#6ee7b7' : '#fca5a5';
                      const dotColor = isFaal ? '#10b981' : '#ef4444';
                      const tailColor = isFaal ? '#065f46' : '#991b1b';

                      return `
                        <td style="background-color: ${cardBg}; border: 1px solid ${cardBorder}; border-radius: 8px; padding: 5px 8px; text-align: center; vertical-align: middle; box-shadow: 0 1px 2px rgba(0,0,0,0.05); min-width: 96px;">
                          <!-- Kuyruk No + Durum Noktası -->
                          <div style="font-size: 11px; font-weight: 900; color: ${tailColor}; white-space: nowrap;">
                            <span style="color: ${dotColor}; font-size: 12px; line-height: 1;">●</span>
                            <span style="letter-spacing: 0.5px;">${ac.kuyrukNo}</span>
                          </div>

                          <!-- Çağrı Kodu -->
                          ${ac.cagriKodu ? `
                            <div style="font-size: 9.5px; font-weight: 700; color: #4b5563; margin-top: 1px; white-space: nowrap;">
                              ${ac.cagriKodu}
                            </div>
                          ` : ''}

                          <!-- Alt Meydan / Konum Detayı -->
                          ${subDetail ? `
                            <div style="font-size: 8.5px; font-weight: 800; color: ${isFaal ? '#047857' : '#991b1b'}; background-color: ${isFaal ? '#ecfdf5' : '#fee2e2'}; border: 1px solid ${isFaal ? '#a7f3d0' : '#fecaca'}; padding: 1px 4px; border-radius: 4px; margin-top: 2px; white-space: nowrap;">
                              (${subDetail})
                            </div>
                          ` : ''}

                          <!-- Gayri Faal Durum Etiketi -->
                          ${!isFaal ? `
                            <div style="font-size: 8px; font-weight: 900; color: #b91c1c; background-color: #fee2e2; border-radius: 3px; padding: 1px 4px; margin-top: 2px; text-transform: uppercase; white-space: nowrap;">
                              ${ac.durumTipi || 'BAKIMDA'}
                            </div>
                          ` : ''}
                        </td>
                      `;
                    }).join('')}
                  </tr>
                </table>
              `}
            </td>
          `;
        }).join('')}

        <!-- TOPLAM -->
        <td style="padding: 10px 8px; text-align: center; vertical-align: middle; border: 1px solid #cbd5e1;">
          <div style="font-size: 15px; font-weight: 900; color: #0f172a;">
            ${group.total}
          </div>
          <div style="margin-top: 2px; white-space: nowrap;">
            <span style="display: inline-block; font-size: 9.5px; font-weight: 800; color: #047857; background-color: #d1fae5; border: 1px solid #a7f3d0; padding: 1px 5px; border-radius: 4px;">
              ${group.faalCount} FAAL
            </span>
            ${group.gayriFaalCount > 0 ? `
              <span style="display: inline-block; font-size: 9.5px; font-weight: 800; color: #b91c1c; background-color: #fee2e2; border: 1px solid #fecaca; padding: 1px 5px; border-radius: 4px; margin-left: 2px;">
                ${group.gayriFaalCount} G.F.
              </span>
            ` : ''}
          </div>
        </td>
      </tr>
    `;
  }).join('');

  // Alt Genel Toplam Satırı HTML
  const footerRowHtml = `
    <tr style="background-color: #032514; color: #ffffff; border-top: 3px solid #059669;">
      <td colspan="2" style="padding: 14px 16px; text-align: right; vertical-align: middle; border: 1px solid #047857;">
        <div style="font-size: 13px; font-weight: 900; color: #34d399; letter-spacing: 1px; text-transform: uppercase;">
          GENEL TOPLAM (${stats.totalLocations} İL / MEYDAN):
        </div>
      </td>
      ${aircraftTypes.map(tip => {
        const col = columnTotals[tip] || { total: 0, faal: 0, gayriFaal: 0 };
        return `
          <td style="padding: 10px 6px; text-align: center; vertical-align: middle; border: 1px solid #047857;">
            <div style="font-size: 14px; font-weight: 900; color: #ffffff;">
              ${col.total}
            </div>
            <div style="font-size: 9.5px; font-weight: 800; color: #a7f3d0; margin-top: 2px; white-space: nowrap;">
              <span>${col.faal} Faal</span>
              ${col.gayriFaal > 0 ? `<span style="color: #fca5a5; margin-left: 3px;">/ ${col.gayriFaal} G.F.</span>` : ''}
            </div>
          </td>
        `;
      }).join('')}
      <td style="padding: 12px 8px; text-align: center; vertical-align: middle; border: 1px solid #047857; background-color: #043319;">
        <div style="font-size: 16px; font-weight: 900; color: #ffffff;">
          ${stats.totalAircraft}
        </div>
        <div style="font-size: 10px; font-weight: 900; color: #34d399; margin-top: 2px; white-space: nowrap;">
          ${stats.totalFaal} F / ${stats.totalGayriFaal} GF
        </div>
      </td>
    </tr>
  `;

  // Tam HTML Şablonu (Excel & Web Sayfası Uyumlu)
  return `
    <html xmlns:o="urn:schemas-microsoft-com:office:office"
          xmlns:x="urn:schemas-microsoft-com:office:excel"
          xmlns="http://www.w3.org/TR/REC-html40">
    <head>
      <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
      <title>OGM Hava Araçları Konum Durum Çizelgesi - ${dateStr}</title>
      <!--[if gte mso 9]>
      <xml>
        <x:ExcelWorkbook>
          <x:ExcelWorksheets>
            <x:ExcelWorksheet>
              <x:Name>Konum Durum Çizelgesi</x:Name>
              <x:WorksheetOptions>
                <x:DisplayGridlines/>
                <x:FitToPage/>
                <x:Print>
                  <x:FitWidth>1</x:FitWidth>
                  <x:FitHeight>100</x:FitHeight>
                  <x:ValidPrinterInfo/>
                  <x:PaperSizeIndex>9</x:PaperSizeIndex>
                  <x:Scale>85</x:Scale>
                  <x:HorizontalResolution>600</x:HorizontalResolution>
                  <x:VerticalResolution>600</x:VerticalResolution>
                </x:Print>
              </x:WorksheetOptions>
            </x:ExcelWorksheet>
          </x:ExcelWorksheets>
        </x:ExcelWorkbook>
      </xml>
      <![endif]-->
      <style>
        body {
          font-family: 'Segoe UI', Calibri, Arial, sans-serif;
          margin: 16px;
          background-color: #f8fafc;
          color: #0f172a;
        }
        .report-card {
          background-color: #ffffff;
          border: 1px solid #cbd5e1;
          border-radius: 16px;
          padding: 20px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        table.status-table {
          width: 100%;
          border-collapse: collapse;
          font-family: 'Segoe UI', Calibri, Arial, sans-serif;
          margin-top: 14px;
        }
        table.status-table th, table.status-table td {
          border: 1px solid #cbd5e1;
        }
      </style>
    </head>
    <body>
      <div class="report-card">
        <!-- OGM Resmi Başlık ve İstatistik Şeridi -->
        <table style="width: 100%; border-collapse: collapse; background-color: #032514; border-radius: 12px; margin-bottom: 16px;">
          <tr>
            <td style="padding: 18px 24px; border: none; text-align: left; vertical-align: middle;">
              <div style="color: #34d399; font-size: 12px; font-weight: 900; letter-spacing: 2px; text-transform: uppercase;">
                T.C. TARIM VE ORMAN BAKANLIĞI • ORMAN GENEL MÜDÜRLÜĞÜ
              </div>
              <div style="color: #ffffff; font-size: 20px; font-weight: 900; letter-spacing: 0.5px; margin: 4px 0;">
                HAVACILIK DAİRESİ BAŞKANLIĞI — HAVA ARAÇLARI KONUM DURUM ÇİZELGESİ
              </div>
              <div style="color: #a7f3d0; font-size: 11.5px; font-weight: 600;">
                Rapor Tarihi: <b>${dateStr}</b> &nbsp;|&nbsp; Konuşlanma ve Faaliyet Durumu Dağılımı
              </div>
            </td>
            <td style="padding: 18px 24px; border: none; text-align: right; vertical-align: middle;">
              <!-- İstatistik Rozetleri -->
              <table style="border-collapse: separate; border-spacing: 6px; margin-left: auto;">
                <tr>
                  <td style="background-color: #064e3b; border: 1px solid #059669; border-radius: 8px; padding: 6px 14px; text-align: center;">
                    <div style="font-size: 9px; font-weight: 800; color: #a7f3d0; text-transform: uppercase;">TOPLAM İL/MEYDAN</div>
                    <div style="font-size: 16px; font-weight: 900; color: #ffffff;">${stats.totalLocations}</div>
                  </td>
                  <td style="background-color: #064e3b; border: 1px solid #059669; border-radius: 8px; padding: 6px 14px; text-align: center;">
                    <div style="font-size: 9px; font-weight: 800; color: #a7f3d0; text-transform: uppercase;">TOPLAM ARAÇ</div>
                    <div style="font-size: 16px; font-weight: 900; color: #ffffff;">${stats.totalAircraft}</div>
                  </td>
                  <td style="background-color: #047857; border: 1px solid #10b981; border-radius: 8px; padding: 6px 14px; text-align: center;">
                    <div style="font-size: 9px; font-weight: 800; color: #d1fae5; text-transform: uppercase;">FAAL</div>
                    <div style="font-size: 16px; font-weight: 900; color: #ffffff;">${stats.totalFaal}</div>
                  </td>
                  ${stats.totalGayriFaal > 0 ? `
                    <td style="background-color: #991b1b; border: 1px solid #ef4444; border-radius: 8px; padding: 6px 14px; text-align: center;">
                      <div style="font-size: 9px; font-weight: 800; color: #fee2e2; text-transform: uppercase;">GAYRİ FAAL</div>
                      <div style="font-size: 16px; font-weight: 900; color: #ffffff;">${stats.totalGayriFaal}</div>
                    </td>
                  ` : ''}
                </tr>
              </table>
            </td>
          </tr>
        </table>

        <!-- Ana Konum Durum Matris Tablosu -->
        <table class="status-table">
          <thead>
            ${tableHeadersHtml}
          </thead>
          <tbody>
            ${tableRowsHtml}
          </tbody>
          <tfoot>
            ${footerRowHtml}
          </tfoot>
        </table>

        <!-- Bilgi ve Lejant Notu -->
        <table style="width: 100%; margin-top: 14px; border-collapse: collapse;">
          <tr>
            <td style="border: none; font-size: 10px; color: #64748b; text-align: left;">
              * <b>Öğretici Kural Notu:</b> Ankara (VIP) kayıtları <b>ANKARA</b>; Yanıklar/Fethiye, Bodrum/Güvercinlik ve Milas kayıtları <b>MUĞLA</b> çatısı altında konsolide edilmiştir. (AT-802 Muğla'da tek bölge olduğu için Milas ayrıca belirtilmez).
            </td>
            <td style="border: none; font-size: 10px; color: #64748b; text-align: right;">
              <span style="color: #10b981;">●</span> Faal &nbsp;|&nbsp; <span style="color: #ef4444;">●</span> Gayri Faal &nbsp;|&nbsp; 🚁 Helikopter &nbsp;|&nbsp; ✈️ Uçak
            </td>
          </tr>
        </table>
      </div>
    </body>
    </html>
  `;
};

// Excel / Web Sayfası (.xls) Olarak İndirme Fonksiyonu
export const exportLocationStatusToExcel = (options: LocationStatusExcelOptions, filenamePrefix = 'OGM_Konum_Durum_Cizelgesi') => {
  const html = generateLocationStatusExcelHtml(options);
  const now = new Date();
  const dateTag = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const fileName = `${filenamePrefix}_${dateTag}.xls`;

  // UTF-8 BOM ekleyerek Türkçe karakterlerin Excel ve tarayıcılarda tam ve doğru açılmasını sağla
  const blob = new Blob(['\uFEFF' + html], { type: 'application/vnd.ms-excel;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// Standart Web Sayfası (.html) Olarak İndirme Fonksiyonu
export const exportLocationStatusToHtml = (options: LocationStatusExcelOptions, filenamePrefix = 'OGM_Konum_Durum_Web_Sayfasi') => {
  const html = generateLocationStatusExcelHtml(options);
  const now = new Date();
  const dateTag = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const fileName = `${filenamePrefix}_${dateTag}.html`;

  const blob = new Blob(['\uFEFF' + html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
