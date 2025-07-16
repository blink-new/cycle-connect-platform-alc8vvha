import { useState } from 'react'
import { Header } from '@/components/layout/Header'
import { HomePage } from '@/components/pages/HomePage'
import { ExplorePage } from '@/components/pages/ExplorePage'
import { CreateRidePage } from '@/components/pages/CreateRidePage'

function App() {
  const [currentPage, setCurrentPage] = useState('home')

  const handleNavigate = (page: string) => {
    setCurrentPage(page)
  }

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage onNavigate={handleNavigate} />
      case 'explore':
        return <ExplorePage onNavigate={handleNavigate} />
      case 'create':
        return <CreateRidePage onNavigate={handleNavigate} />
      default:
        return <HomePage onNavigate={handleNavigate} />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header currentPage={currentPage} onNavigate={handleNavigate} />
      {renderCurrentPage()}
    </div>
  )
}

export default App