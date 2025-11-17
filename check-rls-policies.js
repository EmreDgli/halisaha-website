// RLS Policy kontrol scripti
import { createClient } from '@supabase/supabase-js'

// ⚠️ ÖNEMLİ: Bu değerleri kendi Supabase projenizden alın ve güncelleyin!
const supabaseUrl = "YOUR_SUPABASE_URL_HERE"
const supabaseKey = "YOUR_SUPABASE_ANON_KEY_HERE"

if (!supabaseUrl || !supabaseKey || supabaseUrl === "YOUR_SUPABASE_URL_HERE" || supabaseKey === "YOUR_SUPABASE_ANON_KEY_HERE") {
  console.error('❌ Supabase bilgileri eksik!')
  console.error('Lütfen script içindeki supabaseUrl ve supabaseKey değerlerini güncelleyin.')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkRLSPolicies() {
  try {
    console.log("🔍 RLS Policy'leri kontrol ediliyor...")
    
    // Önce authentication durumunu kontrol et
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError) {
      console.error("❌ Session kontrolü hatası:", sessionError)
      return
    }
    
    if (!session) {
      console.log("⚠️ Kullanıcı giriş yapmamış, önce giriş yapın")
      return
    }
    
    console.log("✅ Kullanıcı giriş yapmış:", session.user.email)
    
    // Users tablosunu test et
    console.log("\n📋 Users tablosu test ediliyor...")
    const { data: users, error: usersError } = await supabase
      .from("users")
      .select("id, full_name, email, tag")
      .limit(1)
    
    if (usersError) {
      console.error("❌ Users tablosu hatası:", usersError)
      console.log("💡 Bu RLS policy sorunu olabilir")
    } else {
      console.log("✅ Users tablosu erişilebilir")
      if (users && users.length > 0) {
        console.log("📝 Örnek kullanıcı:", users[0])
      }
    }
    
    // Teams tablosunu test et
    console.log("\n📋 Teams tablosu test ediliyor...")
    const { data: teams, error: teamsError } = await supabase
      .from("teams")
      .select("id, name, city")
      .limit(1)
    
    if (teamsError) {
      console.error("❌ Teams tablosu hatası:", teamsError)
      console.log("💡 Bu RLS policy sorunu olabilir")
    } else {
      console.log("✅ Teams tablosu erişilebilir")
      if (teams && teams.length > 0) {
        console.log("📝 Örnek takım:", teams[0])
      }
    }
    
    // Team_members tablosunu test et
    console.log("\n📋 Team_members tablosu test ediliyor...")
    const { data: teamMembers, error: teamMembersError } = await supabase
      .from("team_members")
      .select("id, team_id, user_id")
      .limit(1)
    
    if (teamMembersError) {
      console.error("❌ Team_members tablosu hatası:", teamMembersError)
      console.log("💡 Bu RLS policy sorunu olabilir")
    } else {
      console.log("✅ Team_members tablosu erişilebilir")
      if (teamMembers && teamMembers.length > 0) {
        console.log("📝 Örnek takım üyesi:", teamMembers[0])
      }
    }
    
    // Fields tablosunu test et
    console.log("\n📋 Fields tablosu test ediliyor...")
    const { data: fields, error: fieldsError } = await supabase
      .from("fields")
      .select("id, name, address")
      .limit(1)
    
    if (fieldsError) {
      console.error("❌ Fields tablosu hatası:", fieldsError)
      console.log("💡 Bu RLS policy sorunu olabilir")
    } else {
      console.log("✅ Fields tablosu erişilebilir")
      if (fields && fields.length > 0) {
        console.log("📝 Örnek saha:", fields[0])
      }
    }
    
    console.log("\n📊 RLS Test Sonuçları:")
    console.log("✅ Session:", !!session)
    console.log("✅ Users:", !usersError)
    console.log("✅ Teams:", !teamsError)
    console.log("✅ Team_members:", !teamMembersError)
    console.log("✅ Fields:", !fieldsError)
    
  } catch (error) {
    console.error("❌ RLS kontrol hatası:", error)
  }
}

checkRLSPolicies()
  .then(() => {
    console.log("\n🎉 RLS kontrolü tamamlandı!")
    process.exit(0)
  })
  .catch((error) => {
    console.error("💥 RLS kontrolü hatası:", error)
    process.exit(1)
  }) 