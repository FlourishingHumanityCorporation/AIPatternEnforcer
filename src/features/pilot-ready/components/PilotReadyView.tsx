import * as React from 'react';
import { PilotreadyProvider } from '../store';
import { usePilotready } from '../hooks';
import styles from './Pilotready.module.css';

interface PilotreadyViewProps {
  id?: string;
}

function PilotreadyContent({ id }: PilotreadyViewProps) {
  const { data, loading, error, fetchPilotready } = usePilotready();

  React.useEffect(() => {
    if (id) {
      fetchPilotready(id);
    }
  }, [id, fetchPilotready]);

  if (loading) return <div className={styles.loading}>Loading PilotReady...</div>;
  if (error) return <div className={styles.error}>Error: {error.message}</div>;
  if (!data) return <div className={styles.empty}>No PilotReady data available</div>;

  return (
    <div className={styles.container}>
      <h2>Pilotready Details</h2>
      <pre className={styles.data}>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}

export function PilotreadyView(props: PilotreadyViewProps) {
  return (
    <PilotreadyProvider>
      <PilotreadyContent {...props} />
    </PilotreadyProvider>
  );
}