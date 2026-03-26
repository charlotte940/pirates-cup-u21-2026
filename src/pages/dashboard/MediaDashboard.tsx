import { useState, useRef } from 'react';
import { Image, Download, Upload, BookOpen, Users, Trophy, MapPin, Search, Calendar, Camera, Newspaper, ExternalLink, ShoppingBag, X } from 'lucide-react';
import { allTeams } from '../../data/teamsData';
import { shopItems } from '../../data/mockData';
import type { ShopItem } from '../../types';

interface Photo {
  id: string;
  url: string;
  caption: string;
  category: 'match' | 'team' | 'fan' | 'behind-scenes';
  uploadedAt: string;
  uploadedBy: string;
}

const INITIAL_PHOTOS: Photo[] = [
  { id: '1', url: '/photo1.jpg', caption: 'Opening ceremony', category: 'match', uploadedAt: '2026-04-12 09:00', uploadedBy: 'John Photographer' },
  { id: '2', url: '/photo2.jpg', caption: 'Goal celebration', category: 'match', uploadedAt: '2026-04-12 10:30', uploadedBy: 'Sarah Media' },
  { id: '3', url: '/photo3.jpg', caption: 'Team huddle', category: 'team', uploadedAt: '2026-04-12 11:15', uploadedBy: 'John Photographer' },
  { id: '4', url: '/photo4.jpg', caption: 'Fan moments', category: 'fan', uploadedAt: '2026-04-12 12:00', uploadedBy: 'Mike Camera' },
  { id: '5', url: '/photo5.jpg', caption: 'Behind the scenes', category: 'behind-scenes', uploadedAt: '2026-04-12 13:45', uploadedBy: 'Sarah Media' },
  { id: '6', url: '/photo6.jpg', caption: 'Trophy presentation', category: 'match', uploadedAt: '2026-04-12 16:00', uploadedBy: 'John Photographer' },
];

const pressReleases = [
  { id: '1', title: 'Pirates Cup 2026 Day 1 Results', date: '2026-04-12', size: '2.4 MB' },
  { id: '2', title: 'Quarter-Finals Preview', date: '2026-04-13', size: '1.8 MB' },
  { id: '3', title: 'Player Interviews Compilation', date: '2026-04-13', size: '15.2 MB' },
];

export default function MediaDashboard() {
  const [activeTab, setActiveTab] = useState<'photos' | 'teams' | 'press' | 'booklet' | 'shop'>('photos');
  const [photoFilter, setPhotoFilter] = useState<'all' | 'match' | 'team' | 'fan' | 'behind-scenes'>('all');
  const [photos, setPhotos] = useState<Photo[]>(INITIAL_PHOTOS);
  const [selectedTeam, setSelectedTeam] = useState<typeof allTeams[0] | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [cart, setCart] = useState<{item: ShopItem, quantity: number}[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredPhotos = photoFilter === 'all' 
    ? photos 
    : photos.filter(p => p.category === photoFilter);

  const filteredTeams = allTeams.filter(t => 
    t.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setUploadProgress(0);

    // Simulate upload progress
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 10;
      });
    }, 200);

    // Simulate upload completion
    setTimeout(() => {
      const newPhotos: Photo[] = Array.from(files).map((file, idx) => ({
        id: `new-${Date.now()}-${idx}`,
        url: URL.createObjectURL(file),
        caption: file.name.replace(/\.[^/.]+$/, ''),
        category: 'match',
        uploadedAt: new Date().toLocaleString(),
        uploadedBy: 'You',
      }));
      
      setPhotos([...newPhotos, ...photos]);
      setIsUploading(false);
      setUploadProgress(0);
    }, 2500);
  };

  const addToCart = (item: ShopItem) => {
    const existing = cart.find(c => c.item.id === item.id);
    if (existing) {
      setCart(cart.map(c => c.item.id === item.id ? { ...c, quantity: c.quantity + 1 } : c));
    } else {
      setCart([...cart, { item, quantity: 1 }]);
    }
  };

  const cartTotal = cart.reduce((sum, c) => sum + c.item.price * c.quantity, 0);

  const tabs = [
    { id: 'photos', label: 'Photo Dump', icon: Camera },
    { id: 'teams', label: 'Team Profiles', icon: Users },
    { id: 'press', label: 'Press Releases', icon: Newspaper },
    { id: 'booklet', label: 'Media Info', icon: BookOpen },
    { id: 'shop', label: 'Tournament Shop', icon: ShoppingBag },
  ];

  return (
    <div className="space-y-6">
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

      {/* Photos Tab */}
      {activeTab === 'photos' && (
        <div className="space-y-6">
          {/* Photo Filter */}
          <div className="flex items-center gap-2">
            <span className="text-pirates-gray-500 text-sm">Filter:</span>
            {[
              { id: 'all', label: 'All Photos' },
              { id: 'match', label: 'Match Action' },
              { id: 'team', label: 'Team' },
              { id: 'fan', label: 'Fan Zone' },
              { id: 'behind-scenes', label: 'Behind the Scenes' },
            ].map((filter) => (
              <button
                key={filter.id}
                onClick={() => setPhotoFilter(filter.id as typeof photoFilter)}
                className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                  photoFilter === filter.id 
                    ? 'bg-pirates-red text-white' 
                    : 'bg-white text-pirates-gray-600 border border-pirates-gray-200 hover:border-pirates-red'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>

          {/* Upload Section */}
          <div className="pirates-card p-6">
            <h3 className="section-title text-base mb-4">Upload Photos</h3>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
            
            {isUploading ? (
              <div className="bg-pirates-gray-50 border-2 border-dashed border-pirates-gray-300 rounded-xl p-8 text-center">
                <div className="w-16 h-16 mx-auto mb-4 relative">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="32" cy="32" r="28" stroke="#e5e5e5" strokeWidth="4" fill="none" />
                    <circle 
                      cx="32" cy="32" r="28" 
                      stroke="#E30613" 
                      strokeWidth="4" 
                      fill="none"
                      strokeDasharray={`${uploadProgress * 1.76} 176`}
                      className="transition-all duration-200"
                    />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-pirates-red">
                    {uploadProgress}%
                  </span>
                </div>
                <p className="text-pirates-gray-600">Uploading photos...</p>
              </div>
            ) : (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full flex items-center justify-center gap-3 bg-pirates-gray-50 border-2 border-dashed border-pirates-gray-300 rounded-xl p-8 hover:border-pirates-red hover:bg-pirates-red/5 transition-colors"
              >
                <div className="w-14 h-14 bg-pirates-red/10 rounded-full flex items-center justify-center">
                  <Upload className="w-7 h-7 text-pirates-red" />
                </div>
                <div className="text-left">
                  <p className="text-pirates-black font-medium">Click to upload photos</p>
                  <p className="text-pirates-gray-500 text-sm">JPG, PNG up to 10MB each</p>
                </div>
              </button>
            )}
          </div>

          {/* Photo Grid */}
          <div>
            <h3 className="section-title text-base mb-4">Photo Gallery ({photos.length})</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredPhotos.map((photo) => (
                <div key={photo.id} className="pirates-card overflow-hidden group cursor-pointer">
                  <div className="aspect-square bg-pirates-gray-100 flex items-center justify-center relative">
                    {photo.url.startsWith('blob:') ? (
                      <img src={photo.url} alt={photo.caption} className="w-full h-full object-cover" />
                    ) : (
                      <Image className="w-12 h-12 text-pirates-gray-300" />
                    )}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button className="bg-white text-pirates-black px-4 py-2 rounded-lg font-medium text-sm">
                        View
                      </button>
                    </div>
                  </div>
                  <div className="p-3">
                    <p className="text-pirates-black text-sm font-medium truncate">{photo.caption}</p>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-pirates-gray-500 text-xs uppercase">{photo.category}</span>
                      <span className="text-pirates-gray-400 text-xs">{photo.uploadedBy}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Teams Tab */}
      {activeTab === 'teams' && (
        <div className="space-y-6">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-pirates-gray-400" />
            <input
              type="text"
              placeholder="Search teams..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white border border-pirates-gray-200 rounded-lg text-pirates-black placeholder:text-pirates-gray-400 focus:outline-none focus:border-pirates-red"
            />
          </div>

          {/* Team List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredTeams.map((team) => (
              <div key={team.id} className="pirates-card p-4 cursor-pointer hover:shadow-md transition-shadow" onClick={() => setSelectedTeam(team)}>
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-pirates-red/10 rounded-xl flex items-center justify-center">
                    <Trophy className="w-7 h-7 text-pirates-red" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-heading text-lg font-bold text-pirates-black">{team.name}</h4>
                    <div className="flex items-center gap-3 text-sm text-pirates-gray-500">
                      <span className="accent-block-red text-xs py-0.5 px-2">Group {team.group}</span>
                      <span>{team.location || 'South Africa'}</span>
                    </div>
                  </div>
                  <ExternalLink className="w-5 h-5 text-pirates-gray-400" />
                </div>
              </div>
            ))}
          </div>

          {/* Team Detail Modal */}
          {selectedTeam && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-auto">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-pirates-red/10 rounded-xl flex items-center justify-center">
                      <Trophy className="w-8 h-8 text-pirates-red" />
                    </div>
                    <div>
                      <h3 className="font-heading text-2xl font-bold text-pirates-black">{selectedTeam.name}</h3>
                      <div className="flex items-center gap-3 text-sm text-pirates-gray-500">
                        <span className="accent-block-red text-xs py-0.5 px-2">Group {selectedTeam.group}</span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {selectedTeam.location || 'South Africa'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button onClick={() => setSelectedTeam(null)} className="p-2 hover:bg-pirates-gray-100 rounded-lg">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-6">
                  <div>
                    <h4 className="text-pirates-black font-medium mb-2">Team History</h4>
                    <p className="text-pirates-gray-600 text-sm">
                      {selectedTeam.history || `${selectedTeam.name} is a professional football club based in ${selectedTeam.location || 'South Africa'}. The club was founded in ${selectedTeam.founded || '1990'} and has a rich history in South African football. They compete in the Pirates Cup U21 tournament, showcasing the best young talent in the country.`}
                    </p>
                  </div>

                  <div>
                    <h4 className="text-pirates-black font-medium mb-2">Achievements</h4>
                    <ul className="list-disc list-inside text-pirates-gray-600 text-sm space-y-1">
                      {selectedTeam.achievements?.map((achievement, idx) => (
                        <li key={idx}>{achievement}</li>
                      )) || (
                        <>
                          <li>Multiple league championships</li>
                          <li>Cup tournament victories</li>
                          <li>Youth development excellence</li>
                        </>
                      )}
                    </ul>
                  </div>

                  <div>
                    <h4 className="text-pirates-black font-medium mb-2">Squad</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {selectedTeam.players.map((player) => (
                        <div key={player.id} className="flex items-center gap-2 p-2 bg-pirates-gray-50 rounded-lg">
                          <span className="w-6 h-6 bg-pirates-red/10 rounded flex items-center justify-center text-pirates-red font-bold text-xs">{player.number}</span>
                          <span className="text-pirates-black text-sm">{player.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Press Releases Tab */}
      {activeTab === 'press' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="section-title text-base mb-0">Press Releases</h3>
            <button className="flex items-center gap-2 btn-primary">
              <Upload className="w-4 h-4" />
              Upload New
            </button>
          </div>

          <div className="space-y-4">
            {pressReleases.map((release) => (
              <div key={release.id} className="pirates-card p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-pirates-red/10 rounded-xl flex items-center justify-center">
                      <Newspaper className="w-6 h-6 text-pirates-red" />
                    </div>
                    <div>
                      <h4 className="font-heading text-lg font-bold text-pirates-black">{release.title}</h4>
                      <div className="flex items-center gap-4 text-sm text-pirates-gray-500 mt-1">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {release.date}
                        </span>
                        <span>{release.size}</span>
                      </div>
                    </div>
                  </div>
                  <button className="flex items-center gap-2 bg-pirates-gray-100 text-pirates-black px-4 py-2 rounded-lg font-medium text-sm hover:bg-pirates-red hover:text-white transition-colors">
                    <Download className="w-4 h-4" />
                    Download
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Media Info Booklet Tab */}
      {activeTab === 'booklet' && (
        <div className="space-y-6">
          <div className="pirates-card p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-pirates-red/10 rounded-xl flex items-center justify-center">
                <BookOpen className="w-8 h-8 text-pirates-red" />
              </div>
              <div>
                <h3 className="font-heading text-2xl font-bold text-pirates-black">Media Information Booklet</h3>
                <p className="text-pirates-gray-500">Pirates Cup 2026 - Complete Tournament Guide</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-pirates-black font-medium mb-3">Tournament Details</h4>
                <ul className="space-y-2 text-sm text-pirates-gray-600">
                  <li className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-pirates-red" />
                    18 - 19 March 2026
                  </li>
                  <li className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-pirates-red" />
                    Orlando Stadium, Soweto
                  </li>
                  <li className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-pirates-red" />
                    32 Teams, 192 Players
                  </li>
                  <li className="flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-pirates-red" />
                    U21 Age Category
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="text-pirates-black font-medium mb-3">Media Contacts</h4>
                <ul className="space-y-2 text-sm text-pirates-gray-600">
                  <li>Press Officer: Thandi Mokoena</li>
                  <li>Email: media@piratescup.org</li>
                  <li>Phone: +27 11 555 0123</li>
                  <li>Media Center: Gate C, Level 2</li>
                </ul>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-pirates-gray-200">
              <h4 className="text-pirates-black font-medium mb-3">Downloads</h4>
              <div className="flex flex-wrap gap-3">
                <button className="flex items-center gap-2 bg-pirates-gray-100 text-pirates-black px-4 py-2 rounded-lg font-medium text-sm hover:bg-pirates-red hover:text-white transition-colors">
                  <Download className="w-4 h-4" />
                  Full Booklet (PDF)
                </button>
                <button className="flex items-center gap-2 bg-pirates-gray-100 text-pirates-black px-4 py-2 rounded-lg font-medium text-sm hover:bg-pirates-red hover:text-white transition-colors">
                  <Download className="w-4 h-4" />
                  Team List (PDF)
                </button>
                <button className="flex items-center gap-2 bg-pirates-gray-100 text-pirates-black px-4 py-2 rounded-lg font-medium text-sm hover:bg-pirates-red hover:text-white transition-colors">
                  <Download className="w-4 h-4" />
                  Fixture List (PDF)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Shop Tab */}
      {activeTab === 'shop' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="section-title text-base mb-0">Tournament Shop</h3>
            <div className="flex items-center gap-2 bg-pirates-red text-white px-4 py-2 rounded-lg font-medium">
              <ShoppingBag className="w-4 h-4" />
              Cart ({cart.length}) - R{cartTotal}
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {shopItems.map((item) => (
              <div key={item.id} className="pirates-card p-4">
                <div className="w-full h-32 bg-pirates-gray-100 rounded-lg flex items-center justify-center mb-3">
                  <ShoppingBag className="w-10 h-10 text-pirates-gray-400" />
                </div>
                <span className="text-xs uppercase text-pirates-gray-500 bg-pirates-gray-100 px-2 py-0.5 rounded">{item.category}</span>
                <h4 className="text-pirates-black font-medium text-sm mt-2 mb-1">{item.name}</h4>
                <p className="text-pirates-gray-500 text-xs mb-3">{item.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-pirates-red font-heading font-bold">R{item.price}</span>
                  <button
                    onClick={() => addToCart(item)}
                    className="bg-pirates-red text-white text-xs px-3 py-1.5 rounded hover:bg-pirates-red/90 transition-colors"
                  >
                    Add
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
