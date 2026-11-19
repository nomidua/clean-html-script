 /***
 * Clean HTML Script
 * Version: 2.3
 * Updated: 19.11.2026
 * GitHub: https://github.com/nomidua/clean-html-script
 * CDN: https://cdn.jsdelivr.net/gh/nomidua/clean-html-script@main/clean-html.js
 * Update and Clear Cache: https://purge.jsdelivr.net/gh/nomidua/clean-html-script@main/clean-html.js
 * 
 * Порядок выполнения:
 * БЛОК 1: Удаление атрибутов (1.1-1.7)
 * БЛОК 2: Очистка пустых тегов (2.1-2.11)
 * БЛОК 3: Удаление style/class (3.1-3.4)
 * БЛОК 4: Форматирование текста (4.1-4.5)
 * БЛОК 5: Преобразования (5.1-5.8)
 * БЛОК 6: Добавление атрибутов (6.1-6.5)
 * БЛОК 7: Финальная обработка (7.1-7.2)
 ***/

(function() {
 'use strict';

 // Глобальная функция для вызова из кнопки
 window.cleanHTMLContent = function() {
 var editor = null;
 var isCodeMirror = false;
 var isCKEditor = false;
 var isTinyMCE = false;
 var html = '';
 var originalLength = 0;

 // Поиск редактора (CKEditor, textarea, CodeMirror, TinyMCE)
 if (typeof CKEDITOR !== 'undefined' && CKEDITOR.instances && CKEDITOR.instances.message) {
 var ckInstance = CKEDITOR.instances.message;
 html = ckInstance.getData();
 if (html) {
 isCKEditor = true;
 originalLength = html.length;
 }
 }

 // Поддержка WordPress TinyMCE
 if (!isCKEditor && typeof tinyMCE !== 'undefined') {
 var activeEditor = tinyMCE.activeEditor;
 if (!activeEditor || activeEditor.isHidden()) {
 activeEditor = tinyMCE.get('content');
 }
 if (activeEditor && !activeEditor.isHidden()) {
 editor = activeEditor;
 html = editor.getContent();
 if (html) {
 isTinyMCE = true;
 originalLength = html.length;
 }
 }
 }

 // Поиск обычных textarea и CodeMirror (WordPress Text mode)
 if (!isCKEditor && !isTinyMCE) {
 var textareaElement = document.querySelector('textarea#content') ||
 document.querySelector('textarea[name="message"]') ||
 document.querySelector('textarea#message') ||
 document.querySelector('textarea.manFl');

 if (textareaElement) {
 // Проверяем, есть ли у textarea прикрепленный CodeMirror
 var nextSibling = textareaElement.nextElementSibling;
 
 if (nextSibling && nextSibling.classList.contains('CodeMirror') && nextSibling.CodeMirror) {
 // Это WordPress Text Mode с CodeMirror
 editor = nextSibling.CodeMirror;
 isCodeMirror = true;
 html = editor.getValue();
 originalLength = html.length;
 } else if (textareaElement.value) {
 // Обычный textarea без CodeMirror
 editor = textareaElement;
 html = editor.value;
 originalLength = html.length;
 }
 }
 }

 // Резервный поиск CodeMirror (для других редакторов)
 if (!isCKEditor && !isTinyMCE && !editor) {
 var activeElement = document.activeElement;
 if (activeElement && activeElement.closest) {
 var cmWrapper = activeElement.closest('.CodeMirror');
 if (cmWrapper && cmWrapper.CodeMirror) {
 editor = cmWrapper.CodeMirror;
 isCodeMirror = true;
 html = editor.getValue();
 originalLength = html.length;
 }
 }

 if (!editor) {
 var allCM = document.querySelectorAll('.CodeMirror');
 for (var i = 0; i < allCM.length; i++) {
 if (allCM[i].CodeMirror) {
 editor = allCM[i].CodeMirror;
 isCodeMirror = true;
 html = editor.getValue();
 originalLength = html.length;
 break;
 }
 }
 }
 }

 // Последняя попытка - activeElement
 if (!isCKEditor && !isTinyMCE && !isCodeMirror && !editor) {
 editor = document.activeElement;
 if (editor && editor.tagName && editor.tagName.toLowerCase() === 'textarea' && editor.value) {
 html = editor.value;
 originalLength = html.length;
 } else {
 showNotification('Редактор или текст не найден!', '#f44336');
 return;
 }
 }

 if (!html) {
 showNotification('Нет содержимого для очистки!', '#ff9800');
 return;
 }

 // ===== БЛОК 0: ЗАЩИТА СОДЕРЖАНИЯ =====
 var tocContent = '';
 html = html.replace(/<div\s+class="table-of-contents">[\s\S]*?<\/div>/gi, function(match) {
     tocContent = match;
     return '__PROTECTED_TOC_PLACEHOLDER__';
 });

  // 0.2. Instagram и TikTok: любая вставка → минимальная родная (blockquote + embed.js), защищена до конца очистки
 var embeds = [], embedJs = {};
 function embedPut(code, js) {
     if (!embedJs[js]) { embedJs[js] = true; code += '\n<script async src="https://www.' + js + '.com/embed.js"></script>'; }
     embeds.push(code);
     return '__PROTECTED_EMBED_' + (embeds.length - 1) + '__';
 }
 function igEmbed(type, code, captioned) {
     var url = 'https://www.instagram.com/' + type + '/' + code + '/';
     return embedPut('<blockquote class="instagram-media"' + (captioned ? ' data-instgrm-captioned' : '') + ' data-instgrm-permalink="' + url + '" data-instgrm-version="14"><a href="' + url + '" target="_blank">' + url + '</a></blockquote>', 'instagram');
 }
 function ttEmbed(user, id) {
     var url = 'https://www.tiktok.com/@' + user + '/video/' + id;
     return embedPut('<blockquote class="tiktok-embed" cite="' + url + '" data-video-id="' + id + '" style="max-width: 605px;min-width: 325px;"><section><a href="' + url + '" target="_blank">' + url + '</a></section></blockquote>', 'tiktok');
 }
 html = html.replace(/\s*<script[^>]*src="[^"]*(?:instagram|tiktok)\.com\/embed\.js"[^>]*>\s*<\/script>/gi, '');
 html = html.replace(/<blockquote[^>]*class="[^"]*instagram-media[^"]*"[\s\S]*?<\/blockquote>/gi, function(m) {
     var u = m.match(/instagram\.com\/(?:[\w.]+\/)?(p|reel|tv)\/([\w-]+)/i);
     return u ? igEmbed(u[1].toLowerCase(), u[2], /data-instgrm-captioned/i.test(m)) : m;
 });
 html = html.replace(/<iframe[^>]*src="[^"]*instagram\.com\/(?:[\w.]+\/)?(p|reel|tv)\/([\w-]+)[^"]*"[^>]*>\s*(?:<\/iframe>)?/gi, function(m, type, code) {
     return igEmbed(type.toLowerCase(), code, /\/embed\/captioned/i.test(m));
 });
 html = html.replace(/<p[^>]*>\s*(?:<a[^>]*>)?\s*https?:\/\/(?:www\.)?instagram\.com\/(?:[\w.]+\/)?(p|reel|tv)\/([\w-]+)[^<\s]*\s*(?:<\/a>)?\s*<\/p>/gi, function(m, type, code) {
     return igEmbed(type.toLowerCase(), code, true);
 });
 html = html.replace(/<blockquote[^>]*class="[^"]*tiktok-embed[^"]*"[\s\S]*?<\/blockquote>/gi, function(m) {
     var u = m.match(/tiktok\.com\/@([\w.-]+)\/video\/(\d+)/i);
     return u ? ttEmbed(u[1], u[2]) : m;
 });
 html = html.replace(/<p[^>]*>\s*(?:<a[^>]*>)?\s*https?:\/\/(?:www\.)?tiktok\.com\/@([\w.-]+)\/video\/(\d+)[^<\s]*\s*(?:<\/a>)?\s*<\/p>/gi, function(m, user, id) {
     return ttEmbed(user, id);
 });

 // 0.1. Защита <script> (JSON-LD и другие вставленные скрипты)
 var scriptBlocks = [];
 html = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, function(match) {
     scriptBlocks.push(match);
     return '__PROTECTED_SCRIPT_' + (scriptBlocks.length - 1) + '__';
 });

 // ===== БЛОК 1: УДАЛЕНИЕ АТРИБУТОВ =====

 // 1.1. Убираем атрибут dir="ltr"
 html = html.replace(/\s*dir="ltr"/gi, '');

 // 1.2. Убираем атрибут aria-level
 html = html.replace(/\s*aria-level="\d+"/gi, '');

 // 1.3. Убираем атрибут bis_size
 html = html.replace(/\s+bis_size="[^"]*"/gi, '');

 // 1.4. Убираем атрибут target="_new"
 html = html.replace(/\s+target="_new"\s*/gi, ' ');

 // 1.5. Убираем атрибут id // OLD
 // html = html.replace(/\s+id="[^"]*"/gi, '');

 // 1.5. Убираем атрибут id (оставляем у h2, ТОЛЬКО если есть содержание)
 if (tocContent) { html = html.replace(/(<h2[^>]*?)\s+id="([^"]*)"([^>]*?>)/gi, '$1 __PROTECTED_H2_ID__="$2"$3'); }
 html = html.replace(/\s+id="[^"]*"/gi, '');
 if (tocContent) { html = html.replace(/__PROTECTED_H2_ID__="/gi, 'id="'); }

 // 1.6. Убираем все data-* атрибуты
 html = html.replace(/\s+data-[a-z-]+="[^"]*"/gi, '');

 // 1.7. Убираем атрибут role="presentation"
 html = html.replace(/\s+role="presentation"/gi, '');

 // ===== БЛОК 2: ОЧИСТКА ПУСТЫХ ТЕГОВ =====

 // 2.1. Удаляем теги <font>
 html = html.replace(/<\/?font[^>]*>/gi, '');

 // 2.2. Убираем пустые параграфы
 html = html.replace(/<p[^>]*>(\s|&nbsp;)*<\/p>/gi, '');

 // 2.3. Удаляем параграфы и div с рекламным мусором
 html = html.replace(/<p[^>]*>\s*(ad|ads|читайте\s+также:?)\s*<\/p>/gi, '');
 html = html.replace(/<div[^>]*>\s*(ad|ads|читайте\s+також:?)\s*<\/div>/gi, '');

 // 2.4. Убираем пустые div
 html = html.replace(/<div[^>]*>(\s|&nbsp;)*<\/div>/gi, '');

 // 2.5. Удаляем пустые <b> и <b> вокруг других тегов
 for (var i = 0; i < 5; i++) {
 html = html.replace(/<b[^>]*>\s*<\/b>/gi, '');
 html = html.replace(/<b[^>]*>\s*(<[^>]+>.*?<\/[^>]+>)\s*<\/b>/gi, '$1');
 }
 
 // 2.5.1. Преобразуем <div> с $IMAGE$ в <p> с центрированием
html = html.replace(/<div[^>]*>\s*\$IMAGE(\d+)\$\s*<\/div>/gi, function(match, num) {
 return '<p style="text-align: center;">$IMAGE' + num + '$</p>';
});
 
// 2.5.2. Преобразуем <div style="margin-left: XXpx;"> в <p>
html = html.replace(/<div\s+style="margin-left:\s*(\d+)px;">([\s\S]*?)<\/div>/gi, function(match, pixels, text) {
 return '<p style="margin-left: ' + pixels + 'px;">' + text + '</p>';
});
 
// 2.5.3. Преобразуем <h2>, <h3>, <h4> с $IMAGE$ в <p>
html = html.replace(/<h[234][^>]*>\s*\$IMAGE(\d+)\$\s*<\/h[234]>/gi, function(match, num) {
 return '<p style="text-align: center;">$IMAGE' + num + '$</p>';
});

 // 2.5.4. Заменяем <b> на <strong>
 html = html.replace(/<b(\s[^>]*)?>/gi, '<strong>').replace(/<\/b>/gi, '</strong>');

 // 2.6. Удаляем все <div> и <span> (сохраняя содержимое)
 html = html.replace(/<div[^>]*>/gi, '');
 html = html.replace(/<\/div>/gi, '');
 html = html.replace(/<span[^>]*>/gi, '');
 html = html.replace(/<\/span>/gi, '');

 // 2.7. Удаляем теги <section> и <aside>
 html = html.replace(/<section[^>]*>/gi, '');
 html = html.replace(/<\/section>/gi, '');
 html = html.replace(/<aside[^>]*>/gi, '');
 html = html.replace(/<\/aside>/gi, '');

 // 2.8. Очистка списков - пустые <li>
 html = html.replace(/<li[^>]*>(\s|&nbsp;)*<\/li>/gi, '');

 // 2.9. Очистка списков - пустые <ul>
 html = html.replace(/<ul[^>]*>\s*<\/ul>/gi, '');

 // 2.10. Очистка списков - пустые <ol>
 html = html.replace(/<ol[^>]*>\s*<\/ol>/gi, '');

 // 2.11. Убираем <p> внутри <li>
 html = html.replace(/<li>\s*<p>/gi, '<li>');
 html = html.replace(/<\/p>\s*<\/li>/gi, '</li>');

// 2.12. Удаляем лишние <br /> в начале и конце тегов
// Удаляем <br /> сразу после открывающего тега
html = html.replace(/(<(?:p|h[1-6]|li|blockquote|td|th)[^>]*>)(?:\s|&nbsp;)*(?:<br\s*\/?>)+(?:\s|&nbsp;)*/gi, '$1');
// Удаляем один или несколько <br /> перед закрывающим тегом
html = html.replace(/(?:\s|&nbsp;)*(?:<br\s*\/?>)+(?:\s|&nbsp;)*(<\/(?:p|h[1-6]|li|blockquote|td|th)>)/gi, '$1');
  
 // ===== БЛОК 3: УДАЛЕНИЕ STYLE/CLASS =====

// 3.1. Защита style у параграфов с $IMAGE$
html = html.replace(/<p>\$IMAGE(\d+)\$<\/p>/gi, function(match, num) {
 return '<p style="text-align: center;">$IMAGE' + num + '$</p>';
});

// 3.1.1. Защита style="margin-left: XXpx;" у параграфов
html = html.replace(/<p\s+style="(margin|padding)-left:\s*(\d+)px;">/gi, '<p __PROTECTED_MARGIN__="$1:$2">');

// 3.1.2. Защита style="text-align: center;" у параграфов с <!--IMG и <iframe (YouTube)
html = html.replace(/<p\s+style="text-align:\s*center;">((?:(?!<\/p>)[\s\S])*?(?:<!--IMG\d+-->|<iframe)[\s\S]*?)<\/p>/gi, function(match, content) {
 return '<p __PROTECTED_CENTER__="true">' + content + '</p>';
});

// 3.1.3. Защита style у <img>
html = html.replace(/(<img[^>]*)\s+style="([^"]*)"/gi, '$1 __PROTECTED_IMG_STYLE__="$2"');

// 3.2. Удаляем все style атрибуты
html = html.replace(/\s*style="[^"]*"/gi, '');

// 3.2.1. Возвращаем margin-left у параграфов
html = html.replace(/<p\s+__PROTECTED_MARGIN__="(margin|padding):(\d+)">/gi, '<p style="$1-left: $2px;">');

// 3.2.2. Возвращаем text-align: center у параграфов с <!--IMG
html = html.replace(/<p\s+__PROTECTED_CENTER__="true">/gi, '<p style="text-align: center;">');

// 3.2.3. Возвращаем style у <img>
html = html.replace(/__PROTECTED_IMG_STYLE__="/gi, 'style="');

// 3.3. Возвращаем style для $IMAGE$
html = html.replace(/<p>\$IMAGE(\d+)\$<\/p>/gi, function(match, num) {
 return '<p style="text-align: center;">$IMAGE' + num + '$</p>';
});

// 3.4. Удаляем class (защищая <img> и <a class="ulightbox">)
html = html.replace(/(<img[^>]*)\s+class="([^"]*)"/gi, '$1 __PROTECTED_IMG_CLASS__="$2"');
html = html.replace(/(<a[^>]*)\s+class="ulightbox"/gi, '$1 __PROTECTED_LIGHTBOX__="ulightbox"');
html = html.replace(/\s*class="[^"]*"/gi, '');
html = html.replace(/__PROTECTED_IMG_CLASS__="/gi, 'class="');
html = html.replace(/__PROTECTED_LIGHTBOX__="/gi, 'class="');

 // ===== БЛОК 4: ФОРМАТИРОВАНИЕ ТЕКСТА =====

 // 4.1. Убираем пробел перед процентами
 html = html.replace(/(\d+)\s+%/g, '$1%');

 // 4.2. Чистим множественные пробелы
 html = html.replace(/[ \t]+/g, ' ');

 // 4.3. Работа с тире
 html = html.replace(/&mdash;/g, '—');
 html = html.replace(/&ndash;/g, '–');
 html = html.replace(/(\d)\s*—\s*(\d)/g, '$1-$2');
 html = html.replace(/(\d)\s*–\s*(\d)/g, '$1-$2');
 html = html.replace(/\s+-\s+/g, ' &mdash; ');
 html = html.replace(/\s+–\s+/g, ' &mdash; ');
 html = html.replace(/\s+—\s+/g, ' &mdash; ');
 html = html.replace(/(<\/(?:strong|b|em|i|a)>)(?:\s|&nbsp;)*—\s*/gi, '$1 &mdash; ');

 // 4.4. Очистка &nbsp;
 html = html.replace(/&nbsp;<\//g, '</');
 html = html.replace(/\s&nbsp;/g, ' ');
 html = html.replace(/&nbsp;\s/g, ' ');
 html = html.replace(/(&nbsp;)+/g, ' ');
 html = html.replace(/ +/g, ' ');

 // 4.5. Очистка пробелов в ссылках, предложениях и абзацах
 html = html.replace(/(<a\s[^>]*>)\s+/gi, '$1');
 html = html.replace(/\s+<\/a>/gi, '</a>');
 html = html.replace(/&nbsp;<a\s/gi, ' <a ');
 html = html.replace(/<\/a>&nbsp;/gi, '</a> ');
 html = html.replace(/([а-яёА-ЯЁa-zA-Z0-9])<a\s/gi, '$1 <a ');
 html = html.replace(/<\/a>([а-яёА-ЯЁa-zA-Z0-9])/gi, '</a> $1');
 html = html.replace(/(&[a-zA-Z0-9#]+;|[.,!?;:])<a\s/gi, function(m, p) { return p.charAt(0) === '&' ? m : p + ' <a '; });
 html = html.replace(/<\/a>([.,!?;:])/gi, '</a>$1 ');
 html = html.replace(/(\s|&nbsp;)+([.,!?;:])/g, '$2');

 // ===== БЛОК 5: ПРЕОБРАЗОВАНИЯ =====

 // 5.1. Очистка YouTube iframe
 html = html.replace(/<iframe[^>]*(?:src|data-src)="[^"]*(?:youtube\.com\/embed\/|youtu\.be\/)[^"]*"[^>]*>/gi, function(match) {
 var dataSrcMatch = match.match(/data-src="([^"]*)"/i);
 var srcMatch = match.match(/src="([^"]*)"/i);
 var url = (dataSrcMatch && dataSrcMatch[1]) || (srcMatch && srcMatch[1]);

 if (!url || !/youtube\.com\/embed\/|youtu\.be\//i.test(url)) return match;

 url = url.split('?')[0];

 if (url.indexOf('youtu.be/') !== -1) {
 var videoId = url.split('youtu.be/')[1].split('?')[0].split('&')[0];
 url = 'https://www.youtube.com/embed/' + videoId;
 }

 return '<iframe allowfullscreen="" frameborder="0" height="360" loading="lazy" src="' + url + '" width="640">';
 });

 // 5.2. Преобразование YouTube ссылок в iframe
 html = html.replace(/<p>\s*(https?:\/\/(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]+)(?:[?&]([^<\s]*))?)?\s*<\/p>/gi, function(match, fullUrl, videoId, params) {
 if (!videoId) return match;

 var embedUrl = 'https://www.youtube.com/embed/' + videoId;

 if (params) {
 var timeMatch = params.match(/[?&]t=(\d+)s?/i);
 if (timeMatch) {
 var seconds = timeMatch[1];
 embedUrl += '?start=' + seconds;
 }
 }

 return '<p style="text-align: center;"><iframe allowfullscreen="" frameborder="0" height="360" loading="lazy" src="' + embedUrl + '" width="640"></iframe></p>';
 });

 // 5.3. Преобразование <dl> в <ul>
 html = html.replace(/<dl[^>]*>([\s\S]*?)<\/dl>/gi, function(match, content) {
 var items = [];

 var dtList = [];
 var ddList = [];

 var dtRegex = /<dt[^>]*>([\s\S]*?)<\/dt>/gi;
 var dtMatch;
 while ((dtMatch = dtRegex.exec(content)) !== null) {
 dtList.push(dtMatch[1].trim());
 }

 var ddRegex = /<dd[^>]*>([\s\S]*?)<\/dd>/gi;
 var ddMatch;
 while ((ddMatch = ddRegex.exec(content)) !== null) {
 ddList.push(ddMatch[1].trim());
 }

 if (dtList.length === 0) return '';

 for (var i = 0; i < dtList.length; i++) {
 var name = dtList[i];
 var quantity = ddList[i] || '';

 if (quantity) {
 items.push('<li>' + name + ' &mdash; ' + quantity + '</li>');
 } else {
 items.push('<li>' + name + '</li>');
 }
 }

 return '<ul>\n' + items.join('\n') + '\n</ul>\n<p></p>';
 });

 // 5.4. Объединяем соседние <ul>
 html = html.replace(/<\/ul>\s*<p><\/p>\s*<ul>/gi, '');

 // ===== БЛОК 6: ДОБАВЛЕНИЕ АТРИБУТОВ =====

 // 6.1. Конвертируем <h1> в <h2> (SEO: только один H1 на странице)
 html = html.replace(/<h1([^>]*)>/gi, '<h2$1>');
 html = html.replace(/<\/h1>/gi, '</h2>');

 // 6.2. Добавляем style к <h2> // OLD
 // html = html.replace(/<h2>/gi, '<h2 style="text-align: center;">');

 // 6.2. Добавляем style к <h2>
 html = html.replace(/<h2([^>]*)>/gi, '<h2$1 style="text-align: center;">');

 // 6.3. Удаляем точку и запятую в конце заголовков h2, h3, h4
 html = html.replace(/[.,]\s*<\/(h[234])>/gi, '</$1>');

 // 6.4. Убираем <strong> и <b> из заголовков h2, h3, h4
 html = html.replace(/<h2([^>]*)>([\s\S]*?)<\/h2>/gi, function(match, attrs, content) {
 content = content.replace(/<\/?strong>/gi, '').replace(/<\/?b>/gi, '');
 return '<h2' + attrs + '>' + content + '</h2>';
 });

 html = html.replace(/<h3([^>]*)>([\s\S]*?)<\/h3>/gi, function(match, attrs, content) {
 content = content.replace(/<\/?strong>/gi, '').replace(/<\/?b>/gi, '');
 return '<h3' + attrs + '>' + content + '</h3>';
 });

 html = html.replace(/<h4([^>]*)>([\s\S]*?)<\/h4>/gi, function(match, attrs, content) {
 content = content.replace(/<\/?strong>/gi, '').replace(/<\/?b>/gi, '');
 return '<h4' + attrs + '>' + content + '</h4>';
 });

 // 6.5. Очистка таблиц и добавление style // OLD
 // html = html.replace(/<table[^>]*>/gi, '<table style="width:100%;">');
 // html = html.replace(/<thead[^>]*>/gi, '<thead>');
 // html = html.replace(/<th[^>]*>/gi, '<th>');
 // html = html.replace(/<tbody[^>]*>/gi, '<tbody>');
 // html = html.replace(/<tr[^>]*>/gi, '<tr>');
 // html = html.replace(/<td[^>]*>/gi, '<td>');

 // 6.5. Очистка таблиц: удаляем все атрибуты у внутренних тегов и задаем стиль основной таблице
 // Сначала очищаем все атрибуты у table, thead, tbody, tr, th, td
 html = html.replace(/<(table|thead|tbody|tr|th|td)\b[^>]*>/gi, '<$1>');
 // Затем добавляем нужный стиль только для основного тега table
 html = html.replace(/<table>/gi, '<table style="width: 100%;">');

 // ===== БЛОК 7: ФИНАЛЬНАЯ ОБРАБОТКА =====

 // 7.1. Форматируем код с переносами строк
 html = html.replace(/></g, '>\n<');

 // 7.2. Автоматическая расстановка знаков препинания в списках
 html = html.replace(/<(ul|ol)>\s*([\s\S]*?)\s*<\/\1>/gi, function(match, tag, content) {
 var items = content.match(/<li[^>]*>[\s\S]*?<\/li>/gi);
 if (!items || items.length === 0) return match;

 var firstItemText = items[0].replace(/<[^>]+>/g, '').trim();
 var firstLetter = firstItemText.match(/[а-яёіїєґА-ЯЁІЇЄҐa-zA-Z]/);
 if (!firstLetter) return match;

 var isUpperCase = firstLetter[0] === firstLetter[0].toUpperCase();

 var processedItems = items.map(function(item, index) {
 var isLast = (index === items.length - 1);

 // Не трогаем ! и ?
 if (/[!?]\s*(<\/[^>]+>)*\s*<\/li>$/i.test(item)) {
 return item;
 }

 var cleaned = item;

 // Удаляем лишние знаки в конце
 cleaned = cleaned.replace(/(&(?!nbsp;)[a-zA-Z0-9#]+;)?(?:\s|&nbsp;|[.;,])*<\/li>$/i, '$1</li>');
 cleaned = cleaned.replace(/(&(?!nbsp;)[a-zA-Z0-9#]+;)?(?:\s|&nbsp;|[.;,])*(<\/a>)/gi, '$1$2');

 // Определяем нужный знак
 var punctuation;
 if (isUpperCase) {
 punctuation = '.'; // Заглавная → всегда точка
 } else {
 punctuation = isLast ? '.' : ';'; // Строчная → ; или .
 }

 // Добавляем знак (если его ещё нет)
 if (/<\/a>\s*<\/li>$/i.test(cleaned)) {
 cleaned = cleaned.replace(/(<\/a>)\s*<\/li>$/i, '$1' + punctuation + '</li>');
 } else {
 cleaned = cleaned.replace(/<\/li>$/i, punctuation + '</li>');
 }

 return cleaned;
 });

 return '<' + tag + '>' + processedItems.join('') + '</' + tag + '>';
 });

  // Возвращаем блок содержания на место
 if (tocContent) {
     html = html.replace('__PROTECTED_TOC_PLACEHOLDER__', tocContent);
 }

  // Возвращаем защищенные <script> на место
 for (var si = 0; si < scriptBlocks.length; si++) {
     html = html.replace('__PROTECTED_SCRIPT_' + si + '__', scriptBlocks[si]);
 }

  // Возвращаем вставки Instagram и TikTok на место
 for (var ei = 0; ei < embeds.length; ei++) {
     html = html.replace(new RegExp('<p[^>]*>\\s*__PROTECTED_EMBED_' + ei + '__\\s*</p>|__PROTECTED_EMBED_' + ei + '__'), function() { return embeds[ei]; });
 }

 // ===== КОНЕЦ ОЧИСТКИ =====
 
 // Устанавливаем очищенный текст обратно v3
if (isCKEditor) {
 CKEDITOR.instances.message.setData(html);
} else if (isTinyMCE) {
 editor.setContent(html);
} else if (isCodeMirror) {
 editor.setValue(html);
} else {
 editor.value = html;
 editor.dispatchEvent(new Event('input', {
 bubbles: true
 }));
 editor.dispatchEvent(new Event('change', {
 bubbles: true
 }));
}

 // Показываем результат
 var saved = originalLength - html.length;
 showNotification('Код HTML очищен!<br /><br />Удалено ' + saved + ' символов', '#4CAF50');
 };

 // Уведомления: как на uCoz (uzToast). Если u-add-page.js не подключён (WordPress) — создаём uzToast здесь
 function showNotification(message, color) {
 if (!window.uzToast) {
 var s = document.createElement('style');
 s.textContent = '@keyframes uzIn{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:none}}@keyframes uzBar{from{transform:scaleX(1)}to{transform:scaleX(0)}}' +
 '#uz-toasts{position:fixed;top:16px;right:16px;z-index:999999;display:flex;flex-direction:column;gap:10px;width:380px;max-width:calc(100vw - 32px)}' +
 '.uz-t{position:relative;overflow:hidden;cursor:pointer;padding:14px 18px 17px;border-radius:10px;border:1px solid rgba(255,255,255,.7);background-color:rgba(255,255,255,.72);-webkit-backdrop-filter:blur(12px) saturate(1.4);backdrop-filter:blur(12px) saturate(1.4);box-shadow:0 8px 24px rgba(0,0,0,.15);font:16px/1.45 Arial,sans-serif;color:#222;text-align:left;animation:uzIn .25s ease-out}' +
 '.uz-t strong:first-child{display:block;margin-bottom:3px}' +
 '.uz-t i{position:absolute;left:0;bottom:0;height:3px;width:100%;transform-origin:left;animation:uzBar 5000ms linear forwards}' +
 '.uz-t:hover i{animation-play-state:paused}';
 document.head.appendChild(s);
 window.uzToast = function (msg, type) {
 type = type === 'info' || type === 'ok' || type === 'err' ? type : (type ? 'ok' : 'err');
 var tint = {ok: 'rgba(22,163,74,.22)', err: 'rgba(220,38,38,.22)', info: 'transparent'}[type],
 bar = {ok: '#16a34a', err: '#dc2626', info: '#9ca3af'}[type],
 box = document.getElementById('uz-toasts');
 if (!box) { box = document.createElement('div'); box.id = 'uz-toasts'; document.body.appendChild(box); }
 while (box.children.length >= 3) box.removeChild(box.firstChild);
 var t = document.createElement('div');
 t.className = 'uz-t';
 t.style.backgroundImage = 'radial-gradient(120% 140% at 100% 100%,' + tint + ',transparent 55%)';
 t.innerHTML = String(msg).replace(/^(<strong>[\s\S]*?<\/strong>)\s*<br\s*\/?>/i, '$1') + '<i style="background:' + bar + '"></i>';
 t.onclick = function () { t.remove(); };
 t.lastChild.addEventListener('animationend', function () { t.remove(); });
 box.appendChild(t);
 };
 }
 window.uzToast('<strong>Очистка HTML</strong>' + message.replace(/(<br\s*\/?>\s*)+/gi, '<br>'), color === '#4CAF50' ? 'ok' : 'err');
 }

 // Горячие клавиши Ctrl+Shift+L
 document.addEventListener('keydown', function(e) {
 if (e.ctrlKey && e.shiftKey && e.code === 'KeyL') {
 e.preventDefault();
 e.stopPropagation();
 window.cleanHTMLContent();
 }
 }, true);

})();
