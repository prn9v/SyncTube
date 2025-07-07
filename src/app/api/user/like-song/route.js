import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function POST(req) {
  try {
    const { songData, userId } = await req.json();

    console.log("song data: ", songData);
    console.log("userid: ", userId);

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

    // First, check if the song already exists in the songs collection
    let song = await db.collection('songs').findOne({
      title: songData.title,
      artist: songData.artist
    });

    // If song doesn't exist, create it
    if (!song) {
      const songResult = await db.collection('songs').insertOne({
        title: songData.title,
        artist: songData.artist,
        album: songData.album || null,
        duration: songData.duration || null,
        albumArt: songData.albumArt || null,
        spotifyId: songData.spotifyId || null,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      song = { _id: songResult.insertedId };
    }

    // Add song to user's liked songs if not already liked
    const user = await db.collection('users').findOne({ _id: userObjectId });
    console.log("user: ", user);

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    if (!user.likedSongs) {
      user.likedSongs = [];
    }

    const isAlreadyLiked = user.likedSongs.some(songId => 
      songId.toString() === song._id.toString()
    );

    if (!isAlreadyLiked) {
      await db.collection('users').updateOne(
        { _id: userObjectId },
        { 
          $push: { likedSongs: song._id },
          $set: { updatedAt: new Date() }
        }
      );
    }

    return NextResponse.json(
      { 
        message: 'Song liked successfully',
        liked: true,
        songId: song._id
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Like song error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 