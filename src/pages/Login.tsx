import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Shield, UserCog, UtensilsCrossed, MapPin, Users, Eye } from 'lucide-react';

const DEMO_ACCOUNTS = [
  { role: 'manager', email: 'manager@piratescup.org', icon: Shield, label: 'Tournament Manager' },
  { role: 'admin', email: 'admin@piratescup.org', icon: UserCog, label: 'Admin' },
  { role: 'catering', email: 'catering@piratescup.org', icon: UtensilsCrossed, label: 'Catering' },
  // UJ Sports Grounds - 6 Field Managers
  { role: 'fieldmanager', email: 'fieldmanager-a@piratescup.org', icon: MapPin, label: 'Field Manager - Field A' },
  { role: 'fieldmanager', email: 'fieldmanager-b@piratescup.org', icon: MapPin, label: 'Field Manager - Field B' },
  { role: 'fieldmanager', email: 'fieldmanager-c@piratescup.org', icon: MapPin, label: 'Field Manager - Field C' },
  { role: 'fieldmanager', email: 'fieldmanager-d@piratescup.org', icon: MapPin, label: 'Field Manager - Field D' },
  { role: 'fieldmanager', email: 'fieldmanager-e@piratescup.org', icon: MapPin, label: 'Field Manager - Field E' },
  { role: 'fieldmanager', email: 'fieldmanager-f@piratescup.org', icon: MapPin, label: 'Field Manager - Field F' },
  { role: 'team', email: 'coach@piratescup.org', icon: Users, label: 'Team/Coach' },
  { role: 'fanzone', email: 'fanzone@piratescup.org', icon: Eye, label: 'Fan Zone' },
];

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    const success = await login(email, password);
    if (!success) {
      setError('Invalid credentials. Try password: "password"');
    }
    setIsLoading(false);
  };

  const handleDemoLogin = async (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('password');
    setIsLoading(true);
    const success = await login(demoEmail, 'password');
    if (!success) {
      setError('Demo login failed');
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#e8e8e8] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo Header - Bigger Crest with Transparent Background */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-80 h-80 md:w-96 md:h-96 mb-6">
            <img src="/logo-transparent.png" alt="Pirates Cup U21" className="w-full h-full object-contain drop-shadow-2xl" />
          </div>
          
          {/* Tagline - Styled like "WHERE TALENT MEETS OPPORTUNITY" */}
          <div className="flex flex-col items-center gap-1">
            <span className="bg-pirates-black text-white font-heading text-sm md:text-base font-bold uppercase tracking-wider px-4 py-1.5">
              A decade of dreams.
            </span>
            <span className="bg-pirates-black text-white font-heading text-sm md:text-base font-bold uppercase tracking-wider px-4 py-1.5">
              A decade of opportunity.
            </span>
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-pirates-red/10 border border-pirates-red/30 rounded-lg p-4 text-pirates-red text-sm flex items-center gap-2">
              <span className="w-2 h-2 bg-pirates-red rounded-full" />
              {error}
            </div>
          )}
          <div>
            <label className="block text-pirates-gray-700 text-sm mb-2 font-medium uppercase tracking-wider">Email Address</label>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              placeholder="Enter your email"
              className="w-full bg-white border border-pirates-gray-200 rounded-lg px-4 py-3.5 text-pirates-black placeholder:text-pirates-gray-400 focus:outline-none focus:border-pirates-red focus:ring-2 focus:ring-pirates-red/10 transition-all" />
          </div>
          <div>
            <label className="block text-pirates-gray-700 text-sm mb-2 font-medium uppercase tracking-wider">Password</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              placeholder="Enter your password"
              className="w-full bg-white border border-pirates-gray-200 rounded-lg px-4 py-3.5 text-pirates-black placeholder:text-pirates-gray-400 focus:outline-none focus:border-pirates-red focus:ring-2 focus:ring-pirates-red/10 transition-all" />
          </div>
          <button type="submit" disabled={isLoading}
            className="w-full btn-primary disabled:opacity-50">
            {isLoading ? 'Logging in...' : 'Sign In'}
          </button>
        </form>

        {/* Demo Accounts */}
        <div className="mt-8">
          <p className="text-pirates-gray-400 text-xs uppercase mb-4 font-medium tracking-wider text-center">Demo Accounts (Password: &quot;password&quot;)</p>
          <div className="grid grid-cols-1 gap-2">
            {DEMO_ACCOUNTS.map((account) => (
              <button key={account.email} onClick={() => handleDemoLogin(account.email)}
                className="flex items-center gap-4 bg-white border border-pirates-gray-200 rounded-lg p-4 hover:border-pirates-red hover:shadow-md transition-all text-left group">
                <div className="w-10 h-10 rounded-lg bg-pirates-gray-100 flex items-center justify-center group-hover:bg-pirates-red/10 transition-colors">
                  <account.icon className="w-5 h-5 text-pirates-gray-600 group-hover:text-pirates-red" />
                </div>
                <div className="flex-1">
                  <p className="text-pirates-black text-sm font-medium group-hover:text-pirates-red transition-colors">{account.label}</p>
                  <p className="text-pirates-gray-400 text-xs">{account.email}</p>
                </div>
                <div className="w-6 h-6 rounded-full border border-pirates-gray-300 flex items-center justify-center group-hover:border-pirates-red group-hover:bg-pirates-red transition-all">
                  <span className="text-pirates-gray-400 text-xs group-hover:text-white">→</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-10 text-center">
          <p className="text-pirates-gray-400 text-xs">© 2026 Orlando Pirates Football Club</p>
          <p className="text-pirates-gray-300 text-xs mt-1">Pirates Cup - Talent Meets Opportunity</p>
        </div>
      </div>
    </div>
  );
}
