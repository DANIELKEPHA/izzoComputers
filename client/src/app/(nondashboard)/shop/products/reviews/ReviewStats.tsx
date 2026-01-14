// components/reviews/ReviewStats.tsx
import { Star, TrendingUp, Users, MessageSquare } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface ReviewStatsProps {
    averageRating: number;
    reviewCount: number;
    ratingDistribution: Array<{ rating: number; count: number; percentage: number }>;
}

const ReviewStats = ({ averageRating, reviewCount, ratingDistribution }: ReviewStatsProps) => {
    return (
        <Card className="border-border/40">
            <CardContent className="p-6">
                <div className="grid md:grid-cols-3 gap-8">
                    {/* Overall Rating */}
                    <div className="space-y-4 text-center md:text-left">
                        <div className="flex items-center justify-center md:justify-start gap-2">
                            <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                            <h3 className="text-2xl font-bold">Overall Rating</h3>
                        </div>
                        <div className="space-y-2">
                            <div className="text-4xl font-bold">{averageRating.toFixed(1)}</div>
                            <div className="flex items-center justify-center md:justify-start gap-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <Star
                                        key={star}
                                        className={`w-5 h-5 ${
                                            star <= Math.round(averageRating)
                                                ? 'fill-yellow-400 text-yellow-400'
                                                : 'fill-muted text-muted-foreground/30'
                                        }`}
                                    />
                                ))}
                            </div>
                            <p className="text-muted-foreground">
                                Based on {reviewCount} review{reviewCount !== 1 ? 's' : ''}
                            </p>
                        </div>
                    </div>

                    {/* Rating Distribution */}
                    <div className="md:col-span-2 space-y-4">
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                            <TrendingUp className="w-4 h-4" />
                            Rating Breakdown
                        </h3>

                        <div className="space-y-3">
                            {[5, 4, 3, 2, 1].map((rating) => {
                                const dist = ratingDistribution.find(d => d.rating === rating);
                                return (
                                    <div key={rating} className="flex items-center gap-3">
                                        <div className="flex items-center gap-1 w-16">
                                            <span className="text-sm font-medium">{rating}</span>
                                            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                        </div>
                                        <Progress
                                            value={dist?.percentage || 0}
                                            className="flex-1 h-2"
                                        />
                                        <span className="text-sm text-muted-foreground w-12 text-right">
                      {dist?.count || 0}
                    </span>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Quick Stats */}
                        <div className="flex gap-4 pt-4 border-t">
                            <div className="flex items-center gap-2">
                                <Users className="w-4 h-4 text-primary" />
                                <span className="text-sm">
                  {reviewCount} Review{reviewCount !== 1 ? 's' : ''}
                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <MessageSquare className="w-4 h-4 text-primary" />
                                <span className="text-sm">
                  {ratingDistribution.filter(d => d.rating >= 4).reduce((sum, d) => sum + d.count, 0)} Positive
                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default ReviewStats;