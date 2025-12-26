# Clean HTML Script v1.35

## 📦 Installation

### CDN (recommended)
```html
<script src="https://cdn.jsdelivr.net/gh/nomidua/clean-html-script@main/clean-html.js"></script>
```

### Manual installation
Download `clean-html.js` and include in your project.

---

## 🆕 Changelog v1.35 (26.12.2025)

### 🐛 Critical Fixes
- **FIXED:** Removed Rule 28.1 that was deleting `<img>`, `<ul>`, `<iframe>` tags
  - Previous regex `/<\/?i[^>]*>/gi` was matching `<img>`, `<iframe>`
  - Previous regex `/<\/?u[^>]*>/gi` was matching `<ul>`
  - This rule has been completely removed for safety

### ✨ Improvements
- **IMPROVED:** Rule 7.2 (list punctuation) now handles lists with line breaks correctly
  - Added `\s*` to regex: `/<(ul|ol)>\s*([\s\S]*?)\s*<\/\1>/gi`
  - Now properly detects `<ul>` and `<ol>` tags even when separated by newlines

### 🔄 Code Reorganization
- **REORGANIZED:** All rules now follow block-based numbering:
  - **БЛОК 1:** Удаление атрибутов (1.1-1.7)
  - **БЛОК 2:** Очистка пустых тегов (2.1-2.11)
  - **БЛОК 3:** Удаление style/class (3.1-3.4)
  - **БЛОК 4:** Форматирование текста (4.1-4.5)
  - **БЛОК 5:** Преобразования (5.1-5.4)
  - **БЛОК 6:** Добавление атрибутов (6.1-6.5)
  - **БЛОК 7:** Финальная обработка (7.1-7.2)

### ⚠️ Breaking Changes
None. Version 1.34 is fully backward compatible with v1.33.

---

## 📋 Features

### Supported Editors
- ✅ CKEditor
- ✅ WordPress TinyMCE (Visual & Text modes)
- ✅ CodeMirror
- ✅ Standard HTML textareas
- ✅ uCoz CMS

### What it does
1. **Removes attributes:** `dir`, `aria-level`, `bis_size`, `target="_new"`, `id`, `data-*`, `role`
2. **Cleans empty tags:** `<p>`, `<div>`, `<span>`, `<section>`, `<li>`, `<ul>`, `<ol>`
3. **Removes styles & classes** (protects `$IMAGE$` placeholders and `<img>` class)
4. **Text formatting:**
   - Fixes spaces before punctuation
   - Normalizes dashes (em-dash, en-dash)
   - Cleans `&nbsp;` entities
   - Fixes spaces around links
5. **Transformations:**
   - YouTube links → embedded iframes
   - `<dl>` lists → `<ul>` lists
   - Automatic punctuation in lists (uppercase → periods, lowercase → semicolons)
6. **Adds attributes:**
   - Converts `<h1>` → `<h2>` (SEO)
   - Centers `<h2>` headers
   - Removes bold/strong from headers
   - Standardizes table markup
7. **Final processing:**
   - Pretty-prints HTML with line breaks
   - Smart list punctuation based on first letter case

### Hotkey
Press **Ctrl+Shift+L** to trigger cleanup.

---

## 🔧 Usage

### uCoz Template Integration
```javascript
<script>
document.addEventListener('DOMContentLoaded',function(){
  var c=document.querySelector('#nwM23')||document.querySelector('.manTdText');
  if(c){
    var b=document.createElement('button');
    b.type='button';
    b.innerHTML='Умная очистка HTML';
    b.style.cssText='position:absolute;top:36px;right:10px;z-index:1;background:linear-gradient(270deg,rgb(42,123,155) 0,rgb(87,199,133) 65%);padding:4px 8px;border-radius:3px;cursor:pointer;text-shadow:1px 1px #00000052;color:#fff;border:none;font-size:12px !important;';
    b.onclick=function(){cleanHTMLContent()};
    c.style.position!=='relative'&&c.style.position!=='absolute'&&(c.style.position='relative');
    c.appendChild(b)
  }
});
</script>
<script src="https://cdn.jsdelivr.net/gh/nomidua/clean-html-script@main/clean-html.js"></script>
```

### WordPress Integration (functions.php)
```php
function enqueue_clean_html_script() {
    if (current_user_can('edit_posts')) {
        wp_enqueue_script(
            'clean-html-script',
            'https://cdn.jsdelivr.net/gh/nomidua/clean-html-script@main/clean-html.js',
            array(),
            '1.34',
            true
        );
    }
}
add_action('admin_enqueue_scripts', 'enqueue_clean_html_script');
```

### Tampermonkey Script
```javascript
// ==UserScript==
// @name         Clean HTML Button
// @version      1.34
// @match        https://yoursite.com/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    var script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/gh/nomidua/clean-html-script@main/clean-html.js';
    document.head.appendChild(script);
})();
```

---

## 📝 Version History

- **v1.34** (26.12.2025) - Fixed image/list deletion bug, reorganized numbering
- **v1.33** (26.12.2025) - Added bold/italic/underline removal
- **v1.32** (25.12.2025) - WordPress TinyMCE support
- **v1.21** (24.12.2025) - Improved list punctuation
- **v1.1** (23.12.2025) - Added YouTube transformations
- **v1.0** (21.12.2025) - Initial release

---

## 🐛 Known Issues
None reported for v1.34.

---

## 📞 Support
- GitHub: https://github.com/nomidua/clean-html-script
- Issues: https://github.com/nomidua/clean-html-script/issues

---

## 📄 License
MIT License - free to use and modify.
