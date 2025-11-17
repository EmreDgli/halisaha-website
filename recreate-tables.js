// Tabloları yeniden oluşturma scripti
import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

// Environment variables kontrolü
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Supabase bilgileri eksik!')
  console.error('Lütfen .env.local dosyasını oluşturun.')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function recreateTables() {
  try {
    console.log('🔄 Tablolar yeniden oluşturuluyor...')
    
    // SQL dosyalarını oku
    const createTablesSQL = fs.readFileSync(path.join('scripts', '01-create-tables.sql'), 'utf8')
    const createRLSSQL = fs.readFileSync(path.join('scripts', '02-create-rls-policies.sql'), 'utf8')
    
    console.log('📋 1. Tablolar oluşturuluyor...')
    const { error: tablesError } = await supabase.rpc('exec_sql', { sql: createTablesSQL })
    
    if (tablesError) {
      console.error('❌ Tablo oluşturma hatası:', tablesError)
      return
    }
    
    console.log('✅ Tablolar başarıyla oluşturuldu!')
    
    console.log('📋 2. RLS Policy\'leri ekleniyor...')
    const { error: rlsError } = await supabase.rpc('exec_sql', { sql: createRLSSQL })
    
    if (rlsError) {
      console.error('❌ RLS policy hatası:', rlsError)
      return
    }
    
    console.log('✅ RLS Policy\'leri başarıyla eklendi!')
    
    // Test et
    console.log('📋 3. Tablolar test ediliyor...')
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('count')
      .limit(1)
    
    if (usersError) {
      console.error('❌ Users tablosu test hatası:', usersError)
    } else {
      console.log('✅ Users tablosu çalışıyor!')
    }
    
    const { data: teams, error: teamsError } = await supabase
      .from('teams')
      .select('count')
      .limit(1)
    
    if (teamsError) {
      console.error('❌ Teams tablosu test hatası:', teamsError)
    } else {
      console.log('✅ Teams tablosu çalışıyor!')
    }
    
  } catch (error) {
    console.error('💥 Tablo oluşturma hatası:', error)
  }
}

recreateTables()
  .then(() => {
    console.log('\n🎉 Tüm işlemler tamamlandı!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 İşlem hatası:', error)
    process.exit(1)
  })
