import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import User from "@/models/User";

/**
 * ✅ GET: Fetch group details by inviteCode
 */
export async function GET(req, context) {
  try {
    const { id } = await context.params; // ✅ Must await in Next.js 14

    const client = await clientPromise;
    const db = client.db();

    if (!id) {
      return NextResponse.json({ error: "Missing groupId" }, { status: 400 });
    }

    const group = await db.collection("group").findOne({ inviteCode: id });
    if (!group) {
      return NextResponse.json({ error: "Group not found" }, { status: 404 });
    }

    // Fetch detailed user info for members
    const memberIds = group.members || [];
    let memberDetails = [];

    if (memberIds.length > 0) {
      const validIds = memberIds
        .map((m) => (ObjectId.isValid(m) ? new ObjectId(m) : null))
        .filter(Boolean);

      if (validIds.length > 0) {
        memberDetails = await db
          .collection("users")
          .find({ _id: { $in: validIds } })
          .toArray();
      }
    }

    // Convert ObjectIds to strings
    const serializedGroup = {
      ...group,
      _id: group._id.toString(),
      admin: group.admin ? group.admin.toString() : null,
      owner: group.owner ? group.owner.toString() : null,
      members: memberDetails.map((u) => ({
        _id: u._id.toString(),
        name:
          u.firstName && u.lastName
            ? `${u.firstName} ${u.lastName}`
            : u.name || u.username || "Unknown User",
        username: u.username || "",
        email: u.email || "",
      })),
      queue: Array.isArray(group.queue)
        ? group.queue.map((item) => ({
            ...item,
            _id: item._id?.toString(),
            userId: item.userId?.toString(),
          }))
        : [],
      messages: Array.isArray(group.messages)
        ? group.messages.map((msg) => ({
            ...msg,
            _id: msg._id?.toString(),
            userId: msg.userId?.toString(),
            sender: msg.sender?.toString(),
          }))
        : [],
    };

    return NextResponse.json({ group: serializedGroup });
  } catch (err) {
    console.error("Error fetching group:", err);
    return NextResponse.json(
      {
        error: "Internal server error",
        details:
          process.env.NODE_ENV === "development"
            ? err.message
            : "Something went wrong",
      },
      { status: 500 }
    );
  }
}

/**
 * ✅ PUT: Join a group by inviteCode
 */
export async function PUT(req, context) {
  try {
    const { id } = await context.params;
    const { userId } = await req.json();

    if (!id || !userId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db();

    const group = await db.collection("group").findOne({ inviteCode: id });
    if (!group) {
      return NextResponse.json({ error: "Group not found" }, { status: 404 });
    }

    const userObjectId =
      typeof userId === "string" ? new ObjectId(userId) : userId;

    const userExists = await db
      .collection("users")
      .findOne({ _id: userObjectId });
    if (!userExists) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const isAlreadyMember = group.members?.some(
      (m) => m.toString() === userObjectId.toString()
    );
    if (isAlreadyMember) {
      return NextResponse.json(
        { error: "User is already a member" },
        { status: 400 }
      );
    }

    // ✅ Add user to group's members
    await db
      .collection("group")
      .updateOne({ _id: group._id }, { $addToSet: { members: userObjectId } });

    // ✅ Ensure user's `groups` field exists and is an array
    await db.collection("users").updateOne(
      { _id: userObjectId, groups: { $exists: false } },
      { $set: { groups: [] } }
    );
    await db.collection("users").updateOne(
      { _id: userObjectId, groups: null },
      { $set: { groups: [] } }
    );

    // ✅ Add group to user's `groups`
    await db.collection("users").updateOne(
      { _id: userObjectId },
      { $addToSet: { groups: group._id } }
    );

    return NextResponse.json({ success: true, groupId: group._id.toString() });
  } catch (err) {
    console.error("Error joining group:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * ✅ POST: Send a chat message
 */
export async function POST(req, context) {
  try {
    const { id } = await context.params;
    const { sender, content } = await req.json();

    if (!id || !sender || !content?.trim()) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db();

    const group = await db.collection("group").findOne({ inviteCode: id });
    if (!group) {
      return NextResponse.json({ error: "Group not found" }, { status: 404 });
    }

    const senderObjectId =
      typeof sender === "string" ? new ObjectId(sender) : sender;

    const isMember = group.members?.some(
      (m) => m.toString() === senderObjectId.toString()
    );
    if (!isMember) {
      return NextResponse.json(
        { error: "Sender is not a member of this group" },
        { status: 403 }
      );
    }

    const message = {
      _id: new ObjectId(),
      sender: senderObjectId,
      content: content.trim(),
      timestamp: new Date(),
    };

    await db
      .collection("group")
      .updateOne({ _id: group._id }, { $push: { messages: message } });

    return NextResponse.json({
      message: {
        _id: message._id.toString(),
        sender: message.sender.toString(),
        content: message.content,
        timestamp: message.timestamp,
      },
    });
  } catch (err) {
    console.error("Error sending message:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * ✅ PATCH: Add song to queue
 */
export async function PATCH(req, context) {
  try {
    const { id } = await context.params;
    const { song, userId } = await req.json();

    if (!id || !song || !song.title || !song.artist) {
      return NextResponse.json(
        { error: "Missing required song fields" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db();

    const group = await db.collection("group").findOne({ inviteCode: id });
    if (!group) {
      return NextResponse.json({ error: "Group not found" }, { status: 404 });
    }

    if (userId) {
      const userObjectId =
        typeof userId === "string" ? new ObjectId(userId) : userId;
      const isMember = group.members?.some(
        (m) => m.toString() === userObjectId.toString()
      );
      if (!isMember) {
        return NextResponse.json(
          { error: "User is not a member of this group" },
          { status: 403 }
        );
      }
    }

    const songToAdd = {
      _id: new ObjectId(),
      ...song,
      userId: userId
        ? typeof userId === "string"
          ? new ObjectId(userId)
          : userId
        : null,
      addedAt: new Date(),
    };

    await db
      .collection("group")
      .updateOne({ _id: group._id }, { $push: { queue: songToAdd } });

    return NextResponse.json({
      song: {
        ...songToAdd,
        _id: songToAdd._id.toString(),
        userId: songToAdd.userId ? songToAdd.userId.toString() : null,
      },
    });
  } catch (err) {
    console.error("Error adding song to queue:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
