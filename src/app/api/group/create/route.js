import { NextResponse } from 'next/server';
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

    // ✅ Check if group code already exists
    const existingGroup = await db.collection('group').findOne({ inviteCode: groupCode });
    if (existingGroup) {
      return NextResponse.json({ error: 'Group code already exists' }, { status: 409 });
    }

    // ✅ Build group document
    const groupDoc = {
      groupName,
      inviteCode: groupCode,
      owner,
      members: [new ObjectId(owner)],
      admin: new ObjectId(owner),
      queue: [],
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // ✅ Insert new group
    const result = await db.collection('group').insertOne(groupDoc);

    // ✅ Ensure user's 'groups' field exists and is an array
    const userQuery = { _id: new ObjectId(owner) };

    await db.collection('users').updateOne(
      { ...userQuery, $or: [{ groups: { $exists: false } }, { groups: null }] },
      { $set: { groups: [] } }
    );

    // ✅ Safely push group ID into user document
    const userUpdateResult = await db.collection('users').updateOne(
      userQuery,
      { $push: { groups: result.insertedId } }
    );

    if (userUpdateResult.matchedCount === 0) {
      console.error('User not found with ID:', owner);
      return NextResponse.json(
        { error: 'User not found', details: 'Could not update user groups array' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      groupId: result.insertedId.toString(),
      groupCode,
      message: 'Group created successfully',
    });
  } catch (err) {
    console.error('Error creating group:', err);
    return NextResponse.json(
      { error: 'Internal server error', details: err.message },
      { status: 500 }
    );
  }
}
