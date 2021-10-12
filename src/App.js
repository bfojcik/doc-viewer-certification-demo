import {useEffect, useState, useRef} from 'react'

import WebViewer from '@pdftron/webviewer'
import axios from 'axios'


function App() {
  const viewer = useRef(null)

  const [viewerInstance, setViewerInstance] = useState()
  const [fileName, setFileName] = useState('')

  useEffect(() => {
    initializeWebViewer()
  }, [])

  async function initializeWebViewer() {
    const instance = await WebViewer(
      {
        path: `${window.location.origin}/webviewer/lib/`,
        fullAPI: true
      },
      viewer.current
    )
    instance.disableFeatures([
      instance.Feature.Ribbons,
      instance.Feature.Annotations,
      instance.Feature.FilePicker,
      instance.Feature.NotesPanel
    ])

    loadCertificates(instance)

    setViewerInstance(instance)

    instance.docViewer.addEventListener(
      'documentLoaded',
      () => {
        instance.openElements(['signaturePanel'])
      }
    )
  }

  async function loadCertificates(instance) {
    // "BartNowak.cer" cert
    const certResponse = await axios.get(
      `${process.env.REACT_APP_CERTIFICATE_STORE_HOSTNAME}/${process.env.REACT_APP_CERTIFICATE_NAME_ONE}`,
      {
        responseType: 'arraybuffer',
        headers: { Authorization: `Basic ${process.env.REACT_APP_CERTIFICATE_STORE_BASIC_AUTH}` }
      }
    )
    const certType = certResponse.headers['content-type']
    const certBufferBlobfile = new Blob([certResponse.data], { type: certType, encoding: 'UTF-8' })
    const certFile = new File(
      [certBufferBlobfile],
      process.env.REACT_APP_CERTIFICATE_NAME_ONE
    )
    await instance.VerificationOptions.addTrustedCertificates([certFile])

    // "GlobalSign CA for AATL - SHA384 - G4.cer" cert
    const certResponse2 = await axios.get(
      `${process.env.REACT_APP_CERTIFICATE_STORE_HOSTNAME}/${process.env.REACT_APP_CERTIFICATE_NAME_TWO}`,
      {
        responseType: 'arraybuffer',
        headers: { Authorization: `Basic ${process.env.REACT_APP_CERTIFICATE_STORE_BASIC_AUTH}` }
      }
    )
    const certType2 = certResponse.headers['content-type']
    const certBufferBlobfile2 = new Blob([certResponse2.data], { type: certType2, encoding: 'UTF-8' })
    const certFile2 = new File(
      [certBufferBlobfile2],
      process.env.REACT_APP_CERTIFICATE_NAME_TWO
    )
    await instance.VerificationOptions.addTrustedCertificates([certFile2])
  }

  async function handleDocLoad(instance, filename) {
    const fileResponse = await axios.get(
      `${process.env.REACT_APP_CERTIFICATE_STORE_HOSTNAME}/${filename}`,
      {
        responseType: 'arraybuffer',
        headers: { Authorization: `Basic ${process.env.REACT_APP_CERTIFICATE_STORE_BASIC_AUTH}` }
      }
    )
    const fileType = fileResponse.headers['content-type']
    const fileBlob = new Blob([fileResponse.data], { type: fileType, encoding: 'UTF-8' })
    const fileFile = new File(
      [fileBlob],
      filename
    )

    await instance.loadDocument(fileFile)
  }

  const handleFileChange = e => {
    console.log('change event', e.target.value)
    setFileName(e.target.value)
  }

  const handleClick = _ => {
    console.log('button event', fileName)
    handleDocLoad(viewerInstance, fileName)
  }

  return (
    <div className="App">
      <div><strong>Demo flow:</strong></div>
      <div>1. pick a file below</div>
      <div>2. load it into viewer via button</div>
      <div>3. all the certificates are fetched from file-server `http://164.90.235.200:3010`</div>
      <div>4. file with no certificate and self-signed are displayed correctly - file using CA public certificate is not</div>

      <div style={{ marginTop: '20px' }}><strong>Pick file</strong></div>
      <select value={fileName} onChange={handleFileChange} style={{ marginBottom: '20px', marginRight: '20px' }}>
          <option value=""><span>None</span></option>
          <option value={process.env.REACT_APP_FILE_NAME_ONE}>{process.env.REACT_APP_FILE_NAME_ONE}</option>
          <option value={process.env.REACT_APP_FILE_NAME_TWO}>{process.env.REACT_APP_FILE_NAME_TWO}</option>
          <option value={process.env.REACT_APP_FILE_NAME_THREE}>{process.env.REACT_APP_FILE_NAME_THREE}</option>
      </select>
      <span>
        <input onClick={handleClick} type="button" value="Pick file" disabled={!fileName} style={{ marginRight: '20px' }}/>
        <span>Chosen file: {fileName}</span>
      </span>

      <div><strong>Available certificates mapping:</strong></div>
      <ul>
          <li><strong>{process.env.REACT_APP_CERTIFICATE_NAME_ONE}</strong> <em>({process.env.REACT_APP_FILE_NAME_ONE})</em> - <span style={{color: 'blue'}}>Working</span></li>
          <li><strong>{process.env.REACT_APP_CERTIFICATE_NAME_TWO}</strong> - <em>({process.env.REACT_APP_FILE_NAME_TWO})</em> - <span style={{color: 'blue'}}>Not Working</span></li>
          <li><strong>No cert</strong> - <em>({process.env.REACT_APP_FILE_NAME_THREE})</em> - <span style={{color: 'blue'}}>Working</span></li>
      </ul>

      <hr/>

      <div className="webviewer" ref={viewer} style={{height: "100vh"}}></div>
    </div>
  )
}

export default App
