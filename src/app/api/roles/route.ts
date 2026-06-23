import { NextResponse } from 'next/server';
import { db, Role } from '@/lib/db';

export async function GET() {
  return NextResponse.json(db.roles);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Basic validation
    if (!body.name || !body.permissions) {
      return NextResponse.json({ error: 'Name and permissions are required' }, { status: 400 });
    }

    const newRole: Role = {
      id: `r_${Date.now()}`,
      name: body.name,
      description: body.description || '',
      isSystem: false,
      permissions: body.permissions,
    };

    db.roles.push(newRole);

    return NextResponse.json(newRole, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
