// Mevcut kullanıcılara etiket atama scripti
// Bu scripti bir kez çalıştırarak tüm mevcut kullanıcılara etiket atayabilirsiniz

import { createClient } from '@supabase/supabase-js'

// ⚠️ ÖNEMLİ: Bu değerleri kendi Supabase projenizden alın ve güncelleyin!
// Supabase Dashboard > Settings > API > Project URL ve anon public key
const supabaseUrl = "YOUR_SUPABASE_URL_HERE" // Örnek: https://your-project.supabase.co
const supabaseKey = "YOUR_SUPABASE_ANON_KEY_HERE" // Örnek: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

if (!supabaseUrl || !supabaseKey || supabaseUrl === "YOUR_SUPABASE_URL_HERE" || supabaseKey === "YOUR_SUPABASE_ANON_KEY_HERE") {
  console.error('❌ Supabase bilgileri eksik!')
  console.error('')
  console.error('Lütfen script içindeki supabaseUrl ve supabaseKey değerlerini güncelleyin:')
  console.error('1. Supabase Dashboard\'a gidin')
  console.error('2. Settings > API bölümüne gidin')
  console.error('3. Project URL ve anon public key değerlerini kopyalayın')
  console.error('4. Bu script içindeki supabaseUrl ve supabaseKey değerlerini güncelleyin')
  console.error('')
  console.error('Örnek:')
  console.error('const supabaseUrl = "https://your-project.supabase.co"')
  console.error('const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."')
  console.error('')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

// 4 haneli random etiket üret
function generateTag() {
  return "#" + Math.floor(1000 + Math.random() * 9000)
}

// Etiketin benzersiz olup olmadığını kontrol et
async function isTagUnique(tag) {
  try {
    const { data, error } = await supabase
      .from("users")
      .select("id")
      .eq("tag", tag)
      .single()

    if (error && error.code === 'PGRST116') {
      // Kullanıcı bulunamadı, etiket benzersiz
      return true
    }

    if (error) throw error

    // Kullanıcı bulundu, etiket benzersiz değil
    return false
  } catch (error) {
    console.error("Tag uniqueness check error:", error)
    return false
  }
}

// Kullanıcıya benzersiz etiket ata
async function assignUserTag(userId) {
  let tag
  let exists = true
  let attempts = 0
  const maxAttempts = 100

  while (exists && attempts < maxAttempts) {
    tag = generateTag()
    exists = !(await isTagUnique(tag))
    attempts++
  }

  if (attempts >= maxAttempts) {
    throw new Error("Benzersiz etiket bulunamadı")
  }

  const { error } = await supabase
    .from("users")
    .update({ tag })
    .eq("id", userId)

  if (error) throw error
  return tag
}

// Ana fonksiyon
async function assignTagsToAllUsers() {
  try {
    console.log("Mevcut kullanıcılara etiket atama işlemi başlıyor...")

    // Etiketi olmayan tüm kullanıcıları getir
    const { data: usersWithoutTag, error } = await supabase
      .from("users")
      .select("id, full_name, email")
      .is("tag", null)

    if (error) {
      console.error("Users without tag fetch error:", error)
      return
    }

    if (!usersWithoutTag || usersWithoutTag.length === 0) {
      console.log("✅ Tüm kullanıcıların zaten etiketi var")
      return
    }

    console.log(`📝 ${usersWithoutTag.length} kullanıcıya etiket atanacak`)

    // Her kullanıcıya benzersiz etiket ata
    const results = []
    for (const user of usersWithoutTag) {
      try {
        const tag = await assignUserTag(user.id)
        results.push({ userId: user.id, tag, success: true })
        console.log(`✅ Kullanıcı ${user.full_name} (${user.email}) için etiket atandı: ${tag}`)
      } catch (error) {
        console.error(`❌ Kullanıcı ${user.full_name} (${user.email}) için etiket atama hatası:`, error)
        results.push({ userId: user.id, error: error.message, success: false })
      }
    }

    // Sonuçları özetle
    const successful = results.filter(r => r.success).length
    const failed = results.filter(r => !r.success).length

    console.log("\n📊 Etiket Atama Sonuçları:")
    console.log(`✅ Başarılı: ${successful}`)
    console.log(`❌ Başarısız: ${failed}`)
    console.log(`📝 Toplam: ${results.length}`)

    if (successful > 0) {
      console.log("\n✅ Etiket atama işlemi tamamlandı!")
    }

    if (failed > 0) {
      console.log("\n⚠️ Bazı kullanıcılara etiket atanamadı. Lütfen manuel olarak kontrol edin.")
    }

  } catch (error) {
    console.error("❌ Etiket atama işlemi hatası:", error)
  }
}

// Scripti çalıştır
assignTagsToAllUsers()
  .then(() => {
    console.log("🎉 Script tamamlandı!")
    process.exit(0)
  })
  .catch((error) => {
    console.error("💥 Script hatası:", error)
    process.exit(1)
  }) 