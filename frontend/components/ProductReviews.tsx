import React, { useState, useEffect } from 'react';
import { Star, Send, User } from 'lucide-react';
import { Review } from '../types';
import { reviewService } from '../services/api';
import { useApp } from '../context';

interface ProductReviewsProps {
  productId: string;
}

const ProductReviews: React.FC<ProductReviewsProps> = ({ productId }) => {
  const { auth } = useApp();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [canReview, setCanReview] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadReviews();
  }, [productId, auth.user?.id]);

  const loadReviews = async () => {
    try {
      setLoading(true);
      const userId = auth.user?.id;
      const data = await reviewService.getReviews(productId, userId);
      setReviews(data.reviews);
      setCanReview(data.canReview);
    } catch (error) {
      console.error('Failed to load reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.user || !auth.isAuthenticated) {
      alert('Vui lòng đăng nhập để đánh giá sản phẩm');
      return;
    }

    setSubmitting(true);
    try {
      await reviewService.createReview({
        productId,
        userId: auth.user.id,
        userName: auth.user.name,
        rating,
        comment: comment.trim()
      });
      
      // Reload reviews
      await loadReviews();
      
      // Reset form
      setComment('');
      setRating(5);
      setShowForm(false);
    } catch (error: any) {
      console.error('Failed to submit review:', error);
      const errorMessage = error.message || 'Không thể gửi đánh giá. Vui lòng thử lại.';
      alert(errorMessage);
      
      // If error indicates user hasn't purchased, reload reviews to update canReview
      if (errorMessage.includes('mua sản phẩm')) {
        await loadReviews();
      }
    } finally {
      setSubmitting(false);
    }
  };

  const averageRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-900 mb-1">Đánh giá sản phẩm</h3>
          <div className="flex items-center gap-2">
            <div className="flex items-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-5 w-5 ${
                    star <= Math.round(averageRating)
                      ? 'text-yellow-400 fill-yellow-400'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <span className="text-sm text-gray-600 font-semibold">
              {averageRating > 0 ? averageRating.toFixed(1) : 'Chưa có'}
            </span>
            {reviews.length > 0 && (
              <span className="text-xs text-gray-500 ml-1">
                ({reviews.length} đánh giá)
              </span>
            )}
          </div>
        </div>
        {auth.isAuthenticated && canReview && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2 bg-brand-cyan text-white rounded-lg hover:bg-brand-ocean transition-colors font-semibold"
          >
            {showForm ? 'Hủy' : 'Viết đánh giá'}
          </button>
        )}
      </div>

      {/* Info message for users who haven't purchased */}
      {auth.isAuthenticated && !canReview && (
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="text-sm text-amber-800">
            💡 Bạn chỉ có thể đánh giá sản phẩm sau khi đã mua và nhận hàng.
          </p>
        </div>
      )}

      {/* Review Form */}
      {showForm && auth.isAuthenticated && canReview && (
        <form onSubmit={handleSubmit} className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Đánh giá của bạn *
            </label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="focus:outline-none"
                >
                  <Star
                    className={`h-6 w-6 transition-colors ${
                      star <= rating
                        ? 'text-yellow-400 fill-yellow-400'
                        : 'text-gray-300 hover:text-yellow-300'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Bình luận
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm này..."
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-cyan focus:border-brand-cyan outline-none resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2 bg-gradient-to-r from-brand-cyan to-brand-ocean text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-semibold"
          >
            <Send className="h-4 w-4" />
            {submitting ? 'Đang gửi...' : 'Gửi đánh giá'}
          </button>
        </form>
      )}

      {!auth.isAuthenticated && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg text-center">
          <p className="text-sm text-blue-700">
            Vui lòng <a href="#/login" className="font-bold underline hover:text-blue-900">đăng nhập</a> để viết đánh giá
          </p>
        </div>
      )}

      {/* Reviews List */}
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-cyan"></div>
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <Star className="h-12 w-12 mx-auto mb-3 text-gray-300" />
          <p>Chưa có đánh giá nào. Hãy là người đầu tiên đánh giá!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review.id} className="border-b border-gray-100 pb-4 last:border-b-0 last:pb-0">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-brand-light rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="h-5 w-5 text-brand-ocean" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <div>
                      <p className="font-semibold text-gray-900">{review.userName}</p>
                      <div className="flex items-center gap-1 mt-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`h-4 w-4 ${
                              star <= review.rating
                                ? 'text-yellow-400 fill-yellow-400'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <span className="text-xs text-gray-400">
                      {new Date(review.createdAt).toLocaleDateString('vi-VN', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                  {review.comment && (
                    <p className="text-gray-700 mt-2 whitespace-pre-wrap">{review.comment}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductReviews;

