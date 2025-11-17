import { Card, CardContent } from "@/components/ui/card"

export default function PlayerSearchLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      {/* Header Skeleton */}
      <header className="bg-white/90 shadow-sm border-b border-green-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gray-200 rounded animate-pulse"></div>
              <div>
                <div className="h-8 bg-gray-200 rounded w-32 mb-2 animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded w-48 animate-pulse"></div>
              </div>
            </div>
            <div className="w-24 h-10 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Search Bar Skeleton */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="h-12 bg-gray-200 rounded animate-pulse"></div>
            </div>
            <div className="w-32 h-12 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>

        {/* Results Header Skeleton */}
        <div className="mb-4 flex items-center justify-between">
          <div className="h-6 bg-gray-200 rounded w-32 animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
        </div>

        {/* Players Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="border-green-200 animate-pulse">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
                
                <div className="space-y-3 mb-4">
                  {[...Array(4)].map((_, j) => (
                    <div key={j} className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-gray-200 rounded"></div>
                      <div className="h-4 bg-gray-200 rounded w-32"></div>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-3 gap-4 text-center text-sm mb-4">
                  {[...Array(3)].map((_, k) => (
                    <div key={k} className="bg-gray-50 rounded-lg p-2 border border-gray-100">
                      <div className="h-4 bg-gray-200 rounded w-8 mx-auto mb-1"></div>
                      <div className="h-3 bg-gray-200 rounded w-16 mx-auto"></div>
                    </div>
                  ))}
                </div>

                <div className="w-full h-10 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}



