// IndexedDB based document storage for Hangar and Teçhizat PDF Documents
// Eliminates localStorage 5MB quota errors for large PDF documents

export interface HangarPdfDoc {
  id: string;
  itemKey: string;
  fileName: string;
  fileData: string; // Base64 data URL or Blob URL
  docType: string;
  firma: string;
  uploadDate: string;
  fileSize: string;
  uploadedAt?: string;
  driveFileId?: string;
  driveUrl?: string;
}

const DB_NAME = 'hangar_techizat_docs_db';
const STORE_NAME = 'pdf_documents';
const DB_VERSION = 1;

function openDb(): Promise<IDBDatabase | null> {
  if (typeof window === 'undefined' || !window.indexedDB) {
    return Promise.resolve(null);
  }

  return new Promise((resolve) => {
    try {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (e) => {
        const db = (e.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        }
      };

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => {
        console.warn('[HangarPdfStorage] IndexedDB open error:', request.error);
        resolve(null);
      };
    } catch (err) {
      console.warn('[HangarPdfStorage] Initialization failed:', err);
      resolve(null);
    }
  });
}

// In-memory cache for ultra-fast access
let memoryCache: HangarPdfDoc[] | null = null;

export async function getAllHangarPdfDocs(): Promise<HangarPdfDoc[]> {
  if (memoryCache) {
    return memoryCache;
  }

  // 1. Try to read from IndexedDB
  const db = await openDb();
  let docs: HangarPdfDoc[] = [];

  if (db) {
    docs = await new Promise<HangarPdfDoc[]>((resolve) => {
      try {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const req = store.getAll();

        req.onsuccess = () => resolve(req.result || []);
        req.onerror = () => resolve([]);
      } catch {
        resolve([]);
      }
    });
  }

  // 2. Migration from localStorage if IndexedDB is empty
  if (docs.length === 0 && typeof window !== 'undefined') {
    try {
      const savedLocal = localStorage.getItem('hangar_pdf_docs') || localStorage.getItem('hangar_techizat_pdf_docs');
      if (savedLocal) {
        const parsed = JSON.parse(savedLocal) as HangarPdfDoc[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          docs = parsed;
          // Save back into IndexedDB
          if (db) {
            const tx = db.transaction(STORE_NAME, 'readwrite');
            const store = tx.objectStore(STORE_NAME);
            parsed.forEach(doc => store.put(doc));
          }
        }
      }
    } catch (e) {
      console.warn('LocalStorage migration error:', e);
    }
  }

  memoryCache = docs;
  return docs;
}

export async function saveHangarPdfDoc(doc: HangarPdfDoc): Promise<void> {
  // Update memory cache
  if (!memoryCache) {
    memoryCache = [];
  }
  memoryCache = [doc, ...memoryCache.filter(d => d.id !== doc.id)];

  // Save into IndexedDB
  const db = await openDb();
  if (db) {
    await new Promise<void>((resolve, reject) => {
      try {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const req = store.put(doc);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      } catch (err) {
        reject(err);
      }
    });
  }

  // Try lightweight localStorage save with small metadata only (avoid storing large fileData in localStorage)
  try {
    const lightMeta = memoryCache.slice(0, 10).map(d => ({
      ...d,
      fileData: d.fileData.length > 1000 ? d.fileData.substring(0, 200) + '...[IDB]' : d.fileData
    }));
    localStorage.setItem('hangar_pdf_docs_meta', JSON.stringify(lightMeta));
  } catch {
    // Ignore quota errors on metadata
  }
}

export async function deleteHangarPdfDoc(id: string): Promise<void> {
  if (memoryCache) {
    memoryCache = memoryCache.filter(d => d.id !== id);
  }

  const db = await openDb();
  if (db) {
    await new Promise<void>((resolve) => {
      try {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const req = store.delete(id);
        req.onsuccess = () => resolve();
        req.onerror = () => resolve();
      } catch {
        resolve();
      }
    });
  }
}
