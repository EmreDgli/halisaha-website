// Supabase bağlantı test scripti
import { createClient } from '@supabase/supabase-js'

// Environment variables'ları kontrol et
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

console.log('🔍 Environment Variables Kontrolü:')
console.log('SUPABASE_URL:', supabaseUrl ? '✅ Mevcut' : '❌ Eksik')
console.log('SUPABASE_KEY:', supabaseKey ? '✅ Mevcut' : '❌ Eksik')

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Supabase bilgileri eksik!')
  console.error('Lütfen .env.local dosyasını oluşturun ve Supabase bilgilerini ekleyin.')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function testConnection() {
  try {
    console.log('\n🔗 Supabase bağlantısı test ediliyor...')
    
    // Basit bir sorgu ile bağlantıyı test et
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1)
    
    if (error) {
      console.error('❌ Bağlantı hatası:', error.message)
      
      if (error.message.includes('relation "users" does not exist')) {
        console.log('💡 Users tablosu mevcut değil. SQL scriptleri çalıştırılmalı.')
      } else if (error.message.includes('permission denied')) {
        console.log('💡 RLS policy sorunu. Policy\'ler kontrol edilmeli.')
      }
    } else {
      console.log('✅ Supabase bağlantısı başarılı!')
    }
    
    // Tüm tabloları listele
    console.log('\n📋 Mevcut tablolar kontrol ediliyor...')
    const { data: tables, error: tablesError } = await supabase
      .rpc('get_table_names')
      .limit(20)
    
    if (tablesError) {
      console.log('⚠️ Tablo listesi alınamadı:', tablesError.message)
    } else if (tables && tables.length > 0) {
      console.log('✅ Mevcut tablolar:')
      tables.forEach(table => console.log(`   - ${table.table_name}`))
    } else {
      console.log('❌ Hiç tablo bulunamadı!')
    }
    
  } catch (error) {
    console.error('💥 Test hatası:', error)
  }
}

testConnection()
  .then(() => {
    console.log('\n🎉 Test tamamlandı!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 Test hatası:', error)
    process.exit(1)
  })
