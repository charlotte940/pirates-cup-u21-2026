import { MapPin, Users, Clock, Navigation, Phone, Accessibility } from 'lucide-react';
import { venues } from '../data/mockData';

export default function Venues() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="section-title">Tournament Venues</h2>
        <p className="text-pirates-gray-500 mt-2">All matches take place at Orlando Stadium complex</p>
      </div>

      <div className="pirates-card border-l-4 border-l-pirates-red p-6">
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="lg:w-1/3 h-48 lg:h-auto bg-pirates-gray-100 rounded-xl flex items-center justify-center">
            <div className="text-center">
              <MapPin className="w-12 h-12 text-pirates-red/50 mx-auto mb-2" />
              <p className="text-pirates-gray-500 text-sm font-medium">Orlando Stadium</p>
            </div>
          </div>

          <div className="lg:w-2/3">
            <h3 className="font-heading text-2xl font-bold text-pirates-black mb-2">Orlando Stadium</h3>
            <p className="text-pirates-gray-600 mb-4">The home of Orlando Pirates FC. This iconic venue in Soweto hosts all tournament matches across multiple fields.</p>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-pirates-red/10 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-pirates-red" />
                </div>
                <div>
                  <p className="text-pirates-black font-medium">40,000</p>
                  <p className="text-pirates-gray-500 text-xs uppercase tracking-wider">Capacity</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-pirates-red/10 rounded-lg flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-pirates-red" />
                </div>
                <div>
                  <p className="text-pirates-black font-medium">3</p>
                  <p className="text-pirates-gray-500 text-xs uppercase tracking-wider">Fields</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-pirates-red/10 rounded-lg flex items-center justify-center">
                  <Accessibility className="w-5 h-5 text-pirates-red" />
                </div>
                <div>
                  <p className="text-pirates-black font-medium">Yes</p>
                  <p className="text-pirates-gray-500 text-xs uppercase tracking-wider">Accessible</p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <button className="flex items-center gap-2 btn-primary">
                <Navigation className="w-4 h-4" />
                Get Directions
              </button>
              <button className="flex items-center gap-2 btn-outline">
                <Phone className="w-4 h-4" />
                Contact Venue
              </button>
            </div>
          </div>
        </div>
      </div>

      <h3 className="section-title text-base">Match Fields</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {venues.map((venue) => (
          <div key={venue.id} className="pirates-card p-6">
            <div className="w-12 h-12 bg-pirates-red/10 rounded-xl flex items-center justify-center mb-4">
              <MapPin className="w-6 h-6 text-pirates-red" />
            </div>
            <h4 className="font-heading text-lg font-bold text-pirates-black mb-1">{venue.name}</h4>
            <p className="text-pirates-gray-500 text-sm mb-4">Capacity: {venue.capacity.toLocaleString()}</p>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-pirates-gray-600 text-sm">
                <Clock className="w-4 h-4" />
                <span>Matches from 09:00</span>
              </div>
              <div className="flex items-center gap-2 text-pirates-gray-600 text-sm">
                <Accessibility className="w-4 h-4" />
                <span>Wheelchair accessible</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="pirates-card p-6">
        <h3 className="section-title text-base mb-4">Getting There</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-pirates-black font-medium mb-2">By Car</h4>
            <p className="text-pirates-gray-600 text-sm">Take the N1 towards Soweto. Exit at Orlando off-ramp and follow signs to Orlando Stadium. Parking is available at Gate C and D.</p>
          </div>
          <div>
            <h4 className="text-pirates-black font-medium mb-2">Public Transport</h4>
            <p className="text-pirates-gray-600 text-sm">Rea Vaya Bus: Route T3 stops at Orlando Stadium. Taxi: Soweto taxi rank is a 10-minute walk from the stadium.</p>
          </div>
        </div>
      </div>

      <div className="pirates-card p-6">
        <h3 className="section-title text-base mb-4">Stadium Facilities</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {['Food & Beverage', 'Merchandise Store', 'First Aid Station', 'Restrooms', 'ATM', 'WiFi Access', 'Prayer Room', 'Information Desk'].map((facility, index) => (
            <div key={index} className="flex items-center gap-2 text-pirates-gray-600">
              <div className="w-2 h-2 bg-pirates-red rounded-full" />
              <span className="text-sm">{facility}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
