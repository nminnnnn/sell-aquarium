import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Fish, ShoppingCart, User, Menu, X, Facebook, Instagram, Youtube, MapPin, Phone, Search } from 'lucide-react';
import { useApp } from '../context';
import { STORE_DETAILS } from '../constants';
import ChatWidget from './ChatWidget';

const Navbar = () => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = React.useState(false);
  const { cart, auth, logout } = useApp();
  const location = useLocation();

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Shop All', path: '/shop' },
    { name: 'Marine', path: '/shop?cat=Marine' },
    { name: 'Exotic', path: '/shop?cat=Exotic' },
    ...(auth.isAuthenticated && auth.user?.role === 'admin' ? [{ name: 'Admin', path: '/admin' }] : []),
    ...(auth.isAuthenticated ? [{ name: 'My Orders', path: '/orders' }] : []),
  ];

  return (
    <nav className="bg-brand-deep text-white sticky top-0 z-50 shadow-xl border-b border-brand-ocean/30">
      {/* Top Bar */}
      {/* <div className="bg-brand-ocean px-4 py-1 text-xs text-center font-medium tracking-wide">
        🚀 FREE DELIVERY on orders above ₹2000 in Tirupati | 📞 Support: {STORE_DETAILS.phone}
      </div> */}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="bg-white/10 p-2 rounded-xl group-hover:bg-brand-cyan transition duration-300">
                <Fish className="h-8 w-8 text-brand-cyan group-hover:text-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-display font-bold text-2xl tracking-tight leading-none text-white">{STORE_DETAILS.name}</span>
              <span className="text-xs text-brand-cyan font-medium tracking-widest uppercase">Aquatic Studio</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:block">
            <div className="ml-10 flex items-baseline space-x-6">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`relative px-3 py-2 text-sm font-medium transition-colors hover:text-brand-cyan ${
                    location.pathname + location.search === link.path 
                      ? 'text-brand-cyan' 
                      : 'text-gray-300'
                  }`}
                >
                  {link.name}
                  {location.pathname + location.search === link.path && (
                    <span className="absolute bottom-0 left-0 w-full h-0.5 bg-brand-cyan rounded-full"></span>
                  )}
                </Link>
              ))}
            </div>
          </div>

          {/* Icons */}
          <div className="flex items-center space-x-5">
            <Link to="/cart" className="relative group">
              <ShoppingCart className="h-6 w-6 text-gray-300 group-hover:text-white transition" />
              {cart.length > 0 && (
                <span className="absolute -top-2 -right-2 inline-flex items-center justify-center w-5 h-5 text-xs font-bold leading-none text-white bg-brand-accent rounded-full border border-brand-deep">
                  {cart.length}
                </span>
              )}
            </Link>

            {auth.isAuthenticated ? (
              <div 
                className="relative"
                onMouseEnter={() => setIsUserMenuOpen(true)}
                onMouseLeave={() => setIsUserMenuOpen(false)}
              >
                <button className="flex items-center space-x-2 text-gray-300 hover:text-white">
                  <User className="h-6 w-6" />
                </button>
                {/* Dropdown - no gap, padding-top creates spacing inside */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 top-full w-48 z-50">
                    <div className="pt-2">
                      <div className="bg-white rounded-lg shadow-xl py-2 text-gray-800 border border-gray-100">
                        <div className="px-4 py-2 border-b border-gray-100">
                          <p className="text-xs text-gray-500">Signed in as</p>
                          <p className="font-bold truncate">{auth.user?.name}</p>
                        </div>
                        <Link 
                          to="/orders" 
                          className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-50 text-gray-700"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          My Orders
                        </Link>
                        <button 
                          onClick={() => {
                            logout();
                            setIsUserMenuOpen(false);
                          }} 
                          className="block w-full text-left px-4 py-2 text-sm hover:bg-red-50 text-red-600"
                        >
                          Logout
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login" className="bg-white/10 hover:bg-brand-cyan text-white px-5 py-2 rounded-full text-sm font-semibold transition border border-white/20">
                Login
              </Link>
            )}

            <div className="-mr-2 flex lg:hidden">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="bg-gray-800 p-2 rounded-md text-gray-400 hover:text-white"
              >
                {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="lg:hidden bg-gray-900 border-t border-gray-800">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-gray-800"
              >
                {link.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
};

const Footer = () => {
  return (
    <footer className="bg-brand-deep text-white pt-16 pb-8 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          
          {/* Brand Info */}
          <div className="col-span-1 md:col-span-1">
            <h3 className="font-display font-bold text-2xl text-white mb-4">{STORE_DETAILS.name}</h3>
            <p className="text-gray-400 text-sm mb-6 leading-relaxed">
              Tirupati's premium destination for exotic marine and freshwater fishes. We specialize in custom tank setups and high-end accessories.
            </p>
            <div className="flex space-x-4">
              <a href={STORE_DETAILS.social.facebook} className="bg-gray-800 p-2 rounded-full hover:bg-blue-600 transition"><Facebook size={18} /></a>
              <a href={STORE_DETAILS.social.instagram} className="bg-gray-800 p-2 rounded-full hover:bg-pink-600 transition"><Instagram size={18} /></a>
              <a href={STORE_DETAILS.social.youtube} className="bg-gray-800 p-2 rounded-full hover:bg-red-600 transition"><Youtube size={18} /></a>
            </div>
          </div>

          {/* Categories */}
          <div>
            <h4 className="font-bold text-lg mb-4 text-brand-cyan">Categories</h4>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li><Link to="/shop?cat=Marine" className="hover:text-white transition">Marine Fishes</Link></li>
              <li><Link to="/shop?cat=Exotic" className="hover:text-white transition">Exotic Collection</Link></li>
              <li><Link to="/shop?cat=Freshwater" className="hover:text-white transition">Freshwater</Link></li>
              <li><Link to="/shop?cat=Tanks" className="hover:text-white transition">Custom Tanks</Link></li>
              <li><Link to="/shop?cat=Accessories" className="hover:text-white transition">Accessories</Link></li>
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold text-lg mb-4 text-brand-cyan">Customer Care</h4>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li><Link to="/orders" className="hover:text-white transition">Track Order</Link></li>
              <li><Link to="/shop" className="hover:text-white transition">New Arrivals</Link></li>
              <li><span className="text-gray-500 cursor-not-allowed">Shipping Policy</span></li>
              <li><span className="text-gray-500 cursor-not-allowed">Terms & Conditions</span></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-bold text-lg mb-4 text-brand-cyan">Store Address</h4>
            <ul className="space-y-4 text-gray-400 text-sm">
              <li className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 text-brand-cyan shrink-0 mt-1" />
                <span>{STORE_DETAILS.address}</span>
              </li>
              <li className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-brand-cyan shrink-0" />
                <span className="text-lg font-semibold text-white">{STORE_DETAILS.phone}</span>
              </li>
              <li className="text-xs text-gray-500 mt-2">
                Open: Mon - Sat (10 AM - 9 PM)
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8 text-center text-xs text-gray-500 flex flex-col md:flex-row justify-between items-center">
          <p>© {new Date().getFullYear()} {STORE_DETAILS.name}. All rights reserved.</p>
          <p className="mt-2 md:mt-0">Designed for Aquarium Enthusiasts</p>
        </div>
      </div>
    </footer>
  );
};

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col font-sans">
      <Navbar />
      <main className="flex-grow bg-brand-light">
        {children}
      </main>
      <Footer />
      <ChatWidget />
    </div>
  );
};