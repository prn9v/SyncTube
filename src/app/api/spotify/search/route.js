import { NextResponse } from 'next/server'
import spotifyAPI from '@/lib/spotify'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')
    const type = searchParams.get('type') || 'all' // 'all', 'tracks', 'artists', 'playlists'
    const limit = parseInt(searchParams.get('limit')) || 10
    const offset = parseInt(searchParams.get('offset')) || 0

    // Input validation
    if (!query || query.trim().length === 0) {
      return NextResponse.json(
        { error: 'Search query is required' },
        { status: 400 }
      )
    }

    if (limit < 1 || limit > 50) {
      return NextResponse.json(
        { error: 'Limit must be between 1 and 50' },
        { status: 400 }
      )
    }

    let results;

    // Search based on type
    switch (type) {
      case 'tracks':
        const tracks = await spotifyAPI.searchTracks(query, limit, offset)
        results = { tracks }
        break
      case 'artists':
        const artists = await spotifyAPI.searchArtists(query, limit, offset)
        results = { artists }
        break
      case 'playlists':
        const playlists = await spotifyAPI.searchPlaylists(query, limit, offset)
        results = { playlists }
        break
      case 'all':
      default:
        results = await spotifyAPI.searchAll(query, limit, offset)
        break
    }

    return NextResponse.json({
      success: true,
      ...results,
      query,
      type,
      limit,
      offset
    })

  } catch (error) {
    console.error('Spotify search error:', error)
    return NextResponse.json(
      { error: 'Failed to search' },
      { status: 500 }
    )
  }
} 