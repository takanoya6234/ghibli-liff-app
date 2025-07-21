import { useState } from 'react'

export default function Home() {
  const [description, setDescription] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleGenerate = async () => {
    setLoading(true)
    setError('')
    setImageUrl('')

    try {
      // 🔸1. ChatGPTで英語プロンプトを生成
      const promptRes = await fetch('/api/generatePrompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userDescription: description }),
      })
      const promptData = await promptRes.json()
      const prompt = promptData.prompt
      if (!prompt) throw new Error('プロンプト生成に失敗しました')

      // 🔸2. OpenAI画像生成APIで画像を生成
      const imageRes = await fetch('/api/convertImage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      })
      const imageData = await imageRes.json()
      if (!imageData.imageUrl) throw new Error('画像生成に失敗しました')

      // 🔸3. 表示
      setImageUrl(imageData.imageUrl)
    } catch (err: any) {
      setError(err.message || 'エラーが発生しました')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>ジブリ風画像変換</h1>
      <p>写真の説明を入力してください（例：夏の田舎道を歩く少年）</p>

      <input
        type="text"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="例：浴衣を着た女の子が縁側でラムネを飲んでいる"
        style={{
          width: '100%',
          padding: '10px',
          fontSize: '16px',
          marginBottom: '16px',
          borderRadius: '6px',
          border: '1px solid #ccc',
        }}
      />

      <button
        onClick={handleGenerate}
        disabled={loading || !description}
        style={{
          padding: '10px 24px',
          fontSize: '16px',
          backgroundColor: '#0070f3',
          color: '#fff',
          border: 'none',
          borderRadius: '6px',
          cursor: loading ? 'not-allowed' : 'pointer',
        }}
      >
        {loading ? '生成中...' : 'ジブリ風画像を生成'}
      </button>

      {error && <p style={{ color: 'red', marginTop: '1rem' }}>{error}</p>}

      {imageUrl && (
        <div style={{ marginTop: '2rem' }}>
          <img
            src={imageUrl}
            alt="ジブリ風画像"
            style={{ width: '100%', maxWidth: '512px', borderRadius: '12px' }}
          />
          <br />
          <a
            href={imageUrl}
            download="ghibli-image.png"
            style={{ display: 'inline-block', marginTop: '1rem', color: '#0070f3' }}
          >
            画像を保存する
          </a>
        </div>
      )}
    </div>
  )
}
