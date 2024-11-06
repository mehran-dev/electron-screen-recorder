// ScreenRecorder.js (React component)
import React, { useEffect, useRef, useState } from 'react'

function ScreenRecorder() {
  const [sources, setSources] = useState([])
  const [isRecording, setIsRecording] = useState(false)

  const getScreenSources = async () => {
    const sources = await window.api.screenRecorder.getSources()
    setSources(sources)
  }

  useEffect(() => {
    return () => {
      mediaRecorder.current = null
    }
  }, [])

  const mediaRecorder = useRef(null)
  async function startRecording(sourceId) {
    try {
      setIsRecording(true)
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {
          mandatory: {
            chromeMediaSource: 'desktop',
            chromeMediaSourceId: sourceId
          }
        }
      })

      mediaRecorder.current = new MediaRecorder(stream)
      console.log('mediaRecorder.current', mediaRecorder.current)

      const chunks = []

      mediaRecorder.current.ondataavailable = (event) => chunks.push(event.data)
      mediaRecorder.current.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'recording.webm'
        a.click()
      }

      mediaRecorder.current.start()
    } catch (error) {
      setIsRecording(false)
      console.error('Error accessing screen stream:', error)
    }
  }
  const stopRecording = () => {
    console.log('mediaRecorder.current', mediaRecorder.current)

    setIsRecording(false)
    if (!mediaRecorder.current) {
      return
    }
    // Stop recording after a set time or on command

    mediaRecorder.current.stop()
  }

  return (
    <div>
      <button onClick={getScreenSources}>Get Screen Sources</button>
      {sources.map((source) => (
        <div key={source.id}>
          <p>{source.name}</p>
          <img src={source.thumbnail.toDataURL()} alt={source.name} />
          <button onClick={() => startRecording(source.id)}>Record this screen</button>
        </div>
      ))}
      {isRecording && <button onClick={stopRecording}>Stop Recording</button>}
    </div>
  )
}

export default ScreenRecorder
