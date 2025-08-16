import soundUrl from 'url:~src/assets/notify.mp3';
import { logger } from './logger';

export const playNotificationSound = () => {
  try {
    const audio = new Audio(soundUrl);
    audio.play();
  } catch (error) {
    logger.error('Error playing notification sound', error);
  }
};
