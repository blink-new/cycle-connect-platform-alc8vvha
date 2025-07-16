import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { RideMap } from '@/components/ui/ride-map'
import { Search, MapPin, Calendar, Users, List, Map, Clock, Zap, AlertCircle } from 'lucide-react'
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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Explore Rides</h1>
          <p className="text-gray-600">Discover and join cycling adventures in your area</p>
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
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search rides, locations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
                <SelectTrigger className="w-full sm:w-48">
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
              >
                <List className="h-4 w-4 mr-2" />
                List
              </Button>
              <Button
                variant={viewMode === 'map' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('map')}
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
                  <Card key={ride.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg">{ride.title}</CardTitle>
                        <Badge className={getDifficultyColor(ride.difficulty)}>
                          {getDifficultyIcon(ride.difficulty)}
                          <span className="ml-1">{ride.difficulty}</span>
                        </Badge>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="h-4 w-4 mr-1" />
                        {ride.startLocation}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">{ride.description}</p>
                      
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center text-sm text-gray-600">
                          <Calendar className="h-4 w-4 mr-2" />
                          {new Date(ride.date).toLocaleDateString()} at {ride.time}
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Users className="h-4 w-4 mr-2" />
                          {ride.currentParticipants}/{ride.maxParticipants} participants
                        </div>
                        <div className="text-sm text-gray-600">
                          Distance: {ride.distance}km
                        </div>
                        <div className="text-sm text-gray-500">
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
                              className="flex-1"
                            >
                              {usingMockData ? 'Demo Mode' : 'Leave Ride'}
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              onClick={() => joinRide(ride.id)}
                              disabled={isFull || usingMockData}
                              className="flex-1"
                            >
                              {usingMockData ? 'Demo Mode' : isFull ? 'Full' : 'Join Ride'}
                            </Button>
                          )}
                        </div>
                      )}
                      
                      {isCreator && (
                        <Badge variant="secondary" className="w-full justify-center">
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
          <div className="bg-white rounded-lg shadow-sm p-4">
            {filteredRides.length === 0 ? (
              <div className="text-center py-12">
                <Map className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 text-lg mb-4">No rides to display on map</p>
                <Button onClick={() => onNavigate('create')}>Create the first ride</Button>
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