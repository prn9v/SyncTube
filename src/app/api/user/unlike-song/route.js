import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function POST(req) {
  try {
    const { songData, userId } = await req.json();

    if (!songData) {
      return NextResponse.json(
        { error: 'Song data is required' },
        { status: 400 }
      );
    }

    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication is required' },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db();

    // Convert userId string to ObjectId
    let userObjectId;
    try {
      userObjectId = new ObjectId(userId);
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid user ID format' },
        { status: 400 }
      );
    }

    // Find the song in the songs collection
    const song = await db.collection('songs').findOne({
      title: songData.title,
      artist: songData.artist
    });

    if (!song) {
      return NextResponse.json(
        { error: 'Song not found' },
        { status: 404 }
      );
    }

    // Remove song from user's liked songs
    await db.collection('users').updateOne(
      { _id: userObjectId },
      { 
        $pull: { likedSongs: song._id },
        $set: { updatedAt: new Date() }
      }
    );

    return NextResponse.json(
      { 
        message: 'Song unliked successfully',
        liked: false,
        songId: song._id
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Unlike song error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 