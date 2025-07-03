import { Loader2 } from "lucide-react"

export default function RoleSelectionLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-8 h-8 animate-spin text-green-600 mx-auto mb-4" />
        <p className="text-gray-600">Yükleniyor...</p>
      </div>
    </div>
  )
}
