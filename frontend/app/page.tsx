'use client';

import { useState } from 'react';
import SubwayLines from '@/components/SubwayLines';
import ChatInterface from '@/components/ChatInterface';
import StatusIndicator from '@/components/StatusIndicator';
import LoadingIndicator from '@/components/LoadingIndicator';

export default function Home() {
  const [selectedLine, setSelectedLine] = useState<string | null>(null);
  const [lineStatus, setLineStatus] = useState<{
    status: string;
    details: string;
    hasDelay: boolean;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleLineSelect = async (line: string) => {
    setSelectedLine(line);
    setIsLoading(true);
    
    try {
      const response = await fetch(`/api/status/${line}`);
      const data = await response.json();
      
      if (data.success) {
        setLineStatus(data.data);
      } else {
        console.error('Error fetching line status:', data.message);
        setLineStatus(null);
      }
    } catch (error) {
      console.error('Error fetching line status:', error);
      setLineStatus(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (message: string): Promise<string> => {
    try {
      const response = await fetch('/api/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: message }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        return data.response;
      } else {
        throw new Error(data.message || 'An error occurred');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      return 'Sorry, I encountered an error while processing your request. Please try again.';
    }
  };

  return (
    <main className="min-h-screen bg-gray-100">
      <header className="bg-blue-600 text-white py-6 border-b-4 border-orange-500">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold text-center">NYC Transit Assistant</h1>
        </div>
      </header>
      
      <div className="container mx-auto px-4 py-8">
        <SubwayLines onSelectLine={handleLineSelect} />
        
        {selectedLine && (
          <div className="bg-white rounded-lg shadow-md p-4 mb-6">
            <h2 className="text-xl font-semibold mb-2">
              Line {selectedLine} Status
            </h2>
            
            {isLoading ? (
              <LoadingIndicator />
            ) : lineStatus ? (
              <div>
                <p className="flex items-center mb-2">
                  <StatusIndicator hasDelay={lineStatus.hasDelay} />
                  <span className="font-medium">
                    {lineStatus.hasDelay ? 'Delayed' : 'Good Service'}
                  </span>
                </p>
                {lineStatus.hasDelay && lineStatus.details && (
                  <p className="text-gray-700">{lineStatus.details}</p>
                )}
              </div>
            ) : (
              <p className="text-gray-700">
                Unable to retrieve status information for line {selectedLine}.
              </p>
            )}
          </div>
        )}
        
        <ChatInterface onSendMessage={handleSendMessage} />
      </div>
    </main>
  );
}