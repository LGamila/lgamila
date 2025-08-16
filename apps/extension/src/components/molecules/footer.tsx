export const Footer = () => {
  return (
    <div className="w-full flex flex-col justify-start text-xs text-white/30">
      <p>
        © <b>2025</b> LGamila Live, a project by{' '}
        <a
          className="text-accent"
          href="https://www.twitch.tv/stormix_dev/"
          rel="noopener noreferrer"
          target="_blank"
        >
          Stormix
        </a>{' '}
        and{' '}
        <a
          className="text-accent"
          href="https://x.com/ekb9816"
          rel="noopener noreferrer"
          target="_blank"
        >
          EKB9816
        </a>
        .{' '}
      </p>

      <p className="italic">
        Original project by{' '}
        <a
          className="text-accent"
          href="https://www.twitch.tv/zikoos_jam"
          rel="noopener noreferrer"
          target="_blank"
        >
          Zikoos Jam
        </a>
      </p>
    </div>
  );
};
