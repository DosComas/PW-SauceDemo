import { t } from '@data';

export const toSnapshotName = (role: string): string => {
  return `${t.meta.locale}-${role
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .toLowerCase()}`;
};
