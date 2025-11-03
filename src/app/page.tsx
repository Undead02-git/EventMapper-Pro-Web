import { ClientOnlyMapLoader } from '@/components/client-only-map-loader';

export default function Home() {
  // The ClientOnlyMapLoader handles loading the main layout on the client
  // and initializes it with data from the database or initial data, showing a skeleton loader in the meantime.
  return <ClientOnlyMapLoader />;
}