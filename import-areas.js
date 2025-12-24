const {
  Client
} = require('pg');
const {
  geoJsonData
} = require('./dist/areaData'); // sesuaikan path-nya

async function main() {
  const client = new Client({
    host: '127.0.0.1',
    port: 5432,
    user: 'postgres',
    password: '1sampai8',
    database: 'kriminalitas_db',
  });

  await client.connect();

  for (const f of geoJsonData.features) {
    const p = f.properties;
    const geomJson = JSON.stringify(f.geometry); // langsung GeoJSON

    // await client.query(
    //   `
    //   INSERT INTO areas (
    //     id, metadata, srs_id, wadmkc, wadmkd, wadmkk, wadmpr, uupp,
    //     luas, kecamatan_id, desa_id, geom
    //   )
    //   VALUES (
    //     $1,$2,$3,$4,$5,$6,$7,$8,$9,
    //     $10,$11, ST_SetSRID(ST_GeomFromGeoJSON($12), 4326)
    //   )
    //   ON CONFLICT (id) DO NOTHING
    //   `,
    //   [
    //     p.id,
    //     p.METADATA,
    //     p.SRS_ID,
    //     p.WADMKC,
    //     p.WADMKD,
    //     p.WADMKK,
    //     p.WADMPR,
    //     p.UUPP,
    //     parseFloat(p.LUAS),
    //     p.kecamatan_id,
    //     p.desa_id,
    //     geomJson,
    //   ]
    // );
    await client.query(
      `
  INSERT INTO areas (
    external_id, metadata, srs_id, wadmkc, wadmkd, wadmkk, wadmpr, uupp,
    luas, kecamatan_id, desa_id, geom
  )
  VALUES (
    $1,$2,$3,$4,$5,$6,$7,$8,$9,
    $10,$11, ST_SetSRID(ST_GeomFromGeoJSON($12), 4326)
  )
  ON CONFLICT (external_id) DO NOTHING
  `,
      [
        String(p.id),
        p.METADATA || null,
        p.SRS_ID || null,
        p.WADMKC || null,
        p.WADMKD || null,
        p.WADMKK || null,
        p.WADMPR || null,
        p.UUPP || null,
        p.LUAS ? parseFloat(p.LUAS) : null,
        parseInt(p.kecamatan_id),
        parseInt(p.desa_id),
        geomJson,
      ]
    );
  }

  await client.end();
}

main().catch(console.error);