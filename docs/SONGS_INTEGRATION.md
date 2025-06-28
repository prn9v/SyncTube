# Spotify Songs Integration

This document explains how to integrate the Spotify songs dataset into your SyncTube application.

## Overview

The songs integration allows users to:
- Browse a library of 30,000+ songs from the Spotify dataset
- Search songs by title, artist, or album
- Filter by genre, year, and other attributes
- Sort by popularity, title, artist, year, or duration
- View detailed song information including audio features
- Add songs to playlists (coming soon)

## Dataset Source

The songs data comes from the [30,000 Spotify Songs Dataset](https://www.kaggle.com/datasets/joebeachcapital/30000-spotify-songs) on Kaggle.

## Setup Instructions

### 1. Import Sample Data

To get started with sample data:

```bash
npm run import-songs
```

This will import a small sample of popular songs for testing.

### 2. Import Full Dataset

To import the complete dataset:

#### Option A: Using the provided sample data
```bash
npm run import-dataset
```

#### Option B: Download from Kaggle (Recommended for production)

1. Install Kaggle CLI:
```bash
pip install kaggle
```

2. Set up Kaggle API credentials:
   - Go to your Kaggle account settings
   - Create a new API token
   - Download the `kaggle.json` file
   - Place it in `~/.kaggle/kaggle.json` (Linux/Mac) or `C:\Users\<username>\.kaggle\kaggle.json` (Windows)

3. Download the dataset:
```bash
kaggle datasets download -d joebeachcapital/30000-spotify-songs
```

4. Extract the CSV file and update the import script to read it.

### 3. Database Setup

The import scripts will automatically:
- Create the `songs` collection in MongoDB
- Add indexes for optimal performance
- Create text indexes for search functionality

## API Endpoints

### GET /api/songs

Fetch songs with filtering, search, and pagination.

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 20)
- `search` (string): Search in title, artist, album
- `genre` (string): Filter by genre
- `artist` (string): Filter by artist
- `year` (number): Filter by year
- `sortBy` (string): Sort field (popularity, title, artist, year, duration)
- `sortOrder` (string): Sort order (asc, desc)

**Response:**
```json
{
  "songs": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 1000,
    "totalPages": 50
  },
  "filters": {
    "genres": ["Pop", "Hip-Hop", "Rock"],
    "years": [2020, 2019, 2018]
  }
}
```

## Song Data Structure

Each song object contains:

```json
{
  "_id": "ObjectId",
  "title": "Song Title",
  "artist": "Artist Name",
  "album": "Album Name",
  "duration": "3:20",
  "genre": "Pop",
  "year": 2020,
  "popularity": 95,
  "danceability": 0.514,
  "energy": 0.730,
  "key": 1,
  "loudness": -5.934,
  "mode": 1,
  "speechiness": 0.0598,
  "acousticness": 0.00146,
  "instrumentalness": 0.000006,
  "liveness": 0.0897,
  "valence": 0.334,
  "tempo": 171.005,
  "spotify_id": "0VjIjW4GlUZAMYd2vXMi3b"
}
```

## Components

### SongCard
A reusable component for displaying song information with:
- Play/pause functionality
- Like/unlike (heart icon)
- Add to playlist (plus icon)
- Audio features visualization
- Genre and popularity badges

### SongsPage
The main songs library page with:
- Search functionality
- Advanced filtering
- Sorting options
- Pagination
- Responsive grid layout

## Usage Examples

### Basic Search
```javascript
const response = await fetch('/api/songs?search=blinding lights');
const data = await response.json();
```

### Filtered Search
```javascript
const response = await fetch('/api/songs?genre=Pop&year=2020&sortBy=popularity&sortOrder=desc');
const data = await response.json();
```

### Pagination
```javascript
const response = await fetch('/api/songs?page=2&limit=10');
const data = await response.json();
```

## Performance Considerations

- Database indexes are created automatically for optimal query performance
- Text search uses MongoDB's text index
- Pagination is implemented to handle large datasets
- Images and audio files are not included (only metadata)

## Future Enhancements

- [ ] Audio playback integration
- [ ] Spotify API integration for real-time data
- [ ] User favorites/liked songs
- [ ] Playlist creation and management
- [ ] Song recommendations based on user preferences
- [ ] Advanced audio feature filtering
- [ ] Export functionality

## Troubleshooting

### Common Issues

1. **Import fails**: Check MongoDB connection and credentials
2. **Search not working**: Ensure text indexes are created
3. **Slow queries**: Verify database indexes are in place
4. **Missing data**: Check if the import script completed successfully

### Debug Commands

```bash
# Check database connection
npm run dev

# Re-import data
npm run import-dataset

# View database statistics
# Connect to MongoDB and run: db.songs.stats()
```

## License

The dataset is provided under the original Kaggle dataset license. Please refer to the [Kaggle dataset page](https://www.kaggle.com/datasets/joebeachcapital/30000-spotify-songs) for licensing details. 