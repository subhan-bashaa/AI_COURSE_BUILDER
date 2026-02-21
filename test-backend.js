// Quick test script - Run this in browser console (F12)
// To test if backend is accessible

console.log('🔵 Testing backend connection...');

fetch('http://localhost:8000/health')
  .then(response => {
    console.log('✅ Health check status:', response.status);
    return response.json();
  })
  .then(data => {
    console.log('✅ Health check data:', data);
    return fetch('http://localhost:8000/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'test_' + Date.now(),
        email: `test${Date.now()}@example.com`,
        password: 'password123'
      })
    });
  })
  .then(response => {
    console.log('✅ Register status:', response.status);
    return response.json();
  })
  .then(data => {
    console.log('✅ Register data:', data);
  })
  .catch(error => {
    console.error('❌ Error:', error);
    console.error('❌ This means:', error.message);
    if (error.message === 'Failed to fetch') {
      console.error('❌ CAUSE: Backend is not accessible from browser');
      console.error('❌ FIX: Make sure Flask is running on http://localhost:8000');
    }
  });
