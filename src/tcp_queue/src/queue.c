#include<stdlib.h>
#include<string.h>
#include "include/queue.h"

void initQueue(MessageQueue *q){
	q->front = NULL;
	q->rear = NULL;
}

void enqueue(MessageQueue *q, const char *msg){
	QueueNode* queueNode = (QueueNode *)malloc(sizeof(QueueNode));
	if(!queueNode) return;
	queueNode->data = strdup(msg);
	queueNode->next = NULL;
	if(q->rear == NULL){
		q->front = queueNode;
		q->rear = queueNode;
		return;
	}
	q->rear->next = queueNode;
	q->rear = queueNode;
}

char* dequeue(MessageQueue *q){
	if(isEmpty(q)){
		return NULL;
	}
	char *data = q->front->data;
	QueueNode* queueNode = q->front;
	q->front = q->front->next;
	free(queueNode);

	//Caller must free data after use
	return data;
}

int isEmpty(MessageQueue *q){
	return q->front == NULL;
}

void freeQueue(MessageQueue *q){
	while(q->front != NULL){
		QueueNode* queueNode = q->front;
		q->front = q->front->next;
		free(queueNode->data);
		free(queueNode);
	}
}
