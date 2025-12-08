// app/api/crime-incidents/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search') || '';
    
    let query = `
      SELECT 
        ci.*,
        a.name as area_name,
        t.name as type_name,
        ST_Y(ci.location::geometry) as lat,
        ST_X(ci.location::geometry) as lng
      FROM crime_incidents ci
      LEFT JOIN areas a ON ci.area_id = a.id
      LEFT JOIN types t ON ci.type_id = t.id
      WHERE 1=1
    `;
    
    const params: any[] = [];
    let paramCount = 0;
    
    if (search) {
      paramCount++;
      query += ` AND (ci.incident_code ILIKE $${paramCount} OR ci.address ILIKE $${paramCount} OR a.name ILIKE $${paramCount})`;
      params.push(`%${search}%`);
    }
    
    query += ` ORDER BY ci.incident_date DESC, ci.incident_time DESC`;
    
    console.log('Query:', query);
    console.log('Params:', params);
    
    const result = await pool.query(query, params);
    console.log('Result rows:', result.rows.length);
    
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Error fetching incidents:', error);
    return NextResponse.json(
      { error: 'Failed to fetch incidents' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      incident_code,
      area_id,
      location,
      address,
      incident_date,
      incident_time,
      type_id,
      severity_level,
      description,
    } = body;

    // Validasi
    if (!incident_code || !area_id || !location || !address || !incident_date || !type_id) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const query = `
      INSERT INTO crime_incidents (
        incident_code,
        area_id,
        location,
        address,
        incident_date,
        incident_time,
        type_id,
        severity_level,
        description,
        reported_at
      ) VALUES ($1, $2, ST_SetSRID(ST_MakePoint($3, $4), 4326), $5, $6, $7, $8, $9, $10, CURRENT_TIMESTAMP)
      RETURNING *
    `;

    const values = [
      incident_code,
      area_id,
      location.lng,
      location.lat,
      address,
      incident_date,
      incident_time || null,
      type_id,
      severity_level || 'MEDIUM',
      description || null,
    ];

    console.log('Insert values:', values);

    const result = await pool.query(query, values);
    
    // Get the full record with joins
    const fullQuery = `
      SELECT 
        ci.*,
        a.name as area_name,
        t.name as type_name,
        ST_Y(ci.location::geometry) as lat,
        ST_X(ci.location::geometry) as lng
      FROM crime_incidents ci
      LEFT JOIN areas a ON ci.area_id = a.id
      LEFT JOIN types t ON ci.type_id = t.id
      WHERE ci.id = $1
    `;
    
    const fullResult = await pool.query(fullQuery, [result.rows[0].id]);
    
    return NextResponse.json(fullResult.rows[0], { status: 201 });
  } catch (error: any) {
    console.error('Error creating incident:', error);
    
    // Handle duplicate incident_code
    if (error.code === '23505') {
      return NextResponse.json(
        { error: 'Incident code already exists' },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to create incident: ' + error.message },
      { status: 500 }
    );
  }
}