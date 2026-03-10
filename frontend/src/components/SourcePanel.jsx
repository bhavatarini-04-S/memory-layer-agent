function SourcePanel({ sources }) {
  return (
    <div className="h-full bg-gray-50 p-6">
      <h3 className="text-lg font-bold text-gray-800 mb-4">Sources</h3>
      <p className="text-sm text-gray-500 mb-4">
        Documents and emails used in this conversation
      </p>

      {sources && sources.length > 0 ? (
        <div className="space-y-3">
          {sources.map((s, i) => (
            <div
              key={i}
              className="bg-white p-4 rounded-lg border border-gray-200 hover:border-indigo-300 hover:shadow-md transition cursor-pointer"
            >
              <div className="flex items-start space-x-2">
                <span className="text-xl">
                  {s.includes('.pdf') ? '📄' : s.includes('Email') ? '📧' : '📁'}
                </span>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800 break-words">
                    {s}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center text-gray-400 mt-10">
          <div className="text-4xl mb-2">📚</div>
          <p className="text-sm">No sources yet</p>
        </div>
      )}
    </div>
  );
}

export default SourcePanel;