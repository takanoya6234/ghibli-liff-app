import { useState } from 'react'

export default function Home() {
  const [description, setDescription] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null
    setFile(selectedFile)
    if (selectedFile) {
      setUploadedImage(URL.createObjectURL(selectedFile))
    }
  }

  const handleUploadAndGenerate = async () => {
    if (!file || !description) return

    setLoading(true)
    setError('')
    setImageUrl('')

    try {
      // ✅ 1. 画像ファイルをアップロード（/api/upload → public/uploads に保存）
      const formData = new FormData()
      formData.append('file', file)

      const uploadRes = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      const uploadData = await uploadRes.json()
      if (!uploadData.fileUrl) throw new Error('画像アップロードに失敗しました')

      // ✅ 2. ChatGPTでプロンプト生成
      const promptRes = await fetch('/api/generatePrompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userDescription: description }),
      })
      const promptData = await promptRes.json()
      const prompt = promptData.prompt
      if (!prompt) throw new Error('プロンプト生成に失敗しました')

      // ✅ 3. AIで画像生成
      const convertRes = await fetch('/api/convertImage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      })
      const convertData = await convertRes.json()
      if (!convertData.imageUrl) throw new Error('画像変換に失敗しました')

      // ✅ 4. 画像表示
      setImageUrl(convertData.imageUrl)
    } catch (err: any) {
      setError(err.message || 'エラーが発生しました')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>ジブリ風画像変換</h1>

      {/* アップロード */}
      <p>変換したい画像を選んでください</p>
      <input type="file" accept="image/*" onChange={handleFileChange} />
      {uploadedImage && (
        <div style={{ marginTop: '1rem' }}>
          <img src={uploadedImage} alt="アップロード画像" style={{ maxWidth: '100%', maxHeight: '300px' }} />
        </div>
      )}

      {/* テキスト入力 */}
      <p style={{ marginTop: '1rem' }}>画像の説明文を入力してください</p>
      <input
        type="text"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="例：浴衣を着た女の子が縁側でラムネを飲んでいる"
        style={{ width: '100%', padding: '10px', fontSize: '16px', marginBottom: '16px' }}
      />

      <button
        disabled={loading || !file || !description}
        style={{
          padding: '10px 24px',
          fontSize: '16px',
          backgroundColor: '#0070f3',
          color: '#fff',
          border: 'none',
          borderRadius: '6px',
          cursor: loading ? 'not-allowed' : 'pointer',
        }}
        onClick={handleUploadAndGenerate}
      >
        {loading ? '変換中...' : 'ジブリ風に変換する'}
      </button>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {imageUrl && (
        <div style={{ marginTop: '2rem' }}>
          <img src={imageUrl} alt="ジブリ風画像" style={{ width: '100%', maxWidth: '512px', borderRadius: '12px' }} />
          <br />
          <a href={imageUrl} download="ghibli-image.png" style={{ color: '#0070f3' }}>
            画像を保存する
          </a>
        </div>
      )}
    </div>
  )
}
