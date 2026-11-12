
import { NextResponse } from 'next/server';
import { timingSafeEqual } from 'node:crypto';
import pool from '../../../../services/db.js';

export const runtime = 'nodejs';

export async function POST(request) {
  try {
    const { correo, password } = await request.json();

    if (
      typeof correo !== 'string' ||
      typeof password !== 'string' ||
      !correo.trim() ||
      !password
    ) {
      return NextResponse.json(
        { error: 'Completa todos los campos.' },
        { status: 400 }
      );
    }

    const [usuarios] = await pool.execute(
      `SELECT id, nombre, correo, password_hash, rol_id, activo
       FROM usuarios
       WHERE correo = ?
       LIMIT 1`,
      [correo.trim()]
    );

    const usuario = usuarios[0];

    if (
      !usuario ||
      Number(usuario.activo) !== 1 ||
      Number(usuario.rol_id) !== 1
    ) {
      return NextResponse.json(
        { error: 'Correo o contraseña incorrectos.' },
        { status: 401 }
      );
    }

    // Comparar la contraseña almacenada en texto plano.
    const guardada = Buffer.from(String(usuario.password_hash));
    const recibida = Buffer.from(password);

    const passwordCorrecta =
      guardada.length === recibida.length &&
      timingSafeEqual(guardada, recibida);

    if (!passwordCorrecta) {
      return NextResponse.json(
        { error: 'Correo o contraseña incorrectos.' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      redirect: '/panel-de-control',
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        correo: usuario.correo,
      },
    });

  } catch (error) {
    console.error('Error al iniciar sesión:', error);

    return NextResponse.json(
      { error: 'Error interno del servidor.' },
      { status: 500 }
    );
  }
}
