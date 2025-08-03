import { cn } from '@lgamila/design-system/lib/utils';
import PixelHeart from '../icons/pixel-heart';

export default function Footer({ className }: { className?: string }) {
  return (
    <footer
      className={cn(
        'flex flex-col items-center justify-center gap-2',
        className
      )}
    >
      <iframe
        frameBorder="0"
        height="30"
        scrolling="no"
        src="https://status.lgamila.ma/badge?theme=dark"
        style={{ colorScheme: 'normal' }}
        width="180"
      />
      <div
        className={cn(
          'flex flex-row items-center justify-center gap-2 uppercase py-8',
          className
        )}
      >
        <span>by the community</span>

        <PixelHeart />

        <span>for the community</span>
      </div>
    </footer>
  );
}