import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Star, ShieldCheck, Truck, Sparkles, Droplets } from 'lucide-react';
import { CATEGORIES, INITIAL_PRODUCTS } from '../constants';

const Home = () => {
  // Get highlighted products
  const newArrivals = INITIAL_PRODUCTS.slice(0, 4);
  const marineFish = INITIAL_PRODUCTS.filter(p => p.category === 'Marine').slice(0, 3);

  return (
    <div className="space-y-16 pb-12">
      {/* Hero Section */}
      <div className="relative h-[600px] md:h-[700px] flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
           <img 
            src="https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?q=80&w=2000&auto=format&fit=crop" 
            alt="Aquarium Background" 
            className="w-full h-full object-cover scale-105 animate-[pulse_10s_ease-in-out_infinite]"
           />
           <div className="absolute inset-0 bg-gradient-to-r from-brand-deep/90 via-brand-deep/50 to-transparent"></div>
        </div>
        
        <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20">
          <div className="max-w-2xl text-white space-y-6">
            <span className="bg-brand-accent text-brand-deep px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider inline-block mb-2">
              Premium Aquatic Store in Tirupati
            </span>
            <h1 className="text-5xl md:text-7xl font-display font-black tracking-tight leading-tight">
              Bring the <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Ocean</span> <br />
              Home Today.
            </h1>
            <p className="text-lg md:text-xl text-gray-300 leading-relaxed font-light">
              Discover our exclusive collection of Marine, Exotic, and Freshwater fishes. 
              We build nature aquariums that breathe life into your space.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link 
                to="/shop" 
                className="bg-brand-cyan text-white px-8 py-4 rounded-full font-bold hover:bg-white hover:text-brand-deep transition-all duration-300 flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.5)]"
              >
                Start Shopping <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <Link 
                to="/shop?cat=Exotic" 
                className="bg-transparent border-2 border-white/30 backdrop-blur-sm text-white px-8 py-4 rounded-full font-bold hover:bg-white/10 transition flex items-center justify-center"
              >
                View Exotic Collection
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Banner */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { icon: Star, title: 'Premium Breeds', desc: 'Certified Arowanas & Flowerhorns' },
              { icon: Droplets, title: 'Marine Experts', desc: 'Saltwater setup specialists' },
              { icon: Truck, title: 'Live Guarantee', desc: 'Safe delivery within Tirupati' },
              { icon: ShieldCheck, title: 'After-Sale Support', desc: 'Expert maintenance advice' },
            ].map((feature, idx) => (
              <div key={idx} className="flex items-center space-x-4 p-4 rounded-xl hover:bg-gray-50 transition">
                <div className="bg-brand-light p-3 rounded-full text-brand-ocean">
                  <feature.icon className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">{feature.title}</h3>
                  <p className="text-sm text-gray-500">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-display font-bold text-gray-900">Shop By Category</h2>
          <div className="h-1 w-20 bg-brand-cyan mx-auto mt-4 rounded-full"></div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {CATEGORIES.map((cat) => (
            <Link 
              key={cat} 
              to={`/shop?cat=${cat}`}
              className="group relative overflow-hidden rounded-2xl aspect-[4/5] bg-gray-100 shadow-md hover:shadow-xl transition-all duration-300"
            >
              <img 
                src={`https://source.unsplash.com/random/400x500/?${cat === 'Marine' ? 'clownfish' : cat === 'Food' ? 'fish-food' : cat === 'Tanks' ? 'aquarium' : cat === 'Exotic' ? 'arowana' : 'aquarium-fish'}`} 
                alt={cat}
                className="w-full h-full object-cover group-hover:scale-110 transition duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80 group-hover:opacity-90 transition"></div>
              <div className="absolute bottom-4 left-0 right-0 text-center">
                <span className="text-white font-bold text-lg tracking-wide uppercase">{cat}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Flash Sale / New Arrivals */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-end mb-8">
          <div>
             <h2 className="text-3xl font-display font-bold text-gray-900 flex items-center gap-2">
               <Sparkles className="text-brand-accent" /> New Arrivals
             </h2>
             <p className="text-gray-500 mt-2">Just landed in our tanks</p>
          </div>
          <Link to="/shop" className="text-brand-ocean font-semibold hover:underline flex items-center">
            View All <ArrowRight className="h-4 w-4 ml-1" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {newArrivals.map((product) => (
            <div key={product.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition group">
              <div className="relative h-64 overflow-hidden">
                <img 
                  src={product.image} 
                  alt={product.name} 
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                />
                {product.offerPrice && (
                  <div className="absolute top-2 left-2 bg-brand-accent text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                    SALE
                  </div>
                )}
              </div>
              <div className="p-4">
                <p className="text-xs text-brand-ocean font-bold uppercase mb-1">{product.category}</p>
                <h3 className="font-bold text-gray-900 text-lg mb-1 truncate">{product.name}</h3>
                <div className="flex items-end gap-2 mt-2">
                  <span className="text-xl font-bold text-gray-900">₹{product.offerPrice || product.price}</span>
                  {product.offerPrice && (
                    <span className="text-sm text-gray-400 line-through mb-1">₹{product.price}</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Marine Showcase */}
      <div className="bg-brand-deep py-20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-brand-ocean/20 rounded-l-full blur-3xl"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="md:w-1/3 text-white">
              <h2 className="text-4xl font-display font-bold mb-6">Marine World <br/>Specialists</h2>
              <p className="text-gray-300 mb-8 text-lg">
                Setting up a saltwater tank is an art. We provide everything from live rock, salt mixes, and protein skimmers to the most vibrant Clownfish and Tangs.
              </p>
              <Link to="/shop?cat=Marine" className="bg-white text-brand-deep px-8 py-3 rounded-full font-bold hover:bg-brand-cyan hover:text-white transition inline-flex items-center">
                Explore Marine <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
            <div className="md:w-2/3 grid grid-cols-1 sm:grid-cols-3 gap-6">
               {marineFish.map(fish => (
                 <div key={fish.id} className="bg-white/10 backdrop-blur-md border border-white/10 p-4 rounded-xl hover:transform hover:-translate-y-2 transition duration-300">
                    <img src={fish.image} className="w-full h-40 object-cover rounded-lg mb-4" alt={fish.name}/>
                    <h4 className="text-white font-bold">{fish.name}</h4>
                    <p className="text-brand-cyan mt-1">₹{fish.offerPrice || fish.price}</p>
                 </div>
               ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;