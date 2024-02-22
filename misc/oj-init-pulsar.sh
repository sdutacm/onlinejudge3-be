set -e

echo "Creating namespaces (public/oj), topics and subscriptions on Pulsar"

bin/pulsar-admin namespaces create public/oj
bin/pulsar-admin namespaces set-retention public/oj --size -1 --time -1
bin/pulsar-admin topics create persistent://public/oj/judge-queue
bin/pulsar-admin topics create-subscription --subscription judge-subscription persistent://public/oj/judge-queue
bin/pulsar-admin topics create persistent://public/oj/judge-dead-queue
bin/pulsar-admin topics create-subscription --subscription judge-dead-subscription persistent://public/oj/judge-dead-queue

echo "Initialized"
