import { useState } from 'react';
import { Calendar, MapPin, Clock, Flag, AlertTriangle, Activity, Filter, ChevronDown, User, Ticket, Shield, Siren } from 'lucide-react';
import { matches, referees } from '../../data/mockData';
import { allTeams } from '../../data/teamsData';

export default function RefereeDashboard() {
  const [activeTab, setActiveTab] = useState<'profile' | 'schedule' | 'coupons' | 'cards'>('schedule');
  const [selectedField, setSelectedField] = useState<string>('all');
  const [selectedMatch, setSelectedMatch] = useState<string>('');
  const [selectedTeam, setSelectedTeam] = useState<string>('');
  const [selectedPlayer, setSelectedPlayer] = useState<string>('');
  const [cardType, setCardType] = useState<'yellow' | 'red'>('yellow');
  const [cardMinute, setCardMinute] = useState(0);

  // Get the logged-in referee (using first referee for demo)
  const referee = referees[0];
  
  // Get only matches assigned to this referee
  const assignedMatches = matches.filter(m => m.refereeId === referee?.id);
  
  // Filter by field
  const filteredMatches = selectedField === 'all' 
    ? assignedMatches 
    : assignedMatches.filter(m => m.field === selectedField);

  const getTeamPlayers = (teamId: string) => {
    const team = allTeams.find(t => t.id === teamId);
    return team?.players || [];
  };

  const handleIssueCard = () => {
    // Reset form
    setSelectedMatch('');
    setSelectedTeam('');
    setSelectedPlayer('');
    setCardMinute(0);
    alert(`Card issued successfully!`);
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'schedule', label: 'My Schedule', icon: Calendar },
    { id: 'coupons', label: 'Coupons', icon: Ticket },
    { id: 'cards', label: 'Issue Cards', icon: Siren },
  ];

  const refereeCoupons = [
    { id: 'c1', description: 'Lunch Voucher', code: 'REF-LUNCH-001', used: false },
    { id: 'c2', description: 'Beverage Voucher', code: 'REF-DRINK-001', used: false },
  ];

  return (
    <div className="space-y-6">
      {/* Referee Header */}
      <div className="pirates-card p-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-pirates-red/10 rounded-xl flex items-center justify-center">
            <Shield className="w-8 h-8 text-pirates-red" />
          </div>
          <div>
            <h2 className="font-heading text-2xl font-bold text-pirates-black">{referee?.name}</h2>
            <p className="text-pirates-gray-500">Tournament Referee</p>
            <div className="flex items-center gap-3 mt-1 text-sm text-pirates-gray-500">
              <span className="flex items-center gap-1">
                <Activity className="w-4 h-4" />
                {assignedMatches.length} Matches Assigned
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-colors ${
              activeTab === tab.id ? 'bg-pirates-red text-white shadow-md' : 'bg-white text-pirates-gray-600 hover:text-pirates-black border border-pirates-gray-200'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className="space-y-6">
          <div className="pirates-card p-6">
            <h3 className="section-title text-base mb-4">Referee Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-pirates-gray-500 text-sm mb-1">Full Name</label>
                <p className="text-pirates-black font-medium">{referee?.name}</p>
              </div>
              <div>
                <label className="block text-pirates-gray-500 text-sm mb-1">Email</label>
                <p className="text-pirates-black font-medium">{referee?.email}</p>
              </div>
              <div>
                <label className="block text-pirates-gray-500 text-sm mb-1">Phone</label>
                <p className="text-pirates-black font-medium">{referee?.phone}</p>
              </div>
              <div>
                <label className="block text-pirates-gray-500 text-sm mb-1">Matches Assigned</label>
                <p className="text-pirates-black font-medium">{assignedMatches.length}</p>
              </div>
            </div>
          </div>

          <div className="pirates-card p-6">
            <h3 className="section-title text-base mb-4">Today's Summary</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-pirates-gray-50 rounded-lg">
                <p className="font-heading text-2xl font-bold text-pirates-red">
                  {assignedMatches.filter(m => m.date === '2026-04-12').length}
                </p>
                <p className="text-pirates-gray-500 text-xs uppercase tracking-wider">Today's Matches</p>
              </div>
              <div className="text-center p-4 bg-pirates-gray-50 rounded-lg">
                <p className="font-heading text-2xl font-bold text-amber-500">2</p>
                <p className="text-pirates-gray-500 text-xs uppercase tracking-wider">Yellow Cards</p>
              </div>
              <div className="text-center p-4 bg-pirates-gray-50 rounded-lg">
                <p className="font-heading text-2xl font-bold text-pirates-red">0</p>
                <p className="text-pirates-gray-500 text-xs uppercase tracking-wider">Red Cards</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Schedule Tab - Only Referee's Matches */}
      {activeTab === 'schedule' && (
        <div className="space-y-6">
          {/* Field Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-pirates-gray-500" />
            <span className="text-pirates-gray-500 text-sm">Filter by Field:</span>
            {['all', 'Field A', 'Field B', 'Field C'].map((field) => (
              <button
                key={field}
                onClick={() => setSelectedField(field)}
                className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                  selectedField === field 
                    ? 'bg-pirates-red text-white' 
                    : 'bg-white text-pirates-gray-600 border border-pirates-gray-200 hover:border-pirates-red'
                }`}
              >
                {field === 'all' ? 'All Fields' : field}
              </button>
            ))}
          </div>

          {/* My Match Schedule */}
          <div className="pirates-card p-6">
            <h3 className="section-title text-base mb-4">My Assigned Matches</h3>
            
            {filteredMatches.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 text-pirates-gray-300 mx-auto mb-3" />
                <p className="text-pirates-gray-500">No matches assigned for the selected field</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredMatches.map((match) => (
                  <div key={match.id} className={`p-4 rounded-lg border-l-4 ${match.status === 'live' ? 'bg-pirates-red/5 border-l-pirates-red' : 'bg-pirates-gray-50 border-l-pirates-gray-300'}`}>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        {match.status === 'live' && (
                          <span className="bg-pirates-red text-white text-xs font-bold px-2 py-1 rounded live-indicator uppercase tracking-wider flex items-center gap-1">
                            <Activity className="w-3 h-3" />
                            Live
                          </span>
                        )}
                        <span className="text-pirates-gray-500 text-sm flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {match.time}
                        </span>
                        <span className="text-pirates-gray-500 text-sm flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {match.field || match.venue}
                        </span>
                      </div>
                      <span className="text-pirates-gray-400 text-xs bg-pirates-gray-100 px-2 py-1 rounded">{match.group}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="text-center flex-1">
                        <p className="font-heading text-lg font-bold text-pirates-black">{match.homeTeamName}</p>
                      </div>
                      <div className="px-4">
                        {match.status === 'scheduled' ? (
                          <span className="font-heading text-2xl font-bold text-pirates-gray-300">VS</span>
                        ) : (
                          <span className="font-heading text-3xl font-black text-pirates-red">{match.homeScore} - {match.awayScore}</span>
                        )}
                      </div>
                      <div className="text-center flex-1">
                        <p className="font-heading text-lg font-bold text-pirates-black">{match.awayTeamName}</p>
                      </div>
                    </div>

                    {match.status === 'live' && (
                      <div className="mt-4 flex gap-2">
                        <button 
                          onClick={() => { setSelectedMatch(match.id); setCardType('yellow'); }}
                          className="flex items-center gap-2 bg-amber-100 text-amber-700 px-3 py-1.5 rounded text-sm font-medium hover:bg-amber-200 transition-colors"
                        >
                          <Flag className="w-4 h-4" />
                          Issue Yellow
                        </button>
                        <button 
                          onClick={() => { setSelectedMatch(match.id); setCardType('red'); }}
                          className="flex items-center gap-2 bg-pirates-red/10 text-pirates-red px-3 py-1.5 rounded text-sm font-medium hover:bg-pirates-red/20 transition-colors"
                        >
                          <AlertTriangle className="w-4 h-4" />
                          Issue Red
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Coupons Tab */}
      {activeTab === 'coupons' && (
        <div className="space-y-6">
          <h3 className="section-title text-base mb-0">House Coupons</h3>
          <p className="text-pirates-gray-500">Show barcode at collection point for food and drinks</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {refereeCoupons.map((coupon) => (
              <div key={coupon.id} className="pirates-card p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h4 className="font-heading text-lg font-bold text-pirates-black">{coupon.description}</h4>
                    <p className="text-pirates-gray-500 text-sm">Code: {coupon.code}</p>
                  </div>
                  <div className={`px-3 py-1 rounded text-xs font-medium ${coupon.used ? 'bg-pirates-gray-200 text-pirates-gray-500' : 'bg-green-100 text-green-600'}`}>
                    {coupon.used ? 'Used' : 'Active'}
                  </div>
                </div>
                <div className="bg-pirates-gray-100 p-4 rounded-lg flex items-center justify-center">
                  <div className="w-full h-16 bg-white rounded flex items-center justify-center">
                    <div className="flex gap-1">
                      {[...Array(20)].map((_, i) => (
                        <div key={i} className={`w-1 h-12 ${i % 3 === 0 ? 'bg-pirates-black' : 'bg-pirates-gray-300'}`} />
                      ))}
                    </div>
                  </div>
                </div>
                <p className="text-center text-pirates-gray-500 text-xs mt-2">Scan at collection point</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Cards Tab */}
      {activeTab === 'cards' && (
        <div className="space-y-6">
          <div className="pirates-card p-6">
            <h3 className="section-title text-base mb-4">Issue Card</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-pirates-gray-700 text-sm mb-2 font-medium">Select Match</label>
                <select
                  value={selectedMatch}
                  onChange={(e) => setSelectedMatch(e.target.value)}
                  className="w-full border border-pirates-gray-200 rounded-lg px-4 py-3 text-pirates-black focus:outline-none focus:border-pirates-red"
                >
                  <option value="">Select a match</option>
                  {assignedMatches.map(m => (
                    <option key={m.id} value={m.id}>{m.homeTeamName} vs {m.awayTeamName} - {m.field}</option>
                  ))}
                </select>
              </div>

              {selectedMatch && (
                <>
                  <div>
                    <label className="block text-pirates-gray-700 text-sm mb-2 font-medium">Select Team</label>
                    <select
                      value={selectedTeam}
                      onChange={(e) => setSelectedTeam(e.target.value)}
                      className="w-full border border-pirates-gray-200 rounded-lg px-4 py-3 text-pirates-black focus:outline-none focus:border-pirates-red"
                    >
                      <option value="">Select a team</option>
                      {(() => {
                        const match = assignedMatches.find(m => m.id === selectedMatch);
                        return (
                          <>
                            <option value={match?.homeTeamId}>{match?.homeTeamName}</option>
                            <option value={match?.awayTeamId}>{match?.awayTeamName}</option>
                          </>
                        );
                      })()}
                    </select>
                  </div>

                  {selectedTeam && (
                    <div>
                      <label className="block text-pirates-gray-700 text-sm mb-2 font-medium">Select Player</label>
                      <div className="relative">
                        <select
                          value={selectedPlayer}
                          onChange={(e) => setSelectedPlayer(e.target.value)}
                          className="w-full border border-pirates-gray-200 rounded-lg px-4 py-3 pr-10 text-pirates-black appearance-none focus:outline-none focus:border-pirates-red"
                        >
                          <option value="">Select a player</option>
                          {getTeamPlayers(selectedTeam).map(player => (
                            <option key={player.id} value={player.id}>#{player.number} {player.name}</option>
                          ))}
                        </select>
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                          <ChevronDown className="w-5 h-5 text-pirates-red" />
                        </div>
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-pirates-gray-700 text-sm mb-2 font-medium">Card Type</label>
                    <div className="flex gap-3">
                      <button
                        onClick={() => setCardType('yellow')}
                        className={`flex-1 py-3 rounded-lg font-medium transition-colors ${
                          cardType === 'yellow' 
                            ? 'bg-amber-400 text-pirates-black' 
                            : 'bg-pirates-gray-100 text-pirates-gray-600'
                        }`}
                      >
                        Yellow Card
                      </button>
                      <button
                        onClick={() => setCardType('red')}
                        className={`flex-1 py-3 rounded-lg font-medium transition-colors ${
                          cardType === 'red' 
                            ? 'bg-pirates-red text-white' 
                            : 'bg-pirates-gray-100 text-pirates-gray-600'
                        }`}
                      >
                        Red Card
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-pirates-gray-700 text-sm mb-2 font-medium">Minute</label>
                    <input
                      type="number"
                      value={cardMinute}
                      onChange={(e) => setCardMinute(parseInt(e.target.value))}
                      className="w-full border border-pirates-gray-200 rounded-lg px-4 py-3 text-pirates-black focus:outline-none focus:border-pirates-red"
                      placeholder="Match minute"
                      min="0"
                      max="90"
                    />
                  </div>

                  <button
                    onClick={handleIssueCard}
                    disabled={!selectedPlayer}
                    className="w-full btn-primary disabled:opacity-50"
                  >
                    Issue Card
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Recent Cards */}
          <div className="pirates-card p-6">
            <h3 className="section-title text-base mb-4">Cards Issued Today</h3>
            <div className="space-y-3">
              {[
                { player: 'Eric Mathoho', team: 'Kaizer Chiefs U21', type: 'yellow', minute: 34 },
                { player: 'Grant Kekana', team: 'Mamelodi Sundowns U21', type: 'yellow', minute: 48 },
                { player: 'Thulani Hlatshwayo', team: 'SuperSport U21', type: 'red', minute: 67 },
              ].map((card, idx) => (
                <div key={idx} className="flex items-center gap-4 p-4 bg-pirates-gray-50 rounded-lg border border-pirates-gray-100">
                  <div className={`w-8 h-10 rounded ${card.type === 'yellow' ? 'bg-amber-400' : 'bg-pirates-red'}`} />
                  <div className="flex-1">
                    <p className="text-pirates-black font-medium">{card.player}</p>
                    <p className="text-pirates-gray-500 text-sm">{card.team}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-pirates-red font-mono font-bold">{card.minute}&apos;</p>
                    <p className="text-pirates-gray-400 text-xs uppercase">{card.type}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
