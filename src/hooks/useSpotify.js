'use client'
import { useState, useEffect } from 'react'

export function useSpotifySearch() {
  const [searchResults, setSearchResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const searchTracks = async (query, limit = 10, offset = 0) => {
    if (!query || query.trim().length === 0) {
      setSearchResults([])
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(
        `/api/spotify/search?q=${encodeURIComponent(query)}&type=tracks&limit=${limit}&offset=${offset}`
      )

      if (!response.ok) {
        throw new Error('Failed to search tracks')
      }

      const data = await response.json()
      setSearchResults(data.tracks || [])
    } catch (err) {
      setError(err.message)
      setSearchResults([])
    } finally {
      setLoading(false)
    }
  }

  const getTrack = async (trackId) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/spotify/tracks/${trackId}`)

      if (!response.ok) {
        throw new Error('Failed to get track')
      }

      const data = await response.json()
      return data.track
    } catch (err) {
      setError(err.message)
      return null
    } finally {
      setLoading(false)
    }
  }

  return {
    searchResults,
    loading,
    error,
    searchTracks,
    getTrack
  }
}

export function useSpotifyComprehensiveSearch() {
  const [searchResults, setSearchResults] = useState({ tracks: [], artists: [], playlists: [] })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const searchAll = async (query, limit = 10, offset = 0) => {
    if (!query || query.trim().length === 0) {
      setSearchResults({ tracks: [], artists: [], playlists: [] })
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(
        `/api/spotify/search?q=${encodeURIComponent(query)}&type=all&limit=${limit}&offset=${offset}`
      )

      if (!response.ok) {
        throw new Error('Failed to search')
      }

      const data = await response.json()
      setSearchResults({
        tracks: data.tracks || [],
        artists: data.artists || [],
        playlists: data.playlists || []
      })
    } catch (err) {
      setError(err.message)
      setSearchResults({ tracks: [], artists: [], playlists: [] })
    } finally {
      setLoading(false)
    }
  }

  const searchByType = async (query, type, limit = 10, offset = 0) => {
    if (!query || query.trim().length === 0) {
      setSearchResults({ tracks: [], artists: [], playlists: [] })
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(
        `/api/spotify/search?q=${encodeURIComponent(query)}&type=${type}&limit=${limit}&offset=${offset}`
      )

      if (!response.ok) {
        throw new Error('Failed to search')
      }

      const data = await response.json()
      
      // Update only the specific type results
      setSearchResults(prev => ({
        ...prev,
        [type]: data[type] || []
      }))
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return {
    searchResults,
    loading,
    error,
    searchAll,
    searchByType
  }
} 