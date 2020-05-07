declare module 'probe-image-size' {
  import { Stream } from 'stream'
  type ProbeImageSize = (input: Stream) => Promise<{ width: number; height: number }>
  const probeImageSize: ProbeImageSize
  export default probeImageSize
}
