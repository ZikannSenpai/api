document.addEventListener("DOMContentLoaded", init);

let globalConfig = null;
let toastTimeout;

function isMobileDevice() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
    );
}

async function init() {
    if (isMobileDevice()) {
        document.body.classList.add("is-mobile");
    }

    if (document.getElementById("term-logs")) {
        try {
            const response = await fetch("/config");
            globalConfig = await response.json();

            setUi(globalConfig);
            loadEnd(globalConfig.tags);
            startWIBClock();
            await kuroneko(globalConfig);
            loadReminder();
            setSearch();
        } catch (e) {
            document.getElementById("term-logs").innerHTML =
                `<span class="text-red-400 font-bold px-1">SYSTEM FAILURE</span><br>${e.message}`;
        }
    }
}

function showToast(msg, type = "info") {
    const toast = document.createElement("div");
    toast.className = `fixed bottom-5 right-5 px-6 py-3 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-white font-bold transform translate-y-10 opacity-0 transition-all duration-300 z-[100] flex items-center gap-3 font-mono text-sm ${type === "error" ? "bg-red-500" : "bg-green-500"}`;
    toast.innerHTML = `<i class="fa-solid ${type === "error" ? "fa-circle-exclamation" : "fa-check-circle"}"></i> ${msg.toUpperCase()}`;
    document.body.appendChild(toast);
    requestAnimationFrame(() =>
        toast.classList.remove("translate-y-10", "opacity-0")
    );
    setTimeout(() => {
        toast.classList.add("translate-y-10", "opacity-0");
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

function startWIBClock() {
    const timeEl = document.getElementById("server-time");
    const dateEl = document.getElementById("server-date");
    if (!timeEl) return;

    updateTime();
    setInterval(updateTime, 1000);

    function updateTime() {
        const now = new Date();
        const timeString = now.toLocaleTimeString("id-ID", {
            timeZone: "Asia/Jakarta",
            hour12: false,
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit"
        });
        const dateString = now.toLocaleDateString("id-ID", {
            timeZone: "Asia/Jakarta",
            day: "numeric",
            month: "long",
            year: "numeric"
        });
        if (timeEl) timeEl.innerText = timeString;
        if (dateEl) dateEl.innerText = dateString;
    }
}

async function loadReminder() {
    try {
        const req = await fetch("../src/reminder.json");
        const data = await req.json();
        if (data?.message) {
            const el = document.getElementById("running-text");
            if (el) el.innerText = data.message.toUpperCase();
        }
    } catch (e) {
        console.warn("No reminder config found");
    }
}

function messeg(msg) {
    const toast = document.getElementById("custom-toast");
    const msgBox = document.getElementById("toast-message");
    if (!toast || !msgBox) return;

    msgBox.innerText = msg;
    toast.classList.remove("translate-y-32", "opacity-0");

    if (toastTimeout) clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
        toast.classList.add("translate-y-32", "opacity-0");
    }, 3000);
}

function terminalLog(message, type = "info") {
    const logs = document.getElementById("term-logs");
    if (!logs) return;

    const line = document.createElement("div");
    const time = new Date().toLocaleTimeString("en-US", {
        hour12: false,
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
    });

    let prefix = `<span class="text-primary/60 font-bold">[${time}]</span>`;

    if (type === "error") {
        prefix += ` <span class="text-red-500 font-bold">ERR</span>`;
        line.className = "text-red-400";
    } else if (type === "success") {
        prefix += ` <span class="text-green-500 font-bold">OK</span>`;
        line.className = "text-green-400";
    } else if (type === "warn") {
        prefix += ` <span class="text-yellow-500 font-bold">WARN</span>`;
        line.className = "text-yellow-400";
    } else if (type === "req-success") {
        line.className = "text-green-400";
    } else if (type === "req-error") {
        line.className = "text-red-400";
    } else {
        prefix += ` <span class="text-blue-400 font-bold">INFO</span>`;
        line.className = "text-gray-300";
    }

    line.innerHTML = `${prefix} ${message}`;
    logs.appendChild(line);
    logs.scrollTop = logs.scrollHeight;
}

async function kuroneko(config) {
    const logs = document.getElementById("term-logs");
    if (!logs) return;

    const cmdLine = document.createElement("div");
    cmdLine.className = "mb-2 break-all flex flex-wrap items-center";

    const prompt = document.createElement("span");
    prompt.className = "text-green-500 font-bold mr-2";
    prompt.innerHTML = "root@zikk~$";

    const inputCmd = document.createElement("span");
    inputCmd.className = "text-gray-200 font-mono relative";

    const cursor = document.createElement("span");
    cursor.className =
        "inline-block w-2.5 h-4 bg-green-500 align-middle ml-0.5 animate-pulse";

    cmdLine.appendChild(prompt);
    cmdLine.appendChild(inputCmd);
    inputCmd.appendChild(cursor);
    logs.appendChild(cmdLine);

    const cmd = "npm run dev";
    await new Promise(r => setTimeout(r, 600));

    for (let char of cmd) {
        const randomSpeed = Math.floor(Math.random() * (120 - 40 + 1)) + 40;
        await new Promise(r => setTimeout(r, randomSpeed));
        const textNode = document.createTextNode(char);
        inputCmd.insertBefore(textNode, cursor);
    }

    await new Promise(r => setTimeout(r, 500));
    cursor.remove();

    const printRaw = text => {
        const div = document.createElement("div");
        div.className = "text-gray-400 text-xs font-mono ml-1";
        div.innerText = text;
        logs.appendChild(div);
        logs.scrollTop = logs.scrollHeight;
    };

    const version = config.settings.apiVersion || "1.0.0";
    printRaw(`\n> zikneko@${version} dev`);
    await new Promise(r => setTimeout(r, 200));
    printRaw(`> node src/index.ts\n`);
    await new Promise(r => setTimeout(r, 400));

    const endpoints = [];

    Object.values(config.tags).forEach(tag => {
        if (Array.isArray(tag)) {
            endpoints.push(...tag);
        } else {
            Object.values(tag).forEach(sourceArr => {
                endpoints.push(...sourceArr);
            });
        }
    });
    const total = endpoints.length;

    terminalLog(`Loading ${total} routes...`, "info");

    let count = 0;
    const maxShow = 5;
    for (const route of endpoints) {
        if (count < maxShow) {
            terminalLog(
                `Mapped {${route.method}} ${route.endpoint}`,
                "success"
            );
            await new Promise(r => setTimeout(r, 50));
        }
        count++;
    }
    if (count > maxShow)
        terminalLog(`... +${count - maxShow} hidden endpoints mapped`, "info");

    await new Promise(r => setTimeout(r, 300));

    const serverUrl = window.location.origin;
    terminalLog(`Server is running at ${serverUrl}`, "success");

    const inputLine = document.getElementById("term-input-line");
    if (inputLine) inputLine.classList.remove("hidden");

    const container = document.getElementById("api-container");
    if (container) container.classList.remove("opacity-0", "translate-y-4");
}

function setUi(config) {
    const s = config.settings;
    const navTitle = document.getElementById("nav-title");
    const statVis = document.getElementById("stat-visitors");

    if (navTitle) navTitle.innerText = s.apiName || "API";
    if (statVis) statVis.innerText = s.visitors || "1";

    if (s.favicon) {
        let link =
            document.querySelector("link[rel~='icon']") ||
            document.createElement("link");
        link.rel = "icon";
        link.href = s.favicon;
        document.head.appendChild(link);
    }
}

function setSearch() {
    const input = document.getElementById("search-input");
    const noResults = document.getElementById("no-results");
    if (!input) return;

    input.addEventListener("input", e => {
        const val = e.target.value.toLowerCase();
        const isSearching = val.length > 0;
        let anyVisible = false;

        document.querySelectorAll(".api-section").forEach(section => {
            const grid = section.querySelector(".api-section-grid");
            const arrow = section.querySelector(".cat-arrow");
            let matchInThisSection = 0;

            section.querySelectorAll(".api-card-wrapper").forEach(card => {
                const txt = card.getAttribute("data-search").toLowerCase();
                if (txt.includes(val)) {
                    card.classList.remove("hidden");
                    matchInThisSection++;
                } else {
                    card.classList.add("hidden");
                }
            });

            if (matchInThisSection > 0) {
                section.classList.remove("hidden");
                anyVisible = true;
                if (isSearching) {
                    grid.classList.remove("hidden");
                    arrow.classList.add("rotate-180");
                } else {
                    grid.classList.add("hidden");
                    arrow.classList.remove("rotate-180");
                }
            } else {
                section.classList.add("hidden");
            }
        });

        if (noResults) {
            noResults.classList.toggle("hidden", anyVisible);
            noResults.classList.toggle("flex", !anyVisible);
        }
    });
}

function loadEnd(tags) {
    const container = document.getElementById("api-container");
    if (!container) return;

    container.innerHTML = "";

    for (const [cat, routes] of Object.entries(tags)) {
        // kalau nested (anime: otakudesu, kuramanime)
        if (typeof routes === "object" && !Array.isArray(routes)) {
            for (const [source, sourceRoutes] of Object.entries(routes)) {
                const section = document.createElement("div");
                section.className = "api-section w-full";

                const catId = `cat-${cat}-${source}`.replace(/\s+/g, "-");

                const headerBtn = `
                    <button onclick="toggleCategory('${catId}')" class="w-full flex items-center justify-between bg-white text-primary p-4 rounded-lg shadow-hard border-2 border-primary mb-4">
                        <h2 class="text-lg font-bold uppercase">${cat} / ${source}</h2>
                        <span class="text-xs">${sourceRoutes.length} EP</span>
                    </button>
                `;

                const grid = document.createElement("div");
                grid.id = `grid-${catId}`;
                grid.className = "hidden mb-8";

                sourceRoutes.forEach((route, idx) => {
                    const finalEndpoint = route.endpoint;
                    const id = `${cat}-${source}-${idx}`.replace(/\s+/g, "-");
                    const searchTerms = `${route.name} ${route.endpoint} ${cat} ${source}`;

                    const card = document.createElement("div");
                    card.className =
                        "api-card-wrapper w-full bg-white border-2 border-primary/20 rounded-lg";
                    card.setAttribute("data-search", searchTerms);

                    card.innerHTML = `
                        <div class="p-3 cursor-pointer select-none" onclick="toggle('${id}')">
                            <div class="flex justify-between items-center gap-3">
                                <div class="flex items-center gap-2 overflow-hidden">
                                    <span class="px-1.5 py-0.5 text-[10px] font-bold text-white bg-sky-500 rounded font-mono">${route.method}</span>
                                    <code class="font-bold text-xs truncate font-mono text-slate-700">${finalEndpoint}</code>
                                </div>
                                <i id="icon-${id}" class="fa-solid fa-plus text-xs text-primary"></i>
                            </div>
                            <p class="text-[10px] text-gray-500 mt-2 font-mono truncate">${route.name}</p>
                        </div>

                        <div id="body-${id}" class="hidden p-3 border-t">
                            <button onclick="testReq(this, '${finalEndpoint}', '${route.method}', '${id}')" 
                                class="bg-primary text-white px-3 py-1 rounded text-xs">
                                Execute
                            </button>
                        </div>
                    `;

                    grid.appendChild(card);
                });

                section.innerHTML = headerBtn;
                section.appendChild(grid);
                container.appendChild(section);
            }

            continue;
        }

        // kategori biasa (ai, maker, dll)
        const section = document.createElement("div");
        section.className = "api-section w-full";

        const catId = `cat-${cat}`.replace(/\s+/g, "-");

        const headerBtn = `
            <button onclick="toggleCategory('${catId}')" class="w-full flex items-center justify-between bg-white text-primary p-4 rounded-lg shadow-hard border-2 border-primary mb-4">
                <h2 class="text-lg font-bold uppercase">${cat}</h2>
                <span class="text-xs">${routes.length} EP</span>
            </button>
        `;

        const grid = document.createElement("div");
        grid.id = `grid-${catId}`;
        grid.className = "hidden mb-8";

        routes.forEach((route, idx) => {
            const finalEndpoint = route.endpoint;
            const id = `${cat}-${idx}`.replace(/\s+/g, "-");

            const card = document.createElement("div");
            card.className =
                "api-card-wrapper w-full bg-white border-2 border-primary/20 rounded-lg";

            card.innerHTML = `
                <div class="p-3 cursor-pointer select-none" onclick="toggle('${id}')">
                    <div class="flex justify-between items-center gap-3">
                        <div class="flex items-center gap-2 overflow-hidden">
                            <span class="px-1.5 py-0.5 text-[10px] font-bold text-white bg-sky-500 rounded font-mono">${route.method}</span>
                            <code class="font-bold text-xs truncate font-mono text-slate-700">${finalEndpoint}</code>
                        </div>
                        <i id="icon-${id}" class="fa-solid fa-plus text-xs text-primary"></i>
                    </div>
                    <p class="text-[10px] text-gray-500 mt-2 font-mono truncate">${route.name}</p>
                </div>
            `;

            grid.appendChild(card);
        });

        section.innerHTML = headerBtn;
        section.appendChild(grid);
        container.appendChild(section);
    }
}
window.toggleCategory = catId => {
    const grid = document.getElementById(`grid-${catId}`);
    const arrow = document.getElementById(`arrow-${catId}`);

    if (grid.classList.contains("hidden")) {
        grid.classList.remove("hidden");
        arrow.classList.add("rotate-180");
    } else {
        grid.classList.add("hidden");
        arrow.classList.remove("rotate-180");
    }
};

window.toggle = id => {
    const b = document.getElementById(`body-${id}`);
    const i = document.getElementById(`icon-${id}`);

    if (b.classList.contains("hidden")) {
        b.classList.remove("hidden");
        i.classList.add("rotate-45");
    } else {
        b.classList.add("hidden");
        i.classList.remove("rotate-45");
    }
};

window.copy = txt => {
    navigator.clipboard.writeText(window.location.origin + txt);
    messeg("ENDPOINT COPIED");
    terminalLog(`Copied URL: ${txt}`);
};

window.copyRes = id => {
    const out = document.getElementById(`output-${id}`);
    if (!out.innerText) return;
    navigator.clipboard.writeText(out.innerText);
    messeg("RESPONSE COPIED");
};

window.reset = id => {
    document.getElementById(`res-area-${id}`).classList.add("hidden");
    document.getElementById(`output-${id}`).innerHTML = "";
    const dlBtn = document.getElementById(`dl-btn-${id}`);
    if (dlBtn) dlBtn.classList.add("hidden");
    document
        .querySelectorAll(`[id^="input-${id}-"]`)
        .forEach(i => (i.value = ""));
    terminalLog(`Console cleared for req-${id.split("-").pop()}`);
};

window.testReq = async (btn, url, method, id) => {
    if (btn.disabled) return;

    const out = document.getElementById(`output-${id}`);
    const status = document.getElementById(`status-${id}`);
    const statusDot = document.getElementById(`status-dot-${id}`);
    const time = document.getElementById(`time-${id}`);
    const dlBtn = document.getElementById(`dl-btn-${id}`);

    const originalBtnText = "Execute";

    btn.disabled = true;
    btn.classList.add("opacity-70", "cursor-not-allowed");

    let startTime = Date.now();
    let timerInterval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        btn.innerHTML = `<span class="font-mono">${elapsed}ms...</span>`;
    }, 75);

    document.getElementById(`res-area-${id}`).classList.remove("hidden");

    if (dlBtn) {
        dlBtn.classList.add("hidden");
        dlBtn.href = "#";
    }

    status.innerText = "PROCESSING...";
    status.className = "text-yellow-400 font-bold font-mono";
    statusDot.className = "w-2 h-2 rounded-full bg-yellow-400";

    out.innerHTML = '<span class="text-gray-500 italic">executing...</span>';

    const params = {};
    document.querySelectorAll(`[id^="input-${id}-"]`).forEach(i => {
        if (i.value) params[i.id.split(`input-${id}-`)[1]] = i.value;
    });

    let fetchUrl =
        url +
        (method === "GET" && Object.keys(params).length
            ? "?" + new URLSearchParams(params)
            : "");
    let opts = {
        method,
        ...(method !== "GET"
            ? {
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(params)
              }
            : {})
    };

    const fullUrl = fetchUrl.startsWith("http")
        ? fetchUrl
        : window.location.origin + fetchUrl;

    try {
        const req = await fetch(fetchUrl, opts);

        clearInterval(timerInterval);
        const end = performance.now();
        const duration = Date.now() - startTime;

        status.innerText = `${req.status} ${req.statusText}`;
        status.className = req.ok
            ? "text-green-400 font-bold font-mono"
            : "text-red-400 font-bold font-mono";
        statusDot.className = req.ok
            ? "w-2 h-2 rounded-full bg-green-400"
            : "w-2 h-2 rounded-full bg-red-400";
        time.innerText = `${duration}ms`;

        terminalLog(
            `[${req.status}] ${fullUrl} (${duration}ms)`,
            req.ok ? "req-success" : "req-error"
        );

        const type = req.headers.get("content-type");
        if (type?.includes("json")) {
            const json = await req.json();
            out.innerHTML = syntaxHighlight(json);
        } else if (type?.startsWith("image")) {
            const blob = await req.blob();
            const urlObj = URL.createObjectURL(blob);
            if (dlBtn) {
                dlBtn.href = urlObj;
                dlBtn.download = `img-${Date.now()}.jpg`;
                dlBtn.classList.remove("hidden");
            }

            out.innerHTML = `
                <div class="border border-dashed border-gray-600 p-4 bg-black/20 rounded-lg flex justify-center">
                    <img src="${urlObj}" class="max-w-full shadow-lg max-h-[400px] rounded border border-gray-700">
                </div>`;
        } else if (type?.includes("audio")) {
            const blob = await req.blob();
            out.innerHTML = `<audio controls src="${URL.createObjectURL(blob)}" class="w-full mt-2 rounded"></audio>`;
        } else {
            out.innerText = await req.text();
        }
    } catch (err) {
        clearInterval(timerInterval);
        out.innerHTML = `<span class="text-red-400 font-bold">CONNECTION_REFUSED</span><br><span class="text-gray-500">${err.message}</span>`;
        status.innerText = "ERR";
        statusDot.className = "w-2 h-2 rounded-full bg-red-500";
        status.className = "text-red-400 font-bold font-mono";
        terminalLog(`Fetch Failed: ${err.message}`, "error");
    } finally {
        btn.disabled = false;
        btn.innerHTML = originalBtnText;
        btn.classList.remove("opacity-70", "cursor-not-allowed");
    }
};

function syntaxHighlight(json) {
    if (typeof json != "string") json = JSON.stringify(json, undefined, 2);
    return json
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(
            /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
            function (match) {
                let cls = "json-number";
                if (/^"/.test(match)) {
                    if (/:$/.test(match)) cls = "json-key";
                    else cls = "json-string";
                } else if (/true|false/.test(match)) {
                    cls = "json-boolean";
                } else if (/null/.test(match)) {
                    cls = "json-null";
                }
                return `<span class="${cls}">${match}</span>`;
            }
        );
}
