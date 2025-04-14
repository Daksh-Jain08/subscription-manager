#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include <arpa/inet.h>

#define SERVER_PORT 9000
#define SERVER_ADDR "127.0.0.1"
#define MAX_MSG_SIZE 4096

int main() {
    int sockfd;
    struct sockaddr_in serv_addr;
    char message[MAX_MSG_SIZE];

    // 1. Get message from user
    printf("Enter message to send: ");
    if (!fgets(message, sizeof(message), stdin)) {
        perror("Input error");
        return 1;
    }

    size_t msg_len = strlen(message);
    if (message[msg_len - 1] == '\n') {
        message[msg_len - 1] = '\0';
        msg_len--;
    }

    // 2. Create socket
    sockfd = socket(AF_INET, SOCK_STREAM, 0);
    if (sockfd < 0) {
        perror("Socket failed");
        return 1;
    }

    serv_addr.sin_family = AF_INET;
    serv_addr.sin_port = htons(SERVER_PORT);

    if (inet_pton(AF_INET, SERVER_ADDR, &serv_addr.sin_addr) <= 0) {
        perror("Invalid address");
        close(sockfd);
        return 1;
    }

    // 3. Connect to server
    if (connect(sockfd, (struct sockaddr *)&serv_addr, sizeof(serv_addr)) < 0) {
        perror("Connection failed");
        close(sockfd);
        return 1;
    }

    // 4. Send [length][message]
    uint32_t len_net = htonl(msg_len);  // Convert length to network byte order
    if (write(sockfd, &len_net, sizeof(len_net)) != sizeof(len_net)) {
        perror("Failed to send length");
        close(sockfd);
        return 1;
    }

    if (write(sockfd, message, msg_len) != msg_len) {
        perror("Failed to send message");
        close(sockfd);
        return 1;
    }

    printf("Message sent successfully!\n");

    close(sockfd);
    return 0;
}
