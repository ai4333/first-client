import re
import os
import glob
import urllib.request
from urllib.parse import urlparse, unquote

def get_folder_for_url(url):
    path = urlparse(url).path
    ext = os.path.splitext(path)[1].lower()
    
    if ext == '.css': return 'css'
    elif ext == '.js': return 'js'
    elif ext in ['.woff', '.woff2', '.ttf', '.otf']: return 'fonts'
    elif ext in ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp', '.avif']: return 'images'
    elif ext in ['.mp4', '.webm']: return 'videos'
    elif ext == '.json': return 'json'
    else: return 'misc'

os.makedirs('assets/css', exist_ok=True)
os.makedirs('assets/js', exist_ok=True)
os.makedirs('assets/fonts', exist_ok=True)
os.makedirs('assets/images', exist_ok=True)
os.makedirs('assets/videos', exist_ok=True)
os.makedirs('assets/json', exist_ok=True)
os.makedirs('assets/misc', exist_ok=True)

html_files = glob.glob('*.html')
css_files = glob.glob('public/*.css') + glob.glob('css/*.css')

# Target domains to download
target_domains = [
    'cdn.prod.website-files.com',
    'abtc-eta.vercel.app',
    'd3e54v103j8qbb.cloudfront.net',
    'unpkg.com'
]

pattern = re.compile(r'(https?://(?:' + '|'.join(re.escape(d) for d in target_domains) + r')/[^\s\'"<>]+)')

url_mapping = {}

def download_file(url):
    # Some URLs have trailing characters from regex
    clean_url = url.rstrip(';)\]},')
    if clean_url in url_mapping:
        return url_mapping[clean_url]
        
    try:
        parsed = urlparse(clean_url)
        filename = os.path.basename(unquote(parsed.path))
        if not filename:
            filename = 'downloaded_asset'
            
        folder = get_folder_for_url(clean_url)
        local_path = os.path.join('assets', folder, filename)
        
        # Handle duplicates
        base, ext = os.path.splitext(local_path)
        counter = 1
        while os.path.exists(local_path):
            local_path = f"{base}_{counter}{ext}"
            counter += 1
            
        print(f"Downloading {clean_url} to {local_path}")
        req = urllib.request.Request(clean_url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req) as response, open(local_path, 'wb') as out_file:
            out_file.write(response.read())
            
        url_mapping[clean_url] = local_path
        return local_path
    except Exception as e:
        print(f"Failed to download {clean_url}: {e}")
        return None

# Process files
for filepath in html_files + css_files:
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
        
    # Remove Google Tag Manager
    content = re.sub(r'<script[^>]*googletagmanager[^>]*>.*?</script>', '', content, flags=re.DOTALL)
    # Remove other GTM script blocks that might just push to dataLayer
    content = re.sub(r'<script[^>]*>\s*\(function\(w,d,s,l,i\).*?GTM-.*?</script>', '', content, flags=re.DOTALL)
    
    # Find and download all matching URLs
    urls = pattern.findall(content)
    for url in urls:
        clean_url = url.rstrip(';)\]},')
        # Skip if it's already mapped or failed
        if clean_url not in url_mapping:
            download_file(clean_url)
            
    # Replace URLs in content
    # For HTML files (root), assets/ is correct.
    # For CSS files in subdirs, we need ../assets/
    prefix = '../' if ('/' in filepath) else ''
    
    for url in set(pattern.findall(content)):
        clean_url = url.rstrip(';)\]},')
        if clean_url in url_mapping and url_mapping[clean_url]:
            local_path = prefix + url_mapping[clean_url]
            # Replace the exact url match
            content = content.replace(clean_url, local_path)
            
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
        
print("Offline conversion complete!")
