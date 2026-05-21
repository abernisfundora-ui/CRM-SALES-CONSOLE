const skills = [
  { name: 'Closing', value: 82 },
  { name: 'Prospecting', value: 74 },
  { name: 'Follow-up', value: 91 }
];

export function SkillBars() {
  return (
    <section className="glass-card p-5">
      <p className="subtle-label mb-4">Skills</p>
      <div className="space-y-3">
        {skills.map((skill) => (
          <div key={skill.name}>
            <div className="mb-1 flex justify-between text-sm">
              <span>{skill.name}</span>
              <span className="text-slate-400">{skill.value}%</span>
            </div>
            <div className="h-2 rounded-full bg-white/10">
              <div className="h-2 rounded-full bg-gradient-to-r from-brand-500 to-cyan-400" style={{ width: `${skill.value}%` }} />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
