const StatCard = ({ label, value, icon: Icon, color, accent, detail }) => (
  <article className="kpi-card flex items-center justify-between gap-4">
    <div className="min-w-0">
      <p className="mb-1 text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">{label}</p>
      <h3 className="text-3xl font-black text-slate-900 tabular-nums">{value}</h3>
      {detail && <p className="mt-1 text-[11px] font-medium text-slate-400">{detail}</p>}
    </div>
    <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl shadow-lg shadow-emerald-100 ${color || accent || 'bg-emerald-600'}`}>
      <Icon className="text-white" size={21} />
    </div>
  </article>
);

export default StatCard;
