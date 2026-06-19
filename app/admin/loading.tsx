export default function AdminLoading() {
  return (
    <div className="min-h-screen flex" style={{ background: '#0F172A' }}>
      <aside style={{ width: '256px', background: '#1E293B', borderRight: '0.5px solid #334155', padding: '1.25rem' }} className="hidden lg:block">
        <div className="skeleton-pulse-dark" style={{ width: '120px', height: '20px', marginBottom: '32px' }} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="skeleton-pulse-dark" style={{ width: '100%', height: '36px' }} />
          ))}
        </div>
      </aside>
      <div className="flex-1 p-4 lg:p-8">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="skeleton-pulse-dark" style={{ width: '200px', height: '24px' }} />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="skeleton-pulse-dark" style={{ height: '120px' }} />
            ))}
          </div>
          <div className="skeleton-pulse-dark" style={{ width: '100%', height: '300px' }} />
        </div>
      </div>
    </div>
  );
}
