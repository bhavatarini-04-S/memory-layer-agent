function DashboardCard({ title, value }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition">
      <h3 className="text-gray-600 text-sm font-medium mb-2">{title}</h3>
      <p className="text-3xl font-bold text-indigo-600">{value}</p>
    </div>
  );
}

export default DashboardCard;
