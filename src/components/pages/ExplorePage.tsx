import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { RideMap } from '@/components/ui/ride-map'
import { Search, MapPin, Calendar, Users, List, Map, Clock, Zap, AlertCircle, Bike } from 'lucide-react'
import { blink } from '@/blink/client'
import { mockRides } from '@/data/mockRides'
import type { Ride, User } from '@/types/ride'

interface ExplorePageProps {
  onNavigate: (page: string) => void
}

export function ExplorePage({ onNavigate }: ExplorePageProps) {
  const [rides, setRides] = useState<Ride[]>([])
  const [filteredRides, setFilteredRides] = useState<Ride[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list')
  const [searchQuery, setSearchQuery] = useState('')
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all')
  const [user, setUser] = useState<User | null>(null)
  const [usingMockData, setUsingMockData] = useState(false)

  useEffect(() => {
    const unsubscribe = blink.auth.onAuthStateChanged((state) => {
      setUser(state.user)
      if (state.user && !state.isLoading) {
        loadRides()
      }
    })
    return unsubscribe
  }, [])

  const loadRides = async () => {
    try {
      setLoading(true)
      const ridesData = await blink.db.rides.list({
        orderBy: { createdAt: 'desc' }
      })
      setRides(ridesData)
      setFilteredRides(ridesData)
      setUsingMockData(false)
    } catch (error) {
      console.error('Error loading rides:', error)
      // Handle database not found error gracefully
      if (error.message?.includes('Database for project') && error.message?.includes('not found')) {
        console.log('Database not yet initialized - using mock data for demonstration')
        setRides(mockRides)
        setFilteredRides(mockRides)
        setUsingMockData(true)
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let filtered = rides

    if (searchQuery) {
      filtered = filtered.filter(ride =>
        ride.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ride.startLocation.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ride.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    if (difficultyFilter !== 'all') {
      filtered = filtered.filter(ride => ride.difficulty === difficultyFilter)
    }

    setFilteredRides(filtered)
  }, [rides, searchQuery, difficultyFilter])

  const joinRide = async (rideId: string) => {
    if (!user || usingMockData) return

    try {
      const ride = rides.find(r => r.id === rideId)
      if (!ride) return

      const updatedParticipants = [...ride.participants, user.id]
      
      await blink.db.rides.update(rideId, {
        participants: updatedParticipants,
        currentParticipants: updatedParticipants.length
      })

      // Update local state
      setRides(prev => prev.map(r => 
        r.id === rideId 
          ? { ...r, participants: updatedParticipants, currentParticipants: updatedParticipants.length }
          : r
      ))
    } catch (error) {
      console.error('Error joining ride:', error)
    }
  }

  const leaveRide = async (rideId: string) => {
    if (!user || usingMockData) return

    try {
      const ride = rides.find(r => r.id === rideId)
      if (!ride) return

      const updatedParticipants = ride.participants.filter(id => id !== user.id)
      
      await blink.db.rides.update(rideId, {
        participants: updatedParticipants,
        currentParticipants: updatedParticipants.length
      })

      // Update local state
      setRides(prev => prev.map(r => 
        r.id === rideId 
          ? { ...r, participants: updatedParticipants, currentParticipants: updatedParticipants.length }
          : r
      ))
    } catch (error) {
      console.error('Error leaving ride:', error)
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'bg-green-100 text-green-800'
      case 'Moderate': return 'bg-yellow-100 text-yellow-800'
      case 'Hard': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getDifficultyIcon = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return <Clock className="h-3 w-3" />
      case 'Moderate': return <Zap className="h-3 w-3" />
      case 'Hard': return <Zap className="h-3 w-3" />
      default: return <Clock className="h-3 w-3" />
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Please sign in to explore rides</h2>
          <Button onClick={() => blink.auth.login()}>Sign In</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Explore Rides</h1>
          <p className="text-lg text-gray-600">Discover and join cycling adventures in your area</p>
        </div>

        {/* Mock Data Notice */}
        {usingMockData && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
            <div className="flex items-start">
              <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <h3 className="text-sm font-medium text-amber-800 mb-1">Demo Mode</h3>
                <p className="text-sm text-amber-700">
                  Database is currently being set up. Showing sample rides for demonstration. 
                  Creating new rides is temporarily disabled.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Filters and Search */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border-0 p-6 mb-6 animate-slide-up">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search rides, locations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                />
              </div>
              <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
                <SelectTrigger className="w-full sm:w-48 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20">
                  <SelectValue placeholder="Difficulty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Difficulties</SelectItem>
                  <SelectItem value="Easy">Easy</SelectItem>
                  <SelectItem value="Moderate">Moderate</SelectItem>
                  <SelectItem value="Hard">Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex gap-2">
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
                className={viewMode === 'list' ? 'bg-blue-600 hover:bg-blue-700' : 'border-gray-300 hover:bg-gray-50'}
              >
                <List className="h-4 w-4 mr-2" />
                List
              </Button>
              <Button
                variant={viewMode === 'map' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('map')}
                className={viewMode === 'map' ? 'bg-blue-600 hover:bg-blue-700' : 'border-gray-300 hover:bg-gray-50'}
              >
                <Map className="h-4 w-4 mr-2" />
                Map
              </Button>
            </div>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-200 rounded"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : viewMode === 'list' ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRides.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <p className="text-gray-500 text-lg mb-4">No rides found</p>
                <Button onClick={() => onNavigate('create')}>Create the first ride</Button>
              </div>
            ) : (
              filteredRides.map((ride) => {
                const isParticipant = ride.participants.includes(user.id)
                const isCreator = ride.createdBy === user.id
                const isFull = ride.currentParticipants >= ride.maxParticipants

                return (
                  <Card key={ride.id} className="hover-lift border-0 shadow-lg bg-white/90 backdrop-blur-sm animate-fade-in">
                    <CardHeader className="pb-4">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg font-bold text-gray-900 leading-tight">{ride.title}</CardTitle>
                        <Badge className={`${getDifficultyColor(ride.difficulty)} font-medium shadow-sm`}>
                          {getDifficultyIcon(ride.difficulty)}
                          <span className="ml-1">{ride.difficulty}</span>
                        </Badge>
                      </div>
                      <div className="flex items-center text-sm text-gray-600 mt-2">
                        <MapPin className="h-4 w-4 mr-1 text-blue-500" />
                        <span className="truncate">{ride.startLocation}</span>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2 leading-relaxed">{ride.description}</p>
                      
                      <div className="space-y-3 mb-6">
                        <div className="flex items-center text-sm text-gray-700">
                          <Calendar className="h-4 w-4 mr-3 text-blue-500 flex-shrink-0" />
                          <span className="font-medium">{new Date(ride.date).toLocaleDateString()} at {ride.time}</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-700">
                          <Users className="h-4 w-4 mr-3 text-green-500 flex-shrink-0" />
                          <span className="font-medium">{ride.currentParticipants}/{ride.maxParticipants} participants</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-700">
                          <Bike className="h-4 w-4 mr-3 text-purple-500 flex-shrink-0" />
                          <span className="font-medium">{ride.distance}km distance</span>
                        </div>
                        <div className="text-sm text-gray-500 pl-7">
                          Created by {ride.creatorName}
                        </div>
                      </div>

                      {!isCreator && (
                        <div className="flex gap-2">
                          {isParticipant ? (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => leaveRide(ride.id)}
                              disabled={usingMockData}
                              className="flex-1 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 font-medium"
                            >
                              {usingMockData ? 'Demo Mode' : 'Leave Ride'}
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              onClick={() => joinRide(ride.id)}
                              disabled={isFull || usingMockData}
                              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-sm"
                            >
                              {usingMockData ? 'Demo Mode' : isFull ? 'Full' : 'Join Ride'}
                            </Button>
                          )}
                        </div>
                      )}
                      
                      {isCreator && (
                        <Badge variant="secondary" className="w-full justify-center py-2 bg-green-100 text-green-800 font-medium">
                          Your Ride
                        </Badge>
                      )}
                    </CardContent>
                  </Card>
                )
              })
            )}
          </div>
        ) : (
          <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border-0 p-4 animate-fade-in">
            {filteredRides.length === 0 ? (
              <div className="text-center py-12">
                <Map className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 text-lg mb-4">No rides to display on map</p>
                <Button 
                  onClick={() => onNavigate('create')}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium"
                >
                  Create the first ride
                </Button>
              </div>
            ) : (
              <RideMap 
                rides={filteredRides} 
                user={user} 
                onJoinRide={joinRide}
                onLeaveRide={leaveRide}
              />
            )}
          </div>
        )}
      </div>
    </div>
  )
}