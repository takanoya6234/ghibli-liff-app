import type { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import fs from 'fs';
import path from 'path';

export const config = {
  api: {
    bodyParser: false, // formidableを使うので Next.jsのbodyParserを無効化
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const form = new formidable.IncomingForm({ keepExtensions: true });

  form.parse(req, async (err, fields, files) => {
    if (err || !files.file) {
      return res.status(500).json({ error: 'アップロードエラー' });
    }

    const file = Array.isArray(files.file) ? files.file[0] : files.file;

    try {
      // 画像ファイルの読み込み
      const imageData = fs.readFileSync(file.filepath);

      // base64に変換
      const base64Image = imageData.toString('base64');

      // MIMEタイプの取得
      const mimeType = file.mimetype || 'image/png';

      // Base64形式の画像URLとして返す
      return res.status(200).json({
        imageUrl: `data:${mimeType};base64,${base64Image}`,
      });
    } catch (error) {
      console.error('画像処理エラー:', error);
      return res.status(500).json({ error: '画像の処理に失敗しました' });
    }
  });
}
