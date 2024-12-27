import requests

# Load the JWT from the file
with open("./keys/apple_developer_token.jwt", "r") as file:
    jwt_token = file.read().strip()

# Define the MusicKit API endpoint
url = "https://api.music.apple.com/v1/test"
# url = "https://api.music.apple.com/v1/me/library"

# Set the headers for the request
headers = {
    "Authorization": f"Bearer {jwt_token}"
}

# Send the GET request to the Apple Music API
response = requests.get(url, headers=headers)

# Check the response status and print the result
if response.status_code == 200:
    print("Request successful!")
    print(response.json())
else:

    # Print the status code
    print(f"Status Code: {response.status_code}")


    # Print the response headers
    print("Response Headers:")
    for header, value in response.headers.items():
        print(f"{header}: {value}")

    # Print the response content (body)
    print("Response Content:")
    print(response.text)
