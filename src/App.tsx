import { useState, useRef, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import Hero from './components/Hero'
import { SearchFilters } from './components/Hero'
import PopularItems from './components/PopularItems'
import SearchResults from './components/SearchResults'
import PartnerLogos from './components/PartnerLogos'
import Footer from './components/Footer'
import About from './components/About'
import AdminPage from './components/AdminPage'
import NoResultsModal from './components/NoResultsModal'
import backgroundImage from './assets/background.png'
import { searchProducts } from './services/api'
import { Product } from './types/api'
import './App.css'

function Home() {
  const defaultFilters: SearchFilters = {
    sizes: [],
    genders: [],
    productType: "all",
  }

  const [searchResults, setSearchResults] = useState<Product[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [searchError, setSearchError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [activeFilters, setActiveFilters] = useState<SearchFilters>(defaultFilters)
  const [hasSearched, setHasSearched] = useState(false)
  const [showNoResultsModal, setShowNoResultsModal] = useState(false)
  const resultsRef = useRef<HTMLElement | null>(null)

  const isRetailCondition = (condition?: string | null) => {
    if (!condition) return false
    const normalized = condition.toLowerCase()
    return normalized.includes("new") || normalized.includes("nwt") || normalized.includes("retail")
  }

  const detectGender = (product: Product): "women" | "men" | "unisex" | "kids" | "unknown" => {
    const text = `${product.title} ${product.category ?? ""}`.toLowerCase()
    if (text.includes("women") || text.includes("womens") || text.includes("ladies")) return "women"
    if (text.includes("men") || text.includes("mens")) return "men"
    if (text.includes("unisex")) return "unisex"
    if (text.includes("kids") || text.includes("boy") || text.includes("girl")) return "kids"
    return "unknown"
  }

  const applyFilters = (products: Product[], filters: SearchFilters) => {
    return products.filter((product) => {
      if (filters.sizes.length > 0) {
        const productSize = product.size?.toLowerCase()
        if (!productSize || !filters.sizes.some((size) => productSize.includes(size.toLowerCase()))) {
          return false
        }
      }

      if (filters.genders.length > 0) {
        const detectedGender = detectGender(product)
        const matchesGender = filters.genders.some((gender) => gender.toLowerCase() === detectedGender)
        if (!matchesGender) {
          return false
        }
      }

      if (filters.productType === "second-hand" && isRetailCondition(product.condition)) {
        return false
      }

      if (filters.productType === "retail" && !isRetailCondition(product.condition)) {
        return false
      }

      return true
    })
  }

  const handleSearch = async (query: string, filters: SearchFilters) => {
    setSearchQuery(query)
    setActiveFilters(filters)
    setIsSearching(true)
    setSearchError(null)
    setHasSearched(true)
    setShowNoResultsModal(false)

    try {
      const products = await searchProducts(query)
      const filteredProducts = applyFilters(products, filters)
      setSearchResults(filteredProducts)
      if (filteredProducts.length === 0) {
        setShowNoResultsModal(true)
      }
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

  const showSearchResults =
    hasSearched &&
    (isSearching ||
      searchError != null ||
      searchResults.length > 0 ||
      (!isSearching && searchQuery.trim() !== ''))

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
            filters={activeFilters}
          />
        ) : (
          <>
        <PopularItems onPopularItemSearch={handleSearch} />
        <PartnerLogos />
          </>
        )}
      </main>
      <NoResultsModal
        isOpen={showNoResultsModal}
        onClose={() => setShowNoResultsModal(false)}
        searchQuery={searchQuery}
      />
    </>
  )
}

function App() {
  return (
    <Router>
      <div className="app">
        <Routes>
          <Route path="/home" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/" element={<Home />} />
          <Route path="*" element={<Home />} />
        </Routes>
        <Footer />
      </div>
    </Router>
  )
}

export default App



