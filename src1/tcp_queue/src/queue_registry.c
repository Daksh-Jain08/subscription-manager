#include "include/queue_registry.h"
#include "include/queue.h"
#include<stdlib.h>
#include<stdio.h>

void initQueueRegistry() {
    QueueMap *head = NULL;
}

MessageQueue* getOrCreateQueue(const char *name, QueueMap **head){
    QueueMap *current = head;
    while (current != NULL) {
        if (strcmp(current->name, name) == 0) {
            return current->queue; // Queue already exists, return it
        }
        current = current->next;
    }
    // Queue does not exist, create a new one
    QueueMap *newQueueMap = (QueueMap *)malloc(sizeof(QueueMap));
    if (newQueueMap == NULL) {
        perror("Failed to allocate memory for new queue map");
        return NULL;
    }
    newQueueMap->name = strdup(name);
    if (newQueueMap->name == NULL) {
        perror("Failed to allocate memory for queue name");
        free(newQueueMap);
        return NULL;
    }
    MessageQueue *newQueue = (MessageQueue *)malloc(sizeof(MessageQueue));
    if (newQueue == NULL) {
        perror("Failed to allocate memory for new queue");
        free(newQueueMap->name);
        free(newQueueMap);
        return NULL;
    }
    initQueue(newQueue);
    if (newQueueMap->queue == NULL) {
        perror("Failed to initialize new queue");
        free(newQueueMap->name);
        free(newQueueMap);
        return NULL;
    }
    newQueueMap->next = head; // Insert at the beginning of the list
    head = newQueueMap;
    return newQueueMap->queue; // Return the newly created queue
}

void removeQueue(const char *name, QueueMap **head) {
    QueueMap *current = head;
    QueueMap *previous = NULL;
    while (current != NULL) {
        if (strcmp(current->name, name) == 0) {
            // Found the queue to remove
            if (previous == NULL) {
                head = current->next; // Remove from head
            } else {
                previous->next = current->next; // Remove from middle or end
            }
            free(current->name);
            freeQueue(current->queue); // Free the queue
            free(current);
            return;
        }
        previous = current;
        current = current->next;
    }
    fprintf(stderr, "Queue with name '%s' not found for removal\n", name);
}

void freeQueueRegistry(QueueMap **head) {
    QueueMap *current = head;
    while (current != NULL) {
        QueueMap *temp = current;
        current = current->next;
        free(temp->name);
        freeQueue(temp->queue);
        free(temp);
    }
    head = NULL; // Set head to NULL after freeing all queues
    fprintf(stderr, "All queues and registry have been freed\n");
}