#ifndef QUEUE_REGISTRY_H
#define QUEUE_REGISTRY_H

#include "queue.h"

// Structure representing a mapping of queue names to their corresponding message queues
typedef struct QueueMap {
    char *name;
    MessageQueue *queue;
    struct QueueMap *next;
} QueueMap;

// Initialize the queue registry (sets head to NULL)
void initQueueRegistry(QueueMap **head);

// Get the MessageQueue for the given name. Creates it if it doesn't exist.
MessageQueue* getOrCreateQueue(const char *name, QueueMap **head);

// Remove a queue by name and free its memory
void removeQueue(const char *name, QueueMap **head);

// Free all queues and the registry
void freeQueueRegistry(QueueMap **head);

#endif // QUEUE_REGISTRY_H
