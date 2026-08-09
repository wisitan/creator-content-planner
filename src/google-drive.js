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
/** Backup data JSON directly from local storage to Google Drive (Local -> Drive 100%) */
export async function backupToDrive(dataObj, store = null) {
  if (!accessToken) {
    await authenticateDrive();
  }

  const fileId = await findBackupFileId();

  // Ensure metadata exists
  const totalRecs = (dataObj.products?.length || 0) + 
                    (dataObj.content?.length || 0) + 
                    (dataObj.channelTracker?.length || 0) + 
                    (dataObj.sponsors?.length || 0);

  dataObj.meta = {
    lastUpdated: new Date().toISOString(),
    totalRecords: totalRecs,
    deviceName: /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent) ? 'Mobile Device' : 'PC / Mac',
  };

  const jsonStr = JSON.stringify(dataObj, null, 2);

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

/** Smart Two-Way Sync (Merge Local & Cloud Data seamlessly without overwriting new items) */
export async function smartSyncWithDrive(localData, store) {
  if (!accessToken) {
    await authenticateDrive();
  }

  const fileId = await findBackupFileId();
  let driveData = null;

  if (fileId) {
    try {
      const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
        headers: { 'Authorization': `Bearer ${accessToken}` },
      });
      if (res.ok) {
        driveData = await res.json();
      }
    } catch (err) {
      console.warn('[Smart Sync] Could not fetch existing drive file:', err);
    }
  }

  // If no Drive file exists yet, perform initial backup upload
  if (!driveData) {
    await backupToDrive(localData, store);
    return {
      success: true,
      mode: 'initial_upload',
      message: 'Created initial backup on Google Drive!'
    };
  }

  // Perform Item-by-Item Record-Level Smart Merge
  const mergedData = mergeTwoWayData(localData, driveData);

  // Update local store with merged dataset
  store.importData(mergedData);

  // Upload merged dataset back to Google Drive
  await backupToDrive(mergedData, store);

  return {
    success: true,
    mode: 'merged',
    totalRecords: (mergedData.products?.length || 0) + (mergedData.content?.length || 0),
    message: 'Smart Two-Way Sync completed successfully!'
  };
}

/** Record-Level Smart Merge Algorithm (Directional Tombstone Sync) */
function mergeTwoWayData(local, drive) {
  // Build separate tombstone maps for each direction
  const localDeletedMap = new Map();
  (local.deletedItems || []).forEach(d => {
    if (d && d.id) {
      const id = String(d.id);
      const existing = localDeletedMap.get(id);
      if (!existing || new Date(d.deletedAt) > new Date(existing.deletedAt)) {
        localDeletedMap.set(id, d);
      }
    }
  });

  const driveDeletedMap = new Map();
  (drive.deletedItems || []).forEach(d => {
    if (d && d.id) {
      const id = String(d.id);
      const existing = driveDeletedMap.get(id);
      if (!existing || new Date(d.deletedAt) > new Date(existing.deletedAt)) {
        driveDeletedMap.set(id, d);
      }
    }
  });

  // Safe timestamp: items without updatedAt use a fallback so old tombstones can't nuke them
  const getTs = (item) => {
    if (item.updatedAt) return new Date(item.updatedAt).getTime();
    if (item.createdAt) return new Date(item.createdAt).getTime();
    return 0;
  };

  const mergeCollection = (localList = [], driveList = []) => {
    const itemMap = new Map();

    // Step 1: Process local items
    // Apply DRIVE tombstones to local items (items deleted from another device)
    (localList || []).forEach(item => {
      if (!item || !item.id) return;
      const id = String(item.id);

      const driveTombstone = driveDeletedMap.get(id);
      if (driveTombstone) {
        const deleteTs = new Date(driveTombstone.deletedAt).getTime();
        const itemTs = getTs(item);
        // Only delete if item has a timestamp AND tombstone is newer
        // Items with no timestamp (legacy) are KEPT safe — user must delete manually
        if (itemTs > 0 && deleteTs > itemTs) {
          return; // Skip: this item was deleted from another device after last edit
        }
        if (itemTs === 0) {
          // Legacy item with no timestamp — keep it safe, don't auto-delete
          // It will get an updatedAt on next edit
        }
      }
      itemMap.set(id, item);
    });

    // Step 2: Process drive items
    // Apply LOCAL tombstones to drive items (items deleted from THIS device)
    (driveList || []).forEach(item => {
      if (!item || !item.id) return;
      const id = String(item.id);

      const localTombstone = localDeletedMap.get(id);
      if (localTombstone) {
        const deleteTs = new Date(localTombstone.deletedAt).getTime();
        const itemTs = getTs(item);
        // Don't bring back items that were deleted locally
        // Unless the drive item was updated AFTER the local deletion
        if (itemTs === 0 || deleteTs >= itemTs) {
          return; // Skip: this item was deleted locally
        }
      }

      if (!itemMap.has(id)) {
        // New item from drive that doesn't exist locally — add it
        itemMap.set(id, item);
      } else {
        // Item exists both locally and on drive — keep the newer version
        const localItem = itemMap.get(id);
        const localTs = getTs(localItem);
        const driveTs = getTs(item);
        if (driveTs > localTs) {
          itemMap.set(id, item);
        }
      }
    });

    return Array.from(itemMap.values());
  };

  const mergedProducts = mergeCollection(local.products, drive.products);
  const mergedContent = mergeCollection(local.content, drive.content);
  const mergedChannels = mergeCollection(local.channelTracker, drive.channelTracker);
  const mergedSponsors = mergeCollection(local.sponsors, drive.sponsors);

  // Merge Brand
  const localBrandTs = local.brand?.updatedAt ? new Date(local.brand.updatedAt).getTime() : 0;
  const driveBrandTs = drive.brand?.updatedAt ? new Date(drive.brand.updatedAt).getTime() : 0;
  const mergedBrand = localBrandTs >= driveBrandTs ? { ...(drive.brand || {}), ...(local.brand || {}) } : { ...(local.brand || {}), ...(drive.brand || {}) };

  // Merge Settings
  const mergedSettings = { ...(drive.settings || {}), ...(local.settings || {}) };

  // Combine tombstones from both sides (union)
  const allDeletedMap = new Map();
  [...(local.deletedItems || []), ...(drive.deletedItems || [])].forEach(d => {
    if (d && d.id) {
      const id = String(d.id);
      const existing = allDeletedMap.get(id);
      if (!existing || new Date(d.deletedAt) > new Date(existing.deletedAt)) {
        allDeletedMap.set(id, d);
      }
    }
  });

  return {
    settings: mergedSettings,
    products: mergedProducts,
    content: mergedContent,
    channelTracker: mergedChannels,
    sponsors: mergedSponsors,
    deletedItems: Array.from(allDeletedMap.values()),
    brand: mergedBrand,
    meta: {
      lastUpdated: new Date().toISOString(),
      syncMode: 'Smart-Two-Way-v3'
    }
  };
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
