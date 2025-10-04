import { useState, useEffect } from 'react';
import FileImport from './components/FileImport';
import MessageList from './components/MessageList';
import { db } from './db';

function App() {
  const [messageCount, setMessageCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadCount = async () => {
      const count = await db.sms.count();
      setMessageCount(count);
      setIsLoading(false);
    };
    loadCount();
  }, []);

  const handleImportComplete = (count) => {
    setMessageCount(count);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-xl text-gray-700">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            SMS Reader
          </h1>
          <p className="text-gray-600">
            Visualisez vos sauvegardes SMS Backup & Restore
          </p>
        </div>

        {messageCount === 0 ? (
          <FileImport onImportComplete={handleImportComplete} />
        ) : (
          <>
            <MessageList />
            <div className="mt-6">
              <FileImport onImportComplete={handleImportComplete} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default App;
