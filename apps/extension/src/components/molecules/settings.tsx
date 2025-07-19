import { zodResolver } from '@hookform/resolvers/zod';
import { useStorage } from '@plasmohq/storage/hook';
import { Save, Settings, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { Button } from '../ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';

const formSchema = z.object({
  autoRedirect: z.boolean().default(true),
});

export function SettingsDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [settings, setSettings, { setStoreValue }] = useStorage(
    'settings',
    (v) => (v === undefined ? { autoRedirect: true } : v)
  );

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      autoRedirect: settings.autoRedirect,
    },
  });

  useEffect(() => {
    form.reset(settings);
  }, [settings, form]);

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    setStoreValue(values);
    toast.success('Settings saved');
    setIsOpen(false);
  };

  return (
    <Dialog onOpenChange={setIsOpen} open={isOpen}>
      <DialogTrigger asChild>
        <Button className="mt-2" size="iconSm" variant="ghost">
          <Settings className="size-4" />
        </Button>
      </DialogTrigger>
      <Form {...form}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-white">LGamila Settings</DialogTitle>
            <DialogDescription>HHH lol</DialogDescription>
          </DialogHeader>

          <FormField
            control={form.control}
            name="autoRedirect"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between">
                <div className="space-y-0.5">
                  <FormLabel>Auto Redirect</FormLabel>
                  <FormDescription>
                    Automatically redirect between streaming platform when
                    streamer is live on the other.
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    aria-readonly
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <DialogFooter>
            <div className="flex flex-row gap-2 w-full justify-end">
              <Button
                className="w-fit h-9"
                onClick={() => {
                  form.reset();
                  setIsOpen(false);
                }}
                size="sm"
                type="reset"
                variant="outline"
              >
                <X className="size-4" />
                Cancel
              </Button>
              <Button
                className="w-fit"
                disabled={!form.formState.isDirty}
                icon={<Save className="size-4" />}
                onClick={() => {
                  form.handleSubmit(onSubmit)();
                }}
                size="sm"
                type="submit"
              >
                Save
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Form>
    </Dialog>
  );
}
