#!/bin/bash
cd /home/kavia/workspace/code-generation/event-calendar-manager-93845/calendar_frontend
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

