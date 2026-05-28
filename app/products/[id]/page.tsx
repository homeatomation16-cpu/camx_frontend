import ProductOverview from "@/app/components/productOverview";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function Page({ params }: Props) {
  const { id } = await params;
  console.log(id);

  return <ProductOverview id={id} />;
}
