import EditProductForm from "@/app/(dashboard)/admins/products/components/EditProductForm";


export default function EditProductPage({ params }: { params: { id: string } }) {
    const productId = Number(params.id);

    return <EditProductForm productId={productId} />;
}