import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Bike, Users, MapPin, Calendar } from 'lucide-react'

interface HomePageProps {
  onNavigate: (page: string) => void
}

export function HomePage({ onNavigate }: HomePageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-green-600/5"></div>
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <div className="animate-fade-in">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Connect with Fellow
              <span className="gradient-blue-green bg-clip-text text-transparent block">Cyclists</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              Discover amazing group rides, create your own cycling adventures, and build lasting connections with the cycling community.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up">
            <Button
              size="lg"
              onClick={() => onNavigate('explore')}
              className="gradient-blue-green hover:opacity-90 text-white px-8 py-4 text-lg font-medium shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
            >
              <MapPin className="mr-2 h-5 w-5" />
              Explore Rides
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => onNavigate('create')}
              className="border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white px-8 py-4 text-lg font-medium shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
            >
              <Calendar className="mr-2 h-5 w-5" />
              Create a Ride
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 animate-fade-in">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose CycleConnect?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Join a thriving community of cyclists and discover new adventures
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center p-6 hover-lift border-0 shadow-lg bg-white/80 backdrop-blur-sm animate-slide-up">
              <CardContent className="pt-6">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <Users className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-4 text-gray-900">Join Group Rides</h3>
                <p className="text-gray-600 leading-relaxed">
                  Find and join exciting group rides in your area. Meet new cycling buddies and explore together.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center p-6 hover-lift border-0 shadow-lg bg-white/80 backdrop-blur-sm animate-slide-up" style={{ animationDelay: '0.1s' }}>
              <CardContent className="pt-6">
                <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <MapPin className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-4 text-gray-900">Discover Routes</h3>
                <p className="text-gray-600 leading-relaxed">
                  Explore new cycling routes and discover hidden gems in your city through our interactive map.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center p-6 hover-lift border-0 shadow-lg bg-white/80 backdrop-blur-sm animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <CardContent className="pt-6">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <Bike className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-4 text-gray-900">Create Adventures</h3>
                <p className="text-gray-600 leading-relaxed">
                  Organize your own rides and share your favorite routes with the cycling community.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 to-green-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="animate-fade-in">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Ready to Start Your Cycling Journey?
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto leading-relaxed">
              Join thousands of cyclists who are already connecting and exploring together.
            </p>
          </div>
          <div className="animate-slide-up">
            <Button
              size="lg"
              onClick={() => onNavigate('explore')}
              className="bg-white text-blue-600 hover:bg-blue-50 px-10 py-4 text-lg font-bold shadow-xl hover:shadow-2xl transition-all duration-200 transform hover:scale-105"
            >
              Get Started Today
            </Button>
          </div>
        </div>
        {/* Decorative elements */}
        <div className="absolute top-10 left-10 w-20 h-20 bg-white/10 rounded-full blur-xl"></div>
        <div className="absolute bottom-10 right-10 w-32 h-32 bg-white/10 rounded-full blur-xl"></div>
        <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-white/5 rounded-full blur-lg"></div>
      </section>
    </div>
  )
}