import {useCallback, useRef} from 'react'
import {FaceDetection} from "@mediapipe/face_detection";
import {drawRectangle, drawLandmarks} from "@mediapipe/drawing_utils";

function App() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const videoFrameId = useRef<number|undefined>(undefined);

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

      const faceDetection = new FaceDetection({locateFile: (file) => {
          return `https://cdn.jsdelivr.net/npm/@mediapipe/face_detection/${file}`;
        }
      });
      faceDetection.setOptions({
        model: 'short',
        minDetectionConfidence: 0.5
      });
      faceDetection.onResults((results) => {
        if (!canvasRef.current) {
          return
        }
        const ctx = canvasRef.current.getContext("2d")
        if (!ctx) {
          return;
        }
        ctx.save();
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)
        ctx.drawImage(results.image, 0, 0, canvasRef.current.width, canvasRef.current.height)
        if (results.detections.length > 0) {
          drawRectangle(
            ctx, results.detections[0].boundingBox,
            {color: 'blue', lineWidth: 4, fillColor: '#00000000'});
          drawLandmarks(ctx, results.detections[0].landmarks, {
            color: 'red',
            radius: 5,
          });
        }
        ctx.restore();
      })
      const handleVideoFrame = async () => {
        try {
          if (!videoRef.current) {
            return
          }
          await faceDetection.send({image: videoRef.current})
        } catch (err) {
          console.error(err)
        }
        videoFrameId.current = videoRef.current?.requestVideoFrameCallback(handleVideoFrame)
      }
      videoFrameId.current = videoRef.current?.requestVideoFrameCallback(handleVideoFrame)
    } catch (err) {
      console.error(err)
    }
  }, [])

  const handleStop = useCallback(() => {
    if (!videoRef.current || !videoRef.current?.srcObject) {
      return;
    }
    if (videoFrameId.current) {
      videoRef.current?.cancelVideoFrameCallback(videoFrameId.current)
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
      <canvas ref={canvasRef} width="1280px" height="720px" />
    </div>
  )
}

export default App
