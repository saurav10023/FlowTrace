import { useState, useEffect, useCallback } from "react";



const api = async (method, path, body = null) => {
  const res = await API({
    method,
    url: `/api/v1${path}`,
    data: body,
  });
  return res.data.data;
};

import { useAuth } from "../context/AuthContext.jsx"; 


// ─── Toast ────────────────────────────────────────────────────────────────────
const useToast = () => {
  const [toasts, setToasts] = useState([]);
  const push = (msg, type = "success") => {
    const id = Date.now();
    setToasts((p) => [...p, { id, msg, type }]);
    setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 3500);
  };
  return { toasts, success: (m) => push(m, "success"), error: (m) => push(m, "error") };
};

const ToastContainer = ({ toasts }) => (
  <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 9999, display: "flex", flexDirection: "column", gap: 8 }}>
    {toasts.map((t) => (
      <div key={t.id} style={{
        padding: "10px 18px", borderRadius: 8, fontSize: 13, fontWeight: 500,
        background: t.type === "success" ? "#166534" : "#7f1d1d",
        color: "#fff", boxShadow: "0 4px 16px rgba(0,0,0,0.3)",
        animation: "fadeIn 0.2s ease",
      }}>{t.msg}</div>
    ))}
  </div>
);

// ─── Shared UI ────────────────────────────────────────────────────────────────
const Input = ({ label, ...props }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
    {label && <label style={{ fontSize: 11, fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em" }}>{label}</label>}
    <input {...props} style={{
      background: "#0f172a", border: "1px solid #1e293b", borderRadius: 6,
      color: "#e2e8f0", padding: "8px 12px", fontSize: 13, outline: "none",
      transition: "border 0.15s", ...props.style,
    }}
      onFocus={e => e.target.style.borderColor = "#6366f1"}
      onBlur={e => e.target.style.borderColor = "#1e293b"}
    />
  </div>
);

const Select = ({ label, options = [], ...props }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
    {label && <label style={{ fontSize: 11, fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em" }}>{label}</label>}
    <select {...props} style={{
      background: "#0f172a", border: "1px solid #1e293b", borderRadius: 6,
      color: "#e2e8f0", padding: "8px 12px", fontSize: 13, outline: "none", ...props.style,
    }}>
      <option value="">— select —</option>
      {options.map((o) => <option key={o.value ?? o} value={o.value ?? o}>{o.label ?? o}</option>)}
    </select>
  </div>
);

const Textarea = ({ label, ...props }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
    {label && <label style={{ fontSize: 11, fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em" }}>{label}</label>}
    <textarea {...props} style={{
      background: "#0f172a", border: "1px solid #1e293b", borderRadius: 6,
      color: "#e2e8f0", padding: "8px 12px", fontSize: 13, outline: "none",
      resize: "vertical", minHeight: 80, fontFamily: "inherit", ...props.style,
    }}
      onFocus={e => e.target.style.borderColor = "#6366f1"}
      onBlur={e => e.target.style.borderColor = "#1e293b"}
    />
  </div>
);

const Btn = ({ children, variant = "primary", loading, ...props }) => {
  const variants = {
    primary: { background: "#6366f1", color: "#fff" },
    danger: { background: "#dc2626", color: "#fff" },
    ghost: { background: "transparent", color: "#94a3b8", border: "1px solid #1e293b" },
    success: { background: "#16a34a", color: "#fff" },
    warning: { background: "#d97706", color: "#fff" },
  };
  return (
    <button {...props} disabled={loading || props.disabled} style={{
      ...variants[variant], border: "none", borderRadius: 6,
      padding: "8px 16px", fontSize: 13, fontWeight: 600, cursor: "pointer",
      opacity: (loading || props.disabled) ? 0.5 : 1, transition: "opacity 0.15s",
      ...props.style,
    }}>{loading ? "..." : children}</button>
  );
};

const Card = ({ children, style }) => (
  <div style={{
    background: "#111827", border: "1px solid #1e293b", borderRadius: 10,
    padding: 20, ...style,
  }}>{children}</div>
);

const Badge = ({ children, color = "#6366f1" }) => (
  <span style={{
    background: color + "22", color, fontSize: 11, fontWeight: 600,
    padding: "2px 8px", borderRadius: 4, letterSpacing: "0.05em",
  }}>{children}</span>
);

const SectionTitle = ({ children }) => (
  <h3 style={{ fontSize: 13, fontWeight: 700, color: "#6366f1", textTransform: "uppercase", letterSpacing: "0.1em", margin: "0 0 16px" }}>{children}</h3>
);

const Row = ({ children, gap = 12 }) => (
  <div style={{ display: "flex", gap, flexWrap: "wrap", alignItems: "flex-end" }}>{children}</div>
);

const Grid = ({ children, cols = 2 }) => (
  <div style={{ display: "grid", gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 12 }}>{children}</div>
);

const Divider = () => <div style={{ borderTop: "1px solid #1e293b", margin: "20px 0" }} />;

// ─── Table ────────────────────────────────────────────────────────────────────
const Table = ({ cols, rows, actions }) => (
  <div style={{ overflowX: "auto" }}>
    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
      <thead>
        <tr style={{ borderBottom: "1px solid #1e293b" }}>
          {cols.map((c) => <th key={c} style={{ textAlign: "left", padding: "8px 12px", color: "#64748b", fontWeight: 600, whiteSpace: "nowrap" }}>{c}</th>)}
          {actions && <th style={{ textAlign: "right", padding: "8px 12px", color: "#64748b" }}>Actions</th>}
        </tr>
      </thead>
      <tbody>
        {rows.length === 0 && (
          <tr><td colSpan={cols.length + 1} style={{ padding: 24, textAlign: "center", color: "#475569" }}>No records found</td></tr>
        )}
        {rows.map((row, i) => (
          <tr key={i} style={{ borderBottom: "1px solid #0f172a" }}>
            {cols.map((c) => (
              <td key={c} style={{ padding: "10px 12px", color: "#cbd5e1", maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {typeof row[c] === "boolean"
                  ? <Badge color={row[c] ? "#16a34a" : "#dc2626"}>{row[c] ? "Yes" : "No"}</Badge>
                  : Array.isArray(row[c])
                    ? row[c].join(", ") || "—"
                    : row[c] ?? "—"}
              </td>
            ))}
            {actions && <td style={{ padding: "10px 12px", textAlign: "right" }}>{actions(row)}</td>}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

// ═══════════════════════════════════════════════════════════════════════════════
// INTEGRATIONS PANEL
// ═══════════════════════════════════════════════════════════════════════════════
const IntegrationsPanel = ({ toast }) => {
  const [tab, setTab] = useState("list");
  const [integrations, setIntegrations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "", slug: "", provider: "", description: "", shortDescription: "",
    logoUrl: "", websiteUrl: "", documentationUrl: "",
    supportedFeatures: "", supportedPaymentMethods: "", supportedFlows: "", tags: "",
    webhookSupported: false, refundsSupported: false, sandboxSupported: true,
    isFeatured: false, isActive: true, sortOrder: 0,
  });
  const [editId, setEditId] = useState(null);
  const [arrayField, setArrayField] = useState({ id: "", field: "tags", value: "" });
  const [bulkSort, setBulkSort] = useState("");
  const [bulkStatus, setBulkStatus] = useState({ ids: "", isActive: true });
  const [analyticsData, setAnalyticsData] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api("GET", "/integrations/admin/all");
      setIntegrations(data);
    } catch (e) { toast.error(e.message); }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const payload = {
        ...form,
        supportedFeatures: form.supportedFeatures.split(",").map(s => s.trim()).filter(Boolean),
        supportedPaymentMethods: form.supportedPaymentMethods.split(",").map(s => s.trim()).filter(Boolean),
        supportedFlows: form.supportedFlows.split(",").map(s => s.trim()).filter(Boolean),
        tags: form.tags.split(",").map(s => s.trim()).filter(Boolean),
        sortOrder: Number(form.sortOrder),
      };
      if (editId) {
        await api("PUT", `/integrations/${editId}`, payload);
        toast.success("Integration updated");
      } else {
        await api("POST", "/integrations", payload);
        toast.success("Integration created");
      }
      setEditId(null);
      setForm({ name: "", slug: "", provider: "", description: "", shortDescription: "", logoUrl: "", websiteUrl: "", documentationUrl: "", supportedFeatures: "", supportedPaymentMethods: "", supportedFlows: "", tags: "", webhookSupported: false, refundsSupported: false, sandboxSupported: true, isFeatured: false, isActive: true, sortOrder: 0 });
      load(); setTab("list");
    } catch (e) { toast.error(e.message); }
    setLoading(false);
  };

  const handleEdit = (integ) => {
    setEditId(integ._id);
    setForm({
      ...integ,
      supportedFeatures: (integ.supportedFeatures || []).join(", "),
      supportedPaymentMethods: (integ.supportedPaymentMethods || []).join(", "),
      supportedFlows: (integ.supportedFlows || []).join(", "),
      tags: (integ.tags || []).join(", "),
    });
    setTab("create");
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this integration?")) return;
    try { await api("DELETE", `/integrations/${id}`); toast.success("Deleted"); load(); }
    catch (e) { toast.error(e.message); }
  };

  const handleToggleStatus = async (id) => {
    try { await api("PATCH", `/integrations/${id}/toggle-status`); toast.success("Status toggled"); load(); }
    catch (e) { toast.error(e.message); }
  };

  const handleToggleFeatured = async (id) => {
    try { await api("PATCH", `/integrations/${id}/toggle-featured`); toast.success("Featured toggled"); load(); }
    catch (e) { toast.error(e.message); }
  };

  const handleArrayAdd = async () => {
    try { await api("PATCH", `/integrations/${arrayField.id}/array-field/add`, { field: arrayField.field, value: arrayField.value }); toast.success("Added"); load(); }
    catch (e) { toast.error(e.message); }
  };

  const handleArrayRemove = async () => {
    try { await api("PATCH", `/integrations/${arrayField.id}/array-field/remove`, { field: arrayField.field, value: arrayField.value }); toast.success("Removed"); load(); }
    catch (e) { toast.error(e.message); }
  };

  const handleBulkSort = async () => {
    try {
      const updates = bulkSort.split("\n").map(l => { const [id, sortOrder] = l.split(","); return { id: id.trim(), sortOrder: Number(sortOrder) }; }).filter(u => u.id);
      await api("PATCH", "/integrations/bulk-sort", updates);
      toast.success("Sort order updated"); load();
    } catch (e) { toast.error(e.message); }
  };

  const handleBulkStatus = async () => {
    try {
      const ids = bulkStatus.ids.split(",").map(s => s.trim()).filter(Boolean);
      await api("PATCH", "/integrations/bulk-status", { ids, isActive: bulkStatus.isActive });
      toast.success("Status updated"); load();
    } catch (e) { toast.error(e.message); }
  };

  const loadAnalytics = async () => {
    try { const d = await api("GET", "/integrations/analytics"); setAnalyticsData(d); setTab("analytics"); }
    catch (e) { toast.error(e.message); }
  };

  const tabs = ["list", "create", "arrays", "bulk", "analytics"];

  return (
    <div>
      <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
        {tabs.map(t => (
          <button key={t} onClick={() => { setTab(t); if (t === "analytics") loadAnalytics(); }}
            style={{
              padding: "6px 16px", borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: "pointer",
              background: tab === t ? "#6366f1" : "transparent",
              color: tab === t ? "#fff" : "#64748b",
              border: tab === t ? "none" : "1px solid #1e293b",
              textTransform: "capitalize",
            }}>{t === "create" && editId ? "edit" : t}</button>
        ))}
        {editId && <Btn variant="ghost" style={{ fontSize: 12 }} onClick={() => { setEditId(null); setForm({ name: "", slug: "", provider: "", description: "", shortDescription: "", logoUrl: "", websiteUrl: "", documentationUrl: "", supportedFeatures: "", supportedPaymentMethods: "", supportedFlows: "", tags: "", webhookSupported: false, refundsSupported: false, sandboxSupported: true, isFeatured: false, isActive: true, sortOrder: 0 }); }}>✕ cancel edit</Btn>}
      </div>

      {tab === "list" && (
        <Card>
          <SectionTitle>All Integrations {loading && "..."}</SectionTitle>
          <Table
            cols={["name", "slug", "provider", "isActive", "isFeatured", "sortOrder", "totalRuns"]}
            rows={integrations}
            actions={(row) => (
              <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                <Btn variant="ghost" style={{ fontSize: 11, padding: "4px 10px" }} onClick={() => handleEdit(row)}>Edit</Btn>
                <Btn variant={row.isActive ? "warning" : "success"} style={{ fontSize: 11, padding: "4px 10px" }} onClick={() => handleToggleStatus(row._id)}>{row.isActive ? "Deactivate" : "Activate"}</Btn>
                <Btn variant="ghost" style={{ fontSize: 11, padding: "4px 10px" }} onClick={() => handleToggleFeatured(row._id)}>{row.isFeatured ? "Unfeature" : "Feature"}</Btn>
                <Btn variant="danger" style={{ fontSize: 11, padding: "4px 10px" }} onClick={() => handleDelete(row._id)}>Delete</Btn>
              </div>
            )}
          />
        </Card>
      )}

      {tab === "create" && (
        <Card>
          <SectionTitle>{editId ? "Edit Integration" : "Create Integration"}</SectionTitle>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <Grid cols={2}>
              <Input label="Name *" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Razorpay" />
              <Input label="Slug *" value={form.slug} onChange={e => setForm(p => ({ ...p, slug: e.target.value }))} placeholder="razorpay" />
            </Grid>
            <Input label="Provider *" value={form.provider} onChange={e => setForm(p => ({ ...p, provider: e.target.value }))} placeholder="Razorpay Technologies" />
            <Textarea label="Description" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
            <Input label="Short Description" value={form.shortDescription} onChange={e => setForm(p => ({ ...p, shortDescription: e.target.value }))} />
            <Grid cols={3}>
              <Input label="Logo URL" value={form.logoUrl} onChange={e => setForm(p => ({ ...p, logoUrl: e.target.value }))} />
              <Input label="Website URL" value={form.websiteUrl} onChange={e => setForm(p => ({ ...p, websiteUrl: e.target.value }))} />
              <Input label="Docs URL" value={form.documentationUrl} onChange={e => setForm(p => ({ ...p, documentationUrl: e.target.value }))} />
            </Grid>
            <Divider />
            <Grid cols={2}>
              <Input label="Supported Features (comma-separated)" value={form.supportedFeatures} onChange={e => setForm(p => ({ ...p, supportedFeatures: e.target.value }))} placeholder="auto-capture, partial-refund" />
              <Input label="Payment Methods (comma-separated)" value={form.supportedPaymentMethods} onChange={e => setForm(p => ({ ...p, supportedPaymentMethods: e.target.value }))} placeholder="upi, cards, netbanking" />
            </Grid>
            <Grid cols={2}>
              <Input label="Supported Flows (comma-separated)" value={form.supportedFlows} onChange={e => setForm(p => ({ ...p, supportedFlows: e.target.value }))} placeholder="checkout, payment_link" />
              <Input label="Tags (comma-separated)" value={form.tags} onChange={e => setForm(p => ({ ...p, tags: e.target.value }))} placeholder="india, popular" />
            </Grid>
            <Divider />
            <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
              {[["webhookSupported", "Webhook Supported"], ["refundsSupported", "Refunds Supported"], ["sandboxSupported", "Sandbox Supported"], ["isFeatured", "Featured"], ["isActive", "Active"]].map(([key, label]) => (
                <label key={key} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#cbd5e1", cursor: "pointer" }}>
                  <input type="checkbox" checked={form[key]} onChange={e => setForm(p => ({ ...p, [key]: e.target.checked }))} />
                  {label}
                </label>
              ))}
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <label style={{ fontSize: 13, color: "#cbd5e1" }}>Sort Order</label>
                <input type="number" value={form.sortOrder} onChange={e => setForm(p => ({ ...p, sortOrder: e.target.value }))}
                  style={{ width: 70, background: "#0f172a", border: "1px solid #1e293b", borderRadius: 6, color: "#e2e8f0", padding: "6px 10px", fontSize: 13 }} />
              </div>
            </div>
            <Btn onClick={handleSubmit} loading={loading} style={{ alignSelf: "flex-start", marginTop: 8 }}>
              {editId ? "Save Changes" : "Create Integration"}
            </Btn>
          </div>
        </Card>
      )}

      {tab === "arrays" && (
        <Card>
          <SectionTitle>Manage Array Fields</SectionTitle>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <Select label="Integration" options={integrations.map(i => ({ value: i._id, label: i.name }))}
              value={arrayField.id} onChange={e => setArrayField(p => ({ ...p, id: e.target.value }))} />
            <Grid cols={2}>
              <Select label="Field" options={["tags", "supportedFeatures", "supportedPaymentMethods", "supportedFlows"]}
                value={arrayField.field} onChange={e => setArrayField(p => ({ ...p, field: e.target.value }))} />
              <Input label="Value" value={arrayField.value} onChange={e => setArrayField(p => ({ ...p, value: e.target.value }))} placeholder="e.g. upi" />
            </Grid>
            <Row>
              <Btn variant="success" onClick={handleArrayAdd}>Add Value</Btn>
              <Btn variant="danger" onClick={handleArrayRemove}>Remove Value</Btn>
            </Row>
          </div>
        </Card>
      )}

      {tab === "bulk" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Card>
            <SectionTitle>Bulk Sort Order</SectionTitle>
            <p style={{ fontSize: 12, color: "#64748b", marginBottom: 12 }}>One entry per line: <code style={{ color: "#6366f1" }}>id,sortOrder</code></p>
            <Textarea value={bulkSort} onChange={e => setBulkSort(e.target.value)} placeholder={"64f1a...,1\n64f1b...,2"} style={{ minHeight: 120, fontFamily: "monospace" }} />
            <Btn onClick={handleBulkSort} style={{ marginTop: 12 }}>Apply Sort Order</Btn>
          </Card>
          <Card>
            <SectionTitle>Bulk Toggle Status</SectionTitle>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <Input label="IDs (comma-separated)" value={bulkStatus.ids} onChange={e => setBulkStatus(p => ({ ...p, ids: e.target.value }))} placeholder="id1, id2, id3" />
              <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#cbd5e1", cursor: "pointer" }}>
                <input type="checkbox" checked={bulkStatus.isActive} onChange={e => setBulkStatus(p => ({ ...p, isActive: e.target.checked }))} />
                Set as Active
              </label>
              <Btn onClick={handleBulkStatus} style={{ alignSelf: "flex-start" }}>Apply</Btn>
            </div>
          </Card>
        </div>
      )}

      {tab === "analytics" && analyticsData && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Card>
            <SectionTitle>Overall Summary</SectionTitle>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 12 }}>
              {Object.entries(analyticsData.overall || {}).map(([k, v]) => (
                <div key={k} style={{ background: "#0f172a", borderRadius: 8, padding: 14 }}>
                  <div style={{ fontSize: 11, color: "#64748b", marginBottom: 4, textTransform: "capitalize" }}>{k.replace(/([A-Z])/g, " $1")}</div>
                  <div style={{ fontSize: 22, fontWeight: 700, color: "#e2e8f0" }}>{v}</div>
                </div>
              ))}
            </div>
          </Card>
          <Card>
            <SectionTitle>Per Integration</SectionTitle>
            <Table cols={["name", "slug", "totalRuns", "successfulRuns", "failedRuns", "isActive"]} rows={analyticsData.perIntegration || []} />
          </Card>
        </div>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// FLOWS PANEL
// ═══════════════════════════════════════════════════════════════════════════════
const FlowsPanel = ({ toast }) => {
  const [tab, setTab] = useState("list");
  const [flows, setFlows] = useState([]);
  const [integrations, setIntegrations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editId, setEditId] = useState(null);
  const [selectedFlow, setSelectedFlow] = useState(null);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [form, setForm] = useState({
    integrationId: "", name: "", slug: "", description: "", shortDescription: "",
    type: "", flowType: "embedded", tags: "",
    webhookSupported: false, refundsSupported: false, sandboxSupported: true,
    isRunnable: true, isActive: true, sortOrder: 0,
  });
  const [fieldForm, setFieldForm] = useState({ key: "", label: "", type: "text", required: false, placeholder: "", defaultValue: "", options: "" });
  const [stepForm, setStepForm] = useState({ key: "", title: "", description: "", order: "" });
  const [bulkSort, setBulkSort] = useState("");
  const [bulkStatus, setBulkStatus] = useState({ ids: "", isActive: true });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [f, i] = await Promise.all([api("GET", "/flows/admin/all"), api("GET", "/integrations/admin/all")]);
      setFlows(f); setIntegrations(i);
    } catch (e) { toast.error(e.message); }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const payload = { ...form, tags: form.tags.split(",").map(s => s.trim()).filter(Boolean), sortOrder: Number(form.sortOrder) };
      if (editId) { await api("PUT", `/flows/${editId}`, payload); toast.success("Flow updated"); }
      else { await api("POST", "/flows", payload); toast.success("Flow created"); }
      setEditId(null); load(); setTab("list");
    } catch (e) { toast.error(e.message); }
    setLoading(false);
  };

  const handleEdit = (flow) => {
    setEditId(flow._id);
    setForm({ ...flow, tags: (flow.tags || []).join(", ") });
    setTab("create");
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this flow?")) return;
    try { await api("DELETE", `/flows/${id}`); toast.success("Deleted"); load(); }
    catch (e) { toast.error(e.message); }
  };

  const handleAddField = async () => {
    if (!selectedFlow) return toast.error("Select a flow first");
    try {
      const payload = { ...fieldForm, options: fieldForm.options.split(",").map(s => s.trim()).filter(Boolean) };
      await api("POST", `/flows/${selectedFlow}/editable-fields`, payload);
      toast.success("Field added"); load();
    } catch (e) { toast.error(e.message); }
  };

  const handleRemoveField = async (key) => {
    if (!selectedFlow) return;
    try { await api("DELETE", `/flows/${selectedFlow}/editable-fields/${key}`); toast.success("Field removed"); load(); }
    catch (e) { toast.error(e.message); }
  };

  const handleAddStep = async () => {
    if (!selectedFlow) return toast.error("Select a flow first");
    try {
      await api("POST", `/flows/${selectedFlow}/steps`, { ...stepForm, order: Number(stepForm.order) });
      toast.success("Step added"); load();
    } catch (e) { toast.error(e.message); }
  };

  const handleRemoveStep = async (key) => {
    if (!selectedFlow) return;
    try { await api("DELETE", `/flows/${selectedFlow}/steps/${key}`); toast.success("Step removed"); load(); }
    catch (e) { toast.error(e.message); }
  };

  const loadAnalytics = async () => {
    try { const d = await api("GET", "/flows/analytics"); setAnalyticsData(d); setTab("analytics"); }
    catch (e) { toast.error(e.message); }
  };

  const currentFlowData = flows.find(f => f._id === selectedFlow);
  const tabs = ["list", "create", "fields", "steps", "bulk", "analytics"];

  return (
    <div>
      <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
        {tabs.map(t => (
          <button key={t} onClick={() => { setTab(t); if (t === "analytics") loadAnalytics(); }}
            style={{
              padding: "6px 16px", borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: "pointer",
              background: tab === t ? "#6366f1" : "transparent",
              color: tab === t ? "#fff" : "#64748b",
              border: tab === t ? "none" : "1px solid #1e293b",
              textTransform: "capitalize",
            }}>{t === "create" && editId ? "edit" : t}</button>
        ))}
      </div>

      {tab === "list" && (
        <Card>
          <SectionTitle>All Flows {loading && "..."}</SectionTitle>
          <Table
            cols={["name", "slug", "type", "flowType", "isActive", "isRunnable", "totalRuns"]}
            rows={flows.map(f => ({ ...f, type: f.type, flowType: f.flowType }))}
            actions={(row) => (
              <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                <Btn variant="ghost" style={{ fontSize: 11, padding: "4px 10px" }} onClick={() => handleEdit(row)}>Edit</Btn>
                <Btn variant={row.isActive ? "warning" : "success"} style={{ fontSize: 11, padding: "4px 10px" }} onClick={async () => { try { await api("PATCH", `/flows/${row._id}/toggle-status`); toast.success("Toggled"); load(); } catch (e) { toast.error(e.message); } }}>{row.isActive ? "Deactivate" : "Activate"}</Btn>
                <Btn variant="ghost" style={{ fontSize: 11, padding: "4px 10px" }} onClick={async () => { try { await api("PATCH", `/flows/${row._id}/toggle-runnable`); toast.success("Toggled"); load(); } catch (e) { toast.error(e.message); } }}>{row.isRunnable ? "Non-runnable" : "Runnable"}</Btn>
                <Btn variant="danger" style={{ fontSize: 11, padding: "4px 10px" }} onClick={() => handleDelete(row._id)}>Delete</Btn>
              </div>
            )}
          />
        </Card>
      )}

      {tab === "create" && (
        <Card>
          <SectionTitle>{editId ? "Edit Flow" : "Create Flow"}</SectionTitle>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <Select label="Integration *" options={integrations.map(i => ({ value: i._id, label: i.name }))}
              value={form.integrationId} onChange={e => setForm(p => ({ ...p, integrationId: e.target.value }))} />
            <Grid cols={2}>
              <Input label="Name *" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
              <Input label="Slug *" value={form.slug} onChange={e => setForm(p => ({ ...p, slug: e.target.value }))} />
            </Grid>
            <Grid cols={2}>
              <Input label="Type *" value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))} placeholder="Standard Checkout" />
              <Select label="Flow Type" options={["embedded", "redirect", "server_to_server", "webhook", "hybrid"]}
                value={form.flowType} onChange={e => setForm(p => ({ ...p, flowType: e.target.value }))} />
            </Grid>
            <Textarea label="Description" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
            <Input label="Short Description" value={form.shortDescription} onChange={e => setForm(p => ({ ...p, shortDescription: e.target.value }))} />
            <Input label="Tags (comma-separated)" value={form.tags} onChange={e => setForm(p => ({ ...p, tags: e.target.value }))} />
            <Divider />
            <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
              {[["webhookSupported", "Webhook"], ["refundsSupported", "Refunds"], ["sandboxSupported", "Sandbox"], ["isRunnable", "Runnable"], ["isActive", "Active"]].map(([key, label]) => (
                <label key={key} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#cbd5e1", cursor: "pointer" }}>
                  <input type="checkbox" checked={form[key]} onChange={e => setForm(p => ({ ...p, [key]: e.target.checked }))} />
                  {label}
                </label>
              ))}
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <label style={{ fontSize: 13, color: "#cbd5e1" }}>Sort Order</label>
                <input type="number" value={form.sortOrder} onChange={e => setForm(p => ({ ...p, sortOrder: e.target.value }))}
                  style={{ width: 70, background: "#0f172a", border: "1px solid #1e293b", borderRadius: 6, color: "#e2e8f0", padding: "6px 10px", fontSize: 13 }} />
              </div>
            </div>
            <Btn onClick={handleSubmit} loading={loading} style={{ alignSelf: "flex-start", marginTop: 8 }}>
              {editId ? "Save Changes" : "Create Flow"}
            </Btn>
          </div>
        </Card>
      )}

      {tab === "fields" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Card>
            <SectionTitle>Select Flow</SectionTitle>
            <Select options={flows.map(f => ({ value: f._id, label: `${f.name} (${f.slug})` }))}
              value={selectedFlow || ""} onChange={e => setSelectedFlow(e.target.value)} />
          </Card>
          {selectedFlow && (
            <>
              <Card>
                <SectionTitle>Add Editable Field</SectionTitle>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <Grid cols={2}>
                    <Input label="Key *" value={fieldForm.key} onChange={e => setFieldForm(p => ({ ...p, key: e.target.value }))} placeholder="amount" />
                    <Input label="Label *" value={fieldForm.label} onChange={e => setFieldForm(p => ({ ...p, label: e.target.value }))} placeholder="Amount" />
                  </Grid>
                  <Grid cols={2}>
                    <Select label="Type" options={["text", "number", "email", "select", "boolean", "currency"]}
                      value={fieldForm.type} onChange={e => setFieldForm(p => ({ ...p, type: e.target.value }))} />
                    <Input label="Placeholder" value={fieldForm.placeholder} onChange={e => setFieldForm(p => ({ ...p, placeholder: e.target.value }))} />
                  </Grid>
                  <Grid cols={2}>
                    <Input label="Default Value" value={fieldForm.defaultValue} onChange={e => setFieldForm(p => ({ ...p, defaultValue: e.target.value }))} />
                    <Input label="Options (comma-separated, for select)" value={fieldForm.options} onChange={e => setFieldForm(p => ({ ...p, options: e.target.value }))} />
                  </Grid>
                  <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#cbd5e1", cursor: "pointer" }}>
                    <input type="checkbox" checked={fieldForm.required} onChange={e => setFieldForm(p => ({ ...p, required: e.target.checked }))} />
                    Required
                  </label>
                  <Btn onClick={handleAddField} style={{ alignSelf: "flex-start" }}>Add Field</Btn>
                </div>
              </Card>
              <Card>
                <SectionTitle>Current Fields</SectionTitle>
                <Table
                  cols={["key", "label", "type", "required"]}
                  rows={currentFlowData?.editableFields || []}
                  actions={(row) => <Btn variant="danger" style={{ fontSize: 11, padding: "4px 10px" }} onClick={() => handleRemoveField(row.key)}>Remove</Btn>}
                />
              </Card>
            </>
          )}
        </div>
      )}

      {tab === "steps" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Card>
            <SectionTitle>Select Flow</SectionTitle>
            <Select options={flows.map(f => ({ value: f._id, label: `${f.name} (${f.slug})` }))}
              value={selectedFlow || ""} onChange={e => setSelectedFlow(e.target.value)} />
          </Card>
          {selectedFlow && (
            <>
              <Card>
                <SectionTitle>Add Step</SectionTitle>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <Grid cols={2}>
                    <Input label="Key *" value={stepForm.key} onChange={e => setStepForm(p => ({ ...p, key: e.target.value }))} placeholder="init" />
                    <Input label="Title *" value={stepForm.title} onChange={e => setStepForm(p => ({ ...p, title: e.target.value }))} placeholder="Initialize Payment" />
                  </Grid>
                  <Grid cols={2}>
                    <Input label="Order" type="number" value={stepForm.order} onChange={e => setStepForm(p => ({ ...p, order: e.target.value }))} />
                    <Textarea label="Description" value={stepForm.description} onChange={e => setStepForm(p => ({ ...p, description: e.target.value }))} style={{ minHeight: 60 }} />
                  </Grid>
                  <Btn onClick={handleAddStep} style={{ alignSelf: "flex-start" }}>Add Step</Btn>
                </div>
              </Card>
              <Card>
                <SectionTitle>Current Steps</SectionTitle>
                <Table
                  cols={["key", "title", "order", "description"]}
                  rows={[...(currentFlowData?.steps || [])].sort((a, b) => a.order - b.order)}
                  actions={(row) => <Btn variant="danger" style={{ fontSize: 11, padding: "4px 10px" }} onClick={() => handleRemoveStep(row.key)}>Remove</Btn>}
                />
              </Card>
            </>
          )}
        </div>
      )}

      {tab === "bulk" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Card>
            <SectionTitle>Bulk Sort Order</SectionTitle>
            <p style={{ fontSize: 12, color: "#64748b", marginBottom: 12 }}>One entry per line: <code style={{ color: "#6366f1" }}>id,sortOrder</code></p>
            <Textarea value={bulkSort} onChange={e => setBulkSort(e.target.value)} placeholder={"64f1a...,1\n64f1b...,2"} style={{ minHeight: 120, fontFamily: "monospace" }} />
            <Btn onClick={async () => {
              try {
                const updates = bulkSort.split("\n").map(l => { const [id, sortOrder] = l.split(","); return { id: id?.trim(), sortOrder: Number(sortOrder) }; }).filter(u => u.id);
                await api("PATCH", "/flows/bulk-sort", updates); toast.success("Updated"); load();
              } catch (e) { toast.error(e.message); }
            }} style={{ marginTop: 12 }}>Apply</Btn>
          </Card>
          <Card>
            <SectionTitle>Bulk Toggle Status</SectionTitle>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <Input label="IDs (comma-separated)" value={bulkStatus.ids} onChange={e => setBulkStatus(p => ({ ...p, ids: e.target.value }))} />
              <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#cbd5e1", cursor: "pointer" }}>
                <input type="checkbox" checked={bulkStatus.isActive} onChange={e => setBulkStatus(p => ({ ...p, isActive: e.target.checked }))} />
                Set as Active
              </label>
              <Btn onClick={async () => {
                try {
                  const ids = bulkStatus.ids.split(",").map(s => s.trim()).filter(Boolean);
                  await api("PATCH", "/flows/bulk-status", { ids, isActive: bulkStatus.isActive }); toast.success("Updated"); load();
                } catch (e) { toast.error(e.message); }
              }} style={{ alignSelf: "flex-start" }}>Apply</Btn>
            </div>
          </Card>
        </div>
      )}

      {tab === "analytics" && analyticsData && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Card>
            <SectionTitle>Overall Summary</SectionTitle>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 12 }}>
              {Object.entries(analyticsData.overall || {}).map(([k, v]) => (
                <div key={k} style={{ background: "#0f172a", borderRadius: 8, padding: 14 }}>
                  <div style={{ fontSize: 11, color: "#64748b", marginBottom: 4, textTransform: "capitalize" }}>{k.replace(/([A-Z])/g, " $1")}</div>
                  <div style={{ fontSize: 22, fontWeight: 700, color: "#e2e8f0" }}>{v}</div>
                </div>
              ))}
            </div>
          </Card>
          <Card>
            <SectionTitle>Per Flow</SectionTitle>
            <Table cols={["name", "slug", "totalRuns", "successfulRuns", "failedRuns", "isActive"]} rows={analyticsData.perFlow || []} />
          </Card>
        </div>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// SNIPPETS PANEL
// ═══════════════════════════════════════════════════════════════════════════════
const SnippetsPanel = ({ toast }) => {
  const [tab, setTab] = useState("list");
  const [snippets, setSnippets] = useState([]);
  const [flows, setFlows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({
    flowId: "", title: "", description: "", snippetType: "frontend",
    language: "javascript", framework: "", category: "complete_flow",
    code: "", explanation: "", order: 0, isDefault: false, isActive: true,
  });
  const [bulkOrder, setBulkOrder] = useState("");
  const [bulkStatus, setBulkStatus] = useState({ ids: "", isActive: true });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [s, f] = await Promise.all([api("GET", "/snippets/admin/all"), api("GET", "/flows/admin/all")]);
      setSnippets(s); setFlows(f);
    } catch (e) { toast.error(e.message); }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const payload = { ...form, order: Number(form.order) };
      if (editId) { await api("PUT", `/snippets/${editId}`, payload); toast.success("Snippet updated"); }
      else { await api("POST", "/snippets", payload); toast.success("Snippet created"); }
      setEditId(null); load(); setTab("list");
    } catch (e) { toast.error(e.message); }
    setLoading(false);
  };

  const handleEdit = (s) => { setEditId(s._id); setForm({ ...s }); setTab("create"); };

  const handleDelete = async (id) => {
    if (!confirm("Delete this snippet?")) return;
    try { await api("DELETE", `/snippets/${id}`); toast.success("Deleted"); load(); }
    catch (e) { toast.error(e.message); }
  };

  const tabs = ["list", "create", "bulk"];

  return (
    <div>
      <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
        {tabs.map(t => (
          <button key={t} onClick={() => setTab(t)}
            style={{
              padding: "6px 16px", borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: "pointer",
              background: tab === t ? "#6366f1" : "transparent",
              color: tab === t ? "#fff" : "#64748b",
              border: tab === t ? "none" : "1px solid #1e293b",
              textTransform: "capitalize",
            }}>{t === "create" && editId ? "edit" : t}</button>
        ))}
      </div>

      {tab === "list" && (
        <Card>
          <SectionTitle>All Snippets {loading && "..."}</SectionTitle>
          <Table
            cols={["title", "snippetType", "language", "category", "isDefault", "isActive", "order"]}
            rows={snippets}
            actions={(row) => (
              <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                <Btn variant="ghost" style={{ fontSize: 11, padding: "4px 10px" }} onClick={() => handleEdit(row)}>Edit</Btn>
                <Btn variant={row.isActive ? "warning" : "success"} style={{ fontSize: 11, padding: "4px 10px" }} onClick={async () => { try { await api("PATCH", `/snippets/${row._id}/toggle-status`); toast.success("Toggled"); load(); } catch (e) { toast.error(e.message); } }}>{row.isActive ? "Deactivate" : "Activate"}</Btn>
                <Btn variant="ghost" style={{ fontSize: 11, padding: "4px 10px" }} onClick={async () => { try { await api("PATCH", `/snippets/${row._id}/set-default`); toast.success("Set as default"); load(); } catch (e) { toast.error(e.message); } }}>Set Default</Btn>
                <Btn variant="danger" style={{ fontSize: 11, padding: "4px 10px" }} onClick={() => handleDelete(row._id)}>Delete</Btn>
              </div>
            )}
          />
        </Card>
      )}

      {tab === "create" && (
        <Card>
          <SectionTitle>{editId ? "Edit Snippet" : "Create Snippet"}</SectionTitle>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <Select label="Flow *" options={flows.map(f => ({ value: f._id, label: `${f.name} (${f.slug})` }))}
              value={form.flowId} onChange={e => setForm(p => ({ ...p, flowId: e.target.value }))} />
            <Input label="Title *" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} />
            <Textarea label="Description" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
            <Grid cols={3}>
              <Select label="Snippet Type *" options={["frontend", "backend", "webhook", "verification", "full_flow", "configuration"]}
                value={form.snippetType} onChange={e => setForm(p => ({ ...p, snippetType: e.target.value }))} />
              <Select label="Language" options={["javascript", "typescript", "python", "java", "php", "go", "cpp", "csharp"]}
                value={form.language} onChange={e => setForm(p => ({ ...p, language: e.target.value }))} />
              <Select label="Category" options={["configuration", "create_order", "checkout", "payment", "verification", "webhook", "refund", "complete_flow"]}
                value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))} />
            </Grid>
            <Input label="Framework" value={form.framework} onChange={e => setForm(p => ({ ...p, framework: e.target.value }))} placeholder="express, nextjs, django..." />
            <Textarea label="Code *" value={form.code} onChange={e => setForm(p => ({ ...p, code: e.target.value }))}
              style={{ minHeight: 200, fontFamily: "monospace", fontSize: 12 }} />
            <Textarea label="Explanation" value={form.explanation} onChange={e => setForm(p => ({ ...p, explanation: e.target.value }))} />
            <Divider />
            <div style={{ display: "flex", gap: 20, flexWrap: "wrap", alignItems: "center" }}>
              {[["isDefault", "Set as Default"], ["isActive", "Active"]].map(([key, label]) => (
                <label key={key} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#cbd5e1", cursor: "pointer" }}>
                  <input type="checkbox" checked={form[key]} onChange={e => setForm(p => ({ ...p, [key]: e.target.checked }))} />
                  {label}
                </label>
              ))}
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <label style={{ fontSize: 13, color: "#cbd5e1" }}>Order</label>
                <input type="number" value={form.order} onChange={e => setForm(p => ({ ...p, order: e.target.value }))}
                  style={{ width: 70, background: "#0f172a", border: "1px solid #1e293b", borderRadius: 6, color: "#e2e8f0", padding: "6px 10px", fontSize: 13 }} />
              </div>
            </div>
            <Btn onClick={handleSubmit} loading={loading} style={{ alignSelf: "flex-start", marginTop: 8 }}>
              {editId ? "Save Changes" : "Create Snippet"}
            </Btn>
          </div>
        </Card>
      )}

      {tab === "bulk" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Card>
            <SectionTitle>Bulk Update Order</SectionTitle>
            <p style={{ fontSize: 12, color: "#64748b", marginBottom: 12 }}>One entry per line: <code style={{ color: "#6366f1" }}>id,order</code></p>
            <Textarea value={bulkOrder} onChange={e => setBulkOrder(e.target.value)} placeholder={"64f1a...,1\n64f1b...,2"} style={{ minHeight: 120, fontFamily: "monospace" }} />
            <Btn onClick={async () => {
              try {
                const updates = bulkOrder.split("\n").map(l => { const [id, order] = l.split(","); return { id: id?.trim(), order: Number(order) }; }).filter(u => u.id);
                await api("PATCH", "/snippets/bulk-order", updates); toast.success("Updated"); load();
              } catch (e) { toast.error(e.message); }
            }} style={{ marginTop: 12 }}>Apply</Btn>
          </Card>
          <Card>
            <SectionTitle>Bulk Toggle Status</SectionTitle>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <Input label="IDs (comma-separated)" value={bulkStatus.ids} onChange={e => setBulkStatus(p => ({ ...p, ids: e.target.value }))} />
              <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#cbd5e1", cursor: "pointer" }}>
                <input type="checkbox" checked={bulkStatus.isActive} onChange={e => setBulkStatus(p => ({ ...p, isActive: e.target.checked }))} />
                Set as Active
              </label>
              <Btn onClick={async () => {
                try {
                  const ids = bulkStatus.ids.split(",").map(s => s.trim()).filter(Boolean);
                  await api("PATCH", "/snippets/bulk-status", { ids, isActive: bulkStatus.isActive }); toast.success("Updated"); load();
                } catch (e) { toast.error(e.message); }
              }} style={{ alignSelf: "flex-start" }}>Apply</Btn>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// ROOT ADMIN PAGE
// ═══════════════════════════════════════════════════════════════════════════════
const SECTIONS = [
  { key: "integrations", label: "Integrations", icon: "⚡", color: "#6366f1" },
  { key: "flows", label: "Flows", icon: "🔀", color: "#0ea5e9" },
  { key: "snippets", label: "Code Snippets", icon: "{ }", color: "#10b981" },
];

import API from "../api/axios.js";

export default function AdminPage() {
  const { user, loading } = useAuth();
  const toast = useToast();
  const [section, setSection] = useState("integrations");

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: "#0a0f1a", display: "flex", alignItems: "center", justifyContent: "center", color: "#475569", fontFamily: "Inter, system-ui, sans-serif" }}>
        Loading...
      </div>
    );
  }

  if (!user) {
    window.location.href = "/login";
    return null;
  }

  // optional — if you have a role field
  if (user.userType !== "admin") {
    return (
      <div style={{ minHeight: "100vh", background: "#0a0f1a", display: "flex", alignItems: "center", justifyContent: "center", color: "#dc2626", fontFamily: "Inter, system-ui, sans-serif" }}>
        Access denied.
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh",paddingTop: 60 ,background: "#0a0f1a", color: "#e2e8f0", fontFamily: "'Inter', system-ui, sans-serif" }}>
      <style>{`* { box-sizing: border-box; margin: 0; padding: 0; } @keyframes fadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } } input[type=checkbox] { accent-color: #6366f1; width: 15px; height: 15px; cursor: pointer; } code { background: #1e293b; padding: 2px 6px; border-radius: 4px; font-family: monospace; } select option { background: #1e293b; }`}</style>

      {/* Header */}
      <div style={{ borderBottom: "1px solid #1e293b", padding: "0 32px", background: "#0d1424" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", height: 56 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 28, height: 28, borderRadius: 6, background: "linear-gradient(135deg, #6366f1, #0ea5e9)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>⚙</div>
            <span style={{ fontWeight: 700, fontSize: 15, color: "#f1f5f9", letterSpacing: "-0.02em" }}>Admin Panel</span>
          </div>
          <div style={{ fontSize: 11, color: "#475569" }}>{new Date().toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" })}</div>
        </div>
      </div>

      {/* Section Selector */}
      <div style={{ borderBottom: "1px solid #1e293b", background: "#0d1424" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 32px", display: "flex", gap: 0 }}>
          {SECTIONS.map((s) => (
            <button key={s.key} onClick={() => setSection(s.key)} style={{
              padding: "14px 24px", fontSize: 13, fontWeight: 600, cursor: "pointer",
              background: "transparent", border: "none",
              color: section === s.key ? s.color : "#475569",
              borderBottom: section === s.key ? `2px solid ${s.color}` : "2px solid transparent",
              transition: "all 0.15s", display: "flex", alignItems: "center", gap: 7,
            }}>
              <span style={{ fontSize: 15 }}>{s.icon}</span>
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Body */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "28px 32px" }}>
        {section === "integrations" && <IntegrationsPanel toast={toast} />}
        {section === "flows" && <FlowsPanel toast={toast} />}
        {section === "snippets" && <SnippetsPanel toast={toast} />}
      </div>

      <ToastContainer toasts={toast.toasts} />
    </div>
  );
}




