import { NextResponse } from 'next/server'
import spotifyAPI from '@/lib/spotify'

export async function GET() {
  try {
    // Get access token
    const token = await spotifyAPI.getAccessToken()
    
    // Search for popular artists using different queries
    const searchQueries = [
      'popular artists 2024',
      'top artists',
      'trending artists',
      'chart artists',
      'viral artists'
    ]
    
    const allArtists = []
    
    // Search for popular artists using different queries
    for (const query of searchQueries) {
      try {
        const response = await fetch(
          `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=artist&limit=5&market=US`,
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        )

        if (response.ok) {
          const data = await response.json()
          if (data.artists && data.artists.items.length > 0) {
            const artist = data.artists.items[0]
            
            allArtists.push({
              id: artist.id,
              title: artist.name,
              imageUrl: artist.images[1].url,
              type: "artist",
              external_url: artist.external_urls.spotify,
              uri: artist.uri,
              followers: artist.followers?.total || 0,
              genres: artist.genres || []
            })
          }
        }
      } catch (error) {
        console.error(`Error searching for "${query}":`, error)
      }
    }
    
    // If we couldn't get any artists, return some fallback data
    if (allArtists.length === 0) {
      return NextResponse.json({
        success: true,
        artists: [
          {
            id: 'fallback-1',
            title: "The Weeknd",
            imageUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=200&h=200&fit=crop&crop=center",
            type: "artist",
            external_url: null,
            uri: null,
            followers: 0,
            genres: []
          },
          {
            id: 'fallback-2',
            title: "Taylor Swift",
            imageUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=200&h=200&fit=crop&crop=center",
            type: "artist",
            external_url: null,
            uri: null,
            followers: 0,
            genres: []
          },
          {
            id: 'fallback-3',
            title: "Drake",
            imageUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=200&h=200&fit=crop&crop=center",
            type: "artist",
            external_url: null,
            uri: null,
            followers: 0,
            genres: []
          },
          {
            id: 'fallback-4',
            title: "Dua Lipa",
            imageUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=200&h=200&fit=crop&crop=center",
            type: "artist",
            external_url: null,
            uri: null,
            followers: 0,
            genres: []
          },
          {
            id: 'fallback-5',
            title: "Bad Bunny",
            imageUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=200&h=200&fit=crop&crop=center",
            type: "artist",
            external_url: null,
            uri: null,
            followers: 0,
            genres: []
          }
        ]
      })
    }

    // Return the first 5 artists we found
    const topArtists = allArtists.slice(0, 5)
    

    return NextResponse.json({
      success: true,
      artists: topArtists
    })

  } catch (error) {
    console.error('Top artists error:', error)
    
    // Return fallback data on error
    return NextResponse.json({
      success: true,
      artists: [
        {
          id: 'error-fallback-1',
          title: "The Weeknd",
          imageUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=200&h=200&fit=crop&crop=center",
          type: "artist",
          external_url: null,
          uri: null,
          followers: 0,
          genres: []
        },
        {
          id: 'error-fallback-2',
          title: "Taylor Swift",
          imageUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=200&h=200&fit=crop&crop=center",
          type: "artist",
          external_url: null,
          uri: null,
          followers: 0,
          genres: []
        },
        {
          id: 'error-fallback-3',
          title: "Drake",
          imageUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=200&h=200&fit=crop&crop=center",
          type: "artist",
          external_url: null,
          uri: null,
          followers: 0,
          genres: []
        },
        {
          id: 'error-fallback-4',
          title: "Dua Lipa",
          imageUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=200&h=200&fit=crop&crop=center",
          type: "artist",
          external_url: null,
          uri: null,
          followers: 0,
          genres: []
        },
        {
          id: 'error-fallback-5',
          title: "Bad Bunny",
          imageUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=200&h=200&fit=crop&crop=center",
          type: "artist",
          external_url: null,
          uri: null,
          followers: 0,
          genres: []
        }
      ]
    })
  }
} 