'use client';

import { Bell, Check, Loader as Loader2, TriangleAlert as AlertTriangle } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui';
import { getAppDataClient, type NotificationItem } from '@/lib/app-data';

type Notification = NotificationItem;

const typeLabel: Record<Notification['notification_type'], string> = {
  report_available: 'Relatorio disponivel',
  access_granted: 'Acesso concedido',
  export_ready: 'Exportacao pronta',
  alert: 'Alerta',
};

const typeBadge: Record<
  Notification['notification_type'],
  'default' | 'success' | 'warning' | 'danger'
> = {
  report_available: 'default',
  access_granted: 'success',
  export_ready: 'success',
  alert: 'warning',
};

export function NotificationsList() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadNotifications = useCallback(async () => {
    const client = getAppDataClient();

    setIsLoading(true);
    setErrorMessage(null);
    try {
      setNotifications(await client.listNotifications());
    } catch {
      setErrorMessage('Nao foi possivel carregar as notificacoes.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadNotifications();
  }, [loadNotifications]);

  async function markAsRead(id: string) {
    const client = getAppDataClient();

    try {
      await client.markNotificationAsRead(id);
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === id ? { ...n, is_read: true, read_at: new Date().toISOString() } : n,
        ),
      );
    } catch {
      alert('Erro ao marcar notificacao como lida.');
    }
  }

  async function markAllAsRead() {
    const unread = notifications.filter((n) => !n.is_read);
    if (unread.length === 0) return;

    const client = getAppDataClient();

    try {
      const ids = unread.map((n) => n.id);
      await client.markAllNotificationsAsRead(ids);
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, is_read: true, read_at: n.read_at ?? new Date().toISOString() })),
      );
    } catch {
      alert('Erro ao marcar notificacoes como lidas.');
    }
  }

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  if (isLoading) {
    return (
      <Card className="border-dashed text-center">
        <CardHeader>
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-blue-700" aria-hidden="true" />
          <CardTitle>Carregando notificacoes</CardTitle>
        </CardHeader>
      </Card>
    );
  }

  if (errorMessage && notifications.length === 0) {
    return (
      <Card className="border-amber-200 bg-amber-50 text-center">
        <CardHeader>
          <AlertTriangle className="mx-auto h-8 w-8 text-amber-700" aria-hidden="true" />
          <CardTitle>{errorMessage}</CardTitle>
        </CardHeader>
      </Card>
    );
  }

  return (
    <section className="space-y-6" aria-labelledby="notifications-title">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-700">
              Notificacoes
            </p>
            <h1
              id="notifications-title"
              className="mt-3 text-3xl font-bold tracking-tight text-slate-950"
            >
              Central de notificacoes
            </h1>
            <p className="mt-4 max-w-3xl text-sm leading-6 text-slate-600">
              Acompanhe alertas, concessoes de acesso, exportacoes concluidas e outros avisos
              importantes.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                Nao lidas
              </p>
              <p className="mt-2 text-3xl font-bold text-slate-950">{unreadCount}</p>
            </div>
            {unreadCount > 0 && (
              <Button variant="outline" onClick={() => void markAllAsRead()}>
                <Check className="mr-2 h-4 w-4" /> Marcar todas como lidas
              </Button>
            )}
          </div>
        </div>
      </div>

      {notifications.length === 0 ? (
        <Card className="border-dashed text-center">
          <CardHeader>
            <Bell className="mx-auto h-8 w-8 text-slate-400" aria-hidden="true" />
            <CardTitle>Nenhuma notificacao</CardTitle>
            <CardDescription>Voce esta em dia com todas as notificacoes.</CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="space-y-3">
          {notifications.map((notification) => (
            <Card
              key={notification.id}
              className={notification.is_read ? 'opacity-70' : 'border-l-4 border-l-blue-500'}
            >
              <CardContent className="flex items-start gap-4 p-5">
                <div className="mt-1 shrink-0">
                  <Badge variant={typeBadge[notification.notification_type]}>
                    {typeLabel[notification.notification_type]}
                  </Badge>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-slate-950">{notification.title}</p>
                  <p className="mt-1 text-sm text-slate-600">{notification.message}</p>
                  <p className="mt-2 text-xs text-slate-400">
                    {formatDate(notification.created_at)}
                  </p>
                </div>
                {!notification.is_read && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => void markAsRead(notification.id)}
                    aria-label="Marcar como lida"
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </section>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(
    new Date(value),
  );
}
