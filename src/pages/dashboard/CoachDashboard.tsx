import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Calendar, Bell, Trophy, Users, MapPin, 
  AlertCircle, Settings, User, Shield, LogOut,
  CheckCircle, X, Clock, RefreshCw, Stethoscope
} from 'lucide-react';
import { allTournamentMatches, calculateGroupStandings } from '../../data/tournamentSchedule';
import { getTeamLogo, getTeamPlayers, REGISTERED_MENS_TEAMS, REGISTERED_LADIES_TEAMS } from '../../data/registeredTeams';
import { requestNotificationPermission, onForegroundMessage } from '../../config/firebase';
import { toast } from 'sonner';

// Sponsorship banners - Top and Bottom
const SPONSOR_BANNERS = {
  top: [
    { id: 'top1', name: 'Pirates Cup U21 2026', imageUrl: '/pirates-cup-banner.jpg', linkUrl: '#' },
  ],
  bottom: [
    { id: 'btm1', name: 'Sponsor', imageUrl: '/sponsor-banner.jpg', linkUrl: '#' },
  ]
};

// Notification types
interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'match' | 'schedule' | 'result' | 'update';
  timestamp: string;
  read: boolean;
}

// Lineup confirmation
interface LineupPlayer {
  id: string;
  name: string;
  number: number;
  photo?: string;
  confirmed: boolean;
}

// Match event for live recording
interface MatchEvent {
  id: string;
  type: 'substitution' | 'injury';
  playerName: string;
  playerNumber: number;
  minute: number;
  details?: string;
}

export default function CoachDashboard() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'schedule' | 'standings' | 'squad' | 'messages' | 'info' | 'live'>('schedule');
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [teamName] = useState(user?.teamName || 'ORLANDO PIRATES');
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  
  // Live match state
  const [liveMatch, setLiveMatch] = useState<typeof allTournamentMatches[0] | null>(null);
  const [matchEvents, setMatchEvents] = useState<MatchEvent[]>([]);
  const [showSubModal, setShowSubModal] = useState(false);
  const [showInjuryModal, setShowInjuryModal] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState('');
  const [eventDetails, setEventDetails] = useState('');
  const [matchMinute, setMatchMinute] = useState(0);

  // Lineup confirmation state
  const [showLineupModal, setShowLineupModal] = useState(false);
  const [lineup, setLineup] = useState<LineupPlayer[]>([]);

  // Get team data from registered teams
  const teamLogo = getTeamLogo(teamName);
  const teamPlayers = getTeamPlayers(teamName);
  
  // Get full team data with photos
  const fullTeamData = [...REGISTERED_MENS_TEAMS, ...REGISTERED_LADIES_TEAMS].find(t => t.name === teamName);

  // Get team matches
  const teamMatches = allTournamentMatches.filter(
    m => m.homeTeam === teamName || m.awayTeam === teamName
  ).sort((a, b) => new Date(a.date + 'T' + a.time).getTime() - new Date(b.date + 'T' + b.time).getTime());

  // Get upcoming match
  const upcomingMatch = teamMatches.find(m => m.status === 'scheduled');

  // Get group
  const teamGroup = teamMatches[0]?.group || 'M-A';
  const groupLetter = teamGroup.split('-')[1];
  const gender: 'ladies' | 'mens' = teamGroup.startsWith('L') ? 'ladies' : 'mens';

  // Get standings
  const standings = calculateGroupStandings(groupLetter, gender);
  const teamPosition = standings.findIndex(s => s.name === teamName) + 1;

  // Initialize notifications and foreground messages
  useEffect(() => {
    // Check if notifications already enabled
    const saved = localStorage.getItem('coach_notifications');
    if (saved === 'enabled') {
      setNotificationsEnabled(true);
    }

    // Subscribe to foreground messages
    const unsubscribe = onForegroundMessage((payload) => {
      const newNotif: AppNotification = {
        id: Date.now().toString(),
        title: payload.title || 'Pirates Cup U21',
        message: payload.body || 'New notification',
        type: 'update',
        timestamp: new Date().toISOString(),
        read: false,
      };
      setNotifications(prev => [newNotif, ...prev]);
      toast.info(payload.title, { description: payload.body });
    });

    // Load mock notifications
    setNotifications([
      { id: '1', title: 'Match Reminder', message: 'Your match vs Kaizer Chiefs starts in 1 hour', type: 'match', timestamp: new Date().toISOString(), read: false },
      { id: '2', title: 'Schedule Update', message: 'Your next match has been moved to Field B', type: 'schedule', timestamp: new Date(Date.now() - 3600000).toISOString(), read: true },
      { id: '3', title: 'New Result', message: 'Mamelodi Sundowns 2-1 Orlando Pirates', type: 'result', timestamp: new Date(Date.now() - 7200000).toISOString(), read: true },
    ]);

    return unsubscribe;
  }, []);

  // Enable notifications
  const enableNotifications = async () => {
    const token = await requestNotificationPermission();
    if (token) {
      setNotificationsEnabled(true);
      localStorage.setItem('coach_notifications', 'enabled');
      toast.success('Notifications enabled!', {
        description: 'You will receive updates for matches, schedule changes, and results.',
      });
    }
  };

  // Squad data with photos
  const squad = teamPlayers.map((name, _idx) => ({
    id: String(_idx + 1),
    name,
    number: _idx + 1,
    position: _idx === 0 ? 'GK' : _idx < 5 ? 'DEF' : _idx < 9 ? 'MID' : 'FWD',
    goals: 0,
    yellowCards: 0,
    redCards: 0,
    photo: fullTeamData?.players[_idx] ? `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random` : undefined,
  }));

  // Check suspended players
  const suspendedPlayers = squad.filter(p => p.redCards >= 1 || p.yellowCards >= 2);

  // Initialize lineup for confirmation
  const openLineupConfirmation = () => {
    const initialLineup = squad.slice(0, 16).map((p) => ({
      id: p.id,
      name: p.name,
      number: p.number,
      photo: p.photo,
      confirmed: false,
    }));
    setLineup(initialLineup);
    setShowLineupModal(true);
  };

  const togglePlayerConfirmed = (playerId: string) => {
    setLineup(prev => prev.map(p => 
      p.id === playerId ? { ...p, confirmed: !p.confirmed } : p
    ));
  };

  const submitLineup = () => {
    const confirmedCount = lineup.filter(p => p.confirmed).length;
    if (confirmedCount < 11) {
      toast.error('Please confirm at least 11 players');
      return;
    }
    toast.success('Starting lineup confirmed!', {
      description: `${confirmedCount} players confirmed for the match.`,
    });
    setShowLineupModal(false);
  };

  // Live match recording
  const startLiveMatch = (match: typeof allTournamentMatches[0]) => {
    setLiveMatch(match);
    setActiveTab('live');
    setMatchEvents([]);
    toast.success('Live match recording started');
  };

  const addSubstitution = () => {
    if (!selectedPlayer) return;
    const player = squad.find(p => p.id === selectedPlayer);
    if (player) {
      const newEvent: MatchEvent = {
        id: Date.now().toString(),
        type: 'substitution',
        playerName: player.name,
        playerNumber: player.number,
        minute: matchMinute,
        details: eventDetails,
      };
      setMatchEvents(prev => [...prev, newEvent]);
      toast.success(`Substitution recorded: ${player.name}`);
      setSelectedPlayer('');
      setEventDetails('');
      setShowSubModal(false);
    }
  };

  const addInjury = () => {
    if (!selectedPlayer) return;
    const player = squad.find(p => p.id === selectedPlayer);
    if (player) {
      const newEvent: MatchEvent = {
        id: Date.now().toString(),
        type: 'injury',
        playerName: player.name,
        playerNumber: player.number,
        minute: matchMinute,
        details: eventDetails,
      };
      setMatchEvents(prev => [...prev, newEvent]);
      toast.success(`Injury recorded: ${player.name}`);
      setSelectedPlayer('');
      setEventDetails('');
      setShowInjuryModal(false);
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Top Sponsor Banner */}
      <div className="bg-white border-b border-gray-200">
        <a href={SPONSOR_BANNERS.top[0].linkUrl} className="block">
          <div className="h-20 bg-gradient-to-r from-pirates-red via-pirates-black to-pirates-red flex items-center justify-center text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('/pirates-pattern.png')] opacity-10" />
            <div className="relative text-center">
              <span className="text-xl font-heading font-bold block">PIRATES CUP U21 2026</span>
              <span className="text-xs text-pirates-gold">Orlando Pirates Youth Development Tournament</span>
            </div>
          </div>
        </a>
      </div>

      {/* Team Header */}
      <div className="bg-pirates-red text-white p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {teamLogo ? (
              <img 
                src={teamLogo} 
                alt={teamName}
                className="w-16 h-16 object-contain rounded-lg bg-white p-1"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
            ) : (
              <div className="w-16 h-16 bg-white/20 rounded-lg flex items-center justify-center">
                <Trophy className="w-8 h-8 text-white" />
              </div>
            )}
            <div>
              <h1 className="font-heading text-xl font-bold">{teamName}</h1>
              <p className="text-sm text-white/80">Group {groupLetter} • Position {teamPosition}</p>
              <p className="text-xs text-white/60">{teamPlayers.length} Players Registered</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={enableNotifications}
              className={`p-2 rounded-full relative ${notificationsEnabled ? 'bg-green-500' : 'bg-white/20'}`}
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-amber-500 text-white text-xs rounded-full flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Suspended Players Alert */}
      {suspendedPlayers.length > 0 && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 m-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <h3 className="font-medium text-red-800">Suspended Players</h3>
          </div>
          <div className="space-y-2">
            {suspendedPlayers.map(player => (
              <div key={player.id} className="flex items-center justify-between bg-white p-2 rounded">
                <div className="flex items-center gap-2">
                  {player.photo && (
                    <img src={player.photo} alt={player.name} className="w-6 h-6 rounded-full" />
                  )}
                  <span className="text-sm font-medium">{player.name} (#{player.number})</span>
                </div>
                <span className="text-xs text-red-600">
                  {player.redCards >= 1 ? 'Red Card' : '2 Yellow Cards'} - Cannot play
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upcoming Match Card with Lineup Confirmation */}
      {upcomingMatch && (
        <div className="bg-white rounded-xl p-4 m-4 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium px-2 py-1 bg-green-100 text-green-700 rounded">
              Next Match
            </span>
            <span className="text-xs text-pirates-gray-500">{upcomingMatch.date} • {upcomingMatch.time}</span>
          </div>
          <div className="text-center py-4">
            <p className="text-lg font-bold text-pirates-black">
              {upcomingMatch.homeTeam === teamName ? 'HOME' : 'AWAY'}
            </p>
            <p className="text-2xl font-heading font-bold text-pirates-red my-2">
              vs {upcomingMatch.homeTeam === teamName ? upcomingMatch.awayTeam : upcomingMatch.homeTeam}
            </p>
            <div className="flex items-center justify-center gap-4 text-sm text-pirates-gray-500 mb-4">
              <span className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                UJ Sports Grounds
              </span>
              <span>Field {upcomingMatch.field}</span>
            </div>
            <button
              onClick={openLineupConfirmation}
              className="w-full py-2 bg-pirates-red text-white rounded-lg font-medium flex items-center justify-center gap-2"
            >
              <CheckCircle className="w-4 h-4" />
              Confirm Starting Lineup
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="p-4">
        {/* Schedule Tab */}
        {activeTab === 'schedule' && (
          <div className="space-y-4">
            <h2 className="font-heading text-lg font-bold text-pirates-black">Match Schedule</h2>
            
            <div className="space-y-3">
              {teamMatches.map((match, idx) => (
                <div key={match.id} className={`bg-white rounded-xl p-4 shadow-sm border ${
                  idx === 0 && match.status === 'scheduled' ? 'border-pirates-red' : 'border-gray-100'
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-pirates-gray-500">{match.date} • {match.time}</span>
                    <span className={`text-xs font-medium px-2 py-1 rounded ${
                      match.status === 'completed' ? 'bg-green-100 text-green-700' :
                      match.status === 'live' ? 'bg-red-100 text-red-700' :
                      'bg-amber-100 text-amber-700'
                    }`}>
                      {match.status === 'completed' ? 'Completed' : match.status === 'live' ? 'LIVE' : 'Upcoming'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {match.homeTeam === teamName && (
                        <img src={teamLogo || ''} alt="" className="w-6 h-6 rounded-full object-contain" />
                      )}
                      <p className={`font-medium ${match.homeTeam === teamName ? 'text-pirates-red' : 'text-pirates-black'}`}>
                        {match.homeTeam}
                      </p>
                    </div>
                    {match.status === 'completed' && (
                      <div className="text-right">
                        <p className="font-heading text-xl font-bold">{match.homeScore}-{match.awayScore}</p>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <div className="flex items-center gap-2">
                      {match.awayTeam === teamName && (
                        <img src={teamLogo || ''} alt="" className="w-6 h-6 rounded-full object-contain" />
                      )}
                      <p className={`font-medium ${match.awayTeam === teamName ? 'text-pirates-red' : 'text-pirates-black'}`}>
                        {match.awayTeam}
                      </p>
                    </div>
                  </div>
                  {match.status === 'live' && (
                    <button
                      onClick={() => startLiveMatch(match)}
                      className="w-full mt-3 py-2 bg-green-500 text-white rounded-lg font-medium flex items-center justify-center gap-2"
                    >
                      <Clock className="w-4 h-4" />
                      Record Match Events
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Standings Tab */}
        {activeTab === 'standings' && (
          <div className="space-y-4">
            <h2 className="font-heading text-lg font-bold text-pirates-black">Group Standings</h2>
            
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="space-y-2">
                {standings.map((team, idx) => (
                  <div key={team.name} className={`flex items-center justify-between py-3 border-b border-gray-100 last:border-0 ${
                    team.name === teamName ? 'bg-red-50 -mx-4 px-4' : ''
                  }`}>
                    <div className="flex items-center gap-3">
                      <span className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold ${
                        idx === 0 ? 'bg-green-500 text-white' :
                        idx === 1 ? 'bg-blue-500 text-white' :
                        'bg-gray-200 text-gray-600'
                      }`}>
                        {idx + 1}
                      </span>
                      <span className={`font-medium ${team.name === teamName ? 'text-pirates-red' : ''}`}>
                        {team.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-pirates-gray-500">{team.played}P</span>
                      <span className="font-bold text-pirates-red">{team.points}pts</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Team Stats */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center">
                <p className="text-2xl font-bold text-green-600">
                  {standings.find(s => s.name === teamName)?.won || 0}
                </p>
                <p className="text-xs text-pirates-gray-500">Wins</p>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center">
                <p className="text-2xl font-bold text-pirates-red">
                  {standings.find(s => s.name === teamName)?.points || 0}
                </p>
                <p className="text-xs text-pirates-gray-500">Points</p>
              </div>
            </div>
          </div>
        )}

        {/* Squad Tab */}
        {activeTab === 'squad' && (
          <div className="space-y-4">
            <h2 className="font-heading text-lg font-bold text-pirates-black">Team Squad</h2>
            
            {/* Top Scorers */}
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <h3 className="font-medium text-pirates-black mb-3">Top Scorers</h3>
              <div className="space-y-2">
                {squad
                  .filter(p => p.goals > 0)
                  .sort((a, b) => b.goals - a.goals)
                  .slice(0, 3)
                  .map((player, idx) => (
                    <div key={player.id} className="flex items-center justify-between py-2">
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center text-xs font-bold">
                          {idx + 1}
                        </span>
                        {player.photo && (
                          <img src={player.photo} alt={player.name} className="w-8 h-8 rounded-full" />
                        )}
                        <span className="text-sm">{player.name} (#{player.number})</span>
                      </div>
                      <span className="font-bold text-green-600">{player.goals} goals</span>
                    </div>
                  ))}
                {squad.filter(p => p.goals > 0).length === 0 && (
                  <p className="text-sm text-gray-400 text-center py-2">No goals scored yet</p>
                )}
              </div>
            </div>

            {/* Injuries Section */}
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <h3 className="font-medium text-pirates-black mb-3 flex items-center gap-2">
                <Stethoscope className="w-4 h-4 text-red-600" />
                Injuries
              </h3>
              <div className="space-y-2">
                {matchEvents.filter(e => e.type === 'injury').length === 0 ? (
                  <div className="flex items-center justify-between py-2 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      </div>
                      <div>
                        <span className="text-sm font-medium block">No current injuries</span>
                        <span className="text-xs text-gray-400">All players fit for selection</span>
                      </div>
                    </div>
                    <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">Fit</span>
                  </div>
                ) : (
                  matchEvents.filter(e => e.type === 'injury').map(injury => (
                    <div key={injury.id} className="flex items-center gap-3 py-2 border-b border-gray-100">
                      <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                        <AlertCircle className="w-4 h-4 text-red-600" />
                      </div>
                      <div>
                        <span className="text-sm font-medium">{injury.playerName}</span>
                        <span className="text-xs text-gray-400 block">{injury.details}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <p className="text-xs text-gray-400 mt-3">
                Injuries are updated after each match by the field manager.
              </p>
            </div>

            {/* Full Squad */}
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <h3 className="font-medium text-pirates-black mb-3">All Players</h3>
              <div className="space-y-2">
                {squad.map(player => (
                  <div key={player.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                    <div className="flex items-center gap-3">
                      {player.photo ? (
                        <img src={player.photo} alt={player.name} className="w-8 h-8 rounded-full object-cover" />
                      ) : (
                        <div className="w-8 h-8 bg-pirates-red/10 rounded-full flex items-center justify-center text-pirates-red font-bold text-xs">
                          {player.number}
                        </div>
                      )}
                      <div>
                        <span className="text-sm font-medium">{player.name}</span>
                        <span className="text-xs text-pirates-gray-500 ml-2">#{player.number} • {player.position}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {player.yellowCards > 0 && (
                        <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded text-xs">{player.yellowCards}Y</span>
                      )}
                      {player.redCards > 0 && (
                        <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded text-xs">{player.redCards}R</span>
                      )}
                      {player.goals > 0 && (
                        <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs">{player.goals}G</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Messages Tab */}
        {activeTab === 'messages' && (
          <div className="space-y-4">
            <h2 className="font-heading text-lg font-bold text-pirates-black">Notifications</h2>
            
            <div className="space-y-3">
              {notifications.map(notif => (
                <div key={notif.id} className={`bg-white rounded-xl p-4 shadow-sm border ${
                  notif.read ? 'border-gray-100' : 'border-pirates-red bg-red-50'
                }`}>
                  <div className="flex items-start justify-between">
                    <div>
                      <p className={`font-medium ${notif.read ? 'text-pirates-black' : 'text-pirates-red'}`}>
                        {notif.title}
                      </p>
                      <p className="text-sm text-pirates-gray-600 mt-1">{notif.message}</p>
                      <p className="text-xs text-pirates-gray-400 mt-2">
                        {new Date(notif.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                    {!notif.read && (
                      <span className="w-2 h-2 bg-pirates-red rounded-full" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Live Match Tab */}
        {activeTab === 'live' && liveMatch && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-heading text-lg font-bold text-pirates-black">Live Match</h2>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                <span className="text-sm text-red-600 font-medium">LIVE</span>
              </div>
            </div>

            {/* Match Info */}
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <p className="text-center text-lg font-bold">
                {liveMatch.homeTeam} vs {liveMatch.awayTeam}
              </p>
              <p className="text-center text-sm text-pirates-gray-500">
                Field {liveMatch.field} • {liveMatch.date}
              </p>
              
              {/* Match Minute Input */}
              <div className="mt-4 flex items-center justify-center gap-4">
                <span className="text-sm text-pirates-gray-500">Match Minute:</span>
                <input
                  type="number"
                  value={matchMinute}
                  onChange={(e) => setMatchMinute(parseInt(e.target.value) || 0)}
                  className="w-20 px-3 py-2 border border-gray-200 rounded-lg text-center"
                  min="0"
                  max="90"
                />
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setShowSubModal(true)}
                className="py-3 bg-blue-500 text-white rounded-lg font-medium flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Substitution
              </button>
              <button
                onClick={() => setShowInjuryModal(true)}
                className="py-3 bg-red-500 text-white rounded-lg font-medium flex items-center justify-center gap-2"
              >
                <Stethoscope className="w-4 h-4" />
                Injury
              </button>
            </div>

            {/* Match Events */}
            {matchEvents.length > 0 && (
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <h3 className="font-medium text-pirates-black mb-3">Match Events</h3>
                <div className="space-y-2">
                  {matchEvents.map(event => (
                    <div key={event.id} className="flex items-center gap-3 py-2 border-b border-gray-100 last:border-0">
                      <span className="text-xs font-medium px-2 py-1 bg-gray-100 rounded">
                        {event.minute}'
                      </span>
                      <span className={`w-2 h-2 rounded-full ${
                        event.type === 'substitution' ? 'bg-blue-500' : 'bg-red-500'
                      }`} />
                      <div className="flex-1">
                        <span className="text-sm font-medium">{event.playerName}</span>
                        <span className="text-xs text-gray-400 block">{event.details}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={() => { setLiveMatch(null); setActiveTab('schedule'); }}
              className="w-full py-3 bg-gray-200 text-gray-700 rounded-lg font-medium"
            >
              End Match Recording
            </button>
          </div>
        )}

        {/* Info/Settings Tab */}
        {activeTab === 'info' && (
          <div className="p-4 space-y-4">
            <h2 className="font-heading text-lg font-bold text-pirates-black">Team Information</h2>
            
            {/* Team Details Card */}
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <h3 className="font-medium text-pirates-black mb-3 flex items-center gap-2">
                <User className="w-4 h-4 text-pirates-red" />
                Team Details
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-sm text-pirates-gray-500">Team Name</span>
                  <span className="text-sm font-medium">{teamName}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-sm text-pirates-gray-500">Group</span>
                  <span className="text-sm font-medium">{groupLetter}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-sm text-pirates-gray-500">Division</span>
                  <span className="text-sm font-medium">{gender === 'ladies' ? 'Ladies' : "Men's"}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-sm text-pirates-gray-500">Players Registered</span>
                  <span className="text-sm font-medium">{teamPlayers.length}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-sm text-pirates-gray-500">Current Position</span>
                  <span className="text-sm font-medium">{teamPosition}</span>
                </div>
              </div>
            </div>

            {/* Account Settings Card */}
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <h3 className="font-medium text-pirates-black mb-3 flex items-center gap-2">
                <Settings className="w-4 h-4 text-pirates-red" />
                Account Settings
              </h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-pirates-gray-400" />
                    <span className="text-sm">Push Notifications</span>
                  </div>
                  <button
                    onClick={enableNotifications}
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      notificationsEnabled 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {notificationsEnabled ? 'Enabled' : 'Enable'}
                  </button>
                </div>
              </div>
            </div>

            {/* Support Card */}
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <h3 className="font-medium text-pirates-black mb-3 flex items-center gap-2">
                <Shield className="w-4 h-4 text-pirates-red" />
                Support
              </h3>
              <div className="space-y-2 text-sm text-pirates-gray-600">
                <p>For technical support, contact:</p>
                <p className="font-medium">support@piratescup.org</p>
                <p className="text-xs mt-2">Tournament Manager: +27 11 123 4567</p>
              </div>
            </div>

            {/* Logout Button */}
            <button 
              onClick={logout}
              className="w-full flex items-center justify-center gap-2 p-3 border border-red-200 rounded-xl text-red-600 hover:bg-red-50"
            >
              <LogOut className="w-4 h-4" />
              <span className="text-sm font-medium">Logout</span>
            </button>
          </div>
        )}
      </div>

      {/* Bottom Sponsor Banner */}
      <div className="fixed bottom-16 left-0 right-0 bg-white border-t border-gray-200">
        <a href={SPONSOR_BANNERS.bottom[0].linkUrl} className="block">
          <div className="h-12 bg-gradient-to-r from-gray-800 to-gray-900 flex items-center justify-center text-white">
            <span className="text-xs">Sponsored by {SPONSOR_BANNERS.bottom[0].name}</span>
          </div>
        </a>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 z-50">
        <div className="flex justify-around">
          {[
            { id: 'schedule', label: 'Schedule', icon: Calendar },
            { id: 'standings', label: 'Standings', icon: Trophy },
            { id: 'squad', label: 'Squad', icon: Users },
            { id: 'messages', label: 'Alerts', icon: Bell, badge: unreadCount },
            { id: 'info', label: 'Info', icon: Settings },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex flex-col items-center gap-1 p-2 relative ${activeTab === tab.id ? 'text-pirates-red' : 'text-gray-400'}`}
            >
              <tab.icon className="w-5 h-5" />
              <span className="text-xs">{tab.label}</span>
              {'badge' in tab && tab.badge && tab.badge > 0 && (
                <span className="absolute -top-1 right-0 w-4 h-4 bg-pirates-red text-white text-[10px] rounded-full flex items-center justify-center">
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Lineup Confirmation Modal */}
      {showLineupModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full max-h-[80vh] overflow-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-heading text-lg font-bold">Confirm Starting Lineup</h3>
              <button onClick={() => setShowLineupModal(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-gray-500 mb-4">
              Select players who will be available for the match (minimum 11)
            </p>
            <div className="space-y-2 mb-4">
              {lineup.map(player => (
                <label key={player.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer">
                  <input
                    type="checkbox"
                    checked={player.confirmed}
                    onChange={() => togglePlayerConfirmed(player.id)}
                    className="w-5 h-5 rounded border-gray-300 text-pirates-red"
                  />
                  {player.photo && (
                    <img src={player.photo} alt={player.name} className="w-8 h-8 rounded-full" />
                  )}
                  <div className="flex-1">
                    <span className="text-sm font-medium">{player.name}</span>
                    <span className="text-xs text-gray-400 ml-2">#{player.number}</span>
                  </div>
                  {player.confirmed && <CheckCircle className="w-4 h-4 text-green-500" />}
                </label>
              ))}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">
                {lineup.filter(p => p.confirmed).length} players selected
              </span>
              <button
                onClick={submitLineup}
                className="px-4 py-2 bg-pirates-red text-white rounded-lg font-medium"
              >
                Confirm Lineup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Substitution Modal */}
      {showSubModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h3 className="font-heading text-lg font-bold mb-4">Record Substitution</h3>
            <select
              value={selectedPlayer}
              onChange={(e) => setSelectedPlayer(e.target.value)}
              className="w-full p-3 border border-gray-200 rounded-lg mb-3"
            >
              <option value="">Select player</option>
              {squad.map(p => (
                <option key={p.id} value={p.id}>{p.name} (#{p.number})</option>
              ))}
            </select>
            <input
              type="text"
              value={eventDetails}
              onChange={(e) => setEventDetails(e.target.value)}
              placeholder="Substitution details (optional)"
              className="w-full p-3 border border-gray-200 rounded-lg mb-4"
            />
            <div className="flex gap-3">
              <button
                onClick={() => setShowSubModal(false)}
                className="flex-1 py-2 border border-gray-200 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={addSubstitution}
                className="flex-1 py-2 bg-blue-500 text-white rounded-lg"
              >
                Record
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Injury Modal */}
      {showInjuryModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h3 className="font-heading text-lg font-bold mb-4">Record Injury</h3>
            <select
              value={selectedPlayer}
              onChange={(e) => setSelectedPlayer(e.target.value)}
              className="w-full p-3 border border-gray-200 rounded-lg mb-3"
            >
              <option value="">Select player</option>
              {squad.map(p => (
                <option key={p.id} value={p.id}>{p.name} (#{p.number})</option>
              ))}
            </select>
            <input
              type="text"
              value={eventDetails}
              onChange={(e) => setEventDetails(e.target.value)}
              placeholder="Injury type/details"
              className="w-full p-3 border border-gray-200 rounded-lg mb-4"
            />
            <div className="flex gap-3">
              <button
                onClick={() => setShowInjuryModal(false)}
                className="flex-1 py-2 border border-gray-200 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={addInjury}
                className="flex-1 py-2 bg-red-500 text-white rounded-lg"
              >
                Record
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
