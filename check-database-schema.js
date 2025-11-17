// Database şemasını kontrol etme scripti
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

async function checkDatabaseSchema() {
  try {
    console.log("🔍 Database şeması kontrol ediliyor...")
    
    // Users tablosunun yapısını kontrol et
    const { data: users, error: usersError } = await supabase
      .from("users")
      .select("*")
      .limit(1)
    
    if (usersError) {
      console.error("❌ Users tablosu hatası:", usersError)
      return
    }
    
    if (users && users.length > 0) {
      console.log("✅ Users tablosu mevcut")
      console.log("📋 Users tablosu kolonları:")
      
      const firstUser = users[0]
      Object.keys(firstUser).forEach(key => {
        const value = firstUser[key]
        const type = typeof value
        console.log(`   - ${key}: ${type} (${value})`)
      })
      
      // Tag kolonunu özel olarak kontrol et
      if ('tag' in firstUser) {
        console.log("✅ Tag kolonu mevcut")
        console.log(`   Tag değeri: ${firstUser.tag || "null"}`)
      } else {
        console.log("❌ Tag kolonu mevcut değil!")
        console.log("⚠️ Tag kolonu eklenmesi gerekiyor")
      }
    } else {
      console.log("📝 Users tablosu boş")
    }
    
    // Tüm kullanıcıları getir ve tag durumlarını kontrol et
    const { data: allUsers, error: allUsersError } = await supabase
      .from("users")
      .select("id, full_name, email, tag")
    
    if (allUsersError) {
      console.error("❌ Tüm kullanıcıları getirme hatası:", allUsersError)
      return
    }
    
    if (allUsers && allUsers.length > 0) {
      console.log("")
      console.log(`📊 ${allUsers.length} kullanıcı bulundu:`)
      
      const usersWithTag = allUsers.filter(user => user.tag)
      const usersWithoutTag = allUsers.filter(user => !user.tag)
      
      console.log(`✅ Etiketi olan: ${usersWithTag.length}`)
      console.log(`❌ Etiketi olmayan: ${usersWithoutTag.length}`)
      
      if (usersWithoutTag.length > 0) {
        console.log("")
        console.log("⚠️ Etiketi olmayan kullanıcılar:")
        usersWithoutTag.forEach(user => {
          console.log(`   - ${user.full_name || "İsimsiz"} (${user.email})`)
        })
      }
    }
    
  } catch (error) {
    console.error("❌ Schema kontrol hatası:", error)
  }
}

checkDatabaseSchema()
  .then(() => {
    console.log("🎉 Schema kontrolü tamamlandı!")
    process.exit(0)
  })
  .catch((error) => {
    console.error("💥 Schema kontrolü hatası:", error)
    process.exit(1)
  }) 