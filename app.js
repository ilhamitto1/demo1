(function () {
  "use strict";

  const WEBHOOK_URL = "https://ilham33.app.n8n.cloud/webhook/gul-bot";

  const appEl = document.getElementById("app");
  const chatEl = document.getElementById("chat");
  const formEl = document.getElementById("chat-form");
  const inputEl = document.getElementById("message-input");
  const sendBtn = formEl.querySelector(".send-btn");

  let isKeyboardOpen = false;

  function getViewportHeight() {
    if (window.visualViewport) {
      return Math.round(window.visualViewport.height);
    }
    return window.innerHeight;
  }

  function setAppHeight() {
    const height = getViewportHeight();
    document.documentElement.style.setProperty("--app-height", `${height}px`);
  }

  function scrollToBottom(smooth = false) {
    requestAnimationFrame(() => {
      chatEl.scrollTo({
        top: chatEl.scrollHeight,
        behavior: smooth ? "smooth" : "auto",
      });
    });
  }

  function addMessage(text, role) {
    const el = document.createElement("div");
    el.className = "message " + role;
    el.textContent = text;
    chatEl.appendChild(el);
    scrollToBottom(true);
    return el;
  }

  function showTyping() {
    const el = document.createElement("div");
    el.className = "typing";
    el.id = "typing-indicator";
    el.innerHTML = "<span></span><span></span><span></span>";
    chatEl.appendChild(el);
    scrollToBottom(true);
    return el;
  }

  function hideTyping() {
    const el = document.getElementById("typing-indicator");
    if (el) el.remove();
  }

  async function sendToWebhook(message) {
    const res = await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
    });

    if (!res.ok) {
      throw new Error("HTTP " + res.status);
    }

    const data = await res.json().catch(() => ({}));

    return data.reply || data.message || data.output || data.text || "…";
  }

  async function handleSubmit(e) {
    e.preventDefault();

    const text = inputEl.value.trim();
    if (!text) return;

    addMessage(text, "user");
    inputEl.value = "";
    sendBtn.disabled = true;

    showTyping();

    try {
      const reply = await sendToWebhook(text);
      hideTyping();
      addMessage(reply, "bot");
    } catch (err) {
      hideTyping();
      addMessage("Xəta baş verdi. Zəhmət olmasa yenidən cəhd edin.", "bot error");
      console.error(err);
    } finally {
      sendBtn.disabled = false;
      setTimeout(() => {
        scrollToBottom(true);
      }, 60);
    }
  }

  function handleViewportChange() {
    setAppHeight();

    if (window.visualViewport) {
      const diff = window.innerHeight - window.visualViewport.height;
      isKeyboardOpen = diff > 120;
      document.body.classList.toggle("keyboard-open", isKeyboardOpen);
    }

    scrollToBottom(false);
  }

  function onInputFocus() {
    setTimeout(() => {
      handleViewportChange();
      scrollToBottom(false);
    }, 80);

    setTimeout(() => {
      handleViewportChange();
      scrollToBottom(true);
    }, 300);
  }

  function onInputBlur() {
    setTimeout(() => {
      handleViewportChange();
    }, 120);
  }

  function init() {
    setAppHeight();

    addMessage(
      "Salam 👋 Mən sizin əmlak seçim köməkçinizəm. Sizə necə kömək edə bilərəm?",
      "bot"
    );

    formEl.addEventListener("submit", handleSubmit);
    inputEl.addEventListener("focus", onInputFocus);
    inputEl.addEventListener("blur", onInputBlur);

    if (window.visualViewport) {
      window.visualViewport.addEventListener("resize", handleViewportChange);
      window.visualViewport.addEventListener("scroll", handleViewportChange);
    }

    window.addEventListener("resize", handleViewportChange);
    window.addEventListener("orientationchange", () => {
      setTimeout(() => {
        handleViewportChange();
      }, 250);
    });

    sendBtn.addEventListener(
      "touchend",
      (e) => {
        e.preventDefault();
        formEl.requestSubmit();
      },
      { passive: false }
    );

    if (window.matchMedia("(min-width: 720px)").matches) {
      setTimeout(() => inputEl.focus(), 200);
    }

    scrollToBottom(false);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();