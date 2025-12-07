import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export async function GET() {
  try {
    // Query untuk menghitung total kriminalitas per wilayah
    const result = await pool.query(`
      WITH district_stats AS (
        SELECT 
          a.id,
          a.name as district_name,
          COUNT(ci.id) as total_crimes,
          -- Hitung kasus berdasarkan severity
          COUNT(CASE WHEN ci.severity_level = 'CRITICAL' THEN ci.id END) as critical_cases,
          COUNT(CASE WHEN ci.severity_level = 'HIGH' THEN ci.id END) as high_cases,
          COUNT(CASE WHEN ci.severity_level = 'MEDIUM' THEN ci.id END) as medium_cases,
          COUNT(CASE WHEN ci.severity_level = 'LOW' THEN ci.id END) as low_cases,
          -- Hitung kasus 30 hari terakhir untuk trend
          COUNT(CASE WHEN ci.incident_date >= CURRENT_DATE - INTERVAL '30 days' THEN ci.id END) as last_30_days,
          -- Rata-rata severity
          ROUND(AVG(
            CASE ci.severity_level
              WHEN 'LOW' THEN 1
              WHEN 'MEDIUM' THEN 2
              WHEN 'HIGH' THEN 3
              WHEN 'CRITICAL' THEN 4
              ELSE 1
            END
          ), 2) as avg_severity
        FROM areas a
        LEFT JOIN crime_incidents ci ON a.id = ci.area_id
        GROUP BY a.id, a.name
        ORDER BY total_crimes DESC
        LIMIT 10 -- Batasi ke 10 wilayah teratas
      )
      SELECT 
        district_name as name,
        total_crimes as total,
        critical_cases,
        high_cases,
        medium_cases,
        low_cases,
        last_30_days,
        avg_severity
      FROM district_stats
      WHERE total_crimes > 0
      ORDER BY total_crimes DESC
    `);
    
    // Format data untuk chart
    const districtData = result.rows.map(row => ({
      name: row.name,
      total: parseInt(row.total),
      critical: parseInt(row.critical_cases) || 0,
      high: parseInt(row.high_cases) || 0,
      medium: parseInt(row.medium_cases) || 0,
      low: parseInt(row.low_cases) || 0,
      last30Days: parseInt(row.last_30_days) || 0,
      avgSeverity: parseFloat(row.avg_severity) || 0,
      // Untuk tooltip yang lebih informatif
      details: {
        total: parseInt(row.total),
        critical: parseInt(row.critical_cases) || 0,
        high: parseInt(row.high_cases) || 0,
        medium: parseInt(row.medium_cases) || 0,
        low: parseInt(row.low_cases) || 0
      }
    }));
    
    // Hitung total semua kasus untuk informasi tambahan
    const totalStats = result.rows.reduce((acc, row) => {
      acc.totalCrimes += parseInt(row.total);
      acc.totalCritical += parseInt(row.critical_cases) || 0;
      acc.totalLast30Days += parseInt(row.last_30_days) || 0;
      return acc;
    }, { totalCrimes: 0, totalCritical: 0, totalLast30Days: 0 });
    
    return NextResponse.json({
      districts: districtData,
      summary: {
        totalDistricts: districtData.length,
        totalCrimes: totalStats.totalCrimes,
        totalCritical: totalStats.totalCritical,
        totalLast30Days: totalStats.totalLast30Days,
        avgCrimePerDistrict: totalStats.totalCrimes / (districtData.length || 1)
      }
    });
    
  } catch (error) {
    console.error('Error fetching district stats:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch district statistics',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}