import { Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useLanguage } from '@/components/language-provider';

export function LanguageToggle() {
  const { language, setLanguage } = useLanguage();

  const languages = [
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
    { code: 'en', name: 'English', flag: '🇺🇸' }
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="icon"
          className="bg-background/50 backdrop-blur-md border-border/50 hover:bg-background/80 transition-all duration-300"
          data-testid="button-language-toggle"
        >
          <Globe className="h-[1.2rem] w-[1.2rem]" />
          <span className="sr-only">Switch language</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[140px]">
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => setLanguage(lang.code as 'de' | 'en')}
            className={`flex items-center space-x-2 cursor-pointer ${
              language === lang.code ? 'bg-accent text-accent-foreground' : ''
            }`}
          >
            <span className="text-lg">{lang.flag}</span>
            <span className="text-sm">{lang.name}</span>
            {language === lang.code && (
              <span className="ml-auto text-xs text-muted-foreground">✓</span>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}