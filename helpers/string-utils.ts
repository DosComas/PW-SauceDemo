export const toSnapshotName = (role: string): string => {
  return role
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .toLowerCase();
};
