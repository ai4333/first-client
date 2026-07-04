import os
import glob
import re

def clean_html_files():
    html_files = glob.glob('*.html')
    
    # Regex patterns for the Webflow IDs
    domain_pattern = re.compile(r'\s*data-wf-domain="[^"]*"')
    page_pattern = re.compile(r'\s*data-wf-page="[^"]*"')
    site_pattern = re.compile(r'\s*data-wf-site="[^"]*"')

    for file in html_files:
        with open(file, 'r', encoding='utf-8') as f:
            content = f.read()

        # Remove Webflow tracking attributes
        content = re.sub(domain_pattern, '', content)
        content = re.sub(page_pattern, '', content)
        content = re.sub(site_pattern, '', content)
        
        # Replace CSS and JS file name references
        content = content.replace('abtc-new.webflow', 'geetha.webflow')
        # Also replace any Grid - ABTC video names
        content = content.replace('Grid - ABTC (1)', 'Grid-Main')
        content = content.replace('Grid%20-%20ABTC%20(1)', 'Grid-Main')
        
        with open(file, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Cleaned {file}")

def rename_css_files():
    css_dir = 'assets/css'
    if not os.path.exists(css_dir):
        return
        
    for filename in os.listdir(css_dir):
        if 'abtc-new.webflow' in filename:
            old_path = os.path.join(css_dir, filename)
            new_name = filename.replace('abtc-new.webflow', 'geetha.webflow')
            new_path = os.path.join(css_dir, new_name)
            os.rename(old_path, new_path)
            print(f"Renamed {filename} -> {new_name}")

def rename_video_files():
    video_dir = 'assets/videos'
    if not os.path.exists(video_dir):
        return
        
    for filename in os.listdir(video_dir):
        if 'Grid - ABTC (1)' in filename:
            old_path = os.path.join(video_dir, filename)
            new_name = filename.replace('Grid - ABTC (1)', 'Grid-Main')
            new_path = os.path.join(video_dir, new_name)
            os.rename(old_path, new_path)
            print(f"Renamed video {filename} -> {new_name}")

def rename_image_files():
    image_dir = 'assets/images'
    if not os.path.exists(image_dir):
        return
        
    for filename in os.listdir(image_dir):
        if 'Grid - ABTC (1)' in filename:
            old_path = os.path.join(image_dir, filename)
            new_name = filename.replace('Grid - ABTC (1)', 'Grid-Main')
            new_path = os.path.join(image_dir, new_name)
            os.rename(old_path, new_path)
            print(f"Renamed image {filename} -> {new_name}")

if __name__ == '__main__':
    clean_html_files()
    rename_css_files()
    rename_video_files()
    rename_image_files()
    print("Cleanup complete!")
