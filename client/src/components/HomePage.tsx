import { useState, useEffect, useRef, FormEvent, KeyboardEvent } from 'react';
import { getSuggestions } from '../api';

interface Suggestion {
  lat: number;
  lng: number;
  address: string;
}

interface Props {
  onSearch: (lat: number, lng: number, address: string) => void;
  onAddSpot: (lat: number, lng: number) => void;
}

export function HomePage({ onSearch, onAddSpot }: Props) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState('');
  // Stores coords when user selects a suggestion, so Search reuses them directly
  const [selectedLocation, setSelectedLocation] = useState<Suggestion | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounced suggestion fetch while typing
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    // If user edits the text after picking a suggestion, clear the saved location
    setSelectedLocation(null);

    if (query.trim().length < 3) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      const results = await getSuggestions(query.trim());
      setSuggestions(results);
      setShowDropdown(results.length > 0);
      setActiveIndex(-1);
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function pickSuggestion(s: Suggestion) {
    setQuery(s.address);
    setSelectedLocation(s);      // ← save coords so Search can reuse them
    setShowDropdown(false);
    setSuggestions([]);
    onSearch(s.lat, s.lng, s.address);
  }

  async function handleSearch(e: FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;

    // If user picked a suggestion (coords already known), navigate directly
    if (selectedLocation) {
      onSearch(selectedLocation.lat, selectedLocation.lng, selectedLocation.address);
      return;
    }

    // If there's a keyboard-highlighted suggestion, use it
    if (activeIndex >= 0 && suggestions[activeIndex]) {
      pickSuggestion(suggestions[activeIndex]);
      return;
    }

    // If suggestions are loaded, use the top one
    if (suggestions.length > 0) {
      pickSuggestion(suggestions[0]);
      return;
    }

    // Last resort: fetch suggestions for whatever is typed
    setSearching(true);
    setError('');
    setShowDropdown(false);
    try {
      const results = await getSuggestions(query.trim());
      if (!results.length) {
        setError('Address not found. Try adding a city or zip code.');
        return;
      }
      const best = results[0];
      onSearch(best.lat, best.lng, best.address);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setSearching(false);
    }
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (!showDropdown || suggestions.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, -1));
    } else if (e.key === 'Escape') {
      setShowDropdown(false);
      setActiveIndex(-1);
    }
  }

  function handleAddSpot() {
    if (!navigator.geolocation) {
      onAddSpot(37.7749, -122.4194);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => onAddSpot(pos.coords.latitude, pos.coords.longitude),
      () => onAddSpot(37.7749, -122.4194)
    );
  }

  return (
    <div className="home-page">
      <div className="home-card">
        <div className="home-logo">P</div>
        <h1 className="home-title">Kevin's ParkSpot</h1>
        <p className="home-subtitle">Save and find your favourite parking spots</p>

        <form className="home-search-form" onSubmit={handleSearch}>
          <label className="home-label">Search for parking near</label>
          <div className="home-search-row" ref={containerRef}>
            <div className="home-input-wrap">
              <input
                type="text"
                className="home-input"
                placeholder="Enter an address or place..."
                value={query}
                autoComplete="off"
                autoFocus
                onChange={(e) => { setQuery(e.target.value); setError(''); }}
                onFocus={() => suggestions.length > 0 && setShowDropdown(true)}
                onKeyDown={handleKeyDown}
              />
              {showDropdown && suggestions.length > 0 && (
                <ul className="suggestions-dropdown">
                  {suggestions.map((s, i) => (
                    <li
                      key={i}
                      className={`suggestion-item ${i === activeIndex ? 'active' : ''}`}
                      onMouseDown={() => pickSuggestion(s)}
                      onMouseEnter={() => setActiveIndex(i)}
                    >
                      <span className="suggestion-icon">📍</span>
                      <span className="suggestion-text">{s.address}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <button
              type="submit"
              className="btn-primary home-search-btn"
              disabled={!query.trim() || searching}
            >
              {searching ? '...' : 'Search'}
            </button>
          </div>
          {error && <div className="home-error">{error}</div>}
        </form>

        <div className="home-divider">
          <span>or</span>
        </div>

        <button className="home-add-btn" onClick={handleAddSpot}>
          <span className="home-add-icon">+</span>
          Add a Parking Spot
        </button>
      </div>
    </div>
  );
}
