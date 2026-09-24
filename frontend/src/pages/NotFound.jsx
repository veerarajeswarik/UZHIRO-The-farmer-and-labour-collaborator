import { Compass } from 'lucide-react';
import Button from '../components/Button';
import EmptyState from '../components/EmptyState';

function NotFound() {
  return (
    <div className="container" style={{ padding: '5rem 0' }}>
      <EmptyState
        icon={Compass}
        title="Page not found"
        description="The page you're looking for doesn't exist or may have moved."
        action={<Button to="/">Back to home</Button>}
      />
    </div>
  );
}

export default NotFound;
