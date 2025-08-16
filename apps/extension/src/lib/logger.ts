export class Logger {
  readonly module?: string;

  constructor(module?: string) {
    this.module = module;
  }

  pipe:
    | ((
        type: LogType,
        text: unknown[],
        extraCSS: string[],
        objects?: object[]
      ) => void)
    | null = null;

  private getModulePrefix() {
    return {
      text: `%c[LGamilaLive]${this.module ? `[${this.module}]` : ''}`,
      css: 'color:#6441a5;',
    };
  }

  private print(
    type: LogType,
    text: unknown[],
    extraCSS: string[],
    objects?: object[]
  ) {
    if (this.pipe) {
      this.pipe(type, text, extraCSS, objects);
      return;
    }

    const prefix = this.getModulePrefix();
    // biome-ignore lint/suspicious/noConsole: it's fine
    console[type](
      `${prefix.text} ${text.join(' ')}`,
      prefix.css,
      ...extraCSS,
      ...(objects ?? [])
    );
  }

  debug(...text: unknown[]) {
    return this.print(
      'debug',
      ['%c[DEBUG]%c', ...text],
      ['color:#32c8e6;', 'color:grey']
    );
  }

  debugWithObjects(text: unknown[], objects: object[]) {
    return this.print(
      'debug',
      ['%c[DEBUG]%c', ...text],
      ['color:#32c8e6;', 'color:grey'],
      objects
    );
  }

  info(...text: unknown[]) {
    return this.print(
      'info',
      ['%c[INFO]%c', ...text],
      ['color:#3cf051;', 'color:reset;']
    );
  }

  warn(...text: unknown[]) {
    return this.print(
      'warn',
      ['%c[WARN]%c', ...text],
      ['color:#fac837;', 'color:reset;']
    );
  }

  error(...text: unknown[]) {
    return this.print(
      'error',
      ['%c[ERROR]%c', ...text],
      ['color:#e63232;', 'color:reset;']
    );
  }
}

export const logger = new Logger();
export type LogType = 'error' | 'warn' | 'debug' | 'info';
