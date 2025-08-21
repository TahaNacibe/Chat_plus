import requests 
from bs4 import BeautifulSoup 
 
# Set the URL of the Pinterest page you want to scrape 
url = 'https://www.pinterest.com/username/board/'  # Replace with the actual URL 
 
# Send a GET request to the URL 
response = requests.get(url) 
 
# Check if the request was successful 
if response.status_code == 200: 
    # Parse the HTML content
    soup = BeautifulSoup(response.content, 'html.parser') 
     
    # Find pins or other elements 
    pins = soup.find_all('div', class_='Pin')  # Adjust class based on the actual HTML structure 
     
    for pin in pins: 
        title = pin.find('h2').text  # Adjust based on actual HTML structure 
        image_url = pin.find('img')['src'] 
        print(f'Title: {title}, Image URL: {image_url}') 
else: 
    print('Failed to retrieve the page') 
    
    
# if __name__ == "__main__":
#     using_search_engine()