/* ──────────────────────────────────────────
   Google Drive API Integration (Client-Side Only, Offline-File Friendly)
   ────────────────────────────────────────── */

const SCOPES = 'https://www.googleapis.com/auth/drive.file';
const BACKUP_FILENAME = 'creator-content-planner-backup.json';

let tokenClient = null;
let accessToken = null;

/** Initialize Google Identity script dynamically */
export function initGoogleDrive(clientId, onStatusChange) {
  return new Promise((resolve) => {
    if (!clientId) {
      console.warn('[Google Drive] Client ID not provided.');
      return resolve(false);
    }

    if (window.google && window.google.accounts && window.google.accounts.oauth2) {
      setupTokenClient(clientId, onStatusChange);
      return resolve(true);
    }

    const scriptGis = document.createElement('script');
    scriptGis.src = 'https://accounts.google.com/gsi/client';
    scriptGis.async = true;
    scriptGis.defer = true;
    scriptGis.onload = () => {
      setupTokenClient(clientId, onStatusChange);
      resolve(true);
    };
    document.head.appendChild(scriptGis);
  });
}

function setupTokenClient(clientId, onStatusChange) {
  tokenClient = window.google.accounts.oauth2.initTokenClient({
    client_id: clientId,
    scope: SCOPES,
    callback: (resp) => {
      if (resp.error) {
        console.error('[Google Drive] Token error:', resp);
        if (onStatusChange) onStatusChange(false, 'Auth error: ' + resp.error);
        return;
      }
      accessToken = resp.access_token;
      console.log('[Google Drive] Authenticated successfully!');
      if (onStatusChange) onStatusChange(true, 'Connected');
    },
  });
}

/** Request user authorization token */
export function authenticateDrive() {
  return new Promise((resolve, reject) => {
    if (!tokenClient) return reject(new Error('Google Drive integration not initialized. Please configure Client ID in Settings.'));
    
    tokenClient.callback = (resp) => {
      if (resp.error) return reject(new Error('Google Authentication Failed: ' + resp.error));
      accessToken = resp.access_token;
      resolve(accessToken);
    };
    
    // Request token without forcing prompt if possible
    tokenClient.requestAccessToken({ prompt: '' });
  });
}

/** Backup data JSON directly to Google Drive */
export async function backupToDrive(dataObj) {
  if (!accessToken) {
    await authenticateDrive();
  }

  const jsonStr = JSON.stringify(dataObj, null, 2);
  const fileId = await findBackupFileId();

  if (fileId) {
    const res = await fetch(`https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=media`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: jsonStr,
    });
    if (!res.ok) throw new Error('Failed to update Google Drive backup file.');
    return { status: 'updated', fileId };
  } else {
    const metadata = {
      name: BACKUP_FILENAME,
      mimeType: 'application/json',
    };

    const form = new FormData();
    form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
    form.append('file', new Blob([jsonStr], { type: 'application/json' }));

    const res = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
      body: form,
    });

    if (!res.ok) throw new Error('Failed to create new Google Drive backup file.');
    const result = await res.json();
    return { status: 'created', fileId: result.id };
  }
}

/** Sync & Restore data JSON from Google Drive */
export async function syncFromDrive() {
  if (!accessToken) {
    await authenticateDrive();
  }

  const fileId = await findBackupFileId();
  if (!fileId) {
    throw new Error('No existing backup file found on your Google Drive.');
  }

  const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  });

  if (!res.ok) throw new Error('Failed to download backup file from Google Drive.');
  const data = await res.json();
  return data;
}

/** Search for backup file ID on Google Drive */
async function findBackupFileId() {
  const query = encodeURIComponent(`name = '${BACKUP_FILENAME}' and trashed = false`);
  const res = await fetch(`https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name,modifiedTime)`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  });
  if (!res.ok) throw new Error('Failed to search Google Drive files.');
  const body = await res.json();
  if (body.files && body.files.length > 0) {
    return body.files[0].id;
  }
  return null;
}
