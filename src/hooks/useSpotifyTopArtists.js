'use client'
import { useState, useEffect } from 'react'

export function useSpotifyTopArtists() {
  const [topArtists, setTopArtists] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchTopArtists()
  }, [])

  const fetchTopArtists = async () => {
    try {
      setLoading(true)
      setError(null)

      // Get top artists from Spotify API
      const response = await fetch('/api/spotify/top-artists')
      
      if (!response.ok) {
        throw new Error('Failed to fetch top artists')
      }

      const data = await response.json()
      setTopArtists(data.artists || [])
    } catch (err) {
      setTopArtists([])
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return {
    topArtists,
    loading,
    error,
    refetch: fetchTopArtists
  }
} 