import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export async function GET() {
  try {
    // Query untuk menghitung jumlah kejadian per jenis kejahatan
    const result = await pool.query(`
      WITH type_counts AS (
        SELECT 
          t.name as type,
          COUNT(ci.id) as count,
          COUNT(ci.id) * 100.0 / SUM(COUNT(ci.id)) OVER () as percentage
        FROM crime_incidents ci
        JOIN types t ON ci.type_id = t.id
        GROUP BY t.name
        ORDER BY COUNT(ci.id) DESC
        LIMIT 5
      )
      SELECT 
        type,
        count,
        ROUND(CAST(percentage as numeric), 1) as percentage
      FROM type_counts
      ORDER BY count DESC
    `);
    
    // Jika tidak ada data, kembalikan array kosong
    const crimeTypes = result.rows.map(row => ({
      type: row.type,
      count: parseInt(row.count),
      percentage: parseFloat(row.percentage)
    }));
    
    return NextResponse.json(crimeTypes);
    
  } catch (error) {
    console.error('Error fetching top crime types:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch top crime types',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}