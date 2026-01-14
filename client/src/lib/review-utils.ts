export const calculateRatingStats = (reviews: Array<{ rating: number }>) => {
    if (!reviews.length) {
        return {
            average: 0,
            distribution: [1, 2, 3, 4, 5].map(rating => ({
                rating,
                count: 0,
                percentage: 0
            }))
        };
    }

    const total = reviews.reduce((sum, review) => sum + review.rating, 0);
    const average = total / reviews.length;

    const distribution = [1, 2, 3, 4, 5].map(rating => {
        const count = reviews.filter(r => r.rating === rating).length;
        return {
            rating,
            count,
            percentage: (count / reviews.length) * 100
        };
    });

    return { average, distribution };
};

export const formatReviewDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;

    return date.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
    });
};