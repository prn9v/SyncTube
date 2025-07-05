'use client'
import { useState, useEffect } from 'react'

export function useSpotifyTopTracks() {
  const [topTracks, setTopTracks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchTopTracks()
  }, [])

  const fetchTopTracks = async () => {
    try {
      setLoading(true)
      setError(null)

      // Get top tracks from Spotify API
      const response = await fetch('/api/spotify/top-tracks')
      
      if (!response.ok) {
        throw new Error('Failed to fetch top tracks')
      }

      const data = await response.json()
      setTopTracks(data.tracks || [])
    } catch (err) {
      setTopTracks([]);
      setError(err.message);
    } finally {
      setLoading(false)
    }
  }

  return {
    topTracks,
    loading,
    error,
    refetch: fetchTopTracks
  }
} 