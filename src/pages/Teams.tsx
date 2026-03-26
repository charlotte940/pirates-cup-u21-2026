import { useState } from 'react';
import { Mail, Phone, ChevronDown, ChevronUp, Shirt } from 'lucide-react';
import { allTeams } from '../data/teamsData';
import type { Team, Player } from '../types';

export default function Teams() {
  const [expandedTeam, setExpandedTeam] = useState<string | null>(null);

  const toggleTeam = (teamId: string) => {
    setExpandedTeam(expandedTeam === teamId ? null : teamId);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="section-title">Participating Teams</h2>
        <span className="accent-block-red text-sm">{allTeams.length} Teams</span>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {allTeams.map((team: Team) => (
          <div key={team.id} className="pirates-card overflow-hidden">
            <button onClick={() => toggleTeam(team.id)} className="w-full p-6 flex items-center justify-between hover:bg-pirates-gray-50 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-pirates-red/10 rounded-xl flex items-center justify-center">
                  <Shirt className="w-7 h-7 text-pirates-red" />
                </div>
                <div className="text-left">
                  <h3 className="font-heading text-xl font-bold text-pirates-black">{team.name}</h3>
                  <p className="text-pirates-gray-500 text-sm">Group {team.group} • Coach: {team.coach}</p>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="hidden md:flex items-center gap-6">
                  <div className="text-center">
                    <p className="font-heading text-xl font-bold text-pirates-red">{team.points}</p>
                    <p className="text-pirates-gray-500 text-xs uppercase tracking-wider">Points</p>
                  </div>
                  <div className="text-center">
                    <p className="font-heading text-xl font-bold text-pirates-black">{team.played}</p>
                    <p className="text-pirates-gray-500 text-xs uppercase tracking-wider">Played</p>
                  </div>
                  <div className="text-center">
                    <p className="font-heading text-xl font-bold text-green-600">{team.won}</p>
                    <p className="text-pirates-gray-500 text-xs uppercase tracking-wider">Won</p>
                  </div>
                </div>
                {expandedTeam === team.id ? <ChevronUp className="w-6 h-6 text-pirates-gray-400" /> : <ChevronDown className="w-6 h-6 text-pirates-gray-400" />}
              </div>
            </button>

            {expandedTeam === team.id && (
              <div className="px-6 pb-6 border-t border-pirates-gray-100">
                <div className="grid grid-cols-4 gap-4 py-4 border-b border-pirates-gray-100">
                  <div className="text-center">
                    <p className="font-heading text-lg font-bold text-pirates-black">{team.played}</p>
                    <p className="text-pirates-gray-500 text-xs uppercase tracking-wider">Played</p>
                  </div>
                  <div className="text-center">
                    <p className="font-heading text-lg font-bold text-green-600">{team.won}</p>
                    <p className="text-pirates-gray-500 text-xs uppercase tracking-wider">Won</p>
                  </div>
                  <div className="text-center">
                    <p className="font-heading text-lg font-bold text-amber-500">{team.drawn}</p>
                    <p className="text-pirates-gray-500 text-xs uppercase tracking-wider">Drawn</p>
                  </div>
                  <div className="text-center">
                    <p className="font-heading text-lg font-bold text-pirates-red">{team.lost}</p>
                    <p className="text-pirates-gray-500 text-xs uppercase tracking-wider">Lost</p>
                  </div>
                </div>

                <div className="py-4 border-b border-pirates-gray-100">
                  <p className="text-pirates-gray-500 text-xs uppercase mb-2 font-medium tracking-wider">Contact</p>
                  <div className="flex flex-wrap gap-4">
                    <a href={`mailto:${team.contactEmail}`} className="flex items-center gap-2 text-pirates-gray-600 hover:text-pirates-red transition-colors text-sm">
                      <Mail className="w-4 h-4" />
                      {team.contactEmail}
                    </a>
                    <a href={`tel:${team.contactPhone}`} className="flex items-center gap-2 text-pirates-gray-600 hover:text-pirates-red transition-colors text-sm">
                      <Phone className="w-4 h-4" />
                      {team.contactPhone}
                    </a>
                  </div>
                </div>

                <div className="pt-4">
                  <p className="text-pirates-gray-500 text-xs uppercase mb-3 font-medium tracking-wider">Squad ({team.players.length} players)</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {team.players.map((player: Player) => (
                      <div key={player.id} className="flex items-center gap-3 bg-pirates-gray-50 rounded-xl p-3 border border-pirates-gray-100">
                        <div className="w-10 h-10 bg-pirates-red/10 rounded-lg flex items-center justify-center">
                          <span className="font-heading font-bold text-pirates-red">{player.number}</span>
                        </div>
                        <div className="min-w-0">
                          <p className="text-pirates-black text-sm font-medium truncate">{player.name}</p>
                          <p className="text-pirates-gray-500 text-xs">{player.position}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
