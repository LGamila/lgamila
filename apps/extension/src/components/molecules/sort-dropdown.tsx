import type { SortOption } from '@/lib/types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';

interface SortDropdownProps {
  value: SortOption;
  onChange: (value: SortOption) => void;
}

export function SortDropdown({ value, onChange }: SortDropdownProps) {
  return (
    <Select
      defaultValue="default"
      onValueChange={(value) => onChange(value as SortOption)}
      value={value}
    >
      <SelectTrigger>
        <SelectValue placeholder="Sort by" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="default">Default (Live first)</SelectItem>
        <SelectItem value="viewers-desc">Most viewers first</SelectItem>
        <SelectItem value="viewers-asc">Least viewers first</SelectItem>
        <SelectItem value="name-asc">Name (A-Z)</SelectItem>
        <SelectItem value="name-desc">Name (Z-A)</SelectItem>
      </SelectContent>
    </Select>
  );
}
