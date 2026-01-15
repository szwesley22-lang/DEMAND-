
export const notificationService = {
  /**
   * Solicita permissão ao usuário para enviar notificações
   */
  requestPermission: async (): Promise<boolean> => {
    if (!('Notification' in window)) {
      console.warn("Este navegador não suporta notificações desktop.");
      return false;
    }

    if (Notification.permission === 'granted') return true;

    const permission = await Notification.requestPermission();
    return permission === 'granted';
  },

  /**
   * Envia uma notificação visual
   */
  send: (title: string, body: string) => {
    if (!('Notification' in window) || Notification.permission !== 'granted') {
      return;
    }

    try {
      const options = {
        body,
        icon: 'https://cdn-icons-png.flaticon.com/512/3067/3067451.png', // Ícone genérico de alerta/zap
        badge: 'https://cdn-icons-png.flaticon.com/512/3067/3067451.png',
        silent: false,
      };

      new Notification(`DEMAND+: ${title}`, options);
    } catch (error) {
      console.error("Erro ao disparar notificação:", error);
    }
  },

  /**
   * Verifica o status atual da permissão
   */
  getPermissionStatus: () => {
    if (!('Notification' in window)) return 'unsupported';
    return Notification.permission;
  }
};
