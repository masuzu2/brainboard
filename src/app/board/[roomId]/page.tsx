import BoardClient from "./BoardClient";

export default async function BoardPage({
  params,
}: {
  params: Promise<{ roomId: string }>;
}) {
  const { roomId } = await params;
  return (
    <div className="relative flex-1">
      <BoardClient roomId={roomId} />
    </div>
  );
}
