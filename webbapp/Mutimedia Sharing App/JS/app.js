/*  JS/app.js  (FULL REPLACEMENT FILE)
    - No ES modules / no imports (so it works with your current Multimedia App.html)
    - Supports your 5 Logic App endpoints (LIST / CREATE / GET BY ID / UPDATE / DELETE)
    - Won’t “white screen” if the response isn’t JSON (it prints the error instead)

    FIX APPLIED (CREATE):
    - Send body as a plain JSON string WITHOUT forcing Content-Type: application/json
      (prevents Logic App Parse_JSON "content got null" when called from browser)
    - Auto-generate id if missing
*/

(function ($) {
  "use strict";

  // ========= 1) YOUR ENDPOINTS =========
  // (List works "as-is". The {id} ones MUST be filled at runtime.)
  const API = {
    list: window.API.list,
    create: window.API.create,
    getByIdTemplate: window.API.getById,
    updateTemplate: window.API.update,
    deleteTemplate: window.API.remove
  };

  // ========= 2) HELPERS =========

  function buildUrlWithId(templateUrl, id) {
    const safe = encodeURIComponent(String(id));

    // supports BOTH styles
    if (templateUrl.includes("{id}")) return templateUrl.replace("{id}", safe);
    if (templateUrl.includes("%7Bid%7D")) return templateUrl.replace("%7Bid%7D", safe);

    // fallback: insert /{id} just before ?api-version...
    const qIndex = templateUrl.indexOf("?");
    if (qIndex > -1) {
      const base = templateUrl.slice(0, qIndex);
      const qs = templateUrl.slice(qIndex);
      return base.replace(/\/$/, "") + "/" + safe + qs;
    }
    return templateUrl.replace(/\/$/, "") + "/" + safe;
  }

  function firstNonEmpty(ids) {
    for (const id of ids) {
      const v = $(id).val();
      if (v !== undefined && v !== null && String(v).trim() !== "") return String(v).trim();
    }
    return "";
  }

  function setStatus(msg, isError) {
    // If your HTML has a status element, we use it. Otherwise console + alert fallback.
    const $status = $("#status, #Status, #message, #Message").first();
    if ($status.length) {
      $status.text(msg);
      $status.css("color", isError ? "red" : "green");
    } else {
      console[isError ? "error" : "log"](msg);
      if (isError) alert(msg);
    }
  }

  async function safeFetchJson(url, options) {
    const res = await fetch(url, options);
    const text = await res.text();

    // Try JSON parse; if it fails, return raw text to avoid white-screen crashes.
    let data = null;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = { raw: text };
    }

    if (!res.ok) {
      const errMsg =
        (data && data.message) ||
        (data && data.error && data.error.message) ||
        (data && data.raw) ||
        `HTTP ${res.status}`;
      throw new Error(errMsg);
    }

    return data;
  }

  function renderList(items) {
    const $list = $("#ImageList");
    if (!$list.length) {
      // fallback: if template changed
      setStatus("Couldn't find #ImageList in HTML.", true);
      return;
    }

    if (!Array.isArray(items) || items.length === 0) {
      $list.html("<div>No items returned.</div>");
      return;
    }

const html = items
  .map((c) => {
    const id = c.id ?? "";
    const userId = c.userId ?? "";
    const title = c.title ?? "(no title)";
    const desc = c.description ?? "";
    const farm = c.farmId ?? "";
    const tags = Array.isArray(c.tags) ? c.tags.join(", ") : "";
    const fileName = c.fileName ?? "";
    const url = c.blobUrl ?? "";
    const fileMime = c.fileMime ?? "";
    const fileBase64 = c.fileBase64 ?? "";
    const dataUrl = (fileBase64 && fileMime) ? `data:${fileMime};base64,${fileBase64}` : "";
    const isImage = fileMime.startsWith("image/");



return `
  <div id="card-${escapeAttr(id)}" style="border:1px solid #ddd;padding:12px;margin:10px 0;border-radius:8px;">
    <div><b>ID:</b> ${escapeHtml(id)}</div>
    <div><b>User ID:</b> ${escapeHtml(userId || "(none)")}</div>
    <div><b>Title:</b> ${escapeHtml(title)}</div>
    <div><b>Description:</b> ${escapeHtml(desc)}</div>
    <div><b>Farm:</b> ${escapeHtml(farm)}</div>
    <div><b>Tags:</b> ${escapeHtml(tags)}</div>
    <div><b>File:</b> ${escapeHtml(fileName || "(none)")} ${url ? `<a href="${url}" target="_blank" rel="noopener">open</a>` : ""}</div>

    ${dataUrl ? (isImage
      ? `<div style="margin-top:8px;"><img src="${dataUrl}" alt="${escapeAttr(title)}" style="max-width:100%;height:auto;border:1px solid #eee;border-radius:6px;" /></div>`
      : `<div style="margin-top:8px;"><a href="${dataUrl}" download="${escapeAttr(fileName || 'file')}">Download file</a></div>`
    ) : ""}

    <div style="margin-top:8px;">
      <button class="btn btn-sm btn-danger js-delete" data-id="${escapeAttr(id)}">Delete</button>
      <button class="btn btn-sm btn-secondary js-get" data-id="${escapeAttr(id)}">Get</button>
    </div>
  </div>
`;


      })
      .join("");

    $list.html(html);

    // wire per-item buttons
    $(".js-delete")
      .off("click")
      .on("click", async function () {
        const id = $(this).data("id");
        await doDelete(id);
      });

    $(".js-get")
      .off("click")
      .on("click", async function () {
        const id = $(this).data("id");
        await doGetById(id);
      });
  }

  function escapeHtml(s) {
    return String(s ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");
  }

  function escapeAttr(s) {
    return escapeHtml(s).replaceAll("`", "&#96;");
  }

  // ========= 3) CRUD ACTIONS =========

  async function doList() {
    setStatus("Loading list...", false);
    const data = await safeFetchJson(API.list, { method: "GET" });

    // Your Logic App might return either:
    // 1) { value: [...] }  OR  2) [...]
    const items = Array.isArray(data) ? data : data && Array.isArray(data.value) ? data.value : [];
    renderList(items);
    setStatus(`Loaded ${items.length} item(s).`, false);
  }

  async function doGetById(id) {
    if (!id) {
      setStatus("Missing id for GetById.", true);
      return;
    }

    setStatus(`Getting id ${id}...`, false);
    const url = buildUrlWithId(API.getByIdTemplate, id);
    const data = await safeFetchJson(url, { method: "GET" });

    // show single item in ImageList (keeps your template simple)
    renderList([data]);
    setStatus(`Loaded id ${id}.`, false);
  }

    async function doCreate(payload) {
    setStatus("Creating...", false);

    // Ensure required fields
    if (!payload || typeof payload !== "object") payload = {};
    if (!payload.id || String(payload.id).trim() === "") payload.id = String(Date.now());
    if (!payload.farmId || String(payload.farmId).trim() === "") payload.farmId = "demo-farm";
    if (!payload.title || String(payload.title).trim() === "") payload.title = "Created from web app";

    const data = await safeFetchJson(API.create, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify(payload)
    });

    setStatus(`Created.`, false);
    await doList();
    return data;
  }


  async function doUpdate(id, payload) {
    if (!id) {
      setStatus("Missing id for Update.", true);
      return;
    }

    setStatus(`Updating id ${id}...`, false);
    const url = buildUrlWithId(API.updateTemplate, id);

    const data = await safeFetchJson(url, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setStatus(`Updated id ${id}.`, false);
    await doList();
    return data;
  }

  async function doDelete(id) {
    if (!id) {
      setStatus("Missing id for Delete.", true);
      return;
    }

    setStatus(`Deleting id ${id}...`, false);
    const url = buildUrlWithId(API.deleteTemplate, id);

    const data = await safeFetchJson(url, { method: "DELETE" });
    setStatus(`${data?.message ?? "delete"} (id ${data?.id ?? id})`, false);

    const safeId = escapeAttr(id);
    const el = document.getElementById(`card-${safeId}`);
    if (el) el.remove();

    return data;
  }

  // ========= 4) WIRE UP YOUR EXISTING TEMPLATE BUTTONS =========

  $(document).ready(function () {
    // View Images button -> LIST
    $("#retImages")
      .off("click")
      .on("click", async function (e) {
        e.preventDefault();
        try {
          await doList();
        } catch (err) {
          setStatus(`List error: ${err.message}`, true);
        }
      });

    // Submit button -> CREATE
  $("#subNewForm")
    .off("click")
    .on("click", async function (e) {
      e.preventDefault();
      try {
        const raw = firstNonEmpty(["#jsonBody", "#payload", "#newItemJson", "#NewItemJson"]);
        let payload = null;

        if (raw) {
          payload = JSON.parse(raw);
        } else {
          const id = firstNonEmpty(["#ItemId"]) || String(Date.now());
          const userId = firstNonEmpty(["#UserId"]) || "";
          const title = firstNonEmpty(["#Title"]) || "Untitled";
          const description = firstNonEmpty(["#Description"]) || "";

          const tagsCsv = firstNonEmpty(["#Tags"]);
          const tags = tagsCsv
            ? tagsCsv.split(",").map((t) => t.trim()).filter(Boolean)
            : [];

          const farmId = "demo-farm";

          // File name + content (base64) so we can "view" it without Blob Storage
          const fileInput = document.getElementById("UpFile");
          const file =
            fileInput && fileInput.files && fileInput.files[0] ? fileInput.files[0] : null;

          const fileName = file ? file.name : "";
          let fileMime = "";
          let fileBase64 = "";

          if (file) {
            fileMime = file.type || "application/octet-stream";

            fileBase64 = await new Promise((resolve, reject) => {
              const reader = new FileReader();
              reader.onload = () => resolve(String(reader.result).split(",")[1]); // remove data:mime;base64,
              reader.onerror = reject;
              reader.readAsDataURL(file);
            });
          }

          payload = { id, userId, title, description, farmId, tags, fileName, fileMime, fileBase64 };
        }

        await doCreate(payload);
      } catch (err) {
        setStatus(`Create error: ${err.message}`, true);
      }
    });


    $("#btnGetById, #getByIdBtn, #retImageById")
      .off("click")
      .on("click", async function (e) {
        e.preventDefault();
        try {
          const id = firstNonEmpty(["#id", "#Id", "#mediaId", "#MediaId", "#MediaID", "#getId", "#GetId"]);
          await doGetById(id);
        } catch (err) {
          setStatus(`GetById error: ${err.message}`, true);
        }
      });

    $("#btnDelete, #deleteBtn")
      .off("click")
      .on("click", async function (e) {
        e.preventDefault();
        try {
          const id = firstNonEmpty(["#id", "#Id", "#mediaId", "#MediaId", "#MediaID", "#delId", "#DelId"]);
          await doDelete(id);
        } catch (err) {
          setStatus(`Delete error: ${err.message}`, true);
        }
      });

    $("#btnUpdate, #updateBtn")
      .off("click")
      .on("click", async function (e) {
        e.preventDefault();
        try {
          const id = firstNonEmpty(["#id", "#Id", "#mediaId", "#MediaId", "#MediaID", "#updId", "#UpdId"]);
          const raw = firstNonEmpty(["#jsonBody", "#payload", "#updateJson", "#UpdateJson"]);
          const payload = raw ? JSON.parse(raw) : { id, farmId: "demo-farm", title: "Updated from web app" };
          await doUpdate(id, payload);
        } catch (err) {
          setStatus(`Update error: ${err.message}`, true);
        }
      });

    // doList().catch(err => setStatus(`Auto list error: ${err.message}`, true));
  });
})(jQuery);
