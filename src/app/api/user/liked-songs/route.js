import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const client = await clientPromise;
    const db = client.db();

    // Get liked songs from session or fetch from database
    let likedSongs = [];
    
    if (session.user.likedSongs && Array.isArray(session.user.likedSongs)) {
      // Convert string IDs to ObjectIds
      const songIds = session.user.likedSongs.map(id => {
        try {
          return new ObjectId(id);
        } catch (error) {
          console.error('Invalid ObjectId:', id);
          return null;
        }
      }).filter(id => id !== null);

      if (songIds.length > 0) {
        // Fetch songs from database
        likedSongs = await db.collection('songs')
          .find({ _id: { $in: songIds } })
          .sort({ createdAt: -1 })
          .toArray();
      }
    }

    return NextResponse.json(
      { songs: likedSongs },
      { status: 200 }
    );

  } catch (error) {
    console.error('Fetch liked songs error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 