#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include <netinet/in.h>
#include <arpa/inet.h>
#include <signal.h>
#include <errno.h>

#define PORT 9000
#define BUFFER_SIZE 4096
#define MAX_MESSAGE_SIZE (BUFFER_SIZE - 1)

int server_fd;

void handle_sigint(int sig) {
    printf("\nShutting down server...\n");
    if (server_fd >= 0) close(server_fd);
    exit(0);
}

ssize_t read_n(int sockfd, void *buffer, size_t n) {
    size_t total_read = 0;
    while (total_read < n) {
        ssize_t bytes = read(sockfd, (char *)buffer + total_read, n - total_read);
        if (bytes <= 0) {
            return bytes; // error or connection closed
        }
        total_read += bytes;
    }
    return total_read;
}

ssize_t read_message(int sockfd, char *buffer, size_t buffer_size) {
    uint32_t net_length;
    ssize_t len_bytes = read_n(sockfd, &net_length, sizeof(net_length));
    if (len_bytes <= 0) return len_bytes;

    uint32_t length = ntohl(net_length);

    if (length > MAX_MESSAGE_SIZE) {
        fprintf(stderr, "Message too long (%u bytes)\n", length);
        return -1;
    }

    return read_n(sockfd, buffer, length);
}

int main() {
    struct sockaddr_in addr;
    char buffer[BUFFER_SIZE];
    int client_fd;

    signal(SIGINT, handle_sigint); // Handle Ctrl+C

    server_fd = socket(AF_INET, SOCK_STREAM, 0);
    if (server_fd < 0) {
        perror("socket failed");
        exit(1);
    }

    addr.sin_family = AF_INET;
    addr.sin_addr.s_addr = INADDR_ANY;
    addr.sin_port = htons(PORT);

    if (bind(server_fd, (struct sockaddr *)&addr, sizeof(addr)) < 0) {
        perror("bind failed");
        close(server_fd);
        exit(1);
    }

    if (listen(server_fd, 5) < 0) {
        perror("listen failed");
        close(server_fd);
        exit(1);
    }

    printf("Server listening on port %d...\n", PORT);

    while (1) {
        client_fd = accept(server_fd, NULL, NULL);
        if (client_fd < 0) {
            perror("accept failed");
            continue;
        }

        printf("Client connected.\n");

        ssize_t msg_len = read_message(client_fd, buffer, BUFFER_SIZE);
        if (msg_len > 0) {
            buffer[msg_len] = '\0'; // Ensure null-termination
            printf("Received message (%ld bytes): %s\n", msg_len, buffer);
        } else {
            printf("Connection closed or error\n");
        }

        close(client_fd);
    }

    close(server_fd);
    return 0;
}
