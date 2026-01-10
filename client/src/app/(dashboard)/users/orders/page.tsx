import OrdersList from "./orders-list";

export default function OrderHistoryPage() {
    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="container mx-auto px-4 max-w-6xl">
                <h1 className="text-4xl font-bold text-gray-900 mb-8">My Orders</h1>
                <OrdersList />
            </div>
        </div>
    );
}