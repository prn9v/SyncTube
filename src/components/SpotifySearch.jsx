'use client'

import { useState } from 'react'
import { useSpotifySearch } from '@/hooks/useSpotify'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function SpotifySearch({ isAdmin = true, groupId, onSongAdded }) {
  const [query, setQuery] = useState('')
  const { searchResults, loading, error, searchTracks } = useSpotifySearch()
  const [adding, setAdding] = useState(null)

  const handleSearch = (e) => {
    e.preventDefault()
    searchTracks(query)
  }

  const handleAddToQueue = async (track) => {
    if (!groupId) return
    setAdding(track.id)
    try {
      const song = {
        title: track.name,
        artist: track.artists.map(a => a.name).join(', '),
        album: track.album.name,
        duration: track.duration_ms,
        albumArt: track.album.images[0]?.url || '',
        spotifyId: track.id,
      }

      const res = await fetch(`/api/group/${groupId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ song }),
      })

      if (!res.ok) throw new Error('Failed to add song')
      if (onSongAdded) onSongAdded()
      alert('Song added to queue!')
    } catch (err) {
      alert('Failed to add song')
    } finally {
      setAdding(null)
    }
  }

  const formatDuration = (ms) => {
    const minutes = Math.floor(ms / 60000)
    const seconds = ((ms % 60000) / 1000).toFixed(0)
    return `${minutes}:${seconds.padStart(2, '0')}`
  }

  return (
    <div className="space-y-6">
      {/* Search Form */}
      <form
        onSubmit={handleSearch}
        className="flex flex-col sm:flex-row gap-2"
      >
        <Input
          type="text"
          placeholder="Search for songs..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1"
        />
        <Button type="submit" disabled={loading} className="w-full sm:w-auto">
          {loading ? 'Searching...' : 'Search'}
        </Button>
      </form>

      {/* Error message */}
      {error && (
        <div className="text-red-500 text-center">Error: {error}</div>
      )}

      {/* Search results grid */}
      <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {searchResults.map((track) => (
          <Card
            key={track.id}
            className="hover:shadow-lg transition-shadow flex flex-col h-full"
          >
            <CardHeader>
              <CardTitle className="text-lg truncate">{track.name}</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col justify-between p-4 pt-0">
              <div className="flex flex-col h-full justify-between">
                <div>
                  <p className="text-sm text-gray-600 truncate">
                    {track.artists.map((artist) => artist.name).join(', ')}
                  </p>
                  <p className="text-sm text-gray-500 truncate">
                    {track.album.name}
                  </p>
                  <p className="text-xs text-gray-400">
                    {formatDuration(track.duration_ms)}
                  </p>
                </div>

                <div className="flex flex-col items-center mt-2">
                  <div className="w-full flex justify-center mb-2">
                    {track.album.images[0] && (
                      <img
                        src={track.album.images[0].url}
                        alt={track.album.name}
                        className="w-24 h-24 object-cover rounded shadow-sm"
                      />
                    )}
                  </div>

                  {isAdmin && groupId && (
                    <Button
                      className="mt-4 w-full"
                      onClick={() => handleAddToQueue(track)}
                      disabled={adding === track.id}
                    >
                      {adding === track.id ? 'Adding...' : 'Add to Queue'}
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* No results found */}
      {searchResults.length === 0 && !loading && !error && query && (
        <div className="text-center text-gray-500">
          No tracks found for "{query}"
        </div>
      )}
    </div>
  )
}
