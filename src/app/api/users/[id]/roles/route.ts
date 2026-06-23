import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    if (!Array.isArray(body.roleIds)) {
      return NextResponse.json({ error: 'roleIds must be an array' }, { status: 400 });
    }

    const userIndex = db.users.findIndex((u) => u.id === id);
    if (userIndex === -1) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Verify that all roleIds exist
    const validRoleIds = db.roles.map(r => r.id);
    const allValid = body.roleIds.every((rId: string) => validRoleIds.includes(rId));
    
    if (!allValid) {
      return NextResponse.json({ error: 'One or more role IDs are invalid' }, { status: 400 });
    }

    db.users[userIndex].roleIds = body.roleIds;

    return NextResponse.json(db.users[userIndex]);
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
