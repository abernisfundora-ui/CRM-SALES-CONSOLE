export default function UserProfilePage({ params }: { params: { userId: string } }) {
  return <div className="glass-card p-6">Player card for user {params.userId}</div>;
}
