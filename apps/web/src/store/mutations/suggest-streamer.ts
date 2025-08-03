import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { API_URL } from '@/lib/constants';

export const useSuggestStreamer = () => {
  return useMutation({
    mutationFn: async (data: {
      name: string;
      twitchUsername: string;
      kickUsername: string;
    }) => {
      const response = await fetch(`${API_URL}/api/streamers/suggest`, {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        throw new Error('Failed to suggest streamer');
      }
      return response.json();
    },
    onSuccess: () => {
      toast.success('Streamer suggested, thank you!');
    },
    onError: () => {
      toast.error('Failed to suggest streamer, please try again.');
    },
  });
};
