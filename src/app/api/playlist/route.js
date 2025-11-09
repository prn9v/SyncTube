import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import Playlist from "@/models/Playlist";
import { ObjectId } from "mongodb";

export async function POST(request) {
  try {
    const client = await clientPromise;
    const db = client.db();

    const body = await request.json();
    const { playlistName, description, coverUrl, songs, owner } = body;

    if (!playlistName?.trim()) {
      return NextResponse.json({ error: "Playlist name is required" }, { status: 400 });
    }
    if (!owner) {
      return NextResponse.json({ error: "Owner (user id) is required" }, { status: 400 });
    }

    const transformedSongs = (songs || []).map((song) => ({
      spotifyId: song.id,
      title: song.title,
      artist: song.artist,
      album: song.album || "Unknown Album",
      duration: song.duration,
      albumImage: song.spotifyData?.album?.images?.[0]?.url || null,
      spotifyUrl: song.spotifyData?.external_urls?.spotify || null,
      addedAt: new Date(),
    }));

    const playlistDoc = {
      playlistName: playlistName.trim(),
      description: description?.trim() || "",
      coverUrl: coverUrl || null,
      songs: transformedSongs,
      owner: new ObjectId(owner),
      sharedWith: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection("playlist").insertOne(playlistDoc);

    // ✅ Ensure playlists field is an array (even if null)
    await db.collection("users").updateOne(
      {
        _id: new ObjectId(owner),
        $or: [{ playlists: { $exists: false } }, { playlists: null }],
      },
      { $set: { playlists: [] } }
    );

    // ✅ Add playlist ID to user's playlists
    await db.collection("users").updateOne(
      { _id: new ObjectId(owner) },
      { $push: { playlists: result.insertedId } }
    );

    const playlist = {
      id: result.insertedId.toString(),
      ...playlistDoc,
    };

    return NextResponse.json(
      { message: "Playlist created successfully", playlist },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating playlist:", error);
    return NextResponse.json({ error: "Failed to create playlist" }, { status: 500 });
  }
}

export async function GET(request) {
  try {
    const body = await request.json();
    const { owner } = body;

    if (!owner) {
      return NextResponse.json(
        { error: "Unauthorized - Please log in" },
        { status: 401 }
      );
    }

    const playlists = await Playlist.find({ owner })
      .populate("owner", "firstName lastName email")
      .sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      playlists,
    });
  } catch (error) {
    console.error("Error fetching playlists:", error);
    return NextResponse.json({ error: "Failed to fetch playlists" }, { status: 500 });
  }
}
