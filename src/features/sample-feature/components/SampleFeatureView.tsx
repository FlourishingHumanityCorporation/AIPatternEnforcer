import * as React from 'react';
import { SamplefeatureProvider } from '../store';
import { useSamplefeature } from '../hooks';
import styles from './Samplefeature.module.css';

interface SamplefeatureViewProps {
  id?: string;
}

function SamplefeatureContent({ id }: SamplefeatureViewProps) {
  const { data, loading, error, fetchSamplefeature } = useSamplefeature();

  React.useEffect(() => {
    if (id) {
      fetchSamplefeature(id);
    }
  }, [id, fetchSamplefeature]);

  if (loading) return <div className={styles.loading}>Loading SampleFeature...</div>;
  if (error) return <div className={styles.error}>Error: {error.message}</div>;
  if (!data) return <div className={styles.empty}>No SampleFeature data available</div>;

  return (
    <div className={styles.container}>
      <h2>Samplefeature Details</h2>
      <pre className={styles.data}>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}

export function SamplefeatureView(props: SamplefeatureViewProps) {
  return (
    <SamplefeatureProvider>
      <SamplefeatureContent {...props} />
    </SamplefeatureProvider>
  );
}