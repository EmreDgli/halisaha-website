"use client"

import { supabase } from "../supabase-client"

export interface RegisterData {
  email: string
  password: string
  firstName: string
  lastName: string
  phone?: string
  roles: ("player" | "field_owner" | "team_manager")[]
}

export interface LoginData {
  email: string
  password: string
}

// Helper function to wait for profile creation
async function waitForProfile(userId: string, maxAttempts = 15): Promise<any> {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    console.log(`Waiting for profile creation, attempt ${attempt}/${maxAttempts}`)

    const { data, error } = await supabase.from("users").select("*").eq("id", userId).maybeSingle()

    if (data) {
      console.log("Profile found:", data)
      return data
    }

    if (error && !error.message.includes("No rows")) {
      console.error("Profile fetch error:", error)
      throw error
    }

    // Wait before next attempt (increasing delay)
    await new Promise((resolve) => setTimeout(resolve, 1000 * attempt))
  }

  throw new Error("Profile creation timeout - trigger may have failed")
}

// Register new user - simplified approach
export async function registerUser(userData: RegisterData) {
  try {
    console.log("Starting registration for:", userData.email)

    // 1. Create auth user (trigger will create profile)
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: userData.email,
      password: userData.password,
      options: {
        data: {
          full_name: `${userData.firstName} ${userData.lastName}`,
          phone: userData.phone,
        },
      },
    })

    console.log("Auth data:", authData)
    console.log("Auth error:", authError)

    if (authError) {
      console.error("Auth error:", authError)
      throw authError
    }

    if (!authData.user) {
      throw new Error("User creation failed - no user returned")
    }

    console.log("Auth user created:", authData.user.id)

    // 2. Wait for trigger to create profile
    let profile
    try {
      profile = await waitForProfile(authData.user.id)
    } catch (error) {
      console.error("Profile creation timeout:", error)
      // Return with auth user even if profile creation failed
      // The user can still login and profile will be created on next attempt
      return {
        data: {
          user: authData.user,
          profile: null,
        },
        error: new Error("Profile creation delayed - please try logging in"),
      }
    }

    // 3. Update profile with specific roles if different from default
    if (profile && userData.roles.length > 0 && !userData.roles.includes("player")) {
      console.log("Updating profile with roles:", userData.roles)

      const { data: updatedProfile, error: updateError } = await supabase
        .from("users")
        .update({
          roles: userData.roles,
          full_name: `${userData.firstName} ${userData.lastName}`,
          phone: userData.phone,
        })
        .eq("id", authData.user.id)
        .select()

      if (updateError) {
        console.error("Profile update error:", updateError)
        // Don't fail registration, just use default profile
      } else if (updatedProfile && updatedProfile.length > 0) {
        profile = updatedProfile[0]
        console.log("Profile updated with roles")
      }
    }

    console.log("Registration successful")
    return { data: { user: authData.user, profile }, error: null }
  } catch (error) {
    console.error("Registration error:", error)
    return { data: null, error }
  }
}

// Login user
export async function loginUser(loginData: LoginData) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: loginData.email,
      password: loginData.password,
    })

    if (error) throw error

    // Get user profile
    if (data.user) {
      const { data: profile, error: profileError } = await supabase
        .from("users")
        .select("*")
        .eq("id", data.user.id)
        .maybeSingle()

      if (profileError) {
        console.error("Profile fetch error during login:", profileError)
        // Try to create profile if it doesn't exist
        const { data: newProfile, error: createError } = await supabase
          .from("users")
          .insert({
            id: data.user.id,
            email: data.user.email || loginData.email,
            full_name: data.user.user_metadata?.full_name || "",
            phone: data.user.user_metadata?.phone || "",
            roles: ["player"],
          })
          .select()
          .single()

        if (createError) {
          console.error("Profile creation during login failed:", createError)
          throw profileError
        }

        return { data: { user: { ...data.user, access_token: data.session?.access_token }, profile: newProfile }, error: null }
      }

      return { data: { user: { ...data.user, access_token: data.session?.access_token }, profile }, error: null }
    }

    return { data, error: null }
  } catch (error) {
    console.error("Login error:", error)
    return { data: null, error }
  }
}

// Logout user
export async function logoutUser() {
  try {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    return { error: null }
  } catch (error) {
    console.error("Logout error:", error)
    return { error }
  }
}

// Kullanıcıya benzersiz #xxxx formatında tag ata
export async function assignUserTag(userId: string) {
  // 4 haneli random sayı üret
  let tag;
  let exists = true;
  while (exists) {
    tag = "#" + Math.floor(1000 + Math.random() * 9000);
    // Benzersiz mi kontrol et
    const { data } = await supabase.from("users").select("id").eq("tag", tag).single();
    exists = !!data;
  }
  await supabase.from("users").update({ tag }).eq("id", userId);
  return tag;
}

// getCurrentUser fonksiyonunda tag yoksa ata
export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { data: null };
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", user.id)
    .single();
  if (!data?.tag) {
    await assignUserTag(user.id);
    // Tag atandıktan sonra tekrar çek
    const { data: newData } = await supabase
      .from("users")
      .select("*")
      .eq("id", user.id)
      .single();
    return { data: newData, error };
  }
  return { data, error };
}

// Check authentication status
export async function checkAuthStatus() {
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession()
    return !!session
  } catch (error) {
    console.error("Auth status check error:", error)
    return false
  }
}

// Update user profile
export async function updateUserProfile(updates: {
  full_name?: string
  phone?: string
  avatar_url?: string
}) {
  try {
    const { data } = await getCurrentUser()

    if (!data?.user) {
      throw new Error("User not authenticated")
    }

    const { data: updatedData, error } = await supabase
      .from("users")
      .update(updates)
      .eq("id", data.user.id)
      .select()
      .single()

    if (error) throw error

    return { data: updatedData, error: null }
  } catch (error) {
    console.error("Update profile error:", error)
    return { data: null, error }
  }
}

// Check if user has role
export async function userHasRole(role: "player" | "field_owner" | "team_manager") {
  try {
    const { data } = await getCurrentUser()
    if (!data?.profile) return false

    return data.profile.roles.includes(role)
  } catch (error) {
    console.error("Check role error:", error)
    return false
  }
}

// Supabase bağlantısını test etmek için manuel fonksiyon
export async function testSupabaseConnection() {
  try {
    // Basit bir sorgu: kullanıcı tablosundan ilk satırı çek
    const { data, error } = await supabase.from("users").select("*").limit(1)
    console.log("Supabase bağlantı testi sonucu:", { data, error })
    return { data, error }
  } catch (error) {
    console.error("Supabase bağlantı testi hatası:", error)
    return { data: null, error }
  }
}
