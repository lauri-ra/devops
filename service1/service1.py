import time
import requests
import os
import socket
from datetime import datetime, timezone, timedelta

# Counter for rounds
counter = 1

# ip address and URL for service 2
address = socket.gethostbyname("service2")
service2_url = f"http://{address}:8000/"

# Path for logfile
logpath = "../logs/service1.log"

# Offset for +3 UTC
offset = timedelta(hours=3)

# Wait for service 2 to be up and running
time.sleep(2)

# Check that the file exists
if os.path.isfile(logpath):
    with open(logpath, 'r') as file:
        # If the file is not empty, clear it
        if file.read(1): 
            with open(logpath, 'w'):
                pass
else:
    # If the file doesn't exist, create a new one.
    with open(logpath, 'w') as new_logfile:
        new_logfile.close()

# Open the logfile and start writing
with open(logpath, "w", buffering=1) as logfile:
    for _ in range(20):
        # Wait for the 2s interval
        time.sleep(2)

        # Get current time
        current_time = datetime.now(timezone.utc) + offset
        timestamp = current_time.strftime('%Y-%m-%dT%H:%M:%S.%f')[:-3] + 'Z'

        # Compose the text
        text = f'{counter} {timestamp} {address}:8000\n'

        try:
            # Send log message over to service 2
            response = requests.post(service2_url, json={"text": text})
            response.raise_for_status()

            # Write log message to the file
            logfile.write(text)
            # Added flush so that instead of waiting for the buffer to fill up
            # or file closure, writes happen instantly
            logfile.flush()
        except Exception as error:
            # If sending fails, write an error message to the log
            logfile.write(f"Error: {str(error)}\n")

        # Increase the counter
        counter += 1

    # Write STOP to the log file
    logfile.write("STOP\n")
    logfile.flush()

    # Send STOP signal to service 2
    requests.post(service2_url, json={"text": "STOP"})

# Close the log file and exit
logfile.close()
exit(0)
