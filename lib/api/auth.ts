"use client"

import { supabase } from "../supabase-client"

export interface RegisterData {
  email: string
  password: string
  firstName: string
  lastName: string
  phone?: string
  roles: ("player" | "field_owner" | "team_manager")[]
  // Profil bilgileri (sadece player rolü için)
  profileData?: {
    position?: string
    skill_level?: string
    preferred_city?: string
    availability?: string
    experience_years?: number
    preferred_time?: string
    bio?: string
  }
}

export interface LoginData {
  email: string
  password: string
}

// Register new user - trigger bağımsız yaklaşım
export async function registerUser(userData: RegisterData) {
  try {
    console.log("registerUser - Starting registration for:", userData.email)

    // 1. Create auth user
    console.log("registerUser - Creating auth user with data:", {
      email: userData.email,
      passwordLength: userData.password.length,
      fullName: `${userData.firstName} ${userData.lastName}`,
      phone: userData.phone,
      roles: userData.roles
    })
    
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

    console.log("registerUser - Auth signup result:", {
      userCreated: !!authData.user,
      userId: authData.user?.id,
      error: authError?.message
    })

    if (authError) {
      console.error("registerUser - Auth error:", authError)
      
      // Kullanıcı dostu hata mesajları
      if (authError.message?.includes("User already registered") || 
          authError.message?.includes("already registered") ||
          authError.message?.includes("already exists") ||
          authError.message?.includes("duplicate key")) {
        throw new Error("Bu e-posta adresi zaten kayıtlı. Giriş yapmayı deneyin.")
      } else if (authError.message?.includes("password") || authError.message?.includes("Password")) {
        throw new Error("Şifre en az 6 karakter olmalıdır.")
      } else if (authError.message?.includes("email") || authError.message?.includes("Email")) {
        throw new Error("Geçerli bir e-posta adresi giriniz.")
      } else if (authError.message?.includes("Invalid email")) {
        throw new Error("Geçersiz e-posta formatı.")
      } else if (authError.message?.includes("weak_password")) {
        throw new Error("Şifre çok zayıf. Daha güçlü bir şifre seçin.")
      } else {
        throw new Error(`Kayıt işlemi başarısız: ${authError.message || "Bilinmeyen hata"}`)
      }
    }

    if (!authData.user) {
      console.error("registerUser - No user data returned")
      throw new Error("Kullanıcı oluşturulamadı. Lütfen tekrar deneyin.")
    }

    console.log("registerUser - Auth user created:", authData.user.id)

    // 2. Manuel olarak users tablosuna ekle (trigger'a bağımlı değil)
    console.log("registerUser - Manually creating user profile...")
    const { data: userProfile, error: userInsertError } = await supabase
      .from("users")
      .insert({
        id: authData.user.id,
        email: userData.email,
        full_name: `${userData.firstName} ${userData.lastName}`,
        phone: userData.phone || "",
        roles: userData.roles,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (userInsertError) {
      console.error("registerUser - User profile creation error:", userInsertError)
      
      // Eğer kullanıcı zaten varsa, mevcut profili al
      if (userInsertError.message?.includes("duplicate key") || userInsertError.message?.includes("already exists")) {
        console.log("registerUser - User profile already exists, fetching existing profile...")
        const { data: existingProfile, error: fetchError } = await supabase
          .from("users")
          .select("*")
          .eq("id", authData.user.id)
          .single()
        
        if (fetchError) {
          console.error("registerUser - Error fetching existing profile:", fetchError)
          throw new Error("Profil bilgileri alınamadı. Lütfen tekrar deneyin.")
        }
        
        console.log("registerUser - Using existing profile:", existingProfile)
        // Mevcut profili güncelle
        const { error: updateError } = await supabase
          .from("users")
          .update({
            full_name: `${userData.firstName} ${userData.lastName}`,
            phone: userData.phone || "",
            roles: userData.roles,
            updated_at: new Date().toISOString()
          })
          .eq("id", authData.user.id)
        
        if (updateError) {
          console.error("registerUser - Profile update error:", updateError)
        }
      } else {
        throw new Error("Profil oluşturulamadı. Lütfen tekrar deneyin.")
      }
    } else {
      console.log("registerUser - User profile created successfully:", userProfile)
    }

    // 3. Assign tag if not exists
    try {
      await assignUserTag(authData.user.id)
      console.log("registerUser - Tag assigned successfully")
    } catch (tagError) {
      console.error("registerUser - Tag assignment error:", tagError)
      // Tag atama hatası kritik değil, devam et
    }

    // 4. Eğer player rolü seçildiyse ve profil bilgileri varsa, profiles tablosuna kaydet
    if (userData.roles.includes("player") && userData.profileData) {
      console.log("registerUser - Saving player profile data:", userData.profileData)
      
      // Önce profiles tablosunun var olduğundan emin ol
      const profilesCheck = await ensureProfilesTable()
      if (profilesCheck && !profilesCheck.success) {
        console.log("⚠️ Profiles table setup needed, skipping profile data save")
        console.log("💡 Please run the SQL script in Supabase Dashboard to create profiles table")
        // Profiles tablosu yoksa sadece uyarı ver ve devam et
      } else {
        try {
          const { data: profileData, error: profileInsertError } = await supabase
            .from("profiles")
            .insert({
              user_id: authData.user.id,
              position: userData.profileData.position || null,
              skill_level: userData.profileData.skill_level || null,
              preferred_city: userData.profileData.preferred_city || null,
              availability: userData.profileData.availability || null,
              experience_years: userData.profileData.experience_years || 0,
              preferred_time: userData.profileData.preferred_time || null,
              bio: userData.profileData.bio || null
            })
            .select()

          if (profileInsertError) {
            console.error("registerUser - Profile data insert error:", profileInsertError)
            console.error("registerUser - Profile insert error details:", {
              message: profileInsertError.message,
              details: profileInsertError.details,
              hint: profileInsertError.hint,
              code: profileInsertError.code
            })
            // Profil bilgileri kaydedilemese bile kayıt işlemi devam etsin
          } else {
            console.log("registerUser - Profile data saved successfully:", profileData)
          }
        } catch (profileError) {
          console.error("registerUser - Profile data save error:", profileError)
          // Profil bilgileri kaydedilemese bile kayıt işlemi devam etsin
        }
      }
    } else {
      console.log("registerUser - Skipping profile data save:", {
        hasPlayerRole: userData.roles.includes("player"),
        hasProfileData: !!userData.profileData
      })
    }

    // 5. Get final profile
    const { data: finalProfile, error: finalError } = await supabase
      .from("users")
      .select("*")
      .eq("id", authData.user.id)
      .single()

    if (finalError) {
      console.error("registerUser - Final profile fetch error:", finalError)
      throw new Error("Profil bilgileri alınamadı. Lütfen tekrar deneyin.")
    }

    console.log("registerUser - Registration completed successfully")
    return { data: { user: authData.user, profile: finalProfile }, error: null }
  } catch (error) {
    console.error("registerUser - Registration error:", error)
    return { data: null, error }
  }
}

// Login user
export async function loginUser(loginData: LoginData) {
  try {
    console.log("🔐 Login attempt for email:", loginData.email)
    console.log("🔐 Password length:", loginData.password.length)
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email: loginData.email,
      password: loginData.password,
    })

    console.log("🔐 Supabase auth response:", { data: data?.user?.id, error: error?.message })

    if (error) {
      console.error("Login error:", error)
      console.error("Error details:", {
        message: error.message,
        status: error.status
      })
      
      // Kullanıcı dostu hata mesajları
      if (error.message?.includes("Invalid login credentials") || 
          error.message?.includes("invalid credentials")) {
        throw new Error("E-posta adresi veya şifre hatalı. Lütfen kontrol edin.")
      } else if (error.message?.includes("Email not confirmed")) {
        throw new Error("E-posta adresinizi onaylamanız gerekiyor. Lütfen e-postanızı kontrol edin.")
      } else if (error.message?.includes("Too many requests")) {
        throw new Error("Çok fazla deneme yapıldı. Lütfen bir süre bekleyin.")
      } else if (error.message?.includes("User not found")) {
        throw new Error("Bu e-posta adresi ile kayıtlı kullanıcı bulunamadı.")
      } else if (error.message?.includes("Invalid email")) {
        throw new Error("Geçersiz e-posta formatı.")
      } else {
        throw new Error(`Giriş başarısız: ${error.message || "Bilinmeyen hata"}`)
      }
    }

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

// Kullanıcıya benzersiz etiket ata - iyileştirilmiş versiyon
export async function assignUserTag(userId: string) {
  console.log("assignUserTag - Starting tag assignment for user:", userId);
  
  try {
    // Tag'i doğrudan güncellemeyi dene
    const tag = "#" + Math.floor(1000 + Math.random() * 9000);
    console.log("assignUserTag - Generated tag:", tag);
    
    // Tag'i güncelle
    const { error: updateError } = await supabase
      .from("users")
      .update({ tag })
      .eq("id", userId);
    
    if (updateError) {
      console.error("assignUserTag - Error updating user tag:", updateError);
      console.error("assignUserTag - Error details:", {
        code: updateError.code,
        message: updateError.message,
        details: updateError.details,
        hint: updateError.hint
      });
      
      // RLS sorunu varsa, tag atamadan devam et
      console.log("assignUserTag - Skipping tag assignment due to RLS issues");
      return null;
    }
    
    console.log("assignUserTag - Successfully assigned tag", tag, "to user", userId);
    return tag;
  } catch (error) {
    console.error("assignUserTag - Unexpected error:", error);
    // Hata durumunda null döndür, uygulama çalışmaya devam etsin
    return null;
  }
}

// Tüm mevcut kullanıcılara etiket ata (bir kez çalıştırılacak)
export async function assignTagsToAllUsers() {
  try {
    // Etiketi olmayan tüm kullanıcıları getir
    const { data: usersWithoutTag, error } = await supabase
      .from("users")
      .select("id")
      .is("tag", null);

    if (error) {
      console.error("Users without tag fetch error:", error);
      return { data: null, error };
    }

    if (!usersWithoutTag || usersWithoutTag.length === 0) {
      console.log("Tüm kullanıcıların zaten etiketi var");
      return { data: [], error: null };
    }

    console.log(`${usersWithoutTag.length} kullanıcıya etiket atanacak`);

    // Her kullanıcıya benzersiz etiket ata
    const results = [];
    for (const user of usersWithoutTag) {
      try {
        const tag = await assignUserTag(user.id);
        results.push({ userId: user.id, tag });
        console.log(`Kullanıcı ${user.id} için etiket atandı: ${tag}`);
      } catch (error) {
        console.error(`Kullanıcı ${user.id} için etiket atama hatası:`, error);
        results.push({ userId: user.id, error });
      }
    }

    return { data: results, error: null };
  } catch (error) {
    console.error("Assign tags to all users error:", error);
    return { data: null, error };
  }
}

// getCurrentUser fonksiyonunda tag yoksa ata
export async function getCurrentUser() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { data: null, error: null };
    
    console.log("getCurrentUser - User ID:", user.id);
    
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", user.id)
      .single();
    
    if (error) {
      console.error("getCurrentUser - Profile fetch error:", error);
      return { data: null, error };
    }
    
    console.log("getCurrentUser - Profile data:", data);
    console.log("getCurrentUser - Current tag:", data?.tag);
    
    // Tag yoksa ata, ama hata olursa mevcut profili döndür
    if (!data?.tag) {
      console.log("getCurrentUser - No tag found, attempting to assign new tag");
      try {
        const tag = await assignUserTag(user.id);
        console.log("getCurrentUser - Tag assignment result:", tag);
        
        if (tag) {
          console.log("getCurrentUser - Tag assigned successfully");
          
          // Tag atandıktan sonra tekrar çek
          const { data: newData, error: newError } = await supabase
            .from("users")
            .select("*")
            .eq("id", user.id)
            .single();
          
          if (newError) {
            console.error("getCurrentUser - Error fetching updated profile:", newError);
            // Hata olsa bile mevcut profili döndür
            return { data: { user, profile: data }, error: null };
          }
          
          console.log("getCurrentUser - New profile data after tag assignment:", newData);
          return { data: { user, profile: newData }, error: null };
        } else {
          console.log("getCurrentUser - Tag assignment failed or skipped, using existing profile");
          // Tag atama başarısız olsa bile mevcut profili döndür
          return { data: { user, profile: data }, error: null };
        }
      } catch (tagError) {
        console.error("getCurrentUser - Tag assignment failed:", tagError);
        // Tag atama hatası olsa bile mevcut profili döndür
        return { data: { user, profile: data }, error: null };
      }
    } else {
      console.log("getCurrentUser - User already has tag:", data.tag);
    }
    
    console.log("getCurrentUser - Returning existing profile with tag");
    return { data: { user, profile: data }, error: null };
  } catch (error) {
    console.error("getCurrentUser - Unexpected error:", error);
    return { data: null, error };
  }
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

// Check if user exists in auth.users table
export async function checkUserExists(email: string) {
  try {
    console.log("🔍 Checking if user exists for email:", email)
    
    // Users tablosundan kontrol et (RLS policy'ler nedeniyle)
    const { data, error } = await supabase
      .from("users")
      .select("id, email")
      .eq("email", email)
      .maybeSingle()
    
    if (error) {
      console.error("Error checking users:", error)
      return { exists: false, error }
    }
    
    const userExists = !!data
    console.log("🔍 User exists check result:", userExists)
    
    return { exists: userExists, error: null }
  } catch (error) {
    console.error("Check user exists error:", error)
    return { exists: false, error }
  }
}

// Profiles tablosunu kontrol et ve oluştur - düzeltilmiş versiyon
export async function ensureProfilesTable() {
  try {
    console.log("🔍 Checking if profiles table exists...")
    
    // Profiles tablosunu kontrol et
    const { data, error } = await supabase
      .from("profiles")
      .select("id")
      .limit(1)
    
    if (error) {
      console.log("📋 Profiles table doesn't exist or has RLS issues")
      console.log("⚠️ Please run the SQL script manually in Supabase Dashboard")
      console.log("📝 SQL Script:")
      console.log(`
        CREATE TABLE IF NOT EXISTS public.profiles (
          id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
          user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
          position TEXT,
          skill_level TEXT,
          preferred_city TEXT,
          availability TEXT,
          experience_years INTEGER DEFAULT 0,
          preferred_time TEXT,
          bio TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          UNIQUE(user_id)
        );
        
        ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
        
        CREATE POLICY "Users can view own profile" ON public.profiles
          FOR SELECT USING (auth.uid() = user_id);
        
        CREATE POLICY "Users can update own profile" ON public.profiles
          FOR UPDATE USING (auth.uid() = user_id);
        
        CREATE POLICY "Users can insert own profile" ON public.profiles
          FOR INSERT WITH CHECK (auth.uid() = user_id);
      `)
      
      return { success: false, error: error, needsManualSetup: true }
    }
    
    console.log("✅ Profiles table exists")
    return { success: true, error: null, needsManualSetup: false }
  } catch (error) {
    console.error("❌ Error checking profiles table:", error)
    return { success: false, error, needsManualSetup: true }
  }
}

// Test login with detailed error info
export async function testLogin(email: string, password: string) {
  try {
    console.log("🧪 Testing login for:", email)
    
    // Önce kullanıcının var olup olmadığını kontrol et
    const { exists } = await checkUserExists(email)
    console.log("🧪 User exists in users table:", exists)
    
    // Login denemesi yap
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    })
    
    console.log("🧪 Login test result:", {
      success: !error,
      userId: data?.user?.id,
      error: error?.message,
      status: error?.status
    })
    
    return { data, error, userExists: exists }
  } catch (error) {
    console.error("Test login error:", error)
    return { data: null, error, userExists: false }
  }
}