#include "include/protocol.h"
#include <stdlib.h>
#include <string.h>
#include "cJSON.h"

// Deserialize JSON string into RequestMessage struct
RequestMessage* parse_request(const char *json) {
    cJSON *root = cJSON_Parse(json);
    if (!root) return NULL;

    RequestMessage *msg = (RequestMessage *)malloc(sizeof(RequestMessage));
    if (!msg) return NULL;

    cJSON *queue = cJSON_GetObjectItem(root, "queue");
    cJSON *action = cJSON_GetObjectItem(root, "action");
    cJSON *payload = cJSON_GetObjectItem(root, "payload");

    msg->queue = queue && cJSON_IsString(queue) ? strdup(queue->valuestring) : NULL;
    msg->action = action && cJSON_IsString(action) ? strdup(action->valuestring) : NULL;
    msg->payload = payload && cJSON_IsString(payload) ? strdup(payload->valuestring) : NULL;

    cJSON_Delete(root);
    return msg;
}

// Free a parsed request
void free_request(RequestMessage *msg) {
    if (msg->queue) free(msg->queue);
    if (msg->action) free(msg->action);
    if (msg->payload) free(msg->payload);
    free(msg);
}

// Serialize ResponseMessage struct into JSON string
char* build_response(ResponseMessage *res) {
    cJSON *root = cJSON_CreateObject();
    if (!root) return NULL;

    cJSON_AddStringToObject(root, "status", res->status);
    if (res->action)
        cJSON_AddStringToObject(root, "action", res->action);
    if (res->message)
        cJSON_AddStringToObject(root, "message", res->message);

    char *jsonStr = cJSON_PrintUnformatted(root);
    cJSON_Delete(root);
    return jsonStr;
}
