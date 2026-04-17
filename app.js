(function () {
  "use strict";

  // ====== CONFIG ======
  const WEBHOOK_URL = "https://ilham33.app.n8n.cloud/webhook/gul-bot";

  // ====== ELEMENTS ======
  const chatEl = document.getElementById("chat");
  const formEl = document.getElementById("chat-form");
  const inputEl = document.getElementById("message-input");
  const sendBtn = formEl.querySelector(".send-btn");

  // ====== HELPERS ======
  function scrollToBottom(smooth) {
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
    if (!res.ok) throw new Error("HTTP " + res.status);
    const data = await res.json().catch(() => ({}));
    return (
      data.reply ||
      data.message ||
      data.output ||
      data.text ||
      "…"
    );
  }

  // ====== HANDLERS ======
  async function handleSubmit(e) {
    e.preventDefault();
    const text = inputEl.value.trim();
    if (!text) return;

    addMessage(text, "user");
    inputEl.value = "";
    inputEl.focus();
    sendBtn.disabled = true;

    showTyping();

    try {
      const reply = await sendToWebhook(text);
      hideTyping();
      addMessage(reply, "bot");
    } catch (err) {
      hideTyping();
      addMessage(
        "Xəta baş verdi. Zəhmət olmasa yenidən cəhd edin.",
        "bot error"
      );
      console.error(err);
    } finally {
      sendBtn.disabled = false;
    }
  }

  // Mobile keyboard: shrink the app to the visible viewport so input + last
  // messages stay visible (WhatsApp-like behavior)
  function handleViewportChange() {
    const vv = window.visualViewport;
    const h = vv ? vv.height : window.innerHeight;
    document.documentElement.style.setProperty("--app-height", h + "px");
    scrollToBottom(false);
  }

  // ====== INIT ======
  function init() {
    addMessage(
      "Salam 👋 Mən sizin əmlak seçim köməkçinizəm. Sizə necə kömək edə bilərəm?",
      "bot"
    );

    formEl.addEventListener("submit", handleSubmit);

    // Auto-focus on desktop; on mobile, focus only after user taps
    if (window.matchMedia("(min-width: 720px)").matches) {
      setTimeout(() => inputEl.focus(), 200);
    }

    // Initialize app height immediately
    handleViewportChange();

    if (window.visualViewport) {
      window.visualViewport.addEventListener("resize", handleViewportChange);
      window.visualViewport.addEventListener("scroll", handleViewportChange);
    }
    window.addEventListener("resize", handleViewportChange);
    window.addEventListener("orientationchange", () => {
      setTimeout(handleViewportChange, 150);
    });

    // When input is focused (keyboard opens), re-measure shortly after
    inputEl.addEventListener("focus", () => {
      setTimeout(() => {
        handleViewportChange();
        scrollToBottom(true);
      }, 250);
    });

    // Prevent double-tap zoom on send button
    sendBtn.addEventListener("touchend", (e) => {
      e.preventDefault();
      formEl.requestSubmit();
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
