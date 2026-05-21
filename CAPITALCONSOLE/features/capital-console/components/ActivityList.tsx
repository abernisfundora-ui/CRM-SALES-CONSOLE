import { ActivityCard } from '@/features/capital-console/components/ActivityCard';
import type { ActivityItem } from '@/types/home-dashboard';

type ActivityListProps = {
  items: ActivityItem[];
};

export function ActivityList({ items }: ActivityListProps) {
  return (
    <section className="space-y-2.5">
      {items.map((item) => (
        <ActivityCard key={item.id} item={item} />
      ))}
    </section>
  );
}
