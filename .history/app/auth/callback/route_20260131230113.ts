import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Department } from "@prisma/client";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    const supabase = await createClient();
    
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (!error && data.user) {
      const user = data.user;
      
      // Check if user exists in our database
      const existingUser = await prisma.user.findUnique({
        where: { email: user.email! },
      });

      if (!existingUser) {
        // Create new user with default role MEMBER
        try {
          await prisma.user.create({
            data: {
              id: user.id,
              email: user.email!,
              fullName: user.user_metadata?.full_name || user.email?.split("@")[0] || "Unknown",
              role: "MEMBER",
              department: Department.SINGING, // Default department, can be changed later
            },
          });
          console.log(`Created new user: ${user.email} with role MEMBER`);
        } catch (createError) {
          console.error("Error creating user:", createError);
          // If user creation fails due to duplicate ID, try updating
          // This handles edge cases where user exists in Supabase but not in our DB
        }
      }

      // Update user metadata with role from our database
      const dbUser = await prisma.user.findUnique({
        where: { email: user.email! },
      });

      if (dbUser) {
        await supabase.auth.updateUser({
          data: {
            role: dbUser.role,
            department: dbUser.department,
          },
        });
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/login?error=auth_callback_error`);
}
