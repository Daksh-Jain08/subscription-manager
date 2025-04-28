const prisma = require('../../prisma');
const grpc = require('@grpc/grpc-js');

// Reminder gRPC controller
const reminderGrpcController = {
  CreateReminder: async (call, callback) => {
    try {
      const { userId, subscriptionId, title, description, reminderTime } = call.request;

      const reminder = await prisma.reminder.create({
        data: {
          userId,
          subscriptionId,
          title,
          description,
          reminderTime: new Date(reminderTime),
        },
      });

      const response = {
        reminderId: reminder.id,
        userId: reminder.userId,
        subscriptionId: reminder.subscriptionId,
        title: reminder.title,
        description: reminder.description,
        reminderTime: reminder.reminderTime.toISOString(),
        snoozeUntil: reminder.snoozeUntil ? reminder.snoozeUntil.toISOString() : null,
        enabled: reminder.enabled,
      }

      callback(null, response);
    } catch (error) {
      console.error('gRPC CreateReminder error:', error);
      callback(grpc.status.INTERNAL, null);
    }
  },

  UpdateReminder: async (call, callback) => {
    try {
        const { id, title, description, date, snoozeUntil } = call.request;
        const userId = call.request.userId;
        const reminder = await prisma.reminder.updateMany({
            where: { id, userId },
            data: { title, description, date: date ? new Date(date) : undefined, snoozeUntil: snoozeUntil ? new Date(snoozeUntil) : undefined }
        })
        if (reminder.count === 0) {
            return callback({
                code: grpc.status.NOT_FOUND,
                details: 'Reminder not found',
            });
        }
        callback(null, { success: true, message: 'Reminder updated' });
    } catch (error) {
        console.error('gRPC UpdateReminder error:', error);
        callback(grpc.status.INTERNAL, null);
    }
},
    
    DeleteReminder: async (call, callback) => {
        try {
            const { id } = call.request;
            const userId = call.request.userId;
            const reminder = await prisma.reminder.deleteMany({
                where: { id, userId },
            })
            if (reminder.count === 0) {
                return callback({
                    code: grpc.status.NOT_FOUND,
                    details: 'Reminder not found',
                });
            }
            callback(null, { success: true, message: 'Reminder deleted' });
        }
        catch (error) {
            console.error('gRPC DeleteReminder error:', error);
            callback(grpc.status.INTERNAL, null);
        }
    },

    UpdateReminderSettings: async (call, callback) => {
        try {
            const { userId, oldOffset, newOffset, enabled } = call.request;
            const reminders = await prisma.reminder.findMany({
                where: { userId },
            })
            reminders.forEach(async (reminder) => {
                await prisma.reminder.update({
                    where: { id: reminder.id },
                    data: {
                        date: new Date(reminder.date.getTime() + (newOffset - oldOffset) * 60 * 1000),
                        enabled,
                    }
                })
            })
        } catch (error) {
            console.error('gRPC UpdateReminderSettings error:', error);
            callback(grpc.status.INTERNAL, null);
        }
    },

  MarkReminderAsSent: async (call, callback) => {
    try {
      const { reminderId } = call.request;

      await prisma.reminder.update({
        where: { id: reminderId },
        data: { sent: true },
      });

      callback(null, { success: true });
    } catch (error) {
      console.error('gRPC MarkReminderAsSent error:', error);
      callback(error, null);
    }
  },

  // You can add more internal gRPC handlers like GetRemindersForSending etc.
};

module.exports = reminderGrpcController;
