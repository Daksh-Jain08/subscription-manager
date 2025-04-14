class QueueManager {
  constructor() {
    this.queues = {}; // stores named queues
  }

  // Add message to the end of a named queue
  enqueue(queueName, message) {
    if (!this.queues[queueName]) {
      this.queues[queueName] = [];
    }
    this.queues[queueName].push(message);
  }

  // Remove and return the first message from the named queue
  dequeue(queueName) {
    const queue = this.queues[queueName];
    if (!queue || queue.length === 0) {
      return null;
    }
    return queue.shift();
  }

  // Peek at the first message without removing
  peek(queueName) {
    const queue = this.queues[queueName];
    if (!queue || queue.length === 0) {
      return null;
    }
    return queue[0];
  }

  // Get the length of a queue
  size(queueName) {
    return this.queues[queueName]?.length || 0;
  }
}

module.exports = new QueueManager();
