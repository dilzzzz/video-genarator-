import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Readable } from 'stream';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end('Method Not Allowed');
  }

  try {
    const { downloadLink } = req.body;
    const apiKey = process.env.VITE_API_KEY;

    if (!downloadLink) {
      return res.status(400).json({ error: 'Missing downloadLink in request body' });
    }

    if (!apiKey) {
      return res.status(500).json({ error: 'API key is not configured on the server.' });
    }

    // This is a server-to-server request, so no CORS issues.
    const videoApiResponse = await fetch(`${downloadLink}&key=${apiKey}`);

    if (!videoApiResponse.ok) {
      const errorText = await videoApiResponse.text();
      console.error('Failed to fetch video from Google:', errorText);
      return res.status(videoApiResponse.status).json({ error: `Failed to download video from source: ${videoApiResponse.statusText}` });
    }

    const contentType = videoApiResponse.headers.get('content-type') || 'video/mp4';
    const contentLength = videoApiResponse.headers.get('content-length');

    res.setHeader('Content-Type', contentType);
    if (contentLength) {
      res.setHeader('Content-Length', contentLength);
    }
    
    if (!videoApiResponse.body) {
        const buffer = await videoApiResponse.arrayBuffer();
        return res.send(Buffer.from(buffer));
    }

    // Convert the web stream (from fetch) to a Node.js stream and pipe it to the response
    const nodeStream = Readable.fromWeb(videoApiResponse.body as any);
    nodeStream.pipe(res);

  } catch (error) {
    console.error('Error in downloadVideo proxy:', error);
    res.status(500).json({ error: 'An internal server error occurred.' });
  }
}
