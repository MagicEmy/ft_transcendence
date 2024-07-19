#!/bin/sh
set -e

# Check if Kafka port is open
nc -z localhost 9092 || exit 1

# Check if Kafka is responsive
if /opt/kafka_2.12-2.3.0/bin/kafka-topics.sh --list --bootstrap-server localhost:9092 > /dev/null 2>&1; then
    exit 0
else
    exit 1
fi