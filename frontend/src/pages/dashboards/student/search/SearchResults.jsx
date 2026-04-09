/**
 * @page SearchResults
 * @description Smart search results page with AI intent extraction. Shows both events and announcements.
 */
import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Search, FileText, Calendar, Sparkles, Clock, MapPin, Tag, Loader2 } from "lucide-react";
import searchService from "../../../../services/searchService";

export default function SearchResults() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = searchParams.get('q') || '';

  const [results, setResults] = useState({ events: [], announcements: [], total: 0 });
  const [intent, setIntent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (query) {
      performSearch();
    }
  }, [query]);

  const performSearch = async () => {
    if (!query.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const data = await searchService.smartSearch(query);
      setResults(data.data || data);
      setIntent(data.intent || null);
    } catch (err) {
      setError(err.message || "Search failed");
      console.error("Search error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    const newQuery = e.target.value;
    if (newQuery.trim()) {
      navigate(`/student/search?q=${encodeURIComponent(newQuery.trim())}`, { replace: true });
    }
  };

  const getMatchReason = (item) => {
    if (intent?.keywords) {
      return `Matches ${intent.keywords.slice(0, 3).join(', ')}`;
    }
    return `Matches '${query}'`;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="pt-8 px-6 pb-20 max-w-6xl mx-auto space-y-8">
      {/* Search Header */}
      <div className="glass p-6 rounded-2xl border border-border">
        <div className="flex items-center gap-4">
          <Search className="text-blue-400" size={24} />
          <input
            type="text"
            placeholder="Search events, announcements, tags..."
            defaultValue={query}
            onChange={handleSearchChange}
            className="bg-transparent w-full text-xl outline-none text-foreground placeholder:text-muted-foreground"
          />
        </div>

        {/* AI Intent Display */}
        {intent && Object.keys(intent).some(key => intent[key]) && (
          <div className="mt-4 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles size={14} className="text-blue-400" />
              <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">
                AI Extracted Intent
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {intent.keywords?.map((kw, i) => (
                <span key={i} className="px-2 py-1 bg-blue-500/20 text-blue-300 text-xs rounded">
                  {kw}
                </span>
              ))}
              {intent.eventType && intent.eventType !== 'null' && (
                <span className="px-2 py-1 bg-purple-500/20 text-purple-300 text-xs rounded">
                  {intent.eventType}
                </span>
              )}
              {intent.timeframe && intent.timeframe !== 'null' && (
                <span className="px-2 py-1 bg-emerald-500/20 text-emerald-300 text-xs rounded">
                  {intent.timeframe}
                </span>
              )}
              {intent.department && (
                <span className="px-2 py-1 bg-orange-500/20 text-orange-300 text-xs rounded">
                  {intent.department}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Results Summary */}
        {!loading && !error && (
          <p className="text-xs text-muted-foreground mt-3">
            Found {results.total} result{results.total !== 1 ? 's' : ''}
            {intent?.contentType && intent.contentType !== 'both' && ` in ${intent.contentType}s`}
          </p>
        )}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="animate-spin text-blue-400" size={48} />
          <p className="text-muted-foreground mt-4 text-sm">AI is searching...</p>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="glass p-8 rounded-2xl border border-red-500/30 text-center">
          <p className="text-red-400 font-bold">Search Failed</p>
          <p className="text-muted-foreground text-sm mt-2">{error}</p>
          <button
            onClick={performSearch}
            className="mt-4 px-4 py-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Results Section */}
      {!loading && !error && results.total > 0 && (
        <div className="space-y-12">
          {/* Events Section */}
          {results.events?.length > 0 && (
            <section>
              <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                <Calendar className="text-blue-400" size={20} />
                Events ({results.events.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {results.events.map((event) => (
                  <div
                    key={event._id}
                    onClick={() => navigate(`/student/events/${event._id}`)}
                    className="glass p-6 rounded-2xl border border-border hover:border-blue-500/30 transition-all group cursor-pointer"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <span className="text-[10px] font-black text-blue-400 uppercase tracking-wider bg-blue-500/10 px-2 py-1 rounded">
                        {event.priority || 'Medium'}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        {formatDate(event.date)}
                      </span>
                    </div>
                    <h3 className="text-foreground font-bold text-lg mb-2 group-hover:text-blue-400 transition-colors">
                      {event.title || 'Untitled Event'}
                    </h3>
                    <p className="text-muted-foreground text-sm line-clamp-2 mb-4">
                      {event.description || "No description available."}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      {event.location && (
                        <span className="flex items-center gap-1">
                          <MapPin size={12} /> {event.location}
                        </span>
                      )}
                      {event.tags?.length > 0 && (
                        <span className="flex items-center gap-1">
                          <Tag size={12} /> {event.tags.slice(0, 2).join(', ')}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Announcements Section */}
          {results.announcements?.length > 0 && (
            <section>
              <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                <FileText className="text-emerald-400" size={20} />
                Announcements ({results.announcements.length})
              </h2>
              <div className="space-y-4">
                {results.announcements.map((ann) => (
                  <div
                    key={ann._id}
                    onClick={() => navigate(`/student/announcements/${ann._id}`)}
                    className="glass p-6 rounded-2xl border border-border hover:border-emerald-500/30 transition-all group cursor-pointer"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-[10px] font-black text-emerald-400 uppercase tracking-wider bg-emerald-500/10 px-2 py-1 rounded">
                        {ann.type}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        {formatDate(ann.createdAt)}
                      </span>
                    </div>
                    <h3 className="text-foreground font-bold text-lg mb-2 group-hover:text-emerald-400 transition-colors">
                      {ann.title}
                    </h3>
                    <p className="text-muted-foreground text-sm line-clamp-2">
                      {ann.content}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && results.total === 0 && query && (
        <div className="text-center py-20">
          <p className="text-muted-foreground text-lg">No results found for "{query}"</p>
          <p className="text-muted-foreground text-sm mt-2">
            Try different keywords or check spelling
          </p>
        </div>
      )}

      {/* Initial State */}
      {!loading && !error && !query && (
        <div className="text-center py-20">
          <Search className="mx-auto text-muted-foreground mb-4" size={64} />
          <p className="text-muted-foreground">Enter a search term to begin</p>
        </div>
      )}
    </div>
  );
}
