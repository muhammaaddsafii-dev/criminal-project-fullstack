// app/api/crime-incidents/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';

// Interface untuk params yang sudah di-unwrap
interface RouteParams {
  params: {
    id: string;
  };
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    // Unwrap params
    const { id } = await Promise.resolve(params);
    
    const query = `
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
    
    const result = await pool.query(query, [id]);
    
    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Incident not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching incident:', error);
    return NextResponse.json(
      { error: 'Failed to fetch incident' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    // Unwrap params
    const { id } = await Promise.resolve(params);
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

    // Check if incident exists
    const checkQuery = 'SELECT id FROM crime_incidents WHERE id = $1';
    const checkResult = await pool.query(checkQuery, [id]);
    
    if (checkResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Incident not found' },
        { status: 404 }
      );
    }

    const query = `
      UPDATE crime_incidents
      SET 
        incident_code = $1,
        area_id = $2,
        location = ST_SetSRID(ST_MakePoint($3, $4), 4326),
        address = $5,
        incident_date = $6,
        incident_time = $7,
        type_id = $8,
        severity_level = $9,
        description = $10,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $11
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
      id,
    ];

    console.log('Update query values:', values);

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
    
    const fullResult = await pool.query(fullQuery, [id]);
    
    return NextResponse.json(fullResult.rows[0]);
  } catch (error: any) {
    console.error('Error updating incident:', error);
    
    if (error.code === '23505') {
      return NextResponse.json(
        { error: 'Incident code already exists' },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to update incident: ' + error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    // Unwrap params
    const { id } = await Promise.resolve(params);
    
    // Check if incident exists
    const checkQuery = 'SELECT id FROM crime_incidents WHERE id = $1';
    const checkResult = await pool.query(checkQuery, [id]);
    
    if (checkResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Incident not found' },
        { status: 404 }
      );
    }

    const query = 'DELETE FROM crime_incidents WHERE id = $1';
    await pool.query(query, [id]);
    
    return NextResponse.json({ message: 'Incident deleted successfully' });
  } catch (error) {
    console.error('Error deleting incident:', error);
    return NextResponse.json(
      { error: 'Failed to delete incident' },
      { status: 500 }
    );
  }
}