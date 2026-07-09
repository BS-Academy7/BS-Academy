/**
 * B&S Academy - Google Drive Bridge v5 (Phase 3 & 4)
 * 
 * Features:
 * - Upload files
 * - Create folders
 * - List folder contents
 * - Rename files/folders
 * - Archive files/folders
 * 
 * INSTRUCTIONS:
 * 1. Copy all code.
 * 2. Go to script.google.com and create a new project.
 * 3. Paste code into Code.gs.
 * 4. Click Deploy > New deployment.
 * 5. Type: Web app, Execute as: Me, Who has access: Anyone.
 * 6. Copy the Web App URL and paste it into `js/supabase-config.js` (GOOGLE_DRIVE_UPLOAD_ENDPOINT).
 */

const CONFIG = {
  ROOT_FOLDER_ID: '1hOsiO5fGzPQKC6cchDIp9hwT2LYNNjXR',
  ROOT_FOLDER_NAME: 'B&S Academy Drive',
  ACCESS_TOKEN: 'bs-academy-drive-bridge-2026',
  ALLOWED_ORIGINS: '*' // Change to your GitHub Pages URL for security if desired
};

function doPost(e) {
  try {
    const postData = JSON.parse(e.postData.contents);
    
    if (CONFIG.ACCESS_TOKEN && postData.token !== CONFIG.ACCESS_TOKEN) {
      return respondError('Invalid token');
    }

    const action = postData.action || 'upload'; // Default to upload for backwards compatibility

    switch (action) {
      case 'upload':
        return handleUpload(postData);
      case 'create_folder':
        return handleCreateFolder(postData);
      case 'list_folder':
        return handleListFolder(postData);
      case 'rename_item':
        return handleRenameItem(postData);
      case 'archive_item':
        return handleArchiveItem(postData);
      default:
        return respondError('Unknown action: ' + action);
    }

  } catch (error) {
    return respondError(error.toString());
  }
}

function handleUpload(postData) {
  if (!postData.base64 || !postData.fileName) {
    return respondError('Missing base64 data or fileName');
  }

  const metadata = postData.metadata || {};
  const folderPath = buildUploadFolderPath(postData.folder, metadata, postData);
  const folder = getOrCreateFolderPath(folderPath);
  
  const blob = Utilities.newBlob(Utilities.base64Decode(postData.base64), postData.mimeType, postData.fileName);
  const file = folder.createFile(blob);

  return respondSuccess({
    fileId: file.getId(),
    folderId: folder.getId(),
    folderPath: folderPath,
    url: file.getUrl(),
    fileName: file.getName(),
    mimeType: file.getMimeType(),
    size: file.getSize()
  });
}

function handleCreateFolder(postData) {
  if (!postData.folderPath) {
    return respondError('Missing folderPath');
  }
  
  const folder = getOrCreateFolderPath(postData.folderPath);
  return respondSuccess({
    folderId: folder.getId(),
    folderPath: postData.folderPath,
    url: folder.getUrl(),
    name: folder.getName()
  });
}

function handleListFolder(postData) {
  // If folderId is provided, use it directly. Otherwise use folderPath.
  let folder;
  if (postData.folderId) {
    try {
      folder = DriveApp.getFolderById(postData.folderId);
    } catch(err) {
      return respondError('Folder not found by ID');
    }
  } else {
    const folderName = postData.folderPath || '';
    folder = getOrCreateFolderPath(folderName);
  }

  const result = {
    folderId: folder.getId(),
    folderName: folder.getName(),
    url: folder.getUrl(),
    files: [],
    folders: []
  };

  const folders = folder.getFolders();
  while (folders.hasNext()) {
    const f = folders.next();
    result.folders.push({
      id: f.getId(),
      name: f.getName(),
      url: f.getUrl(),
      isArchived: f.getName().includes('[ARCHIVED]')
    });
  }

  const files = folder.getFiles();
  while (files.hasNext()) {
    const file = files.next();
    result.files.push({
      id: file.getId(),
      name: file.getName(),
      mimeType: file.getMimeType(),
      size: file.getSize(),
      url: file.getUrl(),
      isArchived: file.getName().includes('[ARCHIVED]')
    });
  }

  return respondSuccess(result);
}

function handleRenameItem(postData) {
  if (!postData.itemId || !postData.newName) {
    return respondError('Missing itemId or newName');
  }
  
  let item = null;
  const isFolder = postData.isFolder === true;

  try {
    if (isFolder) {
      item = DriveApp.getFolderById(postData.itemId);
    } else {
      item = DriveApp.getFileById(postData.itemId);
    }
    item.setName(postData.newName);
    
    return respondSuccess({
      id: item.getId(),
      newName: item.getName(),
      url: item.getUrl()
    });
  } catch (error) {
    return respondError('Item not found or access denied: ' + error.toString());
  }
}

function handleArchiveItem(postData) {
  if (!postData.itemId) {
    return respondError('Missing itemId');
  }
  
  let item = null;
  const isFolder = postData.isFolder === true;

  try {
    if (isFolder) {
      item = DriveApp.getFolderById(postData.itemId);
    } else {
      item = DriveApp.getFileById(postData.itemId);
    }
    
    const currentName = item.getName();
    if (!currentName.includes('[ARCHIVED]')) {
      item.setName('[ARCHIVED] ' + currentName);
    }
    
    return respondSuccess({
      id: item.getId(),
      archivedName: item.getName()
    });
  } catch (error) {
    return respondError('Item not found or access denied: ' + error.toString());
  }
}

/* --- Helpers --- */

// Creates or gets nested folders based on a path like "01_People/02_Students/John"
function getOrCreateFolderPath(folderPathString) {
  let currentFolder = getOrCreateRoot();
  if (!folderPathString) return currentFolder;
  
  const parts = folderPathString.split('/').filter(p => p.trim() !== '');
  
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    const folders = currentFolder.getFoldersByName(part);
    if (folders.hasNext()) {
      currentFolder = folders.next();
    } else {
      currentFolder = currentFolder.createFolder(part);
    }
  }
  return currentFolder;
}

function getOrCreateRoot() {
  if (CONFIG.ROOT_FOLDER_ID) {
    return DriveApp.getFolderById(CONFIG.ROOT_FOLDER_ID);
  }

  const folders = DriveApp.getFoldersByName(CONFIG.ROOT_FOLDER_NAME);
  if (folders.hasNext()) {
    return folders.next();
  } else {
    return DriveApp.createFolder(CONFIG.ROOT_FOLDER_NAME);
  }
}

function buildUploadFolderPath(folderKey, metadata, postData) {
  const explicitPath = postData.folderPath || metadata.folderPath;
  if (Array.isArray(explicitPath) && explicitPath.length) {
    return explicitPath.map(safeSegment).join('/');
  }
  if (typeof explicitPath === 'string' && explicitPath.trim()) {
    return explicitPath.split('/').map(safeSegment).join('/');
  }

  if (folderKey === 'ondemand-attachments') {
    return [
      '03_Operations & Requests',
      '01_On-Demand Requests',
      String(new Date().getFullYear()),
      safeSegment(metadata.subjectName || 'General Subject'),
      buildStudentFolderName(metadata),
      buildRequestFolderName(metadata)
    ].join('/');
  }

  if (folderKey === 'project-submissions') {
    return [
      '03_Operations & Requests',
      '02_Project Submissions',
      safeSegment(metadata.sectorKey || metadata.sectorName || 'General Sector'),
      buildStudentFolderName(metadata)
    ].join('/');
  }

  if (folderKey === 'program-banners') {
    return [
      '02_Programs',
      safeSegment(metadata.sectorKey || metadata.sectorName || 'General Sector'),
      safeSegment(metadata.programName || metadata.programId || 'General Program'),
      '00_Banners'
    ].join('/');
  }

  if (folderKey === 'program-materials') {
    return [
      '02_Programs',
      safeSegment(metadata.sectorKey || metadata.sectorName || 'General Sector'),
      safeSegment(metadata.programName || metadata.programId || 'General Program'),
      '01_Materials'
    ].join('/');
  }

  if (folderKey === 'instructor-files') {
    return [
      '01_People',
      '01_Instructors',
      buildPersonFolderName(metadata, 'unknown-instructor', 'Unnamed Instructor')
    ].join('/');
  }

  if (folderKey === 'student-files') {
    return [
      '01_People',
      '02_Students',
      buildStudentFolderName(metadata)
    ].join('/');
  }

  if (folderKey === 'site-content') {
    return [
      '04_Website & Media',
      '01_Site Content',
      safeSegment(metadata.contentKey || metadata.page || 'General Content')
    ].join('/');
  }

  return ['99_General Uploads', safeSegment(folderKey || 'General Uploads')].join('/');
}

function buildStudentFolderName(metadata) {
  const id = safeSegment(metadata.studentId || metadata.email || metadata.whatsapp || 'unknown-student');
  const name = safeSegment(metadata.studentName || 'Unnamed Student');
  return `${id} - ${name}`;
}

function buildPersonFolderName(metadata, fallbackId, fallbackName) {
  const id = safeSegment(metadata.personId || metadata.instructorId || metadata.email || fallbackId);
  const name = safeSegment(metadata.personName || metadata.instructorName || metadata.fullName || fallbackName);
  return `${id} - ${name}`;
}

function buildRequestFolderName(metadata) {
  const stamp = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd HH-mm');
  const title = safeSegment(metadata.topicTitle || metadata.requestTitle || 'Request');
  return `${stamp} - ${title}`;
}

function safeSegment(value) {
  const clean = String(value || 'Untitled').replace(/[\\/:*?"<>|#%{}~&]/g, '-').trim();
  return clean || 'Untitled';
}

function respondSuccess(data) {
  return ContentService.createTextOutput(JSON.stringify({
    ok: true,
    ...data
  }))
  .setMimeType(ContentService.MimeType.JSON);
}

function respondError(errorMessage) {
  return ContentService.createTextOutput(JSON.stringify({
    ok: false,
    error: errorMessage
  }))
  .setMimeType(ContentService.MimeType.JSON);
}

// Support for preflight requests (CORS)
function doOptions(e) {
  return ContentService.createTextOutput('{"ok":true}')
    .setMimeType(ContentService.MimeType.JSON);
}
