const CaseSummary = ({ cases }) => {
  const summaries = computeCaseSummaries(cases);

  return (
    <div className="bg-white p-4 rounded-2xl shadow-md mb-6 w-full grid grid-cols-3 gap-4 text-sm">
      {Object.entries(summaries).map(([status, total]) => (
        <div
          key={status}
          className="border rounded-xl p-4 text-center flex flex-col items-center justify-center"
        >
          <span className="font-semibold">{status}</span>
          <span className="text-orange-600 font-bold text-lg">₹{total.toFixed(2)}</span>
        </div>
      ))}
    </div>
  );
};
