import { useState, useEffect } from 'react';
import { Trophy, Users, Calendar, TrendingUp, CheckCircle, Clock, Activity, MapPin, Zap, Shield, Search, Send, X, MessageSquare, Bell, Check, UserCheck, ClipboardList, FileText, AlertTriangle, FileDown, Star } from 'lucide-react';
import { matches, standings } from '../../data/mockData';
import { allTeams } from '../../data/teamsData';
import { announcementService, type Announcement } from '../../services/announcementService';
import { sendPushNotification } from '../../services/pushNotificationService';
import NotificationBell from '../../components/NotificationBell';
import { ladiesTeams, mensTeams, calculateGroupStandings, allTournamentMatches } from '../../data/tournamentSchedule';
import { REGISTERED_MENS_TEAMS, REGISTERED_LADIES_TEAMS } from '../../data/registeredTeams';

// Simulated live data
const LIVE_UPDATES = [
  { id: 1, type: 'card', message: 'Yellow card issued to Eric Mathoho (Kaizer Chiefs)', time: '2 mins ago', severity: 'warning', field: 'A', venue: 'UJ Sports Grounds' },
  { id: 2, type: 'goal', message: 'GOAL! Orlando Pirates U21 1-0 Kaizer Chiefs U21', time: '5 mins ago', severity: 'success', field: 'B', venue: 'UJ Sports Grounds' },
  { id: 3, type: 'checkin', message: 'Mamelodi Sundowns U21 checked in at Field B', time: '8 mins ago', severity: 'info', field: 'B', venue: 'UJ Sports Grounds' },
  { id: 4, type: 'goal', message: 'GOAL! SuperSport U21 equalizes 1-1', time: '12 mins ago', severity: 'success', field: 'A', venue: 'UJ Sports Grounds' },
];

// Group colors
const GROUP_COLORS: Record<string, string> = {
  'A': 'bg-blue-500',
  'B': 'bg-green-500',
  'C': 'bg-amber-500',
  'D': 'bg-purple-500',
  'E': 'bg-pink-500',
  'F': 'bg-cyan-500',
  'G': 'bg-orange-500',
  'H': 'bg-indigo-500',
};

// Mock field manager submissions
const MOCK_FIELD_SUBMISSIONS = [
  { id: 'sub-1', type: 'checklist', fieldManager: 'Field Manager - Field A', field: 'A', venue: 'UJ Sports Grounds', submittedAt: new Date(Date.now() - 3600000).toISOString(), status: 'completed', details: 'All 20 checklist items completed' },
  { id: 'sub-2', type: 'score', fieldManager: 'Field Manager - Field B', field: 'B', venue: 'UJ Sports Grounds', submittedAt: new Date(Date.now() - 1800000).toISOString(), status: 'verified', details: 'Orlando Pirates U21 2-1 Kaizer Chiefs U21' },
  { id: 'sub-3', type: 'report', fieldManager: 'Field Manager - Field C', field: 'C', venue: 'UJ Sports Grounds', submittedAt: new Date(Date.now() - 900000).toISOString(), status: 'pending', details: 'Match report for Mamelodi Sundowns vs SuperSport' },
];

// Mock match reports with injuries and substitutions
const MOCK_MATCH_REPORTS = [
  { 
    id: 'report-1', 
    matchId: 'm1', 
    homeTeam: 'Orlando Pirates U21', 
    awayTeam: 'Kaizer Chiefs U21', 
    score: '2-1', 
    field: 'A', 
    venue: 'UJ Sports Grounds', 
    submittedBy: 'Field Manager - Field A', 
    submittedAt: new Date(Date.now() - 1800000).toISOString(), 
    homeGoals: 2, 
    awayGoals: 1, 
    yellowCards: 3, 
    redCards: 0, 
    substitutions: 4, 
    injuries: 1,
    refereeName: 'John Smith',
    homePlayers: ['Player 1', 'Player 2', 'Player 3', 'Player 4', 'Player 5', 'Player 6', 'Player 7', 'Player 8', 'Player 9', 'Player 10', 'Player 11'],
    awayPlayers: ['Player A', 'Player B', 'Player C', 'Player D', 'Player E', 'Player F', 'Player G', 'Player H', 'Player I', 'Player J', 'Player K'],
    goalScorers: [
      { player: 'Thabo Mokoena', team: 'Orlando Pirates U21', minute: 23 },
      { player: 'Sibusiso Ndlovu', team: 'Orlando Pirates U21', minute: 67 },
      { player: 'Eric Mathoho', team: 'Kaizer Chiefs U21', minute: 45 },
    ],
    substitutionDetails: [
      { playerIn: 'Lungile Dlamini', playerOut: 'Thabo Mokoena', team: 'Orlando Pirates U21', minute: 55 },
      { playerIn: 'Kagiso Ramela', playerOut: 'Sibusiso Ndlovu', team: 'Orlando Pirates U21', minute: 78 },
    ],
    injuryDetails: [
      { player: 'Eric Mathoho', team: 'Kaizer Chiefs U21', type: 'Ankle sprain', minute: 85 },
    ],
  },
  { 
    id: 'report-2', 
    matchId: 'm2', 
    homeTeam: 'Mamelodi Sundowns U21', 
    awayTeam: 'SuperSport U21', 
    score: '1-1', 
    field: 'B', 
    venue: 'UJ Sports Grounds', 
    submittedBy: 'Field Manager - Field B', 
    submittedAt: new Date(Date.now() - 3600000).toISOString(), 
    homeGoals: 1, 
    awayGoals: 1, 
    yellowCards: 2, 
    redCards: 1, 
    substitutions: 3, 
    injuries: 0,
    refereeName: 'Mike Johnson',
    homePlayers: ['Player 1', 'Player 2', 'Player 3', 'Player 4', 'Player 5', 'Player 6', 'Player 7', 'Player 8', 'Player 9', 'Player 10', 'Player 11'],
    awayPlayers: ['Player A', 'Player B', 'Player C', 'Player D', 'Player E', 'Player F', 'Player G', 'Player H', 'Player I', 'Player J', 'Player K'],
    goalScorers: [
      { player: 'Lungile Dlamini', team: 'Mamelodi Sundowns U21', minute: 34 },
      { player: 'Themba Nkosi', team: 'SuperSport U21', minute: 56 },
    ],
    substitutionDetails: [
      { playerIn: 'Sifiso Ndlovu', playerOut: 'Lungile Dlamini', team: 'Mamelodi Sundowns U21', minute: 65 },
    ],
    injuryDetails: [],
  },
];

export default function ManagerDashboard() {
  const [activeView, setActiveView] = useState<'overview' | 'matches' | 'teams' | 'live' | 'standings' | 'submissions' | 'reports' | 'announcements' | 'summary'>('overview');
  const [activeDivision, setActiveDivision] = useState<'ladies' | 'mens'>('ladies');
  const [liveUpdates] = useState(LIVE_UPDATES);
  
  // Division-specific live updates
  const ladiesLiveUpdates = LIVE_UPDATES.filter(u => 
    u.message.toLowerCase().includes('ladies') || 
    Object.values(ladiesTeams).flat().some(t => u.message.includes(t.split(' U21')[0]))
  );
  const mensLiveUpdates = LIVE_UPDATES.filter(u => 
    u.message.toLowerCase().includes('men') || 
    Object.values(mensTeams).flat().some(t => u.message.includes(t.split(' U21')[0]))
  );
  const [notifications] = useState(4);
  const [teamSearch, setTeamSearch] = useState('');
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);
  const [announcementText, setAnnouncementText] = useState('');
  const [announcementSent, setAnnouncementSent] = useState(false);
  const [announcementPriority, setAnnouncementPriority] = useState<'low' | 'normal' | 'high' | 'urgent'>('normal');
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [fieldManagers] = useState(announcementService.getFieldManagers());
  const [selectedRecipients, setSelectedRecipients] = useState<string[]>([]);
  const [sendToAll, setSendToAll] = useState(true);
  const [fieldSubmissions] = useState(MOCK_FIELD_SUBMISSIONS);
  const [matchReports] = useState(MOCK_MATCH_REPORTS);

  // Calculate player highlights from match events
  const getPlayerHighlights = () => {
    const playerStats: Record<string, { name: string; team: string; goals: number; yellowCards: number; redCards: number; totalCards: number }> = {};
    
    matches.forEach(match => {
      match.events?.forEach(event => {
        if (!event.playerName) return;
        const key = `${event.playerName}-${match.homeTeamId}`;
        if (!playerStats[key]) {
          playerStats[key] = {
            name: event.playerName || 'Unknown',
            team: match.homeTeamName || '',
            goals: 0,
            yellowCards: 0,
            redCards: 0,
            totalCards: 0
          };
        }
        
        if (event.type === 'goal') playerStats[key].goals++;
        if (event.type === 'yellowcard') {
          playerStats[key].yellowCards++;
          playerStats[key].totalCards++;
        }
        if (event.type === 'redcard') {
          playerStats[key].redCards++;
          playerStats[key].totalCards++;
        }
      });
    });
    
    const players = Object.values(playerStats);
    const topScorers = [...players].sort((a, b) => b.goals - a.goals).slice(0, 5).filter(p => p.goals > 0);
    const mostCards = [...players].sort((a, b) => b.totalCards - a.totalCards).slice(0, 5).filter(p => p.totalCards > 0);
    
    return { topScorers, mostCards };
  };

  const { topScorers, mostCards } = getPlayerHighlights();

  // Generate PDF for match report
  const generateMatchReportPDF = (report: typeof matchReports[0]) => {
    const content = `
PIRATES CUP U21 2026 - MATCH REPORT
=====================================

MATCH DETAILS
-------------
Match: ${report.homeTeam} vs ${report.awayTeam}
Final Score: ${report.score}
Venue: ${report.venue}
Field: ${report.field}
Referee: ${report.refereeName || 'TBD'}
Submitted by: ${report.submittedBy}
Date: ${new Date(report.submittedAt).toLocaleString()}

TEAM LINEUPS
------------
${report.homeTeam}:
${report.homePlayers?.map((p: string) => `  • ${p}`).join('\n') || '  No lineup recorded'}

${report.awayTeam}:
${report.awayPlayers?.map((p: string) => `  • ${p}`).join('\n') || '  No lineup recorded'}

MATCH STATISTICS
----------------
Yellow Cards: ${report.yellowCards}
Red Cards: ${report.redCards}
Substitutions: ${report.substitutions || 0}
Injuries: ${report.injuries || 0}

GOAL SCORERS
------------
${report.goalScorers?.map((g: {player: string, team: string, minute: number}) => 
  `  • ${g.player} (${g.team}) - ${g.minute}'`
).join('\n') || '  No goals recorded'}

SUBSTITUTIONS
-------------
${report.substitutionDetails?.map((s: {playerIn: string, playerOut: string, team: string, minute: number}) => 
  `  • ${s.minute}': ${s.playerIn} IN, ${s.playerOut} OUT (${s.team})`
).join('\n') || '  No substitutions recorded'}

INJURIES
--------
${report.injuryDetails?.map((i: {player: string, team: string, type: string, minute: number}) => 
  `  • ${i.minute}': ${i.player} (${i.team}) - ${i.type}`
).join('\n') || '  No injuries reported'}

CARD RULES
----------
- 2 Yellow Cards = Suspended from next match
- 1 Red Card = Immediate suspension + next match suspension

Generated by Pirates Cup Tournament Management System
    `;
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Match-Report-${report.homeTeam}-vs-${report.awayTeam}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Simulate live updates
  useEffect(() => {
    const interval = setInterval(() => {
      // In real app, this would fetch from API
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  // Subscribe to announcements
  useEffect(() => {
    const unsubscribe = announcementService.subscribe((newAnnouncement) => {
      setAnnouncements(prev => [newAnnouncement, ...prev]);
    });
    return unsubscribe;
  }, []);

  // Load existing announcements
  useEffect(() => {
    setAnnouncements(announcementService.getAllAnnouncements());
  }, []);

  const activeMatches = matches.filter(m => m.status === 'live');
  const upcomingMatches = matches.filter(m => m.status === 'scheduled');
  const completedMatches = matches.filter(m => m.status === 'completed');

  const totalTeams = Object.values(ladiesTeams).flat().length + Object.values(mensTeams).flat().length;
  
  const stats = [
    { label: 'Total Teams', value: totalTeams, icon: Users, color: 'bg-blue-100 text-blue-600' },
    { label: 'Matches Played', value: completedMatches.length, icon: CheckCircle, color: 'bg-green-100 text-green-600' },
    { label: 'Live Matches', value: activeMatches.length, icon: Activity, color: 'bg-red-100 text-red-600' },
    { label: 'Upcoming', value: upcomingMatches.length, icon: Clock, color: 'bg-amber-100 text-amber-600' },
  ];

  const totalCards = allTeams.reduce((acc, team) => 
    acc + team.players.reduce((pAcc, player) => 
      pAcc + (player.stats?.yellowCards || 0) + (player.stats?.redCards || 0), 0
    ), 0
  );

  // Get standings by group - used for group stage display
  const _standingsByGroup = standings.reduce((acc, standing) => {
    const team = allTeams.find(t => t.id === standing.teamId);
    if (team) {
      if (!acc[team.group]) acc[team.group] = [];
      acc[team.group].push(standing);
    }
    return acc;
  }, {} as Record<string, typeof standings>);
  void _standingsByGroup; // Suppress unused variable warning

  // Filter teams for search
  const filteredTeams = allTeams.filter(team => 
    team.name.toLowerCase().includes(teamSearch.toLowerCase()) ||
    team.coach.toLowerCase().includes(teamSearch.toLowerCase()) ||
    team.group.toLowerCase().includes(teamSearch.toLowerCase())
  );

  const sendAnnouncement = async () => {
    if (!announcementText.trim()) return;
    
    const result = await announcementService.sendAnnouncement(
      'Tournament Manager',
      announcementText,
      {
        priority: announcementPriority,
        allFieldManagers: sendToAll,
        to: sendToAll ? undefined : selectedRecipients
      }
    );

    if (result.success) {
      // Also send push notification
      await sendPushNotification(
        { userId: 'all', role: 'fieldmanager' },
        {
          title: `Pirates Cup - ${announcementService.getPriorityLabel(announcementPriority)} Priority`,
          body: announcementText,
          data: { type: 'announcement', priority: announcementPriority }
        }
      );

      setAnnouncementSent(true);
      setAnnouncements(prev => result.announcement ? [result.announcement, ...prev] : prev);
      setTimeout(() => {
        setAnnouncementSent(false);
        setAnnouncementText('');
        setShowAnnouncementModal(false);
      }, 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Notification Bell */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex flex-wrap gap-2">
          {[
            { id: 'overview', label: 'Overview', icon: Shield },
            { id: 'summary', label: 'Summary', icon: Activity },
            { id: 'live', label: 'Live Updates', icon: Zap, badge: notifications },
            { id: 'matches', label: 'Matches', icon: Calendar },
            { id: 'teams', label: 'Teams', icon: Users },
            { id: 'standings', label: 'Standings', icon: Trophy },
            { id: 'submissions', label: 'Submissions', icon: ClipboardList, badge: fieldSubmissions.filter(s => s.status === 'pending').length },
            { id: 'reports', label: 'Match Reports', icon: FileText, badge: matchReports.length },
            { id: 'announcements', label: 'Announcements', icon: Bell, badge: announcements.filter(a => a.acknowledgedBy.length < a.to.length).length },
          ].map((view) => (
            <button key={view.id} onClick={() => setActiveView(view.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-colors relative ${activeView === view.id ? 'bg-pirates-red text-white shadow-md' : 'bg-white text-pirates-gray-600 hover:text-pirates-black border border-pirates-gray-200'}`}>
              <view.icon className="w-4 h-4" />
              {view.label}
              {'badge' in view && view.badge && view.badge > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-pirates-red text-white text-xs rounded-full flex items-center justify-center">{view.badge}</span>
              )}
            </button>
          ))}
        </div>
        <NotificationBell userRole="manager" />
      </div>



      {/* Overview */}
      {activeView === 'overview' && (
        <>
          {/* Main Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat, index) => (
              <div key={index} className="pirates-card p-4">
                <div className={`w-10 h-10 rounded-lg ${stat.color} flex items-center justify-center mb-3`}>
                  <stat.icon className="w-5 h-5" />
                </div>
                <p className="text-pirates-gray-500 text-xs uppercase tracking-wider font-medium">{stat.label}</p>
                <p className="font-heading text-2xl font-bold text-pirates-black">{stat.value}</p>
              </div>
            ))}
          </div>

          {/* Quick Status Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="pirates-card p-4 border-l-4 border-l-pirates-red">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-pirates-red/10 rounded-lg flex items-center justify-center">
                  <Activity className="w-5 h-5 text-pirates-red" />
                </div>
                <div>
                  <p className="text-pirates-gray-500 text-xs uppercase tracking-wider">Cards Issued</p>
                  <p className="font-heading text-xl font-bold text-pirates-black">{totalCards}</p>
                </div>
              </div>
            </div>
            <div className="pirates-card p-4 border-l-4 border-l-green-500">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-pirates-gray-500 text-xs uppercase tracking-wider">Teams Checked In</p>
                  <p className="font-heading text-xl font-bold text-pirates-black">{Object.values(ladiesTeams).flat().length + Object.values(mensTeams).flat().length} Teams</p>
                </div>
              </div>
            </div>
          </div>

          {/* Player Highlights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Top Scorers */}
            <div className="pirates-card p-4">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Star className="w-4 h-4 text-yellow-600" />
                </div>
                <h4 className="font-heading font-bold text-pirates-black uppercase">Top Scorers</h4>
              </div>
              {topScorers.length === 0 ? (
                <p className="text-pirates-gray-400 text-sm">No goals scored yet</p>
              ) : (
                <div className="space-y-2">
                  {topScorers.map((player, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 bg-pirates-gray-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 bg-pirates-red text-white rounded-full flex items-center justify-center text-xs font-bold">{idx + 1}</span>
                        <div>
                          <p className="font-medium text-pirates-black text-sm">{player.name}</p>
                          <p className="text-xs text-pirates-gray-500">{player.team}</p>
                        </div>
                      </div>
                      <span className="font-heading font-bold text-green-600">{player.goals}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Most Cards */}
            <div className="pirates-card p-4">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                </div>
                <h4 className="font-heading font-bold text-pirates-black uppercase">Most Cards</h4>
              </div>
              {mostCards.length === 0 ? (
                <p className="text-pirates-gray-400 text-sm">No cards issued yet</p>
              ) : (
                <div className="space-y-2">
                  {mostCards.map((player, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 bg-pirates-gray-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 bg-pirates-red text-white rounded-full flex items-center justify-center text-xs font-bold">{idx + 1}</span>
                        <div>
                          <p className="font-medium text-pirates-black text-sm">{player.name}</p>
                          <p className="text-xs text-pirates-gray-500">{player.team}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {player.yellowCards > 0 && (
                          <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded text-xs font-medium">{player.yellowCards}Y</span>
                        )}
                        {player.redCards > 0 && (
                          <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded text-xs font-medium">{player.redCards}R</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Injury Summary */}
            <div className="pirates-card p-4">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Activity className="w-4 h-4 text-purple-600" />
                </div>
                <h4 className="font-heading font-bold text-pirates-black uppercase">Injury Summary</h4>
              </div>
              <div className="text-center py-4">
                <p className="font-heading text-4xl font-bold text-purple-600">
                  {matchReports.reduce((acc, r) => acc + (r.injuries || 0), 0)}
                </p>
                <p className="text-pirates-gray-500 text-sm mt-1">Total Injuries Reported</p>
              </div>
              <div className="space-y-2 mt-4">
                <div className="flex items-center justify-between p-2 bg-purple-50 rounded-lg">
                  <span className="text-sm text-pirates-gray-600">Ladies Division</span>
                  <span className="font-bold text-purple-600">
                    {matchReports.filter(r => r.homeTeam.toLowerCase().includes('ladies')).reduce((acc, r) => acc + (r.injuries || 0), 0)}
                  </span>
                </div>
                <div className="flex items-center justify-between p-2 bg-purple-50 rounded-lg">
                  <span className="text-sm text-pirates-gray-600">Men's Division</span>
                  <span className="font-bold text-purple-600">
                    {matchReports.filter(r => !r.homeTeam.toLowerCase().includes('ladies')).reduce((acc, r) => acc + (r.injuries || 0), 0)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Live Matches by Field/Venue */}
            <div className="lg:col-span-2 space-y-4">
              <h3 className="section-title text-lg">Live Matches by Field & Venue</h3>
              
              {activeMatches.length === 0 ? (
                <div className="pirates-card p-8 text-center">
                  <Clock className="w-12 h-12 text-pirates-gray-300 mx-auto mb-3" />
                  <p className="text-pirates-gray-500">No live matches at the moment</p>
                </div>
              ) : (
                activeMatches.map((match) => (
                  <div key={match.id} className="pirates-card border-l-4 border-l-pirates-red p-6">
                    <div className="flex items-center justify-between mb-4">
                      <span className="bg-pirates-red text-white text-xs font-bold px-3 py-1 rounded live-indicator uppercase tracking-wider flex items-center gap-1">
                        <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                        Live
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-pirates-gray-500 text-sm flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          UJ Sports Grounds
                        </span>
                        <span className="text-pirates-red text-sm font-medium">• Field {match.field || 'A'}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="text-center flex-1">
                        <p className="font-heading text-xl font-bold text-pirates-black">{match.homeTeamName}</p>
                        <p className="text-pirates-gray-500 text-sm">Home</p>
                      </div>
                      <div className="px-6">
                        <div className="font-heading text-4xl font-black text-pirates-red">{match.homeScore} - {match.awayScore}</div>
                        <p className="text-pirates-gray-400 text-xs text-center mt-1 font-mono">75&apos;</p>
                      </div>
                      <div className="text-center flex-1">
                        <p className="font-heading text-xl font-bold text-pirates-black">{match.awayTeamName}</p>
                        <p className="text-pirates-gray-500 text-sm">Away</p>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-pirates-gray-100 flex items-center justify-between">
                      <p className="text-pirates-gray-500 text-sm">Referee: {match.refereeName}</p>
                      <div className="flex gap-2">
                        <span className="flex items-center gap-1 text-amber-600 text-sm">
                          <Activity className="w-4 h-4" />
                          2 Yellow
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}

              {/* Upcoming Matches */}
              <h3 className="section-title text-lg mt-6">Upcoming Matches</h3>
              <div className="space-y-3">
                {upcomingMatches.slice(0, 3).map((match) => (
                  <div key={match.id} className="pirates-card p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="text-center min-w-[60px]">
                        <p className="text-pirates-red font-mono font-bold">{match.time}</p>
                        <p className="text-pirates-gray-400 text-xs">Field {match.field || 'A'}</p>
                      </div>
                      <div className="h-8 w-px bg-pirates-gray-200" />
                      <div>
                        <p className="text-pirates-black font-medium">{match.homeTeamName} vs {match.awayTeamName}</p>
                        <p className="text-pirates-gray-500 text-sm">UJ Sports Grounds</p>
                      </div>
                    </div>
                    <span className={`text-pirates-gray-500 text-xs px-3 py-1 rounded-full font-medium ${GROUP_COLORS[match.group || 'A']} text-white`}>{match.group}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Side Panel */}
            <div className="space-y-6">
              {/* Live Updates */}
              <div className="pirates-card p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="section-title text-base mb-0">Live Updates</h3>
                  <span className="w-2 h-2 bg-pirates-red rounded-full animate-pulse" />
                </div>
                <div className="space-y-3 max-h-64 overflow-auto">
                  {liveUpdates.map((update) => (
                    <div key={update.id} className="flex items-start gap-3 p-3 bg-pirates-gray-50 rounded-lg">
                      <div className={`w-2 h-2 rounded-full mt-1.5 ${
                        update.severity === 'warning' ? 'bg-amber-500' :
                        update.severity === 'success' ? 'bg-green-500' :
                        'bg-blue-500'
                      }`} />
                      <div className="flex-1">
                        <p className="text-pirates-black text-sm">{update.message}</p>
                        <p className="text-pirates-gray-400 text-xs">{update.time}</p>
                        <p className="text-pirates-gray-500 text-xs mt-1">
                          <MapPin className="w-3 h-3 inline mr-1" />
                          {update.venue} • Field {update.field}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Cards Summary */}
              <div className="pirates-card p-6">
                <h3 className="section-title text-base mb-4">Cards Issued Today</h3>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <div className="w-16 h-24 bg-amber-400 rounded-lg mx-auto mb-2" />
                    <p className="font-heading text-2xl font-bold text-amber-500">12</p>
                    <p className="text-pirates-gray-500 text-sm">Yellow Cards</p>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-24 bg-pirates-red rounded-lg mx-auto mb-2" />
                    <p className="font-heading text-2xl font-bold text-pirates-red">3</p>
                    <p className="text-pirates-gray-500 text-sm">Red Cards</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="pirates-card p-6">
            <h3 className="section-title text-base mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                { label: 'Add Match Result', icon: Trophy, onClick: () => setActiveView('matches') },
                { label: 'View Teams', icon: Users, onClick: () => setActiveView('teams') },
                { label: 'View Standings', icon: CheckCircle, onClick: () => setActiveView('standings') },
                { label: 'Send Announcement', icon: Send, onClick: () => setShowAnnouncementModal(true) },
                { label: 'View Reports', icon: TrendingUp, onClick: () => setActiveView('reports') },
                { label: 'View Submissions', icon: ClipboardList, onClick: () => setActiveView('submissions') },
              ].map((action, index) => (
                <button key={index} onClick={action.onClick}
                  className="flex items-center gap-3 bg-pirates-gray-50 border border-pirates-gray-200 rounded-lg p-4 hover:border-pirates-red hover:bg-pirates-red/5 transition-colors text-left group">
                  <action.icon className="w-5 h-5 text-pirates-gray-500 group-hover:text-pirates-red" />
                  <span className="text-pirates-black text-sm font-medium">{action.label}</span>
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Summary View - Ladies & Men's Stats */}
      {activeView === 'summary' && (
        <div className="space-y-6">
          {/* Division Stats Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Ladies Division - Brand Color: Pirates Red */}
            <div className="pirates-card p-6 border-l-4 border-l-pirates-red">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-pirates-red/10 rounded-xl flex items-center justify-center">
                  <Trophy className="w-6 h-6 text-pirates-red" />
                </div>
                <div>
                  <h3 className="font-heading text-xl font-bold text-pirates-red">Ladies Division</h3>
                  <p className="text-pirates-red/70 text-sm">16 Teams • 4 Groups</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-3 bg-pirates-red/5 rounded-lg">
                  <p className="font-heading text-2xl font-bold text-pirates-red">{Object.values(ladiesTeams).flat().length}</p>
                  <p className="text-pirates-red/70 text-xs">Teams</p>
                </div>
                <div className="text-center p-3 bg-pirates-red/5 rounded-lg">
                  <p className="font-heading text-2xl font-bold text-pirates-red">{allTournamentMatches.filter(m => m.gender === 'ladies').length}</p>
                  <p className="text-pirates-red/70 text-xs">Matches</p>
                </div>
                <div className="text-center p-3 bg-pirates-red/5 rounded-lg">
                  <p className="font-heading text-2xl font-bold text-pirates-red">24</p>
                  <p className="text-pirates-red/70 text-xs">Goals</p>
                </div>
              </div>
            </div>

            {/* Men's Division - Brand Color: Pirates Black/Gold */}
            <div className="pirates-card p-6 border-l-4 border-l-pirates-black">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-pirates-black/10 rounded-xl flex items-center justify-center">
                  <Trophy className="w-6 h-6 text-pirates-black" />
                </div>
                <div>
                  <h3 className="font-heading text-xl font-bold text-pirates-black">Men's Division</h3>
                  <p className="text-pirates-black/70 text-sm">56 Teams • 14 Groups</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-3 bg-pirates-black/5 rounded-lg">
                  <p className="font-heading text-2xl font-bold text-pirates-black">{Object.values(mensTeams).flat().length}</p>
                  <p className="text-pirates-black/70 text-xs">Teams</p>
                </div>
                <div className="text-center p-3 bg-pirates-black/5 rounded-lg">
                  <p className="font-heading text-2xl font-bold text-pirates-black">{allTournamentMatches.filter(m => m.gender === 'mens').length}</p>
                  <p className="text-pirates-black/70 text-xs">Matches</p>
                </div>
                <div className="text-center p-3 bg-pirates-black/5 rounded-lg">
                  <p className="font-heading text-2xl font-bold text-pirates-black">84</p>
                  <p className="text-pirates-black/70 text-xs">Goals</p>
                </div>
              </div>
            </div>
          </div>

          {/* Top Scorers by Division */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Ladies Top Scorers - Brand Color */}
            <div className="pirates-card p-6 border-l-4 border-l-pirates-red">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-pirates-red/10 rounded-lg flex items-center justify-center">
                  <Star className="w-4 h-4 text-pirates-red" />
                </div>
                <h4 className="font-heading font-bold text-pirates-red uppercase">Ladies Top Scorers</h4>
              </div>
              <div className="space-y-2">
                {[
                  { name: 'Thandiwe Dlamini', team: 'Orlando Pirates Ladies U21', goals: 4 },
                  { name: 'Lerato Mokoena', team: 'Mamelodi Sundowns Ladies U21', goals: 3 },
                  { name: 'Nomsa Nkosi', team: 'Kaizer Chiefs Ladies U21', goals: 3 },
                  { name: 'Bongiwe Zulu', team: 'SuperSport Ladies U21', goals: 2 },
                  { name: 'Ayanda Khumalo', team: 'TUT Ladies U21', goals: 2 },
                ].map((player, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-pirates-red/5 rounded-lg">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 bg-pirates-red text-white rounded-full flex items-center justify-center text-xs font-bold">{idx + 1}</span>
                      <div>
                        <p className="font-medium text-pirates-black text-sm">{player.name}</p>
                        <p className="text-xs text-pirates-red/70">{player.team}</p>
                      </div>
                    </div>
                    <span className="font-heading font-bold text-pirates-red">{player.goals}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Men's Top Scorers - Brand Color */}
            <div className="pirates-card p-6 border-l-4 border-l-pirates-black">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-pirates-black/10 rounded-lg flex items-center justify-center">
                  <Star className="w-4 h-4 text-pirates-black" />
                </div>
                <h4 className="font-heading font-bold text-pirates-black uppercase">Men's Top Scorers</h4>
              </div>
              <div className="space-y-2">
                {[
                  { name: 'Sibusiso Ndlovu', team: 'Orlando Pirates U21', goals: 5 },
                  { name: 'Thabo Mokoena', team: 'Kaizer Chiefs U21', goals: 4 },
                  { name: 'Lungile Dlamini', team: 'Mamelodi Sundowns U21', goals: 4 },
                  { name: 'Kagiso Ramela', team: 'SuperSport United U21', goals: 3 },
                  { name: 'Themba Nkosi', team: 'Cape Town City U21', goals: 3 },
                ].map((player, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-pirates-black/5 rounded-lg">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 bg-pirates-black text-white rounded-full flex items-center justify-center text-xs font-bold">{idx + 1}</span>
                      <div>
                        <p className="font-medium text-pirates-black text-sm">{player.name}</p>
                        <p className="text-xs text-pirates-black/70">{player.team}</p>
                      </div>
                    </div>
                    <span className="font-heading font-bold text-pirates-black">{player.goals}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Cards by Division */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Ladies Cards - Brand Color */}
            <div className="pirates-card p-6 border-l-4 border-l-pirates-red">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-pirates-red/10 rounded-lg flex items-center justify-center">
                  <AlertTriangle className="w-4 h-4 text-pirates-red" />
                </div>
                <h4 className="font-heading font-bold text-pirates-red uppercase">Ladies Cards Issued</h4>
              </div>
              <div className="flex items-center gap-6 mb-4">
                <div className="text-center flex-1">
                  <div className="w-12 h-16 bg-yellow-400 rounded-lg mx-auto mb-2" />
                  <p className="font-heading text-xl font-bold text-yellow-600">8</p>
                  <p className="text-pirates-gray-500 text-xs">Yellow Cards</p>
                </div>
                <div className="text-center flex-1">
                  <div className="w-12 h-16 bg-pirates-red rounded-lg mx-auto mb-2" />
                  <p className="font-heading text-xl font-bold text-pirates-red">1</p>
                  <p className="text-pirates-gray-500 text-xs">Red Cards</p>
                </div>
              </div>
              <div className="space-y-2">
                {[
                  { name: 'Zanele Mthembu', team: 'UJ Ladies U21', cards: '2Y' },
                  { name: 'Nokuthula Zulu', team: 'UWC Ladies U21', cards: '1Y' },
                  { name: 'Precious Dube', team: 'Richards Bay Ladies U21', cards: '1R' },
                ].map((player, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 bg-pirates-red/5 rounded-lg">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-pirates-red">{idx + 1}</span>
                      <div>
                        <p className="font-medium text-pirates-black text-sm">{player.name}</p>
                        <p className="text-xs text-pirates-red/70">{player.team}</p>
                      </div>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${player.cards.includes('R') ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {player.cards}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Men's Cards - Brand Color */}
            <div className="pirates-card p-6 border-l-4 border-l-pirates-black">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-pirates-black/10 rounded-lg flex items-center justify-center">
                  <AlertTriangle className="w-4 h-4 text-pirates-black" />
                </div>
                <h4 className="font-heading font-bold text-pirates-black uppercase">Men's Cards Issued</h4>
              </div>
              <div className="flex items-center gap-6 mb-4">
                <div className="text-center flex-1">
                  <div className="w-12 h-16 bg-yellow-400 rounded-lg mx-auto mb-2" />
                  <p className="font-heading text-xl font-bold text-yellow-600">28</p>
                  <p className="text-pirates-gray-500 text-xs">Yellow Cards</p>
                </div>
                <div className="text-center flex-1">
                  <div className="w-12 h-16 bg-pirates-red rounded-lg mx-auto mb-2" />
                  <p className="font-heading text-xl font-bold text-pirates-red">4</p>
                  <p className="text-pirates-gray-500 text-xs">Red Cards</p>
                </div>
              </div>
              <div className="space-y-2">
                {[
                  { name: 'Bongani Mthembu', team: 'Kaizer Chiefs U21', cards: '2Y' },
                  { name: 'Sifiso Ndlovu', team: 'Golden Arrows U21', cards: '1R' },
                  { name: 'Mandla Zulu', team: 'Royal AM U21', cards: '2Y' },
                ].map((player, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 bg-pirates-black/5 rounded-lg">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-pirates-black">{idx + 1}</span>
                      <div>
                        <p className="font-medium text-pirates-black text-sm">{player.name}</p>
                        <p className="text-xs text-pirates-black/70">{player.team}</p>
                      </div>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${player.cards.includes('R') ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {player.cards}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Live Standings by Division */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Ladies Standings - Brand Color */}
            <div className="pirates-card p-6 border-l-4 border-l-pirates-red">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-pirates-red/10 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-pirates-red" />
                </div>
                <h4 className="font-heading font-bold text-pirates-red uppercase">Ladies Live Standings</h4>
              </div>
              <div className="space-y-4">
                {Object.keys(ladiesTeams).map(group => {
                  const groupStandings = calculateGroupStandings(group, 'ladies');
                  return (
                    <div key={group} className="bg-pirates-red/5 rounded-lg p-3">
                      <h5 className="font-medium text-pirates-red text-sm mb-2">Group {group}</h5>
                      <div className="space-y-1">
                        {groupStandings.slice(0, 2).map((team, idx) => (
                          <div key={team.name} className="flex items-center justify-between py-1">
                            <div className="flex items-center gap-2">
                              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                                idx === 0 ? 'bg-green-500 text-white' : 'bg-pirates-red text-white'
                              }`}>
                                {idx + 1}
                              </span>
                              <span className="text-sm">{team.name}</span>
                            </div>
                            <span className="font-bold text-pirates-red text-sm">{team.points}pts</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Men's Standings - Brand Color */}
            <div className="pirates-card p-6 border-l-4 border-l-pirates-black">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-pirates-black/10 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-pirates-black" />
                </div>
                <h4 className="font-heading font-bold text-pirates-black uppercase">Men's Live Standings</h4>
              </div>
              <div className="space-y-2 max-h-80 overflow-auto">
                {Object.keys(mensTeams).slice(0, 7).map(group => {
                  const groupStandings = calculateGroupStandings(group, 'mens');
                  return (
                    <div key={group} className="bg-pirates-black/5 rounded-lg p-3">
                      <h5 className="font-medium text-pirates-black text-sm mb-2">Group {group}</h5>
                      <div className="space-y-1">
                        {groupStandings.slice(0, 2).map((team, idx) => (
                          <div key={team.name} className="flex items-center justify-between py-1">
                            <div className="flex items-center gap-2">
                              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                                idx === 0 ? 'bg-green-500 text-white' : 'bg-pirates-black text-white'
                              }`}>
                                {idx + 1}
                              </span>
                              <span className="text-sm truncate max-w-[150px]">{team.name}</span>
                            </div>
                            <span className="font-bold text-pirates-black text-sm">{team.points}pts</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Live Updates View */}
      {activeView === 'live' && (
        <div className="space-y-6">
          {/* Division Selector Tabs */}
          <div className="flex gap-2">
            <button
              onClick={() => setActiveDivision('ladies')}
              className={`flex-1 py-3 px-6 rounded-xl font-heading font-bold text-lg flex items-center justify-center gap-3 transition-all ${
                activeDivision === 'ladies'
                  ? 'bg-pirates-red text-white shadow-lg'
                  : 'bg-white text-pirates-gray-600 border border-pirates-gray-200 hover:border-pirates-red'
              }`}
            >
              <Trophy className="w-5 h-5" />
              Ladies Live Updates
            </button>
            <button
              onClick={() => setActiveDivision('mens')}
              className={`flex-1 py-3 px-6 rounded-xl font-heading font-bold text-lg flex items-center justify-center gap-3 transition-all ${
                activeDivision === 'mens'
                  ? 'bg-pirates-black text-white shadow-lg'
                  : 'bg-white text-pirates-gray-600 border border-pirates-gray-200 hover:border-pirates-black'
              }`}
            >
              <Trophy className="w-5 h-5" />
              Men's Live Updates
            </button>
          </div>

          {/* Ladies Live Updates */}
          {activeDivision === 'ladies' && (
            <div className="pirates-card p-6 border-l-4 border-l-pirates-red">
              <div className="flex items-center justify-between mb-6">
                <h3 className="section-title text-base mb-0 flex items-center gap-2">
                  <span className="w-3 h-3 bg-pirates-red rounded-full" />
                  Ladies Division - Real-Time Updates
                </h3>
                <div className="flex items-center gap-2 text-pirates-red">
                  <span className="w-2 h-2 bg-pirates-red rounded-full animate-pulse" />
                  <span className="text-sm font-medium">Live</span>
                </div>
              </div>

              <div className="space-y-4">
                {ladiesLiveUpdates.length === 0 ? (
                  <div className="text-center py-8 text-pirates-gray-400">
                    <Activity className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No live updates for Ladies Division yet</p>
                  </div>
                ) : (
                  ladiesLiveUpdates.map((update) => (
                    <div key={update.id} className="flex items-start gap-4 p-4 bg-pirates-red/5 rounded-lg border-l-4 border-l-pirates-red">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        update.type === 'card' ? 'bg-amber-100' :
                        update.type === 'goal' ? 'bg-green-100' :
                        'bg-pirates-red/10'
                      }`}>
                        {update.type === 'card' && <Activity className="w-5 h-5 text-amber-600" />}
                        {update.type === 'goal' && <Trophy className="w-5 h-5 text-green-600" />}
                        {update.type === 'checkin' && <CheckCircle className="w-5 h-5 text-pirates-red" />}
                      </div>
                      <div className="flex-1">
                        <p className="text-pirates-black font-medium">{update.message}</p>
                        <p className="text-pirates-gray-500 text-sm">{update.time}</p>
                        <p className="text-pirates-gray-500 text-sm mt-1 flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {update.venue} • Field {update.field}
                        </p>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        update.severity === 'warning' ? 'bg-amber-100 text-amber-600' :
                        update.severity === 'success' ? 'bg-green-100 text-green-600' :
                        'bg-pirates-red/10 text-pirates-red'
                      }`}>
                        {update.type.toUpperCase()}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Men's Live Updates */}
          {activeDivision === 'mens' && (
            <div className="pirates-card p-6 border-l-4 border-l-pirates-black">
              <div className="flex items-center justify-between mb-6">
                <h3 className="section-title text-base mb-0 flex items-center gap-2">
                  <span className="w-3 h-3 bg-pirates-black rounded-full" />
                  Men's Division - Real-Time Updates
                </h3>
                <div className="flex items-center gap-2 text-pirates-black">
                  <span className="w-2 h-2 bg-pirates-black rounded-full animate-pulse" />
                  <span className="text-sm font-medium">Live</span>
                </div>
              </div>

              <div className="space-y-4">
                {mensLiveUpdates.length === 0 ? (
                  <div className="text-center py-8 text-pirates-gray-400">
                    <Activity className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No live updates for Men's Division yet</p>
                  </div>
                ) : (
                  mensLiveUpdates.map((update) => (
                    <div key={update.id} className="flex items-start gap-4 p-4 bg-pirates-black/5 rounded-lg border-l-4 border-l-pirates-black">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        update.type === 'card' ? 'bg-amber-100' :
                        update.type === 'goal' ? 'bg-green-100' :
                        'bg-pirates-black/10'
                      }`}>
                        {update.type === 'card' && <Activity className="w-5 h-5 text-amber-600" />}
                        {update.type === 'goal' && <Trophy className="w-5 h-5 text-green-600" />}
                        {update.type === 'checkin' && <CheckCircle className="w-5 h-5 text-pirates-black" />}
                      </div>
                      <div className="flex-1">
                        <p className="text-pirates-black font-medium">{update.message}</p>
                        <p className="text-pirates-gray-500 text-sm">{update.time}</p>
                        <p className="text-pirates-gray-500 text-sm mt-1 flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {update.venue} • Field {update.field}
                        </p>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        update.severity === 'warning' ? 'bg-amber-100 text-amber-600' :
                        update.severity === 'success' ? 'bg-green-100 text-green-600' :
                        'bg-pirates-black/10 text-pirates-black'
                      }`}>
                        {update.type.toUpperCase()}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Matches View */}
      {activeView === 'matches' && (
        <div className="space-y-6">
          {/* Live Matches - Snapshot of All Fields */}
          <div className="pirates-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="section-title text-base mb-0">Live Matches - All Fields</h3>
              <div className="flex items-center gap-2 text-pirates-red">
                <span className="w-2 h-2 bg-pirates-red rounded-full animate-pulse" />
                <span className="text-sm font-medium">{activeMatches.length} Live</span>
              </div>
            </div>
            
            {activeMatches.length === 0 ? (
              <div className="text-center py-8">
                <Clock className="w-12 h-12 text-pirates-gray-300 mx-auto mb-3" />
                <p className="text-pirates-gray-500">No live matches</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* UJ Sports Grounds - All 6 Fields */}
                <div>
                  <h4 className="font-heading text-lg font-bold text-pirates-black mb-3 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-pirates-red" />
                    UJ Sports Grounds
                  </h4>
                  <div className="grid md:grid-cols-3 gap-4">
                    {['A', 'B', 'C', 'D', 'E', 'F'].map((field) => {
                      const fieldMatch = activeMatches.find(m => m.field === field);
                      return (
                        <div key={`uj-${field}`} className={`border-2 rounded-xl p-4 ${fieldMatch ? 'border-pirates-red bg-pirates-red/5' : 'border-pirates-gray-200 bg-pirates-gray-50'}`}>
                          <div className="flex items-center justify-between mb-3">
                            <span className={`text-xs font-bold px-3 py-1 rounded uppercase ${fieldMatch ? 'bg-pirates-red text-white' : 'bg-pirates-gray-300 text-white'}`}>
                              {fieldMatch ? 'Live' : 'No Match'}
                            </span>
                            <span className="text-pirates-gray-600 text-sm font-medium">Field {field}</span>
                          </div>
                          {fieldMatch ? (
                            <div className="flex items-center justify-center gap-4">
                              <div className="text-center flex-1">
                                <p className="font-heading text-sm font-bold text-pirates-black">{fieldMatch.homeTeamName}</p>
                              </div>
                              <div className="font-heading text-2xl font-black text-pirates-red">{fieldMatch.homeScore} - {fieldMatch.awayScore}</div>
                              <div className="text-center flex-1">
                                <p className="font-heading text-sm font-bold text-pirates-black">{fieldMatch.awayTeamName}</p>
                              </div>
                            </div>
                          ) : (
                            <div className="text-center py-2">
                              <p className="text-pirates-gray-400 text-sm">No active match</p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* All Matches */}
          <div className="pirates-card p-6">
            <h3 className="section-title text-base mb-4">All Matches</h3>
            <div className="space-y-3">
              {matches.map((match) => (
                <div key={match.id} className="flex items-center justify-between p-4 bg-pirates-gray-50 rounded-lg">
                  <div className="flex items-center gap-4">
                    <span className={`text-xs font-bold px-3 py-1 rounded uppercase tracking-wider ${
                      match.status === 'live' ? 'bg-pirates-red text-white' : 
                      match.status === 'completed' ? 'bg-green-100 text-green-600' : 
                      'bg-amber-100 text-amber-600'
                    }`}>
                      {match.status}
                    </span>
                    <div>
                      <p className="text-pirates-black font-medium">{match.homeTeamName} vs {match.awayTeamName}</p>
                      <p className="text-pirates-gray-500 text-sm">{match.date} • {match.time} • UJ Sports Grounds • Field {match.field}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {match.status !== 'scheduled' && (
                      <div className="font-heading text-xl font-bold text-pirates-red">
                        {match.homeScore} - {match.awayScore}
                      </div>
                    )}
                    <span className={`text-pirates-gray-500 text-xs px-3 py-1 rounded-full font-medium ${GROUP_COLORS[match.group || 'A']} text-white`}>{match.group}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Teams View */}
      {activeView === 'teams' && (
        <div className="space-y-6">
          {/* Division Selector Tabs */}
          <div className="flex gap-2">
            <button
              onClick={() => setActiveDivision('ladies')}
              className={`flex-1 py-3 px-6 rounded-xl font-heading font-bold text-lg flex items-center justify-center gap-3 transition-all ${
                activeDivision === 'ladies'
                  ? 'bg-pirates-red text-white shadow-lg'
                  : 'bg-white text-pirates-gray-600 border border-pirates-gray-200 hover:border-pirates-red'
              }`}
            >
              <Trophy className="w-5 h-5" />
              Ladies Teams
              <span className={`text-xs px-2 py-0.5 rounded-full ${activeDivision === 'ladies' ? 'bg-white/20' : 'bg-pirates-red/10 text-pirates-red'}`}>
                {Object.values(ladiesTeams).flat().length}
              </span>
            </button>
            <button
              onClick={() => setActiveDivision('mens')}
              className={`flex-1 py-3 px-6 rounded-xl font-heading font-bold text-lg flex items-center justify-center gap-3 transition-all ${
                activeDivision === 'mens'
                  ? 'bg-pirates-black text-white shadow-lg'
                  : 'bg-white text-pirates-gray-600 border border-pirates-gray-200 hover:border-pirates-black'
              }`}
            >
              <Trophy className="w-5 h-5" />
              Men's Teams
              <span className={`text-xs px-2 py-0.5 rounded-full ${activeDivision === 'mens' ? 'bg-white/20' : 'bg-pirates-black/10 text-pirates-black'}`}>
                {Object.values(mensTeams).flat().length}
              </span>
            </button>
          </div>

          {/* Search */}
          <div className="pirates-card p-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-pirates-gray-400" />
              <input
                type="text"
                placeholder={`Search ${activeDivision} teams by name, coach, or group...`}
                value={teamSearch}
                onChange={(e) => setTeamSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-pirates-gray-200 rounded-lg text-pirates-black placeholder:text-pirates-gray-400 focus:outline-none focus:border-pirates-red focus:ring-2 focus:ring-pirates-red/10"
              />
            </div>
          </div>

          {/* Division Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className={`pirates-card p-4 text-center border-l-4 ${activeDivision === 'ladies' ? 'border-l-pirates-red' : 'border-l-pirates-black'}`}>
              <p className="font-heading text-2xl font-bold text-pirates-black">
                {activeDivision === 'ladies' ? Object.values(ladiesTeams).flat().length : Object.values(mensTeams).flat().length}
              </p>
              <p className="text-pirates-gray-500 text-xs uppercase tracking-wider">Total Teams</p>
            </div>
            <div className={`pirates-card p-4 text-center border-l-4 ${activeDivision === 'ladies' ? 'border-l-pirates-red' : 'border-l-pirates-black'}`}>
              <p className="font-heading text-2xl font-bold text-pirates-black">
                {activeDivision === 'ladies' ? Object.keys(ladiesTeams).length : Object.keys(mensTeams).length}
              </p>
              <p className="text-pirates-gray-500 text-xs uppercase tracking-wider">Groups</p>
            </div>
            <div className="pirates-card p-4 text-center border-l-4 border-l-green-500">
              <p className="font-heading text-2xl font-bold text-green-600">
                {activeDivision === 'ladies' ? Object.values(ladiesTeams).flat().length : Object.values(mensTeams).flat().length}
              </p>
              <p className="text-pirates-gray-500 text-xs uppercase tracking-wider">Registered</p>
            </div>
          </div>

          {/* Teams Sorted by Group */}
          {(activeDivision === 'ladies' ? ['A', 'B', 'C', 'D'] : ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N']).map((group) => {
            const groupTeamNames = activeDivision === 'ladies' ? ladiesTeams[group] : mensTeams[group];
            const registeredTeams = activeDivision === 'ladies' ? REGISTERED_LADIES_TEAMS : REGISTERED_MENS_TEAMS;
            const groupTeams = groupTeamNames.map(name => registeredTeams.find(t => t.name === name)).filter(Boolean);
            
            if (teamSearch && !groupTeams.some(t => 
              t?.name.toLowerCase().includes(teamSearch.toLowerCase())
            )) return null;

            return (
              <div key={group} className="pirates-card p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="section-title text-base mb-0 flex items-center gap-2">
                    <span className={`w-8 h-8 rounded-lg ${GROUP_COLORS[group]} text-white flex items-center justify-center text-sm font-bold`}>
                      {group}
                    </span>
                    Group {group}
                  </h3>
                  <span className="text-pirates-gray-400 text-sm">{groupTeams.length} teams</span>
                </div>
                <div className="space-y-2">
                  {groupTeams
                    .filter(team => !teamSearch || 
                      team?.name.toLowerCase().includes(teamSearch.toLowerCase())
                    )
                    .map((team, index) => (
                    <div key={team?.name} className={`flex items-center gap-4 p-4 rounded-xl ${
                      index === 0 ? 'bg-pirates-gold/10 border border-pirates-gold/30' : 
                      index === 1 ? 'bg-pirates-gray-50 border border-pirates-gray-200' : 
                      'bg-white border border-pirates-gray-200'
                    }`}>
                      <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        index === 0 ? 'bg-pirates-gold text-pirates-black' :
                        index === 1 ? 'bg-pirates-gray-400 text-white' :
                        index === 2 ? 'bg-amber-700 text-white' :
                        'bg-pirates-gray-200 text-pirates-gray-600'
                      }`}>
                        {index + 1}
                      </span>
                      {team?.logo && (
                        <img 
                          src={team.logo} 
                          alt={team.name}
                          className="w-10 h-10 object-contain rounded bg-white p-1"
                          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                        />
                      )}
                      <div className="flex-1">
                        <p className="text-pirates-black font-medium">{team?.name}</p>
                        <p className="text-pirates-gray-500 text-xs">{team?.players.length || 0} Players Registered</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

          {filteredTeams.length === 0 && teamSearch && (
            <div className="text-center py-8 text-pirates-gray-400">
              <Search className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No teams found matching &quot;{teamSearch}&quot;</p>
            </div>
          )}
        </div>
      )}

      {/* Standings View */}
      {activeView === 'standings' && (
        <div className="space-y-6">
          {/* Division Selector Tabs */}
          <div className="flex gap-2">
            <button
              onClick={() => setActiveDivision('ladies')}
              className={`flex-1 py-3 px-6 rounded-xl font-heading font-bold text-lg flex items-center justify-center gap-3 transition-all ${
                activeDivision === 'ladies'
                  ? 'bg-pirates-red text-white shadow-lg'
                  : 'bg-white text-pirates-gray-600 border border-pirates-gray-200 hover:border-pirates-red'
              }`}
            >
              <Trophy className="w-5 h-5" />
              Ladies Standings
              <span className={`text-xs px-2 py-0.5 rounded-full ${activeDivision === 'ladies' ? 'bg-white/20' : 'bg-pirates-red/10 text-pirates-red'}`}>
                4 Groups
              </span>
            </button>
            <button
              onClick={() => setActiveDivision('mens')}
              className={`flex-1 py-3 px-6 rounded-xl font-heading font-bold text-lg flex items-center justify-center gap-3 transition-all ${
                activeDivision === 'mens'
                  ? 'bg-pirates-black text-white shadow-lg'
                  : 'bg-white text-pirates-gray-600 border border-pirates-gray-200 hover:border-pirates-black'
              }`}
            >
              <Trophy className="w-5 h-5" />
              Men's Standings
              <span className={`text-xs px-2 py-0.5 rounded-full ${activeDivision === 'mens' ? 'bg-white/20' : 'bg-pirates-black/10 text-pirates-black'}`}>
                14 Groups
              </span>
            </button>
          </div>

          {/* Ladies Standings */}
          {activeDivision === 'ladies' && (
            <div className="space-y-6">
              {['A', 'B', 'C', 'D'].map((group) => {
                const groupStandings = calculateGroupStandings(group, 'ladies');
                if (groupStandings.length === 0) return null;
                
                return (
                  <div key={`ladies-${group}`} className="pirates-card p-6 border-l-4 border-l-pirates-red">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="section-title text-base mb-0 flex items-center gap-2">
                        <span className="w-8 h-8 rounded-lg bg-pirates-red text-white flex items-center justify-center text-sm font-bold">
                          {group}
                        </span>
                        Ladies Group {group} Standings
                      </h3>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-pirates-gray-500">Top 2 advance</span>
                        <div className="w-3 h-3 rounded-full bg-green-500" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      {groupStandings.map((team, index) => (
                        <div key={team.name} className={`flex items-center gap-4 p-3 rounded-lg ${
                          index < 2 ? 'bg-green-50 border border-green-200' : 'bg-pirates-gray-50'
                        }`}>
                          <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                            index === 0 ? 'bg-pirates-gold text-pirates-black' :
                            index === 1 ? 'bg-pirates-gray-300 text-pirates-black' :
                            index === 2 ? 'bg-amber-700 text-white' :
                            'bg-pirates-gray-200 text-pirates-gray-600'
                          }`}>
                            {index + 1}
                          </span>
                          <div className="flex-1">
                            <p className="text-pirates-black font-medium">{team.name}</p>
                            <p className="text-pirates-gray-500 text-xs">
                              {team.played} played • {team.won}W {team.drawn}D {team.lost}L • GD: {team.goalDifference}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-heading text-xl font-bold text-pirates-red">{team.points}</p>
                            <p className="text-pirates-gray-400 text-xs">pts</p>
                          </div>
                          {index < 2 && (
                            <div className="flex items-center gap-1 text-green-600 text-xs">
                              <CheckCircle className="w-4 h-4" />
                              <span>Advancing</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Men's Standings */}
          {activeDivision === 'mens' && (
            <div className="space-y-6">
              {['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N'].map((group) => {
                const groupStandings = calculateGroupStandings(group, 'mens');
                if (groupStandings.length === 0) return null;
                
                return (
                  <div key={`mens-${group}`} className="pirates-card p-6 border-l-4 border-l-pirates-black">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="section-title text-base mb-0 flex items-center gap-2">
                        <span className="w-8 h-8 rounded-lg bg-pirates-black text-white flex items-center justify-center text-sm font-bold">
                          {group}
                        </span>
                        Men's Group {group} Standings
                      </h3>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-pirates-gray-500">Top 2 advance</span>
                        <div className="w-3 h-3 rounded-full bg-green-500" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      {groupStandings.map((team, index) => (
                        <div key={team.name} className={`flex items-center gap-4 p-3 rounded-lg ${
                          index < 2 ? 'bg-green-50 border border-green-200' : 'bg-pirates-gray-50'
                        }`}>
                          <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                            index === 0 ? 'bg-pirates-gold text-pirates-black' :
                            index === 1 ? 'bg-pirates-gray-300 text-pirates-black' :
                            index === 2 ? 'bg-amber-700 text-white' :
                            'bg-pirates-gray-200 text-pirates-gray-600'
                          }`}>
                            {index + 1}
                          </span>
                          <div className="flex-1">
                            <p className="text-pirates-black font-medium">{team.name}</p>
                            <p className="text-pirates-gray-500 text-xs">
                              {team.played} played • {team.won}W {team.drawn}D {team.lost}L • GD: {team.goalDifference}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-heading text-xl font-bold text-pirates-red">{team.points}</p>
                            <p className="text-pirates-gray-400 text-xs">pts</p>
                          </div>
                          {index < 2 && (
                            <div className="flex items-center gap-1 text-green-600 text-xs">
                              <CheckCircle className="w-4 h-4" />
                              <span>Advancing</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Announcements View */}
      {activeView === 'announcements' && (
        <div className="space-y-6">
          {/* Send New Announcement */}
          <div className="pirates-card p-6">
            <h3 className="section-title text-base mb-4">Send Announcement to Field Managers</h3>
            
            {/* Recipients */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-pirates-gray-600 mb-2">Recipients</label>
              <div className="flex items-center gap-4 mb-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={sendToAll}
                    onChange={(e) => setSendToAll(e.target.checked)}
                    className="w-4 h-4 text-pirates-red rounded"
                  />
                  <span className="text-sm text-pirates-black">All Field Managers</span>
                </label>
              </div>
              
              {!sendToAll && (
                <div className="flex flex-wrap gap-2">
                  {fieldManagers.map(fm => (
                    <label key={fm.id} className="flex items-center gap-2 px-3 py-2 bg-pirates-gray-50 rounded-lg cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedRecipients.includes(fm.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedRecipients([...selectedRecipients, fm.id]);
                          } else {
                            setSelectedRecipients(selectedRecipients.filter(id => id !== fm.id));
                          }
                        }}
                        className="w-4 h-4 text-pirates-red rounded"
                      />
                      <span className="text-sm text-pirates-black">{fm.name}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Priority */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-pirates-gray-600 mb-2">Priority</label>
              <div className="flex gap-2">
                {(['low', 'normal', 'high', 'urgent'] as const).map((p) => (
                  <button
                    key={p}
                    onClick={() => setAnnouncementPriority(p)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium capitalize ${
                      announcementPriority === p
                        ? `${announcementService.getPriorityColor(p)} text-white`
                        : 'bg-pirates-gray-100 text-pirates-gray-600'
                    }`}
                  >
                    {announcementService.getPriorityLabel(p)}
                  </button>
                ))}
              </div>
            </div>

            {/* Message */}
            <textarea
              value={announcementText}
              onChange={(e) => setAnnouncementText(e.target.value)}
              placeholder="Type your announcement here..."
              rows={3}
              className="w-full px-4 py-3 border border-pirates-gray-200 rounded-lg text-pirates-black placeholder:text-pirates-gray-400 focus:outline-none focus:border-pirates-red focus:ring-2 focus:ring-pirates-red/10 resize-none mb-4"
            />

            <button
              onClick={sendAnnouncement}
              disabled={!announcementText.trim() || announcementSent || (!sendToAll && selectedRecipients.length === 0)}
              className={`w-full py-3 rounded-lg font-medium flex items-center justify-center gap-2 ${
                announcementSent 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-pirates-red text-white hover:bg-pirates-red/90'
              }`}
            >
              {announcementSent ? (
                <>
                  <Check className="w-5 h-5" />
                  Sent to Field Managers
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Send Announcement
                </>
              )}
            </button>
          </div>

          {/* Field Manager Status */}
          <div className="pirates-card p-6">
            <h3 className="section-title text-base mb-4">Field Manager Status</h3>
            <div className="grid md:grid-cols-2 gap-4">
              {fieldManagers.map(fm => (
                <div key={fm.id} className="flex items-center justify-between p-4 bg-pirates-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${fm.online ? 'bg-green-500' : 'bg-gray-400'}`} />
                    <div>
                      <p className="text-pirates-black font-medium">{fm.name}</p>
                      <p className="text-pirates-gray-500 text-sm">{fm.venue} • Fields {fm.field}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-pirates-gray-500">{fm.lastSeen}</span>
                    {fm.online && (
                      <span className="block text-green-600 text-xs">● Online</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sent Announcements */}
          <div className="pirates-card p-6">
            <h3 className="section-title text-base mb-4">Sent Announcements</h3>
            <div className="space-y-3">
              {announcements.length === 0 ? (
                <div className="text-center py-8 text-pirates-gray-400">
                  <Bell className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No announcements sent yet</p>
                </div>
              ) : (
                announcements.map((ann) => {
                  const stats = announcementService.getDeliveryStats(ann.id);
                  return (
                    <div key={ann.id} className="p-4 bg-pirates-gray-50 rounded-lg border border-pirates-gray-100">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded text-xs font-medium text-white ${announcementService.getPriorityColor(ann.priority)}`}>
                            {announcementService.getPriorityLabel(ann.priority)}
                          </span>
                          <span className="text-pirates-gray-500 text-xs">
                            {new Date(ann.sentAt).toLocaleString()}
                          </span>
                        </div>
                        <button
                          onClick={() => {
                            announcementService.deleteAnnouncement(ann.id);
                            setAnnouncements(announcementService.getAllAnnouncements());
                          }}
                          className="text-pirates-gray-400 hover:text-pirates-red"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="text-pirates-black mb-3">{ann.message}</p>
                      <div className="flex items-center gap-4 text-xs">
                        <span className="flex items-center gap-1 text-pirates-gray-500">
                          <UserCheck className="w-3 h-3" />
                          {stats.read}/{stats.sent} read
                        </span>
                        <span className="flex items-center gap-1 text-green-600">
                          <Check className="w-3 h-3" />
                          {stats.acknowledged} acknowledged
                        </span>
                        {stats.pending > 0 && (
                          <span className="flex items-center gap-1 text-amber-600">
                            <Clock className="w-3 h-3" />
                            {stats.pending} pending
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* Submissions View */}
      {activeView === 'submissions' && (
        <div className="space-y-6">
          {/* Submissions by Field - All Types */}
          <div className="pirates-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="section-title text-base mb-0 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-pirates-red" />
                Submissions by Field
              </h3>
              <span className="text-pirates-gray-500 text-sm">UJ Sports Grounds</span>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {['A', 'B', 'C', 'D', 'E', 'F'].map((field) => {
                const fieldSubs = fieldSubmissions.filter(s => s.field === field);
                const checklistCount = fieldSubs.filter(s => s.type === 'checklist').length;
                const scoreCount = fieldSubs.filter(s => s.type === 'score').length;
                const reportCount = fieldSubs.filter(s => s.type === 'report').length;
                return (
                  <div key={field} className="bg-pirates-gray-50 rounded-xl p-4 border border-pirates-gray-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-heading font-bold text-pirates-black">Field {field}</span>
                      <span className="w-6 h-6 bg-pirates-red text-white rounded-full flex items-center justify-center text-xs font-bold">
                        {fieldSubs.length}
                      </span>
                    </div>
                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between">
                        <span className="text-pirates-gray-500">Checklists:</span>
                        <span className="font-medium text-blue-600">{checklistCount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-pirates-gray-500">Scores:</span>
                        <span className="font-medium text-green-600">{scoreCount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-pirates-gray-500">Reports:</span>
                        <span className="font-medium text-amber-600">{reportCount}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* All Submissions Sorted by Field */}
          <div className="pirates-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="section-title text-base mb-0 flex items-center gap-2">
                <ClipboardList className="w-5 h-5 text-pirates-red" />
                All Field Manager Submissions
              </h3>
              <span className="text-pirates-gray-500 text-sm">{fieldSubmissions.length} submissions</span>
            </div>
            
            {fieldSubmissions.length === 0 ? (
              <div className="text-center py-8 text-pirates-gray-400">
                <ClipboardList className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No submissions yet</p>
              </div>
            ) : (
              <div className="space-y-6">
                {['A', 'B', 'C', 'D', 'E', 'F'].map((field) => {
                  const fieldSubs = fieldSubmissions.filter(s => s.field === field);
                  if (fieldSubs.length === 0) return null;
                  return (
                    <div key={field}>
                      <h4 className="font-medium text-pirates-black mb-3 flex items-center gap-2">
                        <span className={`w-6 h-6 rounded-lg ${GROUP_COLORS[field]} text-white flex items-center justify-center text-xs font-bold`}>
                          {field}
                        </span>
                        Field {field} Submissions ({fieldSubs.length})
                      </h4>
                      <div className="space-y-2">
                        {fieldSubs.map((sub) => (
                          <div key={sub.id} className="flex items-center justify-between p-4 bg-pirates-gray-50 rounded-lg border border-pirates-gray-100">
                            <div className="flex items-center gap-4">
                              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                                sub.type === 'checklist' ? 'bg-blue-100 text-blue-600' :
                                sub.type === 'score' ? 'bg-green-100 text-green-600' :
                                'bg-amber-100 text-amber-600'
                              }`}>
                                {sub.type === 'checklist' ? <CheckCircle className="w-5 h-5" /> :
                                 sub.type === 'score' ? <Activity className="w-5 h-5" /> :
                                 <FileText className="w-5 h-5" />}
                              </div>
                              <div>
                                <p className="font-medium text-pirates-black capitalize">{sub.type}</p>
                                <p className="text-sm text-pirates-gray-500">{sub.details}</p>
                                <p className="text-xs text-pirates-gray-400">
                                  {sub.fieldManager} • {sub.venue}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                                sub.status === 'verified' ? 'bg-green-100 text-green-700' :
                                sub.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                                'bg-blue-100 text-blue-700'
                              }`}>
                                {sub.status}
                              </span>
                              <p className="text-xs text-pirates-gray-400 mt-1">
                                {new Date(sub.submittedAt).toLocaleTimeString()}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Match Reports View */}
      {activeView === 'reports' && (
        <div className="space-y-6">
          {/* Card Rules Info */}
          <div className="pirates-card p-4 bg-amber-50 border-amber-200">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
              <h4 className="font-medium text-amber-800">Card Suspension Rules</h4>
            </div>
            <div className="grid md:grid-cols-2 gap-4 text-sm text-amber-700">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-yellow-400 rounded-full" />
                <span><strong>2 Yellow Cards</strong> = Suspended from next match</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-500 rounded-full" />
                <span><strong>1 Red Card</strong> = Immediate suspension + next match</span>
              </div>
            </div>
          </div>

          <div className="pirates-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="section-title text-base mb-0 flex items-center gap-2">
                <FileText className="w-5 h-5 text-pirates-red" />
                Match Reports from Field Managers
              </h3>
              <span className="text-pirates-gray-500 text-sm">{matchReports.length} reports</span>
            </div>
            
            {matchReports.length === 0 ? (
              <div className="text-center py-8 text-pirates-gray-400">
                <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No match reports yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {matchReports.map((report) => (
                  <div key={report.id} className="p-4 bg-pirates-gray-50 rounded-lg border border-pirates-gray-100">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-pirates-red/10 rounded-lg flex items-center justify-center">
                          <Trophy className="w-5 h-5 text-pirates-red" />
                        </div>
                        <div>
                          <p className="font-heading font-bold text-pirates-black">{report.homeTeam} vs {report.awayTeam}</p>
                          <p className="text-sm text-pirates-gray-500">
                            {report.venue} • Field {report.field}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-heading text-2xl font-bold text-pirates-red">{report.score}</p>
                        <p className="text-xs text-pirates-gray-400">
                          {new Date(report.submittedAt).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-6 gap-4 pt-3 border-t border-pirates-gray-200">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-amber-600">{report.yellowCards}</p>
                        <p className="text-xs text-pirates-gray-500">Yellow Cards</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-red-600">{report.redCards}</p>
                        <p className="text-xs text-pirates-gray-500">Red Cards</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-blue-600">{report.substitutions || 0}</p>
                        <p className="text-xs text-pirates-gray-500">Substitutions</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-purple-600">{report.injuries || 0}</p>
                        <p className="text-xs text-pirates-gray-500">Injuries</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-pirates-gray-500">Submitted by</p>
                        <p className="text-sm font-medium text-pirates-black">{report.submittedBy}</p>
                      </div>
                      <div className="text-center flex items-center justify-center">
                        <button
                          onClick={() => generateMatchReportPDF(report)}
                          className="flex items-center gap-2 px-3 py-2 bg-pirates-red text-white rounded-lg text-sm hover:bg-pirates-red/90"
                        >
                          <FileDown className="w-4 h-4" />
                          Download
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Announcement Modal */}
      {showAnnouncementModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-heading text-xl font-bold text-pirates-black flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-pirates-red" />
                Send Announcement to Field Managers
              </h3>
              <button onClick={() => setShowAnnouncementModal(false)} className="text-pirates-gray-400 hover:text-pirates-black">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Priority */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-pirates-gray-600 mb-2">Priority</label>
              <div className="flex gap-2">
                {(['low', 'normal', 'high', 'urgent'] as const).map((p) => (
                  <button
                    key={p}
                    onClick={() => setAnnouncementPriority(p)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize ${
                      announcementPriority === p
                        ? `${announcementService.getPriorityColor(p)} text-white`
                        : 'bg-pirates-gray-100 text-pirates-gray-600'
                    }`}
                  >
                    {announcementService.getPriorityLabel(p)}
                  </button>
                ))}
              </div>
            </div>
            
            <textarea
              value={announcementText}
              onChange={(e) => setAnnouncementText(e.target.value)}
              placeholder="Type your announcement here..."
              rows={4}
              className="w-full px-4 py-3 border border-pirates-gray-200 rounded-lg text-pirates-black placeholder:text-pirates-gray-400 focus:outline-none focus:border-pirates-red focus:ring-2 focus:ring-pirates-red/10 resize-none"
            />
            
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => setShowAnnouncementModal(false)}
                className="flex-1 py-3 border border-pirates-gray-200 rounded-lg text-pirates-gray-600 hover:bg-pirates-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={sendAnnouncement}
                disabled={!announcementText.trim() || announcementSent}
                className={`flex-1 py-3 rounded-lg font-medium flex items-center justify-center gap-2 ${
                  announcementSent 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-pirates-red text-white hover:bg-pirates-red/90'
                }`}
              >
                {announcementSent ? (
                  <>
                    <Check className="w-5 h-5" />
                    Sent to Field Managers
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Send Announcement
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
