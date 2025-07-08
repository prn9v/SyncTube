import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function PUT(req) {
  try {
    const { userId, name, username, bio, location } = await req.json();

    // Validate required fields
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db();

    // Convert userId to ObjectId
    let userObjectId;
    try {
      userObjectId = new ObjectId(userId);
    } catch (e) {
      return NextResponse.json(
        { error: 'Invalid user ID format' },
        { status: 400 }
      );
    }

    // Check if user exists
    const existingUser = await db.collection('users').findOne({ _id: userObjectId });
    if (!existingUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if username is already taken by another user
    if (username && username !== existingUser.username) {
      const usernameExists = await db.collection('users').findOne({ 
        username: username,
        _id: { $ne: userObjectId } // Exclude current user
      });
      
      if (usernameExists) {
        return NextResponse.json(
          { error: 'Username is already taken' },
          { status: 409 }
        );
      }
    }

    // Prepare update object with only provided fields
    const updateFields = {};
    if (name !== undefined) updateFields.name = name;
    if (username !== undefined) updateFields.username = username;
    if (bio !== undefined) updateFields.bio = bio;
    if (location !== undefined) updateFields.location = location;
    
    // Add updatedAt timestamp
    updateFields.updatedAt = new Date();

    // Update user in database
    const result = await db.collection('users').updateOne(
      { _id: userObjectId },
      { $set: updateFields }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Fetch updated user data
    const updatedUser = await db.collection('users').findOne({ _id: userObjectId });

    return NextResponse.json({
      message: 'Profile updated successfully',
    });

  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 