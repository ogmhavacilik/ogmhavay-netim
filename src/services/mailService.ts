
import { MAIL_LOG_SHEET_ID, LOG_SCRIPT_URL } from '../../constants';

export interface MailRecipient {
  id: string;
  name: string;
  email: string;
  type: 'MANUEL' | 'OTOMATİK';
  time: string;
  days: string;
  attachments: string;
}

export const getMailRecipients = async (): Promise<MailRecipient[]> => {
  try {
    const response = await fetch(LOG_SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify({
        action: 'getMailRecipients',
        sheetId: MAIL_LOG_SHEET_ID
      })
    });
    const result = await response.json();
    if (result.status === 'success') {
      return result.data.map((r: any) => ({
        id: r['ID'],
        name: r['PERSONEL ADI'],
        email: r['PERSONEL MAİL ADRESİ'],
        type: r['MAİL GÖNDERME TÜRÜ'],
        time: r['SAAT'],
        days: r['GÜN SEÇENEĞİ'],
        attachments: r['GÖNDERİLECEK MAİLİN EKİ']
      }));
    }
    return [];
  } catch (error) {
    console.error('Error fetching mail recipients:', error);
    return [];
  }
};

export const saveMailRecipient = async (recipient: Partial<MailRecipient>): Promise<boolean> => {
  try {
    const response = await fetch(LOG_SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify({
        action: 'saveMailRecipient',
        sheetId: MAIL_LOG_SHEET_ID,
        ...recipient
      })
    });
    const result = await response.json();
    if (result.status === 'success') return true;
    console.error('Save recipient error:', result.error || 'Unknown error');
    return false;
  } catch (error) {
    console.error('Error saving mail recipient:', error);
    return false;
  }
};

export const deleteMailRecipient = async (id: string): Promise<boolean> => {
  try {
    const response = await fetch(LOG_SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify({
        action: 'deleteMailRecipient',
        sheetId: MAIL_LOG_SHEET_ID,
        id
      })
    });
    const result = await response.json();
    if (result.status === 'success') return true;
    console.error('Delete recipient error:', result.error || 'Unknown error');
    return false;
  } catch (error) {
    console.error('Error deleting mail recipient:', error);
    return false;
  }
};

export const sendManualEmail = async (id: string, customAttachments?: { name: string, data: string, mimeType: string }[]): Promise<boolean> => {
  try {
    const response = await fetch(LOG_SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify({
        action: 'sendManualEmail',
        sheetId: MAIL_LOG_SHEET_ID,
        id,
        customAttachments
      })
    });
    const result = await response.json();
    if (result.status === 'success') return true;
    console.error('Send manual email error:', result.error || 'Unknown error');
    return false;
  } catch (error) {
    console.error('Error sending manual email:', error);
    return false;
  }
};

export const testMail = async (email: string): Promise<{ success: boolean; message?: string }> => {
  try {
    const response = await fetch(LOG_SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify({
        action: 'testMail',
        sheetId: MAIL_LOG_SHEET_ID,
        email
      })
    });
    const result = await response.json();
    if (result.status === 'success') return { success: true };
    return { success: false, message: result.error || 'Unknown error' };
  } catch (error) {
    console.error('Error testing mail:', error);
    return { success: false, message: 'Connection error' };
  }
};
