import { NextRequest, NextResponse } from "next/server";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function GET(request: NextRequest) {
  try {
    const client = await pool.connect();
    
    const result = await client.query(`
      SELECT 
        ci.id,
        ci.incident_code,
        ci.area_id,
        ST_AsGeoJSON(ci.location) as location,
        ci.address,
        ci.incident_date,
        ci.incident_time,
        ci.severity_level,
        ci.description,
        t.name as type_name,
        a.name as area_name
      FROM crime_incidents ci
      JOIN types t ON ci.type_id = t.id
      JOIN areas a ON ci.area_id = a.id
      WHERE ci.location IS NOT NULL
      ORDER BY ci.incident_date DESC
    `);
    
    client.release();
    
    // Parse GeoJSON location
    const incidents = result.rows.map(row => ({
      ...row,
      location: row.location ? JSON.parse(row.location) : null
    }));
    
    return NextResponse.json(incidents);
  } catch (error) {
    console.error("Error fetching incidents:", error);
    return NextResponse.json(
      { error: "Failed to fetch incidents" },
      { status: 500 }
    );
  }
}