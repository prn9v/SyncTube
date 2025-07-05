import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function POST(req) {
  try {
    const { ids } = await req.json();
    
    // Validate input
    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ 
        error: "Invalid IDs: expected non-empty array" 
      }, { status: 400 });
    }

    // Validate ObjectId format
    const validIds = [];
    for (const id of ids) {
      if (typeof id === 'string' && ObjectId.isValid(id)) {
        validIds.push(new ObjectId(id));
      } else {
        console.warn(`Invalid ObjectId format: ${id}`);
      }
    }

    if (validIds.length === 0) {
      return NextResponse.json({ 
        error: "No valid ObjectIds provided" 
      }, { status: 400 });
    }

    // Connect to database
    const client = await clientPromise;
    const db = client.db();
    
    // Fetch playlists
    const groups = await db
      .collection("group")
      .find({ _id: { $in: validIds } })
      .toArray();

    if(groups == []){
      
    }


    return NextResponse.json({ 
      groups: groups || [],
      total: groups.length 
    });
    
  } catch (error) {
    console.error("Error in /api/group/by-ids:", error);
    
    return NextResponse.json({ 
      error: "Internal server error",
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}