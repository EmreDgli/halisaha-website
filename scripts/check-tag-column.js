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

async function checkTagColumn() {
  try {
    console.log("🔍 Tag kolonu kontrol ediliyor...")
    
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
        console.log("")
        console.log("SQL komutu:")
        console.log("ALTER TABLE users ADD COLUMN tag VARCHAR(10);")
        console.log("CREATE INDEX idx_users_tag ON users(tag);")
      }
    } else {
      console.log("📝 Users tablosu boş")
    }
    
    // Tag'i olan ve olmayan kullanıcıları say
    const { data: usersWithTag, error: withTagError } = await supabase
      .from("users")
      .select("id")
      .not("tag", "is", null)
    
    const { data: usersWithoutTag, error: withoutTagError } = await supabase
      .from("users")
      .select("id")
      .is("tag", null)
    
    if (!withTagError && !withoutTagError) {
      console.log("")
      console.log("📊 Tag Durumu:")
      console.log(`✅ Tag'i olan: ${usersWithTag?.length || 0}`)
      console.log(`❌ Tag'i olmayan: ${usersWithoutTag?.length || 0}`)
    }
    
  } catch (error) {
    console.error("❌ Tag kolonu kontrol hatası:", error)
  }
}

checkTagColumn()
  .then(() => {
    console.log("🎉 Tag kolonu kontrolü tamamlandı!")
    process.exit(0)
  })
  .catch((error) => {
    console.error("💥 Tag kolonu kontrolü hatası:", error)
    process.exit(1)
  }) 