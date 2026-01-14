// components/reviews/ReviewForm.tsx
'use client';

import { useState } from 'react';
import { Star, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {useUpsertReviewMutation} from "@/state/api";

interface ReviewFormProps {
    productId: number;
    existingReview?: {
        rating: number;
        title: string | null;
        comment: string | null;
    } | null;
    onSuccess?: () => void;
    onCancel?: () => void;
}

const ReviewForm = ({ productId, existingReview, onSuccess, onCancel }: ReviewFormProps) => {
    const [rating, setRating] = useState(existingReview?.rating || 0);
    const [hoverRating, setHoverRating] = useState(0);
    const [title, setTitle] = useState(existingReview?.title || '');
    const [comment, setComment] = useState(existingReview?.comment || '');

    const [upsertReview, { isLoading }] = useUpsertReviewMutation();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (rating === 0) {
            alert('Please select a rating');
            return;
        }

        try {
            await upsertReview({
                productId,
                rating,
                title: title.trim() || undefined,
                comment: comment.trim() || undefined,
            }).unwrap();

            onSuccess?.();
        } catch (error) {
            console.error('Failed to submit review:', error);
        }
    };

    return (
        <Card className="border-primary/20 shadow-lg">
            <CardHeader>
                <CardTitle className="text-2xl font-bold">
                    {existingReview ? 'Edit Your Review' : 'Write a Review'}
                </CardTitle>
                <CardDescription>
                    Share your experience with this product
                </CardDescription>
            </CardHeader>

            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Rating Section */}
                    <div className="space-y-3">
                        <Label className="text-base font-semibold">
                            Your Rating *
                        </Label>
                        <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    onClick={() => setRating(star)}
                                    onMouseEnter={() => setHoverRating(star)}
                                    onMouseLeave={() => setHoverRating(0)}
                                    className="p-1 transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary/30 rounded-full"
                                >
                                    <Star
                                        className={`w-10 h-10 ${
                                            star <= (hoverRating || rating)
                                                ? 'fill-yellow-400 text-yellow-400'
                                                : 'fill-muted text-muted-foreground/30'
                                        } transition-colors`}
                                    />
                                </button>
                            ))}
                            <span className="ml-4 text-lg font-semibold">
                {rating ? `${rating}.0` : 'Select stars'}
              </span>
                        </div>
                    </div>

                    {/* Title Input */}
                    <div className="space-y-2">
                        <Label htmlFor="review-title">Review Title (Optional)</Label>
                        <Input
                            id="review-title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Summarize your experience"
                            className="h-11"
                        />
                    </div>

                    {/* Comment Input */}
                    <div className="space-y-2">
                        <Label htmlFor="review-comment">Your Review *</Label>
                        <Textarea
                            id="review-comment"
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="What did you like or dislike? Would you recommend this to others?"
                            className="min-h-[120px] resize-none"
                            required
                        />
                        <p className="text-sm text-muted-foreground">
                            Your review helps other shoppers make informed decisions.
                        </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-4">
                        <Button
                            type="submit"
                            className="flex-1 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 h-11"
                            disabled={isLoading || rating === 0}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Submitting...
                                </>
                            ) : (
                                'Submit Review'
                            )}
                        </Button>

                        {onCancel && (
                            <Button
                                type="button"
                                variant="outline"
                                onClick={onCancel}
                                className="h-11"
                            >
                                Cancel
                            </Button>
                        )}
                    </div>
                </form>
            </CardContent>
        </Card>
    );
};

export default ReviewForm;