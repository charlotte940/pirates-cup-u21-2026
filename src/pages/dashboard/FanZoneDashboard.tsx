import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Calendar, Bell, Trophy, Search, Star, 
  MapPin, Clock, Settings, Heart, X, Check, Activity
} from 'lucide-react';
import { allTournamentMatches, calculateGroupStandings, ladiesTeams, mensTeams } from '../../data/tournamentSchedule';
import { requestNotificationPermission } from '../../config/firebase';
import { toast } from 'sonner';

interface SponsorshipBanner {
  id: string;
  name: string;
  imageUrl: string;
  linkUrl?: string;
}

// Sponsorship banners
const MOCK_BANNERS: SponsorshipBanner[] = [
  { id: '1', name: 'Vodacom', imageUrl: '/sponsor-vodacom.jpg', linkUrl: 'https://www.vodacom.co.za' },
  { id: '2', name: 'Adidas', imageUrl: '/sponsor-adidas1.jpg', linkUrl: 'https://www.adidas.com' },
  { id: '3', name: 'Amstel', imageUrl: '/sponsor-amstel.jpg', linkUrl: '#' },
  { id: '4', name: 'Adidas', imageUrl: '/sponsor-adidas2.jpg', linkUrl: 'https://www.adidas.com' },
];

// Brand colors for divisions
const DIVISION_COLORS = {
  ladies: {
    bg: 'bg-pirates-red',
    bgLight: 'bg-red-50',
    bgMedium: 'bg-red-100',
    text: 'text-pirates-red',
    border: 'border-pirates-red',
    badge: 'bg-pirates-red/10 text-pirates-red',
  },
  mens: {
    bg: 'bg-pirates-black',
    bgLight: 'bg-gray-100',
    bgMedium: 'bg-gray-200',
    text: 'text-pirates-black',
    border: 'border-pirates-black',
    badge: 'bg-pirates-black/10 text-pirates-black',
  }
};

export default function FanZoneDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'myschedule' | 'standings' | 'allmatches' | 'settings'>('myschedule');
  const [followedTeams, setFollowedTeams] = useState<string[]>(user?.followedTeams || []);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGender, setSelectedGender] = useState<'all' | 'ladies' | 'mens'>('all');
  const [showTeamSelector, setShowTeamSelector] = useState(false);
  const [notificationPrefs, setNotificationPrefs] = useState({
    matchReminders: true,
    scheduleChanges: true,
    results: true,
    updates: true,
  });

  // Get personalized schedule for followed teams
  const mySchedule = followedTeams.length > 0
    ? allTournamentMatches.filter(m => 
        followedTeams.includes(m.homeTeam) || followedTeams.includes(m.awayTeam)
      ).sort((a, b) => new Date(a.date + 'T' + a.time).getTime() - new Date(b.date + 'T' + b.time).getTime())
    : [];

  // Get upcoming matches (next 24 hours)
  const upcomingMatches = mySchedule.filter(m => {
    const matchTime = new Date(m.date + 'T' + m.time);
    const now = new Date();
    const diffHours = (matchTime.getTime() - now.getTime()) / (1000 * 60 * 60);
    return diffHours > 0 && diffHours <= 24 && m.status === 'scheduled';
  });

  // Enable notifications
  const enableNotifications = async () => {
    const token = await requestNotificationPermission();
    if (token) {
      setNotificationsEnabled(true);
      toast.success('Notifications enabled!', {
        description: 'You will receive updates for your followed teams.',
      });
    }
  };

  // Toggle team follow
  const toggleFollowTeam = (teamName: string) => {
    setFollowedTeams(prev => {
      const newFollowed = prev.includes(teamName)
        ? prev.filter(t => t !== teamName)
        : [...prev, teamName];
      
      if (user) {
        user.followedTeams = newFollowed;
      }
      
      if (!prev.includes(teamName)) {
        toast.success(`Following ${teamName}`, {
          description: 'You will receive notifications for their matches.',
        });
      }
      
      return newFollowed;
    });
  };

  // Filter matches
  const filteredMatches = allTournamentMatches.filter(m => {
    const matchesGender = selectedGender === 'all' || m.gender === selectedGender;
    const matchesSearch = searchQuery === '' || 
      m.homeTeam.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.awayTeam.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesGender && matchesSearch;
  });

  // Get live standings
  const getLiveStandings = () => {
    const standings: Record<string, any[]> = {};
    
    Object.keys(ladiesTeams).forEach(group => {
      standings[`L-${group}`] = calculateGroupStandings(group, 'ladies');
    });
    
    Object.keys(mensTeams).forEach(group => {
      standings[`M-${group}`] = calculateGroupStandings(group, 'mens');
    });
    
    return standings;
  };

  const liveStandings = getLiveStandings();

  const getDivisionStyle = (gender: 'ladies' | 'mens') => DIVISION_COLORS[gender];

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-6">
      {/* Sponsorship Banner - Top with Action Image */}
      {MOCK_BANNERS.length > 0 && (
        <div className="relative h-32 md:h-48 overflow-hidden">
          <a href={MOCK_BANNERS[0].linkUrl} className="block w-full h-full">
            <img 
              src={MOCK_BANNERS[0].imageUrl} 
              alt={MOCK_BANNERS[0].name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end">
              <div className="p-4">
                <span className="bg-pirates-red text-white text-xs font-bold px-3 py-1 rounded uppercase tracking-wider">
                  Powered by {MOCK_BANNERS[0].name}
                </span>
              </div>
            </div>
          </a>
        </div>
      )}

      {/* Header */}
      <div className="bg-pirates-red text-white p-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div>
            <h1 className="font-heading text-xl font-bold">Pirates Cup U21</h1>
            <p className="text-sm text-white/80">18-19 March 2026</p>
          </div>
          <button
            onClick={enableNotifications}
            className={`p-2 rounded-full ${notificationsEnabled ? 'bg-green-500' : 'bg-white/20'}`}
          >
            <Bell className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Welcome / Follow Teams */}
      {followedTeams.length === 0 && (
        <div className="bg-amber-50 border-l-4 border-amber-500 p-4 m-4 rounded-lg max-w-7xl mx-auto">
          <div className="flex items-start gap-3">
            <Star className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-medium text-amber-800">Personalize Your Experience</h3>
              <p className="text-sm text-amber-700 mt-1">
                Follow your favorite teams to get a personalized match schedule and notifications.
              </p>
              <button
                onClick={() => setShowTeamSelector(true)}
                className="mt-2 px-4 py-2 bg-amber-500 text-white rounded-lg text-sm font-medium"
              >
                Select Teams to Follow
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upcoming Matches Alert */}
      {upcomingMatches.length > 0 && (
        <div className="bg-green-50 border-l-4 border-green-500 p-4 m-4 rounded-lg max-w-7xl mx-auto">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-5 h-5 text-green-600" />
            <h3 className="font-medium text-green-800">Upcoming Matches (Next 24h)</h3>
          </div>
          <div className="space-y-2">
            {upcomingMatches.slice(0, 3).map(match => (
              <div key={match.id} className="flex items-center justify-between bg-white p-2 rounded">
                <span className="text-sm font-medium">{match.homeTeam} vs {match.awayTeam}</span>
                <span className="text-sm text-green-600">{match.time}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="p-4 max-w-7xl mx-auto">
        {activeTab === 'myschedule' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-heading text-lg font-bold text-pirates-black">My Schedule</h2>
              <button
                onClick={() => setShowTeamSelector(true)}
                className="text-sm text-pirates-red font-medium"
              >
                Edit Teams
              </button>
            </div>

            {mySchedule.length === 0 ? (
              <div className="text-center py-8 text-pirates-gray-500">
                <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No teams followed yet</p>
                <button
                  onClick={() => setShowTeamSelector(true)}
                  className="mt-2 text-pirates-red font-medium"
                >
                  Follow teams to see their matches
                </button>
              </div>
            ) : (
              <div className="space-y-3 md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-4">
                {mySchedule.map(match => {
                  const style = getDivisionStyle(match.gender);
                  return (
                    <div key={match.id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                      <div className="flex items-center justify-between mb-2">
                        <span className={`text-xs font-medium px-2 py-1 rounded ${style.badge}`}>
                          {match.gender === 'ladies' ? 'Ladies' : 'Men\'s'} • {match.group}
                        </span>
                        <span className="text-xs text-pirates-gray-500">{match.date} • {match.time}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="font-medium text-pirates-black">{match.homeTeam}</p>
                          <p className="text-sm text-pirates-gray-500">vs</p>
                          <p className="font-medium text-pirates-black">{match.awayTeam}</p>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-1 text-sm text-pirates-gray-500">
                            <MapPin className="w-4 h-4" />
                            UJ Sports Grounds
                          </div>
                          <span className="text-sm font-medium text-pirates-red">Field {match.field}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {activeTab === 'standings' && (
          <div className="space-y-4">
            <h2 className="font-heading text-lg font-bold text-pirates-black">Live Standings</h2>
            
            {/* Gender Filter */}
            <div className="flex gap-2">
              {[
                { id: 'all', label: 'All', color: 'bg-pirates-gray-600' },
                { id: 'ladies', label: 'Ladies', color: 'bg-pirates-red' },
                { id: 'mens', label: 'Men\'s', color: 'bg-pirates-black' }
              ].map(gender => (
                <button
                  key={gender.id}
                  onClick={() => setSelectedGender(gender.id as any)}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium ${
                    selectedGender === gender.id
                      ? `${gender.color} text-white`
                      : 'bg-white text-pirates-gray-600 border border-gray-200'
                  }`}
                >
                  {gender.label}
                </button>
              ))}
            </div>

            {/* Standings by Group */}
            <div className="space-y-4 md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-4">
              {Object.entries(liveStandings)
                .filter(([group]) => selectedGender === 'all' || 
                  (selectedGender === 'ladies' && group.startsWith('L-')) ||
                  (selectedGender === 'mens' && group.startsWith('M-'))
                )
                .map(([group, teams]) => {
                  const isLadies = group.startsWith('L-');
                  const style = isLadies ? DIVISION_COLORS.ladies : DIVISION_COLORS.mens;
                  return (
                    <div key={group} className={`bg-white rounded-xl p-4 shadow-sm border ${style.border}`}>
                      <h3 className={`font-medium mb-3 ${style.text}`}>Group {group}</h3>
                      <div className="space-y-2">
                        {teams.map((team, idx) => (
                          <div key={team.name} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                            <div className="flex items-center gap-3">
                              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                                idx === 0 ? 'bg-green-500 text-white' :
                                idx === 1 ? 'bg-blue-500 text-white' :
                                'bg-gray-200 text-gray-600'
                              }`}>
                                {idx + 1}
                              </span>
                              <span className="text-sm font-medium">{team.name}</span>
                            </div>
                            <div className="flex items-center gap-4 text-sm">
                              <span className="text-pirates-gray-500">{team.played}P</span>
                              <span className={`font-bold ${style.text}`}>{team.points}pts</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {activeTab === 'allmatches' && (
          <div className="space-y-4">
            <h2 className="font-heading text-lg font-bold text-pirates-black">All Matches</h2>
            
            {/* Division Filter */}
            <div className="flex gap-2">
              {[
                { id: 'all', label: 'All Matches', color: 'bg-pirates-gray-600' },
                { id: 'ladies', label: 'Ladies Division', color: 'bg-pirates-red' },
                { id: 'mens', label: 'Men\'s Division', color: 'bg-pirates-black' }
              ].map(division => (
                <button
                  key={division.id}
                  onClick={() => setSelectedGender(division.id as any)}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium ${
                    selectedGender === division.id
                      ? `${division.color} text-white`
                      : 'bg-white text-pirates-gray-600 border border-gray-200'
                  }`}
                >
                  {division.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <Search className="w-5 h-5 text-pirates-gray-400" />
              <input
                type="text"
                placeholder="Search teams..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm"
              />
            </div>

            {/* Matches by Division */}
            <div className="space-y-6">
              {/* Ladies Matches */}
              {(selectedGender === 'all' || selectedGender === 'ladies') && (
                <div>
                  <h3 className="font-medium text-pirates-red mb-3 flex items-center gap-2">
                    <span className="w-3 h-3 bg-pirates-red rounded-full" />
                    Ladies Division
                  </h3>
                  <div className="space-y-3 md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-4">
                    {filteredMatches
                      .filter(m => m.gender === 'ladies')
                      .slice(0, 20)
                      .map(match => (
                        <div key={match.id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-medium px-2 py-1 rounded bg-pirates-red/10 text-pirates-red">
                              {match.group}
                            </span>
                            <button
                              onClick={() => toggleFollowTeam(match.homeTeam)}
                              className={`p-1 rounded ${followedTeams.includes(match.homeTeam) ? 'text-red-500' : 'text-gray-300'}`}
                            >
                              <Heart className="w-4 h-4" fill={followedTeams.includes(match.homeTeam) ? 'currentColor' : 'none'} />
                            </button>
                          </div>
                          <p className="font-medium text-pirates-black">{match.homeTeam} vs {match.awayTeam}</p>
                          <p className="text-sm text-pirates-gray-500">{match.date} • {match.time} • Field {match.field}</p>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* Men's Matches */}
              {(selectedGender === 'all' || selectedGender === 'mens') && (
                <div>
                  <h3 className="font-medium text-pirates-black mb-3 flex items-center gap-2">
                    <span className="w-3 h-3 bg-pirates-black rounded-full" />
                    Men's Division
                  </h3>
                  <div className="space-y-3 md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-4">
                    {filteredMatches
                      .filter(m => m.gender === 'mens')
                      .slice(0, 20)
                      .map(match => (
                        <div key={match.id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-medium px-2 py-1 rounded bg-pirates-black/10 text-pirates-black">
                              {match.group}
                            </span>
                            <button
                              onClick={() => toggleFollowTeam(match.homeTeam)}
                              className={`p-1 rounded ${followedTeams.includes(match.homeTeam) ? 'text-red-500' : 'text-gray-300'}`}
                            >
                              <Heart className="w-4 h-4" fill={followedTeams.includes(match.homeTeam) ? 'currentColor' : 'none'} />
                            </button>
                          </div>
                          <p className="font-medium text-pirates-black">{match.homeTeam} vs {match.awayTeam}</p>
                          <p className="text-sm text-pirates-gray-500">{match.date} • {match.time} • Field {match.field}</p>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-4">
            <h2 className="font-heading text-lg font-bold text-pirates-black">Notification Settings</h2>
            
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 space-y-4">
              {Object.entries(notificationPrefs).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between">
                  <span className="text-sm capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                  <button
                    onClick={() => setNotificationPrefs(prev => ({ ...prev, [key]: !value }))}
                    className={`w-12 h-6 rounded-full transition-colors ${value ? 'bg-green-500' : 'bg-gray-300'}`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full transition-transform ${value ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>
              ))}
            </div>

            <button
              onClick={() => setShowTeamSelector(true)}
              className="w-full py-3 bg-pirates-red text-white rounded-xl font-medium"
            >
              Manage Followed Teams
            </button>
          </div>
        )}
      </div>

      {/* Sponsorship Banner - Bottom (Mobile Only) with Action Image */}
      {MOCK_BANNERS.length > 1 && (
        <div className="fixed bottom-16 left-0 right-0 h-20 md:hidden">
          <a href={MOCK_BANNERS[1].linkUrl} className="block w-full h-full">
            <img 
              src={MOCK_BANNERS[1].imageUrl} 
              alt={MOCK_BANNERS[1].name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end justify-center pb-2">
              <span className="bg-pirates-black text-white text-xs font-bold px-3 py-1 rounded uppercase tracking-wider">
                {MOCK_BANNERS[1].name}
              </span>
            </div>
          </a>
        </div>
      )}

      {/* Bottom Navigation - Mobile */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 md:hidden">
        <div className="flex justify-around">
          {[
            { id: 'myschedule', label: 'My Schedule', icon: Calendar },
            { id: 'standings', label: 'Standings', icon: Trophy },
            { id: 'allmatches', label: 'Matches', icon: Activity },
            { id: 'settings', label: 'Settings', icon: Settings },
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

      {/* Desktop Navigation */}
      <div className="hidden md:flex fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-3 justify-center gap-8">
        {[
          { id: 'myschedule', label: 'My Schedule', icon: Calendar },
          { id: 'standings', label: 'Standings', icon: Trophy },
          { id: 'allmatches', label: 'All Matches', icon: Activity },
          { id: 'settings', label: 'Settings', icon: Settings },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg ${activeTab === tab.id ? 'bg-pirates-red text-white' : 'text-gray-600 hover:bg-gray-100'}`}
          >
            <tab.icon className="w-5 h-5" />
            <span className="text-sm font-medium">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Team Selector Modal */}
      {showTeamSelector && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end md:items-center md:justify-center">
          <div className="bg-white w-full max-h-[80vh] md:max-w-2xl md:rounded-2xl rounded-t-2xl p-4 overflow-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-heading text-lg font-bold">Select Teams to Follow</h3>
              <button onClick={() => setShowTeamSelector(false)}>
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4 md:grid md:grid-cols-2 md:gap-4">
              {/* Ladies Teams */}
              <div>
                <h4 className="font-medium text-pirates-red mb-2">Ladies Teams</h4>
                <div className="space-y-2 max-h-60 overflow-auto">
                  {Object.values(ladiesTeams).flat().map(team => (
                    <button
                      key={team}
                      onClick={() => toggleFollowTeam(team)}
                      className={`w-full flex items-center justify-between p-3 rounded-lg border ${
                        followedTeams.includes(team)
                          ? 'border-pirates-red bg-red-50'
                          : 'border-gray-200'
                      }`}
                    >
                      <span className="text-sm">{team}</span>
                      {followedTeams.includes(team) && <Check className="w-5 h-5 text-pirates-red" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Men's Teams */}
              <div>
                <h4 className="font-medium text-pirates-black mb-2">Men's Teams</h4>
                <div className="space-y-2 max-h-60 overflow-auto">
                  {Object.values(mensTeams).flat().map(team => (
                    <button
                      key={team}
                      onClick={() => toggleFollowTeam(team)}
                      className={`w-full flex items-center justify-between p-3 rounded-lg border ${
                        followedTeams.includes(team)
                          ? 'border-pirates-black bg-gray-100'
                          : 'border-gray-200'
                      }`}
                    >
                      <span className="text-sm">{team}</span>
                      {followedTeams.includes(team) && <Check className="w-5 h-5 text-pirates-black" />}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowTeamSelector(false)}
              className="w-full mt-4 py-3 bg-pirates-red text-white rounded-xl font-medium"
            >
              Done ({followedTeams.length} teams)
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
