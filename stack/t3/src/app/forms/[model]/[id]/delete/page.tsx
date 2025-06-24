import SharedFormLogic, { generateFormMetadata } from "~/app/_forming/SharedFormLogic";

type Props = {
  params: Promise<{
    model: string;
    id: string;
  }>;
};

export default async function DeleteFormPage({ params }: Props) {
  const { model, id } = await params;
  return <SharedFormLogic model={model} id={id} verb="delete" />;
}

// Generate metadata
export async function generateMetadata({ params }: Props) {
  const { model, id } = await params;
  return generateFormMetadata(model, id, "delete");
} 