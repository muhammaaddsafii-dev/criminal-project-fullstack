import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export async function GET() {
  try {
    const result = await pool.query(`
      SELECT 
        ci.id,
        ci.incident_code as title,
        ci.address as location,
        ci.incident_date as date,
        t.name as type,
        ci.severity_level as severity
      FROM crime_incidents ci
      JOIN types t ON ci.type_id = t.id
      ORDER BY ci.incident_date DESC, ci.incident_time DESC
      LIMIT 5
    `);
    
    return NextResponse.json(result.rows);
    
  } catch (error) {
    console.error('Error fetching recent incidents:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch recent incidents',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}