#ifndef QUEUE_H
#define QUEUE_H

typedef struct QueueNode {
    char *data;
    struct QueueNode *next;
} QueueNode;

typedef struct MessageQueue {
    QueueNode *front;
    QueueNode *rear;
} MessageQueue;

void initQueue(MessageQueue *q);
void enqueue(MessageQueue *q, const char *msg);
char* dequeue(MessageQueue *q);
int isEmpty(MessageQueue *q);
void freeQueue(MessageQueue *q);

#endif
