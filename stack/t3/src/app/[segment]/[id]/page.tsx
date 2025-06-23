import { notFound } from "next/navigation";
import ApiClient from "~/app/_components/ApiClient";
import EntityCard from "~/app/_components/EntityCard";
import PageLayout from "~/app/_components/PageLayout";
import { NAVITEMS, type ModelName, type ModelType } from "~/types/types";

interface Props {
  params: {
    segment: string;
    id: string;
  };
}

export function generateStaticParams() {
  return NAVITEMS.map((item) => ({
    segment: item.segment,
    id: 'placeholder' // Next.js requires this but the actual IDs will be dynamic
  }))
}

export default async function SegmentDetailPage({ params }: Props) {
  // You can access both the segment and id from params
  const { segment, id } = params;

  const navItem = NAVITEMS.find(item => item.segment === segment)
  if (!navItem) notFound()

  const response = await ApiClient.get<ModelType<ModelName>>(`/api/${segment}/${id}`)  
  
  return (
    <PageLayout navItem={navItem}>
      <div id="EntityView" className="container mx-auto">
        {response.error ? (
            <div className="p-4 border border-red-200 bg-red-50 rounded-lg text-red-700">
              {response.error}
            </div>
          ) : (!response.success || !response.data) ? (<div className="p-4 border border-red-200 bg-red-50 rounded-lg text-red-700">
            {response.error}
          </div>) : (
            <div className="mt-4">
              <EntityCard entity={response.data} />
            </div>
          )}

      </div>
    </PageLayout>
  );
} 