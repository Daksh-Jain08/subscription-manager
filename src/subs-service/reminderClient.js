const grpc = require('@grpc/grpc-js');
const { loadProto } = require('./grpcClient');
const path = require('path');

const proto = loadProto(path.join(__dirname, 'proto', 'reminder.proto'));
const reminderPackage = proto.reminder;

const client = new reminderPackage.ReminderService(
  'reminder-service:50051', 
  grpc.credentials.createInsecure()
);

// Example of calling CreateReminder
client.CreateReminder({
  userId: "user123",
  subscriptionId: "sub456",
  title: "Netflix Renewal",
  description: "Your Netflix subscription is renewing soon",
  reminderTime: new Date().toISOString()
}, (err, response) => {
  if (err) {
    console.error('Error:', err);
  } else {
    console.log('Response:', response);
  }
});
