import { db } from '../lib/db';
import { profiles } from '../lib/db/schema';
import { eq } from 'drizzle-orm';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function createAdmin() {
  const adminEmail = 'jonatan@fint.app';
  const adminUserId = 'c6c22426-5e6e-4fa8-9d79-45e7e83864a9'; // El ID del usuario de Supabase Auth

  console.log('🔧 Creando perfil de administrador...\n');

  try {
    const result = await db.insert(profiles).values({
      id: adminUserId,
      email: adminEmail,
      name: 'Jonatan',
      role: 'ADMIN',
    }).returning();

    console.log('✅ Perfil de admin creado exitosamente:', result[0]);
  } catch (error: any) {
    if (error.code === '23505') {
      console.log('ℹ️  El perfil ya existe. Actualizando a ADMIN...');

      // Actualizar a ADMIN si ya existe
      const updated = await db.update(profiles)
        .set({ role: 'ADMIN' })
        .where(eq(profiles.id, adminUserId))
        .returning();

      console.log('✅ Perfil actualizado:', updated[0]);
    } else {
      console.error('❌ Error creando admin:', error);
      throw error;
    }
  }

  process.exit(0);
}

createAdmin();
