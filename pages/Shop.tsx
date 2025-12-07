import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Filter, ShoppingBag, Search, Check } from 'lucide-react';
import { Product, Category } from '../types';
import { productService } from '../services/api';
import { CATEGORIES } from '../constants';
import { useApp } from '../context';

const Shop = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const activeCategory = searchParams.get('cat') || 'All';
  const [searchTerm, setSearchTerm] = useState('');
  
  const { addToCart } = useApp();

  useEffect(() => {
    productService.getAll().then(data => {
      setProducts(data);
      setLoading(false);
    });
  }, []);

  const filteredProducts = products.filter(p => {
    const matchesCat = activeCategory === 'All' || p.category === activeCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-3xl font-display font-bold text-gray-900">
            {activeCategory === 'All' ? 'All Products' : `${activeCategory} Collection`}
          </h1>
          <p className="text-gray-500 mt-1">{filteredProducts.length} items available</p>
        </div>
        
        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search for fishes..." 
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border-gray-200 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-cyan focus:bg-white transition"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Filters */}
        <div className="w-full lg:w-64 flex-shrink-0 space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 sticky top-24">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center uppercase text-sm tracking-wider">
              <Filter className="h-4 w-4 mr-2" /> Filter By
            </h3>
            <div className="space-y-1">
              <button 
                onClick={() => setSearchParams({})}
                className={`flex items-center justify-between w-full text-left px-3 py-2.5 rounded-lg text-sm transition font-medium ${activeCategory === 'All' ? 'bg-brand-light text-brand-ocean' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                All Products
                {activeCategory === 'All' && <Check size={14}/>}
              </button>
              {CATEGORIES.map(cat => (
                <button 
                  key={cat}
                  onClick={() => setSearchParams({ cat })}
                  className={`flex items-center justify-between w-full text-left px-3 py-2.5 rounded-lg text-sm transition font-medium ${activeCategory === cat ? 'bg-brand-light text-brand-ocean' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                  {cat}
                  {activeCategory === cat && <Check size={14}/>}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Product Grid */}
        <div className="flex-1">
          {loading ? (
            <div className="flex justify-center py-20">
               <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-cyan"></div>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
                <p className="text-gray-500 text-lg">No products found matching your criteria.</p>
                <button onClick={() => {setSearchParams({}); setSearchTerm('')}} className="mt-4 text-brand-cyan font-bold hover:underline">Clear Filters</button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map(product => (
                <ProductCard key={product.id} product={product} onAdd={() => addToCart(product, 1)} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const ProductCard: React.FC<{ product: Product, onAdd: () => void }> = ({ product, onAdd }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl hover:border-brand-cyan/30 transition-all duration-300 group flex flex-col h-full">
      <div className="relative h-56 overflow-hidden bg-gray-100">
        <img 
          src={product.image} 
          alt={product.name} 
          className="w-full h-full object-cover group-hover:scale-110 transition duration-700"
        />
        {product.offerPrice && (
          <div className="absolute top-3 left-3 bg-brand-accent text-white text-xs font-bold px-2 py-1 rounded shadow-sm">
            {Math.round(((product.price - product.offerPrice) / product.price) * 100)}% OFF
          </div>
        )}
        {product.stock <= 0 && (
            <div className="absolute inset-0 bg-white/60 flex items-center justify-center backdrop-blur-[2px]">
                <span className="bg-gray-800 text-white px-3 py-1 rounded font-bold text-sm">OUT OF STOCK</span>
            </div>
        )}
      </div>
      
      <div className="p-5 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-2">
            <div className="text-xs font-bold text-brand-ocean bg-brand-light px-2 py-0.5 rounded uppercase tracking-wider">{product.category}</div>
            <div className={`text-xs font-medium ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {product.stock > 0 ? 'In Stock' : 'Sold Out'}
            </div>
        </div>
        
        <h3 className="font-bold text-gray-900 text-lg mb-1 leading-tight group-hover:text-brand-cyan transition">{product.name}</h3>
        {product.scientificName && <p className="text-xs text-gray-400 italic mb-3">{product.scientificName}</p>}
        
        <div className="mt-auto pt-4 border-t border-gray-50 flex items-center justify-between">
          <div>
            {product.offerPrice ? (
              <div className="flex flex-col">
                <span className="text-gray-400 text-xs line-through">₹{product.price}</span>
                <span className="text-xl font-bold text-gray-900">₹{product.offerPrice}</span>
              </div>
            ) : (
              <span className="text-xl font-bold text-gray-900">₹{product.price}</span>
            )}
          </div>
          
          <button 
            onClick={onAdd}
            disabled={product.stock <= 0}
            className={`p-3 rounded-full transition-colors shadow-lg ${product.stock > 0 ? 'bg-brand-deep hover:bg-brand-cyan text-white' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
            title="Add to Cart"
          >
            <ShoppingBag className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Shop;