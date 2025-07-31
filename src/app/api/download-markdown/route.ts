import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export async function POST(req: NextRequest) {
  try {
    const { username, content } = await req.json();

    if (!username || !content) {
      return NextResponse.json({ message: 'Missing username or content' }, { status: 400 });
    }

    // Create downloads directory if it doesn't exist
    const downloadsDir = path.join(process.cwd(), 'downloads');
    try {
      await fs.access(downloadsDir);
    } catch {
      await fs.mkdir(downloadsDir, { recursive: true });
    }

    // File path for the markdown file
    const filePath = path.join(downloadsDir, `${username}.md`);

    // Check if file exists and append, otherwise create new
    try {
      await fs.access(filePath);
      // File exists, append content
      await fs.appendFile(filePath, content);
    } catch {
      // File doesn't exist, create new with content
      await fs.writeFile(filePath, content);
    }

    return NextResponse.json({ 
      message: 'Markdown saved successfully',
      filename: `${username}.md`
    });

  } catch (error: any) {
    console.error('Download markdown error:', error);
    return NextResponse.json({ 
      message: 'Failed to save markdown file' 
    }, { status: 500 });
  }
}