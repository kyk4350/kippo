import { formatDistanceToNow, differenceInSeconds } from 'date-fns';
import { ko } from 'date-fns/locale';

export const formatRelativeTime = (date: string): string => {
  const now = new Date();
  const targetDate = new Date(date);
  const secondsDiff = differenceInSeconds(now, targetDate);

  // 1분(60초) 미만이면 "방금 전"
  if (secondsDiff < 60) {
    return '방금 전';
  }

  const distance = formatDistanceToNow(targetDate, {
    addSuffix: true,
    locale: ko,
  });

  // "약 2시간 전" -> "2시간 전"
  return distance.replace('약 ', '');
};
