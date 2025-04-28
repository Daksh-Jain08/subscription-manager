const grpc = require('@grpc/grpc-js');
const { loadProto } = require('./grpcClient');
const path = require('path');

const proto = loadProto(path.join(__dirname, 'proto', 'reminder.proto'));
const reminderPackage = proto.reminder;

const server = new grpc.Server();
const reminderGrpcController = require("./controllers/grpc/reminderController");

// Implement the ReminderService
server.addService(reminderPackage.ReminderService.service, {
  CreateReminder: reminderGrpcController.CreateReminder,
  UpdateReminder: reminderGrpcController.UpdateReminder,
  DeleteReminder: reminderGrpcController.DeleteReminder,
  UpdateReminderSettings: reminderGrpcController.UpdateReminderSettings,
});

function start() {
  const GRPC_PORT = process.env.GRPC_PORT || '0.0.0.0:50051';
  console.log(`Starting gRPC server on ${GRPC_PORT}`);
  server.bindAsync(GRPC_PORT, grpc.ServerCredentials.createInsecure(), (err, port) => {
    if (err) {
      console.error('gRPC server failed to start', err);
      return;
    }
    server.start()
    console.log(`gRPC server running on ${GRPC_PORT}`);
  });
}

module.exports = { start };