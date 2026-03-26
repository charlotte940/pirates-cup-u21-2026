import { useState } from 'react';
import { Calendar, MapPin, Clock, Trophy, Activity } from 'lucide-react';
import { matches } from '../data/mockData';

export default function Matches() {
  const [filter, setFilter] = useState<'all' | 'live' | 'scheduled' | 'completed'>('all');

  const filteredMatches = matches.filter(match => filter === 'all' ? true : match.status === filter);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'live':
        return <span className="bg-pirates-red text-white text-xs font-bold px-3 py-1 rounded live-indicator flex items-center gap-1 uppercase tracking-wider"><Activity className="w-3 h-3" />Live</span>;
      case 'completed':
        return <span className="bg-green-100 text-green-600 text-xs font-bold px-3 py-1 rounded uppercase tracking-wider">FT</span>;
      case 'scheduled':
        return <span className="bg-amber-100 text-amber-600 text-xs font-bold px-3 py-1 rounded uppercase tracking-wider">Upcoming</span>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="section-title">All Matches</h2>
        <div className="flex gap-2">
          {[
            { id: 'all', label: 'All' },
            { id: 'live', label: 'Live' },
            { id: 'scheduled', label: 'Upcoming' },
            { id: 'completed', label: 'Results' },
          ].map((f) => (
            <button key={f.id} onClick={() => setFilter(f.id as any)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === f.id ? 'bg-pirates-red text-white shadow-md' : 'bg-white text-pirates-gray-600 hover:text-pirates-black border border-pirates-gray-200'}`}>
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {filteredMatches.length === 0 ? (
          <div className="pirates-card p-12 text-center">
            <Trophy className="w-16 h-16 text-pirates-gray-300 mx-auto mb-4" />
            <p className="text-pirates-gray-500">No matches found</p>
          </div>
        ) : (
          filteredMatches.map((match) => (
            <div key={match.id} className={`pirates-card p-6 ${match.status === 'live' ? 'border-l-4 border-l-pirates-red' : ''}`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  {getStatusBadge(match.status)}
                  <span className="text-pirates-gray-500 text-sm flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {match.date}
                    <Clock className="w-4 h-4 ml-2" />
                    {match.time}
                  </span>
                </div>
                <span className="text-pirates-gray-500 text-xs bg-pirates-gray-100 px-3 py-1 rounded-full font-medium">{match.group || match.round}</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="text-center flex-1">
                  <p className="font-heading text-xl md:text-2xl font-bold text-pirates-black">{match.homeTeamName}</p>
                  <p className="text-pirates-gray-500 text-sm">Home</p>
                </div>
                <div className="px-4 md:px-8">
                  {match.status === 'scheduled' ? (
                    <div className="font-heading text-3xl font-bold text-pirates-gray-300">VS</div>
                  ) : (
                    <div className="font-heading text-4xl md:text-5xl font-black text-pirates-red">{match.homeScore} - {match.awayScore}</div>
                  )}
                </div>
                <div className="text-center flex-1">
                  <p className="font-heading text-xl md:text-2xl font-bold text-pirates-black">{match.awayTeamName}</p>
                  <p className="text-pirates-gray-500 text-sm">Away</p>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-pirates-gray-100 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-pirates-gray-500 text-sm">
                  <MapPin className="w-4 h-4" />
                  {match.venue}
                </div>
                {match.refereeName && <div className="text-pirates-gray-500 text-sm">Referee: {match.refereeName}</div>}
                {match.status === 'completed' && match.events.length > 0 && (
                  <button className="text-pirates-red text-sm font-medium hover:underline">View Match Details</button>
                )}
              </div>

              {(match.status === 'completed' || match.status === 'live') && match.events.length > 0 && (
                <div className="mt-4 pt-4 border-t border-pirates-gray-100">
                  <p className="text-pirates-gray-500 text-xs uppercase mb-2 font-medium tracking-wider">Key Events</p>
                  <div className="flex flex-wrap gap-2">
                    {match.events.slice(0, 5).map((event, idx) => (
                      <span key={idx} className="text-xs bg-pirates-gray-100 text-pirates-gray-600 px-3 py-1 rounded-full font-medium">{event.minute}&apos; {event.playerName} ({event.type})</span>
                    ))}
                    {match.events.length > 5 && <span className="text-xs text-pirates-gray-400 px-2">+{match.events.length - 5} more</span>}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
