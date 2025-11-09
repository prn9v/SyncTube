import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function POST(req) {
  try {
    const { songData, userId } = await req.json();

    if (!songData) {
      return NextResponse.json({ error: 'Song data is required' }, { status: 400 });
    }

    if (!userId) {
      return NextResponse.json({ error: 'Authentication is required' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();

    // ✅ Convert userId to ObjectId safely
    let userObjectId;
    try {
      userObjectId = new ObjectId(userId);
    } catch {
      return NextResponse.json({ error: 'Invalid user ID format' }, { status: 400 });
    }

    // ✅ Ensure user exists
    const user = await db.collection('users').findOne({ _id: userObjectId });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // ✅ Initialize likedSongs if missing or null
    if (!Array.isArray(user.likedSongs)) {
      await db.collection('users').updateOne(
        { _id: userObjectId },
        { $set: { likedSongs: [] } }
      );
      user.likedSongs = [];
    }

    // ✅ Check if song exists in DB
    let song = await db.collection('songs').findOne({
      title: songData.title,
      artist: songData.artist,
    });

    // ✅ Create song if it doesn't exist
    if (!song) {
      const songResult = await db.collection('songs').insertOne({
        title: songData.title,
        artist: songData.artist,
        album: songData.album || null,
        duration: songData.duration || null,
        albumArt: songData.albumArt || null,
        spotifyId: songData.spotifyId || null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      song = { _id: songResult.insertedId };
    }

    // ✅ Check if already liked
    const isAlreadyLiked = user.likedSongs.some(
      (songId) => songId.toString() === song._id.toString()
    );

    // ✅ Add to liked songs only if not already there
    if (!isAlreadyLiked) {
      await db.collection('users').updateOne(
        { _id: userObjectId },
        {
          $push: { likedSongs: song._id },
          $set: { updatedAt: new Date() },
        }
      );
    }

    return NextResponse.json(
      {
        message: 'Song liked successfully',
        liked: true,
        songId: song._id,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Like song error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
