import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';

export async function GET() {
  try {
    const db = await getDatabase();
    
    // Try to ping the database
    await db.command({ ping: 1 });
    
    return NextResponse.json({ 
      success: true, 
      message: 'MongoDB connection successful!',
      database: db.databaseName 
    });
  } catch (error: any) {
    console.error('MongoDB Connection Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message,
        details: error.toString()
      },
      { status: 500 }
    );
  }
}
