import { Button } from '@lgamila/design-system/components/ui/button';
import { AiOutlineChrome } from 'react-icons/ai';
import { FaBraveReverse } from 'react-icons/fa6';
import { RiFirefoxLine } from 'react-icons/ri';
import { SiOperagx } from 'react-icons/si';
import { TbBrandEdge } from 'react-icons/tb';

export const DownloadExtension = () => {
  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <div className="space-x-4">
        <Button
          className="w-fit mt-4"
          onClick={() => {
            window.open('/chrome', '_blank');
          }}
          variant="outline"
        >
          <AiOutlineChrome className="size-4" />
          Download for Chrome
        </Button>
        <Button
          className="w-fit mt-4"
          onClick={() => {
            window.open('/firefox', '_blank');
          }}
          variant="outline"
        >
          <RiFirefoxLine className="size-4" />
          Download for Firefox
        </Button>
      </div>
      <div className="text-sm text-muted-foreground">
        Also works for these browsers:
      </div>
      <div className="flex flex-row items-center justify-center gap-2">
        <Button
          icon={<FaBraveReverse className="size-4" />}
          variant="outline"
        />
        <Button icon={<SiOperagx className="size-4" />} variant="outline" />{' '}
        <Button icon={<TbBrandEdge className="size-4" />} variant="outline" />
      </div>
    </div>
  );
};
