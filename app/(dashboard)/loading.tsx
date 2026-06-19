export default function DashboardLoading() {
  return (
    <div className="min-h-screen flex" style={{ background: '#F9FAFB' }}>
      <aside style={{ width: '256px', background: '#fff', borderRight: '0.5px solid #E5E7EB', padding: '1.25rem' }} className="hidden lg:block">
        <div className="skeleton-pulse" style={{ width: '100px', height: '28px', marginBottom: '32px' }} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="skeleton-pulse" style={{ width: '100%', height: '36px' }} />
          ))}
        </div>
      </aside>
      <div className="flex-1 p-4 lg:p-8">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="skeleton-pulse" style={{ width: '240px', height: '28px' }} />
          <div className="skeleton-pulse" style={{ width: '100%', height: '200px' }} />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="skeleton-pulse" style={{ height: '120px' }} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
