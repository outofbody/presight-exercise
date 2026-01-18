import React from 'react';
import { X, Tag, Globe, Check, FilterX } from 'lucide-react';

interface FilterSidebarProps {
  hobbies: string[];
  nationalities: string[];
  selectedHobbies: string[];
  selectedNationalities: string[];
  onHobbyToggle: (hobby: string) => void;
  onNationalityToggle: (nationality: string) => void;
  onClose?: () => void;
}

export const FilterSidebar: React.FC<FilterSidebarProps> = ({
  hobbies,
  nationalities,
  selectedHobbies,
  selectedNationalities,
  onHobbyToggle,
  onNationalityToggle,
  onClose
}) => {
  const hasActiveFilters = selectedHobbies.length > 0 || selectedNationalities.length > 0;

  const clearAll = () => {
    selectedHobbies.forEach(onHobbyToggle);
    selectedNationalities.forEach(onNationalityToggle);
  };

  return (
    <div className="w-80 h-full bg-white flex flex-col border-r border-slate-200 shadow-2xl lg:shadow-none">
      {/* Sidebar Header */}
      <div className="p-6 border-b border-slate-100 bg-slate-50/50">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
            Filters
            {hasActiveFilters && (
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 text-white text-[10px] font-black animate-in zoom-in duration-300">
                {selectedHobbies.length + selectedNationalities.length}
              </span>
            )}
          </h2>
          {onClose && (
            <button
              onClick={onClose}
              className="lg:hidden p-2 rounded-xl text-slate-400 hover:text-slate-900 hover:bg-white transition-all shadow-sm"
              aria-label="Close filters"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
        
        {hasActiveFilters && (
          <button
            onClick={clearAll}
            className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-700 font-bold transition-all px-2 py-1 rounded-lg hover:bg-blue-50 -ml-2"
          >
            <FilterX className="w-3 h-3" />
            Clear all filters
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-9 custom-scrollbar">
        {/* Hobbies Group */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
              <Tag className="w-4 h-4 text-blue-600" />
            </div>
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Hobbies</h3>
          </div>
          <div className="grid grid-cols-1 gap-2">
            {hobbies.slice(0, 20).map((hobby) => {
              const isActive = selectedHobbies.includes(hobby);
              return (
                <button
                  key={hobby}
                  onClick={() => onHobbyToggle(hobby)}
                  className={`group flex items-center justify-between p-3 rounded-2xl border transition-all duration-200 text-left ${
                    isActive
                      ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-200'
                      : 'bg-white border-slate-100 text-slate-600 hover:border-blue-200 hover:bg-blue-50/30'
                  }`}
                >
                  <span className={`text-sm font-semibold ${isActive ? 'text-white' : 'text-slate-700'}`}>
                    {hobby}
                  </span>
                  <div className={`w-5 h-5 rounded-lg flex items-center justify-center transition-all ${
                    isActive ? 'bg-white/20' : 'bg-slate-50 group-hover:bg-blue-100'
                  }`}>
                    {isActive ? (
                      <Check className="w-3 h-3 text-white" strokeWidth={4} />
                    ) : (
                      <div className="w-1.5 h-1.5 rounded-full bg-slate-300 group-hover:bg-blue-400" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* Nationalities Group */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-violet-50 flex items-center justify-center">
              <Globe className="w-4 h-4 text-violet-600" />
            </div>
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Regions</h3>
          </div>
          <div className="grid grid-cols-1 gap-2">
            {nationalities.slice(0, 20).map((nationality) => {
              const isActive = selectedNationalities.includes(nationality);
              return (
                <button
                  key={nationality}
                  onClick={() => onNationalityToggle(nationality)}
                  className={`group flex items-center justify-between p-3 rounded-2xl border transition-all duration-200 text-left ${
                    isActive
                      ? 'bg-violet-600 border-violet-600 text-white shadow-lg shadow-violet-200'
                      : 'bg-white border-slate-100 text-slate-600 hover:border-violet-200 hover:bg-violet-50/30'
                  }`}
                >
                  <span className={`text-sm font-semibold ${isActive ? 'text-white' : 'text-slate-700'}`}>
                    {nationality}
                  </span>
                  <div className={`w-5 h-5 rounded-lg flex items-center justify-center transition-all ${
                    isActive ? 'bg-white/20' : 'bg-slate-50 group-hover:bg-violet-100'
                  }`}>
                    {isActive ? (
                      <Check className="w-3 h-3 text-white" strokeWidth={4} />
                    ) : (
                      <div className="w-1.5 h-1.5 rounded-full bg-slate-300 group-hover:bg-violet-400" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
};
