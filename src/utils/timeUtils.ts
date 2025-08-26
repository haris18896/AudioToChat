import moment from 'moment';

export const formatTime = (milliseconds: number): string => {
  return moment.utc(milliseconds).format('mm:ss');
};

export const formatTimeWithMilliseconds = (milliseconds: number): string => {
  const formatted = moment.utc(milliseconds).format('mm:ss.SSS');
  return formatted.slice(0, -1);
};

export const calculateProgress = (current: number, total: number): number => {
  if (total === 0) return 0;
  return Math.min(Math.max(current / total, 0), 1);
};
