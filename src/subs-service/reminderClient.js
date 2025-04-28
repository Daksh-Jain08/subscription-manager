const grpc = require('@grpc/grpc-js');
const { loadProto } = require('./grpcClient');
const path = require('path');

const proto = loadProto(path.join(__dirname, 'proto', 'reminder.proto'));
const reminderPackage = proto.reminder;

const reminderClient = new reminderPackage.ReminderService(
  'reminder-service:50051', 
  grpc.credentials.createInsecure()
);

module.exports = { reminderClient };
