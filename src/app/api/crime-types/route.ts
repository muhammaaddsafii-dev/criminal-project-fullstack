import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export async function GET() {
  try {
    const result = await pool.query(`
      SELECT name 
      FROM types 
      ORDER BY name
    `);
    
    return NextResponse.json(result.rows.map(row => row.name));
    
  } catch (error) {
    console.error('Error fetching crime types:', error);
    return NextResponse.json(
      { error: 'Failed to fetch crime types' },
      { status: 500 }
    );
  }
}