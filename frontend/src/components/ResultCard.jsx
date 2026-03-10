function ResultCard({ result, onHighlight }) {
  const getFileIcon = (fileType) => {
    const icons = {
      pdf: '📄',
      docx: '📝',
      doc: '📝',
      txt: '📃',
      csv: '📊',
    };
    return icons[fileType?.toLowerCase()] || '📁';
  };

  const getScoreColor = (score) => {
    if (score >= 0.8) return 'text-green-600 bg-green-50';
    if (score >= 0.6) return 'text-yellow-600 bg-yellow-50';
    return 'text-gray-600 bg-gray-50';
  };

  const highlightText = (text) => {
    // Simple highlighting - in production, use a library like react-highlight-words
    return text;
  };

  return (
    <div className="card hover:border-primary border-2 border-transparent transition-all duration-200">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          <span className="text-3xl">{getFileIcon(result.file_type)}</span>
          <div>
            <h3 className="font-semibold text-textPrimary text-lg">
              {result.filename}
            </h3>
            <div className="flex items-center space-x-2 mt-1">
              <span className="badge bg-indigo-50 text-primary">
                {result.source}
              </span>
              {result.file_type && (
                <span className="badge bg-gray-100 text-textSecondary">
                  {result.file_type.toUpperCase()}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Relevance Score */}
        <div className={`px-3 py-1 rounded-lg font-semibold ${getScoreColor(result.score)}`}>
          {(result.score * 100).toFixed(0)}% match
        </div>
      </div>

      {/* Content Preview */}
      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
        <p className="text-textSecondary text-sm leading-relaxed">
          {highlightText(result.content)}
        </p>
      </div>

      {/* Metadata */}
      {result.upload_date && (
        <div className="mt-3 text-xs text-textSecondary">
          Uploaded: {new Date(result.upload_date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </div>
      )}
    </div>
  );
}

export default ResultCard;
