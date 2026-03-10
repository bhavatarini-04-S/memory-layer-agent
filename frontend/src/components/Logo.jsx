const Logo = ({ size = 'md', showText = true }) => {
  const sizes = {
    sm: { width: 'w-10 h-10', icon: 'w-8 h-8' },
    md: { width: 'w-16 h-16', icon: 'w-12 h-12' },
    lg: { width: 'w-24 h-24', icon: 'w-20 h-20' },
    xl: { width: 'w-32 h-32', icon: 'w-24 h-24' }
  };

  const currentSize = sizes[size];

  return (
    <div className="flex items-center gap-3">
      {/* Logo Icon - Brain with Envelope */}
      <div className={`${currentSize.width} relative flex items-center justify-center`}>
        <svg viewBox="0 0 200 200" className={currentSize.icon} xmlns="http://www.w3.org/2000/svg">
          {/* Circular Border */}
          <circle cx="100" cy="100" r="95" fill="none" stroke="url(#gradient)" strokeWidth="4"/>
          
          {/* Gradient Definition */}
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" className="stop-indigo" style={{stopColor: '#6366f1'}} />
              <stop offset="100%" className="stop-purple" style={{stopColor: '#a855f7'}} />
            </linearGradient>
          </defs>
          
          {/* Brain Icon */}
          <g transform="translate(40, 20)">
            {/* Left Brain Hemisphere */}
            <path d="M 30 20 Q 10 20 10 40 Q 10 50 15 55 Q 10 60 10 70 Q 10 85 25 90 Q 20 95 25 100 Q 30 105 40 100" 
                  fill="none" stroke="#ffffff" strokeWidth="3" strokeLinecap="round"/>
            
            {/* Right Brain Hemisphere */}
            <path d="M 90 20 Q 110 20 110 40 Q 110 50 105 55 Q 110 60 110 70 Q 110 85 95 90 Q 100 95 95 100 Q 90 105 80 100" 
                  fill="none" stroke="#ffffff" strokeWidth="3" strokeLinecap="round"/>
            
            {/* Brain Connection Lines */}
            <line x1="40" y1="35" x2="80" y2="35" stroke="#ffffff" strokeWidth="2"/>
            <line x1="35" y1="55" x2="85" y2="55" stroke="#ffffff" strokeWidth="2"/>
            <line x1="40" y1="75" x2="80" y2="75" stroke="#ffffff" strokeWidth="2"/>
          </g>
          
          {/* Envelope Icon */}
          <g transform="translate(50, 90)">
            {/* Envelope Body */}
            <rect x="0" y="0" width="100" height="60" rx="4" fill="#ffffff" stroke="#6366f1" strokeWidth="3"/>
            
            {/* Envelope Flap */}
            <path d="M 0 0 L 50 35 L 100 0" fill="none" stroke="#6366f1" strokeWidth="3" strokeLinejoin="round"/>
            <path d="M 0 0 L 50 35 L 100 0 L 100 60 L 0 60 Z" fill="none" stroke="#6366f1" strokeWidth="3"/>
          </g>
        </svg>
      </div>
      {showText && (
        <div className="flex flex-col">
          <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent dark:from-indigo-400 dark:to-purple-400">
            InboxAI
          </h1>
          <p className="text-xs text-gray-600 dark:text-gray-400">
            AI that manages your inbox
          </p>
        </div>
      )}
    </div>
  );
};

export default Logo;
