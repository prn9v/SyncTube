import { NextResponse } from 'next/server'
import spotifyAPI from '@/lib/spotify'

export async function GET(request, { params }) {
  try {
    const { id } = params

    if (!id) {
      return NextResponse.json(
        { error: 'Track ID is required' },
        { status: 400 }
      )
    }

    const track = await spotifyAPI.getTrackById(id)

    return NextResponse.json({
      success: true,
      track
    })

  } catch (error) {
    console.error('Spotify track error:', error)
    return NextResponse.json(
      { error: 'Failed to get track' },
      { status: 500 }
    )
  }
} 