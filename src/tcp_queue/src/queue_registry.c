#include "include/queue_registry.h"
#include "include/queue.h"
#include <stdlib.h>
#include <stdio.h>
#include <string.h>

void initQueueRegistry(QueueMap **head) {
    *head = NULL;
}

MessageQueue* getOrCreateQueue(const char *name, QueueMap **head) {
    QueueMap *current = *head;
    while (current != NULL) {
        if (strcmp(current->name, name) == 0) {
            return current->queue; // Queue already exists
        }
        current = current->next;
    }

    // Allocate and initialize new queue node
    QueueMap *newQueueMap = (QueueMap *)malloc(sizeof(QueueMap));
    if (!newQueueMap) {
        perror("Failed to allocate memory for new queue map");
        return NULL;
    }

    newQueueMap->name = strdup(name);
    if (!newQueueMap->name) {
        perror("Failed to allocate memory for queue name");
        free(newQueueMap);
        return NULL;
    }

    newQueueMap->queue = (MessageQueue *)malloc(sizeof(MessageQueue));
    if (!newQueueMap->queue) {
        perror("Failed to allocate memory for message queue");
        free(newQueueMap->name);
        free(newQueueMap);
        return NULL;
    }

    initQueue(newQueueMap->queue); // Properly initialize it

    // Insert at head
    newQueueMap->next = *head;
    *head = newQueueMap;

    return newQueueMap->queue;
}

void removeQueue(const char *name, QueueMap **head) {
    QueueMap *current = *head;
    QueueMap *previous = NULL;

    while (current != NULL) {
        if (strcmp(current->name, name) == 0) {
            if (previous == NULL) {
                *head = current->next; // Remove head
            } else {
                previous->next = current->next;
            }

            free(current->name);
            freeQueue(current->queue);
            free(current);
            return;
        }

        previous = current;
        current = current->next;
    }

    fprintf(stderr, "Queue with name '%s' not found for removal\n", name);
}

void freeQueueRegistry(QueueMap **head) {
    QueueMap *current = *head;
    while (current != NULL) {
        QueueMap *temp = current;
        current = current->next;
        free(temp->name);
        freeQueue(temp->queue);
        free(temp);
    }

    *head = NULL;
    fprintf(stderr, "All queues and registry have been freed\n");
}

