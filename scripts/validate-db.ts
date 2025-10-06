import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { sql } from 'drizzle-orm';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const connectionString = process.env.DATABASE_URL!;

async function validateDB() {
  console.log('🔍 Validando conexión a la base de datos...\n');
  console.log('Connection string:', connectionString.replace(/:[^:]*@/, ':***@'));

  const client = postgres(connectionString, {
    prepare: false,
    max: 1,
  });

  const db = drizzle(client);

  try {
    // Test 1: Conexión básica
    console.log('\n✅ Test 1: Conexión básica');
    const result = await db.execute(sql`SELECT NOW() as now, current_database() as db`);
    console.log('   Conectado a:', result[0]);

    // Test 2: Listar tablas
    console.log('\n✅ Test 2: Listando tablas en public schema');
    const tables = await db.execute(sql`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    console.log('   Tablas encontradas:', tables.length);
    tables.forEach((t: any) => console.log('   -', t.table_name));

    // Test 3: Verificar tablas específicas
    console.log('\n✅ Test 3: Verificando tablas del schema');
    const expectedTables = ['pages', 'posts', 'sessions', 'stands', 'tickets', 'newsletter_subs', 'profiles', 'event_days', 'tracks', 'rooms'];

    for (const table of expectedTables) {
      const exists = await db.execute(sql`
        SELECT EXISTS (
          SELECT FROM information_schema.tables
          WHERE table_schema = 'public'
          AND table_name = ${table}
        ) as exists
      `);

      if (exists[0].exists) {
        const count = await db.execute(sql.raw(`SELECT COUNT(*) as count FROM "${table}"`));
        console.log(`   ✅ ${table}: ${count[0].count} registros`);
      } else {
        console.log(`   ❌ ${table}: NO EXISTE`);
      }
    }

    // Test 4: Verificar usuario actual
    console.log('\n✅ Test 4: Usuario de conexión');
    const user = await db.execute(sql`SELECT current_user, session_user`);
    console.log('   Usuario actual:', user[0]);

    console.log('\n✅ Validación completada exitosamente!\n');
  } catch (error) {
    console.error('\n❌ Error durante la validación:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

validateDB();
