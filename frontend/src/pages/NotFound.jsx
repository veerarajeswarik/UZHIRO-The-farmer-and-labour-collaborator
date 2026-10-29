import { Compass } from 'lucide-react';
import Page from '../components/Page';
import PageHeader from '../components/PageHeader';
import Card from '../components/Card';
import Button from '../components/Button';
import EmptyState from '../components/EmptyState';

function NotFound() {
  return (
    <Page>
      <PageHeader title="Page not found" description="The page you're looking for doesn't exist or may have moved." />
      <Card>
        <EmptyState
          icon={Compass}
          title="Let's get you back on track"
          description="Use the menu, or head back to the start."
          action={<Button to="/">Back to home</Button>}
        />
      </Card>
    </Page>
  );
}

export default NotFound;
