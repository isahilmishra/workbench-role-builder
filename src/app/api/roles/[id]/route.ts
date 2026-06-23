import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    const roleIndex = db.roles.findIndex((r) => r.id === id);
    
    if (roleIndex === -1) {
      return NextResponse.json({ error: 'Role not found' }, { status: 404 });
    }
    
    const existingRole = db.roles[roleIndex];
    
    // Check if trying to edit a system role's permissions
    if (existingRole.isSystem) {
      return NextResponse.json({ error: 'Cannot modify system role' }, { status: 403 });
    }

    const updatedRole = {
      ...existingRole,
      name: body.name || existingRole.name,
      description: body.description ?? existingRole.description,
      permissions: body.permissions || existingRole.permissions,
    };

    db.roles[roleIndex] = updatedRole;

    return NextResponse.json(updatedRole);
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const roleIndex = db.roles.findIndex((r) => r.id === id);
  
  if (roleIndex === -1) {
    return NextResponse.json({ error: 'Role not found' }, { status: 404 });
  }

  if (db.roles[roleIndex].isSystem) {
    return NextResponse.json({ error: 'Cannot delete system role' }, { status: 403 });
  }

  // Remove role from users before deleting
  db.users = db.users.map(user => ({
    ...user,
    roleIds: user.roleIds.filter(rId => rId !== id)
  }));

  db.roles.splice(roleIndex, 1);
  
  return new NextResponse(null, { status: 204 });
}
