import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { Paper } from '@/types/paper';

// GET a single paper
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const db = await getDatabase();
    const paper = await db
      .collection<Paper>('papers')
      .findOne({ _id: new ObjectId(params.id) });

    if (!paper) {
      return NextResponse.json(
        { success: false, error: 'Paper not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: paper });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// PATCH/UPDATE a paper
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const db = await getDatabase();

    const updateData: any = { ...body };
    
    // If status is being updated to 'reviewed', set reviewedAt
    if (body.status === 'reviewed' && body.reviewedBy) {
      updateData.reviewedAt = new Date();
    }

    delete updateData._id; // Don't update _id

    const result = await db
      .collection<Paper>('papers')
      .findOneAndUpdate(
        { _id: new ObjectId(params.id) },
        { $set: updateData },
        { returnDocument: 'after' }
      );

    if (!result) {
      return NextResponse.json(
        { success: false, error: 'Paper not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// DELETE a paper
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const db = await getDatabase();
    const result = await db
      .collection<Paper>('papers')
      .deleteOne({ _id: new ObjectId(params.id) });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { success: false, error: 'Paper not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, message: 'Paper deleted' });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
