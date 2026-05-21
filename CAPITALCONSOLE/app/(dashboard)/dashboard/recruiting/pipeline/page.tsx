import { RecruitingPipeline } from '@/components/recruiting/RecruitingPipeline';

export default function RecruitingPipelinePage() {
  return (
    <div className="space-y-4 animate-slide-up">
      <section>
        <h2>Recruiting Pipeline</h2>
        <p className="text-sm text-slate-400">Pipeline-focused ATS view for managers and recruiting secretaries.</p>
      </section>
      <RecruitingPipeline />
    </div>
  );
}
