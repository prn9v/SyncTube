import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function DELETE(req, context) {
    try {
        const { id } = context.params;
        const { song } = await req.json();

        if (!id || !song) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        if (!song._id) {
            return NextResponse.json({ error: 'Song must have an _id field' }, { status: 400 });
        }

        const client = await clientPromise;
        const db = client.db();

        // Find group by inviteCode
        const group = await db.collection('group').findOne({ inviteCode: id });
        if (!group) {
            return NextResponse.json({ error: 'Group not found' }, { status: 404 });
        }

        // Remove song from queue using song _id for more reliable matching
        const result = await db.collection('group').updateOne(
            { _id: group._id },
            { $pull: { queue: { _id: new ObjectId(song._id) } } }
        );

        if (result.modifiedCount === 0) {
            return NextResponse.json({ error: 'Song not found in queue' }, { status: 404 });
        }

        return NextResponse.json({ success: true, message: 'Song removed from queue' });
    } catch (err) {
        console.error('Error removing song from queue:', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}