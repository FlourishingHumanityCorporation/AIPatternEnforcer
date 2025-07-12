// Test file for advanced log fixer
function processData(data) {
  console.log('Processing data:', data);
  
  if (!data) {
    console.error('No data provided');
    return null;
  }
  
  try {
    const result = transformData(data);
    console.info('Transform successful:', result);
    return result;
  } catch (error) {
    console.error('Transform failed:', error);
    throw error;
  }
}

function transformData(data) {
  console.debug('Transforming:', data);
  return data.map(item => item.toUpperCase());
}

module.exports = { processData };