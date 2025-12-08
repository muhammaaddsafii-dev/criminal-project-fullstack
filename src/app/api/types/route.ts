import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const query = 'SELECT id, name, description FROM types ORDER BY name';
    const result = await pool.query(query);
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Error fetching types:', error);
    return NextResponse.json(
      { error: 'Failed to fetch types' },
      { status: 500 }
    );
  }
}