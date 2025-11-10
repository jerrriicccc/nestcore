// Test script for the register endpoint
const testData = {
  email: 'test@example.com',
  password: 'TestPassword123!',
  phonenumber: '+1234567890',
  birthdate: '1990-01-01',
  defaultroleid: 2,
};

fetch('http://localhost:3000/auth/register', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  body: JSON.stringify(testData),
})
  .then((response) => {
    console.log('Status:', response.status);
    return response.json();
  })
  .then((data) => {
    console.log('Response:', JSON.stringify(data, null, 2));
  })
  .catch((error) => {
    console.error('Error:', error);
  });
