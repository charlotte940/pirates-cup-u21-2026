import { useState } from 'react';
import { Users, Plus, Search, CheckCircle, XCircle, Edit, Trash2, Shield, MapPin, Trophy, Star, Zap, Flame, Crown, Target, Anchor, Flag, Award, Medal, Sparkles, ChevronRight, User, X, CreditCard, UserCog, UtensilsCrossed, Briefcase, Image, Upload } from 'lucide-react';
import { allTeams } from '../../data/teamsData';
import { ladiesTeams, mensTeams } from '../../data/tournamentSchedule';
import { REGISTERED_MENS_TEAMS, REGISTERED_LADIES_TEAMS } from '../../data/registeredTeams';
import { nfcService } from '../../services/nfcService';
import type { Player, Staff, SponsorshipBanner } from '../../types';

// Team icons for differentiation
const TEAM_ICONS = [
  Trophy, Star, Zap, Flame, Crown, Target, Anchor, Flag, Award, Medal, Sparkles, Shield,
  Users, Trophy, Star, Zap, Flame, Crown, Target, Anchor, Flag, Award, Medal, Sparkles,
  Shield, Users, Trophy, Star, Zap, Flame, Crown
];

// Group colors for differentiation
const GROUP_COLORS: Record<string, { bg: string; text: string; border: string; light: string }> = {
  'A': { bg: 'bg-red-600', text: 'text-white', border: 'border-red-600', light: 'bg-red-50' },
  'B': { bg: 'bg-blue-600', text: 'text-white', border: 'border-blue-600', light: 'bg-blue-50' },
  'C': { bg: 'bg-green-600', text: 'text-white', border: 'border-green-600', light: 'bg-green-50' },
  'D': { bg: 'bg-amber-500', text: 'text-white', border: 'border-amber-500', light: 'bg-amber-50' },
  'E': { bg: 'bg-purple-600', text: 'text-white', border: 'border-purple-600', light: 'bg-purple-50' },
  'F': { bg: 'bg-pink-600', text: 'text-white', border: 'border-pink-600', light: 'bg-pink-50' },
  'G': { bg: 'bg-teal-600', text: 'text-white', border: 'border-teal-600', light: 'bg-teal-50' },
  'H': { bg: 'bg-indigo-600', text: 'text-white', border: 'border-indigo-600', light: 'bg-indigo-50' },
};

const POSITIONS = ['GK', 'DEF', 'MID', 'FWD'];

// Mock staff data
const MOCK_STAFF: Staff[] = [
  { id: 'staff-1', name: 'John Doe', role: 'ballboy', foodAllocated: true, foodCollected: false, drinkAllocated: true, drinkCollected: false },
  { id: 'staff-2', name: 'Jane Smith', role: 'ballboy', foodAllocated: true, foodCollected: false, drinkAllocated: true, drinkCollected: false },
  { id: 'staff-3', name: 'Mike Johnson', role: 'referee', foodAllocated: true, foodCollected: false, drinkAllocated: true, drinkCollected: false },
  { id: 'staff-4', name: 'Sarah Williams', role: 'referee', foodAllocated: true, foodCollected: false, drinkAllocated: true, drinkCollected: false },
  { id: 'staff-5', name: 'David Brown', role: 'fieldmanager', foodAllocated: true, foodCollected: false, drinkAllocated: true, drinkCollected: false },
  { id: 'staff-6', name: 'Emily Davis', role: 'admin', foodAllocated: true, foodCollected: false, drinkAllocated: true, drinkCollected: false },
  { id: 'staff-7', name: 'Chris Wilson', role: 'catering', foodAllocated: true, foodCollected: false, drinkAllocated: true, drinkCollected: false },
  { id: 'staff-8', name: 'Lisa Anderson', role: 'casual', foodAllocated: true, foodCollected: false, drinkAllocated: true, drinkCollected: false },
];

export default function AdminDashboard() {
  const [teams, setTeams] = useState(allTeams);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [editingTeam, setEditingTeam] = useState<typeof teams[0] | null>(null);
  
  // Staff management state
  const [staffList, setStaffList] = useState<Staff[]>(MOCK_STAFF);
  const [activeTab, setActiveTab] = useState<'teams' | 'staff' | 'banners' | 'draw'>('teams');
  const [activeDivision, setActiveDivision] = useState<'ladies' | 'mens'>('ladies');
  const [showStaffModal, setShowStaffModal] = useState(false);
  const [programmingStaff, setProgrammingStaff] = useState<Staff | null>(null);
  const [isProgramming, setIsProgramming] = useState(false);
  const [programSuccess, setProgramSuccess] = useState(false);
  const [showAddStaffModal, setShowAddStaffModal] = useState(false);
  const [newStaffName, setNewStaffName] = useState('');
  const [newStaffRole, setNewStaffRole] = useState<Staff['role']>('ballboy');
  
  // Live Draw state
  const [drawDivision, setDrawDivision] = useState<'ladies' | 'mens'>('mens');
  const [drawResults, setDrawResults] = useState<Record<string, string[]>>({});
  const [isDrawPublished, setIsDrawPublished] = useState(false);
  const [selectedFixture, setSelectedFixture] = useState<{group: string, match: number} | null>(null);
  
  // Sponsorship banners state
  const [banners, setBanners] = useState<SponsorshipBanner[]>([
    { id: '1', name: 'Vodacom', imageUrl: '/sponsor-vodacom.jpg', linkUrl: 'https://www.vodacom.co.za', position: 'top', active: true, uploadedAt: new Date().toISOString(), uploadedBy: 'Admin' },
    { id: '2', name: 'Adidas', imageUrl: '/sponsor-adidas1.jpg', linkUrl: 'https://www.adidas.com', position: 'bottom', active: true, uploadedAt: new Date().toISOString(), uploadedBy: 'Admin' },
    { id: '3', name: 'Amstel', imageUrl: '/sponsor-amstel.jpg', linkUrl: '#', position: 'sidebar', active: true, uploadedAt: new Date().toISOString(), uploadedBy: 'Admin' },
    { id: '4', name: 'Adidas', imageUrl: '/sponsor-adidas2.jpg', linkUrl: 'https://www.adidas.com', position: 'top', active: false, uploadedAt: new Date().toISOString(), uploadedBy: 'Admin' },
  ]);
  const [showBannerModal, setShowBannerModal] = useState(false);
  const [newBannerName, setNewBannerName] = useState('');
  const [newBannerLink, setNewBannerLink] = useState('');
  const [newBannerPosition, setNewBannerPosition] = useState<'top' | 'bottom' | 'sidebar'>('top');
  const [newBannerImage, setNewBannerImage] = useState('');
  
  // New team form state
  const [newTeam, setNewTeam] = useState({
    name: '',
    coach: '',
    contactEmail: '',
    contactPhone: '',
    group: 'A',
    location: '',
    logo: '',
  });
  
  // Players for new team
  const [players, setPlayers] = useState<{ name: string; position: string; number: number; photo?: string }[]>([]);
  const [newPlayerName, setNewPlayerName] = useState('');
  const [newPlayerPosition, setNewPlayerPosition] = useState('MID');
  const [newPlayerNumber, setNewPlayerNumber] = useState(1);
  const [newPlayerPhoto, setNewPlayerPhoto] = useState<string>('');

  // Note: Using REGISTERED_MENS_TEAMS and REGISTERED_LADIES_TEAMS for display
  const filteredLegacyTeams = teams.filter(team => 
    team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    team.coach.toLowerCase().includes(searchQuery.toLowerCase())
  );
  void filteredLegacyTeams; // Keep for compatibility

  const handleAddPlayer = () => {
    if (newPlayerName.trim()) {
      setPlayers([...players, { name: newPlayerName, position: newPlayerPosition, number: newPlayerNumber, photo: newPlayerPhoto }]);
      setNewPlayerName('');
      setNewPlayerNumber(newPlayerNumber + 1);
      setNewPlayerPhoto('');
    }
  };

  const handleRemovePlayer = (index: number) => {
    setPlayers(players.filter((_, i) => i !== index));
  };

  const handleAddTeam = () => {
    const teamPlayers: Player[] = players.map((p, idx) => ({
      id: `player-${Date.now()}-${idx}`,
      name: p.name,
      number: p.number,
      position: p.position,
      dateOfBirth: '2004-01-01',
    }));
    
    const team = {
      ...newTeam,
      id: `team-${Date.now()}`,
      players: teamPlayers,
      points: 0,
      played: 0,
      won: 0,
      drawn: 0,
      lost: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      isRegistered: true,
      registrationTime: new Date().toISOString(),
    };
    setTeams([...teams, team as typeof teams[0]]);
    setShowAddModal(false);
    setNewTeam({ name: '', coach: '', contactEmail: '', contactPhone: '', group: 'A', location: '', logo: '' });
    setPlayers([]);
    setNewPlayerNumber(1);
  };

  const handleEditTeam = (team: typeof teams[0]) => {
    setEditingTeam(team);
    setNewTeam({
      name: team.name,
      coach: team.coach,
      contactEmail: team.contactEmail,
      contactPhone: team.contactPhone,
      group: team.group,
      location: team.location || '',
      logo: team.logo || '',
    });
    setPlayers(team.players.map(p => ({ name: p.name, position: p.position, number: p.number })));
    setShowEditModal(true);
  };

  const handleUpdateTeam = () => {
    if (editingTeam) {
      const updatedPlayers: Player[] = players.map((p, idx) => ({
        id: editingTeam.players[idx]?.id || `player-${Date.now()}-${idx}`,
        name: p.name,
        number: p.number,
        position: p.position,
        dateOfBirth: editingTeam.players[idx]?.dateOfBirth || '2004-01-01',
      }));
      
      setTeams(teams.map(t => t.id === editingTeam.id ? {
        ...t,
        ...newTeam,
        players: updatedPlayers,
      } : t));
      setShowEditModal(false);
      setEditingTeam(null);
      setPlayers([]);
    }
  };

  const handleDeleteTeam = (teamIdOrName: string) => {
    if (confirm('Are you sure you want to delete this team?')) {
      setTeams(teams.filter(t => t.id !== teamIdOrName && t.name !== teamIdOrName));
    }
  };

  const groups = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

  const getTeamIcon = (index: number) => {
    const Icon = TEAM_ICONS[index % TEAM_ICONS.length];
    return <Icon className="w-6 h-6" />;
  };

  const handleProgramNFC = async (staff: Staff) => {
    setProgrammingStaff(staff);
    setIsProgramming(true);
    setProgramSuccess(false);
    
    try {
      // Program NFC tag with staff name and role
      const result = await nfcService.programTag({
        playerId: staff.id,
        playerName: staff.name,
        teamName: staff.role,
        jerseyNumber: 0,
      });
      
      if (result.success) {
        // Update staff with NFC tag
        const updatedStaff = staffList.map(s => 
          s.id === staff.id ? { ...s, nfcTag: result.tagId } : s
        );
        setStaffList(updatedStaff);
        setProgramSuccess(true);
      }
    } catch (error) {
      // Demo mode - simulate success
      const tagId = `PC26-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
      const updatedStaff = staffList.map(s => 
        s.id === staff.id ? { ...s, nfcTag: tagId } : s
      );
      setStaffList(updatedStaff);
      setProgramSuccess(true);
    } finally {
      setIsProgramming(false);
    }
  };

  const handleAddStaff = () => {
    if (!newStaffName.trim()) return;
    
    const newStaff: Staff = {
      id: `staff-${Date.now()}`,
      name: newStaffName,
      role: newStaffRole,
      foodAllocated: true,
      foodCollected: false,
      drinkAllocated: true,
      drinkCollected: false,
    };
    
    setStaffList([...staffList, newStaff]);
    setNewStaffName('');
    setShowAddStaffModal(false);
  };

  const handleDeleteStaff = (staffId: string) => {
    if (confirm('Are you sure you want to remove this staff member?')) {
      setStaffList(staffList.filter(s => s.id !== staffId));
    }
  };

  const getStaffRoleIcon = (role: string) => {
    switch (role) {
      case 'ballboy': return <UserCog className="w-5 h-5" />;
      case 'referee': return <Shield className="w-5 h-5" />;
      case 'fieldmanager': return <MapPin className="w-5 h-5" />;
      case 'admin': return <Briefcase className="w-5 h-5" />;
      case 'catering': return <UtensilsCrossed className="w-5 h-5" />;
      case 'casual': return <User className="w-5 h-5" />;
      default: return <User className="w-5 h-5" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'ballboy': return 'bg-blue-100 text-blue-700';
      case 'referee': return 'bg-amber-100 text-amber-700';
      case 'fieldmanager': return 'bg-green-100 text-green-700';
      case 'admin': return 'bg-purple-100 text-purple-700';
      case 'catering': return 'bg-pink-100 text-pink-700';
      case 'casual': return 'bg-cyan-100 text-cyan-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex gap-2 border-b border-pirates-gray-200">
        {[
          { id: 'teams', label: 'Team Management', icon: Users },
          { id: 'draw', label: 'Live Draw', icon: Trophy },
          { id: 'staff', label: 'Staff NFC Programming', icon: CreditCard },
          { id: 'banners', label: 'Sponsorship Banners', icon: Image },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-3 font-medium text-sm transition-colors border-b-2 -mb-px ${
              activeTab === tab.id
                ? 'border-pirates-red text-pirates-red'
                : 'border-transparent text-pirates-gray-500 hover:text-pirates-black'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Teams Tab */}
      {activeTab === 'teams' && (
        <>
      {/* Division Selector Tabs */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setActiveDivision('ladies')}
          className={`flex-1 py-3 px-6 rounded-xl font-heading font-bold text-lg flex items-center justify-center gap-3 transition-all ${
            activeDivision === 'ladies'
              ? 'bg-pirates-red text-white shadow-lg'
              : 'bg-white text-pirates-gray-600 border border-pirates-gray-200 hover:border-pirates-red'
          }`}
        >
          <Trophy className="w-5 h-5" />
          Ladies Division
          <span className={`text-xs px-2 py-0.5 rounded-full ${activeDivision === 'ladies' ? 'bg-white/20' : 'bg-pirates-red/10 text-pirates-red'}`}>
            {Object.values(ladiesTeams).flat().length} Teams
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
          Men's Division
          <span className={`text-xs px-2 py-0.5 rounded-full ${activeDivision === 'mens' ? 'bg-white/20' : 'bg-pirates-black/10 text-pirates-black'}`}>
            {Object.values(mensTeams).flat().length} Teams
          </span>
        </button>
      </div>

      {/* Division Content */}
      {activeDivision === 'ladies' && (
        <>
      {/* Ladies Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="pirates-card p-6 text-center border-l-4 border-l-pirates-red">
          <div className="w-12 h-12 bg-pirates-red/10 rounded-xl flex items-center justify-center mx-auto mb-3">
            <Users className="w-6 h-6 text-pirates-red" />
          </div>
          <p className="font-heading text-3xl font-bold text-pirates-red">{Object.values(ladiesTeams).flat().length}</p>
          <p className="text-pirates-gray-500 text-sm uppercase tracking-wider">Total Teams</p>
        </div>
        <div className="pirates-card p-6 text-center border-l-4 border-l-pirates-red">
          <div className="w-12 h-12 bg-pirates-red/10 rounded-xl flex items-center justify-center mx-auto mb-3">
            <Trophy className="w-6 h-6 text-pirates-red" />
          </div>
          <p className="font-heading text-3xl font-bold text-pirates-red">4</p>
          <p className="text-pirates-gray-500 text-sm uppercase tracking-wider">Groups</p>
        </div>
        <div className="pirates-card p-6 text-center border-l-4 border-l-pirates-red">
          <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-3">
            <CheckCircle className="w-6 h-6 text-green-600" />
          </div>
          <p className="font-heading text-3xl font-bold text-green-600">{Object.values(ladiesTeams).flat().length}</p>
          <p className="text-pirates-gray-500 text-sm uppercase tracking-wider">Registered</p>
        </div>
      </div>

      {/* Ladies Groups Distribution */}
      <div className="pirates-card p-6">
        <h3 className="section-title text-base mb-4 flex items-center gap-2">
          <span className="w-3 h-3 bg-pirates-red rounded-full" />
          Ladies Group Distribution
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(ladiesTeams).map(([group, groupTeams]) => (
            <div key={group} className="bg-pirates-red/5 border border-pirates-red/20 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-heading text-2xl font-bold text-pirates-red">Group {group}</span>
                <span className="text-sm text-pirates-gray-500">{groupTeams.length} teams</span>
              </div>
              <div className="space-y-1">
                {groupTeams.map((team, idx) => (
                  <p key={idx} className="text-sm text-pirates-gray-600 truncate">{team}</p>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
        </>
      )}

      {activeDivision === 'mens' && (
        <>
      {/* Men's Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="pirates-card p-6 text-center border-l-4 border-l-pirates-black">
          <div className="w-12 h-12 bg-pirates-black/10 rounded-xl flex items-center justify-center mx-auto mb-3">
            <Users className="w-6 h-6 text-pirates-black" />
          </div>
          <p className="font-heading text-3xl font-bold text-pirates-black">{Object.values(mensTeams).flat().length}</p>
          <p className="text-pirates-gray-500 text-sm uppercase tracking-wider">Total Teams</p>
        </div>
        <div className="pirates-card p-6 text-center border-l-4 border-l-pirates-black">
          <div className="w-12 h-12 bg-pirates-black/10 rounded-xl flex items-center justify-center mx-auto mb-3">
            <Trophy className="w-6 h-6 text-pirates-black" />
          </div>
          <p className="font-heading text-3xl font-bold text-pirates-black">14</p>
          <p className="text-pirates-gray-500 text-sm uppercase tracking-wider">Groups</p>
        </div>
        <div className="pirates-card p-6 text-center border-l-4 border-l-pirates-black">
          <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-3">
            <CheckCircle className="w-6 h-6 text-green-600" />
          </div>
          <p className="font-heading text-3xl font-bold text-green-600">{Object.values(mensTeams).flat().length}</p>
          <p className="text-pirates-gray-500 text-sm uppercase tracking-wider">Registered</p>
        </div>
      </div>

      {/* Men's Groups Distribution */}
      <div className="pirates-card p-6">
        <h3 className="section-title text-base mb-4 flex items-center gap-2">
          <span className="w-3 h-3 bg-pirates-black rounded-full" />
          Men's Group Distribution
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
          {Object.entries(mensTeams).map(([group, groupTeams]) => (
            <div key={group} className="bg-pirates-black/5 border border-pirates-black/20 rounded-xl p-3">
              <div className="flex items-center justify-between mb-1">
                <span className="font-heading text-lg font-bold text-pirates-black">{group}</span>
                <span className="text-xs text-pirates-gray-500">{groupTeams.length}</span>
              </div>
              <div className="space-y-0.5">
                {groupTeams.map((team, idx) => (
                  <p key={idx} className="text-xs text-pirates-gray-600 truncate">{team.replace(' U21', '')}</p>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
        </>
      )}

      {/* Search and Add */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-pirates-gray-400" />
          <input
            type="text"
            placeholder="Search teams..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white border border-pirates-gray-200 rounded-lg text-pirates-black placeholder:text-pirates-gray-400 focus:outline-none focus:border-pirates-red focus:ring-2 focus:ring-pirates-red/10"
          />
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 btn-primary"
        >
          <Plus className="w-5 h-5" />
          Register New Team
        </button>
      </div>

      {/* Teams List */}
      <div className="pirates-card overflow-hidden">
        <div className="p-4 border-b border-pirates-gray-200 flex items-center justify-between">
          <h3 className="section-title text-base mb-0">Registered Teams</h3>
          <span className="text-sm text-pirates-gray-500">
            {activeDivision === 'ladies' 
              ? `${REGISTERED_LADIES_TEAMS.length} Ladies Teams` 
              : `${REGISTERED_MENS_TEAMS.length} Men's Teams`}
          </span>
        </div>
        <div className="divide-y divide-pirates-gray-100">
          {(activeDivision === 'ladies' ? REGISTERED_LADIES_TEAMS : REGISTERED_MENS_TEAMS)
            .filter(team => team.name.toLowerCase().includes(searchQuery.toLowerCase()))
            .map((team, index) => {
            const groupLetter = String.fromCharCode(65 + (index % 8)); // A-H based on index
            const groupColor = GROUP_COLORS[groupLetter];
            return (
              <div key={team.name} className="p-4 hover:bg-pirates-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 ${groupColor.light} rounded-xl flex items-center justify-center overflow-hidden`}>
                      {team.logo ? (
                        <img src={team.logo} alt={team.name} className="w-full h-full object-contain p-1" />
                      ) : (
                        getTeamIcon(index)
                      )}
                    </div>
                    <div>
                      <h4 className="font-heading text-lg font-bold text-pirates-black">{team.name}</h4>
                      <div className="flex items-center gap-4 text-sm text-pirates-gray-500">
                        <span className={`${groupColor.bg} ${groupColor.text} text-xs py-0.5 px-2 rounded font-bold`}>Group {groupLetter}</span>
                        <span className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {team.players.length} Players
                        </span>
                        <span className="flex items-center gap-1 text-green-600">
                          <CheckCircle className="w-4 h-4" />
                          Registered
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => handleEditTeam({
                        id: team.name,
                        name: team.name,
                        coach: 'TBD',
                        contactEmail: '',
                        contactPhone: '',
                        group: groupLetter,
                        location: '',
                        logo: team.logo,
                        players: team.players.map((p, i) => ({
                          id: `player-${i}`,
                          name: p,
                          number: i + 1,
                          position: 'MID',
                          dateOfBirth: '2004-01-01'
                        })),
                        points: 0,
                        played: 0,
                        won: 0,
                        drawn: 0,
                        lost: 0,
                        goalsFor: 0,
                        goalsAgainst: 0,
                        isRegistered: true,
                        registrationTime: new Date().toISOString()
                      } as typeof teams[0])}
                      className="p-2 text-pirates-gray-500 hover:text-pirates-red hover:bg-pirates-red/10 rounded-lg transition-colors"
                    >
                      <Edit className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={() => handleDeleteTeam(team.name)}
                      className="p-2 text-pirates-gray-500 hover:text-pirates-red hover:bg-pirates-red/10 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                
                <div className="mt-3">
                  <p className="text-sm text-pirates-gray-600">
                    <span className="font-medium">Players:</span> {team.players.slice(0, 5).join(', ')}{team.players.length > 5 ? ` +${team.players.length - 5} more` : ''}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Group Distribution - Clickable */}
      <div className="pirates-card p-6">
        <h3 className="section-title text-base mb-4">Group Distribution (Click to View)</h3>
        <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
          {groups.map((group) => {
            const groupColor = GROUP_COLORS[group];
            const groupTeams = teams.filter(t => t.group === group);
            return (
              <button
                key={group}
                onClick={() => { setSelectedGroup(group); setShowGroupModal(true); }}
                className={`text-center p-4 rounded-lg border-2 transition-all hover:shadow-md ${groupColor.border} ${groupColor.light}`}
              >
                <p className={`font-heading text-2xl font-bold ${groupColor.text.replace('text-white', 'text-pirates-black')}`}>{groupTeams.length}</p>
                <p className="text-pirates-gray-500 text-xs uppercase tracking-wider font-medium">Group {group}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Group Stage Visualization */}
      <div className="pirates-card p-6">
        <h3 className="section-title text-base mb-4">Tournament Group Stage</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {groups.map((group) => {
            const groupColor = GROUP_COLORS[group];
            const groupTeams = teams.filter(t => t.group === group);
            return (
              <div key={group} className={`rounded-lg border-2 ${groupColor.border} overflow-hidden`}>
                <div className={`${groupColor.bg} ${groupColor.text} px-4 py-2 font-heading font-bold text-center`}>
                  GROUP {group}
                </div>
                <div className="p-3 space-y-2">
                  {groupTeams.length > 0 ? groupTeams.map((team, idx) => (
                    <div key={team.id} className="flex items-center gap-2 p-2 bg-white rounded border border-pirates-gray-100">
                      <span className="w-5 h-5 bg-pirates-gray-100 rounded flex items-center justify-center text-xs font-bold">{idx + 1}</span>
                      <span className="text-sm text-pirates-black truncate flex-1">{team.name}</span>
                    </div>
                  )) : (
                    <div className="text-center py-4 text-pirates-gray-400 text-sm">No teams yet</div>
                  )}
                  {groupTeams.length < 4 && (
                    <div className="text-center py-2 text-pirates-gray-400 text-xs">
                      {4 - groupTeams.length} spots remaining
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
        </>
      )}

      {/* Staff Tab */}
      {activeTab === 'staff' && (
        <div className="space-y-6">
          {/* Staff Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="pirates-card p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
                <p className="text-pirates-gray-500 text-xs uppercase">Total Staff</p>
              </div>
              <p className="font-heading text-2xl font-bold text-pirates-black">{staffList.length}</p>
            </div>
            <div className="pirates-card p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-green-600" />
                </div>
                <p className="text-pirates-gray-500 text-xs uppercase">NFC Programmed</p>
              </div>
              <p className="font-heading text-2xl font-bold text-green-600">{staffList.filter(s => s.nfcTag).length}</p>
            </div>
            <div className="pirates-card p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                  <UtensilsCrossed className="w-5 h-5 text-amber-600" />
                </div>
                <p className="text-pirates-gray-500 text-xs uppercase">Food Allocated</p>
              </div>
              <p className="font-heading text-2xl font-bold text-amber-600">{staffList.filter(s => s.foodAllocated).length}</p>
            </div>
            <div className="pirates-card p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-pirates-red/10 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-pirates-red" />
                </div>
                <p className="text-pirates-gray-500 text-xs uppercase">Pending NFC</p>
              </div>
              <p className="font-heading text-2xl font-bold text-pirates-red">{staffList.filter(s => !s.nfcTag).length}</p>
            </div>
          </div>

          {/* NFC Instructions */}
          <div className="pirates-card p-4 bg-blue-50 border-blue-200">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <CreditCard className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h4 className="font-medium text-blue-800 mb-1">How to Program NFC Tags</h4>
                <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
                  <li>Purchase NFC tags (NTAG213/215 - available on Takealot)</li>
                  <li>Use Chrome browser on Android device</li>
                  <li>Click "Program NFC" for a staff member</li>
                  <li>Hold the tag against the back of the phone</li>
                  <li>Wait for confirmation message</li>
                </ol>
                <p className="text-xs text-blue-600 mt-2">
                  <strong>Note:</strong> Tag stores Staff Name + Role + Unique ID. Catering scans to record food collection.
                </p>
              </div>
            </div>
          </div>

          {/* Add Staff Button */}
          <div className="flex justify-end">
            <button
              onClick={() => setShowAddStaffModal(true)}
              className="flex items-center gap-2 btn-primary"
            >
              <Plus className="w-5 h-5" />
              Register New Staff
            </button>
          </div>

          {/* Staff List */}
          <div className="pirates-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="section-title text-base mb-0">Staff List - Program NFC Tags</h3>
              <span className="text-pirates-gray-500 text-sm">{staffList.length} staff members</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-pirates-gray-200">
                    <th className="text-left py-3 px-4 text-pirates-gray-500 text-xs uppercase">Name</th>
                    <th className="text-left py-3 px-4 text-pirates-gray-500 text-xs uppercase">Role</th>
                    <th className="text-center py-3 px-4 text-pirates-gray-500 text-xs uppercase">NFC Status</th>
                    <th className="text-center py-3 px-4 text-pirates-gray-500 text-xs uppercase">Food</th>
                    <th className="text-left py-3 px-4 text-pirates-gray-500 text-xs uppercase">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {staffList.map((staff) => (
                    <tr key={staff.id} className="border-b border-pirates-gray-100 hover:bg-pirates-gray-50">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${getRoleColor(staff.role)}`}>
                            {getStaffRoleIcon(staff.role)}
                          </div>
                          <span className="font-medium text-pirates-black">{staff.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-block px-2 py-1 rounded text-xs font-medium capitalize ${getRoleColor(staff.role)}`}>
                          {staff.role}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        {staff.nfcTag ? (
                          <span className="flex items-center justify-center gap-1 text-green-600 text-sm">
                            <CheckCircle className="w-4 h-4" />
                            Programmed
                          </span>
                        ) : (
                          <span className="flex items-center justify-center gap-1 text-amber-600 text-sm">
                            <XCircle className="w-4 h-4" />
                            Not Programmed
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {staff.foodAllocated ? (
                          <CheckCircle className="w-5 h-5 text-green-600 mx-auto" />
                        ) : (
                          <XCircle className="w-5 h-5 text-gray-300 mx-auto" />
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => { setProgrammingStaff(staff); setShowStaffModal(true); }}
                            disabled={!!staff.nfcTag}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                              staff.nfcTag
                                ? 'bg-green-100 text-green-700 cursor-not-allowed'
                                : 'bg-pirates-red text-white hover:bg-pirates-red/90'
                            }`}
                          >
                            {staff.nfcTag ? (
                              <span className="flex items-center gap-1">
                                <CheckCircle className="w-4 h-4" />
                                Programmed
                              </span>
                            ) : 'Program NFC'}
                          </button>
                          <button
                            onClick={() => handleDeleteStaff(staff.id)}
                            className="p-1.5 text-pirates-gray-400 hover:text-pirates-red hover:bg-pirates-red/10 rounded-lg transition-colors"
                            title="Remove staff"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Staff NFC Programming Modal */}
      {showStaffModal && programmingStaff && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-6">
              <h3 className="section-title text-lg mb-0">Program NFC Tag</h3>
              <button 
                onClick={() => { setShowStaffModal(false); setProgrammingStaff(null); setProgramSuccess(false); }}
                className="p-2 hover:bg-pirates-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="text-center mb-6">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${getRoleColor(programmingStaff.role)}`}>
                {getStaffRoleIcon(programmingStaff.role)}
              </div>
              <p className="font-heading text-xl font-bold text-pirates-black">{programmingStaff.name}</p>
              <p className="text-pirates-gray-500 capitalize">{programmingStaff.role}</p>
            </div>

            {!programSuccess && !isProgramming && (
              <div className="space-y-4">
                <p className="text-pirates-gray-600 text-center text-sm">
                  Hold the NFC tag near the device to program it for this staff member.
                </p>
                <button
                  onClick={() => handleProgramNFC(programmingStaff)}
                  className="w-full btn-primary"
                >
                  Start Programming
                </button>
              </div>
            )}

            {isProgramming && (
              <div className="text-center py-4">
                <div className="w-16 h-16 border-4 border-pirates-red border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="font-heading text-lg font-bold text-pirates-black">Programming...</p>
                <p className="text-pirates-gray-500 text-sm">Please hold the NFC tag near the device</p>
              </div>
            )}

            {programSuccess && (
              <div className="text-center py-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <p className="font-heading text-lg font-bold text-green-600">Success!</p>
                <p className="text-pirates-gray-500 text-sm">NFC tag programmed successfully</p>
                <button
                  onClick={() => { setShowStaffModal(false); setProgrammingStaff(null); setProgramSuccess(false); }}
                  className="mt-4 btn-primary"
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add Staff Modal */}
      {showAddStaffModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="section-title text-lg mb-0">Register New Staff</h3>
              <button onClick={() => setShowAddStaffModal(false)} className="p-2 hover:bg-pirates-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-pirates-gray-700 text-sm mb-2 font-medium">Staff Name *</label>
                <input
                  type="text"
                  value={newStaffName}
                  onChange={(e) => setNewStaffName(e.target.value)}
                  className="w-full border border-pirates-gray-200 rounded-lg px-4 py-3 text-pirates-black focus:outline-none focus:border-pirates-red"
                  placeholder="Enter staff name"
                />
              </div>
              <div>
                <label className="block text-pirates-gray-700 text-sm mb-2 font-medium">Role *</label>
                <select
                  value={newStaffRole}
                  onChange={(e) => setNewStaffRole(e.target.value as Staff['role'])}
                  className="w-full border border-pirates-gray-200 rounded-lg px-4 py-3 text-pirates-black focus:outline-none focus:border-pirates-red"
                >
                  <option value="ballboy">Ball Boy</option>
                  <option value="referee">Referee</option>
                  <option value="fieldmanager">Field Manager</option>
                  <option value="admin">Admin</option>
                  <option value="catering">Catering</option>
                  <option value="casual">Casual Staff</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowAddStaffModal(false)}
                className="flex-1 btn-outline"
              >
                Cancel
              </button>
              <button
                onClick={handleAddStaff}
                disabled={!newStaffName.trim()}
                className="flex-1 btn-primary disabled:opacity-50"
              >
                Register Staff
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Team Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="section-title text-lg mb-0">Register New Team</h3>
              <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-pirates-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Team Logo Upload */}
            <div className="mb-6">
              <label className="block text-pirates-gray-700 text-sm mb-2 font-medium">Team Logo</label>
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 bg-pirates-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-pirates-gray-300 overflow-hidden">
                  {newTeam.logo ? (
                    <img src={newTeam.logo} alt="Team Logo" className="w-full h-full object-contain" />
                  ) : (
                    <Image className="w-8 h-8 text-pirates-gray-400" />
                  )}
                </div>
                <div className="flex-1">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setNewTeam({ ...newTeam, logo: reader.result as string });
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="hidden"
                    id="team-logo-upload"
                  />
                  <label
                    htmlFor="team-logo-upload"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-pirates-red text-white rounded-lg cursor-pointer hover:bg-pirates-red/90"
                  >
                    <Upload className="w-4 h-4" />
                    Upload Logo
                  </label>
                  <p className="text-pirates-gray-500 text-xs mt-1">Recommended: 200x200px, PNG or JPG</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-pirates-gray-700 text-sm mb-2 font-medium">Team Name *</label>
                <input
                  type="text"
                  value={newTeam.name}
                  onChange={(e) => setNewTeam({ ...newTeam, name: e.target.value })}
                  className="w-full border border-pirates-gray-200 rounded-lg px-4 py-3 text-pirates-black focus:outline-none focus:border-pirates-red"
                  placeholder="Enter team name"
                />
              </div>
              <div>
                <label className="block text-pirates-gray-700 text-sm mb-2 font-medium">Coach Name *</label>
                <input
                  type="text"
                  value={newTeam.coach}
                  onChange={(e) => setNewTeam({ ...newTeam, coach: e.target.value })}
                  className="w-full border border-pirates-gray-200 rounded-lg px-4 py-3 text-pirates-black focus:outline-none focus:border-pirates-red"
                  placeholder="Enter coach name"
                />
              </div>
              <div>
                <label className="block text-pirates-gray-700 text-sm mb-2 font-medium">Group *</label>
                <select
                  value={newTeam.group}
                  onChange={(e) => setNewTeam({ ...newTeam, group: e.target.value })}
                  className="w-full border border-pirates-gray-200 rounded-lg px-4 py-3 text-pirates-black focus:outline-none focus:border-pirates-red"
                >
                  {groups.map(g => <option key={g} value={g}>Group {g}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-pirates-gray-700 text-sm mb-2 font-medium">Division *</label>
                <select
                  value={activeDivision}
                  onChange={(e) => setActiveDivision(e.target.value as 'ladies' | 'mens')}
                  className="w-full border border-pirates-gray-200 rounded-lg px-4 py-3 text-pirates-black focus:outline-none focus:border-pirates-red"
                  disabled
                >
                  <option value="ladies">Ladies Division</option>
                  <option value="mens">Men's Division</option>
                </select>
                <p className="text-xs text-pirates-gray-500 mt-1">Based on selected division tab</p>
              </div>
            </div>

            {/* Player Registration */}
            <div className="border-t border-pirates-gray-200 pt-4 mb-4">
              <h4 className="font-heading text-lg font-bold text-pirates-black mb-3">Register Players</h4>
              
              <div className="flex flex-col md:flex-row gap-3 mb-4">
                <div className="flex-1 flex gap-2">
                  <input
                    type="text"
                    value={newPlayerName}
                    onChange={(e) => setNewPlayerName(e.target.value)}
                    className="flex-1 border border-pirates-gray-200 rounded-lg px-4 py-2 text-pirates-black focus:outline-none focus:border-pirates-red"
                    placeholder="Player name"
                  />
                  <select
                    value={newPlayerPosition}
                    onChange={(e) => setNewPlayerPosition(e.target.value)}
                    className="border border-pirates-gray-200 rounded-lg px-4 py-2 text-pirates-black focus:outline-none focus:border-pirates-red"
                  >
                    {POSITIONS.map(pos => <option key={pos} value={pos}>{pos}</option>)}
                  </select>
                  <input
                    type="number"
                    value={newPlayerNumber}
                    onChange={(e) => setNewPlayerNumber(parseInt(e.target.value))}
                    className="w-20 border border-pirates-gray-200 rounded-lg px-4 py-2 text-pirates-black focus:outline-none focus:border-pirates-red"
                    placeholder="#"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setNewPlayerPhoto(reader.result as string);
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="hidden"
                    id="player-photo-upload"
                  />
                  <label
                    htmlFor="player-photo-upload"
                    className="flex items-center gap-2 px-3 py-2 bg-pirates-gray-100 text-pirates-gray-700 rounded-lg cursor-pointer hover:bg-pirates-gray-200 text-sm"
                  >
                    <Image className="w-4 h-4" />
                    {newPlayerPhoto ? 'Photo Added' : 'Add Photo'}
                  </label>
                  <button
                    onClick={handleAddPlayer}
                    disabled={!newPlayerName.trim()}
                    className="bg-pirates-red text-white px-4 py-2 rounded-lg font-medium hover:bg-pirates-red/90 disabled:opacity-50"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Player List */}
              <div className="space-y-2 max-h-48 overflow-auto">
                {players.map((player, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-pirates-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      {player.photo ? (
                        <img src={player.photo} alt={player.name} className="w-8 h-8 rounded-full object-cover border border-pirates-gray-200" />
                      ) : (
                        <span className="w-8 h-8 bg-pirates-red/10 rounded-full flex items-center justify-center text-pirates-red font-bold text-sm">{player.number}</span>
                      )}
                      <div>
                        <span className="text-pirates-black font-medium block">{player.name}</span>
                        <span className="text-pirates-gray-500 text-xs bg-pirates-gray-200 px-2 py-0.5 rounded">#{player.number} • {player.position}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemovePlayer(idx)}
                      className="text-pirates-gray-400 hover:text-pirates-red"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                {players.length === 0 && (
                  <p className="text-pirates-gray-400 text-sm text-center py-4">No players added yet</p>
                )}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 btn-outline"
              >
                Cancel
              </button>
              <button
                onClick={handleAddTeam}
                disabled={!newTeam.name || !newTeam.coach || players.length === 0}
                className="flex-1 btn-primary disabled:opacity-50"
              >
                Register Team ({players.length} players)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Team Modal */}
      {showEditModal && editingTeam && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="section-title text-lg mb-0">Edit Team: {editingTeam.name}</h3>
              <button onClick={() => setShowEditModal(false)} className="p-2 hover:bg-pirates-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Team Logo Upload for Edit */}
            <div className="mb-6">
              <label className="block text-pirates-gray-700 text-sm mb-2 font-medium">Team Logo</label>
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 bg-pirates-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-pirates-gray-300 overflow-hidden">
                  {newTeam.logo ? (
                    <img src={newTeam.logo} alt="Team Logo" className="w-full h-full object-contain" />
                  ) : (
                    <Image className="w-8 h-8 text-pirates-gray-400" />
                  )}
                </div>
                <div className="flex-1">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setNewTeam({ ...newTeam, logo: reader.result as string });
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="hidden"
                    id="edit-team-logo-upload"
                  />
                  <label
                    htmlFor="edit-team-logo-upload"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-pirates-red text-white rounded-lg cursor-pointer hover:bg-pirates-red/90"
                  >
                    <Upload className="w-4 h-4" />
                    {newTeam.logo ? 'Change Logo' : 'Upload Logo'}
                  </label>
                  <p className="text-pirates-gray-500 text-xs mt-1">Recommended: 200x200px, PNG or JPG</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-pirates-gray-700 text-sm mb-2 font-medium">Team Name</label>
                <input
                  type="text"
                  value={newTeam.name}
                  onChange={(e) => setNewTeam({ ...newTeam, name: e.target.value })}
                  className="w-full border border-pirates-gray-200 rounded-lg px-4 py-3 text-pirates-black focus:outline-none focus:border-pirates-red"
                />
              </div>
              <div>
                <label className="block text-pirates-gray-700 text-sm mb-2 font-medium">Coach Name</label>
                <input
                  type="text"
                  value={newTeam.coach}
                  onChange={(e) => setNewTeam({ ...newTeam, coach: e.target.value })}
                  className="w-full border border-pirates-gray-200 rounded-lg px-4 py-3 text-pirates-black focus:outline-none focus:border-pirates-red"
                />
              </div>
              <div>
                <label className="block text-pirates-gray-700 text-sm mb-2 font-medium">Group</label>
                <select
                  value={newTeam.group}
                  onChange={(e) => setNewTeam({ ...newTeam, group: e.target.value })}
                  className="w-full border border-pirates-gray-200 rounded-lg px-4 py-3 text-pirates-black focus:outline-none focus:border-pirates-red"
                >
                  {groups.map(g => <option key={g} value={g}>Group {g}</option>)}
                </select>
              </div>
            </div>

            {/* Player List (Read-only for edit) */}
            <div className="border-t border-pirates-gray-200 pt-4 mb-4">
              <h4 className="font-heading text-lg font-bold text-pirates-black mb-3">Team Players ({players.length})</h4>
              <div className="space-y-2 max-h-40 overflow-auto">
                {players.map((player, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-3 bg-pirates-gray-50 rounded-lg">
                    {player.photo ? (
                      <img src={player.photo} alt={player.name} className="w-8 h-8 rounded-full object-cover border border-pirates-gray-200" />
                    ) : (
                      <span className="w-8 h-8 bg-pirates-red/10 rounded flex items-center justify-center text-pirates-red font-bold text-sm">{player.number}</span>
                    )}
                    <span className="text-pirates-black font-medium">{player.name}</span>
                    <span className="text-pirates-gray-500 text-sm bg-pirates-gray-200 px-2 py-0.5 rounded">#{player.number} • {player.position}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowEditModal(false)}
                className="flex-1 btn-outline"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateTeam}
                className="flex-1 btn-primary"
              >
                Update Team
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Group Detail Modal */}
      {showGroupModal && selectedGroup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-lg w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="section-title text-lg mb-0">Group {selectedGroup}</h3>
              <button onClick={() => setShowGroupModal(false)} className="p-2 hover:bg-pirates-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {(() => {
              const groupColor = GROUP_COLORS[selectedGroup];
              const groupTeams = teams.filter(t => t.group === selectedGroup);
              return (
                <div>
                  <div className={`${groupColor.bg} ${groupColor.text} rounded-lg p-4 mb-4`}>
                    <p className="font-heading text-xl font-bold text-center">GROUP {selectedGroup}</p>
                    <p className="text-center text-sm opacity-90">{groupTeams.length} of 4 teams</p>
                  </div>
                  
                  <div className="space-y-3">
                    {groupTeams.map((team, idx) => (
                      <div key={team.id} className="flex items-center gap-3 p-4 bg-pirates-gray-50 rounded-lg border border-pirates-gray-200">
                        <span className={`w-8 h-8 ${groupColor.bg} ${groupColor.text} rounded-full flex items-center justify-center font-bold text-sm`}>
                          {idx + 1}
                        </span>
                        <div className="flex-1">
                          <p className="font-heading font-bold text-pirates-black">{team.name}</p>
                          <p className="text-pirates-gray-500 text-sm">Coach: {team.coach} • {team.players.length} players</p>
                        </div>
                        <ChevronRight className="w-5 h-5 text-pirates-gray-400" />
                      </div>
                    ))}
                    {groupTeams.length < 4 && (
                      <div className="text-center p-4 border-2 border-dashed border-pirates-gray-300 rounded-lg">
                        <p className="text-pirates-gray-400">{4 - groupTeams.length} spots available</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* Live Draw Tab */}
      {activeTab === 'draw' && (
        <div className="space-y-6">
          {/* Header with Status */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="section-title text-base mb-1">Live Tournament Draw</h3>
              <p className="text-pirates-gray-500 text-sm">
                Assign teams to fixtures during the physical draw ceremony
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${isDrawPublished ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                <div className={`w-2 h-2 rounded-full ${isDrawPublished ? 'bg-green-500' : 'bg-amber-500 animate-pulse'}`} />
                <span className="text-sm font-medium">
                  {isDrawPublished ? 'DRAW PUBLISHED' : 'DRAFT MODE'}
                </span>
              </div>
              <button
                onClick={() => {
                  if (confirm('Are you sure you want to publish the draw? This will make it visible to all users.')) {
                    setIsDrawPublished(true);
                  }
                }}
                disabled={isDrawPublished}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                  isDrawPublished 
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                    : 'bg-pirates-red text-white hover:bg-pirates-red/90'
                }`}
              >
                <Upload className="w-4 h-4" />
                {isDrawPublished ? 'Published' : 'Publish Draw'}
              </button>
            </div>
          </div>

          {/* Division Selector */}
          <div className="flex gap-2">
            <button
              onClick={() => setDrawDivision('mens')}
              className={`flex-1 py-3 px-6 rounded-xl font-heading font-bold text-lg flex items-center justify-center gap-3 transition-all ${
                drawDivision === 'mens'
                  ? 'bg-pirates-black text-white shadow-lg'
                  : 'bg-white text-pirates-gray-600 border border-pirates-gray-200 hover:border-pirates-black'
              }`}
            >
              <Trophy className="w-5 h-5" />
              Men's Division
              <span className={`text-xs px-2 py-0.5 rounded-full ${drawDivision === 'mens' ? 'bg-white/20' : 'bg-pirates-black/10 text-pirates-black'}`}>
                57 Teams
              </span>
            </button>
            <button
              onClick={() => setDrawDivision('ladies')}
              className={`flex-1 py-3 px-6 rounded-xl font-heading font-bold text-lg flex items-center justify-center gap-3 transition-all ${
                drawDivision === 'ladies'
                  ? 'bg-pirates-red text-white shadow-lg'
                  : 'bg-white text-pirates-gray-600 border border-pirates-gray-200 hover:border-pirates-red'
              }`}
            >
              <Trophy className="w-5 h-5" />
              Ladies Division
              <span className={`text-xs px-2 py-0.5 rounded-full ${drawDivision === 'ladies' ? 'bg-white/20' : 'bg-pirates-red/10 text-pirates-red'}`}>
                16 Teams
              </span>
            </button>
          </div>

          {/* Draw Instructions */}
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-lg">
            <h4 className="font-medium text-blue-800 mb-2">How to use Live Draw:</h4>
            <ol className="text-blue-700 text-sm space-y-1 list-decimal list-inside">
              <li>During the physical draw, teams will be drawn into groups</li>
              <li>Click on any empty fixture slot below to assign a team</li>
              <li>Select the team from the dropdown that was drawn</li>
              <li>Continue until all fixtures are filled</li>
              <li>Click "Publish Draw" when complete to make it live</li>
            </ol>
          </div>

          {/* Group Fixtures Grid */}
          <div className="space-y-4">
            <h4 className="font-heading font-bold text-lg">
              {drawDivision === 'mens' ? 'Men\'s' : 'Ladies'} Group Fixtures
            </h4>
            
            <div className={`grid gap-4 ${drawDivision === 'mens' ? 'md:grid-cols-2 lg:grid-cols-3' : 'md:grid-cols-2'}`}>
              {(drawDivision === 'mens' 
                ? ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N'] 
                : ['A', 'B', 'C', 'D']
              ).map((group) => (
                <div key={group} className="pirates-card p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h5 className="font-heading font-bold text-lg">Group {group}</h5>
                    <span className="text-xs text-pirates-gray-500">
                      {drawResults[`${drawDivision}-${group}`]?.length || 0}/4 teams
                    </span>
                  </div>
                  
                  {/* Fixture Slots */}
                  <div className="space-y-2">
                    {[1, 2, 3, 4].map((slot) => {
                      const teamName = drawResults[`${drawDivision}-${group}`]?.[slot - 1];
                      const teamData = teamName ? (drawDivision === 'mens' ? REGISTERED_MENS_TEAMS : REGISTERED_LADIES_TEAMS).find(t => t.name === teamName) : null;
                      return (
                        <button
                          key={slot}
                          onClick={() => setSelectedFixture({ group, match: slot })}
                          className={`w-full p-3 rounded-lg border-2 border-dashed text-left transition-all ${
                            teamName 
                              ? 'border-green-300 bg-green-50' 
                              : 'border-pirates-gray-300 hover:border-pirates-red hover:bg-pirates-red/5'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-pirates-gray-500">Slot {slot}</span>
                            {teamName && <CheckCircle className="w-4 h-4 text-green-500" />}
                          </div>
                          {teamName ? (
                            <div className="flex items-center gap-2 mt-1">
                              {teamData?.logo ? (
                                <img 
                                  src={teamData.logo} 
                                  alt={teamName}
                                  className="w-6 h-6 object-contain rounded"
                                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                                />
                              ) : (
                                <Trophy className="w-5 h-5 text-pirates-gray-400" />
                              )}
                              <p className="font-medium text-pirates-black">{teamName}</p>
                            </div>
                          ) : (
                            <p className="font-medium text-pirates-gray-400">Click to assign team</p>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex gap-3">
            <button
              onClick={() => {
                if (confirm('Clear all draw results? This cannot be undone.')) {
                  setDrawResults({});
                  setIsDrawPublished(false);
                }
              }}
              className="px-4 py-2 border border-pirates-gray-300 rounded-lg text-pirates-gray-600 hover:bg-pirates-gray-50"
            >
              Clear All
            </button>
            <button
              onClick={() => {
                // Export draw results
                const dataStr = JSON.stringify(drawResults, null, 2);
                const blob = new Blob([dataStr], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `pirates-cup-draw-${new Date().toISOString().split('T')[0]}.json`;
                link.click();
              }}
              className="px-4 py-2 border border-pirates-gray-300 rounded-lg text-pirates-gray-600 hover:bg-pirates-gray-50"
            >
              Export Draw
            </button>
          </div>
        </div>
      )}

      {/* Team Selection Modal for Draw */}
      {selectedFixture && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full max-h-[80vh] overflow-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="section-title text-lg mb-0">
                Assign Team to Group {selectedFixture.group} - Slot {selectedFixture.match}
              </h3>
              <button onClick={() => setSelectedFixture(null)} className="p-2 hover:bg-pirates-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-2">
              <p className="text-sm text-pirates-gray-500 mb-3">
                Select the team that was drawn for this position:
              </p>
              
              {/* Registered teams from Excel file with logos */}
              <div className="max-h-96 overflow-y-auto space-y-2">
                {(drawDivision === 'mens' ? REGISTERED_MENS_TEAMS : REGISTERED_LADIES_TEAMS)
                  .filter(team => {
                    // Filter out teams already assigned to this group
                    const key = `${drawDivision}-${selectedFixture?.group}`;
                    const assigned = drawResults[key] || [];
                    return !assigned.includes(team.name);
                  })
                  .map((team) => (
                    <button
                      key={team.name}
                      onClick={() => {
                        const key = `${drawDivision}-${selectedFixture!.group}`;
                        const current = drawResults[key] || [];
                        const updated = [...current];
                        updated[selectedFixture!.match - 1] = team.name;
                        setDrawResults({ ...drawResults, [key]: updated });
                        setSelectedFixture(null);
                      }}
                      className="w-full p-3 flex items-center gap-3 text-left rounded-lg border border-pirates-gray-200 hover:border-pirates-red hover:bg-pirates-red/5 transition-all"
                    >
                      {team.logo ? (
                        <img 
                          src={team.logo} 
                          alt={team.name}
                          className="w-10 h-10 object-contain rounded-lg bg-white"
                          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                        />
                      ) : (
                        <div className="w-10 h-10 bg-pirates-gray-100 rounded-lg flex items-center justify-center">
                          <Trophy className="w-5 h-5 text-pirates-gray-400" />
                        </div>
                      )}
                      <span className="font-medium">{team.name}</span>
                      <span className="ml-auto text-xs text-pirates-gray-400">
                        {team.players.length} players
                      </span>
                    </button>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sponsorship Banners Tab */}
      {activeTab === 'banners' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="section-title text-base mb-0">Sponsorship Banners</h3>
            <button
              onClick={() => setShowBannerModal(true)}
              className="flex items-center gap-2 btn-primary"
            >
              <Upload className="w-5 h-5" />
              Upload Banner
            </button>
          </div>

          <p className="text-pirates-gray-600 text-sm">
            These banners will be displayed on the Spectator and Team mobile apps.
          </p>

          <div className="grid md:grid-cols-2 gap-4">
            {banners.map(banner => (
              <div key={banner.id} className={`pirates-card p-4 ${banner.active ? 'border-green-300' : 'border-gray-200 opacity-60'}`}>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-medium text-pirates-black">{banner.name}</h4>
                    <p className="text-sm text-pirates-gray-500">Position: {banner.position}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setBanners(prev => prev.map(b => b.id === banner.id ? { ...b, active: !b.active } : b))}
                      className={`px-3 py-1 rounded text-xs font-medium ${banner.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}
                    >
                      {banner.active ? 'Active' : 'Inactive'}
                    </button>
                    <button
                      onClick={() => setBanners(prev => prev.filter(b => b.id !== banner.id))}
                      className="p-1 text-pirates-red hover:bg-pirates-red/10 rounded"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <div className="h-24 bg-gradient-to-r from-pirates-red to-pirates-black rounded-lg flex items-center justify-center text-white">
                  {banner.imageUrl ? (
                    <img src={banner.imageUrl} alt={banner.name} className="h-full w-full object-cover rounded-lg" />
                  ) : (
                    <span className="text-sm">{banner.name}</span>
                  )}
                </div>
                
                {banner.linkUrl && (
                  <p className="mt-2 text-xs text-pirates-gray-500">Link: {banner.linkUrl}</p>
                )}
              </div>
            ))}
          </div>

          {banners.length === 0 && (
            <div className="text-center py-8 text-pirates-gray-400">
              <Image className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No banners uploaded yet</p>
            </div>
          )}
        </div>
      )}

      {/* Add Banner Modal */}
      {showBannerModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full max-h-[90vh] overflow-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="section-title text-lg mb-0">Upload Sponsorship Banner</h3>
              <button onClick={() => { setShowBannerModal(false); setNewBannerImage(''); }} className="p-2 hover:bg-pirates-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4 mb-6">
              {/* Banner Image Preview */}
              <div>
                <label className="block text-pirates-gray-700 text-sm mb-2 font-medium">Banner Image *</label>
                <div className="flex flex-col items-center gap-3">
                  {newBannerImage ? (
                    <div className="w-full h-32 bg-pirates-gray-100 rounded-lg overflow-hidden border border-pirates-gray-200">
                      <img src={newBannerImage} alt="Banner Preview" className="w-full h-full object-contain" />
                    </div>
                  ) : (
                    <div className="w-full h-32 bg-pirates-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-pirates-gray-300">
                      <Image className="w-10 h-10 text-pirates-gray-400" />
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setNewBannerImage(reader.result as string);
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="hidden"
                    id="banner-image-upload"
                  />
                  <label
                    htmlFor="banner-image-upload"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-pirates-red text-white rounded-lg cursor-pointer hover:bg-pirates-red/90"
                  >
                    <Upload className="w-4 h-4" />
                    {newBannerImage ? 'Change Image' : 'Upload Image'}
                  </label>
                  <p className="text-xs text-pirates-gray-500">Recommended: 728x90px or 320x100px for mobile</p>
                </div>
              </div>

              <div>
                <label className="block text-pirates-gray-700 text-sm mb-2 font-medium">Sponsor Name *</label>
                <input
                  type="text"
                  value={newBannerName}
                  onChange={(e) => setNewBannerName(e.target.value)}
                  className="w-full border border-pirates-gray-200 rounded-lg px-4 py-3 text-pirates-black focus:outline-none focus:border-pirates-red"
                  placeholder="e.g., Nike, Adidas, etc."
                />
              </div>
              <div>
                <label className="block text-pirates-gray-700 text-sm mb-2 font-medium">Link URL (Optional)</label>
                <input
                  type="text"
                  value={newBannerLink}
                  onChange={(e) => setNewBannerLink(e.target.value)}
                  className="w-full border border-pirates-gray-200 rounded-lg px-4 py-3 text-pirates-black focus:outline-none focus:border-pirates-red"
                  placeholder="https://sponsor-website.com"
                />
              </div>
              <div>
                <label className="block text-pirates-gray-700 text-sm mb-2 font-medium">Display Position</label>
                <select
                  value={newBannerPosition}
                  onChange={(e) => setNewBannerPosition(e.target.value as any)}
                  className="w-full border border-pirates-gray-200 rounded-lg px-4 py-3 text-pirates-black focus:outline-none focus:border-pirates-red"
                >
                  <option value="top">Top Banner (Team/Coach & Spectator)</option>
                  <option value="bottom">Bottom Banner</option>
                  <option value="sidebar">Sidebar</option>
                </select>
                <p className="text-xs text-pirates-gray-500 mt-1">Top banners appear on Team/Coach and Spectator accounts</p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => { setShowBannerModal(false); setNewBannerImage(''); }}
                className="flex-1 btn-outline"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (newBannerName.trim() && newBannerImage) {
                    setBanners([...banners, {
                      id: `banner-${Date.now()}`,
                      name: newBannerName,
                      imageUrl: newBannerImage,
                      linkUrl: newBannerLink || '#',
                      position: newBannerPosition,
                      active: true,
                      uploadedAt: new Date().toISOString(),
                      uploadedBy: 'Admin'
                    }]);
                    setNewBannerName('');
                    setNewBannerLink('');
                    setNewBannerImage('');
                    setShowBannerModal(false);
                  }
                }}
                disabled={!newBannerName.trim() || !newBannerImage}
                className="flex-1 btn-primary disabled:opacity-50"
              >
                Upload Banner
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
