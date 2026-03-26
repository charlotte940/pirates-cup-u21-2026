import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { 
  MapPin, Clock, Flag, CheckCircle2, AlertCircle,
  Plus, Minus, Calendar, Info, FileText, Shield, Phone, Send, Activity, Bell, X, ClipboardList, AlertTriangle, Users, RefreshCw, Download, Stethoscope
} from 'lucide-react';
import type { Match } from '../../types';
import { announcementService, type Announcement } from '../../services/announcementService';
import NotificationBell from '../../components/NotificationBell';
import { getTeamPlayers } from '../../data/registeredTeams';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

// Venue - UJ Sports Grounds only
const UJ_SPORTS_GROUNDS = {
  id: 'uj-sports-grounds',
  name: 'UJ Sports Grounds',
  address: 'University of Johannesburg, Auckland Park, Johannesburg',
  image: '/venue-uj.jpg',
  fields: ['A', 'B', 'C', 'D', 'E', 'F'],
  facilities: ['Changing Rooms', 'Medical Station', 'Toilets', 'Water Points', 'Parking', 'Floodlights'],
  parking: 'Main parking lot at entrance. Gate opens 1 hour before first match.',
  emergencyContact: '011 559 3000'
};

// Daily Field Checklist (completed each day before games)
interface DailyChecklistItem {
  id: string;
  item: string;
  completed: boolean;
  category: 'field' | 'equipment' | 'safety' | 'medical';
}

const dailyChecklistItems: DailyChecklistItem[] = [
  { id: 'd1', item: 'Goalposts secured and nets properly attached', completed: false, category: 'field' },
  { id: 'd2', item: 'Corner flags in place at all four corners', completed: false, category: 'field' },
  { id: 'd3', item: 'Field lines clearly visible and marked', completed: false, category: 'field' },
  { id: 'd4', item: 'Technical areas marked and benches positioned', completed: false, category: 'field' },
  { id: 'd5', item: 'Match balls (3) inflated and ready - Size 5', completed: false, category: 'equipment' },
  { id: 'd6', item: 'Substitute boards available', completed: false, category: 'equipment' },
  { id: 'd7', item: 'Whistle and stopwatch for referee', completed: false, category: 'equipment' },
  { id: 'd8', item: 'Scoreboard operational', completed: false, category: 'equipment' },
  { id: 'd9', item: 'Spectator barriers secure', completed: false, category: 'safety' },
  { id: 'd10', item: 'Emergency exits clear', completed: false, category: 'safety' },
  { id: 'd11', item: 'First aid kit stocked and accessible', completed: false, category: 'medical' },
  { id: 'd12', item: 'Ice packs available', completed: false, category: 'medical' },
  { id: 'd13', item: 'Stretcher on standby', completed: false, category: 'medical' },
  { id: 'd14', item: 'Medical personnel present', completed: false, category: 'medical' },
];

// Match Event Types
interface MatchEvent {
  id: string;
  type: 'goal' | 'yellowcard' | 'redcard' | 'substitution' | 'injury';
  team: 'home' | 'away';
  playerName: string;
  playerNumber: number;
  minute: number;
  timestamp: string;
  // For substitutions
  playerOutName?: string;
  playerOutNumber?: number;
  // For injuries
  injuryType?: string;
  canContinue?: boolean;
}

// Starting Lineup
interface StartingLineup {
  team: 'home' | 'away';
  players: { id: string; name: string; number: number; confirmed: boolean }[];
  coachConfirmed: boolean;
  fieldManagerConfirmed: boolean;
}

// Substitute Record
interface SubstitutionRecord {
  id: string;
  team: 'home' | 'away';
  playerIn: { name: string; number: number };
  playerOut: { name: string; number: number };
  minute: number;
  timestamp: string;
}

// Injury Record
interface InjuryRecord {
  id: string;
  team: 'home' | 'away';
  playerName: string;
  playerNumber: number;
  injuryType: string;
  minute: number;
  canContinue: boolean;
  timestamp: string;
}

// Demo matches for UJ Sports Grounds
const demoMatches: Match[] = [
  { id: 'm1', homeTeamId: 'akhona', awayTeamId: 'soweto', homeTeamName: 'AKHONA FOOTBALL ACADEMY', awayTeamName: 'SOWETO FOOTBALL ACADEMY', date: '2026-07-15', time: '09:00', venue: 'uj-sports-grounds', field: 'A', status: 'scheduled', homeScore: 0, awayScore: 0, group: 'A', events: [] },
  { id: 'm2', homeTeamId: 'kaizer', awayTeamId: 'mamelodi', homeTeamName: 'KAIZER CHIEFS DEVELOPMENT', awayTeamName: 'MAMELODI SUNDOWNS ACADEMY', date: '2026-07-15', time: '09:00', venue: 'uj-sports-grounds', field: 'B', status: 'scheduled', homeScore: 0, awayScore: 0, group: 'B', events: [] },
  { id: 'm3', homeTeamId: 'orlando', awayTeamId: 'supersport', homeTeamName: 'ORLANDO PIRATES YOUTH', awayTeamName: 'SUPERSPORT UNITED ACADEMY', date: '2026-07-15', time: '11:00', venue: 'uj-sports-grounds', field: 'A', status: 'scheduled', homeScore: 0, awayScore: 0, group: 'A', events: [] },
  { id: 'm4', homeTeamId: 'bidvest', awayTeamId: 'amazulu', homeTeamName: 'BIDVEST WITS ACADEMY', awayTeamName: 'AMAZULU DEVELOPMENT', date: '2026-07-15', time: '11:00', venue: 'uj-sports-grounds', field: 'B', status: 'scheduled', homeScore: 0, awayScore: 0, group: 'B', events: [] },
  { id: 'm5', homeTeamId: 'chippa', awayTeamId: 'golden', homeTeamName: 'CHIPPA UNITED ACADEMY', awayTeamName: 'GOLDEN ARROWS ACADEMY', date: '2026-07-15', time: '14:00', venue: 'uj-sports-grounds', field: 'C', status: 'scheduled', homeScore: 0, awayScore: 0, group: 'C', events: [] },
  { id: 'm6', homeTeamId: 'maritzburg', awayTeamId: 'polokwane', homeTeamName: 'MARITZBURG UNITED ACADEMY', awayTeamName: 'POLOKWANE CITY ACADEMY', date: '2026-07-15', time: '14:00', venue: 'uj-sports-grounds', field: 'D', status: 'scheduled', homeScore: 0, awayScore: 0, group: 'D', events: [] },
];

// Player card tracking
interface PlayerCardRecord {
  playerName: string;
  teamName: string;
  yellowCards: number;
  redCards: number;
  isSuspended: boolean;
  suspensionReason?: string;
}

// Match Report for PDF
interface MatchReport {
  matchId: string;
  homeTeamName: string;
  awayTeamName: string;
  venue: string;
  field: string;
  date: string;
  time: string;
  finalScore: { home: number; away: number };
  homeStartingXI: { name: string; number: number }[];
  awayStartingXI: { name: string; number: number }[];
  homeSubstitutes: { name: string; number: number }[];
  awaySubstitutes: { name: string; number: number }[];
  goals: MatchEvent[];
  cards: MatchEvent[];
  substitutions: SubstitutionRecord[];
  injuries: InjuryRecord[];
  homeCoachSignature: string;
  awayCoachSignature: string;
  homeManOfMatch: string;
  awayManOfMatch: string;
  submittedAt: string;
  submittedBy: string;
}

export default function FieldManagerDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'schedule' | 'checklist' | 'score' | 'reports' | 'guide'>('checklist');
  
  // Get assigned field from user (A-F)
  const assignedField = user?.assignedField || 'A';
  
  // Filter matches for assigned field only
  const fieldMatches = demoMatches.filter(m => m.field === assignedField);
  
  // Timer state
  const [matchTime, setMatchTime] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [matchHalf, setMatchHalf] = useState<1 | 2>(1);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  
  // Selected match state
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [matchStatus, setMatchStatus] = useState<'pre-game' | 'live' | 'completed'>('pre-game');
  
  // Score state
  const [homeScore, setHomeScore] = useState(0);
  const [awayScore, setAwayScore] = useState(0);
  
  // Daily Checklist state
  const [dailyChecklist, setDailyChecklist] = useState<DailyChecklistItem[]>(dailyChecklistItems);
  const [checklistDate, setChecklistDate] = useState(new Date().toISOString().split('T')[0]);
  const [checklistSubmitted, setChecklistSubmitted] = useState(false);
  
  // Pre-game Modal state
  const [showPreGameModal, setShowPreGameModal] = useState(false);
  const [homeLineup, setHomeLineup] = useState<StartingLineup | null>(null);
  const [awayLineup, setAwayLineup] = useState<StartingLineup | null>(null);
  const [preGameStep, setPreGameStep] = useState<'home' | 'away' | 'confirm'>('home');
  
  // Match events
  const [matchEvents, setMatchEvents] = useState<MatchEvent[]>([]);
  const [substitutions, setSubstitutions] = useState<SubstitutionRecord[]>([]);
  const [injuries, setInjuries] = useState<InjuryRecord[]>([]);
  
  // Modal states
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [showCardModal, setShowCardModal] = useState(false);
  const [showSubModal, setShowSubModal] = useState(false);
  const [showInjuryModal, setShowInjuryModal] = useState(false);
  const [eventTeam, setEventTeam] = useState<'home' | 'away'>('home');
  const [cardType, setCardType] = useState<'yellowcard' | 'redcard'>('yellowcard');
  
  // Event form state
  const [selectedPlayer, setSelectedPlayer] = useState('');
  const [playerOut, setPlayerOut] = useState('');
  const [injuryType, setInjuryType] = useState('');
  const [canContinue, setCanContinue] = useState(true);
  
  // Announcements
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [showAnnouncements, setShowAnnouncements] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  
  // Match Reports
  const [matchReports, setMatchReports] = useState<MatchReport[]>([]);
  const [showReportModal, setShowReportModal] = useState(false);
  const [viewingReport, setViewingReport] = useState<MatchReport | null>(null);
  
  // Player cards tracking - using ref to avoid re-renders
  const playerCardsRef = useRef<PlayerCardRecord[]>([]);

  // Timer effect
  useEffect(() => {
    if (isTimerRunning) {
      timerRef.current = setInterval(() => {
        setMatchTime(prev => prev + 1);
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isTimerRunning]);

  // Subscribe to announcements
  useEffect(() => {
    const unsubscribe = announcementService.subscribe((newAnnouncement) => {
      setAnnouncements(prev => [newAnnouncement, ...prev]);
      setUnreadCount(prev => prev + 1);
    });
    
    const existingAnnouncements = announcementService.getAnnouncementsForRecipient(`fm-${assignedField}`);
    setAnnouncements(existingAnnouncements);
    setUnreadCount(existingAnnouncements.filter(a => !a.readBy.includes(`fm-${assignedField}`)).length);
    
    return unsubscribe;
  }, [assignedField]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getMatchMinute = () => {
    const mins = Math.floor(matchTime / 60);
    return matchHalf === 1 ? mins : mins + 35;
  };

  const startMatch = () => {
    setMatchStatus('live');
    setIsTimerRunning(true);
  };

  const endMatch = () => {
    setIsTimerRunning(false);
    setMatchStatus('completed');
    generateMatchReport();
  };

  const resetMatch = () => {
    setIsTimerRunning(false);
    setMatchTime(0);
    setMatchHalf(1);
    setHomeScore(0);
    setAwayScore(0);
    setMatchEvents([]);
    setSubstitutions([]);
    setInjuries([]);
    setMatchStatus('pre-game');
    setHomeLineup(null);
    setAwayLineup(null);
  };

  // Daily Checklist
  const toggleChecklistItem = (id: string) => {
    setDailyChecklist(prev => prev.map(item => 
      item.id === id ? { ...item, completed: !item.completed } : item
    ));
  };

  const checklistProgress = Math.round((dailyChecklist.filter(i => i.completed).length / dailyChecklist.length) * 100);
  const allChecklistComplete = dailyChecklist.every(i => i.completed);

  const submitDailyChecklist = () => {
    setChecklistSubmitted(true);
    setTimeout(() => {
      alert('Daily checklist submitted to Tournament Manager!');
    }, 500);
  };

  // Initialize starting lineup from team players
  const initializeLineup = (team: 'home' | 'away', teamName: string): StartingLineup => {
    const playerNames = getTeamPlayers(teamName);
    const confirmedPlayers = playerNames.length > 0 && playerNames[0] !== 'Not Yet Confirmed'
      ? playerNames.slice(0, 16).map((name, idx) => ({ 
          id: `${team}-${idx}`, 
          name: name, 
          number: idx + 1, 
          confirmed: false 
        }))
      : Array.from({ length: 16 }, (_, i) => ({ 
          id: `${team}-${i}`, 
          name: '', 
          number: i + 1, 
          confirmed: false 
        }));
    
    return {
      team,
      players: confirmedPlayers,
      coachConfirmed: false,
      fieldManagerConfirmed: false
    };
  };

  // Open pre-game modal
  const openPreGameModal = (match: Match) => {
    setSelectedMatch(match);
    setHomeLineup(initializeLineup('home', match.homeTeamName || ''));
    setAwayLineup(initializeLineup('away', match.awayTeamName || ''));
    setPreGameStep('home');
    setShowPreGameModal(true);
  };

  // Toggle player in lineup
  const togglePlayerInLineup = (team: 'home' | 'away', playerId: string) => {
    const setter = team === 'home' ? setHomeLineup : setAwayLineup;
    setter(prev => prev ? {
      ...prev,
      players: prev.players.map(p => 
        p.id === playerId ? { ...p, confirmed: !p.confirmed } : p
      )
    } : null);
  };

  // Update player name
  const updatePlayerName = (team: 'home' | 'away', playerId: string, name: string) => {
    const setter = team === 'home' ? setHomeLineup : setAwayLineup;
    setter(prev => prev ? {
      ...prev,
      players: prev.players.map(p => 
        p.id === playerId ? { ...p, name } : p
      )
    } : null);
  };

  // Confirm coach lineup
  const confirmCoachLineup = (team: 'home' | 'away') => {
    const setter = team === 'home' ? setHomeLineup : setAwayLineup;
    setter(prev => prev ? { ...prev, coachConfirmed: true } : null);
    if (team === 'home') setPreGameStep('away');
    else setPreGameStep('confirm');
  };

  // Confirm field manager lineup
  const confirmFieldManagerLineup = () => {
    setHomeLineup(prev => prev ? { ...prev, fieldManagerConfirmed: true } : null);
    setAwayLineup(prev => prev ? { ...prev, fieldManagerConfirmed: true } : null);
    setShowPreGameModal(false);
    setMatchStatus('pre-game');
  };

  // Add goal
  const addGoal = () => {
    if (!selectedPlayer || !selectedMatch) return;
    const lineup = eventTeam === 'home' ? homeLineup : awayLineup;
    const player = lineup?.players.find(p => p.id === selectedPlayer);
    
    if (player) {
      const newEvent: MatchEvent = {
        id: `event-${Date.now()}`,
        type: 'goal',
        team: eventTeam,
        playerName: player.name,
        playerNumber: player.number,
        minute: getMatchMinute(),
        timestamp: new Date().toISOString(),
      };
      setMatchEvents(prev => [...prev, newEvent]);
      
      if (eventTeam === 'home') setHomeScore(prev => prev + 1);
      else setAwayScore(prev => prev + 1);
      
      setSelectedPlayer('');
      setShowGoalModal(false);
    }
  };

  // Add card
  const addCard = () => {
    if (!selectedPlayer || !selectedMatch) return;
    const lineup = eventTeam === 'home' ? homeLineup : awayLineup;
    const player = lineup?.players.find(p => p.id === selectedPlayer);
    
    if (player) {
      const newEvent: MatchEvent = {
        id: `event-${Date.now()}`,
        type: cardType,
        team: eventTeam,
        playerName: player.name,
        playerNumber: player.number,
        minute: getMatchMinute(),
        timestamp: new Date().toISOString(),
      };
      setMatchEvents(prev => [...prev, newEvent]);
      
      // Track player card
      const teamName = eventTeam === 'home' ? selectedMatch.homeTeamName : selectedMatch.awayTeamName;
      addPlayerCard(player.name, teamName || '', cardType === 'yellowcard' ? 'yellow' : 'red');
      
      setSelectedPlayer('');
      setShowCardModal(false);
    }
  };

  // Add substitution
  const addSubstitution = () => {
    if (!selectedPlayer || !playerOut || !selectedMatch) return;
    const lineup = eventTeam === 'home' ? homeLineup : awayLineup;
    const playerIn = lineup?.players.find(p => p.id === selectedPlayer);
    const playerOutObj = lineup?.players.find(p => p.id === playerOut);
    
    if (playerIn && playerOutObj) {
      const newSub: SubstitutionRecord = {
        id: `sub-${Date.now()}`,
        team: eventTeam,
        playerIn: { name: playerIn.name, number: playerIn.number },
        playerOut: { name: playerOutObj.name, number: playerOutObj.number },
        minute: getMatchMinute(),
        timestamp: new Date().toISOString(),
      };
      setSubstitutions(prev => [...prev, newSub]);
      
      // Add to match events
      const newEvent: MatchEvent = {
        id: `event-${Date.now()}`,
        type: 'substitution',
        team: eventTeam,
        playerName: playerIn.name,
        playerNumber: playerIn.number,
        playerOutName: playerOutObj.name,
        playerOutNumber: playerOutObj.number,
        minute: getMatchMinute(),
        timestamp: new Date().toISOString(),
      };
      setMatchEvents(prev => [...prev, newEvent]);
      
      setSelectedPlayer('');
      setPlayerOut('');
      setShowSubModal(false);
    }
  };

  // Add injury
  const addInjury = () => {
    if (!selectedPlayer || !injuryType || !selectedMatch) return;
    const lineup = eventTeam === 'home' ? homeLineup : awayLineup;
    const player = lineup?.players.find(p => p.id === selectedPlayer);
    
    if (player) {
      const newInjury: InjuryRecord = {
        id: `injury-${Date.now()}`,
        team: eventTeam,
        playerName: player.name,
        playerNumber: player.number,
        injuryType,
        minute: getMatchMinute(),
        canContinue,
        timestamp: new Date().toISOString(),
      };
      setInjuries(prev => [...prev, newInjury]);
      
      // Add to match events
      const newEvent: MatchEvent = {
        id: `event-${Date.now()}`,
        type: 'injury',
        team: eventTeam,
        playerName: player.name,
        playerNumber: player.number,
        injuryType,
        canContinue,
        minute: getMatchMinute(),
        timestamp: new Date().toISOString(),
      };
      setMatchEvents(prev => [...prev, newEvent]);
      
      setSelectedPlayer('');
      setInjuryType('');
      setCanContinue(true);
      setShowInjuryModal(false);
    }
  };

  // Track player cards
  const addPlayerCard = (playerName: string, teamName: string, type: 'yellow' | 'red') => {
    const prev = playerCardsRef.current;
    const existing = prev.find(p => p.playerName === playerName && p.teamName === teamName);
    if (existing) {
      playerCardsRef.current = prev.map(p => {
        if (p.playerName === playerName && p.teamName === teamName) {
          const newYellows = type === 'yellow' ? p.yellowCards + 1 : p.yellowCards;
          const newReds = type === 'red' ? p.redCards + 1 : p.redCards;
          const isSuspended = newReds >= 1 || newYellows >= 2;
          const suspensionReason = newReds >= 1 
            ? 'Red Card - Suspended for next match' 
            : newYellows >= 2 
              ? '2 Yellow Cards - Suspended for next match' 
              : undefined;
          return { ...p, yellowCards: newYellows, redCards: newReds, isSuspended, suspensionReason };
        }
        return p;
      });
    } else {
      const isSuspended = type === 'red';
      playerCardsRef.current = [...prev, {
        playerName,
        teamName,
        yellowCards: type === 'yellow' ? 1 : 0,
        redCards: type === 'red' ? 1 : 0,
        isSuspended,
        suspensionReason: isSuspended ? 'Red Card - Suspended for next match' : undefined
      }];
    }
  };

  // Generate match report
  const generateMatchReport = () => {
    if (!selectedMatch || !homeLineup || !awayLineup) return;
    
    const report: MatchReport = {
      matchId: selectedMatch.id,
      homeTeamName: selectedMatch.homeTeamName || '',
      awayTeamName: selectedMatch.awayTeamName || '',
      venue: UJ_SPORTS_GROUNDS.name,
      field: assignedField,
      date: selectedMatch.date,
      time: selectedMatch.time,
      finalScore: { home: homeScore, away: awayScore },
      homeStartingXI: homeLineup.players.slice(0, 11).filter(p => p.confirmed).map(p => ({ name: p.name, number: p.number })),
      awayStartingXI: awayLineup.players.slice(0, 11).filter(p => p.confirmed).map(p => ({ name: p.name, number: p.number })),
      homeSubstitutes: homeLineup.players.slice(11).filter(p => p.confirmed).map(p => ({ name: p.name, number: p.number })),
      awaySubstitutes: awayLineup.players.slice(11).filter(p => p.confirmed).map(p => ({ name: p.name, number: p.number })),
      goals: matchEvents.filter(e => e.type === 'goal'),
      cards: matchEvents.filter(e => e.type === 'yellowcard' || e.type === 'redcard'),
      substitutions,
      injuries,
      homeCoachSignature: homeLineup.coachConfirmed ? 'Confirmed' : '',
      awayCoachSignature: awayLineup.coachConfirmed ? 'Confirmed' : '',
      homeManOfMatch: '',
      awayManOfMatch: '',
      submittedAt: new Date().toISOString(),
      submittedBy: user?.name || `Field Manager - Field ${assignedField}`,
    };
    
    setMatchReports(prev => [...prev, report]);
  };

  // Download PDF report
  const downloadPDFReport = (report: MatchReport) => {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(20);
    doc.setTextColor(200, 16, 46); // Pirates Red
    doc.text('PIRATES CUP U21 2026', 105, 20, { align: 'center' });
    
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text('OFFICIAL MATCH REPORT', 105, 30, { align: 'center' });
    
    // Match Info
    doc.setFontSize(12);
    doc.text(`Venue: ${report.venue} - Field ${report.field}`, 20, 45);
    doc.text(`Date: ${report.date}`, 20, 52);
    doc.text(`Time: ${report.time}`, 20, 59);
    doc.text(`Submitted: ${new Date(report.submittedAt).toLocaleString()}`, 20, 66);
    doc.text(`By: ${report.submittedBy}`, 20, 73);
    
    // Teams & Score
    doc.setFontSize(16);
    doc.setTextColor(200, 16, 46);
    doc.text(`${report.homeTeamName} ${report.finalScore.home} - ${report.finalScore.away} ${report.awayTeamName}`, 105, 85, { align: 'center' });
    
    // Starting XIs
    let yPos = 100;
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(`${report.homeTeamName} - Starting XI`, 20, yPos);
    doc.text(`${report.awayTeamName} - Starting XI`, 110, yPos);
    
    yPos += 8;
    const homeXI = report.homeStartingXI.map(p => [p.number.toString(), p.name || 'N/A']);
    const awayXI = report.awayStartingXI.map(p => [p.number.toString(), p.name || 'N/A']);
    
    (doc as any).autoTable({
      startY: yPos,
      head: [['#', 'Name']],
      body: homeXI.length > 0 ? homeXI : [['-', 'No players confirmed']],
      theme: 'grid',
      styles: { fontSize: 9 },
      columnStyles: { 0: { cellWidth: 10 } },
      margin: { left: 20 },
      tableWidth: 70,
    });
    
    (doc as any).autoTable({
      startY: yPos,
      head: [['#', 'Name']],
      body: awayXI.length > 0 ? awayXI : [['-', 'No players confirmed']],
      theme: 'grid',
      styles: { fontSize: 9 },
      columnStyles: { 0: { cellWidth: 10 } },
      margin: { left: 110 },
      tableWidth: 70,
    });
    
    // Goals
    yPos = (doc as any).lastAutoTable.finalY + 15;
    doc.setFontSize(12);
    doc.text('GOALS', 20, yPos);
    yPos += 8;
    
    if (report.goals.length > 0) {
      const goalsData = report.goals.map(g => [
        `${g.minute}'`,
        g.team === 'home' ? report.homeTeamName : report.awayTeamName,
        `#${g.playerNumber} ${g.playerName}`
      ]);
      (doc as any).autoTable({
        startY: yPos,
        head: [['Time', 'Team', 'Player']],
        body: goalsData,
        theme: 'grid',
        styles: { fontSize: 9 },
      });
      yPos = (doc as any).lastAutoTable.finalY + 10;
    } else {
      doc.text('No goals scored', 20, yPos);
      yPos += 10;
    }
    
    // Cards
    doc.text('CARDS', 20, yPos);
    yPos += 8;
    
    if (report.cards.length > 0) {
      const cardsData = report.cards.map(c => [
        `${c.minute}'`,
        c.team === 'home' ? report.homeTeamName : report.awayTeamName,
        `#${c.playerNumber} ${c.playerName}`,
        c.type === 'yellowcard' ? 'Yellow' : 'Red'
      ]);
      (doc as any).autoTable({
        startY: yPos,
        head: [['Time', 'Team', 'Player', 'Card']],
        body: cardsData,
        theme: 'grid',
        styles: { fontSize: 9 },
      });
      yPos = (doc as any).lastAutoTable.finalY + 10;
    } else {
      doc.text('No cards issued', 20, yPos);
      yPos += 10;
    }
    
    // Substitutions
    if (yPos > 250) {
      doc.addPage();
      yPos = 20;
    }
    doc.text('SUBSTITUTIONS', 20, yPos);
    yPos += 8;
    
    if (report.substitutions.length > 0) {
      const subsData = report.substitutions.map(s => [
        `${s.minute}'`,
        s.team === 'home' ? report.homeTeamName : report.awayTeamName,
        `In: #${s.playerIn.number} ${s.playerIn.name}`,
        `Out: #${s.playerOut.number} ${s.playerOut.name}`
      ]);
      (doc as any).autoTable({
        startY: yPos,
        head: [['Time', 'Team', 'Player In', 'Player Out']],
        body: subsData,
        theme: 'grid',
        styles: { fontSize: 9 },
      });
      yPos = (doc as any).lastAutoTable.finalY + 10;
    } else {
      doc.text('No substitutions', 20, yPos);
      yPos += 10;
    }
    
    // Injuries
    if (yPos > 250) {
      doc.addPage();
      yPos = 20;
    }
    doc.text('INJURIES', 20, yPos);
    yPos += 8;
    
    if (report.injuries.length > 0) {
      const injuriesData = report.injuries.map(i => [
        `${i.minute}'`,
        i.team === 'home' ? report.homeTeamName : report.awayTeamName,
        `#${i.playerNumber} ${i.playerName}`,
        i.injuryType,
        i.canContinue ? 'Continued' : 'Substituted'
      ]);
      (doc as any).autoTable({
        startY: yPos,
        head: [['Time', 'Team', 'Player', 'Injury', 'Status']],
        body: injuriesData,
        theme: 'grid',
        styles: { fontSize: 9 },
      });
    } else {
      doc.text('No injuries reported', 20, yPos);
    }
    
    // Signatures
    doc.addPage();
    doc.setFontSize(12);
    doc.text('COACH CONFIRMATIONS', 20, 30);
    doc.text(`${report.homeTeamName}: ${report.homeCoachSignature || 'Not confirmed'}`, 20, 45);
    doc.text(`${report.awayTeamName}: ${report.awayCoachSignature || 'Not confirmed'}`, 20, 55);
    
    doc.save(`Match-Report-${report.homeTeamName}-vs-${report.awayTeamName}-${report.date}.pdf`);
  };

  const tabs = [
    { id: 'checklist', label: 'Daily Checklist', icon: ClipboardList },
    { id: 'schedule', label: 'Match Schedule', icon: Calendar },
    { id: 'score', label: 'Live Match', icon: Clock },
    { id: 'reports', label: 'Match Reports', icon: FileText },
    { id: 'guide', label: 'Field Guide', icon: Info },
  ];

  const goalEvents = matchEvents.filter(e => e.type === 'goal');
  const cardEvents = matchEvents.filter(e => e.type === 'yellowcard' || e.type === 'redcard');

  return (
    <div className="space-y-6">
      {/* Venue Header */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-pirates-black to-pirates-gray-800">
        <div className="absolute inset-0 bg-[url('/pirates-pattern.png')] opacity-10" />
        <div className="relative p-6">
          <div className="flex items-end justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="w-4 h-4 text-pirates-gold" />
                <span className="text-white/80 text-sm">{UJ_SPORTS_GROUNDS.address}</span>
              </div>
              <h1 className="font-heading text-2xl md:text-3xl font-bold text-white uppercase">{UJ_SPORTS_GROUNDS.name}</h1>
            </div>
            <div className="flex items-center gap-2">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg">
                <NotificationBell userRole={`fieldmanager-${assignedField}`} />
              </div>
              <button
                onClick={() => { setShowAnnouncements(true); setUnreadCount(0); }}
                className="relative bg-white/10 backdrop-blur-sm rounded-lg px-3 py-2 hover:bg-white/20 transition-colors"
              >
                <Bell className="w-5 h-5 text-white" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-pirates-red text-white text-xs rounded-full flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>
              <div className="flex items-center gap-2 bg-pirates-gold/20 backdrop-blur-sm rounded-lg px-4 py-2 border border-pirates-gold/50">
                <Shield className="w-5 h-5 text-pirates-gold" />
                <span className="text-white font-bold">Field {assignedField}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Field Manager Info */}
      <div className="bg-amber-50 border-2 border-amber-300 rounded-xl p-4">
        <div className="flex items-center gap-3">
          <AlertTriangle className="w-6 h-6 text-amber-600 flex-shrink-0" />
          <div>
            <h4 className="font-bold text-amber-800">Field Manager Access</h4>
            <p className="text-sm text-amber-700">
              You are assigned to <strong>Field {assignedField}</strong> only. You can view and manage matches scheduled for this field.
            </p>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-xl border border-pirates-gray-200 p-2 overflow-x-auto">
        <div className="flex gap-1 min-w-max">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-3 rounded-lg font-medium text-sm transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-pirates-red text-white'
                  : 'text-pirates-gray-600 hover:bg-pirates-gray-100'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-xl border border-pirates-gray-200 overflow-hidden">
        
        {/* Daily Checklist Tab */}
        {activeTab === 'checklist' && (
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-pirates-red/10 rounded-lg flex items-center justify-center">
                  <ClipboardList className="w-5 h-5 text-pirates-red" />
                </div>
                <div>
                  <h2 className="font-heading text-xl font-bold text-pirates-black uppercase">Daily Field Checklist</h2>
                  <p className="text-sm text-pirates-gray-500">Complete before games start each day</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <input
                  type="date"
                  value={checklistDate}
                  onChange={(e) => { setChecklistDate(e.target.value); setChecklistSubmitted(false); }}
                  className="px-3 py-2 border border-pirates-gray-200 rounded-lg"
                />
                <div className="text-right">
                  <p className="text-2xl font-bold text-pirates-red">{checklistProgress}%</p>
                  <p className="text-xs text-pirates-gray-500">Complete</p>
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-3 bg-pirates-gray-100 rounded-full mb-6 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-pirates-red to-red-400 rounded-full transition-all duration-500"
                style={{ width: `${checklistProgress}%` }}
              />
            </div>

            {/* Checklist Items */}
            <div className="grid md:grid-cols-2 gap-4">
              {['field', 'equipment', 'safety', 'medical'].map(category => {
                const items = dailyChecklist.filter(i => i.category === category);
                const categoryNames: Record<string, string> = {
                  field: 'Field Setup',
                  equipment: 'Equipment',
                  safety: 'Safety',
                  medical: 'Medical'
                };
                
                return (
                  <div key={category} className="border border-pirates-gray-200 rounded-xl overflow-hidden">
                    <div className="bg-pirates-gray-50 px-4 py-3 font-medium text-pirates-black flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${
                        items.every(i => i.completed) ? 'bg-green-500' : 'bg-amber-500'
                      }`} />
                      {categoryNames[category]}
                    </div>
                    <div className="divide-y divide-pirates-gray-100">
                      {items.map(item => (
                        <label 
                          key={item.id}
                          className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-pirates-gray-50 transition-colors"
                        >
                          <input
                            type="checkbox"
                            checked={item.completed}
                            onChange={() => toggleChecklistItem(item.id)}
                            disabled={checklistSubmitted}
                            className="w-5 h-5 rounded border-pirates-gray-300 text-pirates-red focus:ring-pirates-red disabled:opacity-50"
                          />
                          <span className={`text-sm ${item.completed ? 'text-pirates-gray-400 line-through' : 'text-pirates-gray-700'}`}>
                            {item.item}
                          </span>
                          {item.completed && <CheckCircle2 className="w-4 h-4 text-green-500 ml-auto" />}
                        </label>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Submit Checklist */}
            <div className="mt-6 bg-white border-2 border-pirates-gray-200 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-medium text-pirates-black">Submit Daily Checklist</h3>
                  <p className="text-sm text-pirates-gray-500">Confirm field is ready for matches</p>
                </div>
                {checklistSubmitted && (
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle2 className="w-5 h-5" />
                    <span className="text-sm font-medium">Submitted</span>
                  </div>
                )}
              </div>
              
              <button
                onClick={submitDailyChecklist}
                disabled={checklistSubmitted || !allChecklistComplete}
                className={`w-full flex items-center justify-center gap-2 py-3 rounded-lg font-medium transition-colors ${
                  checklistSubmitted 
                    ? 'bg-green-100 text-green-700 cursor-default' 
                    : !allChecklistComplete
                      ? 'bg-pirates-gray-100 text-pirates-gray-400 cursor-not-allowed'
                      : 'bg-pirates-red text-white hover:bg-pirates-red/90'
                }`}
              >
                {checklistSubmitted ? (
                  <>
                    <CheckCircle2 className="w-5 h-5" />
                    Checklist Submitted to Tournament Manager
                  </>
                ) : !allChecklistComplete ? (
                  <>
                    <AlertCircle className="w-5 h-5" />
                    Complete All Items First
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Submit Checklist to Tournament Manager
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Match Schedule Tab */}
        {activeTab === 'schedule' && (
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-pirates-red/10 rounded-lg flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-pirates-red" />
                </div>
                <div>
                  <h2 className="font-heading text-xl font-bold text-pirates-black uppercase">Match Schedule</h2>
                  <p className="text-sm text-pirates-gray-500">Field {assignedField} - {UJ_SPORTS_GROUNDS.name}</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {fieldMatches.length === 0 ? (
                <div className="text-center py-12 text-pirates-gray-400">
                  <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No matches scheduled for Field {assignedField}</p>
                </div>
              ) : (
                fieldMatches.map((match, idx) => (
                  <div 
                    key={match.id}
                    className="border border-pirates-gray-200 rounded-xl p-4 hover:border-pirates-red transition-colors"
                  >
                    <div className="flex items-center justify-between flex-wrap gap-4">
                      <div className="flex items-center gap-4">
                        <div className="bg-pirates-gray-100 rounded-lg px-3 py-2 text-center min-w-[60px]">
                          <p className="text-lg font-bold text-pirates-black">{match.time}</p>
                          <p className="text-xs text-pirates-gray-500">Match {idx + 1}</p>
                        </div>
                        <div>
                          <div className="flex items-center gap-3 flex-wrap">
                            <span className="font-medium text-pirates-black">{match.homeTeamName}</span>
                            <span className="text-pirates-gray-400">vs</span>
                            <span className="font-medium text-pirates-black">{match.awayTeamName}</span>
                          </div>
                          <p className="text-sm text-pirates-gray-500 mt-1">Group {match.group} • Field {match.field}</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => openPreGameModal(match)}
                        className="flex items-center gap-2 px-4 py-2 bg-pirates-red text-white rounded-lg text-sm font-medium hover:bg-pirates-red/90"
                      >
                        <ClipboardList className="w-4 h-4" />
                        Pre-Game Check
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Live Match Tab */}
        {activeTab === 'score' && (
          <div className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-pirates-red/10 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-pirates-red" />
              </div>
              <div>
                <h2 className="font-heading text-xl font-bold text-pirates-black uppercase">Live Match</h2>
                <p className="text-sm text-pirates-gray-500">Record match events and scores</p>
              </div>
            </div>

            {/* Match Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-pirates-gray-600 mb-2">Select Match</label>
              <select
                value={selectedMatch?.id || ''}
                onChange={(e) => {
                  const match = fieldMatches.find(m => m.id === e.target.value);
                  if (match) {
                    setSelectedMatch(match);
                    resetMatch();
                    openPreGameModal(match);
                  }
                }}
                className="w-full px-4 py-3 border border-pirates-gray-200 rounded-lg focus:ring-2 focus:ring-pirates-red focus:border-pirates-red"
              >
                <option value="">Select a match...</option>
                {fieldMatches.map(match => (
                  <option key={match.id} value={match.id}>
                    {match.time} - {match.homeTeamName} vs {match.awayTeamName}
                  </option>
                ))}
              </select>
            </div>

            {selectedMatch && matchStatus !== 'pre-game' && (
              <>
                {/* Match Status Banner */}
                <div className={`mb-6 p-4 rounded-xl flex items-center justify-between ${
                  matchStatus === 'live' ? 'bg-green-100 border-2 border-green-300' : 'bg-blue-100 border-2 border-blue-300'
                }`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full animate-pulse ${matchStatus === 'live' ? 'bg-green-500' : 'bg-blue-500'}`} />
                    <span className={`font-bold ${matchStatus === 'live' ? 'text-green-800' : 'text-blue-800'}`}>
                      {matchStatus === 'live' ? 'LIVE MATCH IN PROGRESS' : 'MATCH COMPLETED'}
                    </span>
                  </div>
                  {matchStatus === 'completed' && (
                    <button
                      onClick={() => setActiveTab('reports')}
                      className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm"
                    >
                      <FileText className="w-4 h-4" />
                      View Report
                    </button>
                  )}
                </div>

                {/* Match Timer */}
                <div className="bg-gradient-to-br from-pirates-black to-pirates-gray-800 rounded-2xl p-8 text-white text-center mb-6">
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      matchHalf === 1 ? 'bg-pirates-gold text-pirates-black' : 'bg-white/20'
                    }`}>1st Half</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      matchHalf === 2 ? 'bg-pirates-gold text-pirates-black' : 'bg-white/20'
                    }`}>2nd Half</span>
                  </div>
                  
                  <div className="text-7xl md:text-8xl font-mono font-bold mb-6 tracking-wider">
                    {formatTime(matchTime)}
                  </div>

                  {matchStatus === 'live' && (
                    <div className="flex justify-center gap-3 flex-wrap mb-6">
                      {!isTimerRunning ? (
                        <button 
                          onClick={() => setIsTimerRunning(true)}
                          className="flex items-center gap-2 px-6 py-3 bg-green-500 hover:bg-green-600 rounded-lg font-medium transition-colors"
                        >
                          <Clock className="w-5 h-5" />
                          Resume
                        </button>
                      ) : (
                        <button 
                          onClick={() => setIsTimerRunning(false)}
                          className="flex items-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-600 rounded-lg font-medium transition-colors"
                        >
                          <Clock className="w-5 h-5" />
                          Pause
                        </button>
                      )}
                      <button 
                        onClick={() => {
                          if (matchHalf === 1) {
                            setMatchHalf(2);
                            setMatchTime(0);
                          } else {
                            endMatch();
                          }
                        }}
                        className="flex items-center gap-2 px-6 py-3 bg-pirates-gold hover:bg-pirates-gold/90 text-pirates-black rounded-lg font-medium transition-colors"
                      >
                        <Flag className="w-5 h-5" />
                        {matchHalf === 1 ? 'Half Time' : 'Full Time'}
                      </button>
                    </div>
                  )}

                  <p className="text-white/60 text-sm">
                    {selectedMatch.homeTeamName} vs {selectedMatch.awayTeamName}
                  </p>
                </div>

                {/* Score Board */}
                <div className="bg-pirates-gray-50 rounded-2xl p-6 mb-6">
                  <h3 className="font-medium text-pirates-black mb-4 text-center">Live Score</h3>
                  <div className="flex items-center justify-center gap-8">
                    <div className="text-center">
                      <p className="text-sm text-pirates-gray-500 mb-2">{selectedMatch.homeTeamName}</p>
                      <div className="flex items-center gap-3">
                        {matchStatus === 'live' && (
                          <button 
                            onClick={() => setHomeScore(Math.max(0, homeScore - 1))}
                            className="w-10 h-10 bg-white border border-pirates-gray-200 rounded-lg flex items-center justify-center hover:border-pirates-red"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                        )}
                        <span className="text-5xl font-bold text-pirates-black w-16">{homeScore}</span>
                        {matchStatus === 'live' && (
                          <button 
                            onClick={() => setHomeScore(homeScore + 1)}
                            className="w-10 h-10 bg-pirates-red text-white rounded-lg flex items-center justify-center hover:bg-pirates-red/90"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="text-3xl font-bold text-pirates-gray-300">-</div>

                    <div className="text-center">
                      <p className="text-sm text-pirates-gray-500 mb-2">{selectedMatch.awayTeamName}</p>
                      <div className="flex items-center gap-3">
                        {matchStatus === 'live' && (
                          <button 
                            onClick={() => setAwayScore(Math.max(0, awayScore - 1))}
                            className="w-10 h-10 bg-white border border-pirates-gray-200 rounded-lg flex items-center justify-center hover:border-pirates-red"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                        )}
                        <span className="text-5xl font-bold text-pirates-black w-16">{awayScore}</span>
                        {matchStatus === 'live' && (
                          <button 
                            onClick={() => setAwayScore(awayScore + 1)}
                            className="w-10 h-10 bg-pirates-red text-white rounded-lg flex items-center justify-center hover:bg-pirates-red/90"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                {matchStatus === 'live' && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <button
                      onClick={() => { setEventTeam('home'); setShowGoalModal(true); }}
                      className="flex flex-col items-center gap-2 p-4 bg-green-100 border-2 border-green-300 rounded-xl hover:bg-green-200 transition-colors"
                    >
                      <Activity className="w-6 h-6 text-green-600" />
                      <span className="text-sm font-medium text-green-800">Goal</span>
                    </button>
                    <button
                      onClick={() => { setEventTeam('home'); setShowCardModal(true); }}
                      className="flex flex-col items-center gap-2 p-4 bg-amber-100 border-2 border-amber-300 rounded-xl hover:bg-amber-200 transition-colors"
                    >
                      <AlertTriangle className="w-6 h-6 text-amber-600" />
                      <span className="text-sm font-medium text-amber-800">Card</span>
                    </button>
                    <button
                      onClick={() => { setEventTeam('home'); setShowSubModal(true); }}
                      className="flex flex-col items-center gap-2 p-4 bg-blue-100 border-2 border-blue-300 rounded-xl hover:bg-blue-200 transition-colors"
                    >
                      <RefreshCw className="w-6 h-6 text-blue-600" />
                      <span className="text-sm font-medium text-blue-800">Substitution</span>
                    </button>
                    <button
                      onClick={() => { setEventTeam('home'); setShowInjuryModal(true); }}
                      className="flex flex-col items-center gap-2 p-4 bg-red-100 border-2 border-red-300 rounded-xl hover:bg-red-200 transition-colors"
                    >
                      <Stethoscope className="w-6 h-6 text-red-600" />
                      <span className="text-sm font-medium text-red-800">Injury</span>
                    </button>
                  </div>
                )}

                {/* Match Events Summary */}
                {(goalEvents.length > 0 || cardEvents.length > 0 || substitutions.length > 0 || injuries.length > 0) && (
                  <div className="bg-pirates-gray-50 rounded-xl p-4">
                    <h4 className="font-medium text-pirates-black mb-3">Match Events</h4>
                    
                    {goalEvents.length > 0 && (
                      <div className="mb-3">
                        <p className="text-sm font-medium text-green-700 mb-1">Goals:</p>
                        <div className="flex flex-wrap gap-2">
                          {goalEvents.map(g => (
                            <span key={g.id} className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                              {g.minute}' {g.team === 'home' ? 'H' : 'A'} #{g.playerNumber} {g.playerName}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {cardEvents.length > 0 && (
                      <div className="mb-3">
                        <p className="text-sm font-medium text-amber-700 mb-1">Cards:</p>
                        <div className="flex flex-wrap gap-2">
                          {cardEvents.map(c => (
                            <span key={c.id} className={`px-2 py-1 text-xs rounded ${
                              c.type === 'yellowcard' ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {c.minute}' {c.team === 'home' ? 'H' : 'A'} #{c.playerNumber} {c.playerName} ({c.type === 'yellowcard' ? 'Y' : 'R'})
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {substitutions.length > 0 && (
                      <div className="mb-3">
                        <p className="text-sm font-medium text-blue-700 mb-1">Substitutions:</p>
                        <div className="flex flex-wrap gap-2">
                          {substitutions.map(s => (
                            <span key={s.id} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                              {s.minute}' {s.team === 'home' ? 'H' : 'A'} In:#{s.playerIn.number} Out:#{s.playerOut.number}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {injuries.length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-red-700 mb-1">Injuries:</p>
                        <div className="flex flex-wrap gap-2">
                          {injuries.map(i => (
                            <span key={i.id} className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded">
                              {i.minute}' {i.team === 'home' ? 'H' : 'A'} #{i.playerNumber} {i.injuryType} ({i.canContinue ? 'Continued' : 'Subbed'})
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}

            {selectedMatch && matchStatus === 'pre-game' && (
              <div className="text-center py-12 bg-pirates-gray-50 rounded-xl">
                <Users className="w-12 h-12 mx-auto mb-3 text-pirates-gray-400" />
                <p className="text-pirates-gray-600 mb-4">Pre-game checks completed. Ready to start match.</p>
                <button
                  onClick={startMatch}
                  className="flex items-center gap-2 px-6 py-3 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 mx-auto"
                >
                  <Flag className="w-5 h-5" />
                  Start Match
                </button>
              </div>
            )}

            {!selectedMatch && (
              <div className="text-center py-12 text-pirates-gray-400">
                <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Select a match to begin</p>
              </div>
            )}
          </div>
        )}

        {/* Match Reports Tab */}
        {activeTab === 'reports' && (
          <div className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-pirates-red/10 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-pirates-red" />
              </div>
              <div>
                <h2 className="font-heading text-xl font-bold text-pirates-black uppercase">Match Reports</h2>
                <p className="text-sm text-pirates-gray-500">Download completed match reports</p>
              </div>
            </div>

            {matchReports.length === 0 ? (
              <div className="text-center py-12 text-pirates-gray-400">
                <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No match reports available yet</p>
                <p className="text-sm">Complete a match to generate a report</p>
              </div>
            ) : (
              <div className="space-y-4">
                {matchReports.map(report => (
                  <div key={report.matchId} className="border border-pirates-gray-200 rounded-xl p-4">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-pirates-black">{report.homeTeamName}</span>
                          <span className="text-lg font-bold text-pirates-red">{report.finalScore.home} - {report.finalScore.away}</span>
                          <span className="font-bold text-pirates-black">{report.awayTeamName}</span>
                        </div>
                        <p className="text-sm text-pirates-gray-500">
                          Field {report.field} • {report.date} • {report.time}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => { setViewingReport(report); setShowReportModal(true); }}
                          className="flex items-center gap-2 px-4 py-2 bg-pirates-gray-100 text-pirates-gray-700 rounded-lg text-sm hover:bg-pirates-gray-200"
                        >
                          <Info className="w-4 h-4" />
                          View
                        </button>
                        <button
                          onClick={() => downloadPDFReport(report)}
                          className="flex items-center gap-2 px-4 py-2 bg-pirates-red text-white rounded-lg text-sm hover:bg-pirates-red/90"
                        >
                          <Download className="w-4 h-4" />
                          Download PDF
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Field Manager Guide Tab */}
        {activeTab === 'guide' && (
          <div className="p-6 space-y-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-pirates-red/10 rounded-lg flex items-center justify-center">
                <Info className="w-5 h-5 text-pirates-red" />
              </div>
              <h2 className="font-heading text-xl font-bold text-pirates-black uppercase">Field Manager Guide</h2>
            </div>

            {/* Responsibilities */}
            <div className="grid md:grid-cols-2 gap-4">
              {[
                { title: 'Daily Checklist', desc: 'Complete field checklist before games each day', icon: ClipboardList },
                { title: 'Pre-Game Checks', desc: 'Confirm starting lineups with coaches', icon: Users },
                { title: 'Live Scoring', desc: 'Track goals, cards, subs, and injuries', icon: Activity },
                { title: 'Match Reports', desc: 'Generate and download PDF reports', icon: FileText },
              ].map((item, idx) => (
                <div key={idx} className="flex items-start gap-3 p-4 bg-pirates-gray-50 rounded-xl">
                  <div className="w-10 h-10 bg-pirates-red/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <item.icon className="w-5 h-5 text-pirates-red" />
                  </div>
                  <div>
                    <h4 className="font-medium text-pirates-black">{item.title}</h4>
                    <p className="text-sm text-pirates-gray-500">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Card Rules */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
              <h3 className="font-medium text-amber-800 mb-3 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Card Suspension Rules
              </h3>
              <div className="grid md:grid-cols-2 gap-3 text-sm text-amber-700">
                <div className="flex items-start gap-2">
                  <div className="w-4 h-4 bg-yellow-400 rounded-full border border-yellow-600 flex-shrink-0 mt-0.5" />
                  <span><strong>2 Yellow Cards</strong> = Suspended from next match</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-4 h-4 bg-red-500 rounded-full border border-red-700 flex-shrink-0 mt-0.5" />
                  <span><strong>1 Red Card</strong> = Immediate + next match suspension</span>
                </div>
              </div>
            </div>

            {/* Emergency Info */}
            <div className="bg-red-50 rounded-xl p-5 border border-red-200">
              <h3 className="font-medium text-red-800 mb-2 flex items-center gap-2">
                <Phone className="w-4 h-4" />
                Emergency Contact
              </h3>
              <p className="text-lg font-bold text-red-700">{UJ_SPORTS_GROUNDS.emergencyContact}</p>
              <p className="text-sm text-red-600 mt-1">Tournament Director: 082 123 4567</p>
            </div>
          </div>
        )}
      </div>

      {/* Pre-Game Modal */}
      {showPreGameModal && selectedMatch && homeLineup && awayLineup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-auto">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-auto">
            <div className="sticky top-0 bg-white border-b border-pirates-gray-200 p-6 flex items-center justify-between">
              <div>
                <h3 className="font-heading text-xl font-bold text-pirates-black">Pre-Game Check</h3>
                <p className="text-sm text-pirates-gray-500">
                  {selectedMatch.homeTeamName} vs {selectedMatch.awayTeamName} • Field {assignedField}
                </p>
              </div>
              <button 
                onClick={() => setShowPreGameModal(false)}
                className="text-pirates-gray-400 hover:text-pirates-black"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6">
              {/* Step Indicator */}
              <div className="flex items-center gap-2 mb-6">
                <div className={`flex-1 h-2 rounded-full ${preGameStep === 'home' ? 'bg-pirates-red' : 'bg-green-500'}`} />
                <div className={`flex-1 h-2 rounded-full ${preGameStep === 'away' ? 'bg-pirates-red' : preGameStep === 'confirm' ? 'bg-green-500' : 'bg-pirates-gray-200'}`} />
                <div className={`flex-1 h-2 rounded-full ${preGameStep === 'confirm' ? 'bg-pirates-red' : 'bg-pirates-gray-200'}`} />
              </div>

              {/* Home Team Lineup */}
              {preGameStep === 'home' && (
                <div>
                  <h4 className="font-medium text-pirates-black mb-4 flex items-center gap-2">
                    <Users className="w-5 h-5 text-pirates-red" />
                    {selectedMatch.homeTeamName} - Starting Lineup
                  </h4>
                  <p className="text-sm text-pirates-gray-500 mb-4">
                    Coach: Check the starting 11 players. Field Manager: Confirm after verification.
                  </p>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                    {homeLineup.players.map((player, idx) => (
                      <label 
                        key={player.id}
                        className={`flex items-center gap-2 p-3 border rounded-lg cursor-pointer transition-colors ${
                          player.confirmed ? 'border-green-500 bg-green-50' : 'border-pirates-gray-200'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={player.confirmed}
                          onChange={() => togglePlayerInLineup('home', player.id)}
                          disabled={homeLineup.coachConfirmed}
                          className="w-4 h-4 text-pirates-red rounded"
                        />
                        <div className="flex-1">
                          <input
                            type="text"
                            value={player.name}
                            onChange={(e) => updatePlayerName('home', player.id, e.target.value)}
                            disabled={homeLineup.coachConfirmed}
                            placeholder={`Player ${idx + 1}`}
                            className="w-full text-sm border-0 p-0 focus:ring-0 bg-transparent"
                          />
                          <span className="text-xs text-pirates-gray-400">#{player.number}</span>
                        </div>
                      </label>
                    ))}
                  </div>
                  
                  <button
                    onClick={() => confirmCoachLineup('home')}
                    disabled={homeLineup.players.filter(p => p.confirmed).length !== 11}
                    className="w-full py-3 bg-pirates-red text-white rounded-lg font-medium disabled:opacity-50"
                  >
                    Coach Confirm Lineup ({homeLineup.players.filter(p => p.confirmed).length}/11 selected)
                  </button>
                </div>
              )}

              {/* Away Team Lineup */}
              {preGameStep === 'away' && (
                <div>
                  <h4 className="font-medium text-pirates-black mb-4 flex items-center gap-2">
                    <Users className="w-5 h-5 text-blue-600" />
                    {selectedMatch.awayTeamName} - Starting Lineup
                  </h4>
                  <p className="text-sm text-pirates-gray-500 mb-4">
                    Coach: Check the starting 11 players. Field Manager: Confirm after verification.
                  </p>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                    {awayLineup.players.map((player, idx) => (
                      <label 
                        key={player.id}
                        className={`flex items-center gap-2 p-3 border rounded-lg cursor-pointer transition-colors ${
                          player.confirmed ? 'border-green-500 bg-green-50' : 'border-pirates-gray-200'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={player.confirmed}
                          onChange={() => togglePlayerInLineup('away', player.id)}
                          disabled={awayLineup.coachConfirmed}
                          className="w-4 h-4 text-blue-600 rounded"
                        />
                        <div className="flex-1">
                          <input
                            type="text"
                            value={player.name}
                            onChange={(e) => updatePlayerName('away', player.id, e.target.value)}
                            disabled={awayLineup.coachConfirmed}
                            placeholder={`Player ${idx + 1}`}
                            className="w-full text-sm border-0 p-0 focus:ring-0 bg-transparent"
                          />
                          <span className="text-xs text-pirates-gray-400">#{player.number}</span>
                        </div>
                      </label>
                    ))}
                  </div>
                  
                  <button
                    onClick={() => confirmCoachLineup('away')}
                    disabled={awayLineup.players.filter(p => p.confirmed).length !== 11}
                    className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium disabled:opacity-50"
                  >
                    Coach Confirm Lineup ({awayLineup.players.filter(p => p.confirmed).length}/11 selected)
                  </button>
                </div>
              )}

              {/* Final Confirmation */}
              {preGameStep === 'confirm' && (
                <div>
                  <h4 className="font-medium text-pirates-black mb-4">Final Confirmation</h4>
                  
                  <div className="grid md:grid-cols-2 gap-4 mb-6">
                    <div className="border border-pirates-gray-200 rounded-xl p-4">
                      <h5 className="font-medium text-pirates-red mb-2">{selectedMatch.homeTeamName}</h5>
                      <p className="text-sm text-green-600 flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" />
                        Coach Confirmed
                      </p>
                      <p className="text-sm text-pirates-gray-500 mt-2">
                        {homeLineup.players.filter(p => p.confirmed).length} players selected
                      </p>
                    </div>
                    <div className="border border-pirates-gray-200 rounded-xl p-4">
                      <h5 className="font-medium text-blue-600 mb-2">{selectedMatch.awayTeamName}</h5>
                      <p className="text-sm text-green-600 flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" />
                        Coach Confirmed
                      </p>
                      <p className="text-sm text-pirates-gray-500 mt-2">
                        {awayLineup.players.filter(p => p.confirmed).length} players selected
                      </p>
                    </div>
                  </div>
                  
                  <button
                    onClick={confirmFieldManagerLineup}
                    className="w-full py-3 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600"
                  >
                    Field Manager Confirm - Ready for Kickoff
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Goal Modal */}
      {showGoalModal && selectedMatch && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <h3 className="font-heading text-lg font-bold text-pirates-black mb-4">Record Goal</h3>
            
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setEventTeam('home')}
                className={`flex-1 py-2 rounded-lg text-sm font-medium ${
                  eventTeam === 'home' ? 'bg-pirates-red text-white' : 'bg-pirates-gray-100'
                }`}
              >
                {selectedMatch.homeTeamName}
              </button>
              <button
                onClick={() => setEventTeam('away')}
                className={`flex-1 py-2 rounded-lg text-sm font-medium ${
                  eventTeam === 'away' ? 'bg-blue-600 text-white' : 'bg-pirates-gray-100'
                }`}
              >
                {selectedMatch.awayTeamName}
              </button>
            </div>
            
            <select
              value={selectedPlayer}
              onChange={(e) => setSelectedPlayer(e.target.value)}
              className="w-full px-4 py-3 border border-pirates-gray-200 rounded-lg mb-4"
            >
              <option value="">Select goal scorer...</option>
              {(eventTeam === 'home' ? homeLineup?.players : awayLineup?.players)
                ?.filter(p => p.confirmed)
                .map(player => (
                  <option key={player.id} value={player.id}>
                    #{player.number} {player.name || 'Unnamed'}
                  </option>
                ))}
            </select>
            
            <div className="flex gap-2">
              <button
                onClick={addGoal}
                disabled={!selectedPlayer}
                className="flex-1 py-3 bg-green-500 text-white rounded-lg font-medium disabled:opacity-50"
              >
                Record Goal at {getMatchMinute()}'
              </button>
              <button
                onClick={() => { setShowGoalModal(false); setSelectedPlayer(''); }}
                className="px-4 py-3 bg-pirates-gray-100 rounded-lg"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Card Modal */}
      {showCardModal && selectedMatch && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <h3 className="font-heading text-lg font-bold text-pirates-black mb-4">Record Card</h3>
            
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setCardType('yellowcard')}
                className={`flex-1 py-2 rounded-lg text-sm font-medium ${
                  cardType === 'yellowcard' ? 'bg-amber-500 text-white' : 'bg-pirates-gray-100'
                }`}
              >
                Yellow Card
              </button>
              <button
                onClick={() => setCardType('redcard')}
                className={`flex-1 py-2 rounded-lg text-sm font-medium ${
                  cardType === 'redcard' ? 'bg-red-500 text-white' : 'bg-pirates-gray-100'
                }`}
              >
                Red Card
              </button>
            </div>
            
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setEventTeam('home')}
                className={`flex-1 py-2 rounded-lg text-sm font-medium ${
                  eventTeam === 'home' ? 'bg-pirates-red text-white' : 'bg-pirates-gray-100'
                }`}
              >
                {selectedMatch.homeTeamName}
              </button>
              <button
                onClick={() => setEventTeam('away')}
                className={`flex-1 py-2 rounded-lg text-sm font-medium ${
                  eventTeam === 'away' ? 'bg-blue-600 text-white' : 'bg-pirates-gray-100'
                }`}
              >
                {selectedMatch.awayTeamName}
              </button>
            </div>
            
            <select
              value={selectedPlayer}
              onChange={(e) => setSelectedPlayer(e.target.value)}
              className="w-full px-4 py-3 border border-pirates-gray-200 rounded-lg mb-4"
            >
              <option value="">Select player...</option>
              {(eventTeam === 'home' ? homeLineup?.players : awayLineup?.players)
                ?.filter(p => p.confirmed)
                .map(player => (
                  <option key={player.id} value={player.id}>
                    #{player.number} {player.name || 'Unnamed'}
                  </option>
                ))}
            </select>
            
            <div className="flex gap-2">
              <button
                onClick={addCard}
                disabled={!selectedPlayer}
                className={`flex-1 py-3 rounded-lg font-medium text-white disabled:opacity-50 ${
                  cardType === 'yellowcard' ? 'bg-amber-500' : 'bg-red-500'
                }`}
              >
                Record {cardType === 'yellowcard' ? 'Yellow' : 'Red'} Card at {getMatchMinute()}'
              </button>
              <button
                onClick={() => { setShowCardModal(false); setSelectedPlayer(''); }}
                className="px-4 py-3 bg-pirates-gray-100 rounded-lg"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Substitution Modal */}
      {showSubModal && selectedMatch && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <h3 className="font-heading text-lg font-bold text-pirates-black mb-4">Record Substitution</h3>
            
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setEventTeam('home')}
                className={`flex-1 py-2 rounded-lg text-sm font-medium ${
                  eventTeam === 'home' ? 'bg-pirates-red text-white' : 'bg-pirates-gray-100'
                }`}
              >
                {selectedMatch.homeTeamName}
              </button>
              <button
                onClick={() => setEventTeam('away')}
                className={`flex-1 py-2 rounded-lg text-sm font-medium ${
                  eventTeam === 'away' ? 'bg-blue-600 text-white' : 'bg-pirates-gray-100'
                }`}
              >
                {selectedMatch.awayTeamName}
              </button>
            </div>
            
            <label className="block text-sm font-medium text-pirates-gray-600 mb-2">Player In</label>
            <select
              value={selectedPlayer}
              onChange={(e) => setSelectedPlayer(e.target.value)}
              className="w-full px-4 py-3 border border-pirates-gray-200 rounded-lg mb-4"
            >
              <option value="">Select player coming on...</option>
              {(eventTeam === 'home' ? homeLineup?.players : awayLineup?.players)
                ?.filter(p => !p.confirmed && p.name)
                .map(player => (
                  <option key={player.id} value={player.id}>
                    #{player.number} {player.name}
                  </option>
                ))}
            </select>
            
            <label className="block text-sm font-medium text-pirates-gray-600 mb-2">Player Out</label>
            <select
              value={playerOut}
              onChange={(e) => setPlayerOut(e.target.value)}
              className="w-full px-4 py-3 border border-pirates-gray-200 rounded-lg mb-4"
            >
              <option value="">Select player going off...</option>
              {(eventTeam === 'home' ? homeLineup?.players : awayLineup?.players)
                ?.filter(p => p.confirmed)
                .map(player => (
                  <option key={player.id} value={player.id}>
                    #{player.number} {player.name || 'Unnamed'}
                  </option>
                ))}
            </select>
            
            <div className="flex gap-2">
              <button
                onClick={addSubstitution}
                disabled={!selectedPlayer || !playerOut}
                className="flex-1 py-3 bg-blue-500 text-white rounded-lg font-medium disabled:opacity-50"
              >
                Record Substitution at {getMatchMinute()}'
              </button>
              <button
                onClick={() => { setShowSubModal(false); setSelectedPlayer(''); setPlayerOut(''); }}
                className="px-4 py-3 bg-pirates-gray-100 rounded-lg"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Injury Modal */}
      {showInjuryModal && selectedMatch && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <h3 className="font-heading text-lg font-bold text-pirates-black mb-4">Record Injury</h3>
            
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setEventTeam('home')}
                className={`flex-1 py-2 rounded-lg text-sm font-medium ${
                  eventTeam === 'home' ? 'bg-pirates-red text-white' : 'bg-pirates-gray-100'
                }`}
              >
                {selectedMatch.homeTeamName}
              </button>
              <button
                onClick={() => setEventTeam('away')}
                className={`flex-1 py-2 rounded-lg text-sm font-medium ${
                  eventTeam === 'away' ? 'bg-blue-600 text-white' : 'bg-pirates-gray-100'
                }`}
              >
                {selectedMatch.awayTeamName}
              </button>
            </div>
            
            <select
              value={selectedPlayer}
              onChange={(e) => setSelectedPlayer(e.target.value)}
              className="w-full px-4 py-3 border border-pirates-gray-200 rounded-lg mb-4"
            >
              <option value="">Select injured player...</option>
              {(eventTeam === 'home' ? homeLineup?.players : awayLineup?.players)
                ?.filter(p => p.confirmed)
                .map(player => (
                  <option key={player.id} value={player.id}>
                    #{player.number} {player.name || 'Unnamed'}
                  </option>
                ))}
            </select>
            
            <input
              type="text"
              value={injuryType}
              onChange={(e) => setInjuryType(e.target.value)}
              placeholder="Injury type (e.g., Ankle sprain)"
              className="w-full px-4 py-3 border border-pirates-gray-200 rounded-lg mb-4"
            />
            
            <label className="flex items-center gap-2 mb-4">
              <input
                type="checkbox"
                checked={canContinue}
                onChange={(e) => setCanContinue(e.target.checked)}
                className="w-4 h-4 text-pirates-red rounded"
              />
              <span className="text-sm">Player can continue playing</span>
            </label>
            
            <div className="flex gap-2">
              <button
                onClick={addInjury}
                disabled={!selectedPlayer || !injuryType}
                className="flex-1 py-3 bg-red-500 text-white rounded-lg font-medium disabled:opacity-50"
              >
                Record Injury at {getMatchMinute()}'
              </button>
              <button
                onClick={() => { setShowInjuryModal(false); setSelectedPlayer(''); setInjuryType(''); setCanContinue(true); }}
                className="px-4 py-3 bg-pirates-gray-100 rounded-lg"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Report Modal */}
      {showReportModal && viewingReport && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-auto">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-auto">
            <div className="sticky top-0 bg-white border-b border-pirates-gray-200 p-6 flex items-center justify-between">
              <h3 className="font-heading text-xl font-bold text-pirates-black">Match Report</h3>
              <button 
                onClick={() => setShowReportModal(false)}
                className="text-pirates-gray-400 hover:text-pirates-black"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Score */}
              <div className="text-center p-4 bg-pirates-gray-50 rounded-xl">
                <div className="flex items-center justify-center gap-4 text-2xl font-bold">
                  <span>{viewingReport.homeTeamName}</span>
                  <span className="text-pirates-red">{viewingReport.finalScore.home} - {viewingReport.finalScore.away}</span>
                  <span>{viewingReport.awayTeamName}</span>
                </div>
                <p className="text-sm text-pirates-gray-500 mt-2">
                  Field {viewingReport.field} • {viewingReport.date}
                </p>
              </div>
              
              {/* Goals */}
              {viewingReport.goals.length > 0 && (
                <div>
                  <h4 className="font-medium text-green-700 mb-2">Goals</h4>
                  <div className="space-y-1">
                    {viewingReport.goals.map(g => (
                      <div key={g.id} className="flex items-center gap-2 text-sm">
                        <span className="font-bold">{g.minute}'</span>
                        <span>{g.team === 'home' ? viewingReport.homeTeamName : viewingReport.awayTeamName}</span>
                        <span>#{g.playerNumber} {g.playerName}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Cards */}
              {viewingReport.cards.length > 0 && (
                <div>
                  <h4 className="font-medium text-amber-700 mb-2">Cards</h4>
                  <div className="space-y-1">
                    {viewingReport.cards.map(c => (
                      <div key={c.id} className="flex items-center gap-2 text-sm">
                        <span className="font-bold">{c.minute}'</span>
                        <span>{c.team === 'home' ? viewingReport.homeTeamName : viewingReport.awayTeamName}</span>
                        <span>#{c.playerNumber} {c.playerName}</span>
                        <span className={c.type === 'yellowcard' ? 'text-amber-600' : 'text-red-600'}>
                          ({c.type === 'yellowcard' ? 'Yellow' : 'Red'})
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Substitutions */}
              {viewingReport.substitutions.length > 0 && (
                <div>
                  <h4 className="font-medium text-blue-700 mb-2">Substitutions</h4>
                  <div className="space-y-1">
                    {viewingReport.substitutions.map(s => (
                      <div key={s.id} className="flex items-center gap-2 text-sm">
                        <span className="font-bold">{s.minute}'</span>
                        <span>{s.team === 'home' ? viewingReport.homeTeamName : viewingReport.awayTeamName}</span>
                        <span>In: #{s.playerIn.number} {s.playerIn.name}</span>
                        <span>Out: #{s.playerOut.number} {s.playerOut.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Injuries */}
              {viewingReport.injuries.length > 0 && (
                <div>
                  <h4 className="font-medium text-red-700 mb-2">Injuries</h4>
                  <div className="space-y-1">
                    {viewingReport.injuries.map(i => (
                      <div key={i.id} className="flex items-center gap-2 text-sm">
                        <span className="font-bold">{i.minute}'</span>
                        <span>{i.team === 'home' ? viewingReport.homeTeamName : viewingReport.awayTeamName}</span>
                        <span>#{i.playerNumber} {i.playerName}</span>
                        <span>{i.injuryType}</span>
                        <span>({i.canContinue ? 'Continued' : 'Substituted'})</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <button
                onClick={() => downloadPDFReport(viewingReport)}
                className="w-full flex items-center justify-center gap-2 py-3 bg-pirates-red text-white rounded-lg font-medium"
              >
                <Download className="w-5 h-5" />
                Download PDF Report
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Announcements Modal */}
      {showAnnouncements && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-pirates-gray-200">
              <h3 className="font-heading text-xl font-bold text-pirates-black flex items-center gap-2">
                <Bell className="w-5 h-5 text-pirates-red" />
                Announcements
              </h3>
              <button onClick={() => setShowAnnouncements(false)} className="text-pirates-gray-400 hover:text-pirates-black">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex-1 overflow-auto p-6">
              {announcements.length === 0 ? (
                <div className="text-center py-8 text-pirates-gray-400">
                  <Bell className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No announcements yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {announcements.map((ann) => (
                    <div key={ann.id} className="p-4 rounded-lg border bg-pirates-gray-50 border-pirates-gray-200">
                      <div className="flex items-start justify-between mb-2">
                        <span className="text-pirates-gray-500 text-xs">
                          {new Date(ann.sentAt).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-pirates-black">{ann.message}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
