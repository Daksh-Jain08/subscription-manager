
#!/bin/sh
echo "Waiting for postgres..."

while ! nc -z subs-db 5432; do
  sleep 0.1
done

echo "PostgreSQL started"

npx prisma migrate deploy
npm start

exec "$@"
