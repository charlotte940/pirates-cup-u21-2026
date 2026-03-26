import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Calendar, Bell, Trophy, Users, MapPin, 
  MessageSquare, AlertCircle, Settings, User, Shield, LogOut
} from 'lucide-react';
import { allTournamentMatches, calculateGroupStandings } from '../../data/tournamentSchedule';
import { getTeamLogo, getTeamPlayers } from '../../data/registeredTeams';
import { requestNotificationPermission } from '../../config/firebase';
import { toast } from 'sonner';

// Sponsorship banners - Updated for Pirates Cup U21 2026
const MOCK_BANNERS = [
  { id: '1', name: 'Pirates Cup U21 2026', imageUrl: '/pirates-cup-banner.jpg', linkUrl: '#' },
  { id: '2', name: 'Sponsor', imageUrl: '/sponsor-banner.jpg', linkUrl: '#' },
];

export default function TeamDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'schedule' | 'standings' | 'squad' | 'messages' | 'info'>('schedule');
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [teamName] = useState(user?.teamName || 'ORLANDO PIRATES');

  // Get team data from registered teams
  const teamLogo = getTeamLogo(teamName);
  const teamPlayers = getTeamPlayers(teamName);

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

  // Enable notifications
  const enableNotifications = async () => {
    const token = await requestNotificationPermission();
    if (token) {
      setNotificationsEnabled(true);
      toast.success('Team notifications enabled!', {
        description: 'You will receive updates for match reminders and schedule changes.',
      });
    }
  };

  // Squad data from registered teams
  const squad = teamPlayers.map((name, idx) => ({
    id: String(idx + 1),
    name,
    number: idx + 1,
    position: idx === 0 ? 'GK' : idx < 5 ? 'DEF' : idx < 9 ? 'MID' : 'FWD',
    goals: 0,
    yellowCards: 0,
    redCards: 0,
  }));

  // Check suspended players
  const suspendedPlayers = squad.filter(p => p.redCards >= 1 || p.yellowCards >= 2);

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Pirates Cup Banner */}
      {MOCK_BANNERS.length > 0 && (
        <div className="bg-white border-b border-gray-200">
          <a href={MOCK_BANNERS[0].linkUrl} className="block">
            <div className="h-24 bg-gradient-to-r from-pirates-red via-pirates-black to-pirates-red flex items-center justify-center text-white relative overflow-hidden">
              <div className="absolute inset-0 bg-[url('/pirates-pattern.png')] opacity-10" />
              <div className="relative text-center">
                <span className="text-2xl font-heading font-bold block">PIRATES CUP U21 2026</span>
                <span className="text-sm text-pirates-gold">Orlando Pirates Youth Development Tournament</span>
              </div>
            </div>
          </a>
        </div>
      )}

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
          <button
            onClick={enableNotifications}
            className={`p-2 rounded-full ${notificationsEnabled ? 'bg-green-500' : 'bg-white/20'}`}
          >
            <Bell className="w-5 h-5" />
          </button>
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
                <span className="text-sm font-medium">{player.name} (#{player.number})</span>
                <span className="text-xs text-red-600">
                  {player.redCards >= 1 ? 'Red Card' : '2 Yellow Cards'} - Cannot play next match
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upcoming Match Card */}
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
            <div className="flex items-center justify-center gap-4 text-sm text-pirates-gray-500">
              <span className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                UJ Sports Grounds
              </span>
              <span>Field {upcomingMatch.field}</span>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="p-4">
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
                    <div>
                      <p className={`font-medium ${match.homeTeam === teamName ? 'text-pirates-red' : 'text-pirates-black'}`}>
                        {match.homeTeam}
                      </p>
                      <p className={`font-medium ${match.awayTeam === teamName ? 'text-pirates-red' : 'text-pirates-black'}`}>
                        {match.awayTeam}
                      </p>
                    </div>
                    {match.status === 'completed' && (
                      <div className="text-right">
                        <p className="font-heading text-xl font-bold">{match.homeScore}-{match.awayScore}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

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
                <AlertCircle className="w-4 h-4 text-red-600" />
                Injuries
              </h3>
              <div className="space-y-2">
                {/* Mock injury data - in production this would come from match data */}
                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                      <span className="text-xs font-bold text-red-600">!</span>
                    </div>
                    <div>
                      <span className="text-sm font-medium block">No current injuries</span>
                      <span className="text-xs text-gray-400">All players fit for selection</span>
                    </div>
                  </div>
                  <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">Fit</span>
                </div>
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
                    <div>
                      <span className="text-sm font-medium">{player.name}</span>
                      <span className="text-xs text-pirates-gray-500 ml-2">#{player.number} • {player.position}</span>
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

        {activeTab === 'messages' && (
          <div className="space-y-4">
            <h2 className="font-heading text-lg font-bold text-pirates-black">Team Messages</h2>
            
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <MessageSquare className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-amber-800">Tournament Manager</p>
                  <p className="text-sm text-amber-700 mt-1">
                    Please arrive at your field 45 minutes before kickoff for team check-in.
                  </p>
                  <p className="text-xs text-amber-600 mt-2">2 hours ago</p>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-blue-800">Schedule Update</p>
                  <p className="text-sm text-blue-700 mt-1">
                    Your next match has been moved to Field B at 11:00.
                  </p>
                  <p className="text-xs text-blue-600 mt-2">Yesterday</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Info/Settings Tab Content */}
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
          <button className="w-full flex items-center justify-center gap-2 p-3 border border-red-200 rounded-xl text-red-600 hover:bg-red-50">
            <LogOut className="w-4 h-4" />
            <span className="text-sm font-medium">Logout</span>
          </button>
        </div>
      )}

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2">
        <div className="flex justify-around">
          {[
            { id: 'schedule', label: 'Schedule', icon: Calendar },
            { id: 'standings', label: 'Standings', icon: Trophy },
            { id: 'squad', label: 'Squad', icon: Users },
            { id: 'messages', label: 'Messages', icon: MessageSquare },
            { id: 'info', label: 'Info', icon: Settings },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex flex-col items-center gap-1 p-2 ${activeTab === tab.id ? 'text-pirates-red' : 'text-gray-400'}`}
            >
              <tab.icon className="w-5 h-5" />
              <span className="text-xs">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
