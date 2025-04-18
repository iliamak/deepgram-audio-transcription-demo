import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { LANGUAGE_OPTIONS, type Language } from '@/types/language';

interface LanguageSelectorProps {
  language: Language;
  onLanguageChange: (value: Language) => void;
}

export function LanguageSelector({
  language,
  onLanguageChange,
}: LanguageSelectorProps) {
  return (
    <div className="mb-4">
      <div className="flex items-center gap-2 mb-1.5">
        <Label htmlFor="language-select">Язык распознавания</Label>
      </div>
      <Select
        value={language}
        onValueChange={(value) => onLanguageChange(value as Language)}
      >
        <SelectTrigger id="language-select" className="w-[180px]">
          <SelectValue placeholder="Выберите язык" />
        </SelectTrigger>
        <SelectContent>
          {LANGUAGE_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}