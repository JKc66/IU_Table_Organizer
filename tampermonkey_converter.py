import re
import json
import sys
from pathlib import Path

def validate_manifest_version(version):
    """Validate the version string format."""
    if not re.match(r'^\d+\.\d+(?:\.\d+)?$', version):
        raise ValueError(f"Invalid version format: {version}. Expected format: X.Y or X.Y.Z")
    return version

def read_file_safely(file_path, encoding='utf-8'):
    """Safely read a file with proper error handling."""
    path = Path(file_path)
    try:
        return path.read_text(encoding=encoding)
    except FileNotFoundError:
        print(f"Error: File not found: {path}")
        sys.exit(1)
    except UnicodeDecodeError:
        print(f"Error: Unable to decode {path} with {encoding} encoding")
        sys.exit(1)
    except Exception as e:
        print(f"Error reading {path}: {str(e)}")
        sys.exit(1)

def create_tampermonkey_script(input_js_file, manifest_file, css_file, output_js_file):
    """Create a Tampermonkey script from separate JS and CSS files."""
    try:
        # Read and validate manifest
        manifest_content = read_file_safely(manifest_file)
        manifest = json.loads(manifest_content)
        version = validate_manifest_version(manifest['version'])

        # Read CSS and JS files
        css_content = read_file_safely(css_file)
        js_code = read_file_safely(input_js_file)
        
        # Define the Tampermonkey metadata block
        metadata = f"""// ==UserScript==
// @name IU Table Organizer
// @description A script to order the lectures table according to weekdays on the Islamic University website
// @name:en IU Table Organizer
// @description:en A script to order the lectures table according to weekdays on the Islamic University website
// @name:ar منظم جدول الجامعة الاسلامية
// @description:ar اضافة لتعديل مظهر الجدول بالجامعة الاسلامية الى جدول مرتب تبعا لايام الاسبوع بضغطة زر
// @include https://eduportal.iu.edu.sa/iu/ui/student/homeIndex.faces
// @include https://eduportal.iu.edu.sa/iu/ui/student/*/*/*
// @include http://eduportal.iu.edu.sa/iu/ui/student/*
// @include https://eduportal.iu.edu.sa/iu/ui/student/student_schedule/index/studentScheduleIndex.faces
// @version {version}
// @icon https://www.google.com/s2/favicons?domain=sso.iu.edu.sa
// @namespace https://greasyfork.org/users/814159
// @icon https://icons.iconarchive.com/icons/fatcow/farm-fresh/32/table-icon.png
// @license Mozilla Public License 2.0
// @grant GM_addStyle
// @require https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js
// @downloadURL https://update.greasyfork.org/scripts/432219/iu-table-organizer.user.js
// @updateURL https://update.greasyfork.org/scripts/432219/iu-table-organizer.meta.js
// ==/UserScript=="""

        # Process the JavaScript code
        if not js_code.strip():
            raise ValueError("JavaScript code is empty")
        
        # Remove potential Unicode BOM and normalize line endings
        js_code = js_code.replace('\ufeff', '').replace('\r\n', '\n')
        
        # Basic validation of JS code
        if 'function init()' not in js_code:
            print("Warning: init() function not found in JavaScript code")
        
        # Create the script structure with proper spacing and no extra newlines
        script_template = """
(function() {{
    'use strict';
    
    // Add styles
    GM_addStyle(`%s`);
    
%s
}})();"""

        # Clean up the CSS content
        css_content = css_content.strip()
        
        # Clean up the JS code
        js_code = js_code.strip()
        
        # Combine everything using string formatting
        final_script = metadata + "\n" + script_template % (css_content, js_code)
        
        # Write the output file
        try:
            with open(output_js_file, 'w', encoding='utf-8') as f:
                f.write(final_script)
            print(f"✅ Tampermonkey script generated successfully: {output_js_file}")
            print(f"📦 Version: {version}")
            print(f"📄 Size: {len(final_script):,} bytes")
        except Exception as e:
            print(f"Error writing output file: {str(e)}")
            sys.exit(1)

    except json.JSONDecodeError:
        print(f"Error: Invalid JSON in manifest file: {manifest_file}")
        sys.exit(1)
    except ValueError as ve:
        print(f"Error: {str(ve)}")
        sys.exit(1)
    except Exception as e:
        print(f"Unexpected error: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    # Get the script's directory
    script_dir = Path(__file__).parent
    
    # Define paths relative to script directory
    create_tampermonkey_script(
        script_dir / 'Browser_extention/js/content.js',
        script_dir / 'Browser_extention/manifest.json',
        script_dir / 'Browser_extention/css/styles.css',
        script_dir / 'GreasyFork/IU_Table_Organizer_tampermonkey.js'
    ) 