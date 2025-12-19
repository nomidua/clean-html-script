/**
 * Clean HTML Script
 * Version: 0.91
 * Last Updated: 2025-12-17
 */

(function() {
    'use strict';

    // Глобальная функция для вызова из кнопки
    window.cleanHTMLContent = function() {
        var editor = null;
        var isCodeMirror = false;
        var isCKEditor = false;
        var html = '';
        var originalLength = 0;

        // 1. Пробуем найти CKEditor (визуальный редактор)
        if (typeof CKEDITOR !== 'undefined' && CKEDITOR.instances && CKEDITOR.instances.message) {
            var ckInstance = CKEDITOR.instances.message;
            html = ckInstance.getData();
            
            if (html) {
                isCKEditor = true;
                originalLength = html.length;
            }
        }

        // 2. Если CKEditor не нашли, пробуем найти textarea по имени/id
        if (!isCKEditor) {
            editor = document.querySelector('textarea[name="message"]') || 
                     document.querySelector('textarea#message') ||
                     document.querySelector('textarea.manFl');
            
            if (editor && editor.value) {
                html = editor.value;
                originalLength = html.length;
            } else {
                editor = null;
            }
        }

        // 3. Проверяем, есть ли CodeMirror
        if (!isCKEditor && !editor) {
            var activeElement = document.activeElement;

            // Ищем CodeMirror
            if (activeElement && activeElement.closest) {
                var cmWrapper = activeElement.closest('.CodeMirror');
                if (cmWrapper && cmWrapper.CodeMirror) {
                    editor = cmWrapper.CodeMirror;
                    isCodeMirror = true;
                }
            }

            // Если не нашли через активный элемент, ищем все CodeMirror на странице
            if (!editor) {
                var allCM = document.querySelectorAll('.CodeMirror');
                for (var i = 0; i < allCM.length; i++) {
                    if (allCM[i].CodeMirror) {
                        editor = allCM[i].CodeMirror;
                        isCodeMirror = true;
                        break;
                    }
                }
            }

            if (isCodeMirror && editor) {
                html = editor.getValue();
                originalLength = html.length;
            }
        }

        // 4. Если ничего не нашли - пробуем activeElement как textarea
        if (!isCKEditor && !isCodeMirror && !editor) {
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

        // ===== НАЧАЛО ОЧИСТКИ =====

        // 1. Убираем атрибуты dir="ltr"
        html = html.replace(/\s*dir="ltr"/gi, '');

        // 1.1. Убираем атрибуты aria-level с любыми цифрами
        html = html.replace(/\s*aria-level="\d+"/gi, '');

        // 1.2. Убираем атрибут bis_size с любым содержимым
        html = html.replace(/\s+bis_size="[^"]*"/gi, '');

        // 1.3. Убираем атрибут target="_new" у ссылок
        html = html.replace(/\s+target="_new"\s*/gi, ' ');

        // 1.4. Убираем атрибут id из всех тегов
        html = html.replace(/\s+id="[^"]*"/gi, '');

        // 2. Убираем пустые параграфы (включая с &nbsp;)
        html = html.replace(/<p[^>]*>(\s|&nbsp;)*<\/p>/gi, '');

        // 3. Убираем пустые li (включая с &nbsp;)
        html = html.replace(/<li[^>]*>(\s|&nbsp;)*<\/li>/gi, '');

        // 4. Убираем пустые ul
        html = html.replace(/<ul[^>]*>\s*<\/ul>/gi, '');

        // 5. Убираем пустые ol
        html = html.replace(/<ol[^>]*>\s*<\/ol>/gi, '');

        // 6. Убираем <p> внутри <li>
        html = html.replace(/<li>\s*<p>/gi, '<li>');
        html = html.replace(/<\/p>\s*<\/li>/gi, '</li>');

        // 7. Убираем style атрибуты
        html = html.replace(/\s*style="[^"]*"/gi, '');

        // 7.1 Добавляем style="text-align: center;" для параграфов с $IMAGE$
        html = html.replace(/<p>\$IMAGE(\d+)\$<\/p>/gi, '<p style="text-align: center;">$IMAGE$1$</p>');

        // 8. Убираем class атрибуты, НО не у <img>
        html = html.replace(/(<img[^>]*)\s+class="([^"]*)"/gi, '$1 __PROTECTED_CLASS__="$2"');
        html = html.replace(/\s*class="[^"]*"/gi, '');
        html = html.replace(/__PROTECTED_CLASS__="/gi, 'class="');

        // 8.1 Убираем конкретные ненужные стили
        html = html.replace(/\s+style="text-align:\s*justify;?"/gi, '');
        html = html.replace(/\s+style="text-decoration:\s*none;?"/gi, '');

        // 8.2 Убираем style="text-align: center" только в тегах БЕЗ $IMAGE$
        html = html.replace(/(<[^>]+)style="text-align:\s*center;?"([^>]*>(?!\$IMAGE)[^<]*<\/)/gi, '$1$2');

        // 9. Добавляем style к h2
        html = html.replace(/<h2>/gi, '<h2 style="text-align: center;">');

        // 9.1. Убираем <strong> и <b> внутри заголовков h2, h3, h4
        html = html.replace(/<(h[234][^>]*)><strong>(.*?)<\/strong><\/(h[234])>/gi, '<$1>$2</$3>');
        html = html.replace(/<(h[234][^>]*)><b>(.*?)<\/b><\/(h[234])>/gi, '<$1>$2</$3>');

        // 10. Убираем пробел перед процентами
        html = html.replace(/(\d+)\s+%/g, '$1%');

        // 11. Чистим множественные пробелы внутри текста
        html = html.replace(/[ \t]+/g, ' ');

        // 12. Форматируем код с переносами строк
        html = html.replace(/></g, '>\n<');

        // 13. Работа с тире
        html = html.replace(/&mdash;/g, '—');
        html = html.replace(/&ndash;/g, '–');
        html = html.replace(/(\d)\s*—\s*(\d)/g, '$1-$2');
        html = html.replace(/(\d)\s*–\s*(\d)/g, '$1-$2');
        html = html.replace(/\s+-\s+/g, ' &mdash; ');
        html = html.replace(/\s+–\s+/g, ' &mdash; ');
        html = html.replace(/\s+—\s+/g, ' &mdash; ');

        // 14. Удаляем пустые div (включая с &nbsp;)
        html = html.replace(/<div[^>]*>(\s|&nbsp;)*<\/div>/gi, '');

        // 14.1. Удаляем все теги <div> и <span>, но сохраняем содержимое
        html = html.replace(/<div[^>]*>/gi, '');
        html = html.replace(/<\/div>/gi, '');
        html = html.replace(/<span[^>]*>/gi, '');
        html = html.replace(/<\/span>/gi, '');

        // 15. Удаляем мусорные data-атрибуты
        html = html.replace(/\s+data-start="\d+"/gi, '');
        html = html.replace(/\s+data-end="\d+"/gi, '');

        // 16. Удаляем теги <section>, но сохраняем содержимое
        html = html.replace(/<section[^>]*>/gi, '');
        html = html.replace(/<\/section>/gi, '');

        // 17. Очистка таблиц
        html = html.replace(/<table[^>]*>/gi, '<table style="width:100%;">');
        html = html.replace(/<thead[^>]*>/gi, '<thead>');
        html = html.replace(/<th[^>]*>/gi, '<th>');
        html = html.replace(/<tbody[^>]*>/gi, '<tbody>');
        html = html.replace(/<tr[^>]*>/gi, '<tr>');
        html = html.replace(/<td[^>]*>/gi, '<td>');

        // 18. Очистка пробелов и &nbsp;
        html = html.replace(/&nbsp;<\//g, '</');
        html = html.replace(/\s&nbsp;/g, ' ');
        html = html.replace(/&nbsp;\s/g, ' ');
        html = html.replace(/(&nbsp;)+/g, ' ');
        html = html.replace(/  +/g, ' ');

// 19. Очистка и форматирование YouTube iframe (шаг 1: очистка атрибутов)
html = html.replace(/<iframe[^>]*(?:src|data-src)="[^"]*(?:youtube\.com\/embed\/|youtu\.be\/)[^"]*"[^>]*>/gi, function(match) {
    // Извлекаем URL из src или data-src (приоритет data-src)
    var dataSrcMatch = match.match(/data-src="([^"]*)"/i);
    var srcMatch = match.match(/src="([^"]*)"/i);
    var url = (dataSrcMatch && dataSrcMatch[1]) || (srcMatch && srcMatch[1]);
    
    if (!url || !/youtube\.com\/embed\/|youtu\.be\//i.test(url)) return match;
    
    // Очищаем URL - убираем всё после ?
    url = url.split('?')[0];
    
    // Нормализуем youtu.be -> youtube.com/embed/
    if (url.indexOf('youtu.be/') !== -1) {
        var videoId = url.split('youtu.be/')[1].split('?')[0].split('&')[0];
        url = 'https://www.youtube.com/embed/' + videoId;
    }
    
    // Формируем чистый iframe
    return '<iframe allowfullscreen="" frameborder="0" height="360" src="' + url + '" width="640">';
});

// 19.1. Оборачиваем YouTube iframe в <p style="text-align: center;">
html = html.replace(/<iframe[^>]+youtube\.com\/embed\/[^>]+><\/iframe>/gi, function(match) {
    // Проверяем, уже ли обёрнут в <p>
    return match;
});
html = html.replace(/(?:<p[^>]*>)?\s*(<iframe[^>]+youtube\.com\/embed\/[^>]+><\/iframe>)\s*(?:<\/p>)?/gi, '<p style="text-align: center;">$1</p>');

        // 20. Автоматическая расстановка знаков препинания в списках
        html = html.replace(/<(ul|ol)>([\s\S]*?)<\/\1>/gi, function(match, tag, content) {
            var items = content.match(/<li[^>]*>[\s\S]*?<\/li>/gi);
            if (!items || items.length === 0) return match;

            var firstItemText = items[0].replace(/<[^>]+>/g, '').trim();
            var firstLetter = firstItemText.match(/[а-яёА-ЯЁa-zA-Z]/);
            if (!firstLetter) return match;

            var isUpperCase = firstLetter[0] === firstLetter[0].toUpperCase();

            var processedItems = items.map(function(item, index) {
                var isLast = (index === items.length - 1);
                if (/[!?]\s*(<\/[^>]+>)*\s*<\/li>$/i.test(item)) {
                    return item;
                }

                var cleaned = item;
                cleaned = cleaned.replace(/(\s|&nbsp;|\.|\;|\,)+\s*<\/li>$/gi, '</li>');
                cleaned = cleaned.replace(/(\s|&nbsp;|\.|\;|\,)+\s*(<\/a>)/gi, '$2');

                var punctuation = isUpperCase ? '.' : (isLast ? '.' : ';');

                if (/<\/a>\s*<\/li>$/i.test(cleaned)) {
                    cleaned = cleaned.replace(/(<\/a>)\s*<\/li>$/i, '$1' + punctuation + '</li>');
                } else {
                    cleaned = cleaned.replace(/<\/li>$/i, punctuation + '</li>');
                }

                return cleaned;
            });

            return '<' + tag + '>' + processedItems.join('') + '</' + tag + '>';
        });

        // ===== КОНЕЦ ОЧИСТКИ =====

        // Устанавливаем очищенный текст обратно
        if (isCKEditor) {
            CKEDITOR.instances.message.setData(html);
        } else if (isCodeMirror) {
            editor.setValue(html);
        } else {
            editor.value = html;
            editor.dispatchEvent(new Event('input', { bubbles: true }));
            editor.dispatchEvent(new Event('change', { bubbles: true }));
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
