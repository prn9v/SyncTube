import { NextResponse } from 'next/server'
import spotifyAPI from '@/lib/spotify'

export async function GET() {
  try {
    // Get access token
    const token = await spotifyAPI.getAccessToken()
    
    // Use a different approach - search for popular tracks instead of playlist
    // This is more reliable as it doesn't depend on specific playlist IDs
    const searchQueries = [
      'top hits 2024',
      'popular songs',
      'trending music',
      'chart toppers',
      'viral songs'
    ]
    
    const allTracks = []
    
    // Search for popular tracks using different queries
    for (const query of searchQueries) {
      try {
        const response = await fetch(
          `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=5&market=US`,
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        )

        if (response.ok) {
          const data = await response.json()
          if (data.tracks && data.tracks.items.length > 0) {
            const track = data.tracks.items[0]
            
            // Get the best quality image available
            let imageUrl = 'https://via.placeholder.com/200?text=No+Image'
            if (track.album && track.album.images && track.album.images.length > 0) {
              // Prefer medium size image, fallback to first available
              const mediumImage = track.album.images.find(img => img.width >= 200 && img.width <= 400)
              imageUrl = mediumImage ? mediumImage.url : track.album.images[0].url
            }
            
            
            allTracks.push({
              id: track.id,
              title: track.name,
              description: track.artists.map(artist => artist.name).join(', '),
              imageUrl: imageUrl,
              duration: track.duration_ms,
              preview_url: track.preview_url,
              external_url: track.external_urls.spotify,
              uri: track.uri
            })
          }
        }
      } catch (error) {
        console.error(`Error searching for "${query}":`, error)
      }
    }
    
    // If we couldn't get any tracks, return some fallback data
    if (allTracks.length === 0) {
      return NextResponse.json({
        success: true,
        tracks: [
          {
            id: 'fallback-1',
            title: "Today's Top Hits",
            description: "Popular music from various artists",
            imageUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=200&h=200&fit=crop&crop=center",
            duration: 180000,
            preview_url: null,
            external_url: null,
            uri: null
          },
          {
            id: 'fallback-2',
            title: "Workout Mix",
            description: "High energy music to keep you going",
            imageUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=200&h=200&fit=crop&crop=center",
            duration: 200000,
            preview_url: null,
            external_url: null,
            uri: null
          },
          {
            id: 'fallback-3',
            title: "Chill Vibes",
            description: "Relax and unwind with these tracks",
            imageUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=200&h=200&fit=crop&crop=center",
            duration: 160000,
            preview_url: null,
            external_url: null,
            uri: null
          },
          {
            id: 'fallback-4',
            title: "Hip Hop Mix",
            description: "Latest hip hop hits",
            imageUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=200&h=200&fit=crop&crop=center",
            duration: 190000,
            preview_url: null,
            external_url: null,
            uri: null
          },
          {
            id: 'fallback-5',
            title: "80's Classics",
            description: "Timeless hits from the 80s",
            imageUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=200&h=200&fit=crop&crop=center",
            duration: 170000,
            preview_url: null,
            external_url: null,
            uri: null
          }
        ]
      })
    }

    // Return the first 5 tracks we found
    const topTracks = allTracks.slice(0, 5)
    
    return NextResponse.json({
      success: true,
      tracks: topTracks
    })

  } catch (error) {
    console.error('Top tracks error:', error)
    
    // Return fallback data on error
    return NextResponse.json({
      success: true,
      tracks: [
        {
          id: 'error-fallback-1',
          title: "Today's Top Hits",
          description: "Popular music from various artists",
          imageUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=200&h=200&fit=crop&crop=center",
          duration: 180000,
          preview_url: null,
          external_url: null,
          uri: null
        },
        {
          id: 'error-fallback-2',
          title: "Workout Mix",
          description: "High energy music to keep you going",
          imageUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=200&h=200&fit=crop&crop=center",
          duration: 200000,
          preview_url: null,
          external_url: null,
          uri: null
        },
        {
          id: 'error-fallback-3',
          title: "Chill Vibes",
          description: "Relax and unwind with these tracks",
          imageUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=200&h=200&fit=crop&crop=center",
          duration: 160000,
          preview_url: null,
          external_url: null,
          uri: null
        },
        {
          id: 'error-fallback-4',
          title: "Hip Hop Mix",
          description: "Latest hip hop hits",
          imageUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=200&h=200&fit=crop&crop=center",
          duration: 190000,
          preview_url: null,
          external_url: null,
          uri: null
        },
        {
          id: 'error-fallback-5',
          title: "80's Classics",
          description: "Timeless hits from the 80s",
          imageUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=200&h=200&fit=crop&crop=center",
          duration: 170000,
          preview_url: null,
          external_url: null,
          uri: null
        }
      ]
    })
  }
} 