// Kullanıcı etiketlerini test etme scripti
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

async function testUserTags() {
  try {
    console.log("🔍 Kullanıcı etiketlerini kontrol ediliyor...")
    
    // Tüm kullanıcıları getir
    const { data: users, error } = await supabase
      .from("users")
      .select("id, full_name, email, tag")
      .order("created_at", { ascending: false })
      .limit(10)
    
    if (error) {
      console.error("❌ Kullanıcıları getirme hatası:", error)
      return
    }
    
    if (!users || users.length === 0) {
      console.log("📝 Hiç kullanıcı bulunamadı")
      return
    }
    
    console.log(`📊 ${users.length} kullanıcı bulundu:`)
    console.log("")
    
    users.forEach((user, index) => {
      const tagStatus = user.tag ? `✅ ${user.tag}` : "❌ Etiket yok"
      console.log(`${index + 1}. ${user.full_name || "İsimsiz"} (${user.email})`)
      console.log(`   Etiket: ${tagStatus}`)
      console.log("")
    })
    
    // Etiketi olmayan kullanıcıları say
    const usersWithoutTag = users.filter(user => !user.tag)
    const usersWithTag = users.filter(user => user.tag)
    
    console.log("📈 Özet:")
    console.log(`✅ Etiketi olan: ${usersWithTag.length}`)
    console.log(`❌ Etiketi olmayan: ${usersWithoutTag.length}`)
    console.log(`📝 Toplam: ${users.length}`)
    
    if (usersWithoutTag.length > 0) {
      console.log("")
      console.log("⚠️ Etiketi olmayan kullanıcılar:")
      usersWithoutTag.forEach(user => {
        console.log(`   - ${user.full_name || "İsimsiz"} (${user.email})`)
      })
    }
    
  } catch (error) {
    console.error("❌ Test hatası:", error)
  }
}

testUserTags()
  .then(() => {
    console.log("🎉 Test tamamlandı!")
    process.exit(0)
  })
  .catch((error) => {
    console.error("💥 Test hatası:", error)
    process.exit(1)
  }) 