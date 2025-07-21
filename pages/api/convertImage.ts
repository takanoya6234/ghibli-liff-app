// /pages/api/convertImage.ts

import type { NextApiRequest, NextApiResponse } from 'next'
import { OpenAI } from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' })
  }

  const { prompt } = req.body

  if (!prompt || typeof prompt !== 'string') {
    return res.status(400).json({ error: 'プロンプトが無効です' })
  }

  try {
    const response = await openai.images.generate({
      model: 'dall-e-3', // DALL·E 3 を使用（または dall-e-2）
      prompt: prompt,
      n: 1,
      size: '1024x1024',
      response_format: 'url',
    })

    const imageUrl = response.data[0]?.url

    if (!imageUrl) {
      return res.status(500).json({ error: '画像生成に失敗しました' })
    }

    return res.status(200).json({ imageUrl })
  } catch (error) {
    console.error('Image generation error:', error)
    return res.status(500).json({ error: 'サーバーエラーが発生しました' })
  }
}
