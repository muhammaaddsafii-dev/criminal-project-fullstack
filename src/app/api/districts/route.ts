import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export async function GET() {
  try {
    console.log('Fetching districts from database...');
    
    // Query untuk mengambil semua area yang ada
    const result = await pool.query(`
      SELECT DISTINCT name as district 
      FROM areas 
      WHERE name IS NOT NULL AND name != ''
      ORDER BY name
    `);
    
    console.log('Query result:', result.rows);
    
    // Format response
    const districts = result.rows.map(row => ({
      district: row.district
    }));
    
    console.log('Formatted districts:', districts);
    
    return NextResponse.json(districts);
    
  } catch (error) {
    console.error('Error fetching districts:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch districts',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}