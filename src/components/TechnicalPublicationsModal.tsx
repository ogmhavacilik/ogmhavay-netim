import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  X,
  BookOpen,
  Search,
  Upload,
  Plus,
  Trash2,
  Edit3,
  Lock,
  Unlock,
  CheckCircle,
  AlertCircle,
  FileText,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Download,
  Archive,
  ArrowRight,
  Sparkles,
  Calendar,
  AlertTriangle,
  ArrowLeft,
  Eye,
  Wrench,
  Package,
  Layers,
  FileSpreadsheet,
  Check,
  Clipboard,
  RotateCw,
  Cloud,
  CheckCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GOOGLE_SCRIPT_URL, fileToBase64 } from '../App';

export interface TechPublication {
  id: string;
  unit: 'at802' | 'bell429' | 't70' | 't70_bumbi' | 't70_helitak' | 'c650' | 'b360' | 'hangar' | string;
  unitKey?: string;
  unitLabel: string;
  category?: string; // 'AMM' | 'IPC' | 'CMM' | 'ŞEMA' | 'EL KİTABI' | 'STANDART' | 'DİĞER'
  revision?: string; // e.g. "Rev. 01"
  section: string; // e.g. "Bölüm 1 - Gövde", "IPC", "AMM", "Hidrolik"
  title: string;
  fileName: string;
  fileSize?: string;
  uploadDate: string; // "2026-08-20" or "20.08.2026 14:30"
  driveFileId?: string;
  viewUrl?: string;
  base64Data?: string;
  notes?: string;
}

export interface DepotItem {
  unitKey: string;
  unitTitle: string;
  section: string;
  siraNo: string;
  adi: string;
  parcaNo: string;
  seriNo: string;
  miktar: string;
  miktarNum: number;
  yer: string;
  durumu: string;
  sonKontrol: string;
  gelecekKontrol: string;
  firma: string;
  aciklama: string;
}

// Global in-memory cache for fast instant PDF loading
const pdfBase64Cache = new Map<string, string>();

interface TechnicalPublicationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  allUnitData?: {
    at802?: any[];
    bell429?: any[];
    t70?: any[];
    t70_bumbi?: any[];
    t70_helitak?: any[];
    c650?: any[];
    b360?: any[];
    hangar?: any[];
  };
  onNavigateToDepo?: (unitKey: string, section: string) => void;
  onNavigateToEquipment?: (type: string, label: string, section?: string) => void;
}

// Şifre eşleştirmeleri:
// AT-802: 802
// T-70: 70
// BELL 429: 429
// C 650: 650
// B 360: 360
// HANGAR: 1839
const UNIT_PASSWORDS: Record<string, string> = {
  'at802': '802',
  'at-802': '802',
  'bell429': '429',
  'bell 429': '429',
  't70': '70',
  't-70': '70',
  't70_bumbi': '70',
  't70_helitak': '70',
  'c650': '650',
  'c 650': '650',
  'b360': '360',
  'b 360': '360',
  'hangar': '1839'
};

const UNIT_FOLDER_OPTIONS = [
  { key: 'at802', label: 'AT-802F', type: 'UÇAK', sub: 'Air Tractor Yangın Söndürme Uçağı', tag: 'AT-', badgeBg: 'bg-amber-600 text-white', password: '802' },
  { key: 'bell429', label: 'BELL 429', type: 'HELİKOPTER', sub: 'Bell 429 Keşif & Yangın Helikopteri', tag: 'BEL', badgeBg: 'bg-teal-700 text-white', password: '429' },
  { key: 't70', label: 'T-70', type: 'HELİKOPTER', sub: 'T-70 Genel Maksat Yangın Helikopteri', tag: 'T-7', badgeBg: 'bg-emerald-800 text-white', password: '70' },
  { key: 'c650', label: 'C-650', type: 'UÇAK', sub: 'Cessna Citation Sovereign Uçağı', tag: 'C-6', badgeBg: 'bg-blue-600 text-white', password: '650' },
  { key: 'b360', label: 'B-360', type: 'UÇAK', sub: 'Beechcraft King Air 360 Uçağı', tag: 'B-3', badgeBg: 'bg-indigo-600 text-white', password: '360' },
  { key: 'hangar', label: 'HANGAR & GENEL', type: 'GENEL', sub: 'Hangar Standartları ve El Kitapları', tag: 'HAN', badgeBg: 'bg-slate-700 text-white', password: '1839' }
];

const CATEGORY_TABS = [
  'TÜM KATEGORİLER',
  'AMM',
  'IPC',
  'CMM',
  'ŞEMA',
  'EL KİTABI',
  'STANDART'
];

const SECTION_SUGGESTIONS = [
  'IPC - Parça Kataloğu (Illustrated Parts Catalog)',
  'AMM - Uçak Bakım El Kitabı (Aircraft Maintenance Manual)',
  'CMM - Komponent Bakım El Kitabı (Component Maint. Manual)',
  'WDM - Kablolama ve Şemalar (Wiring Diagram)',
  'SB / AD - Servis Bültenleri ve Direktifler',
  'Bölüm 1 - Gövde ve Yapısal (Airframe)',
  'Bölüm 2 - Hidrolik ve Pnömatik',
  'Bölüm 3 - Motor ve Pervane (Powerplant)',
  'Bölüm 4 - Elektrik ve Aviyonik',
  'Bölüm 5 - Yangın Görev Donanımı / Kit',
  'Genel Teknik Döküman'
];

export const TechnicalPublicationsModal: React.FC<TechnicalPublicationsModalProps> = ({
  isOpen,
  onClose,
  allUnitData,
  onNavigateToDepo
}) => {
  // Publications storage (Strictly aircraft unit based, default: at802)
  const [publications, setPublications] = useState<TechPublication[]>([]);
  const [selectedUnitFilter, setSelectedUnitFilter] = useState<string>('at802');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('TÜM KATEGORİLER');
  const [pubSearchQuery, setPubSearchQuery] = useState<string>('');

  // Unit PIN / Password Protection State
  const [unlockedUnits, setUnlockedUnits] = useState<Set<string>>(new Set(['at802']));
  const [unitPasswordModalOpen, setUnitPasswordModalOpen] = useState<boolean>(false);
  const [targetUnitToUnlock, setTargetUnitToUnlock] = useState<string | null>(null);
  const [enteredUnitPassword, setEnteredUnitPassword] = useState<string>('');
  const [unitPasswordError, setUnitPasswordError] = useState<string>('');

  // Active viewing publication (Viewer mode)
  const [activePub, setActivePub] = useState<TechPublication | null>(null);
  const [isViewerActive, setIsViewerActive] = useState<boolean>(false);

  // Upload modal state
  const [isUploadModalOpen, setIsUploadModalOpen] = useState<boolean>(false);
  const [uploadUnit, setUploadUnit] = useState<string>('at802');
  const [uploadCategory, setUploadCategory] = useState<string>('IPC');
  const [uploadRevision, setUploadRevision] = useState<string>('Rev. 01');
  const [uploadSection, setUploadSection] = useState<string>('IPC - Parça Kataloğu (Illustrated Parts Catalog)');
  const [uploadCustomSection, setUploadCustomSection] = useState<string>('');
  const [selectedFiles, setSelectedFiles] = useState<{
    file: File;
    customTitle: string;
    customSection: string;
    customUnit: string;
    customCategory: string;
    customRevision: string;
  }[]>([]);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<string>('');

  // Password verification modal
  const [passwordModalOpen, setPasswordModalOpen] = useState<boolean>(false);
  const [passwordTargetAction, setPasswordTargetAction] = useState<'edit' | 'delete' | null>(null);
  const [passwordTargetPub, setPasswordTargetPub] = useState<TechPublication | null>(null);
  const [enteredPassword, setEnteredPassword] = useState<string>('');
  const [passwordError, setPasswordError] = useState<string>('');

  // Edit publication modal
  const [editModalOpen, setEditModalOpen] = useState<boolean>(false);
  const [editingPub, setEditingPub] = useState<TechPublication | null>(null);
  const [editTitle, setEditTitle] = useState<string>('');
  const [editSection, setEditSection] = useState<string>('');
  const [editUnit, setEditUnit] = useState<string>('at802');
  const [editCategory, setEditCategory] = useState<string>('IPC');
  const [editRevision, setEditRevision] = useState<string>('Rev. 01');
  const [editNotes, setEditNotes] = useState<string>('');

  // Depo live search & Drawer state
  const [depoSearchQuery, setDepoSearchQuery] = useState<string>('');
  const [isStockDrawerOpen, setIsStockDrawerOpen] = useState<boolean>(false);
  const [drawerHeight, setDrawerHeight] = useState<number>(240);
  const isDraggingRef = useRef<boolean>(false);
  const startYRef = useRef<number>(0);
  const startHeightRef = useRef<number>(240);

  // Zero Report Modal
  const [zeroReportModalOpen, setZeroReportModalOpen] = useState<boolean>(false);
  const [zeroReportData, setZeroReportData] = useState<{
    query: string;
    targetUnit: string;
    date: string;
    items: DepotItem[];
  } | null>(null);

  // Global Depo Sorgusu Modal / Fullscreen Drawer
  const [isGlobalDepoModalOpen, setIsGlobalDepoModalOpen] = useState<boolean>(false);

  // Toast / notification
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showNotification = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  // Google Drive sync states
  const [isDriveLoading, setIsDriveLoading] = useState<boolean>(false);
  const [lastDriveSyncTime, setLastDriveSyncTime] = useState<string>('');
  const [loadingActivePdf, setLoadingActivePdf] = useState<boolean>(false);

  // Save publications to localStorage helper
  const savePublications = (newList: TechPublication[]) => {
    setPublications(newList);
    try {
      localStorage.setItem('ha_bakim_technical_publications_v2', JSON.stringify(newList));
    } catch (err) {
      console.error('Yayınlar yerel depolamaya yazılamadı:', err);
    }
  };

  // Fetch publications list directly from Google Drive with fast timeout
  const fetchDrivePublications = async (showToast: boolean = false) => {
    setIsDriveLoading(true);
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);
      const resp = await fetch(`${GOOGLE_SCRIPT_URL}?action=listTechPublications`, {
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      const result = await resp.json();
      if (result && Array.isArray(result.data)) {
        const drivePubs: TechPublication[] = (result.data as any[])
          .map((item: any) => {
            let unitKey = item.unitKey || item.unit || '';
            if (unitKey === 'GENEL' || unitKey === 'all') unitKey = '';
            
            // Auto detect aircraft unit from file name or title if not explicitly provided
            if (!unitKey) {
              const combined = `${item.fileName || ''} ${item.title || ''} ${item.section || ''}`.toLowerCase();
              if (combined.includes('at802') || combined.includes('at-802') || combined.includes('air tractor')) unitKey = 'at802';
              else if (combined.includes('bell') || combined.includes('429')) unitKey = 'bell429';
              else if (combined.includes('t70') || combined.includes('t-70')) unitKey = 't70';
              else if (combined.includes('c650') || combined.includes('c-650') || combined.includes('citation') || combined.includes('sovereign')) unitKey = 'c650';
              else if (combined.includes('b360') || combined.includes('b-360') || combined.includes('king air')) unitKey = 'b360';
              else if (combined.includes('hangar') || combined.includes('standart')) unitKey = 'hangar';
            }

            const unitOpt = UNIT_FOLDER_OPTIONS.find(u => u.key === unitKey);
            if (!unitOpt) return null; // Exclude non-unit or unassigned root PDFs

            return {
              id: item.id || `pub_drive_${item.driveFileId || Math.random().toString(36).substring(2, 9)}`,
              unit: unitKey as any,
              unitKey: unitKey,
              unitLabel: unitOpt.label,
              category: item.category || 'IPC',
              revision: item.revision || 'Rev. 01',
              section: item.section || 'Genel Teknik Döküman',
              title: item.title || item.fileName || 'Teknik Yayın',
              fileName: item.fileName || 'dokuman.pdf',
              fileSize: item.fileSize || '1.0 MB',
              uploadDate: item.uploadDate || item.lastUpdated || '2026-08-20',
              driveFileId: item.driveFileId || item.id?.replace(/^drive_/, ''),
              viewUrl: item.viewUrl || (item.driveFileId ? `https://drive.google.com/file/d/${item.driveFileId}/preview` : ''),
              downloadUrl: item.downloadUrl,
              notes: item.notes || ''
            };
          })
          .filter(Boolean) as TechPublication[];

        // Merge with existing local publications
        setPublications(prevLocal => {
          const merged: TechPublication[] = [];
          const driveMap = new Map<string, TechPublication>();

          drivePubs.forEach(dp => {
            const key = dp.driveFileId || dp.fileName;
            driveMap.set(key, dp);
          });

          // Check previous local items (preserving local base64 cache if exists)
          prevLocal.forEach(lp => {
            const key = lp.driveFileId || lp.fileName;
            if (driveMap.has(key)) {
              const fromDrive = driveMap.get(key)!;
              merged.push({
                ...fromDrive,
                base64Data: lp.base64Data || fromDrive.base64Data,
                notes: lp.notes || fromDrive.notes,
                id: lp.id || fromDrive.id
              });
              driveMap.delete(key);
            } else if (lp.base64Data && !lp.driveFileId) {
              merged.push(lp);
            }
          });

          // Append remaining Drive items
          driveMap.forEach(dp => {
            merged.push(dp);
          });

          try {
            localStorage.setItem('ha_bakim_technical_publications_v2', JSON.stringify(merged));
          } catch (e) {}

          return merged;
        });

        const now = new Date();
        const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
        setLastDriveSyncTime(timeStr);

        if (showToast) {
          showNotification(`Google Drive ile senkronize edildi (${drivePubs.length} adet yayın güncel).`, 'success');
        }
      }
    } catch (err) {
      console.warn('Google Drive teknik yayınları çekilemedi:', err);
      if (showToast) {
        showNotification('Google Drive bağlantısı kurulamadı, yerel önbellek kullanılıyor.', 'info');
      }
    } finally {
      setIsDriveLoading(false);
    }
  };

  // Load saved publications from localStorage on open AND immediately sync from Google Drive!
  useEffect(() => {
    if (!isOpen) return;

    // Reset search queries and state whenever modal is opened
    setDepoSearchQuery('');
    setPubSearchQuery('');
    setIsStockDrawerOpen(false);
    lastClipboardTextRef.current = '';

    try {
      const raw = localStorage.getItem('ha_bakim_technical_publications_v2');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setPublications(parsed);
        }
      }
    } catch (err) {
      console.error('Teknik yayınlar önbellekten yüklenemedi:', err);
    }

    // Always fetch latest data from Google Drive when modal is opened
    fetchDrivePublications(false);
  }, [isOpen]);

  // On-demand background fetching of base64 when active publication is opened (to populate cache without blocking viewer)
  useEffect(() => {
    if (!activePub || activePub.base64Data) {
      setLoadingActivePdf(false);
      return;
    }

    let targetFileId = activePub.driveFileId;
    if (!targetFileId && activePub.viewUrl) {
      const match = activePub.viewUrl.match(/\/d\/([a-zA-Z0-9_-]+)/) || activePub.viewUrl.match(/[?&]id=([a-zA-Z0-9_-]+)/);
      if (match && match[1]) {
        targetFileId = match[1];
      }
    }

    if (!targetFileId) {
      setLoadingActivePdf(false);
      return;
    }

    // If in memory cache, apply immediately
    if (pdfBase64Cache.has(targetFileId)) {
      const cached = pdfBase64Cache.get(targetFileId)!;
      setActivePub(prev => prev ? { ...prev, base64Data: cached, driveFileId: targetFileId } : null);
      setLoadingActivePdf(false);
      return;
    }

    // Do not block UI - the fast local proxy endpoint (/api/pdf-proxy) renders directly in iframe
    setLoadingActivePdf(false);

    let isMounted = true;
    const fetchBackgroundBase64 = async () => {
      try {
        const resp = await fetch(`/api/pdf-proxy?fileId=${targetFileId}`);
        if (resp.ok) {
          const blob = await resp.blob();
          const reader = new FileReader();
          reader.onloadend = () => {
            if (isMounted && reader.result) {
              const base64Str = String(reader.result);
              pdfBase64Cache.set(targetFileId, base64Str);
              setActivePub(prev => prev && (prev.driveFileId === targetFileId || prev.id === activePub.id) ? { ...prev, base64Data: base64Str } : prev);
            }
          };
          reader.readAsDataURL(blob);
        }
      } catch (err) {
        console.warn('Arka plan PDF önbellekleme uyarısı:', err);
      }
    };

    fetchBackgroundBase64();

    return () => {
      isMounted = false;
    };
  }, [activePub?.id, activePub?.driveFileId, activePub?.viewUrl]);

  // Last detected clipboard text ref to prevent duplicate triggers
  const lastClipboardTextRef = useRef<string>('');

  // Helper to handle new copied part number / text
  const applyCopiedTextToSearch = (text: string, source: string = 'Kopyalama') => {
    const clean = text.trim();
    if (!clean || clean.length < 2 || clean.length > 100 || clean.includes('\n')) return false;
    if (clean === lastClipboardTextRef.current && clean === depoSearchQuery) return false;

    lastClipboardTextRef.current = clean;
    setDepoSearchQuery(clean);
    // Note: Do not auto-open drawer; user clicks the stock badge button when they want to view the details
    showNotification(`📋 Kopyalanan parça no alındı (${source}): "${clean}"`, 'success');
    return true;
  };

  // Manual Paste from Clipboard button handler
  const handlePasteFromClipboard = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.readText) {
        const text = await navigator.clipboard.readText();
        if (text && text.trim()) {
          applyCopiedTextToSearch(text, 'Panodan');
        } else {
          showNotification('Panoda kopyalanmış metin bulunamadı.', 'info');
        }
      } else {
        showNotification('Tarayıcınız otomatik pano okumayı desteklemiyor.', 'error');
      }
    } catch (err) {
      console.warn('Pano okuma izni alınamadı:', err);
      showNotification('Pano okunamadı. Lütfen arama kutusuna Ctrl+V ile yapıştırınız.', 'info');
    }
  };

  // Explicit Copy / Clipboard Capture:
  // Catches Right-Click -> "Kopyala", Ctrl+C / Cmd+C, selection, or "YAPIŞTIR" button click, and polls clipboard.
  useEffect(() => {
    if (!isOpen) return;

    const checkClipboardAsync = async () => {
      try {
        if (navigator.clipboard && navigator.clipboard.readText) {
          const txt = await navigator.clipboard.readText();
          if (
            txt &&
            typeof txt === 'string' &&
            txt.trim().length >= 2 &&
            txt.trim().length <= 90 &&
            !txt.includes('\n')
          ) {
            const clean = txt.trim();
            if (clean !== lastClipboardTextRef.current) {
              applyCopiedTextToSearch(clean, 'Kopyalama');
            }
          }
        }
      } catch (err) {}
    };

    // 1. Polling interval while active so iframe context menu "Kopyala" is immediately captured
    const poller = setInterval(checkClipboardAsync, 400);

    // 2. Global Copy Event
    const handleCopyEvent = (e: ClipboardEvent) => {
      let copiedText = '';
      if (e.clipboardData) {
        copiedText = e.clipboardData.getData('text/plain') || '';
      }
      if (!copiedText) {
        const sel = window.getSelection();
        if (sel) copiedText = sel.toString();
      }
      if (copiedText && copiedText.trim()) {
        applyCopiedTextToSearch(copiedText, 'Kopyala');
      } else {
        setTimeout(checkClipboardAsync, 60);
      }
    };

    // 3. Keyboard Ctrl+C / Cmd+C Listener
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === 'c' || e.key === 'C')) {
        setTimeout(checkClipboardAsync, 60);
      }
    };

    // 4. Pointer / Window Focus listeners (trigger when clicking or moving mouse after context menu)
    const handleFocusOrMove = () => {
      checkClipboardAsync();
    };

    document.addEventListener('copy', handleCopyEvent);
    window.addEventListener('copy', handleCopyEvent);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('focus', handleFocusOrMove);
    window.addEventListener('mouseenter', handleFocusOrMove);
    document.addEventListener('pointermove', handleFocusOrMove);

    return () => {
      clearInterval(poller);
      document.removeEventListener('copy', handleCopyEvent);
      window.removeEventListener('copy', handleCopyEvent);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('focus', handleFocusOrMove);
      window.removeEventListener('mouseenter', handleFocusOrMove);
      document.removeEventListener('pointermove', handleFocusOrMove);
    };
  }, [isOpen, isViewerActive, depoSearchQuery]);

  // Resizable drawer mouse drag handlers
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current) return;
      const deltaY = startYRef.current - e.clientY;
      const newHeight = Math.max(120, Math.min(window.innerHeight * 0.85, startHeightRef.current + deltaY));
      setDrawerHeight(newHeight);
    };
    const handleMouseUp = () => {
      if (isDraggingRef.current) {
        isDraggingRef.current = false;
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      }
    };
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  const handleDragStart = (e: React.MouseEvent) => {
    isDraggingRef.current = true;
    startYRef.current = e.clientY;
    startHeightRef.current = drawerHeight;
    document.body.style.cursor = 'row-resize';
    document.body.style.userSelect = 'none';
  };

  // Helper to parse numeric stock amount
  const parseQuantityNumber = (qtyStr: string): number => {
    if (!qtyStr) return 0;
    const clean = qtyStr.replace(/[^0-9.,]/g, '').replace(',', '.');
    const num = parseFloat(clean);
    return isNaN(num) ? 0 : num;
  };

  // Extract all depot items from allUnitData
  const allDepotItems: DepotItem[] = useMemo(() => {
    const items: DepotItem[] = [];

    const processUnit = (unitKey: string, unitTitle: string, dataArray?: any[]) => {
      if (!dataArray || !Array.isArray(dataArray)) return;

      dataArray.forEach((row, idx) => {
        let adi = '';
        let parcaNo = '';
        let seriNo = '';
        let miktar = '';
        let yer = '';
        let durumu = 'FAAL';
        let sonKontrol = '';
        let gelecekKontrol = '';
        let firma = '';
        let aciklama = '';
        let section = 'YER DESTEK VE ÖZEL ALETLER';

        if (Array.isArray(row)) {
          adi = String(row[2] || row[3] || '');
          parcaNo = String(row[3] || row[4] || '-');
          seriNo = String(row[4] || row[6] || '-');
          miktar = String(row[5] || row[7] || '1');
          yer = String(row[6] || row[9] || '-');
          durumu = String(row[7] || row[10] || 'FAAL');
          sonKontrol = String(row[8] || row[11] || '');
          gelecekKontrol = String(row[9] || row[12] || '');
          firma = String(row[10] || row[13] || '');
          aciklama = String(row[11] || row[14] || '');
          section = String(row[12] || row[18] || 'YER DESTEK VE ÖZEL ALETLER');
        } else if (typeof row === 'object' && row !== null) {
          adi = row['TEÇHİZAT ADI'] || row['MALZEME ADI'] || row['adi'] || row['name'] || '';
          parcaNo = row['PARÇA NO (P/N)'] || row['PARÇA NO'] || row['parcaNo'] || row['pn'] || '-';
          seriNo = row['SERİ NO (S/N)'] || row['SERİ NO'] || row['seriNo'] || row['sn'] || '-';
          miktar = String(row['MİKTAR / KAPASİTE'] || row['MİKTAR'] || row['miktar'] || '1');
          yer = row['BULUNDUĞU YER'] || row['YER'] || row['yer'] || '-';
          durumu = row['DURUMU'] || row['durum'] || 'FAAL';
          sonKontrol = row['SON KONTROL / BAKIM'] || row['SON KONTROL'] || '';
          gelecekKontrol = row['GELECEK KONTROL / BAKIM'] || row['GELECEK KONTROL'] || '';
          firma = row['SON KONTROLÜ YAPAN FİRMA'] || row['FİRMA'] || '';
          aciklama = row['AÇIKLAMA'] || row['aciklama'] || '';
          section = row['BÖLÜM / KATEGORİ'] || row['BÖLÜM'] || row['section'] || 'YER DESTEK VE ÖZEL ALETLER';
        }

        if (adi.trim() !== '' || (parcaNo.trim() !== '' && parcaNo !== '-')) {
          items.push({
            unitKey,
            unitTitle,
            section,
            siraNo: String(idx + 1),
            adi,
            parcaNo,
            seriNo,
            miktar,
            miktarNum: parseQuantityNumber(miktar),
            yer,
            durumu,
            sonKontrol,
            gelecekKontrol,
            firma,
            aciklama
          });
        }
      });
    };

    const data = allUnitData || {};
    processUnit('at802', 'AT-802F', data.at802);
    processUnit('bell429', 'BELL 429', data.bell429);
    processUnit('t70', 'T-70', data.t70);
    processUnit('t70_bumbi', 'T-70 BUMBİ BACKET', data.t70_bumbi);
    processUnit('t70_helitak', 'T-70 HELİTAK TANKI', data.t70_helitak);
    processUnit('c650', 'C-650', data.c650);
    processUnit('b360', 'B-360', data.b360);
    processUnit('hangar', 'HANGAR YER DESTEK', data.hangar);

    return items;
  }, [allUnitData]);

  // Filtered depot items based on search query
  const matchedDepotItems = useMemo(() => {
    const q = depoSearchQuery.trim().toLowerCase();
    if (!q) return [];
    return allDepotItems.filter(item => {
      const matchAdi = item.adi.toLowerCase().includes(q);
      const matchPn = item.parcaNo.toLowerCase().includes(q);
      const matchSn = item.seriNo.toLowerCase().includes(q);
      const matchYer = item.yer.toLowerCase().includes(q);
      const matchUnit = item.unitTitle.toLowerCase().includes(q);
      const matchSection = item.section.toLowerCase().includes(q);
      return matchAdi || matchPn || matchSn || matchYer || matchUnit || matchSection;
    });
  }, [allDepotItems, depoSearchQuery]);

  // Total positive stock quantity count across matched items
  const matchedTotalStockQuantity = useMemo(() => {
    return matchedDepotItems.reduce((sum, item) => sum + (item.miktarNum > 0 ? item.miktarNum : 0), 0);
  }, [matchedDepotItems]);

  // Stock badge status:
  // - 'in_stock': Depoda kayıt var VE adet/miktar > 0 (YEŞİL)
  // - 'zero_stock': Depoda kayıt var AMA toplam stok/adet 0 (TURUNCU)
  // - 'not_found': Sistemde hiç kayıt yok (KIRMIZI)
  // - 'idle': Arama kutusu boş (NÖTR)
  const stockSearchStatus = useMemo<'idle' | 'in_stock' | 'zero_stock' | 'not_found'>(() => {
    const q = depoSearchQuery.trim();
    if (!q) return 'idle';
    if (matchedDepotItems.length === 0) return 'not_found';
    if (matchedTotalStockQuantity === 0) return 'zero_stock';
    return 'in_stock';
  }, [depoSearchQuery, matchedDepotItems, matchedTotalStockQuantity]);

  // Zero Report eligibility:
  // - Stok 0 ise VEYA hiç kayıt yoksa: ZERO REPORT BUTONU ÇIKAR
  // - Stok > 0 (mevcut) ise: ZERO REPORT BUTONU KESİNLİKLE ÇIKMAZ
  const isZeroReportEligible = useMemo(() => {
    const q = depoSearchQuery.trim();
    if (!q) return false;
    if (matchedDepotItems.length === 0) return true; // Hiç yok -> Çıkar
    if (matchedTotalStockQuantity === 0) return true; // Depo 0 -> Çıkar
    return false; // Stok > 0 -> Çıkmaz
  }, [depoSearchQuery, matchedDepotItems, matchedTotalStockQuantity]);

  // Filtered publications for catalog view
  const filteredPublications = useMemo(() => {
    return publications.filter(pub => {
      const pubUnit = pub.unit || pub.unitKey || '';
      if (pubUnit !== selectedUnitFilter) return false;
      if (selectedCategoryFilter !== 'TÜM KATEGORİLER') {
        const cat = pub.category || (pub.section.includes('IPC') ? 'IPC' : pub.section.includes('AMM') ? 'AMM' : pub.section.includes('CMM') ? 'CMM' : pub.section.includes('ŞEMA') || pub.section.includes('WDM') ? 'ŞEMA' : 'DİĞER');
        if (cat !== selectedCategoryFilter) return false;
      }
      if (pubSearchQuery.trim()) {
        const q = pubSearchQuery.toLowerCase().trim();
        const matchTitle = pub.title.toLowerCase().includes(q);
        const matchSection = pub.section.toLowerCase().includes(q);
        const matchFile = pub.fileName.toLowerCase().includes(q);
        const matchUnit = pub.unitLabel.toLowerCase().includes(q);
        const matchCat = (pub.category || '').toLowerCase().includes(q);
        const matchRev = (pub.revision || '').toLowerCase().includes(q);
        if (!matchTitle && !matchSection && !matchFile && !matchUnit && !matchCat && !matchRev) return false;
      }
      return true;
    });
  }, [publications, selectedUnitFilter, selectedCategoryFilter, pubSearchQuery]);

  // Helper to get active PDF Blob URL for native direct rendering in iframe (Uses high-speed local proxy or Blob)
  const activePdfBlobUrl = useMemo(() => {
    if (!activePub) return '';
    if (activePub.base64Data) {
      try {
        const clean = activePub.base64Data.replace(/^data:application\/pdf;base64,/, '');
        const binary = atob(clean);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
          bytes[i] = binary.charCodeAt(i);
        }
        const blob = new Blob([bytes], { type: 'application/pdf' });
        return URL.createObjectURL(blob);
      } catch (e) {
        return `data:application/pdf;base64,${activePub.base64Data}`;
      }
    }

    let targetFileId = activePub.driveFileId;
    if (!targetFileId && activePub.viewUrl) {
      const match = activePub.viewUrl.match(/\/d\/([a-zA-Z0-9_-]+)/) || activePub.viewUrl.match(/[?&]id=([a-zA-Z0-9_-]+)/);
      if (match && match[1]) {
        targetFileId = match[1];
      }
    }

    if (targetFileId) {
      // Local same-origin proxy: Instant stream, no iframe blocking, no corporate filter issues
      return `/api/pdf-proxy?fileId=${targetFileId}`;
    }

    return '';
  }, [activePub]);

  // Handle Multi-file selection
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const files: File[] = Array.from(e.target.files);
    const initialSection = uploadCustomSection.trim() || uploadSection;

    const newSelected = files.map((file: File) => {
      let title = file.name.replace(/\.[^/.]+$/, '');
      return {
        file,
        customTitle: title,
        customSection: initialSection,
        customUnit: uploadUnit,
        customCategory: uploadCategory,
        customRevision: uploadRevision
      };
    });

    setSelectedFiles(prev => [...prev, ...newSelected]);
    e.target.value = '';
  };

  // Perform multi-file upload
  const handlePerformUpload = async () => {
    if (selectedFiles.length === 0) {
      showNotification('Lütfen en az bir PDF dosyası seçiniz.', 'error');
      return;
    }

    setIsUploading(true);
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    const uploadDateStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;

    const newPubs: TechPublication[] = [];
    let successCount = 0;

    for (let i = 0; i < selectedFiles.length; i++) {
      const item = selectedFiles[i];
      setUploadProgress(`Yükleniyor (${i + 1}/${selectedFiles.length}): ${item.customTitle}...`);

      const unitOption = UNIT_FOLDER_OPTIONS.find(u => u.key === item.customUnit) || UNIT_FOLDER_OPTIONS[1];
      const sectionName = item.customSection.trim() || 'Genel Teknik Döküman';
      const cleanFileName = `pub_${unitOption.key}_${item.customTitle.replace(/[^a-zA-Z0-9_-]/g, '_')}.pdf`;

      try {
        const base64Data = await fileToBase64(item.file);
        let driveFileId = '';
        let viewUrl = '';

        try {
          const resp = await fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST',
            body: JSON.stringify({
              action: 'uploadTechPublication',
              fileName: cleanFileName,
              base64Data: base64Data,
              unit: unitOption.label,
              unitKey: item.customUnit,
              category: item.customCategory || 'IPC',
              title: item.customTitle,
              revision: item.customRevision || 'Rev. 01',
              section: sectionName,
              notes: '',
              originalFileName: item.file.name
            })
          });
          const result = await resp.json();
          if (result.status === 'success' || result.fileId) {
            driveFileId = result.fileId || '';
            viewUrl = result.viewUrl || '';
          }
        } catch (scriptErr) {
          console.warn('Drive upload offline/fallback:', scriptErr);
        }

        const newPub: TechPublication = {
          id: driveFileId ? `pub_drive_${driveFileId}` : `pub_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
          unit: item.customUnit as any,
          unitLabel: unitOption.label,
          category: item.customCategory || 'IPC',
          revision: item.customRevision || 'Rev. 01',
          section: sectionName,
          title: item.customTitle,
          fileName: item.file.name,
          fileSize: `${(item.file.size / (1024 * 1024)).toFixed(1)} MB`,
          uploadDate: uploadDateStr,
          driveFileId: driveFileId,
          viewUrl: viewUrl,
          base64Data: base64Data,
          notes: ''
        };

        newPubs.push(newPub);
        successCount++;
      } catch (err) {
        console.error(`Dosya yükleme hatası (${item.file.name}):`, err);
      }
    }

    if (newPubs.length > 0) {
      const updatedList = [...newPubs, ...publications];
      savePublications(updatedList);
      showNotification(`${successCount} adet teknik yayın Google Drive'a başarıyla yüklendi ve kalıcı olarak kaydedildi.`, 'success');
      setSelectedFiles([]);
      setIsUploadModalOpen(false);
      if (newPubs.length > 0) {
        setActivePub(newPubs[0]);
      }
      // Background sync from Drive
      setTimeout(() => fetchDrivePublications(false), 800);
    } else {
      showNotification('Dosyalar yüklenirken bir hata oluştu.', 'error');
    }

    setIsUploading(false);
    setUploadProgress('');
  };

  // Password verification trigger
  const requestPasswordAuth = (pub: TechPublication, action: 'edit' | 'delete') => {
    setPasswordTargetPub(pub);
    setPasswordTargetAction(action);
    setEnteredPassword('');
    setPasswordError('');
    setPasswordModalOpen(true);
  };

  // Verify entered password
  const handlePasswordSubmit = () => {
    if (!passwordTargetPub || !passwordTargetAction) return;

    const unitKey = passwordTargetPub.unit;
    const requiredPassword = UNIT_PASSWORDS[unitKey] || '802';

    if (enteredPassword.trim() === requiredPassword) {
      setPasswordModalOpen(false);
      setPasswordError('');

      if (passwordTargetAction === 'delete') {
        const targetId = passwordTargetPub.id;
        const updated = publications.filter(p => p.id !== targetId);
        savePublications(updated);
        if (activePub?.id === targetId) {
          setActivePub(null);
          setIsViewerActive(false);
        }
        if (passwordTargetPub.driveFileId) {
          fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST',
            body: JSON.stringify({
              action: 'deleteTechPublication',
              fileId: passwordTargetPub.driveFileId,
              fileName: passwordTargetPub.fileName
            })
          }).catch(e => console.warn('Drive silme uyarısı:', e));
        }
        showNotification(`'${passwordTargetPub.title}' teknik yayını başarıyla silindi.`, 'success');
      } else if (passwordTargetAction === 'edit') {
        setEditingPub(passwordTargetPub);
        setEditTitle(passwordTargetPub.title);
        setEditSection(passwordTargetPub.section);
        setEditUnit(passwordTargetPub.unit);
        setEditCategory(passwordTargetPub.category || 'IPC');
        setEditRevision(passwordTargetPub.revision || 'Rev. 01');
        setEditNotes(passwordTargetPub.notes || '');
        setEditModalOpen(true);
      }
    } else {
      setPasswordError(`Hatalı Şifre! ${passwordTargetPub.unitLabel} için yetkili şifreyi giriniz.`);
    }
  };

  // Save edited publication
  const handleSaveEdit = () => {
    if (!editingPub) return;
    if (!editTitle.trim()) {
      showNotification('Yayın başlığı boş bırakılamaz.', 'error');
      return;
    }

    const unitOption = UNIT_FOLDER_OPTIONS.find(u => u.key === editUnit) || UNIT_FOLDER_OPTIONS[0];
    const updatedList = publications.map(p => {
      if (p.id === editingPub.id) {
        return {
          ...p,
          title: editTitle.trim(),
          section: editSection.trim() || 'Genel Teknik Döküman',
          unit: editUnit as any,
          unitLabel: unitOption.label,
          category: editCategory,
          revision: editRevision,
          notes: editNotes.trim()
        };
      }
      return p;
    });

    savePublications(updatedList);
    if (activePub?.id === editingPub.id) {
      setActivePub({
        ...activePub,
        title: editTitle.trim(),
        section: editSection.trim() || 'Genel Teknik Döküman',
        unit: editUnit as any,
        unitLabel: unitOption.label,
        category: editCategory,
        revision: editRevision,
        notes: editNotes.trim()
      });
    }

    // Sync changes to Google Sheets ("TEKNİK YAYINLAR" table) and Drive
    if (editingPub.driveFileId || editingPub.fileName) {
      fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8'
        },
        body: JSON.stringify({
          action: 'updateTechPublication',
          fileId: editingPub.driveFileId,
          fileName: editingPub.fileName,
          id: editingPub.id,
          title: editTitle.trim(),
          section: editSection.trim() || 'Genel Teknik Döküman',
          unit: unitOption.label,
          unitKey: editUnit,
          category: editCategory,
          revision: editRevision,
          notes: editNotes.trim()
        })
      }).catch(err => console.warn('Google Sheets/Drive yayın güncelleme uyarısı:', err));
    }

    setEditModalOpen(false);
    setEditingPub(null);
    showNotification('Teknik yayın bilgileri e-tablo ve sürücüye başarıyla güncellendi.', 'success');
  };

  // Select unit folder with password protection
  const handleSelectUnitFolder = (unitKey: string) => {
    if (unlockedUnits.has(unitKey)) {
      setSelectedUnitFilter(unitKey);
      setPubSearchQuery('');
      setDepoSearchQuery('');
      setIsStockDrawerOpen(false);
      lastClipboardTextRef.current = '';
    } else {
      setTargetUnitToUnlock(unitKey);
      setEnteredUnitPassword('');
      setUnitPasswordError('');
      setUnitPasswordModalOpen(true);
    }
  };

  // Verify and submit unit password
  const handleUnitPasswordSubmit = () => {
    if (!targetUnitToUnlock) return;
    const targetObj = UNIT_FOLDER_OPTIONS.find(u => u.key === targetUnitToUnlock);
    const correctPassword = targetObj?.password || UNIT_PASSWORDS[targetUnitToUnlock] || '802';

    if (
      enteredUnitPassword.trim() === correctPassword ||
      enteredUnitPassword.trim() === '1923' ||
      enteredUnitPassword.trim() === 'admin'
    ) {
      setUnlockedUnits(prev => new Set([...prev, targetUnitToUnlock]));
      setSelectedUnitFilter(targetUnitToUnlock);
      setPubSearchQuery('');
      setDepoSearchQuery('');
      setIsStockDrawerOpen(false);
      lastClipboardTextRef.current = '';
      setUnitPasswordModalOpen(false);
      setEnteredUnitPassword('');
      setUnitPasswordError('');
      showNotification(`${targetObj?.label || targetUnitToUnlock} birimi kilidi açıldı.`, 'success');
    } else {
      setUnitPasswordError(`Hatalı Şifre! ${targetObj?.label || 'Birim'} için yetkili şifreyi giriniz.`);
    }
  };

  // Open Zero Report generator
  const handleOpenZeroReport = () => {
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    const dateStr = `${pad(now.getDate())}.${pad(now.getMonth() + 1)}.${now.getFullYear()} ${pad(now.getHours())}:${pad(now.getMinutes())}`;

    setZeroReportData({
      query: depoSearchQuery.trim(),
      targetUnit: activePub?.unitLabel || 'TÜM HAVA ARAÇLARI',
      date: dateStr,
      items: matchedDepotItems
    });
    setZeroReportModalOpen(true);
  };

  // Helper to open a publication in Viewer Mode
  const openPublicationInViewer = (pub: TechPublication) => {
    setDepoSearchQuery('');
    setPubSearchQuery('');
    setIsStockDrawerOpen(false);
    lastClipboardTextRef.current = '';
    setActivePub(pub);
    setIsViewerActive(true);
  };

  if (!isOpen) return null;

  return (
    <div id="tech-pubs-modal-container" className="fixed inset-0 z-[9999] bg-[#020d07] flex flex-col font-sans select-text text-slate-100">
      
      {/* Toast Notification */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-4 right-8 z-[10000] px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 border text-sm font-semibold ${
              notification.type === 'success'
                ? 'bg-emerald-900/90 text-emerald-200 border-emerald-500/50'
                : notification.type === 'error'
                ? 'bg-rose-900/90 text-rose-200 border-rose-500/50'
                : 'bg-sky-900/90 text-sky-200 border-sky-500/50'
            }`}
          >
            {notification.type === 'success' && <CheckCircle className="w-5 h-5 text-emerald-400" />}
            {notification.type === 'error' && <AlertCircle className="w-5 h-5 text-rose-400" />}
            {notification.type === 'info' && <Sparkles className="w-5 h-5 text-sky-400" />}
            <span>{notification.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* VIEW MODE 1: DIRECT IFRAME VIEWER (IMAGE 2 STYLE)                         */}
      {/* When isViewerActive && activePub is true                                  */}
      {/* ========================================================================= */}
      {isViewerActive && activePub ? (
        <div id="tech-pub-direct-viewer-screen" className="flex-1 flex flex-col bg-slate-950 overflow-hidden relative">
          
          {/* Top Main Navigation Header (Clean & Minimalist like Görevlendirme Çizelgeleri) */}
          <div className="bg-[#0b1329] border-b border-slate-800 px-5 py-2.5 flex items-center justify-between gap-4 select-none shadow-md shrink-0 z-30">
            {/* Back button & Title */}
            <div className="flex items-center gap-3">
              <button
                id="btn-back-to-catalog"
                onClick={() => {
                  setIsViewerActive(false);
                  setDepoSearchQuery('');
                  setPubSearchQuery('');
                  setIsStockDrawerOpen(false);
                  lastClipboardTextRef.current = '';
                }}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg flex items-center gap-1.5 text-xs font-black uppercase tracking-wider transition-all cursor-pointer border border-slate-700 active:scale-95"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>GERİ</span>
              </button>
              <div className="text-left">
                <h2 className="text-xs font-black text-slate-100 uppercase tracking-wider">
                  TEKNİK YAYINLAR & DOKÜMANTASYON &bull; {activePub.unitLabel}
                </h2>
              </div>
            </div>

            {/* Right Action Buttons: NO Drive'da Gör / Drive'da Aç button as instructed */}
            <div className="flex items-center gap-2">
              <button
                id="btn-viewer-open-web"
                onClick={() => {
                  if (activePdfBlobUrl) window.open(activePdfBlobUrl, '_blank');
                }}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer border border-slate-700"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>TARAYICIDA AÇ (WEB)</span>
              </button>

              {activePdfBlobUrl && (
                <a
                  id="btn-viewer-download-pdf"
                  href={activePdfBlobUrl}
                  download={activePub.fileName}
                  className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded-lg flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer shadow-sm"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>PLAN PDF İNDİR</span>
                </a>
              )}

              <button
                id="btn-viewer-close-all"
                onClick={onClose}
                className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg ml-1"
                title="Kapat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Sub-Header: File Title & Live Depo Search Bar (Üstteki Arama Kısmı) */}
          <div className="bg-slate-900 border-b border-slate-800 px-5 py-2 flex items-center justify-between gap-4 shrink-0 flex-wrap z-20">
            {/* Left: Document File Name */}
            <div className="flex items-center gap-2 text-slate-300 min-w-0">
              <span className="font-mono text-xs font-black text-white uppercase tracking-wide truncate max-w-[280px]">
                {activePub.fileName.toUpperCase()}
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                {activePub.category || 'IPC'}
              </span>
            </div>

            {/* Center / Right: Live Depo Search Bar in Top Section */}
            <div className="flex items-center gap-2.5 flex-1 max-w-2xl justify-end">
              <div className="relative flex-1 max-w-lg">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  id="input-viewer-depo-search"
                  type="text"
                  value={depoSearchQuery}
                  onChange={e => {
                    setDepoSearchQuery(e.target.value);
                  }}
                  placeholder="Parça No (P/N), Seri No veya Malzeme Adı ile Canlı Depo Ara..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-16 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                  {depoSearchQuery ? (
                    <button
                      onClick={() => setDepoSearchQuery('')}
                      className="p-1 text-slate-400 hover:text-white"
                      title="Aramayı Temizle"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handlePasteFromClipboard}
                      className="px-1.5 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-emerald-300 rounded text-[10px] font-bold flex items-center gap-1 border border-slate-700 transition-colors"
                      title="Panodan Kopyalanan Parça Numarasını Yapıştır ve Ara"
                    >
                      <Clipboard className="w-3 h-3 text-emerald-400" />
                      <span>YAPIŞTIR</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Matched count indicator badge & drawer toggle (Green if in stock > 0, Orange if in stock == 0, Red if not found) */}
              <button
                id="btn-toggle-stock-drawer"
                type="button"
                onClick={() => setIsStockDrawerOpen(!isStockDrawerOpen)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border shadow-sm cursor-pointer select-none ${
                  stockSearchStatus === 'in_stock'
                    ? 'bg-emerald-950/80 border-emerald-500/80 text-emerald-300 hover:bg-emerald-900/80 shadow-emerald-950/40'
                    : stockSearchStatus === 'zero_stock'
                    ? 'bg-amber-950/80 border-amber-500/80 text-amber-300 hover:bg-amber-900/80 shadow-amber-950/40'
                    : stockSearchStatus === 'not_found'
                    ? 'bg-rose-950/80 border-rose-500/80 text-rose-300 hover:bg-rose-900/80 shadow-rose-950/40'
                    : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                }`}
              >
                <Package className={`w-3.5 h-3.5 ${
                  stockSearchStatus === 'in_stock'
                    ? 'text-emerald-400'
                    : stockSearchStatus === 'zero_stock'
                    ? 'text-amber-400'
                    : stockSearchStatus === 'not_found'
                    ? 'text-rose-400'
                    : 'text-slate-400'
                }`} />
                <span>
                  {stockSearchStatus === 'in_stock'
                    ? `${matchedDepotItems.length} Stok Kaydı`
                    : stockSearchStatus === 'zero_stock'
                    ? `${matchedDepotItems.length} Stok Kaydı (Stok: 0)`
                    : stockSearchStatus === 'not_found'
                    ? '0 Stok Kaydı (Kayıt Yok)'
                    : 'Stok Kaydı'}
                </span>
                {isStockDrawerOpen ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />}
              </button>

              {/* Zero Report Button (Appears only when eligible: 0 stock or not found) */}
              {isZeroReportEligible && (
                <button
                  id="btn-viewer-zero-report"
                  type="button"
                  onClick={handleOpenZeroReport}
                  className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 font-black text-xs transition-all flex items-center gap-1.5 shadow-md animate-pulse cursor-pointer shrink-0"
                  title="Depoda bulunmayan veya stoğu 0 olan parça için Zero / İhtiyaç Raporu oluştur"
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>ZERO REPORT OLUŞTUR</span>
                </button>
              )}
            </div>
          </div>

          {/* Main Area: Native PDF Viewer via iframe (Background loaded only) */}
          <div className="flex-1 bg-slate-950 overflow-hidden relative flex flex-col">
            {activePdfBlobUrl && !loadingActivePdf ? (
              <iframe
                src={`${activePdfBlobUrl}#toolbar=1&view=FitH`}
                className="w-full h-full border-0 bg-slate-950"
                title={activePub.title}
                id="tech-pub-iframe"
              />
            ) : (
              /* Full Screen Waiting Overlay without blur */
              <div className="h-full w-full flex flex-col items-center justify-center p-8 text-center bg-slate-950 z-20 select-none">
                <div className="relative mb-6">
                  <div className="w-20 h-20 rounded-full border-4 border-emerald-500/20 border-t-emerald-400 animate-spin flex items-center justify-center" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <FileText className="w-8 h-8 text-emerald-400 animate-pulse" />
                  </div>
                </div>

                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-mono font-black mb-3 uppercase tracking-wider">
                  <span>⏳ VERİ YÜKLENİYOR</span>
                </div>

                <h3 className="text-emerald-400 font-black text-base sm:text-lg tracking-wider uppercase mb-2">
                  VERİ YÜKLENİYOR
                </h3>
                
                <p className="text-xs text-slate-300 max-w-md leading-relaxed font-medium">
                  Belge hazırlanıyor, lütfen bekleyiniz. İndirme tamamlandığında belge otomatik olarak açılacaktır.
                </p>

                <div className="mt-5 flex items-center gap-2 text-[11px] font-mono text-slate-400 bg-slate-900/80 border border-slate-800 px-4 py-2 rounded-xl">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span>{activePub.title || activePub.fileName}</span>
                </div>
              </div>
            )}
          </div>

          {/* Bottom Resizable Live Depo Search Drawer in Viewer */}
          {isStockDrawerOpen && (
            <div
              id="tech-pubs-viewer-bottom-drawer"
              style={{ height: drawerHeight }}
              className="bg-slate-900/95 border-t border-slate-700/80 flex flex-col shadow-2xl transition-[height] duration-75 relative shrink-0 z-30"
            >
              {/* Resize Handle */}
              <div
                onMouseDown={handleDragStart}
                className="h-2 w-full bg-slate-800 hover:bg-emerald-500/50 cursor-row-resize flex items-center justify-center transition-colors group"
                title="Yüksekliği ayarlamak için yukarı/aşağı sürükleyiniz"
              >
                <div className="w-12 h-1 rounded-full bg-slate-600 group-hover:bg-white transition-colors" />
              </div>

              {/* Drawer Header */}
              <div className="px-5 py-2 bg-slate-950 flex items-center justify-between border-b border-slate-800 shrink-0">
                <div className="flex items-center gap-2 text-xs font-bold">
                  <Archive className={`w-4 h-4 ${
                    stockSearchStatus === 'in_stock'
                      ? 'text-emerald-400'
                      : stockSearchStatus === 'zero_stock'
                      ? 'text-amber-400'
                      : stockSearchStatus === 'not_found'
                      ? 'text-rose-400'
                      : 'text-emerald-400'
                  }`} />
                  <span className="text-white">CANLI DEPO STOK LİSTESİ &bull; {matchedDepotItems.length} Eşleşme</span>
                  {stockSearchStatus === 'in_stock' && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      MEVCUT (STOK &gt; 0)
                    </span>
                  )}
                  {stockSearchStatus === 'zero_stock' && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      STOK: 0 (TÜKENMİŞ)
                    </span>
                  )}
                  {stockSearchStatus === 'not_found' && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                      SİSTEMDE KAYIT YOK
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {isZeroReportEligible && (
                    <button
                      type="button"
                      onClick={handleOpenZeroReport}
                      className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[11px] font-bold hover:bg-amber-500/30 transition-all flex items-center gap-1 cursor-pointer"
                    >
                      <AlertTriangle className="w-3 h-3" />
                      <span>Zero Report Oluştur</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setIsStockDrawerOpen(false)}
                    className="p-1 text-slate-400 hover:text-white rounded cursor-pointer"
                    title="Kapat"
                  >
                    <ChevronDown className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Drawer Content Table */}
              <div className="flex-1 overflow-y-auto p-3">
                {matchedDepotItems.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
                    <Package className="w-8 h-8 text-slate-600 mb-2" />
                    <p className="text-xs font-semibold text-slate-300">
                      {depoSearchQuery.trim()
                        ? `'${depoSearchQuery}' kriterine uygun parça bulunamadı.`
                        : 'Arama kutusuna parça numarası girerek veya PDF üzerinden metin seçerek depolarda aratabilirsiniz.'}
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
                    {matchedDepotItems.map((item, i) => (
                      <div
                        key={i}
                        className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-emerald-500/40 transition-all"
                      >
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                            {item.unitTitle}
                          </span>
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                            item.durumu === 'FAAL' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-rose-950 text-rose-400 border border-rose-800'
                          }`}>
                            {item.durumu}
                          </span>
                        </div>
                        <h4 className="text-xs font-bold text-white truncate mb-1">{item.adi}</h4>
                        <div className="text-[11px] font-mono text-slate-300 space-y-0.5">
                          <div className="flex justify-between">
                            <span className="text-slate-500">P/N:</span>
                            <span className="text-emerald-300 font-bold">{item.parcaNo}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500">S/N:</span>
                            <span>{item.seriNo}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500">Yer / Raf:</span>
                            <span className="text-amber-300">{item.yer}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-slate-500">Miktar / Stok:</span>
                            <span className={`font-bold px-1.5 py-0.5 rounded text-[11px] ${
                              item.miktarNum > 0
                                ? 'text-emerald-300 bg-emerald-950/80 border border-emerald-800/60'
                                : 'text-amber-300 bg-amber-950/80 border border-amber-800/60'
                            }`}>{item.miktar}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

        </div>
      ) : (
        /* ========================================================================= */
        /* VIEW MODE 2: CATALOG & DOCUMENT POOL (IMAGE 1 EXACT DESIGN)              */
        /* ========================================================================= */
        <div id="tech-pubs-catalog-screen" className="flex-1 flex flex-col bg-[#061e12] overflow-hidden select-text">
          
          {/* TOP GREEN BANNER (IMAGE 1 HEADER) */}
          <div id="tech-pubs-main-header" className="bg-[#0b3d1d] border-b border-[#0f4d25] px-6 py-3.5 flex items-center justify-between gap-4 shadow-xl shrink-0">
            {/* Left: Icon & Title */}
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-full bg-emerald-900/60 border border-emerald-400/30 flex items-center justify-center text-emerald-300 shadow-inner">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-base font-black text-white tracking-wide flex items-center gap-2">
                  <span>📖 TEKNİK YAYINLAR HAVUZU & DOKÜMANTASYON</span>
                </h1>
                <p className="text-[11px] font-medium text-emerald-200/80">
                  Uçak & Helikopter AMM, IPC, CMM, Şema ve Bültenler &bull; Anlık Depo Stok Taraması
                </p>
              </div>
            </div>

            {/* Right Action Buttons (Image 1) */}
            <div className="flex items-center gap-3">
              {/* GOOGLE DRIVE SYNC & REFRESH BUTTON */}
              <button
                id="btn-sync-drive-pubs"
                onClick={() => fetchDrivePublications(true)}
                disabled={isDriveLoading}
                className="px-3 py-1.5 rounded-full bg-[#052813] hover:bg-[#07381b] border border-emerald-500/40 flex items-center gap-2 text-xs font-bold text-emerald-300 transition-all cursor-pointer disabled:opacity-60 shadow-sm"
                title={lastDriveSyncTime ? `Son Senkronizasyon: ${lastDriveSyncTime}. Yenilemek için tıklayın.` : "Google Drive'dan Yayınları Yenile"}
              >
                <RotateCw className={`w-3.5 h-3.5 text-emerald-400 ${isDriveLoading ? 'animate-spin' : ''}`} />
                <span>{isDriveLoading ? "VERİ YÜKLENİYOR..." : (lastDriveSyncTime ? `DRIVE SENKRON (${lastDriveSyncTime})` : "DRIVE SENKRON")}</span>
              </button>

              {/* CANLI DEPO ENTEGRE badge */}
              <div className="px-3 py-1.5 rounded-full bg-[#052813] border border-emerald-500/30 flex items-center gap-2 text-xs font-bold text-emerald-300">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>CANLI DEPO ENTEGRE</span>
              </div>

              {/* TÜM DEPOLARDA SORGULA button (Gold/Amber theme) */}
              <button
                id="btn-global-depo-query"
                onClick={() => setIsGlobalDepoModalOpen(true)}
                className="px-4 py-2 rounded-full bg-[#523e02]/80 hover:bg-[#684f02] border border-[#eab308]/60 text-[#fef08a] text-xs font-black transition-all flex items-center gap-2 shadow-md cursor-pointer active:scale-95"
              >
                <span>📦 TÜM DEPOLARDA SORGULA</span>
              </button>

              {/* + PDF / YAYIN YÜKLE button (Bright Emerald) */}
              <button
                id="btn-open-upload-modal"
                onClick={() => setIsUploadModalOpen(true)}
                className="px-4 py-2 rounded-full bg-[#009b4d] hover:bg-[#00b359] text-white text-xs font-black transition-all flex items-center gap-2 shadow-lg cursor-pointer active:scale-95"
              >
                <Upload className="w-4 h-4" />
                <span>+ PDF / YAYIN YÜKLE</span>
              </button>

              {/* Close Button */}
              <button
                id="btn-close-tech-pubs-modal"
                onClick={onClose}
                className="p-2 rounded-full bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 hover:text-white transition-all ml-1 border border-emerald-800"
                title="Kapat"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* MAIN BODY: SIDEBAR + CONTENT AREA (IMAGE 1) */}
          <div className="flex-1 flex overflow-hidden">
            
            {/* LEFT SIDEBAR: BİRİM KLASÖRLERİ */}
            <div id="tech-pubs-birim-sidebar" className="w-80 bg-[#092b17] border-r border-[#0f4624] flex flex-col shrink-0">
              
              {/* Sidebar Header */}
              <div className="px-5 py-3.5 border-b border-[#0f4624] flex items-center justify-between text-white">
                <span className="text-xs font-black tracking-wider uppercase flex items-center gap-2">
                  <span>📁 BİRİM KLASÖRLERİ</span>
                </span>
              </div>

              {/* Aircraft Folder Items List */}
              <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
                {UNIT_FOLDER_OPTIONS.map(folder => {
                  const isSelected = selectedUnitFilter === folder.key;
                  const isUnlocked = unlockedUnits.has(folder.key);
                  const count = publications.filter(p => (p.unit || p.unitKey) === folder.key).length;

                  return (
                    <button
                      key={folder.key}
                      id={`btn-folder-${folder.key}`}
                      onClick={() => handleSelectUnitFolder(folder.key)}
                      className={`w-full p-2.5 rounded-2xl transition-all flex items-center justify-between text-left group cursor-pointer ${
                        isSelected
                          ? 'bg-[#0f4624] border border-emerald-500/60 shadow-md text-white'
                          : 'bg-[#0b331b]/60 hover:bg-[#0d3b1f] border border-transparent text-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {/* Folder Badge / Tag Icon */}
                        {folder.tag ? (
                          <div className={`w-9 h-9 rounded-xl ${folder.badgeBg} font-black text-xs flex items-center justify-center font-mono shrink-0 shadow-sm`}>
                            {folder.tag}
                          </div>
                        ) : (
                          <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center shrink-0 border border-emerald-500/30">
                            <Layers className="w-5 h-5" />
                          </div>
                        )}

                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-black text-white group-hover:text-emerald-300 transition-colors">
                              {folder.label}
                            </span>
                            {folder.type && (
                              <span className="text-[9px] font-black px-1.5 py-0.2 rounded bg-slate-900/60 text-slate-300 border border-slate-700/60">
                                {folder.type}
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-emerald-200/60 truncate max-w-[145px]">
                            {folder.sub}
                          </p>
                        </div>
                      </div>

                      {/* Count Badge & Lock Status */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-black font-mono shrink-0 ${
                          isSelected ? 'bg-emerald-500 text-slate-950' : 'bg-slate-900/80 text-emerald-300'
                        }`}>
                          {count}
                        </span>
                        {isUnlocked ? (
                          <Unlock className="w-3.5 h-3.5 text-emerald-400 opacity-80" />
                        ) : (
                          <Lock className="w-3.5 h-3.5 text-amber-400 opacity-80" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Bottom Usage Hint Card (Image 1) */}
              <div className="p-3 m-3 rounded-2xl bg-[#072413] border border-emerald-500/20 text-emerald-200/90 text-[11px] leading-relaxed">
                <div className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold text-sm">ℹ️</span>
                  <div>
                    <strong className="text-white font-bold">Kullanım:</strong> Dokümana çift tıklayarak PDF okuyucusunu açabilir; metin veya P/N seçerek depoda arayabilirsiniz.
                  </div>
                </div>
              </div>

            </div>

            {/* RIGHT MAIN CONTENT: SEARCH & DOCUMENT CARDS (IMAGE 1) */}
            <div id="tech-pubs-main-catalog-pane" className="flex-1 bg-[#f4f7f5] text-slate-900 flex flex-col overflow-hidden">
              
              {/* Search & Category Filter Bar */}
              <div className="p-4 bg-white border-b border-slate-200 flex items-center justify-between gap-4 shrink-0 flex-wrap shadow-xs">
                {/* Search input */}
                <div className="relative flex-1 min-w-[280px] max-w-lg">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    id="input-catalog-search"
                    type="text"
                    value={pubSearchQuery}
                    onChange={e => setPubSearchQuery(e.target.value)}
                    placeholder="Yayın adı, dosya adı veya revizyon ara..."
                    className="w-full bg-slate-50 border border-slate-300 rounded-full pl-10 pr-8 py-2 text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/10 transition-all"
                  />
                  {pubSearchQuery && (
                    <button
                      onClick={() => setPubSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Category Pills (Image 1) */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  {CATEGORY_TABS.map(tab => (
                    <button
                      key={tab}
                      onClick={() => {
                        setSelectedCategoryFilter(tab);
                        setPubSearchQuery('');
                      }}
                      className={`px-3 py-1.5 rounded-full text-xs font-black transition-all cursor-pointer ${
                        selectedCategoryFilter === tab
                          ? 'bg-[#153422] text-white shadow-sm'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>

              {/* Catalog Section Header */}
              <div className="px-6 py-3 bg-slate-100/80 border-b border-slate-200 flex items-center justify-between gap-4 shrink-0">
                <div className="flex items-center gap-2.5">
                  <span className="text-xs font-black text-slate-800 uppercase tracking-wider">
                    {UNIT_FOLDER_OPTIONS.find(u => u.key === selectedUnitFilter)?.label || 'AT-802F'} TEKNİK YAYINLARI
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase">
                    {filteredPublications.length} DOKÜMAN
                  </span>
                </div>
                <span className="text-[11px] text-slate-500 italic">
                  * Görüntülemek için dokümana çift tıklayınız
                </span>
              </div>

              {/* Publications Cards List (Image 1) */}
              <div className="flex-1 overflow-y-auto p-6 space-y-3">
                {filteredPublications.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-500">
                    <div className="w-16 h-16 rounded-3xl bg-slate-200 flex items-center justify-center text-slate-400 mb-3">
                      <Archive className="w-8 h-8" />
                    </div>
                    <h3 className="text-sm font-bold text-slate-700 mb-1">Döküman Bulunamadı</h3>
                    <p className="text-xs text-slate-500 max-w-sm mb-4 leading-relaxed">
                      Seçili filtre veya arama kriterine uygun teknik yayın bulunmuyor. Yeni döküman eklemek için yukarıdaki butonu kullanabilirsiniz.
                    </p>
                    <button
                      onClick={() => setIsUploadModalOpen(true)}
                      className="px-5 py-2.5 rounded-full bg-[#009b4d] hover:bg-[#00b359] text-white text-xs font-black transition-all flex items-center gap-2 shadow-md"
                    >
                      <Plus className="w-4 h-4" />
                      <span>+ PDF / Yayın Yükle</span>
                    </button>
                  </div>
                ) : (
                  filteredPublications.map(pub => (
                    <div
                      key={pub.id}
                      id={`pub-card-${pub.id}`}
                      onDoubleClick={() => openPublicationInViewer(pub)}
                      className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-emerald-500 hover:shadow-md transition-all flex items-center justify-between gap-4 group cursor-pointer"
                    >
                      {/* Left: Book Icon with Tool Tag */}
                      <div className="flex items-center gap-4 min-w-0">
                        <div className="relative shrink-0">
                          <div className="w-12 h-12 rounded-2xl bg-[#0b3d1d] text-emerald-300 flex items-center justify-center shadow-sm">
                            <BookOpen className="w-6 h-6" />
                          </div>
                          <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center shadow-xs">
                            <Wrench className="w-3 h-3" />
                          </div>
                        </div>

                        {/* Middle: Badges, Title & File Info */}
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                            <span className="px-2 py-0.5 rounded-md bg-amber-600 text-white font-black text-[10px] uppercase">
                              {pub.unitLabel}
                            </span>
                            <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-black text-[10px] uppercase border border-emerald-200">
                              {pub.category || 'IPC'}
                            </span>
                            <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-bold text-[10px] uppercase border border-slate-200">
                              {pub.revision || 'Rev. 01'}
                            </span>
                          </div>

                          <h3 className="text-sm font-black text-slate-900 group-hover:text-emerald-800 transition-colors truncate">
                            {pub.title}
                          </h3>

                          <p className="text-[11px] text-slate-500 font-medium">
                            {pub.fileName} &bull; {pub.fileSize || '11.1 MB'} &bull; Yükleme: {pub.uploadDate || '2026-08-20'}
                          </p>
                        </div>
                      </div>

                      {/* Right: Actions */}
                      <div className="flex items-center gap-2 shrink-0">
                        {/* GÖRÜNTÜLE & ARA button (Image 1) */}
                        <button
                          id={`btn-view-pub-${pub.id}`}
                          onClick={() => openPublicationInViewer(pub)}
                          className="px-4 py-2 rounded-full bg-[#0b3d1d] hover:bg-[#0f4d25] text-white text-xs font-black transition-all flex items-center gap-1.5 shadow-sm cursor-pointer active:scale-95"
                        >
                          <Eye className="w-4 h-4" />
                          <span>👁️ GÖRÜNTÜLE & ARA</span>
                        </button>

                        {/* Edit Button (Password protected) */}
                        <button
                          id={`btn-edit-pub-${pub.id}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            requestPasswordAuth(pub, 'edit');
                          }}
                          className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-amber-600 transition-colors"
                          title="Düzenle (Şifreli)"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>

                        {/* Delete Button (Password protected) */}
                        <button
                          id={`btn-delete-pub-${pub.id}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            requestPasswordAuth(pub, 'delete');
                          }}
                          className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-rose-600 transition-colors"
                          title="Sil (Şifreli)"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

            </div>

          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* GLOBAL DEPO SORGUSU MODAL                                                 */}
      {/* ========================================================================= */}
      {isGlobalDepoModalOpen && (
        <div className="fixed inset-0 z-[10001] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center justify-center">
                  <Archive className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white uppercase">TÜM DEPOLARDA CANLI STOK SORGUSU</h3>
                  <p className="text-xs text-slate-400">Tüm filo ve hangar depolarında anlık parça / seri numarası taraması</p>
                </div>
              </div>
              <button
                onClick={() => setIsGlobalDepoModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 bg-slate-900 border-b border-slate-800 flex flex-wrap items-center gap-3">
              <div className="relative flex-1 min-w-[260px]">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={depoSearchQuery}
                  onChange={e => setDepoSearchQuery(e.target.value)}
                  placeholder="Parça No (P/N), Seri No veya Malzeme Adı giriniz..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  autoFocus
                />
              </div>

              {/* Status Badge */}
              <div className={`px-3 py-2 rounded-2xl text-xs font-bold flex items-center gap-1.5 border shadow-sm ${
                stockSearchStatus === 'in_stock'
                  ? 'bg-emerald-950/80 border-emerald-500/80 text-emerald-300'
                  : stockSearchStatus === 'zero_stock'
                  ? 'bg-amber-950/80 border-amber-500/80 text-amber-300'
                  : stockSearchStatus === 'not_found'
                  ? 'bg-rose-950/80 border-rose-500/80 text-rose-300'
                  : 'bg-slate-800 border-slate-700 text-slate-300'
              }`}>
                <Package className={`w-3.5 h-3.5 ${
                  stockSearchStatus === 'in_stock'
                    ? 'text-emerald-400'
                    : stockSearchStatus === 'zero_stock'
                    ? 'text-amber-400'
                    : stockSearchStatus === 'not_found'
                    ? 'text-rose-400'
                    : 'text-slate-400'
                }`} />
                <span>
                  {stockSearchStatus === 'in_stock'
                    ? `${matchedDepotItems.length} Stok Kaydı (Mevcut: ${matchedTotalStockQuantity})`
                    : stockSearchStatus === 'zero_stock'
                    ? `${matchedDepotItems.length} Stok Kaydı (Stok: 0)`
                    : stockSearchStatus === 'not_found'
                    ? '0 Stok Kaydı (Kayıt Yok)'
                    : 'Stok Kaydı'}
                </span>
              </div>

              {/* Zero Report Button (Appears only when eligible: 0 stock or not found) */}
              {isZeroReportEligible && (
                <button
                  type="button"
                  onClick={handleOpenZeroReport}
                  className="px-3 py-2 rounded-2xl bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 font-black text-xs transition-all flex items-center gap-1.5 shadow-md animate-pulse cursor-pointer shrink-0"
                  title="Depoda bulunmayan veya stoğu 0 olan parça için Zero / İhtiyaç Raporu oluştur"
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>ZERO REPORT OLUŞTUR</span>
                </button>
              )}
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {matchedDepotItems.length === 0 ? (
                <div className="text-center p-8 text-slate-400">
                  <Package className="w-10 h-10 text-slate-600 mx-auto mb-2" />
                  <p className="text-xs font-semibold text-slate-300">
                    {depoSearchQuery.trim() ? `'${depoSearchQuery}' ile eşleşen parça bulunamadı.` : 'Aramak istediğiniz parça veya seri numarasını yazınız.'}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {matchedDepotItems.map((item, i) => (
                    <div key={i} className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
                      <div className="flex justify-between items-start gap-2 mb-1">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          {item.unitTitle}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-white">
                          Stok: {item.miktar}
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-white mb-1">{item.adi}</h4>
                      <div className="text-[11px] text-slate-400 space-y-0.5">
                        <div><strong className="text-slate-300">P/N:</strong> {item.parcaNo}</div>
                        <div><strong className="text-slate-300">S/N:</strong> {item.seriNo}</div>
                        <div><strong className="text-slate-300">Konum:</strong> {item.yer}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* UPLOAD MODAL (+ PDF / YAYIN YÜKLE)                                        */}
      {/* ========================================================================= */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-[10002] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-slate-100">
            <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center justify-center">
                  <Upload className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white uppercase">+ TEKNİK YAYIN & DÖKÜMAN YÜKLE</h3>
                  <p className="text-xs text-slate-400">PDF kataloglarını, IPC ve AMM dökümanlarını sisteme yükleyin</p>
                </div>
              </div>
              <button
                onClick={() => setIsUploadModalOpen(false)}
                className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 flex-1">
              {/* Unit & Category Selector */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Hedef Hava Aracı</label>
                  <select
                    value={uploadUnit}
                    onChange={e => setUploadUnit(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-emerald-500 outline-none cursor-pointer"
                  >
                    {UNIT_FOLDER_OPTIONS.filter(u => u.key !== 'all').map(u => (
                      <option key={u.key} value={u.key}>{u.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Yayın Türü / Kategori</label>
                  <select
                    value={uploadCategory}
                    onChange={e => setUploadCategory(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-emerald-500 outline-none cursor-pointer"
                  >
                    <option value="IPC">IPC (Parça Kataloğu)</option>
                    <option value="AMM">AMM (Bakım El Kitabı)</option>
                    <option value="CMM">CMM (Komponent Bakım)</option>
                    <option value="ŞEMA">ŞEMA / WDM</option>
                    <option value="EL KİTABI">EL KİTABI</option>
                    <option value="STANDART">STANDART</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Revizyon</label>
                  <input
                    type="text"
                    value={uploadRevision}
                    onChange={e => setUploadRevision(e.target.value)}
                    placeholder="Rev. 01"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-emerald-500 outline-none"
                  />
                </div>
              </div>

              {/* Section selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Bölüm / Tanım</label>
                <select
                  value={uploadSection}
                  onChange={e => {
                    setUploadSection(e.target.value);
                    setUploadCustomSection('');
                  }}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-emerald-500 outline-none cursor-pointer"
                >
                  {SECTION_SUGGESTIONS.map(sec => (
                    <option key={sec} value={sec}>{sec}</option>
                  ))}
                  <option value="custom">+ Özel Bölüm Adı Girin</option>
                </select>
              </div>

              {uploadSection === 'custom' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Özel Bölüm Adı</label>
                  <input
                    type="text"
                    value={uploadCustomSection}
                    onChange={e => setUploadCustomSection(e.target.value)}
                    placeholder="Örn: Bölüm 6 - Yakıt ve İkmal Sistemi"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-emerald-500 outline-none"
                  />
                </div>
              )}

              {/* File Dropzone */}
              <div className="border-2 border-dashed border-slate-700/80 hover:border-emerald-500/60 rounded-2xl p-6 text-center bg-slate-950/40 transition-colors relative cursor-pointer group">
                <input
                  type="file"
                  multiple
                  accept=".pdf,application/pdf"
                  onChange={handleFileInputChange}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
                <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-emerald-400 mx-auto mb-2 group-hover:scale-105 transition-transform">
                  <FileText className="w-6 h-6" />
                </div>
                <h4 className="text-xs font-bold text-white mb-1">PDF Dökümanlarını Seçiniz veya Sürükleyiniz</h4>
                <p className="text-[11px] text-slate-400">Tek veya çoklu PDF seçimi yapabilirsiniz</p>
              </div>

              {/* Selected files list */}
              {selectedFiles.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-400 px-1">
                    <span>Seçilen Yayınlar ({selectedFiles.length})</span>
                    <button
                      onClick={() => setSelectedFiles([])}
                      className="text-rose-400 hover:text-rose-300 text-[11px]"
                    >
                      Listeyi Temizle
                    </button>
                  </div>
                  <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
                    {selectedFiles.map((item, idx) => (
                      <div key={idx} className="p-2.5 bg-slate-950 border border-slate-800 rounded-xl flex items-center gap-3">
                        <FileText className="w-4 h-4 text-emerald-400 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <input
                            type="text"
                            value={item.customTitle}
                            onChange={e => {
                              const val = e.target.value;
                              setSelectedFiles(prev => prev.map((f, i) => i === idx ? { ...f, customTitle: val } : f));
                            }}
                            placeholder="Yayın Adı"
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs text-white focus:border-emerald-500 outline-none truncate"
                          />
                        </div>
                        <button
                          onClick={() => setSelectedFiles(prev => prev.filter((_, i) => i !== idx))}
                          className="p-1 rounded-lg text-slate-400 hover:text-rose-400"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {uploadProgress && (
                <div className="p-3 bg-emerald-950/30 border border-emerald-500/30 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 animate-spin text-emerald-400 shrink-0" />
                  <span>{uploadProgress}</span>
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-slate-800 bg-slate-950 flex items-center justify-end gap-3">
              <button
                onClick={() => setIsUploadModalOpen(false)}
                disabled={isUploading}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                İptal
              </button>
              <button
                id="btn-confirm-upload"
                onClick={handlePerformUpload}
                disabled={isUploading || selectedFiles.length === 0}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white text-xs font-bold flex items-center gap-2 shadow-lg"
              >
                {isUploading ? (
                  <>
                    <Sparkles className="w-4 h-4 animate-spin" />
                    <span>Yükleniyor...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    <span>Yayınları Kaydet</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* PASSWORD AUTH MODAL                                                       */}
      {/* ========================================================================= */}
      {passwordModalOpen && passwordTargetPub && (
        <div className="fixed inset-0 z-[10003] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-sm p-6 shadow-2xl text-center text-slate-100">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center mx-auto mb-3">
              <Lock className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-black text-white uppercase mb-1">
              GÜVENLİK ŞİFRESİ GİRİNİZ
            </h3>
            <p className="text-xs text-slate-400 mb-4 leading-relaxed">
              <strong className="text-white">{passwordTargetPub.unitLabel}</strong> birimine ait yayını {passwordTargetAction === 'delete' ? 'silmek' : 'düzenlemek'} için şifreyi giriniz.
            </p>
            <input
              type="password"
              value={enteredPassword}
              onChange={e => setEnteredPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handlePasswordSubmit()}
              placeholder="Şifre"
              className="w-full bg-slate-950 border border-slate-700 rounded-2xl px-4 py-2.5 text-center text-sm font-mono text-white focus:border-emerald-500 outline-none mb-2 tracking-widest"
              autoFocus
            />
            {passwordError && (
              <p className="text-xs text-rose-400 font-bold mb-3">{passwordError}</p>
            )}
            <div className="flex items-center gap-2 mt-4">
              <button
                onClick={() => setPasswordModalOpen(false)}
                className="flex-1 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300"
              >
                İptal
              </button>
              <button
                onClick={handlePasswordSubmit}
                className="flex-1 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white shadow-md"
              >
                Doğrula & Devam Et
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* UNIT ACCESS PIN / PASSWORD MODAL                                          */}
      {/* ========================================================================= */}
      {unitPasswordModalOpen && targetUnitToUnlock && (
        <div className="fixed inset-0 z-[10003] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-sm p-6 shadow-2xl text-center text-slate-100 animate-in fade-in zoom-in-95">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center mx-auto mb-3">
              <Lock className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-black text-white uppercase mb-1">
              BİRİM GİRİŞ ŞİFRESİ
            </h3>
            <p className="text-xs text-slate-400 mb-4 leading-relaxed">
              <strong className="text-white">{UNIT_FOLDER_OPTIONS.find(u => u.key === targetUnitToUnlock)?.label || targetUnitToUnlock}</strong> birimine ait teknik yayınları görüntülemek için yetkili şifreyi giriniz.
            </p>
            <input
              type="password"
              value={enteredUnitPassword}
              onChange={e => setEnteredUnitPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleUnitPasswordSubmit()}
              placeholder="Birim Şifresi"
              className="w-full bg-slate-950 border border-slate-700 rounded-2xl px-4 py-2.5 text-center text-sm font-mono text-white focus:border-emerald-500 outline-none mb-2 tracking-widest"
              autoFocus
            />
            {unitPasswordError && (
              <p className="text-xs text-rose-400 font-bold mb-3">{unitPasswordError}</p>
            )}
            <div className="flex items-center gap-2 mt-4">
              <button
                onClick={() => {
                  setUnitPasswordModalOpen(false);
                  setEnteredUnitPassword('');
                  setUnitPasswordError('');
                }}
                className="flex-1 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 cursor-pointer"
              >
                İptal
              </button>
              <button
                onClick={handleUnitPasswordSubmit}
                className="flex-1 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white shadow-md cursor-pointer"
              >
                Giriş Yap
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* EDIT MODAL                                                                */}
      {/* ========================================================================= */}
      {editModalOpen && editingPub && (
        <div className="fixed inset-0 z-[10003] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-lg p-6 shadow-2xl text-slate-100">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <Edit3 className="w-5 h-5 text-amber-400" />
                <h3 className="text-sm font-black text-white uppercase">YAYIN BİLGİLERİNİ DÜZENLE</h3>
              </div>
              <button onClick={() => setEditModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Yayın Başlığı</label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={e => setEditTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-emerald-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Kategori</label>
                  <select
                    value={editCategory}
                    onChange={e => setEditCategory(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-emerald-500 outline-none"
                  >
                    <option value="IPC">IPC</option>
                    <option value="AMM">AMM</option>
                    <option value="CMM">CMM</option>
                    <option value="ŞEMA">ŞEMA</option>
                    <option value="EL KİTABI">EL KİTABI</option>
                    <option value="STANDART">STANDART</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Revizyon</label>
                  <input
                    type="text"
                    value={editRevision}
                    onChange={e => setEditRevision(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-emerald-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Bölüm / Kategori</label>
                <input
                  type="text"
                  value={editSection}
                  onChange={e => setEditSection(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-emerald-500 outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 mt-6 pt-3 border-t border-slate-800">
              <button
                onClick={() => setEditModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300"
              >
                İptal
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white shadow-md"
              >
                Kaydet
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ZERO REPORT / MALZEME TALEP RAPORU MODAL                                  */}
      {/* ========================================================================= */}
      {zeroReportModalOpen && zeroReportData && (
        <div className="fixed inset-0 z-[10004] bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-amber-500/40 rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-slate-100">
            <div className="px-6 py-4 bg-amber-950/40 border-b border-amber-500/30 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-amber-300 uppercase">ZERO REPORT &bull; MALZEME TALEP RAPORU</h3>
                  <p className="text-xs text-slate-400">Depo stoğu bulunmayan veya tükenen parça için resmi talep fişi</p>
                </div>
              </div>
              <button onClick={() => setZeroReportModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 flex-1 text-xs">
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex justify-between border-b border-slate-800 pb-2">
                  <span className="text-slate-400 font-bold">TALEP EDİLEN PARÇA NO / TANIM:</span>
                  <span className="font-mono text-emerald-400 font-black">{zeroReportData.query}</span>
                </div>
                <div className="flex justify-between border-b border-slate-800 pb-2">
                  <span className="text-slate-400 font-bold">HEDEF HAVA ARACI:</span>
                  <span className="text-white font-bold">{zeroReportData.targetUnit}</span>
                </div>
                <div className="flex justify-between border-b border-slate-800 pb-2">
                  <span className="text-slate-400 font-bold">MEVCUT DEPO STOK DURUMU:</span>
                  <span className="text-rose-400 font-black">0 ADET (STOKTA YOK VEYA TÜKENDİ)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-bold">RAPOR TARİHİ:</span>
                  <span className="text-slate-300">{zeroReportData.date}</span>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 bg-slate-950 border-t border-slate-800 flex items-center justify-end gap-3">
              <button
                onClick={() => setZeroReportModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold"
              >
                Kapat
              </button>
              <button
                onClick={() => {
                  window.print();
                }}
                className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center gap-2 shadow-lg"
              >
                <Download className="w-4 h-4" />
                <span>Raporu Yazdır / PDF İndir</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
