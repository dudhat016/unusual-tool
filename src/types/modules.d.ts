declare module 'utif' {
  const UTIF: {
    decode: (buffer: ArrayBuffer) => any[];
    decodeImage: (buffer: ArrayBuffer, ifd: any) => void;
    toRGBA8: (ifd: any) => Uint8Array;
    encodeImage: (rgba: Uint8ClampedArray | Uint8Array, width: number, height: number) => ArrayBuffer;
  };
  export default UTIF;
}

declare module 'heic2any' {
  interface Heic2AnyOptions {
    blob: Blob | File;
    toType?: string;
    quality?: number;
    multiple?: boolean;
  }
  function heic2any(options: Heic2AnyOptions): Promise<Blob | Blob[]>;
  export default heic2any;
}
