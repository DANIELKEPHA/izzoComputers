// components/reviews/ReviewSection.tsx
'use client';

import { useState } from 'react';
import { MessageSquare, Star, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import ReviewCard from './ReviewCard';
import ReviewForm from './ReviewForm';
import ReviewStats from './ReviewStats';
import {useGetMyProductReviewQuery, useGetProductReviewsQuery} from "@/state/api";

interface ReviewSectionProps {
    productId: number;
    averageRating: number;
    reviewCount: number;
}

const ReviewSection = ({ productId, averageRating, reviewCount }: ReviewSectionProps) => {
    const [showForm, setShowForm] = useState(false);
    const [sortBy, setSortBy] = useState<'recent' | 'highest' | 'lowest'>('recent');

    const { data: reviews = [], isLoading: reviewsLoading } = useGetProductReviewsQuery(productId);
    const { data: myReview, isLoading: myReviewLoading } = useGetMyProductReviewQuery(productId);

    // Calculate rating distribution
    const ratingDistribution = [1, 2, 3, 4, 5].map(rating => {
        const count = reviews.filter(r => r.rating === rating).length;
        return {
            rating,
            count,
            percentage: reviewCount > 0 ? (count / reviewCount) * 100 : 0
        };
    });

    // Sort reviews
    const sortedReviews = [...reviews].sort((a, b) => {
        switch (sortBy) {
            case 'highest':
                return b.rating - a.rating;
            case 'lowest':
                return a.rating - b.rating;
            case 'recent':
            default:
                return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
    });

    // Filter states
    const [selectedRating, setSelectedRating] = useState<number | null>(null);
    const filteredReviews = selectedRating
        ? sortedReviews.filter(review => review.rating === selectedRating)
        : sortedReviews;

    if (reviewsLoading || myReviewLoading) {
        return (
            <div className="space-y-6 animate-pulse">
                <div className="h-8 bg-muted rounded w-48"></div>
                <div className="grid gap-4">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-32 bg-muted rounded"></div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <MessageSquare className="w-6 h-6 text-primary" />
                    <h2 className="text-3xl font-bold">Customer Reviews</h2>
                </div>

                {!showForm && !myReview && (
                    <Button
                        onClick={() => setShowForm(true)}
                        className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
                    >
                        <Star className="mr-2 w-4 h-4" />
                        Write a Review
                    </Button>
                )}
            </div>

            {/* Review Stats */}
            <ReviewStats
                averageRating={averageRating}
                reviewCount={reviewCount}
                ratingDistribution={ratingDistribution}
            />

            {/* Review Form */}
            {showForm && (
                <div className="animate-in slide-in-from-bottom-4 duration-300">
                    <ReviewForm
                        productId={productId}
                        existingReview={myReview || undefined}
                        onSuccess={() => {
                            setShowForm(false);
                        }}
                        onCancel={() => setShowForm(false)}
                    />
                </div>
            )}

            {/* Reviews Tabs */}
            <Tabs defaultValue="all" className="space-y-6">
                <div className="flex items-center justify-between">
                    <TabsList>
                        <TabsTrigger value="all">All Reviews ({reviews.length})</TabsTrigger>
                        <TabsTrigger value="positive">
                            Positive ({ratingDistribution.filter(d => d.rating >= 4).reduce((sum, d) => sum + d.count, 0)})
                        </TabsTrigger>
                        <TabsTrigger value="critical">
                            Critical ({ratingDistribution.filter(d => d.rating <= 2).reduce((sum, d) => sum + d.count, 0)})
                        </TabsTrigger>
                    </TabsList>

                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                            <Filter className="w-4 h-4 text-muted-foreground" />
                            <Select
                                value={sortBy}
                                onValueChange={(value: 'recent' | 'highest' | 'lowest') => setSortBy(value)}
                            >
                                <SelectTrigger className="w-32">
                                    <SelectValue placeholder="Sort by" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="recent">Most Recent</SelectItem>
                                    <SelectItem value="highest">Highest Rated</SelectItem>
                                    <SelectItem value="lowest">Lowest Rated</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <Select
                            value={selectedRating?.toString() || 'all'}
                            onValueChange={(value) => setSelectedRating(value === 'all' ? null : parseInt(value))}
                        >
                            <SelectTrigger className="w-40">
                                <SelectValue placeholder="Filter by rating" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Ratings</SelectItem>
                                {[5, 4, 3, 2, 1].map(rating => (
                                    <SelectItem key={rating} value={rating.toString()}>
                                        <div className="flex items-center gap-2">
                                            {rating} Star{rating !== 1 ? 's' : ''}
                                            <span className="text-muted-foreground">
                        ({ratingDistribution.find(d => d.rating === rating)?.count || 0})
                      </span>
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Review List */}
                <div className="space-y-6">
                    {filteredReviews.length > 0 ? (
                        filteredReviews.map((review) => (
                            <ReviewCard key={review.id} review={review} />
                        ))
                    ) : (
                        <div className="text-center py-12 space-y-4">
                            <MessageSquare className="w-12 h-12 text-muted-foreground/50 mx-auto" />
                            <div>
                                <h3 className="text-lg font-semibold">No reviews yet</h3>
                                <p className="text-muted-foreground">
                                    Be the first to share your thoughts about this product!
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </Tabs>
        </div>
    );
};

export default ReviewSection;