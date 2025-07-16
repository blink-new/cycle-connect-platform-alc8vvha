export interface Ride {
  id: string
  title: string
  description: string
  startLocation: string
  startLatitude: number
  startLongitude: number
  date: string
  time: string
  difficulty: 'Easy' | 'Moderate' | 'Hard'
  distance: number
  maxParticipants: number
  currentParticipants: number
  createdBy: string
  creatorName: string
  creatorEmail: string
  participants: string[]
  createdAt: string
  updatedAt: string
}

export interface User {
  id: string
  email: string
  displayName?: string
  avatar?: string
}