// ==UserScript==
// @name         洛谷++
// @match        *://*.luogu.com.cn/*
// @grant        none
// @run-at       document-idle
// @version      B26_0_0
// ==/UserScript==
(function() {
    'use strict';
    const savedHotkey = JSON.parse(localStorage.getItem('luoguDarkHotkey')) || { alt: true, key: 'p' };
    let hotkey = savedHotkey;
    let isInverted = false;
    let listening = false;
    let dark = 'main, .top-bar, nav.sidebar, footer.lcolor-bg-background, div.ide-container, div.type-burger, div.rside, div.dropdown';

    function saveHotkey() {
        localStorage.setItem('luoguDarkHotkey', JSON.stringify(hotkey));
    }

    function createToggleButton() {
        if (document.getElementById('dark-mode-toggle-btn')) return;
        const button = document.createElement('div');
        button.id = 'dark-mode-toggle-btn';
        button.style.cssText = 'position:fixed;bottom:30px;right:30px;width:70px;height:70px;border-radius:50%;background:#333;color:#fff;display:flex;align-items:center;justify-content:center;font-size:40px;cursor:pointer;box-shadow:0 2px 10px rgba(0,0,0,0.3);z-index:9999;transition:all 0.2s;border:none;outline:none;';
        button.innerHTML = '⚙️';
        button.addEventListener('click', openSettingPanel);
        button.addEventListener('mouseenter', () => button.style.background = '#555');
        button.addEventListener('mouseleave', () => button.style.background = '#333');
        document.body.appendChild(button);
    }

    function openSettingPanel() {
        if (document.getElementById('setting-panel')) return;
        const mask = document.createElement('div');
        mask.id = 'setting-mask';
        mask.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;background:rgba(0,0,0,0.6);z-index:10000;';
        const panel = document.createElement('div');
        panel.id = 'setting-panel';
        panel.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);width:500px;height:400px;background:#1a1a1a;border-radius:12px;box-shadow:0 5px 20px rgba(0,0,0,0.5);z-index:10001;padding:20px;color:#fff;font-size:18px;line-height:2.2;user-select:none;';
        const closeBtn = document.createElement('div');
        closeBtn.innerText = '×';
        closeBtn.style.cssText = 'position:absolute;top:12px;right:16px;font-size:44px;cursor:pointer;color:#fff;font-weight:bold;line-height:44px;';
        const closePanel = () => { mask.remove(); panel.remove(); document.removeEventListener('keydown', listenNewHotkey); };
        closeBtn.onclick = closePanel;
        mask.onclick = closePanel;
        const content = document.createElement('div');
        content.style.marginTop = '40px';
        content.style.textAlign = 'center';
        const row = document.createElement('div');
        row.style.display = 'flex';
        row.style.justifyContent = 'center';
        row.style.gap = '30px';
        row.style.alignItems = 'center';
        const modeBtn = document.createElement('span');
        modeBtn.style.cssText = 'color:#4fc3f7;cursor:pointer;font-weight:bold;font-size:20px;';
        function updateModeBtn() { modeBtn.innerText = `深色模式：${isInverted ? '开 ✅' : '关 ❌'}`; }
        updateModeBtn();
        modeBtn.onclick = () => { toggleInvert(); updateModeBtn(); };
        const hkBtn = document.createElement('span');
        hkBtn.style.cssText = 'color:#4fc3f7;cursor:pointer;font-weight:bold;font-size:20px;';
        function updateHotkeyBtn() { hkBtn.innerText = `快捷键(只支持Alt+X)：${(hotkey.alt ? 'Alt+' : '') + hotkey.key.toUpperCase()}`; }
        updateHotkeyBtn();
        hkBtn.onclick = () => {
            if (listening) return;
            listening = true;
            hkBtn.innerText = '请按新快捷键...';
            document.addEventListener('keydown', listenNewHotkey);
        };
        function listenNewHotkey(e) {
            e.preventDefault();
            if (['Alt','Control','Shift','Meta'].includes(e.key)) return;
            listening = false;
            hotkey.alt = true;
            hotkey.key = e.key.toLowerCase();
            updateHotkeyBtn();
            saveHotkey();
            document.removeEventListener('keydown', listenNewHotkey);
        }
        row.appendChild(modeBtn);
        row.appendChild(hkBtn);
        content.appendChild(row);
        panel.appendChild(closeBtn);
        panel.appendChild(content);
        document.body.appendChild(mask);
        document.body.appendChild(panel);
    }

    function applyDark() {
        document.querySelectorAll(dark).forEach(el => { el.style.filter = 'invert(1) hue-rotate(180deg)'; });
    }

    function toggleInvert() {
        isInverted = !isInverted;
        isInverted ? applyDark() : document.querySelectorAll(dark).forEach(el => el.style.filter = '');
    }

    function watchRouteChange() {
        window.addEventListener('popstate', () => { if (isInverted) setTimeout(applyDark,100); setTimeout(createToggleButton,150); });
        const originalPush = history.pushState;
        history.pushState = function(...args) { originalPush.apply(this,args); if (isInverted) setTimeout(applyDark,100); setTimeout(createToggleButton,150); };
        const originalReplace = history.replaceState;
        history.replaceState = function(...args) { originalReplace.apply(this,args); if (isInverted) setTimeout(applyDark,100); setTimeout(createToggleButton,150); };
    }

    document.addEventListener('keydown', e => {
        if (listening) return;
        const correctAlt = hotkey.alt === e.altKey;
        const correctKey = e.key.toLowerCase() === hotkey.key;
        if (correctAlt && correctKey) { e.preventDefault(); toggleInvert(); }
    });

    setTimeout(() => {
        createToggleButton();
        if (location.host.includes('luogu.com.cn') && location.pathname !== '/' && location.pathname !== "/chat") {
            isInverted = true;
            applyDark();
        }
    }, 300);

    watchRouteChange();
})();
