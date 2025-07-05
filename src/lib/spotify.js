// Spotify API service for SyncTube
class SpotifyAPI {
  constructor() {
    this.clientId = process.env.SPOTIFY_CLIENT_ID;
    this.clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
    this.baseURL = 'https://api.spotify.com/v1';
    this.tokenURL = 'https://accounts.spotify.com/api/token';
  }

  async getAccessToken() {
    try {
      const response = await fetch(this.tokenURL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': 'Basic ' + Buffer.from(this.clientId + ':' + this.clientSecret).toString('base64')
        },
        body: 'grant_type=client_credentials'
      });

      if (!response.ok) {
        throw new Error(`Failed to get access token: ${response.status}`);
      }

      const data = await response.json();
      return data.access_token;
    } catch (error) {
      console.error('Error getting Spotify access token:', error);
      throw error;
    }
  }

  async searchTracks(query, limit = 10, offset = 0) {
    try {
      const token = await this.getAccessToken();
      const encodedQuery = encodeURIComponent(query);
      
      const response = await fetch(
        `${this.baseURL}/search?q=${encodedQuery}&type=track&limit=${limit}&offset=${offset}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (!response.ok) {
        throw new Error(`Spotify API error: ${response.status}`);
      }

      const data = await response.json();
      return this.formatTracks(data.tracks?.items || []);
    } catch (error) {
      console.error('Error searching tracks:', error);
      return [];
    }
  }

  async searchAll(query, limit = 10, offset = 0) {
    try {
      const token = await this.getAccessToken();
      const encodedQuery = encodeURIComponent(query);
      
      const response = await fetch(
        `${this.baseURL}/search?q=${encodedQuery}&type=track,artist,playlist&limit=${limit}&offset=${offset}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (!response.ok) {
        throw new Error(`Spotify API error: ${response.status}`);
      }

      const data = await response.json();
      
      return {
        tracks: this.formatTracks(data.tracks?.items || []),
        artists: this.formatArtists(data.artists?.items || []),
        playlists: this.formatPlaylists(data.playlists?.items || [])
      };
    } catch (error) {
      console.error('Error searching all:', error);
      // Return empty results instead of throwing
      return {
        tracks: [],
        artists: [],
        playlists: []
      };
    }
  }

  async searchArtists(query, limit = 10, offset = 0) {
    try {
      const token = await this.getAccessToken();
      const encodedQuery = encodeURIComponent(query);
      
      const response = await fetch(
        `${this.baseURL}/search?q=${encodedQuery}&type=artist&limit=${limit}&offset=${offset}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (!response.ok) {
        throw new Error(`Spotify API error: ${response.status}`);
      }

      const data = await response.json();
      return this.formatArtists(data.artists?.items || []);
    } catch (error) {
      console.error('Error searching artists:', error);
      return [];
    }
  }

  async searchPlaylists(query, limit = 10, offset = 0) {
    try {
      const token = await this.getAccessToken();
      const encodedQuery = encodeURIComponent(query);
      
      const response = await fetch(
        `${this.baseURL}/search?q=${encodedQuery}&type=playlist&limit=${limit}&offset=${offset}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (!response.ok) {
        throw new Error(`Spotify API error: ${response.status}`);
      }

      const data = await response.json();
      return this.formatPlaylists(data.playlists?.items || []);
    } catch (error) {
      console.error('Error searching playlists:', error);
      return [];
    }
  }

  async getTrackById(trackId) {
    try {
      const token = await this.getAccessToken();
      
      const response = await fetch(`${this.baseURL}/tracks/${trackId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`Spotify API error: ${response.status}`);
      }

      const track = await response.json();
      return this.formatTrack(track);
    } catch (error) {
      console.error('Error getting track by ID:', error);
      throw error;
    }
  }

  async getAllTrack() {
    try {
      const token = await this.getAccessToken();
      
      const response = await fetch(`${this.baseURL}/tracks`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`Spotify API error: ${response.status}`);
      }

      const tracks = await response.json();
      return this.formatTrack(tracks);
    } catch (error) {
      console.error('Error getting track by ID:', error);
      throw error;
    }
  }

  async getArtistTopTracks(artistId) {
    try {
      const token = await this.getAccessToken();
      
      const response = await fetch(`${this.baseURL}/artists/${artistId}/top-tracks?market=US`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`Spotify API error: ${response.status}`);
      }

      const data = await response.json();
      return this.formatTracks(data.tracks);
    } catch (error) {
      console.error('Error getting artist top tracks:', error);
      throw error;
    }
  }

  formatTrack(track) {
    if (!track || !track.id) {
      return null;
    }
    
    return {
      id: track.id,
      name: track.name,
      artists: track.artists?.map(artist => ({
        id: artist.id,
        name: artist.name
      })) || [],
      album: track.album ? {
        id: track.album.id,
        name: track.album.name,
        images: track.album.images
      } : null,
      duration_ms: track.duration_ms,
      preview_url: track.preview_url,
      external_url: track.external_urls?.spotify,
      uri: track.uri
    };
  }

  formatTracks(tracks) {
    return tracks
      .filter(track => track && track.id) // Filter out null/undefined tracks
      .map(track => this.formatTrack(track))
      .filter(track => track !== null); // Filter out null results from formatTrack
  }

  formatArtists(artists) {
    return artists
      .filter(artist => artist && artist.id) // Filter out null/undefined artists
      .map(artist => ({
        id: artist.id,
        name: artist.name,
        images: artist.images,
        external_url: artist.external_urls.spotify,
        uri: artist.uri,
        followers: artist.followers?.total || 0,
        genres: artist.genres || [],
        popularity: artist.popularity
      }));
  }

  formatPlaylists(playlists) {
    return playlists
      .filter(playlist => playlist && playlist.id) // Filter out null/undefined playlists
      .map(playlist => ({
        id: playlist.id,
        name: playlist.name,
        description: playlist.description,
        images: playlist.images,
        external_url: playlist.external_urls.spotify,
        uri: playlist.uri,
        owner: playlist.owner?.display_name || 'Unknown',
        tracks_count: playlist.tracks?.total || 0,
        public: playlist.public
      }));
  }
}

// Create singleton instance
const spotifyAPI = new SpotifyAPI();
export default spotifyAPI; 