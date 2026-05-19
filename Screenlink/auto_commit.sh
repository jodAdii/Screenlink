#!/bin/bash

#!/bin/bash

cd ~/screenlink

echo "Log at $(date) - update $RANDOM" >> activity_log.txt
git add .
git commit -m "Automated update at $(date)"
git push origin main

