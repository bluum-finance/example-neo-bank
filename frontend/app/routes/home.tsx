import { Link } from 'react-router';
import type { Route } from './+types/home';
import { Button } from '~/components/ui/button';

export function meta({}: Route.MetaArgs) {
  return [{ title: 'Home' }, { name: 'description', content: 'Welcome to Neo Bank!' }];
}

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="text-center space-y-6">
        <h1 className="text-4xl font-bold">Welcome to Neo Bank</h1>
        <p className="text-muted-foreground">Your modern banking experience starts here</p>
        <div className="flex gap-4 justify-center">
          <Button asChild>
            <Link to="/signin">Sign In</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
