const DataLoader = ({ message = "Chargement des données..." }) => (
  <div className="flex flex-col items-center justify-center min-h-[60vh] font-['Montserrat']">
    <div className="w-12 h-12 border-4 border-emerald-100 border-t-emerald-500 rounded-full animate-spin mb-4"></div>
    <p className="text-[10px] font-[900] text-slate-400 uppercase tracking-[0.2em] animate-pulse">
      {message}
    </p>
  </div>
);
export default DataLoader