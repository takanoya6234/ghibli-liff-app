import type { NextApiRequest, NextApiResponse } from 'next'
import { OpenAI } from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export const config = {
  api: {
    bodyParser: true,
  },
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' })
  }

  const { userDescription } = req.body

  if (!userDescription || typeof userDescription !== 'string') {
    return res.status(400).json({ error: '説明文が不正です' })
  }

  // 📌 ジブリ風アニメセル画の保存指示セット（英語で追加）
  const ghibliStyleInstructions = `
Please render the image in the style of a Studio Ghibli anime cel.
- Do not change the composition of the original photo.
- Do not blur the background; preserve the atmosphere and clarity.
- Use vivid and nostalgic color tones inspired by "Whisper of the Heart" and "From Up on Poppy Hill".
- Add strong contrast between light and shadow, with soft yellow-tinted highlights.
- Deep, calm tones for shadows to give depth.
- Clear and sharp color boundaries like cel-shading.
- The overall touch should faithfully reflect Studio Ghibli-style animation (e.g., "The Wind Rises", "Ocean Waves").
`

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content:
            'You are an expert prompt engineer for AI image generation tools like Midjourney or DALL·E. Your task is to turn user descriptions into high-quality English prompts.',
        },
        {
          role: 'user',
          content: `${userDescription.trim()}\n\n${ghibliStyleInstructions}`,
        },
      ],
      temperature: 0.7,
    })

    const prompt = completion.choices[0]?.message?.content?.trim()

    if (!prompt) {
      return res.status(500).json({ error: 'プロンプト生成に失敗しました' })
    }

    return res.status(200).json({ prompt })
  } catch (error) {
    console.error('Prompt generation error:', error)
    return res.status(500).json({ error: 'サーバーエラーが発生しました' })
  }
}
