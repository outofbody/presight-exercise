import React, { useState } from 'react';
import { Globe, Calendar, Heart, MapPin, ChevronDown, ChevronUp } from 'lucide-react';
import type { Person } from '../types';

interface PersonCardProps {
  person: Person;
}

export const PersonCard: React.FC<PersonCardProps> = ({ person }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const displayedHobbies = isExpanded ? person.hobbies : person.hobbies.slice(0, 2);
  const remainingCount = person.hobbies.length - 2;

  return (
    <div className={`group relative bg-white rounded-3xl p-5 border border-slate-100 shadow-sm hover:shadow-xl hover:border-blue-100 transition-all duration-500 ease-out overflow-hidden ${isExpanded ? 'ring-2 ring-blue-500/20' : ''}`}>
      {/* Decorative background element */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-50 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
      
      <div className="relative flex flex-col sm:flex-row gap-6">
        {/* Avatar Section */}
        <div className="relative shrink-0 flex justify-center sm:block">
          <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden shadow-inner bg-slate-50 border-4 border-white transition-transform duration-500 group-hover:rotate-2">
            <img
              src={person.avatar}
              alt={`${person.first_name} ${person.last_name}`}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              loading="lazy"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(person.first_name + ' ' + person.last_name)}&background=random&size=200`;
              }}
            />
          </div>
          {/* Nationality Flag/Indicator */}
          <div className="absolute -bottom-2 -right-2 sm:right-0 bg-white p-1.5 rounded-xl shadow-lg border border-slate-100">
            <div className="bg-slate-50 w-8 h-8 rounded-lg flex items-center justify-center overflow-hidden">
               <Globe className="w-4 h-4 text-blue-500" />
            </div>
          </div>
        </div>

        {/* Info Section */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-col h-full">
            <div className="mb-4">
              <div className="flex items-start justify-between gap-4 mb-2">
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 group-hover:text-blue-600 transition-colors truncate">
                  {person.first_name} {person.last_name}
                </h3>
              </div>
              
              <div className="flex flex-wrap items-center gap-y-2 gap-x-5 text-slate-500 text-sm font-medium">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center">
                    <MapPin className="w-3 h-3 text-slate-400" />
                  </div>
                  <span>{person.nationality}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center">
                    <Calendar className="w-3 h-3 text-slate-400" />
                  </div>
                  <span>{person.age} years old</span>
                </div>
              </div>
            </div>

            {/* Hobbies Section */}
            <div className="mt-auto">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">
                  <Heart className="w-3 h-3 text-rose-400" />
                  <span>Interests & Hobbies</span>
                </div>
                
                {person.hobbies.length > 2 && (
                  <button 
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="flex items-center gap-1 text-[10px] font-black text-blue-600 uppercase tracking-wider hover:text-blue-700 transition-colors"
                  >
                    {isExpanded ? (
                      <>Show Less <ChevronUp className="w-3 h-3" /></>
                    ) : (
                      <>View All <ChevronDown className="w-3 h-3" /></>
                    )}
                  </button>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                {displayedHobbies.map((hobby, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1.5 bg-slate-50 text-slate-700 text-xs font-bold rounded-xl border border-slate-200/50 group-hover:bg-blue-50/50 group-hover:border-blue-100 group-hover:text-blue-700 transition-all duration-300 animate-in fade-in zoom-in duration-300"
                  >
                    {hobby}
                  </span>
                ))}
                {!isExpanded && remainingCount > 0 && (
                  <button
                    onClick={() => setIsExpanded(true)}
                    className="px-3 py-1.5 bg-blue-600 text-white text-xs font-black rounded-xl border border-blue-600 shadow-sm hover:bg-blue-700 hover:shadow-blue-200 transition-all duration-300 active:scale-95"
                  >
                    +{remainingCount}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
