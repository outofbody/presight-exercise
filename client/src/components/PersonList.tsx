import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { SlidersHorizontal, Users, Loader2 } from 'lucide-react';
import { PersonCard } from './PersonCard';
import { FilterSidebar } from './FilterSidebar';
import { SearchBox } from './SearchBox';
import { fetchPeople, fetchFilters } from '../api/client';
import type { Person, FilterOptions } from '../types';

export const PersonList: React.FC = () => {
  const [people, setPeople] = useState<Person[]>([]);
  const [filters, setFilters] = useState<FilterOptions>({ hobbies: [], nationalities: [] });
  const [selectedHobbies, setSelectedHobbies] = useState<string[]>([]);
  const [selectedNationalities, setSelectedNationalities] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const parentRef = useRef<HTMLDivElement>(null);
  const loadingRef = useRef(false);

  const virtualizer = useVirtualizer({
    count: people.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 180,
    overscan: 5
  });

  const loadPeople = useCallback(async (pageNum: number, reset: boolean = false) => {
    if (loadingRef.current) return;
    
    loadingRef.current = true;
    setLoading(true);
    try {
      const response = await fetchPeople({
        page: pageNum,
        pageSize: 20,
        hobbies: selectedHobbies,
        nationalities: selectedNationalities,
        search: searchQuery
      });

      if (reset) {
        setPeople(response.data);
      } else {
        setPeople(prev => [...prev, ...response.data]);
      }
      
      setTotalCount(response.total);
      setHasMore(pageNum < response.totalPages);
    } catch (error) {
      console.error('Failed to load people:', error);
    } finally {
      loadingRef.current = false;
      setLoading(false);
    }
  }, [selectedHobbies, selectedNationalities, searchQuery]);

  useEffect(() => {
    const loadFilters = async () => {
      try {
        const filterOptions = await fetchFilters();
        setFilters(filterOptions);
      } catch (error) {
        console.error('Failed to load filters:', error);
      }
    };
    loadFilters();
  }, []);

  useEffect(() => {
    setPage(1);
    loadPeople(1, true);
  }, [selectedHobbies, selectedNationalities, searchQuery, loadPeople]);

  const handleScroll = useCallback(() => {
    if (!parentRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = parentRef.current;
    
    // Trigger load when 400px from bottom
    if (scrollTop + clientHeight >= scrollHeight - 400 && hasMore && !loading && !loadingRef.current) {
      setPage(prev => {
        const next = prev + 1;
        // Schedule the load after the state update to avoid race conditions
        setTimeout(() => loadPeople(next, false), 0);
        return next;
      });
    }
  }, [hasMore, loading, loadPeople]);

  useEffect(() => {
    const scrollElem = parentRef.current;
    if (scrollElem) {
      scrollElem.addEventListener('scroll', handleScroll);
      return () => scrollElem.removeEventListener('scroll', handleScroll);
    }
    return undefined;
  }, [handleScroll]);

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-slate-50">
      {/* Mobile Drawer Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden animate-in fade-in duration-300"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Filter Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 lg:z-auto w-80 transform transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <FilterSidebar
          hobbies={filters.hobbies}
          nationalities={filters.nationalities}
          selectedHobbies={selectedHobbies}
          selectedNationalities={selectedNationalities}
          onHobbyToggle={(hobby) => {
            setSelectedHobbies(prev =>
              prev.includes(hobby) ? prev.filter(h => h !== hobby) : [...prev, hobby]
            );
          }}
          onNationalityToggle={(nationality) => {
            setSelectedNationalities(prev =>
              prev.includes(nationality) ? prev.filter(n => n !== nationality) : [...prev, nationality]
            );
          }}
          onClose={() => setSidebarOpen(false)}
        />
      </aside>
      
      <main className="flex-1 flex flex-col min-w-0 bg-slate-50/50">
        {/* Top Header */}
        <div className="sticky top-0 z-20 px-6 py-8 bg-slate-50/80 backdrop-blur-md border-b border-slate-200/50">
          <div className="max-w-5xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                  Contacts
                  <span className="text-sm font-bold bg-blue-100 text-blue-600 px-3 py-1 rounded-full uppercase tracking-wider">
                    {totalCount} Found
                  </span>
                </h1>
                <p className="text-slate-500 mt-1 text-sm font-medium">Browse and filter through your global network</p>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="flex-1 md:w-80">
                  <SearchBox
                    value={searchQuery}
                    onChange={setSearchQuery}
                    placeholder="Search name..."
                  />
                </div>
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden p-3.5 bg-white border border-slate-200 rounded-2xl hover:bg-slate-50 transition-all shadow-sm active:scale-95"
                >
                  <SlidersHorizontal className="w-5 h-5 text-slate-600" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div ref={parentRef} className="flex-1 overflow-auto px-6 scroll-smooth">
          <div className="max-w-5xl mx-auto py-8">
            {people.length === 0 && !loading ? (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-6">
                  <Users className="w-10 h-10 text-slate-300" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">No contacts found</h3>
                <p className="text-slate-500">Try adjusting your filters or search terms.</p>
              </div>
            ) : (
              <div
                style={{
                  height: `${virtualizer.getTotalSize()}px`,
                  width: '100%',
                  position: 'relative'
                }}
              >
                {virtualizer.getVirtualItems().map((virtualItem) => {
                  const person = people[virtualItem.index];
                  if (!person) return null;
                  return (
                    <div
                      key={virtualItem.key}
                      data-index={virtualItem.index}
                      ref={virtualizer.measureElement}
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        transform: `translateY(${virtualItem.start}px)`,
                        paddingBottom: '1.5rem'
                      }}
                    >
                      <PersonCard person={person} />
                    </div>
                  );
                })}
              </div>
            )}

            {loading && (
              <div className="flex justify-center items-center py-12">
                <div className="flex items-center gap-3 px-6 py-3 bg-white rounded-2xl shadow-xl border border-slate-100">
                  <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                  <span className="text-sm font-bold text-slate-700">Fetching more contacts...</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};
