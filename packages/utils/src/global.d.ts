declare module 'node-stream-zip' {
  export default class StreamZip {
    public constructor(options: { file: string; storeEntries: boolean })

    public on(event: 'ready', handler: () => void): void

    public on(event: 'error', handler: (error: string) => void): void

    public entryDataSync(name: string): string

    public stream(ref: string, handler: (error: string, stream: NodeJS.ReadStream) => void): void

    public close(): void
  }
}

declare module 'probe-image-size' {
  type ProbeImageSize = (input: NodeJS.ReadStream) => Promise<{ width: number; height: number }>
  const probeImageSize: ProbeImageSize
  export default probeImageSize
}

declare module 'json-ptr' {
  type Pojo = string | number | boolean | null | Pojo[] | undefined | { [property: string]: Pojo }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export function get(data: any, pointer: string): Pojo | undefined
}
