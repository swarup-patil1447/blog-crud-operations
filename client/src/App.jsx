import { useCallback, useEffect, useMemo, useState } from "react";
import { BookOpen, Search, Plus, Pencil, Trash2, X, ArrowUpRight, Clock3, UserRound, Tags, FileText, CheckCircle2, AlertCircle } from "lucide-react";

const API = (import.meta.env.VITE_API_URL || "http://localhost:5000/api").replace(/\/$/, "");
const blankForm = { title: "", author: "", category: "Technology", content: "" };
const categoryColors = ["blue", "purple", "green", "orange", "pink"];

function formatDate(value) {
  return new Date(value).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}
function excerpt(text, length = 145) {
  return text.length > length ? `${text.slice(0, length).trim()}…` : text;
}

export default function App() {
  const [blogs, setBlogs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All categories");
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(blankForm);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState(null);
  const [error, setError] = useState("");

  const loadBlogs = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.set("search", search.trim());
      if (category !== "All categories") params.set("category", category);
      const response = await fetch(`${API}/blogs?${params.toString()}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Could not load blogs.");
      setBlogs(data);
    } catch (err) {
      setError(`${err.message} Make sure the backend and MongoDB are running.`);
    } finally { setLoading(false); }
  }, [search, category]);

  const loadCategories = useCallback(async () => {
    try {
      const response = await fetch(`${API}/blogs/categories`);
      if (response.ok) setCategories(await response.json());
    } catch { /* Categories are also inferred from posts below. */ }
  }, []);

  useEffect(() => { const timer = setTimeout(loadBlogs, 250); return () => clearTimeout(timer); }, [loadBlogs]);
  useEffect(() => { loadCategories(); }, [loadCategories, blogs.length]);

  const allCategories = useMemo(
    () => [...new Set([...categories, ...blogs.map((blog) => blog.category)])].sort((a, b) => a.localeCompare(b)),
    [categories, blogs]
  );

  function openCreate() {
    setEditing(null); setForm(blankForm); setModalOpen(true);
  }
  function openEdit(blog) {
    setEditing(blog); setForm({ title: blog.title, author: blog.author, category: blog.category, content: blog.content }); setModalOpen(true);
  }
  function closeModal() { if (!saving) setModalOpen(false); }
  function updateField(event) { setForm((current) => ({ ...current, [event.target.name]: event.target.value })); }

  async function submitBlog(event) {
    event.preventDefault();
    setSaving(true); setNotice(null);
    try {
      const response = await fetch(editing ? `${API}/blogs/${editing._id}` : `${API}/blogs`, {
        method: editing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Could not save blog.");
      setModalOpen(false);
      setNotice({ type: "success", text: editing ? "Blog updated successfully." : "Your blog has been published." });
      await loadBlogs(); await loadCategories();
    } catch (err) { setNotice({ type: "error", text: err.message }); }
    finally { setSaving(false); }
  }

  async function deleteBlog(blog) {
    if (!window.confirm(`Delete “${blog.title}”? This action cannot be undone.`)) return;
    setNotice(null);
    try {
      const response = await fetch(`${API}/blogs/${blog._id}`, { method: "DELETE" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Could not delete blog.");
      setNotice({ type: "success", text: "Blog deleted." });
      await loadBlogs(); await loadCategories();
    } catch (err) { setNotice({ type: "error", text: err.message }); }
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="brand" href="#" aria-label="InkWell home"><span className="brand-mark"><BookOpen size={21} /></span><span>InkWell<span className="brand-dot">.</span></span></a>
        <div className="topbar-right"><span className="status-dot" /> Your writing workspace <span className="avatar">IW</span></div>
      </header>

      <main className="main-content">
        <section className="hero">
          <div className="hero-copy">
            <span className="eyebrow"><span className="eyebrow-line" /> YOUR IDEAS, WELL TOLD</span>
            <h1>Stories worth<br /><span>sharing.</span></h1>
            <p>Write, organize, and manage your ideas in one calm, focused space.</p>
            <button className="primary-btn hero-btn" onClick={openCreate}><Plus size={18} /> Write a blog</button>
          </div>
          <div className="hero-art" aria-hidden="true">
            <div className="art-orbit orbit-one" /><div className="art-orbit orbit-two" />
            <div className="paper-card"><div className="paper-top"><span /><span /><span /></div><div className="paper-label">FIELD NOTES / 01</div><div className="paper-title">Ideas become<br />something more.</div><div className="paper-line long" /><div className="paper-line" /><div className="paper-line short" /><div className="paper-sign">inkwell<span>.</span></div></div>
            <div className="floating-note note-top"><Pencil size={15} /> Draft something good</div>
            <div className="floating-note note-bottom"><CheckCircle2 size={16} /> Ready to publish</div>
          </div>
        </section>

        <section className="stats-row" aria-label="Blog statistics">
          <div className="stat-card"><span className="stat-icon"><FileText size={18} /></span><div><strong>{blogs.length}</strong><span>Blogs shown</span></div></div>
          <div className="stat-card"><span className="stat-icon lilac"><Tags size={18} /></span><div><strong>{allCategories.length}</strong><span>Categories</span></div></div>
          <div className="stat-card"><span className="stat-icon mint"><CheckCircle2 size={18} /></span><div><strong>CRUD</strong><span>Full control</span></div></div>
        </section>

        <section className="library-section">
          <div className="section-heading"><div><span className="section-kicker">THE LIBRARY</span><h2>Your latest stories</h2><p>Everything you’ve written, all in one place.</p></div><button className="primary-btn create-btn" onClick={openCreate}><Plus size={17} /> New blog</button></div>
          <div className="toolbar">
            <label className="search-box"><Search size={18} /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search titles, content, or authors…" aria-label="Search blogs" />{search && <button className="clear-search" onClick={() => setSearch("")} aria-label="Clear search"><X size={15} /></button>}</label>
            <label className="category-select"><Tags size={16} /><select value={category} onChange={(e) => setCategory(e.target.value)} aria-label="Filter by category"><option>All categories</option>{allCategories.map((item) => <option key={item}>{item}</option>)}</select></label>
          </div>

          {notice && <div className={`notice ${notice.type}`}><span>{notice.type === "success" ? <CheckCircle2 size={17} /> : <AlertCircle size={17} />}</span>{notice.text}<button onClick={() => setNotice(null)} aria-label="Dismiss notification"><X size={16} /></button></div>}
          {error && <div className="error-panel"><AlertCircle size={20} /><div><strong>Couldn’t connect to the blog API</strong><p>{error}</p><button className="text-btn" onClick={loadBlogs}>Try again</button></div></div>}

          {loading && !error ? <div className="loading-state"><span className="spinner" />Loading your stories…</div> :
            !error && blogs.length === 0 ? <div className="empty-state"><div className="empty-icon"><BookOpen size={26} /></div><h3>{search || category !== "All categories" ? "No stories found" : "Your first story starts here"}</h3><p>{search || category !== "All categories" ? "Try a different search or category filter." : "Create a blog post and it will appear in your library."}</p>{!search && category === "All categories" && <button className="primary-btn" onClick={openCreate}><Plus size={17} /> Create your first blog</button>}</div> :
            !error && <div className="blog-grid">{blogs.map((blog, index) => <article className="blog-card" key={blog._id}>
              <div className={`card-art art-${index % 4}`}><span className={`category-pill ${categoryColors[allCategories.indexOf(blog.category) % categoryColors.length] || "blue"}`}>{blog.category}</span><span className="art-number">{String(index + 1).padStart(2, "0")}</span><div className="card-art-decoration"><span /><span /><span /></div><div className="card-art-word">{blog.category.slice(0, 1).toUpperCase()}</div></div>
              <div className="blog-card-body"><div className="card-meta"><span><Clock3 size={13} /> {formatDate(blog.updatedAt || blog.createdAt)}</span><span className="meta-dot">·</span><span><UserRound size={13} /> {blog.author}</span></div><h3>{blog.title}</h3><p className="blog-excerpt">{excerpt(blog.content)}</p><div className="card-footer"><span className="read-label">BLOG POST <ArrowUpRight size={14} /></span><div className="card-actions"><button onClick={() => openEdit(blog)} aria-label={`Edit ${blog.title}`} title="Edit blog"><Pencil size={15} /></button><button className="delete-action" onClick={() => deleteBlog(blog)} aria-label={`Delete ${blog.title}`} title="Delete blog"><Trash2 size={15} /></button></div></div></div>
            </article>)}</div>}
          {!loading && !error && blogs.length > 0 && <div className="results-foot">Showing <strong>{blogs.length}</strong> {blogs.length === 1 ? "story" : "stories"} in your library</div>}
        </section>
        <footer className="footer"><a className="brand footer-brand" href="#"><span className="brand-mark"><BookOpen size={17} /></span><span>InkWell<span className="brand-dot">.</span></span></a><span>Made for ideas that deserve a page.</span><span>© {new Date().getFullYear()} InkWell</span></footer>
      </main>

      {modalOpen && <div className="modal-backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget) closeModal(); }}><section className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <div className="modal-header"><div><span className="section-kicker">{editing ? "REFINE YOUR STORY" : "START SOMETHING NEW"}</span><h2 id="modal-title">{editing ? "Edit your blog" : "Write a new blog"}</h2><p>{editing ? "Make your changes and save when you’re ready." : "Put your thoughts into words and share them with the world."}</p></div><button className="modal-close" onClick={closeModal} aria-label="Close dialog"><X size={20} /></button></div>
        <form onSubmit={submitBlog} className="blog-form">
          <label>Blog title<input name="title" value={form.title} onChange={updateField} maxLength={140} placeholder="Give your story a title" required /></label>
          <div className="form-row"><label>Author<input name="author" value={form.author} onChange={updateField} maxLength={80} placeholder="Your name" required /></label><label>Category<input name="category" value={form.category} onChange={updateField} maxLength={50} placeholder="e.g. Technology" list="category-suggestions" required /><datalist id="category-suggestions">{allCategories.map((item) => <option key={item} value={item} />)}</datalist></label></div>
          <label>Story<textarea name="content" value={form.content} onChange={updateField} placeholder="Start writing here…" rows={8} required /></label>
          <div className="form-footer"><span>{form.content.trim().split(/\s+/).filter(Boolean).length} words</span><div><button type="button" className="secondary-btn" onClick={closeModal} disabled={saving}>Cancel</button><button type="submit" className="primary-btn" disabled={saving}>{saving ? "Saving…" : <>{editing ? <CheckCircle2 size={17} /> : <Plus size={17} />}{editing ? " Save changes" : " Publish blog"}</>}</button></div></div>
        </form>
      </section></div>}
    </div>
  );
}
