import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Home } from 'lucide-react';

export default function NotFound() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-center p-8">
      <p className="text-8xl font-bold text-muted-foreground/20">404</p>
      <h1 className="text-2xl font-bold text-foreground">Página não encontrada</h1>
      <p className="text-muted-foreground">A rota que você acessou não existe.</p>
      <Button onClick={() => navigate('/')} className="gap-2 mt-4">
        <Home className="h-4 w-4" />
        Voltar ao início
      </Button>
    </div>
  );
}
