'use client';

import { useState, useEffect } from 'react';

export default function TestPage() {
  const [status, setStatus] = useState('Testing...');
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const runTest = async () => {
      try {
        // Test API connection
        const floorsResponse = await fetch('/api/floors');
        const tagsResponse = await fetch('/api/tags');
        
        if (floorsResponse.ok && tagsResponse.ok) {
          setStatus('API connection successful');
          setData({
            floors: await floorsResponse.json(),
            tags: await tagsResponse.json()
          });
        } else {
          setStatus('API connection failed, falling back to localStorage');
          // Test localStorage
          try {
            const storedFloors = localStorage.getItem('eventMapperFloors');
            const storedTags = localStorage.getItem('eventMapperTags');
            setData({
              floors: storedFloors ? JSON.parse(storedFloors) : 'No floors in localStorage',
              tags: storedTags ? JSON.parse(storedTags) : 'No tags in localStorage'
            });
            setStatus('Using localStorage fallback');
          } catch (error) {
            setStatus('Both API and localStorage failed');
            console.error('Test failed:', error);
          }
        }
      } catch (error) {
        setStatus('Test failed');
        console.error('Test failed:', error);
      }
    };

    runTest();
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Database Connection Test</h1>
      <p className="mb-4">Status: {status}</p>
      {data && (
        <div className="bg-gray-100 p-4 rounded">
          <h2 className="text-xl font-semibold mb-2">Data:</h2>
          <pre className="bg-white p-2 rounded overflow-auto max-h-96">
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}