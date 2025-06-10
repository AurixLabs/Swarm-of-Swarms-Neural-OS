
// Around line 392, fix the numeric operations
export const calculateStorageQuota = (userData: any) => {
  const storageUsed = typeof userData.storageUsed === 'number' ? userData.storageUsed : 0;
  
  if (storageUsed > 1000000) {
    // Convert to MB for easier reading
    const usedMB = Math.round((storageUsed / 1024 / 1024) * 100) / 100;
    const totalMB = Math.round((userData.storageQuota / 1024 / 1024) * 100) / 100;
    return `${usedMB} MB of ${totalMB} MB used`;
  }
  
  return `${storageUsed} bytes used`;
};
