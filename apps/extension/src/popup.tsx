import './index.css';
import logo from 'data-base64:~assets/logo.svg';
import { Loader2, Search, X } from 'lucide-react';
import { useRef, useState } from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Toaster } from '@/components/ui/sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Footer } from './components/molecules/footer';
import { SettingsDialog } from './components/molecules/settings';
import { StreamerList } from './components/molecules/streamer-list';
import { Button } from './components/ui/button';
import { Card, CardContent } from './components/ui/card';
import { Input } from './components/ui/input';
import { useSearch } from './hooks/use-search';
import { useStreamers } from './hooks/use-streamers';
import { APP_NAME } from './lib/constants';
import { cn } from './lib/utils';

function StreamersPopup() {
  const [toggleSearch, setToggleSearch] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const { data: streamersData, isLoading } = useStreamers();
  const streamers = streamersData?.streamers || [];
  const { search, results } = useSearch(streamers, {
    keys: ['name', 'twitchUsername', 'kickUsername', 'category', 'title'],
    threshold: 0.3,
  });

  return (
    <div className="background space-y-6 p-6 font-sans text-primary w-[450px] h-[600px] flex flex-col items-center bg-background overflow-hidden">
      <div className="w-full flex flex-row justify-between">
        <img alt={APP_NAME} src={logo} />
      </div>
      {isLoading ? (
        <div className="w-full h-full flex flex-col items-center justify-center">
          <Loader2 className="size-4 animate-spin" />
        </div>
      ) : (
        <Tabs className="w-full" defaultValue="all">
          <div className="flex flex-row justify-between items-start">
            <div
              className={cn(
                'flex flex-row justify-start',
                toggleSearch && 'hidden'
              )}
            >
              <TabsList className="w-full border border-input">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="favorites">Favorites</TabsTrigger>
                <TabsTrigger value="offline">Offline</TabsTrigger>
              </TabsList>
            </div>
            <div
              className={cn(
                'flex flex-row justify-center gap-4',
                toggleSearch && 'w-full'
              )}
            >
              <Button
                onClick={() => {
                  setToggleSearch(!toggleSearch);
                  if (inputRef) {
                    inputRef.current?.focus();
                  }
                }}
                size="icon"
                variant="outline"
              >
                {toggleSearch ? (
                  <X className="size-4" />
                ) : (
                  <Search className="size-4" />
                )}
              </Button>

              {toggleSearch && (
                <div className="w-full">
                  <Input
                    autoFocus
                    className="h-11"
                    icon={<Search className="size-4" />}
                    onChange={(e) => search(e.target.value)}
                    placeholder="Search"
                    type="text"
                  />
                </div>
              )}
            </div>
          </div>

          <div className="w-full h-full">
            <TabsContent className="w-full" value="all">
              <Card className="w-full h-full">
                <CardContent>
                  <StreamerList streamers={results} />
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent className="w-full" value="favorites">
              <Card className="w-full h-full">
                <CardContent>
                  <StreamerList favoriteOnly streamers={results} />
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="offline">
              <Card className="w-full h-full">
                <CardContent>
                  <StreamerList offlineOnly streamers={results} />{' '}
                </CardContent>
              </Card>
            </TabsContent>
          </div>
          <div className="w-full flex flex-row justify-between items-start">
            <Footer />
            <SettingsDialog />
          </div>
        </Tabs>
      )}
    </div>
  );
}

const queryClient = new QueryClient();

function Popup() {
  return (
    <QueryClientProvider client={queryClient}>
      <StreamersPopup />
      <Toaster position="top-center" />
    </QueryClientProvider>
  );
}

export default Popup;
