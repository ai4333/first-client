import os
import glob

def replace_in_files():
    html_files = glob.glob('*.html')
    for file in html_files:
        with open(file, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Replace occurrences
        new_content = content.replace('"public/', '"public_assets/')
        new_content = new_content.replace("'public/", "'public_assets/")
        
        if new_content != content:
            with open(file, 'w', encoding='utf-8') as f:
                f.write(new_content)
            print(f"Updated {file}")

    # Update robots.txt
    if os.path.exists('robots.txt'):
        with open('robots.txt', 'r', encoding='utf-8') as f:
            content = f.read()
        new_content = content.replace('/public/', '/public_assets/')
        if new_content != content:
            with open('robots.txt', 'w', encoding='utf-8') as f:
                f.write(new_content)
            print("Updated robots.txt")

if __name__ == '__main__':
    replace_in_files()
