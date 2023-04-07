import {useCallback, useRef} from 'react'

function App() {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const handleStart = useCallback(async () => {
    try {
      if (!videoRef.current) {
        return;
      }
      videoRef.current.srcObject = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false,
      })
      videoRef.current.play()
    } catch (err) {
      console.error(err)
    }
  }, [])

  const handleStop = useCallback(() => {
    if (!videoRef.current || !videoRef.current?.srcObject) {
      return;
    }
    // @ts-ignore
    const tracks = videoRef.current.srcObject.getTracks();
    tracks.forEach((track:MediaStreamTrack) => track.stop())
    videoRef.current.srcObject = null
  }, [])

  return (
    <div>
      <div>
        <button onClick={handleStart}>Start</button>
        <button onClick={handleStop}>Stop</button>
      </div>
      <video ref={videoRef} />
    </div>
  )
}

export default App
