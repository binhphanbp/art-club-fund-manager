import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Department } from '@prisma/client';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/dashboard';

  if (code) {
    const supabase = await createClient();

    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      const user = data.user;

      // Read department from user_metadata (set during signup)
      const metaDepartment = user.user_metadata?.department as string | undefined;
      const validDepartments: Department[] = ['SINGING', 'DANCE', 'RAP', 'INSTRUMENT'];
      const department: Department =
        metaDepartment && validDepartments.includes(metaDepartment as Department)
          ? (metaDepartment as Department)
          : Department.SINGING;

      // Check if user exists in our database
      const existingUser = await prisma.user.findUnique({
        where: { email: user.email! },
      });

      if (!existingUser) {
        // Create new user with status PENDING — awaits admin approval
        try {
          await prisma.user.create({
            data: {
              id: user.id,
              email: user.email!,
              fullName:
                user.user_metadata?.full_name ||
                user.email?.split('@')[0] ||
                'Unknown',
              role: 'MEMBER',
              department,
              status: 'PENDING',
            },
          });
        } catch (createError) {
          console.error('Error creating user in DB:', createError);
        }
      }

      // Sync user_metadata with DB values (role, department, status)
      const dbUser = await prisma.user.findUnique({
        where: { email: user.email! },
      });

      if (dbUser) {
        await supabase.auth.updateUser({
          data: {
            role: dbUser.role,
            department: dbUser.department,
            status: dbUser.status,
          },
        });

        // Redirect PENDING/REJECTED users to waiting page
        if (dbUser.status === 'PENDING' || dbUser.status === 'REJECTED') {
          return NextResponse.redirect(`${origin}/pending-approval`);
        }
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_error`);
}
