const StatsCard = ({ label, value, icon: Icon, color }) => (
  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
    <div className="flex items-center justify-between mb-3">
      <div className={`w-10 h-10 ${color} rounded-xl flex items-center justify-center text-white`}>
        <Icon size={20} />
      </div>
    </div>
    <div className="text-2xl font-bold text-gray-800">{value}</div>
    <div className="text-sm text-gray-500">{label}</div>
  </div>
);
export default StatsCard;
