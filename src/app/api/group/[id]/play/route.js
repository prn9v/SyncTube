import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function POST(req, context) {
    try {
        const { id } = context.params;
        const { song } = await req.json();

        if (!id || !song) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const client = await clientPromise;
        const db = client.db();

        // Find group by inviteCode
        const group = await db.collection('group').findOne({ inviteCode: id });
        if (!group) {
            return NextResponse.json({ error: 'Group not found' }, { status: 404 });
        }

        // Update the currently playing song
        await db.collection('group').updateOne(
            { _id: group._id },
            { $set: { currentlyPlaying: song } }
        );

        return NextResponse.json({ success: true, message: 'Now playing song', song });
    } catch (err) {
        console.error('Error playing song:', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
} 