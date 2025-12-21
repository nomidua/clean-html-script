/**
 * Clean HTML Script
 * Version: 1.02 (Reorganized)
 * Updated: 2025-12-21
 * 
 * Порядок выполнения:
 * 1. Удаление атрибутов
 * 2. Очистка тегов
 * 3. Удаление style/class
 * 4. Форматирование
 * 5. Преобразования (YouTube, списки)
 * 6. Добавление атрибутов
 * 7. Финальная обработка
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

        // Поиск редактора (CKEditor, textarea, CodeMirror)
        if (typeof CKEDITOR !== 'undefined' && CKEDITOR.instances && CKEDITOR.instances.message) {
            var ckInstance = CKEDITOR.instances.message;
            html = ckInstance.getData();
            if (html) {
                isCKEditor = true;
                originalLength = html.length;
            }
        }

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

        if (!isCKEditor && !editor) {
            var activeElement = document.activeElement;
            if (activeElement && activeElement.closest) {
                var cmWrapper = activeElement.closest('.CodeMirror');
                if (cmWrapper && cmWrapper.CodeMirror) {
                    editor = cmWrapper.CodeMirror;
                    isCodeMirror = true;
                }
            }

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

        // ===== БЛОК 1: УДАЛЕНИЕ АТРИБУТОВ =====

        // 1. Убираем атрибут dir="ltr"
        html = html.replace(/\s*dir="ltr"/gi, '');

        // 2. Убираем атрибут aria-level
        html = html.replace(/\s*aria-level="\d+"/gi, '');

        // 3. Убираем атрибут bis_size
        html = html.replace(/\s+bis_size="[^"]*"/gi, '');

        // 4. Убираем атрибут target="_new"
        html = html.replace(/\s+target="_new"\s*/gi, ' ');

        // 5. Убираем атрибут id
        html = html.replace(/\s+id="[^"]*"/gi, '');

        // 6. Убираем все data-* атрибуты
        html = html.replace(/\s+data-[a-z-]+="[^"]*"/gi, '');

        // 6.1 Убираем атрибут role="presentation"
        html = html.replace(/\s+role="presentation"/gi, '');

        // 7. Удаляем теги <font>
        html = html.replace(/<\/?font[^>]*>/gi, '');

        // ===== БЛОК 2: ОЧИСТКА ПУСТЫХ ТЕГОВ =====

        // 8. Убираем пустые параграфы
        html = html.replace(/<p[^>]*>(\s|&nbsp;)*<\/p>/gi, '');

        // 9. Убираем пустые div
        html = html.replace(/<div[^>]*>(\s|&nbsp;)*<\/div>/gi, '');
        
        // 9.1. Удаляем <b id="..."> и содержимое <span> внутри (Google Docs специфика)
        html = html.replace(/<b\s+id="[^"]*"[^>]*>\s*<span[^>]*>([\s\S]*?)<\/span>\s*<\/b>/gi, '$1');

        // 10. Удаляем все <div> и <span> (сохраняя содержимое)
        html = html.replace(/<div[^>]*>/gi, '');
        html = html.replace(/<\/div>/gi, '');
        html = html.replace(/<span[^>]*>/gi, '');
        html = html.replace(/<\/span>/gi, '');

        // 11. Удаляем теги <section>
        html = html.replace(/<section[^>]*>/gi, '');
        html = html.replace(/<\/section>/gi, '');

        // ===== БЛОК 3: УДАЛЕНИЕ STYLE/CLASS =====

        // 12. Защита style у параграфов с $IMAGE$ (добавляем временно)
        html = html.replace(/<p>\$IMAGE(\d+)\$<\/p>/gi, function(match, num) {
            return '<p style="text-align: center;">$IMAGE' + num + '$</p>';
        });

        // 13. Удаляем все style атрибуты
        html = html.replace(/\s*style="[^"]*"/gi, '');

        // 14. Возвращаем style для $IMAGE$
        html = html.replace(/<p>\$IMAGE(\d+)\$<\/p>/gi, function(match, num) {
            return '<p style="text-align: center;">$IMAGE' + num + '$</p>';
        });

        // 15. Удаляем class (защищая <img>)
        html = html.replace(/(<img[^>]*)\s+class="([^"]*)"/gi, '$1 __PROTECTED_CLASS__="$2"');
        html = html.replace(/\s*class="[^"]*"/gi, '');
        html = html.replace(/__PROTECTED_CLASS__="/gi, 'class="');

        // ===== БЛОК 4: ФОРМАТИРОВАНИЕ ТЕКСТА =====

        // 16. Убираем пробел перед процентами
        html = html.replace(/(\d+)\s+%/g, '$1%');

        // 17. Чистим множественные пробелы
        html = html.replace(/[ \t]+/g, ' ');

        // 18. Работа с тире
        html = html.replace(/&mdash;/g, '—');
        html = html.replace(/&ndash;/g, '–');
        html = html.replace(/(\d)\s*—\s*(\d)/g, '$1-$2');
        html = html.replace(/(\d)\s*–\s*(\d)/g, '$1-$2');
        html = html.replace(/\s+-\s+/g, ' &mdash; ');
        html = html.replace(/\s+–\s+/g, ' &mdash; ');
        html = html.replace(/\s+—\s+/g, ' &mdash; ');

        // 19. Очистка &nbsp;
        html = html.replace(/&nbsp;<\//g, '</');
        html = html.replace(/\s&nbsp;/g, ' ');
        html = html.replace(/&nbsp;\s/g, ' ');
        html = html.replace(/(&nbsp;)+/g, ' ');
        html = html.replace(/ +/g, ' ');

        // 20. Очистка пробелов в ссылках
        html = html.replace(/(<a\s[^>]*>)\s+/gi, '$1');
        html = html.replace(/\s+<\/a>/gi, '</a>');
        html = html.replace(/&nbsp;<a\s/gi, ' <a ');
        html = html.replace(/<\/a>&nbsp;/gi, '</a> ');
        html = html.replace(/([а-яёА-ЯЁa-zA-Z0-9])<a\s/gi, '$1 <a ');
        html = html.replace(/<\/a>([а-яёА-ЯЁa-zA-Z0-9])/gi, '</a> $1');
        html = html.replace(/([.,!?;:])<a\s/gi, '$1 <a ');
        html = html.replace(/<\/a>([.,!?;:])/gi, '</a>$1 ');

        // ===== БЛОК 5: ПРЕОБРАЗОВАНИЯ =====

        // 21. Очистка YouTube iframe
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

        // 22. Преобразование YouTube ссылок в iframe
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

        // 23. Преобразование <dl> в <ul>
        html = html.replace(/<dl[^>]*>([\s\S]*?)<\/dl>/gi, function(match, content) {
            var items = [];
            
            content = content.replace(/<\/?(?:b|strong)>/gi, '');
            
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

        // 24. Объединяем соседние <ul>
        html = html.replace(/<\/ul>\s*<p><\/p>\s*<ul>/gi, '');

        // 25. Очистка списков - пустые <li>
        html = html.replace(/<li[^>]*>(\s|&nbsp;)*<\/li>/gi, '');

        // 26. Очистка списков - пустые <ul>
        html = html.replace(/<ul[^>]*>\s*<\/ul>/gi, '');

        // 27. Очистка списков - пустые <ol>
        html = html.replace(/<ol[^>]*>\s*<\/ol>/gi, '');

        // 28. Убираем <p> внутри <li>
        html = html.replace(/<li>\s*<p>/gi, '<li>');
        html = html.replace(/<\/p>\s*<\/li>/gi, '</li>');

        // ===== БЛОК 6: ДОБАВЛЕНИЕ АТРИБУТОВ =====

        // 29. Добавляем style к <h2>
        html = html.replace(/<h2>/gi, '<h2 style="text-align: center;">');

        // 30. Убираем <strong> и <b> из заголовков
        html = html.replace(/<(h[234][^>]*)><strong>(.*?)<\/strong><\/(h[234])>/gi, '<$1>$2</$3>');
        html = html.replace(/<(h[234][^>]*)><b>(.*?)<\/b><\/(h[234])>/gi, '<$1>$2</$3>');

        // 31. Очистка таблиц и добавление style
        html = html.replace(/<table[^>]*>/gi, '<table style="width:100%;">');
        html = html.replace(/<thead[^>]*>/gi, '<thead>');
        html = html.replace(/<th[^>]*>/gi, '<th>');
        html = html.replace(/<tbody[^>]*>/gi, '<tbody>');
        html = html.replace(/<tr[^>]*>/gi, '<tr>');
        html = html.replace(/<td[^>]*>/gi, '<td>');

        // ===== БЛОК 7: ФИНАЛЬНАЯ ОБРАБОТКА =====

        // 32. Форматируем код с переносами строк
        html = html.replace(/></g, '>\n<');

        // 33. Автоматическая расстановка знаков препинания в списках
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
