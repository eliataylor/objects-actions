import { type Metadata } from "next";
import { notFound } from "next/navigation";
import { NAVITEMS, type ModelName, type ModelType, type ApiListResponse } from "~/types/types";
import PageLayout from "~/app/_components/PageLayout";
import ApiClient from "~/app/_components/ApiClient";
import EntityCard from "../_components/EntityCard";

type Props = {
  params: { segment: string };
};

// Validate the segment exists in our nav items
const validateSegment = (segment: string) => {
  return NAVITEMS.some(item => item.segment === segment);
};

// Generate metadata for the page
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const segment = params.segment;
  
  if (!validateSegment(segment)) {
    return {
      title: "Not Found",
    };
  }

  const navItem = NAVITEMS.find(item => item.segment === segment);
  return {
    title: navItem?.plural || "Page Not Found",
  };
}

// Generate static params for all valid segments
export function generateStaticParams() {
  return NAVITEMS.map((item) => ({
    segment: item.segment,
  }));
}

// This enables dynamic data fetching at request time
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Dynamic page component
export default async function DynamicPage({ params }: Props) {
  const { segment } = params;

  const navItem = NAVITEMS.find(item => item.segment === segment);

  if (!navItem) {
    notFound();
  }

  const response = await ApiClient.get<ApiListResponse<ModelName>>(navItem.api);

  return (
    <PageLayout navItem={navItem}>
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <h1 className="text-4xl font-bold">{navItem.plural}</h1>
          </div>
          <div>
            {response.error ? (
              <div className="p-4 border border-red-200 bg-red-50 rounded-lg text-red-700">
                {response.error}
              </div>
            ) : (!response.success || !response.data) ? (
              <div className="p-4 border border-red-200 bg-red-50 rounded-lg text-red-700">
                Failed to load data
              </div>
            ) : (
              <div className="mt-4">
                {response.data.results.length > 0 ? (
                  <div className="grid gap-4">
                    {response.data.results.map((item: ModelType<ModelName>) => (
                      <EntityCard key={item.id} entity={item} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-gray-500">
                    No {navItem.plural.toLowerCase()} found
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </PageLayout>
  );
} 