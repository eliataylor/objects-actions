import SharedFormLogic, { generateFormMetadata, generateFormStaticParams } from "~/app/_forming/SharedFormLogic";

type Props = {
  params: Promise<{
    model: string;
  }>;
};

export default async function AddFormPage({ params }: Props) {
  const { model } = await params;
  return <SharedFormLogic model={model} id="0" verb="add" />;
}

// Generate static params for better performance
export async function generateStaticParams() {
  return generateFormStaticParams().map(param => ({
    model: param.model,
  }));
}

// Generate metadata
export async function generateMetadata({ params }: Props) {
  const { model } = await params;
  return generateFormMetadata(model, "0", "add");
} 