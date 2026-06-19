import Spinner from '@/app/components/Spinner';

export default function AuthLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#F9FAFB' }}>
      <Spinner size="lg" color="#534AB7" />
    </div>
  );
}
