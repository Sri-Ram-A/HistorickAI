from bs4 import BeautifulSoup
import requests
from rich import print
from rich.pretty import pprint

url = "https://www.istockphoto.com/search/2/film?excludenudity=false&phrase=mughal&sort=best"
headers = {
    "User-Agent": "Mozilla/5.0"
}

page = requests.get(url, headers=headers)

html_content = page.content # Use .content to avoid character encoding issues

soup = BeautifulSoup(html_content, 'html.parser')
print(soup.prettify())
print("\n[bold green]TITLE[/bold green]")
pprint(soup.title)

print("\n[bold green]META TAGS[/bold green]")
for meta in soup.find_all("meta")[:10]:
    pprint(meta.attrs)