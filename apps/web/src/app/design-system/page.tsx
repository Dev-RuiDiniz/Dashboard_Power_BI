import { Header } from '@/components/layout/header';
import { Sidebar } from '@/components/layout/sidebar';
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui';

export default function DesignSystemPage() {
  return (
    <main className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <Sidebar activePath="/design-system" />
        <section className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-10">
          <div>
            <Badge>Preview visual</Badge>
            <h1 className="mt-4 text-3xl font-bold tracking-tight text-foreground">Design system base</h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">
              Tokens, componentes e padrões visuais iniciais para relatórios, dashboards e administração.
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Botões e inputs</CardTitle>
              <CardDescription>Variações principais para ações e formulários.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-5 md:grid-cols-2">
              <div className="flex flex-wrap gap-3">
                <Button>Primário</Button>
                <Button variant="secondary">Secundário</Button>
                <Button variant="outline">Contorno</Button>
                <Button variant="ghost">Ghost</Button>
              </div>
              <Input label="Nome do relatório" placeholder="Indicadores financeiros" helperText="Use nomes claros e rastreáveis." />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tabela</CardTitle>
              <CardDescription>Estrutura inicial para listagens administrativas.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Relatório</TableHead>
                    <TableHead>Responsável</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>Financeiro</TableCell>
                    <TableCell>Controladoria</TableCell>
                    <TableCell>Publicado</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </section>
      </div>
    </main>
  );
}
