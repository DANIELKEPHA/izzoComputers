import { format } from 'date-fns';
import { Star } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';

interface ReviewCardProps {
    review: {
        id: number;
        rating: number;
        title: string | null;
        comment: string | null;
        createdAt: string;
        user: {
            name: string | null;
        };
    };
}

const ReviewCard = ({ review }: ReviewCardProps) => {
    const initials = review.user.name
        ?.split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2) || 'U';

    return (
        <Card className="border-border/40 hover:border-border transition-colors">
            <CardContent className="p-6">
                <div className="flex items-start gap-4">
                    <Avatar className="h-12 w-12 border-2 border-primary/10">
                        <AvatarFallback className="bg-gradient-to-br from-primary/10 to-primary/5 text-primary font-semibold">
                            {initials}
                        </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 space-y-3">
                        <div className="flex items-center justify-between">
                            <div>
                                <h4 className="font-semibold text-lg">
                                    {review.user.name || 'Anonymous User'}
                                </h4>
                                <p className="text-sm text-muted-foreground">
                                    {format(new Date(review.createdAt), 'MMM d, yyyy')}
                                </p>
                            </div>
                            <div className="flex items-center gap-1">
                                {[...Array(5)].map((_, i) => (
                                    <Star
                                        key={i}
                                        className={`w-4 h-4 ${
                                            i < review.rating
                                                ? 'fill-yellow-400 text-yellow-400'
                                                : 'fill-muted text-muted-foreground/30'
                                        }`}
                                    />
                                ))}
                                <span className="ml-2 font-medium">{review.rating}.0</span>
                            </div>
                        </div>

                        {review.title && (
                            <h3 className="font-semibold text-lg">{review.title}</h3>
                        )}

                        {review.comment && (
                            <p className="text-foreground/80 leading-relaxed whitespace-pre-wrap">
                                {review.comment}
                            </p>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default ReviewCard;