import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function POST(req) {
  try {
    // Check if request has a body
    const text = await req.text();
    if (!text) {
      return NextResponse.json({ 
        error: "Empty request body" 
      }, { status: 400 });
    }

    // Parse JSON
    let body;
    try {
      body = JSON.parse(text);
    } catch (parseError) {
      return NextResponse.json({ 
        error: "Invalid JSON in request body" 
      }, { status: 400 });
    }

    const { ids } = body;
    
    // Validate input
    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ 
        groups: [],
        total: 0,
        message: "No group IDs provided"
      }, { status: 200 });
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
        groups: [],
        total: 0,
        message: "No valid ObjectIds provided"
      }, { status: 200 });
    }

    // Connect to database
    const client = await clientPromise;
    const db = client.db();
    
    // Fetch groups
    const groups = await db
      .collection("group")
      .find({ _id: { $in: validIds } })
      .toArray();

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