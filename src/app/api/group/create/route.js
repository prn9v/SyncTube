import { NextResponse } from 'next/server';
import GroupSession from '@/models/GroupSession';
import User from '@/models/User';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function POST(req) {
  try {
    const client = await clientPromise;
    const db = client.db();

    const { groupName, groupCode, owner } = await req.json();
    
    if (!groupName || !groupCode) {
      return NextResponse.json({ error: 'Missing groupName or groupCode' }, { status: 400 });
    }

    if (!owner) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if group code already exists
    const existingGroup = await db.collection("group").findOne({ inviteCode: groupCode });
    if (existingGroup) {
      return NextResponse.json({ error: 'Group code already exists' }, { status: 409 });
    }

    // Build group document
    const groupDoc = {
      groupName,
      inviteCode: groupCode,
      owner: owner,
      members: [owner], // Store user IDs
      admin: owner,     // Store user ID
      queue: [],
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Insert group into database
    const result = await db.collection('group').insertOne(groupDoc);

    // Add group ID to user's groups array - FIXED: Use ownerId instead of result.admin
    let userQuery;
    try {
      userQuery = { _id: new ObjectId(owner) };
    } catch {
      userQuery = { _id: owner };
    }

    const userUpdateResult = await db.collection('users').updateOne(
      userQuery,
      { $push: { groups: result.insertedId } }
    );

    // Verify the update worked
    if (userUpdateResult.matchedCount === 0) {
      console.error("User not found with ID:", owner);
      // Optionally, you might want to delete the created group if user update fails
      // await db.collection('group').deleteOne({ _id: result.insertedId });
      return NextResponse.json({ 
        error: 'User not found',
        details: 'Could not update user groups array'
      }, { status: 404 });
    }

    if (userUpdateResult.modifiedCount === 0) {
      console.error("User update failed for ID:", owner);
    }

    return NextResponse.json({ 
      success: true, 
      groupId: result.insertedId.toString(), 
      groupCode,
      message: 'Group created successfully' 
    });
  } catch (err) {
    console.error('Error creating group:', err);
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: err.message 
    }, { status: 500 });
  }
}