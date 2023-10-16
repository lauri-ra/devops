import time
import requests
import socket
from datetime import datetime, timezone, timedelta

# Counter for rounds
counter = 1

# ip address and URL for service 2
address = socket.gethostbyname("service2")
service2_url = f"http://{address}:8000/"

# Offset for +3 UTC
offset = timedelta(hours=3)

# Open the logfile and start writing
for _ in range(20):
    # Wait for the 2s interval
    time.sleep(2)

    # Get current time
    current_time = datetime.now(timezone.utc) + offset
    timestamp = current_time.strftime('%Y-%m-%dT%H:%M:%S.%f')[:-3] + 'Z'

    # Compose the text
    text = f'SND {counter} {timestamp} {address}:8000\n'

    try:
        # Send log message over to service 2
        response = requests.post(service2_url, json={"text": text})
        response.raise_for_status()
    except Exception as error:
        # If sending fails, write an error message to the log
        print(f"Error: {str(error)}\n")

    # Increase the counter
    counter += 1

exit(0)
