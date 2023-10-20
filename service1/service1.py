import time
import requests
import pika
import socket
from datetime import datetime, timezone, timedelta

# Counter for rounds
counter = 1

# ip address and URL for service 2
# address = socket.gethostbyname("service2")
address = 'localhost'
service2_url = f"http://{address}:8000/"

# Offset for +3 UTC
offset = timedelta(hours=3)

# Connect to RabbitMQ server
connection = pika.BlockingConnection(pika.ConnectionParameters('localhost'))
channel = connection.channel()

# Bind exchnages for different topics
channel.exchange_declare(exchange='message', exchange_type='topic')
channel.exchange_declare(exchange='log', exchange_type='topic')

print('service 1 starting...')

# Open the logfile and start writing
for _ in range(20):
    # Wait for the 2s interval
    time.sleep(2)

    # Get current time
    current_time = datetime.now(timezone.utc) + offset
    timestamp = current_time.strftime('%Y-%m-%dT%H:%M:%S.%f')[:-3] + 'Z'

    # Compose the message text
    message = f'SND {counter} {timestamp} {address}:8000\n'

    try:
        # Send message to broker for service 2
        channel.basic_publish(exchange='message', routing_key='service2', body=message)

        # Send log message over to service 2
        response = requests.post(service2_url, json={"message": message})
        response.raise_for_status()

        # Send log message for monitor
        log_message = f'{response.status_code} {timestamp}'
        channel.basic_publish(exchange='log', routing_key='monitor', body=log_message)
    except Exception as error:
        print(f"Error: {str(error)}\n")

        # Send log message for the monitor if sending fails
        channel.basic_publish(exchange='log', routing_key='monitor', body=error)

    # Increase the counter
    counter += 1

# After 20 rounds -> send stop to monitor
channel.basic_publish(exchange='log', routing_key='monitor', body='SND STOP')

print('service 1 stopped')

# TODO: remove before submit
exit(0)
