#ifndef PROTOCOL_H
#define PROTOCOL_H

typedef struct {
    char *queue;    // Name of the queue
    char *action;   // enqueue, dequeue, etc.
    char *payload;  // Optional payload (e.g., for enqueue)
} RequestMessage;

typedef struct {
    char *status;   // "ok" or "error"
    char *action;   // The original action performed (optional)
    char *message;  // Payload returned from server (for dequeue or errors)
} ResponseMessage;

#endif // PROTOCOL_H
