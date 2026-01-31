import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Supabase configuration missing");
    }

    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const { email, password, setupKey } = await req.json();

    // Secret setup key to prevent unauthorized admin creation
    const SETUP_KEY = Deno.env.get("ADMIN_SETUP_KEY");
    
    if (!SETUP_KEY) {
      console.error("ADMIN_SETUP_KEY not configured");
      return new Response(
        JSON.stringify({ error: "Server configuration error" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }
    
    if (!setupKey || setupKey !== SETUP_KEY) {
      console.log("Invalid setup key attempt");
      return new Response(
        JSON.stringify({ error: "Setup key tidak valid" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Check if admin already exists
    const { data: existingRoles, error: rolesError } = await supabaseAdmin
      .from("user_roles")
      .select("*")
      .eq("role", "admin");

    if (rolesError) {
      throw new Error("Failed to check existing admin");
    }

    if (existingRoles && existingRoles.length > 0) {
      console.log("Admin already exists");
      return new Response(
        JSON.stringify({ error: "Admin already exists", exists: true }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Create admin user
    const { data: userData, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (createError) {
      console.error("Error creating user:", createError);
      throw new Error(createError.message);
    }

    if (!userData.user) {
      throw new Error("Failed to create user");
    }

    console.log("Admin user created:", userData.user.id);

    // Assign admin role
    const { error: roleError } = await supabaseAdmin
      .from("user_roles")
      .insert({
        user_id: userData.user.id,
        role: "admin",
      });

    if (roleError) {
      console.error("Error assigning role:", roleError);
      // Cleanup: delete the user if role assignment fails
      await supabaseAdmin.auth.admin.deleteUser(userData.user.id);
      throw new Error("Failed to assign admin role");
    }

    // Create profile
    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .insert({
        user_id: userData.user.id,
        email: email,
        display_name: "Administrator",
      });

    if (profileError) {
      console.error("Profile creation warning:", profileError);
      // Don't fail if profile creation fails
    }

    console.log("Admin setup complete for:", email);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Admin created successfully",
        userId: userData.user.id 
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );

  } catch (error: any) {
    console.error("Setup admin error:", error.message);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
