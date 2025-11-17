"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { testLogin, checkUserExists } from "@/lib/api/auth"

export default function DebugLoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [result, setResult] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleTest = async () => {
    if (!email || !password) return
    
    setIsLoading(true)
    setResult(null)
    
    try {
      console.log("🧪 Debug login test başlatılıyor...")
      
      // Kullanıcı var mı kontrol et
      const userCheck = await checkUserExists(email)
      console.log("🔍 User check result:", userCheck)
      
      // Test login yap
      const testResult = await testLogin(email, password)
      console.log("🧪 Test login result:", testResult)
      
      setResult({
        userExists: userCheck.exists,
        userCheckError: userCheck.error,
        loginSuccess: !testResult.error,
        loginError: testResult.error,
        userId: testResult.data?.user?.id,
        email: email,
        passwordLength: password.length
      })
      
    } catch (error) {
      console.error("Debug test error:", error)
      setResult({ error: error })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>🔧 Login Debug Tool</CardTitle>
            <CardDescription>
              Login sorunlarını tespit etmek için bu aracı kullanın
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">E-posta Adresi</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="test@example.com"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Şifre</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Şifrenizi girin"
              />
            </div>
            
            <Button 
              onClick={handleTest} 
              disabled={isLoading || !email || !password}
              className="w-full"
            >
              {isLoading ? "Test Ediliyor..." : "Test Et"}
            </Button>
            
            {result && (
              <div className="space-y-4">
                <Alert>
                  <AlertDescription>
                    <strong>Test Sonuçları:</strong>
                    <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto">
                      {JSON.stringify(result, null, 2)}
                    </pre>
                  </AlertDescription>
                </Alert>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <strong>Kullanıcı Durumu:</strong>
                    <p className={result.userExists ? "text-green-600" : "text-red-600"}>
                      {result.userExists ? "✅ Kayıtlı" : "❌ Kayıtlı değil"}
                    </p>
                  </div>
                  
                  <div>
                    <strong>Login Durumu:</strong>
                    <p className={result.loginSuccess ? "text-green-600" : "text-red-600"}>
                      {result.loginSuccess ? "✅ Başarılı" : "❌ Başarısız"}
                    </p>
                  </div>
                  
                  <div>
                    <strong>E-posta:</strong>
                    <p>{result.email}</p>
                  </div>
                  
                  <div>
                    <strong>Şifre Uzunluğu:</strong>
                    <p>{result.passwordLength} karakter</p>
                  </div>
                </div>
                
                {result.loginError && (
                  <Alert className="border-red-200 bg-red-50">
                    <AlertDescription className="text-red-700">
                      <strong>Hata Detayları:</strong>
                      <p>Mesaj: {result.loginError.message}</p>
                      <p>Status: {result.loginError.status}</p>
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
