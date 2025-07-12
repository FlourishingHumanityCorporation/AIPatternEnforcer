import React from 'react';
import { Testfeature3Provider } from '../store';
import { useTestfeature3 } from '../hooks';
import styles from './Testfeature3.module.css';

interface Testfeature3ViewProps {
  id?: string;
}

function Testfeature3Content({ id }: Testfeature3ViewProps) {
  const { data, loading, error, fetchTestfeature3 } = useTestfeature3();

  React.useEffect(() => {
    if (id) {
      fetchTestfeature3(id);
    }
  }, [id, fetchTestfeature3]);

  if (loading) return <div className={styles.loading}>Loading TestFeature3...</div>;
  if (error) return <div className={styles.error}>Error: {error.message}</div>;
  if (!data) return <div className={styles.empty}>No TestFeature3 data available</div>;

  return (
    <div className={styles.container}>
      <h2>Testfeature3 Details</h2>
      <pre className={styles.data}>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}

export function Testfeature3View(props: Testfeature3ViewProps) {
  return (
    <Testfeature3Provider>
      <Testfeature3Content {...props} />
    </Testfeature3Provider>
  );
}