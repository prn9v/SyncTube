import { NextResponse } from 'next/server'
import spotifyAPI from '@/lib/spotify'

export async function GET(request) {
  try {

    const tracks = await spotifyAPI.getAllTrack()

    return NextResponse.json({
      success: true,
      tracks
    })

  } catch (error) {
    console.error('Spotify track error:', error)
    return NextResponse.json(
      { error: 'Failed to get track' },
      { status: 500 }
    )
  }
} 