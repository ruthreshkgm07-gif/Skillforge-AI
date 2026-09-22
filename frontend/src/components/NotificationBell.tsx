import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, Check, ExternalLink, Sparkles, Briefcase, Map, Award } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  linkUrl: string;
  createdAt: string;
}

interface NotificationSummary {
  unreadCount: number;
  notifications: NotificationItem[];
}

export const NotificationBell: React.FC = () => {
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState<boolean>(false);

  // Poll notifications every 15 seconds using refetchInterval
  const { data } = useQuery<any>({
    queryKey: ['in-app-notifications'],
    queryFn: () => apiClient.get('/notifications'),
    refetchInterval: 15000,
  });

  const markReadMutation = useMutation({
    mutationFn: (id: string) => apiClient.put(`/notifications/${id}/read`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['in-app-notifications'] });
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: () => apiClient.put('/notifications/read-all'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['in-app-notifications'] });
    },
  });

  const summary: NotificationSummary = data?.data || { unreadCount: 0, notifications: [] };

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        className="relative h-9 w-9 rounded-xl hover:bg-secondary"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="In-app Notifications"
      >
        <Bell className="h-4 w-4" />
        {summary.unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white shadow-xs">
            {summary.unreadCount}
          </span>
        )}
      </Button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl border bg-card/95 backdrop-blur-md p-4 shadow-xl z-50 space-y-3"
          >
            <div className="flex items-center justify-between border-b pb-2">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm">Notifications</span>
                {summary.unreadCount > 0 && (
                  <Badge variant="default" className="text-[10px]">
                    {summary.unreadCount} Unread
                  </Badge>
                )}
              </div>

              {summary.unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 text-[11px] text-primary"
                  onClick={() => markAllReadMutation.mutate()}
                >
                  Mark all as read
                </Button>
              )}
            </div>

            <div className="max-h-80 overflow-y-auto space-y-2 pr-1">
              {summary.notifications.length === 0 ? (
                <p className="text-center py-6 text-xs text-muted-foreground">No new notifications</p>
              ) : (
                summary.notifications.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => !n.isRead && markReadMutation.mutate(n.id)}
                    className={`p-3 rounded-xl border transition-all text-xs space-y-1 cursor-pointer ${
                      n.isRead ? 'bg-secondary/20 border-transparent opacity-75' : 'bg-primary/5 border-primary/20'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <span className="font-bold text-foreground line-clamp-1">{n.title}</span>
                      {!n.isRead && <span className="h-2 w-2 rounded-full bg-primary shrink-0 mt-1" />}
                    </div>
                    <p className="text-muted-foreground text-[11px] leading-relaxed">{n.message}</p>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationBell;
