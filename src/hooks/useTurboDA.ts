import { useState } from 'react';
import toast from 'react-hot-toast';

interface TurboDAResponse {
  success: boolean;
  data?: {
    id: string;
    status: string;
  };
  error?: string;
}

export const useTurboDA = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitToTurboDA = async (data: string): Promise<TurboDAResponse> => {
    setIsSubmitting(true);
    console.log('📤 TurboDA Client: Preparing submission:', {
      dataLength: data.length,
      preview: data.substring(0, 100) + '...'
    });
    
    try {
      console.log('🚀 TurboDA Client: Sending request to API route');
      const response = await fetch('/api/turbo-da', {
        method: 'POST',
        body: data
      });

      const result = await response.json();
      console.log('📥 TurboDA Client: Received response:', result);
      
      if (!result.success) {
        console.error('❌ TurboDA Client: Submission failed:', result.error);
        throw new Error(result.error || 'Failed to submit to TurboDA');
      }

      console.log('✅ TurboDA Client: Submission successful');
      toast.success('Successfully submitted to Avail TurboDA');
      return result;
    } catch (error) {
      console.error('💥 TurboDA Client: Error in submission:', {
        error: error instanceof Error ? error.message : error
      });
      toast.error('Failed to submit to Avail TurboDA');
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    submitToTurboDA,
    isSubmitting
  };
}; 