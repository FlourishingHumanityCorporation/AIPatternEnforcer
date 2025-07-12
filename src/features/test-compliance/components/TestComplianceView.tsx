import * as React from 'react';
import { TestcomplianceProvider } from '../store';
import { useTestcompliance } from '../hooks';
import styles from './Testcompliance.module.css';

interface TestcomplianceViewProps {
  id?: string;
}

function TestcomplianceContent({ id }: TestcomplianceViewProps) {
  const { data, loading, error, fetchTestcompliance } = useTestcompliance();

  React.useEffect(() => {
    if (id) {
      fetchTestcompliance(id);
    }
  }, [id, fetchTestcompliance]);

  if (loading) return <div className={styles.loading}>Loading TestCompliance...</div>;
  if (error) return <div className={styles.error}>Error: {error.message}</div>;
  if (!data) return <div className={styles.empty}>No TestCompliance data available</div>;

  return (
    <div className={styles.container}>
      <h2>Testcompliance Details</h2>
      <pre className={styles.data}>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}

export function TestcomplianceView(props: TestcomplianceViewProps) {
  return (
    <TestcomplianceProvider>
      <TestcomplianceContent {...props} />
    </TestcomplianceProvider>
  );
}