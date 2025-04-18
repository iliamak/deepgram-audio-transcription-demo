import { Toaster } from "sonner";
import { ThemeProvider } from "./components/theme-provider";
import { AudioTranscription } from "./components/AudioTranscription";
import { UsageProvider } from "./contexts/usage-context";

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="transcription-demo-theme">
      <UsageProvider>
        <div className="min-h-screen bg-background">
          <main className="container mx-auto py-10">
            <h1 className="text-3xl font-bold text-center mb-6">Аудио Транскрипция с Deepgram</h1>
            <p className="text-muted-foreground text-center mb-10">
              Демо-версия сервиса расшифровки аудио с ограничением в 10 минут
            </p>
            
            <AudioTranscription />
          </main>
        </div>
        <Toaster position="bottom-right" />
      </UsageProvider>
    </ThemeProvider>
  );
}

export default App;
