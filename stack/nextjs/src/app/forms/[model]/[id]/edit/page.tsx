import SharedFormLogic, { generateFormMetadata } from "~/app/_forming/SharedFormLogic";

type Props = {
  params: Promise<{
    model: string;
    id: string;
  }>;
};

export default async function EditFormPage({ params }: Props) {
  const { model, id } = await params;
  return <SharedFormLogic model={model} id={id} verb="edit" />;
}

// Generate metadata
export async function generateMetadata({ params }: Props) {
  const { model, id } = await params;
  return generateFormMetadata(model, id, "edit");
} 