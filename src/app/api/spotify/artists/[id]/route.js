import { NextResponse } from 'next/server';
import { getSpotifyAccessToken } from '@/lib/spotify';

export async function GET(req, { params }) {
  const { id } = params;
  const token = await getSpotifyAccessToken();
  const res = await fetch(`https://api.spotify.com/v1/artists/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) {
    return NextResponse.json({ error: 'Failed to fetch from Spotify' }, { status: res.status });
  }
  const data = await res.json();
  return NextResponse.json(data);
} 