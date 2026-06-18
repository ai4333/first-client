import re
import os
import glob

html_files = glob.glob('*.html')
css_files = glob.glob('public/*.css') + glob.glob('css/*.css')

all_urls = set()
pattern = re.compile(r'https?://[^\s\'"<>]+')

for file in html_files + css_files:
    try:
        with open(file, 'r', encoding='utf-8') as f:
            content = f.read()
            urls = pattern.findall(content)
            for url in urls:
                # clean up trailing punctuation if any
                url = url.rstrip(';)\]},')
                all_urls.add(url)
    except Exception as e:
        print(f"Error reading {file}: {e}")

# Save to a file for analysis
with open('all_external_urls.txt', 'w') as f:
    for url in sorted(all_urls):
        f.write(url + '\n')

print(f"Extracted {len(all_urls)} unique URLs. Saved to all_external_urls.txt")
