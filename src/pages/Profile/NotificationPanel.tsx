
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  AlertCircle,
  Bell,
  Check,
  CheckCheck,
  PackageCheck,
  ShoppingBag,
  Truck,
  Info,
  MailCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/hooks/use-toast';

const NotificationPanel = () => {
  const { notifications, markNotificationAsRead, markAllNotificationsAsRead, refreshNotifications } = useAuth();
  const [isMarking, setIsMarking] = useState(false);

  useEffect(() => {
    refreshNotifications();
  }, [refreshNotifications]);

  const handleMarkAllAsRead = async () => {
    setIsMarking(true);
    await markAllNotificationsAsRead();
    toast({
      title: 'Notificações atualizadas',
      description: 'Todas as notificações foram marcadas como lidas.',
    });
    setIsMarking(false);
  };

  const getNotificationIcon = (type: string, read: boolean) => {
    const colorClass = read ? 'text-gray-400' : '';
    
    switch (type) {
      case 'order_placed':
        return <ShoppingBag className={`h-5 w-5 text-blue-500 ${colorClass}`} />;
      case 'order_shipped':
        return <Truck className={`h-5 w-5 text-purple-500 ${colorClass}`} />;
      case 'order_delivered':
        return <PackageCheck className={`h-5 w-5 text-green-500 ${colorClass}`} />;
      case 'order_completed':
        return <CheckCheck className={`h-5 w-5 text-green-600 ${colorClass}`} />;
      case 'account_created':
        return <MailCheck className={`h-5 w-5 text-teal-500 ${colorClass}`} />;
      case 'warning':
        return <AlertCircle className={`h-5 w-5 text-amber-500 ${colorClass}`} />;
      case 'error':
        return <AlertCircle className={`h-5 w-5 text-red-500 ${colorClass}`} />;
      case 'success':
        return <Check className={`h-5 w-5 text-green-500 ${colorClass}`} />;
      default:
        return <Info className={`h-5 w-5 text-gray-500 ${colorClass}`} />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    // Se for hoje
    if (date.toDateString() === today.toDateString()) {
      return `Hoje às ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
    }
    
    // Se for ontem
    if (date.toDateString() === yesterday.toDateString()) {
      return `Ontem às ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
    }
    
    // Outros dias
    return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()} às ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notificações
          </CardTitle>
          <CardDescription>
            Fique por dentro das atualizações sobre seus pedidos e conta.
          </CardDescription>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleMarkAllAsRead}
          disabled={isMarking || notifications.every(n => n.read)}
          className="gap-1"
        >
          {isMarking ? (
            <div className="h-3 w-3 animate-spin rounded-full border-2 border-t-transparent border-current"></div>
          ) : (
            <CheckCheck className="h-4 w-4" />
          )}
          Marcar todas como lidas
        </Button>
      </CardHeader>
      <CardContent>
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <Bell className="mb-2 h-10 w-10 text-gray-300" />
            <h3 className="text-lg font-medium">Nenhuma notificação</h3>
            <p className="text-sm text-muted-foreground">
              Você não tem notificações para visualizar no momento.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {notifications.map((notification, index) => (
              <div key={notification.id}>
                <div 
                  className={`flex cursor-pointer items-start gap-4 rounded-lg p-3 transition-colors hover:bg-muted/50 ${notification.read ? 'opacity-70' : 'bg-muted/30'}`}
                  onClick={() => {
                    if (!notification.read) {
                      markNotificationAsRead(notification.id);
                    }
                  }}
                >
                  <div className="mt-1">
                    {getNotificationIcon(notification.type, notification.read)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className={`font-medium ${notification.read ? 'text-gray-700' : 'text-foreground'}`}>
                        {notification.title}
                      </h4>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(notification.created_at)}
                      </span>
                    </div>
                    <p className={`text-sm ${notification.read ? 'text-gray-500' : 'text-muted-foreground'}`}>
                      {notification.message}
                    </p>
                  </div>
                </div>
                {index < notifications.length - 1 && <Separator className="my-4" />}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default NotificationPanel;
