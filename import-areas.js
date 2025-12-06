const { Client } = require('pg');
const { geoJsonData } = require('./dist/mockData'); // sesuaikan path-nya

async function main() {
  const client = new Client({
    host: '127.0.0.1',
    port: 5432,
    user: 'postgres',
    password: '1sampai8',
    database: 'criminaldb',
  });

  await client.connect();

  for (const f of geoJsonData.features) {
    const p = f.properties;
    const geomJson = JSON.stringify(f.geometry); // langsung GeoJSON

    await client.query(
      `
      INSERT INTO areas (
        id, namobj, metadata, srs_id, wadmkc, wadmkd, wadmkk, wadmpr, uupp,
        luas, pddk_lk, pddk_pr, jmlh_pddk, kpdt_pddk,
        name, crime_count, crime_rate, color, geom
      )
      VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,
        $10,$11,$12,$13,$14,
        $15,$16,$17,$18,
        ST_SetSRID(ST_GeomFromGeoJSON($19), 4326)
      )
      ON CONFLICT (id) DO NOTHING
      `,
      [
        p.id,
        p.NAMOBJ,
        p.METADATA,
        p.SRS_ID,
        p.WADMKC,
        p.WADMKD,
        p.WADMKK,
        p.WADMPR,
        p.UUPP,
        parseFloat(p.LUAS),
        parseInt(p.Pddk_Lk || '0'),
        parseInt(p.Pddk_Pr || '0'),
        parseInt(p.Jmlh_Pddk || '0'),
        parseFloat(p.Kpdt_Pddk || '0'),
        p.name,
        p.crimeCount,
        p.crimeRate,
        p.color,
        geomJson,
      ]
    );
  }

  await client.end();
}

main().catch(console.error);
