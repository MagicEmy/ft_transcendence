#!/bin/sh
set -e

echo "Starting Kafka health check..."

# Check if Kafka port is open
if nc -z localhost 9092; then
    echo "Kafka port 9092 is open."
else
    echo "Kafka port 9092 is not open."
    exit 1
fi

# Check if Kafka is responsive
if /opt/kafka_2.12-2.3.0/bin/kafka-topics.sh --list --bootstrap-server localhost:9092 > /dev/null 2>&1; then
    echo "Kafka is responsive."
    exit 0
else
    echo "Kafka is not responsive."
    echo "Attempting to list topics for more details..."
    /opt/kafka_2.12-2.3.0/bin/kafka-topics.sh --list --bootstrap-server localhost:9092
    exit 1
fi