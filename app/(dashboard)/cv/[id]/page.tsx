import CVEditForm from '../edit-form';

type Props = {
  params: Promise<{ id: string }>;
};

export default async function EditCVPage({ params }: Props) {
  const { id } = await params;
  return <CVEditForm cvId={id} />;
}
