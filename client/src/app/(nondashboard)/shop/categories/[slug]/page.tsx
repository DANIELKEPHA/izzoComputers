import ShopPage from "@/app/(nondashboard)/shop/page";

export default function CategoryPage({ params }: { params: { slug: string } }) {
    return <ShopPage initialCategorySlug={params.slug} />;
}