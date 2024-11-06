import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Custom APIs for renderer
const api = {
  screenRecorder: {
    getSources: async () => {
      try {
        const sources = await ipcRenderer.invoke('get-sources')
        console.log('Sources:', sources) // Log to verify data
        return sources
      } catch (error) {
        console.error('Error in preload getSources:', error)
        return []
      }
    },

    startRecording: (sourceId) => {
      // ipcRenderer.send('start-recording', sourceId)
      ipcRenderer.send('start-recording', sourceId)
    },
    stopRecording: () => {
      ipcRenderer.send('stop-recording')
    }
  }
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
