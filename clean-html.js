 /**
 * Clean HTML Script
 * Version: 1.53
 * Updated: 07.02.2026
 * GitHub: https://github.com/nomidua/clean-html-script
 * CDN: https://cdn.jsdelivr.net/gh/nomidua/clean-html-script@main/clean-html.js
 * 
 * Порядок выполнения:
 * БЛОК 1: Удаление атрибутов (1.1-1.7)
 * БЛОК 2: Очистка пустых тегов (2.1-2.11)
 * БЛОК 3: Удаление style/class (3.1-3.4)
 * БЛОК 4: Форматирование текста (4.1-4.5)
 * БЛОК 5: Преобразования (5.1-5.8)
 * БЛОК 6: Добавление атрибутов (6.1-6.5)
 * БЛОК 7: Финальная обработка (7.1-7.2)
 */

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

 // ===== БЛОК 1: УДАЛЕНИЕ АТРИБУТОВ =====

 // 1.1. Убираем атрибут dir="ltr"
 html = html.replace(/\s*dir="ltr"/gi, '');

 // 1.2. Убираем атрибут aria-level
 html = html.replace(/\s*aria-level="\d+"/gi, '');

 // 1.3. Убираем атрибут bis_size
 html = html.replace(/\s+bis_size="[^"]*"/gi, '');

 // 1.4. Убираем атрибут target="_new"
 html = html.replace(/\s+target="_new"\s*/gi, ' ');

 // 1.5. Убираем атрибут id
 html = html.replace(/\s+id="[^"]*"/gi, '');

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

 // 2.6. Удаляем все <div> и <span> (сохраняя содержимое)
 html = html.replace(/<div[^>]*>/gi, '');
 html = html.replace(/<\/div>/gi, '');
 html = html.replace(/<span[^>]*>/gi, '');
 html = html.replace(/<\/span>/gi, '');

 // 2.7. Удаляем теги <section>
 html = html.replace(/<section[^>]*>/gi, '');
 html = html.replace(/<\/section>/gi, '');

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
html = html.replace(/<p\s+style="margin-left:\s*(\d+)px;">/gi, '<p __PROTECTED_MARGIN__="$1">');

// 3.1.2. Защита style="text-align: center;" у параграфов с <!--IMG
html = html.replace(/<p\s+style="text-align:\s*center;">([\s\S]*?<!--IMG\d+-->[\s\S]*?)<\/p>/gi, function(match, content) {
 return '<p __PROTECTED_CENTER__="true">' + content + '</p>';
});

// 3.1.3. Защита style у <img>
html = html.replace(/(<img[^>]*)\s+style="([^"]*)"/gi, '$1 __PROTECTED_IMG_STYLE__="$2"');

// 3.2. Удаляем все style атрибуты
html = html.replace(/\s*style="[^"]*"/gi, '');

// 3.2.1. Возвращаем margin-left у параграфов
html = html.replace(/<p\s+__PROTECTED_MARGIN__="(\d+)">/gi, '<p style="margin-left: $1px;">');

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
 html = html.replace(/([.,!?;:])<a\s/gi, '$1 <a ');
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

 return '<iframe allowfullscreen="" frameborder="0" height="360" src="' + url + '" width="640">';
 });

 // 5.2. Преобразование YouTube ссылок в iframe
 html = html.replace(/<p>\s*(https?:\/\/(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]+)(?:[?&]([^<\s]*))?)?\s*<\/p>/gi, function(match, fullUrl, videoId, params) {
 if (!videoId) return match;

 var embedUrl = 'https://www.youtube.com/embed/' + videoId;

 if (params) {
 var timeMatch = params.match(/[?&]t=(\d+)s?/i);
 if (timeMatch) {
 var seconds = timeMatch[1];
 embedUrl += '?start=' + seconds;
 }
 }

 return '<p style="text-align: center;"><iframe allowfullscreen="" frameborder="0" height="360" src="' + embedUrl + '" width="640"></iframe></p>';
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

 // 6.2. Добавляем style к <h2>
 html = html.replace(/<h2>/gi, '<h2 style="text-align: center;">');

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

 // 6.5. Очистка таблиц и добавление style
 html = html.replace(/<table[^>]*>/gi, '<table style="width:100%;">');
 html = html.replace(/<thead[^>]*>/gi, '<thead>');
 html = html.replace(/<th[^>]*>/gi, '<th>');
 html = html.replace(/<tbody[^>]*>/gi, '<tbody>');
 html = html.replace(/<tr[^>]*>/gi, '<tr>');
 html = html.replace(/<td[^>]*>/gi, '<td>');

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
 cleaned = cleaned.replace(/(\s|&nbsp;|\.|\;|\,)+\s*<\/li>$/gi, '</li>');
 cleaned = cleaned.replace(/(\s|&nbsp;|\.|\;|\,)+\s*(<\/a>)/gi, '$2');

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
 // Проверяем, есть ли уже нужный знак
 var hasCorrectPunctuation = new RegExp('[' + punctuation.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ']\\s*<\/li>$', 'i').test(cleaned);
 if (!hasCorrectPunctuation) {
 cleaned = cleaned.replace(/<\/li>$/i, punctuation + '</li>');
 }
 }

 return cleaned;
 });

 return '<' + tag + '>' + processedItems.join('') + '</' + tag + '>';
 });

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

 function showNotification(message, color) {
 var oldNotif = document.querySelector('[data-clean-html-notif]');
 if (oldNotif) oldNotif.remove();

 var notif = document.createElement('div');
 notif.setAttribute('data-clean-html-notif', 'true');

 notif.innerHTML = '<div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 10px;">' +
 '<strong style="font-size: 18px;">Результат очистки</strong>' +
 '<button id="close-notif" style="background: none; border: none; color: white; font-size: 36px; cursor: pointer; padding: 0; margin-left: 20px; line-height: 1;">&times;</button>' +
 '</div>' +
 message +
 '<div id="timer-bar" style="margin-top: 15px; font-size: 14px; opacity: 0.8;">' +
 'Закроется через: <span id="timer-count">5</span> сек' +
 '</div>' +
 '<div style="width: 100%; height: 3px; background: rgba(255,255,255,0.3); margin-top: 8px; border-radius: 2px; overflow: hidden;">' +
 '<div id="progress-bar" style="width: 100%; height: 100%; background: white; transition: width 0.1s linear;"></div>' +
 '</div>';

 notif.style.cssText = 'position: fixed;' +
 'top: 5px;' +
 'right: 5px;' +
 'background: ' + color + ';' +
 'color: white;' +
 'padding: 25px 30px;' +
 'border-radius: 4px;' +
 'z-index: 999999;' +
 'font-size: 16px;' +
 'box-shadow: 0 4px 12px rgba(0,0,0,0.3);' +
 'font-family: Arial, sans-serif;' +
 'min-width: 350px;' +
 'max-width: 500px;';

 document.body.appendChild(notif);

 var closeBtn = notif.querySelector('#close-notif');
 var interval;

 closeBtn.addEventListener('click', function() {
 clearInterval(interval);
 notif.remove();
 });

 var timeLeft = 5;
 var timerElement = notif.querySelector('#timer-count');
 var progressBar = notif.querySelector('#progress-bar');

 interval = setInterval(function() {
 timeLeft--;
 timerElement.textContent = timeLeft;
 progressBar.style.width = (timeLeft / 5 * 100) + '%';

 if (timeLeft <= 0) {
 clearInterval(interval);
 notif.remove();
 }
 }, 1000);
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
