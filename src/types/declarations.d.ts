declare module 'gifenc' {
  export function GIFEncoder(options?: any): any;
  export function quantize(rgba: Uint8ClampedArray | Uint8Array, maxColors?: number, options?: any): number[][];
  export function applyPalette(rgba: Uint8ClampedArray | Uint8Array, palette: number[][], format?: string): Uint8Array;
  const defaultExport: any;
  export default defaultExport;
}

declare module 'better-sqlite3' {
  namespace Database {
    export interface Database {
      exec(sql: string): this;
      prepare(sql: string): Statement;
      transaction<F extends (...args: any[]) => any>(fn: F): F;
      close(): this;
    }
    export interface Statement {
      run(...bindParameters: any[]): { changes: number; lastInsertRowid: number | bigint };
      get(...bindParameters: any[]): any;
      all(...bindParameters: any[]): any[];
    }
  }
  interface DatabaseConstructor {
    new (filename: string, options?: any): Database.Database;
    (filename: string, options?: any): Database.Database;
  }
  const Database: DatabaseConstructor;
  export default Database;
}
