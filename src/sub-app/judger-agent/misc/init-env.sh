#!/bin/bash

if [ $# -lt 2 ]; then
  echo "Usage: $0 /path/to/.env VAR1=value1 VAR2=value2 ..."
  exit 1
fi

ENV_FILE="$1"
if [ ! -f "$ENV_FILE" ]; then
  echo "Error: '$ENV_FILE' file not found!"
  exit 1
fi

shift

for VAR in "$@"
do
  KEY=$(echo $VAR | cut -f1 -d=)
  VALUE=$(echo $VAR | cut -f2 -d=)

  ESCAPED_VALUE=$(printf '%s\n' "$VALUE" | sed -e 's/[\/&]/\\&/g')

  if grep -q "^$KEY=" "$ENV_FILE"; then
    sed -i "s|^$KEY=.*|$KEY=$ESCAPED_VALUE|" "$ENV_FILE"
  else
    echo "Warning: '$KEY' not found in '$ENV_FILE'. Skipping..."
  fi
done
