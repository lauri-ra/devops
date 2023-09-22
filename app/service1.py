import time
import requests
import os

# Counter for rounds
counter = 1

# URL for service 2
service2_url = "http://localhost:8000"

# Path for logfile
logpath = "../logs/service1.log"

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
with open(logpath, "w") as logfile:
    for _ in range(20):
        # Compose the text
        text = f"{counter} {time.strftime('%Y-%m-%dT%H:%M:%S.%fZ')} {service2_url}\n"

        # Write log message to the file
        logfile.write(text)

        # Send log message over to service 2
        try:
            response = requests.post(service2_url, data=text)
            response.raise_for_status()
        except Exception as error:
            # If sending fails, write an error message to the log
            logfile.write(f"Error: {str(error)}\n")

        # Increase the counter
        counter += 1

    # Write STOP to the log file
    logfile.write("STOP\n")

    # Send STOP signal to service 2
    requests.post(service2_url, data="STOP")

# Close the log file and exit
logfile.close()
exit(0)
