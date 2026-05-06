const StatCard = ({ label, value, icon: Icon, color }) => (
  <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100
   flex items-center justify-between">
    <div>
      <p className="text-slate-500 text-xs font-bold  mb-1">{label}</p>
      <h3 className="text-3xl font-black text-slate-900">{value}</h3>
    </div>
    <div className={`p-4 rounded-2xl ${color}`}>
      <Icon className="text-white" size={28} />
    </div>
  </div>
);
export default StatCard