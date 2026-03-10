function DashboardCard({title, value}) {

  return (
    <div className="bg-white shadow p-4 rounded">

      <h3 className="text-lg">{title}</h3>

      <p className="text-2xl font-bold">
        {value}
      </p>

    </div>
  );
}

export default DashboardCard;