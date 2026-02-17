import { useState, useRef, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import Hero from './components/Hero'
import PopularItems from './components/PopularItems'
import SearchResults from './components/SearchResults'
import PartnerLogos from './components/PartnerLogos'
import Footer from './components/Footer'
import About from './components/About'
import backgroundImage from './assets/background.png'
import { searchProducts } from './services/api'
import { Product } from './types/api'
import './App.css'

function Home() {
  const [searchResults, setSearchResults] = useState<Product[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [searchError, setSearchError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [hasSearched, setHasSearched] = useState(false)
  const resultsRef = useRef<HTMLElement | null>(null)

  const handleSearch = async (query: string) => {
    setSearchQuery(query)
    setIsSearching(true)
    setSearchError(null)
    setHasSearched(true)

    try {
      const products = await searchProducts(query)
      setSearchResults(products)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred while searching'
      setSearchError(errorMessage)
      setSearchResults([])
      console.error('Search error:', error)
    } finally {
      setIsSearching(false)
    }
  }

  // Scroll to results when search is triggered
  useEffect(() => {
    if (hasSearched && resultsRef.current) {
      // Small delay to ensure DOM is updated
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start' 
        })
      }, 100)
    }
  }, [hasSearched, isSearching])

  const showSearchResults = hasSearched && (searchResults.length > 0 || isSearching || searchError)

  return (
    <>
      <div 
        className="header-hero-wrapper"
        style={{
          '--bg-image': `url(${backgroundImage})`
        } as React.CSSProperties}
      >
        <div className="header-hero-overlay"></div>
        <div className="header-hero-content">
          <Header />
          <Hero onSearch={handleSearch} />
        </div>
      </div>
      <main>
        {showSearchResults ? (
          <SearchResults
            ref={resultsRef}
            products={searchResults}
            isLoading={isSearching}
            error={searchError}
            searchQuery={searchQuery}
          />
        ) : (
          <>
        <PopularItems />
        <PartnerLogos />
          </>
        )}
      </main>
    </>
  )
}

function App() {
  return (
    <Router basename="/webcloset">
      <div className="app">
        <Routes>
          <Route path="/home" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/" element={<Home />} />
          <Route path="*" element={<Home />} />
        </Routes>
        <Footer />
      </div>
    </Router>
  )
}

export default App



