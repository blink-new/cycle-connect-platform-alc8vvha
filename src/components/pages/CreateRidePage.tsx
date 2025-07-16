import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calendar, MapPin, Users, Clock, Zap } from 'lucide-react'
import { blink } from '@/blink/client'
import type { User } from '@/types/ride'

interface CreateRidePageProps {
  onNavigate: (page: string) => void
}

export function CreateRidePage({ onNavigate }: CreateRidePageProps) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startLocation: '',
    startLatitude: 0,
    startLongitude: 0,
    date: '',
    time: '',
    difficulty: '',
    distance: '',
    maxParticipants: ''
  })

  useEffect(() => {
    const unsubscribe = blink.auth.onAuthStateChanged((state) => {
      setUser(state.user)
    })
    return unsubscribe
  }, [])

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    try {
      setLoading(true)

      // Generate a unique ID for the ride
      const rideId = `ride_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

      const rideData = {
        id: rideId,
        title: formData.title,
        description: formData.description,
        startLocation: formData.startLocation,
        startLatitude: formData.startLatitude || 37.7749, // Default to SF coordinates
        startLongitude: formData.startLongitude || -122.4194,
        date: formData.date,
        time: formData.time,
        difficulty: formData.difficulty as 'Easy' | 'Moderate' | 'Hard',
        distance: parseInt(formData.distance),
        maxParticipants: parseInt(formData.maxParticipants),
        currentParticipants: 1, // Creator is automatically a participant
        createdBy: user.id,
        creatorName: user.displayName || user.email,
        creatorEmail: user.email,
        participants: [user.id], // Creator is automatically a participant
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      await blink.db.rides.create(rideData)

      // Reset form
      setFormData({
        title: '',
        description: '',
        startLocation: '',
        startLatitude: 0,
        startLongitude: 0,
        date: '',
        time: '',
        difficulty: '',
        distance: '',
        maxParticipants: ''
      })

      // Navigate to explore page
      onNavigate('explore')
    } catch (error) {
      console.error('Error creating ride:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Please sign in to create a ride</h2>
          <Button onClick={() => blink.auth.login()}>Sign In</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create a New Ride</h1>
          <p className="text-gray-600">Share your cycling adventure with the community</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="h-5 w-5 mr-2 text-blue-600" />
              Ride Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Ride Title *</Label>
                  <Input
                    id="title"
                    placeholder="e.g., Morning Coffee Ride"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="difficulty">Difficulty *</Label>
                  <Select value={formData.difficulty} onValueChange={(value) => handleInputChange('difficulty', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select difficulty" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Easy">
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-2 text-green-600" />
                          Easy
                        </div>
                      </SelectItem>
                      <SelectItem value="Moderate">
                        <div className="flex items-center">
                          <Zap className="h-4 w-4 mr-2 text-yellow-600" />
                          Moderate
                        </div>
                      </SelectItem>
                      <SelectItem value="Hard">
                        <div className="flex items-center">
                          <Zap className="h-4 w-4 mr-2 text-red-600" />
                          Hard
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Describe your ride, route highlights, what to expect..."
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={4}
                  required
                />
              </div>

              {/* Location and Route */}
              <div className="space-y-2">
                <Label htmlFor="startLocation">Starting Location *</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="startLocation"
                    placeholder="e.g., Golden Gate Park, San Francisco"
                    value={formData.startLocation}
                    onChange={(e) => handleInputChange('startLocation', e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="distance">Distance (km) *</Label>
                  <Input
                    id="distance"
                    type="number"
                    placeholder="e.g., 25"
                    value={formData.distance}
                    onChange={(e) => handleInputChange('distance', e.target.value)}
                    min="1"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxParticipants">Max Participants *</Label>
                  <div className="relative">
                    <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      id="maxParticipants"
                      type="number"
                      placeholder="e.g., 10"
                      value={formData.maxParticipants}
                      onChange={(e) => handleInputChange('maxParticipants', e.target.value)}
                      className="pl-10"
                      min="2"
                      max="50"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Date and Time */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="date">Date *</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => handleInputChange('date', e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="time">Start Time *</Label>
                  <Input
                    id="time"
                    type="time"
                    value={formData.time}
                    onChange={(e) => handleInputChange('time', e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex gap-4 pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onNavigate('explore')}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  {loading ? 'Creating...' : 'Create Ride'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Tips Card */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-lg">Tips for Creating Great Rides</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• Be specific about the starting location and any landmarks</li>
              <li>• Include information about rest stops or scenic highlights</li>
              <li>• Mention if special equipment is needed (lights, repair kit, etc.)</li>
              <li>• Set realistic participant limits based on your route</li>
              <li>• Consider weather conditions and have a backup plan</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}