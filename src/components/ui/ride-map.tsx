import { useEffect, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import { Icon, LatLngBounds } from 'leaflet'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { MapPin, Calendar, Users, Clock, Zap } from 'lucide-react'
import type { Ride, User } from '@/types/ride'

// Custom marker icon
const createCustomIcon = (difficulty: string) => {
  const color = difficulty === 'Easy' ? '#10B981' : difficulty === 'Moderate' ? '#F59E0B' : '#EF4444'
  
  return new Icon({
    iconUrl: `data:image/svg+xml;base64,${btoa(`
      <svg width="25" height="41" viewBox="0 0 25 41" xmlns="http://www.w3.org/2000/svg">
        <path d="M12.5 0C5.6 0 0 5.6 0 12.5C0 19.4 12.5 41 12.5 41S25 19.4 25 12.5C25 5.6 19.4 0 12.5 0Z" fill="${color}"/>
        <circle cx="12.5" cy="12.5" r="6" fill="white"/>
      </svg>
    `)}`,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
  })
}

interface FitBoundsProps {
  rides: Ride[]
}

function FitBounds({ rides }: FitBoundsProps) {
  const map = useMap()
  
  useEffect(() => {
    if (rides.length > 0) {
      const bounds = new LatLngBounds(
        rides.map(ride => [ride.startLatitude, ride.startLongitude])
      )
      map.fitBounds(bounds, { padding: [20, 20] })
    }
  }, [rides, map])
  
  return null
}

interface RideMapProps {
  rides: Ride[]
  user: User | null
  onJoinRide: (rideId: string) => void
  onLeaveRide: (rideId: string) => void
}

export function RideMap({ rides, user, onJoinRide, onLeaveRide }: RideMapProps) {
  const mapRef = useRef<any>(null)

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

  // Default center (San Francisco) if no rides
  const defaultCenter: [number, number] = [37.7749, -122.4194]
  const center = rides.length > 0 
    ? [rides[0].startLatitude, rides[0].startLongitude] as [number, number]
    : defaultCenter

  return (
    <div className="h-[600px] w-full rounded-lg overflow-hidden shadow-sm">
      <MapContainer
        ref={mapRef}
        center={center}
        zoom={12}
        style={{ height: '100%', width: '100%' }}
        className="z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <FitBounds rides={rides} />
        
        {rides.map((ride) => {
          const isParticipant = user ? ride.participants.includes(user.id) : false
          const isCreator = user ? ride.createdBy === user.id : false
          const isFull = ride.currentParticipants >= ride.maxParticipants

          return (
            <Marker
              key={ride.id}
              position={[ride.startLatitude, ride.startLongitude]}
              icon={createCustomIcon(ride.difficulty)}
            >
              <Popup className="ride-popup" maxWidth={300}>
                <div className="p-2">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-lg leading-tight">{ride.title}</h3>
                    <Badge className={`${getDifficultyColor(ride.difficulty)} ml-2 flex-shrink-0`}>
                      {getDifficultyIcon(ride.difficulty)}
                      <span className="ml-1">{ride.difficulty}</span>
                    </Badge>
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-600 mb-2">
                    <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
                    <span className="truncate">{ride.startLocation}</span>
                  </div>
                  
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">{ride.description}</p>
                  
                  <div className="space-y-1 mb-3 text-sm text-gray-600">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2 flex-shrink-0" />
                      <span>{new Date(ride.date).toLocaleDateString()} at {ride.time}</span>
                    </div>
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-2 flex-shrink-0" />
                      <span>{ride.currentParticipants}/{ride.maxParticipants} participants</span>
                    </div>
                    <div>Distance: {ride.distance}km</div>
                    <div className="text-gray-500">Created by {ride.creatorName}</div>
                  </div>

                  {user && !isCreator && (
                    <div className="flex gap-2">
                      {isParticipant ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onLeaveRide(ride.id)}
                          className="flex-1"
                        >
                          Leave Ride
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() => onJoinRide(ride.id)}
                          disabled={isFull}
                          className="flex-1"
                        >
                          {isFull ? 'Full' : 'Join Ride'}
                        </Button>
                      )}
                    </div>
                  )}
                  
                  {user && isCreator && (
                    <Badge variant="secondary" className="w-full justify-center">
                      Your Ride
                    </Badge>
                  )}
                </div>
              </Popup>
            </Marker>
          )
        })}
      </MapContainer>
    </div>
  )
}