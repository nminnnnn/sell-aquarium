import React, { useEffect, useState } from 'react';
import { Heart, Star, ShoppingBag } from 'lucide-react';
import { useApp } from '../context';
import { productService, favoriteService } from '../services/api';
import { Product } from '../types';
import { getImageUrl } from '../utils/imageUtils';

const Favorites = () => {
  const { auth } = useApp();
  const [favoriteProducts, setFavoriteProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!auth.user?.id) {
      setLoading(false);
      return;
    }

    loadFavorites();
  }, [auth.user?.id]);

  const loadFavorites = async () => {
    if (!auth.user?.id) return;

    try {
      setLoading(true);
      const favIds = await favoriteService.getFavorites(auth.user.id);
      setFavoriteIds(new Set(favIds));

      if (favIds.length === 0) {
        setFavoriteProducts([]);
        setLoading(false);
        return;
      }

      // Load all products and filter by favorite IDs
      const allProducts = await productService.getAll();
      const favorites = allProducts.filter(p => favIds.includes(p.id));
      setFavoriteProducts(favorites);
    } catch (error) {
      console.error('Failed to load favorites:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFavorite = async (productId: string) => {
    if (!auth.user?.id) return;

    const isFavorited = favoriteIds.has(productId);
    try {
      await favoriteService.toggleFavorite(auth.user.id, productId, isFavorited);
      
      setFavoriteIds(prev => {
        const newSet = new Set(prev);
        if (isFavorited) {
          newSet.delete(productId);
        } else {
          newSet.add(productId);
        }
        return newSet;
      });

      // Remove from list if unfavorited
      if (isFavorited) {
        setFavoriteProducts(prev => prev.filter(p => p.id !== productId));
      }
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
      alert('Không thể cập nhật yêu thích. Vui lòng thử lại.');
    }
  };

  if (!auth.isAuthenticated) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center py-20">
          <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-700 mb-2">Vui lòng đăng nhập</h2>
          <p className="text-gray-500">Bạn cần đăng nhập để xem danh sách yêu thích</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-cyan"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-gray-900 flex items-center gap-3">
          <Heart className="h-8 w-8 text-red-500 fill-red-500" />
          Sản phẩm yêu thích
        </h1>
        <p className="text-gray-500 mt-2">{favoriteProducts.length} sản phẩm</p>
      </div>

      {favoriteProducts.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
          <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-700 mb-2">Chưa có sản phẩm yêu thích</h2>
          <p className="text-gray-500 mb-6">Hãy thêm các sản phẩm bạn thích vào danh sách yêu thích</p>
          <a href="/#/shop" className="text-brand-cyan font-semibold hover:underline">
            Xem tất cả sản phẩm →
          </a>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {favoriteProducts.map(product => (
            <div
              key={product.id}
              className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl hover:border-brand-cyan/30 transition-all duration-300 group flex flex-col h-full"
            >
              <div className="relative h-56 overflow-hidden bg-gray-100">
                <img
                  src={getImageUrl(product.image)}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition duration-700"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x300?text=No+Image';
                  }}
                />
                <button
                  onClick={() => handleToggleFavorite(product.id)}
                  className="absolute top-3 right-3 p-2 bg-red-500 text-white rounded-full shadow-lg hover:bg-red-600 transition-all"
                  title="Xóa khỏi yêu thích"
                >
                  <Heart className="h-5 w-5 fill-current" />
                </button>
                {product.offerPrice && (
                  <div className="absolute top-3 left-3 bg-brand-accent text-white text-xs font-bold px-2 py-1 rounded shadow-sm">
                    {Math.round(((product.price - product.offerPrice) / product.price) * 100)}% OFF
                  </div>
                )}
              </div>

              <div className="p-5 flex flex-col flex-grow">
                <div className="flex justify-between items-start mb-2">
                  <div className="text-xs font-bold text-brand-ocean bg-brand-light px-2 py-0.5 rounded uppercase tracking-wider">
                    {product.category}
                  </div>
                  <div className={`text-xs font-medium ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {product.stock > 0 ? 'Còn hàng' : 'Hết hàng'}
                  </div>
                </div>

                <h3 className="font-bold text-gray-900 text-lg mb-1 leading-tight group-hover:text-brand-cyan transition">
                  {product.name}
                </h3>
                {product.scientificName && (
                  <p className="text-xs text-gray-400 italic mb-2">{product.scientificName}</p>
                )}

                {/* Rating Display */}
                {product.averageRating !== undefined && product.averageRating > 0 && (
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex items-center">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-3.5 w-3.5 ${
                            star <= Math.round(product.averageRating!)
                              ? 'text-yellow-400 fill-yellow-400'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-gray-600 font-semibold">
                      {product.averageRating.toFixed(1)}
                    </span>
                  </div>
                )}

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
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Favorites;

