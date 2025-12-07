import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const district = searchParams.get('district') || 'all';
    const status = searchParams.get('status') || 'all';
    const type = searchParams.get('type') || 'all';
    const severity = searchParams.get('severity') || 'all';

    console.log('API Params:', { search, district, status, type, severity });

    // Query dasar dengan JOIN ke tabel areas dan types
    let query = `
      SELECT 
        ci.id,
        a.name as district,
        t.name as type,
        ci.address as location,
        ci.incident_date as date,
        ci.severity_level as severity,
        ci.incident_code as "reportNumber"
      FROM crime_incidents ci
      JOIN areas a ON ci.area_id = a.id
      JOIN types t ON ci.type_id = t.id
      WHERE 1=1
    `;

    const params: any[] = [];
    let paramIndex = 1;

    // Filter berdasarkan search (lokasi atau nomor laporan)
    if (search) {
      query += ` AND (ci.address ILIKE $${paramIndex} OR ci.incident_code ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    // Filter berdasarkan wilayah
    if (district !== 'all') {
      query += ` AND a.name = $${paramIndex}`;
      params.push(district);
      paramIndex++;
    }

    // Filter berdasarkan jenis kejahatan
    if (type !== 'all') {
      query += ` AND t.name = $${paramIndex}`;
      params.push(type);
      paramIndex++;
    }

    // Filter berdasarkan severity level
    if (severity !== 'all') {
      query += ` AND ci.severity_level = $${paramIndex}`;
      params.push(severity);
      paramIndex++;
    }

    query += ` ORDER BY ci.incident_date DESC LIMIT 100`;

    console.log('Executing query:', query);
    console.log('With params:', params);

    const result = await pool.query(query, params);
    
    console.log(`Found ${result.rows.length} rows`);
    
    return NextResponse.json({
      data: result.rows,
      total: result.rowCount
    });
    
  } catch (error) {
    console.error('Error fetching crime data:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch crime data', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}