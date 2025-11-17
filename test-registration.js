// Kayıt işlemi test scripti
import { createClient } from '@supabase/supabase-js'

// Environment variables kontrolü
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Supabase bilgileri eksik!')
  console.error('Lütfen .env.local dosyasını oluşturun.')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function testRegistration() {
  try {
    console.log('🧪 Kayıt işlemi test ediliyor...')
    
    // Test kullanıcısı bilgileri
    const testUser = {
      email: `test-${Date.now()}@example.com`,
      password: 'test123456',
      firstName: 'Test',
      lastName: 'User',
      phone: '05551234567',
      roles: ['player'],
      profileData: {
        position: 'Orta Saha',
        skill_level: 'Orta',
        preferred_city: 'İstanbul',
        availability: 'Hafta sonu',
        experience_years: 5,
        preferred_time: 'Akşam',
        bio: 'Test kullanıcısı'
      }
    }
    
    console.log('📝 Test kullanıcısı:', testUser.email)
    
    // 1. Auth user oluştur
    console.log('1️⃣ Auth user oluşturuluyor...')
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: testUser.email,
      password: testUser.password,
      options: {
        data: {
          full_name: `${testUser.firstName} ${testUser.lastName}`,
          phone: testUser.phone,
        },
      },
    })
    
    if (authError) {
      console.error('❌ Auth user oluşturma hatası:', authError)
      return
    }
    
    console.log('✅ Auth user oluşturuldu:', authData.user?.id)
    
    // 2. Users tablosunda kontrol et
    console.log('2️⃣ Users tablosunda kontrol ediliyor...')
    await new Promise(resolve => setTimeout(resolve, 2000)) // 2 saniye bekle
    
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', authData.user.id)
      .maybeSingle()
    
    if (userError) {
      console.error('❌ Users tablosu kontrol hatası:', userError)
    } else if (userData) {
      console.log('✅ Users tablosunda kullanıcı bulundu:', userData)
    } else {
      console.log('❌ Users tablosunda kullanıcı bulunamadı!')
    }
    
    // 3. Profiles tablosuna kaydet
    console.log('3️⃣ Profiles tablosuna kaydediliyor...')
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .insert({
        user_id: authData.user.id,
        position: testUser.profileData.position,
        skill_level: testUser.profileData.skill_level,
        preferred_city: testUser.profileData.preferred_city,
        availability: testUser.profileData.availability,
        experience_years: testUser.profileData.experience_years,
        preferred_time: testUser.profileData.preferred_time,
        bio: testUser.profileData.bio
      })
      .select()
    
    if (profileError) {
      console.error('❌ Profiles tablosu kayıt hatası:', profileError)
    } else {
      console.log('✅ Profiles tablosuna kaydedildi:', profileData)
    }
    
    // 4. Sonuçları özetle
    console.log('\n📊 Test Sonuçları:')
    console.log('Auth User:', !!authData.user)
    console.log('Users Table:', !!userData)
    console.log('Profiles Table:', !!profileData)
    
    // 5. Temizlik
    console.log('\n🧹 Test kullanıcısı temizleniyor...')
    try {
      await supabase.auth.admin.deleteUser(authData.user.id)
      console.log('✅ Test kullanıcısı silindi')
    } catch (cleanupError) {
      console.log('⚠️ Test kullanıcısı silinemedi:', cleanupError.message)
    }
    
  } catch (error) {
    console.error('💥 Test hatası:', error)
  }
}

testRegistration()
  .then(() => {
    console.log('\n🎉 Test tamamlandı!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 Test hatası:', error)
    process.exit(1)
  })
