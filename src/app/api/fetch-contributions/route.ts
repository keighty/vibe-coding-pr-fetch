import { NextRequest, NextResponse } from 'next/server'
import { fetchUserContributions } from '@/lib/github'

export async function POST(req: NextRequest) {
  try {
    const { username, startDate, endDate } = await req.json()

    if (!username || !startDate || !endDate) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 })
    }

    const data = await fetchUserContributions(username, startDate, endDate)

    return NextResponse.json(data)
  } catch (err: any) {
    console.error('GitHub API error:', err)
    const status = err.status || 500
    const message = err.message || 'Internal Server Error'
    return NextResponse.json({ message }, { status })
  }
}
