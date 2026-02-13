import { t } from '@i18n';

export const toSnapshotName = (role: string): string => {
  return `${t.meta.locale}-${role
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .toLowerCase()}`;
};
