declare const scriptArgs: string[];

declare const console: {
  log(...data: unknown[]): void;
  error(...data: unknown[]): void;
};

declare module 'qjs:std' {
  export const SEEK_SET: number;
  export const SEEK_END: number;

  export function loadFile(filename: string): string;
  export function writeFile(filename: string, data: string | ArrayBuffer | Uint8Array): void;

  export interface Pipe {
    readAsArrayBuffer(): ArrayBuffer;
    close(): number;
  }

  export function popen(command: string, mode: string): Pipe;
}

declare module 'qjs:os' {
  export const platform: string;
  export const O_RDONLY: number;

  export function open(filename: string, flags: number): number;
  export function close(fd: number): void;
  export function seek(fd: number, offset: number, whence: number): number;
  export function read(fd: number, buffer: ArrayBuffer, offset: number, length: number): number;
  export function remove(filename: string): void;
}
