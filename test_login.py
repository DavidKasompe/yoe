import requests

base_url = "http://127.0.0.1:8000"

def test_login(username, password):
    print(f"Testing login with {username}...")
    url = f"{base_url}/api/auth/login/"
    data = {"username": username, "password": password}
    try:
        response = requests.post(url, json=data)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.json()}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    # Test with username
    test_login("admin", "adminpassword")
    # Test with email
    test_login("admin@example.com", "adminpassword")
