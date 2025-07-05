import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import User from '@/models/User';

export async function GET(req, context) {
  try {
    const { id } = context.params;

    const client = await clientPromise;
    const db = client.db();

    if (!id) {
      return NextResponse.json({ error: 'Missing groupId' }, { status: 400 });
    }

    let group;
    try {
      group = await db.collection('group').findOne({ inviteCode: id });
    } catch (e) {
      console.error('Database query error:', e);
      return NextResponse.json({ error: 'Database query failed' }, { status: 500 });
    }

    if (!group) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 });
    }

    // Fetch user details for all members
    let memberIds = group.members || [];
    let memberDetails = [];
    
    if (memberIds.length > 0) {
      // Convert to ObjectIds if they aren't already
      const validIds = [];
      for (const id of memberIds) {
        if (typeof id === 'string' && ObjectId.isValid(id)) {
          validIds.push(new ObjectId(id));
        } else if (typeof id === 'object' && id instanceof ObjectId) {
          validIds.push(id);
        } else {
          console.warn(`Invalid ObjectId format: ${id}`);
        }
      }


      if (validIds.length > 0) {
        try {
          
          if (memberDetails.length === 0) {
            memberDetails = await db.collection('users').find({ _id: { $in: validIds } }).toArray();
          }
        } catch (e) {
          console.error('Error fetching member details:', e);
        }
      }
    }

    // Convert ObjectIds to strings for frontend
    const serializedGroup = {
      ...group,
      _id: group._id.toString(),
      admin: group.admin ? group.admin.toString() : null,
      owner: group.owner ? group.owner.toString() : null,
      members: memberDetails.map(u => ({
        _id: u._id.toString(),
        name: (u.firstName && u.lastName) ? `${u.firstName} ${u.lastName}` : u.name || u.username || 'Unknown User',
        username: u.username || '',
        email: u.email || ''
      })),
      // Handle other potential ObjectId fields
      queue: Array.isArray(group.queue)
        ? group.queue.map(item => ({
            ...item,
            _id: item._id ? item._id.toString() : undefined,
            userId: item.userId ? item.userId.toString() : undefined
          }))
        : [],
      messages: Array.isArray(group.messages)
        ? group.messages.map(msg => ({
            ...msg,
            _id: msg._id ? msg._id.toString() : undefined,
            userId: msg.userId ? msg.userId.toString() : undefined,
            sender: msg.sender ? msg.sender.toString() : msg.sender
          }))
        : []
    };

    return NextResponse.json({ group: serializedGroup });
  } catch (err) {
    console.error('Error fetching group:', err);
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
    }, { status: 500 });
  }
}

export async function PUT(req, context) {
    try {
        const { id } = context.params;
        const { userId } = await req.json();

        if (!id || !userId) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const client = await clientPromise;
        const db = client.db();

        // Find group by inviteCode
        const group = await db.collection('group').findOne({ inviteCode: id });
        if (!group) {
            return NextResponse.json({ error: 'Group not found' }, { status: 404 });
        }

        // Ensure userId is an ObjectId
        let userObjectId;
        try {
            userObjectId = typeof userId === 'string' ? new ObjectId(userId) : userId;
        } catch (e) {
            return NextResponse.json({ error: 'Invalid userId format' }, { status: 400 });
        }

        // Check if user exists
        const userExists = await db.collection('users').findOne({ _id: userObjectId });
        if (!userExists) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Check if user is already a member
        const isAlreadyMember = group.members?.some(memberId => 
            memberId.toString() === userObjectId.toString()
        );
        
        if (isAlreadyMember) {
            return NextResponse.json({ error: 'User is already a member' }, { status: 400 });
        }

        // Add user to group members
        await db.collection('group').updateOne(
            { _id: group._id },
            { $addToSet: { members: userObjectId } } 
        );

        // Add group to user's groups
        await db.collection('users').updateOne(
            { _id: userObjectId },
            { $addToSet: { groups: group._id } } // Use $addToSet to prevent duplicates
        );

        return NextResponse.json({ success: true, groupId: group._id.toString() });
    } catch (err) {
        console.error('Error joining group:', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function POST(req, context) {
  try {
    const { id } = context.params;
    const { sender, content } = await req.json();

    if (!id || !sender || !content) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();

    // Find group by inviteCode
    const group = await db.collection('group').findOne({ inviteCode: id });
    if (!group) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 });
    }

    // Convert sender to ObjectId if it's a string
    const senderObjectId = typeof sender === 'string' ? new ObjectId(sender) : sender;

    // Verify sender is a member of the group
    const isMember = group.members?.some(memberId => 
      memberId.toString() === senderObjectId.toString()
    );
    
    if (!isMember) {
      return NextResponse.json({ error: 'Sender is not a member of this group' }, { status: 403 });
    }

    // Create message object
    const message = {
      _id: new ObjectId(), // Generate a unique ID for the message
      sender: senderObjectId,
      content: content.trim(),
      timestamp: new Date()
    };

    // Push message to group's messages array
    await db.collection('group').updateOne(
      { _id: group._id },
      { $push: { messages: message } }
    );

    // Return the new message with serialized ObjectIds
    const serializedMessage = {
      _id: message._id.toString(),
      sender: message.sender.toString(),
      content: message.content,
      timestamp: message.timestamp
    };

    return NextResponse.json({ message: serializedMessage });
  } catch (err) {
    console.error('Error sending message:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(req, context) {
  try {
    const { id } = context.params;
    const { song, userId } = await req.json();

    if (!id || !song || !song.title || !song.artist) {
      return NextResponse.json({ error: 'Missing required song fields' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();

    // Find group by inviteCode
    const group = await db.collection('group').findOne({ inviteCode: id });
    if (!group) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 });
    }

    // If userId is provided, verify they're a member
    if (userId) {
      const userObjectId = typeof userId === 'string' ? new ObjectId(userId) : userId;
      const isMember = group.members?.some(memberId => 
        memberId.toString() === userObjectId.toString()
      );
      
      if (!isMember) {
        return NextResponse.json({ error: 'User is not a member of this group' }, { status: 403 });
      }
    }

    // Create song object with additional metadata
    const songToAdd = {
      _id: new ObjectId(), // Generate unique ID for the queue item
      ...song,
      userId: userId ? (typeof userId === 'string' ? new ObjectId(userId) : userId) : null,
      addedAt: new Date()
    };

    // Push song to group's queue array
    await db.collection('group').updateOne(
      { _id: group._id },
      { $push: { queue: songToAdd } }
    );

    // Return the added song with serialized ObjectIds
    const serializedSong = {
      ...songToAdd,
      _id: songToAdd._id.toString(),
      userId: songToAdd.userId ? songToAdd.userId.toString() : null
    };

    return NextResponse.json({ song: serializedSong });
  } catch (err) {
    console.error('Error adding song to queue:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}