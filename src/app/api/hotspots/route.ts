import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export async function GET() {
  try {
    // Query untuk menghitung hotspot berdasarkan jumlah kejadian per area
    const result = await pool.query(`
      WITH area_stats AS (
        SELECT 
          a.id,
          a.name as area,
          COUNT(ci.id) as cases,
          ROUND(AVG(
            CASE ci.severity_level
              WHEN 'LOW' THEN 1
              WHEN 'MEDIUM' THEN 2
              WHEN 'HIGH' THEN 3
              WHEN 'CRITICAL' THEN 4
              ELSE 1
            END
          ), 1) as avg_severity
        FROM areas a
        LEFT JOIN crime_incidents ci ON a.id = ci.area_id
        GROUP BY a.id, a.name
        HAVING COUNT(ci.id) > 0
      ),
      trend_calc AS (
        SELECT 
          a.id,
          a.area,
          a.cases,
          a.avg_severity,
          -- Hitung trend berdasarkan jumlah kasus 30 hari terakhir vs 30 hari sebelumnya
          COALESCE(
            (
              SELECT COUNT(ci.id)
              FROM crime_incidents ci
              WHERE ci.area_id = a.id 
                AND ci.incident_date >= CURRENT_DATE - INTERVAL '30 days'
            ), 0
          ) as recent_cases,
          COALESCE(
            (
              SELECT COUNT(ci.id)
              FROM crime_incidents ci
              WHERE ci.area_id = a.id 
                AND ci.incident_date >= CURRENT_DATE - INTERVAL '60 days'
                AND ci.incident_date < CURRENT_DATE - INTERVAL '30 days'
            ), 0
          ) as previous_cases
        FROM area_stats a
      )
      SELECT 
        area,
        cases,
        avg_severity,
        CASE 
          WHEN recent_cases > previous_cases THEN 'up'
          WHEN recent_cases < previous_cases THEN 'down'
          ELSE 'stable'
        END as trend
      FROM trend_calc
      ORDER BY cases DESC, avg_severity DESC
      LIMIT 6
    `);
    
    // Format data untuk response
    const hotspots = result.rows.map(row => ({
      area: row.area,
      cases: parseInt(row.cases) || 0,
      trend: row.trend,
      avgSeverity: parseFloat(row.avg_severity) || 0
    }));
    
    return NextResponse.json(hotspots);
    
  } catch (error) {
    console.error('Error fetching hotspots:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch hotspots',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}