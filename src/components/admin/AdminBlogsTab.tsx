import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { BlogPostItem } from '../../types/blog';
import { BlogService } from '../../services/BlogService';
import { DataTable, DataTableColumn } from '../ui/DataTable';
import { CustomSelect } from '../ui/Select';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { Button } from '../ui/Button';
import { IconButton } from '../ui/IconButton';
import { VisualRichTextEditor } from './VisualRichTextEditor';
import { Link } from '../common/Link';
import { slugify } from '../../utils/slugify';
import {
  FileText,
  Plus,
  Edit3,
  Trash2,
  Eye,
  CheckCircle2,
  Clock,
  Sparkles,
  Search,
  Globe,
  Tag,
  Image as ImageIcon,
  ArrowLeft,
  Save,
} from 'lucide-react';

interface AdminBlogsTabProps {
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const AdminBlogsTab: React.FC<AdminBlogsTabProps> = ({ showToast }) => {
  const { navigate, currentPath } = useApp();
  const [posts, setPosts] = useState<BlogPostItem[]>([]);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [activeEditorTab, setActiveEditorTab] = useState<'content' | 'seo'>('content');
  const [isSeeding, setIsSeeding] = useState(false);

  const handleSeedDefaults = async () => {
    setIsSeeding(true);
    try {
      const ok = await BlogService.seedBlogsToFirestore(BlogService.getAllPosts());
      if (ok) {
        showToast('Articles successfully synchronized to Firestore!', 'success');
      } else {
        showToast('Failed to sync articles. Check admin permissions.', 'error');
      }
    } catch {
      showToast('An error occurred while syncing articles.', 'error');
    } finally {
      setIsSeeding(false);
    }
  };

  // Inspect URL parameters for ?edit=:id or ?action=new or /admin/blogs/edit/:id or /admin/blogs/new
  const cleanPath = (currentPath || window.location.pathname).split('?')[0].replace(/\/$/, '');
  const searchParams = new URLSearchParams(window.location.search);
  const isPathNew = cleanPath === '/admin/blogs/new';
  const pathEditMatch = cleanPath.match(/\/admin\/blogs\/edit\/([^\/]+)/);
  const pathEditId = pathEditMatch ? pathEditMatch[1] : null;

  const editId = searchParams.get('edit') || pathEditId;
  const isCreatingNew = searchParams.get('action') === 'new' || isPathNew;

  const [editingPost, setEditingPost] = useState<Partial<BlogPostItem>>({});

  const loadPosts = () => {
    setPosts(BlogService.getAllPosts());
  };

  useEffect(() => {
    const unsub = BlogService.subscribeAllPosts((livePosts) => {
      setPosts(livePosts);
    });
    return unsub;
  }, []);

  // Sync editingPost when editId or action=new changes in URL
  useEffect(() => {
    if (editId) {
      const found = BlogService.getPostBySlug(editId) || posts.find((p) => p.id === editId);
      if (found) {
        setEditingPost(JSON.parse(JSON.stringify(found)));
      }
    } else if (isCreatingNew) {
      setEditingPost({
        id: `blog_${Date.now()}`,
        slug: `new-article-${Date.now().toString().slice(-4)}`,
        title: 'New Editorial Article Title',
        excerpt: 'Short description for search engine summaries and article card preview.',
        contentHtml: '<h2>Introduction</h2><p>Write your detailed tutorial or guide here...</p>',
        category: 'Tutorials',
        tags: ['Guide', 'Optimization'],
        author: {
          name: 'AetherPix Imaging Team',
          role: 'Digital Media Engineers',
          avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
        },
        coverImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
        readTime: '4 min read',
        publishedDate: new Date().toISOString().split('T')[0],
        updatedDate: new Date().toISOString().split('T')[0],
        status: 'draft',
        seo: {
          seoTitle: 'New Editorial Article Title | AetherPix Studio',
          metaDescription: 'Short description for search engine summaries and article card preview.',
          h1Title: 'New Editorial Article Title',
        },
        views: 0,
      });
    }
  }, [editId, isCreatingNew, posts]);

  const handleDelete = async (id: string, title: string) => {
    if (window.confirm(`Are you sure you want to delete article "${title}"?`)) {
      await BlogService.deletePost(id);
      loadPosts();
      showToast(`Deleted article "${title}"`, 'info');
    }
  };

  const handleBulkDelete = async (selectedIds: string[]) => {
    if (window.confirm(`Are you sure you want to delete ${selectedIds.length} selected article(s)?`)) {
      for (const id of selectedIds) {
        await BlogService.deletePost(id);
      }
      loadPosts();
      showToast(`Deleted ${selectedIds.length} article(s)`, 'info');
    }
  };

  const handleToggleStatus = async (id: string) => {
    const updated = await BlogService.toggleStatus(id);
    if (updated) {
      loadPosts();
      showToast(`Article status changed to ${updated.status}`, 'success');
    }
  };

  const handleSaveEditor = async (statusToSet?: 'published' | 'draft') => {
    if (!editingPost.title || !editingPost.slug) {
      showToast('Article Title and Slug are required', 'error');
      return;
    }

    const cleanSlug = slugify(editingPost.slug.replace(/^\/+|\/+$/g, ''));

    const postToSave: BlogPostItem = {
      id: editingPost.id || `blog_${Date.now()}`,
      slug: cleanSlug,
      title: editingPost.title,
      excerpt: editingPost.excerpt || '',
      contentHtml: editingPost.contentHtml || '',
      category: editingPost.category || 'General',
      tags: Array.isArray(editingPost.tags) ? editingPost.tags : [],
      author: editingPost.author || {
        name: 'AetherPix Editorial Team',
        role: 'Digital Media Engineers',
      },
      coverImage: editingPost.coverImage,
      readTime: editingPost.readTime || '4 min read',
      publishedDate: editingPost.publishedDate || new Date().toISOString().split('T')[0],
      updatedDate: new Date().toISOString().split('T')[0],
      status: statusToSet || editingPost.status || 'published',
      seo: editingPost.seo || {
        seoTitle: editingPost.title,
        metaDescription: editingPost.excerpt,
        h1Title: editingPost.title,
      },
      views: editingPost.views || 0,
      featured: editingPost.featured || false,
    };

    await BlogService.savePost(postToSave);
    loadPosts();
    showToast(`Saved article "${postToSave.title}" (${postToSave.status})`, 'success');
    navigate('/admin/blogs');
  };

  // Dedicated Full-Page Article Editor View when editId or action=new is present
  if (editId || isCreatingNew) {
    return (
      <div className="space-y-6 animate-fade-in">
        {/* Top Action Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-3xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-sm">
          <div className="flex items-center gap-3">
            <Link
              href="/admin/blogs"
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>{editingPost.title || 'Edit Editorial Article'}</span>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                    editingPost.status === 'published'
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                      : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                  }`}
                >
                  {editingPost.status || 'draft'}
                </span>
              </h2>
              <p className="text-xs text-slate-500 font-mono mt-0.5">
                URL: /blog/{editingPost.slug || 'slug'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {editingPost.id && (
              <Button
                variant="destructive"
                size="sm"
                leftIcon={Trash2}
                onClick={() => {
                  if (editingPost.id) {
                    handleDelete(editingPost.id, editingPost.title || 'Article');
                    navigate('/admin/blogs');
                  }
                }}
              >
                Delete
              </Button>
            )}
            <Button
              variant="secondary"
              size="sm"
              onClick={() => handleSaveEditor('draft')}
            >
              Save Draft
            </Button>
            <Button
              variant="primary"
              size="sm"
              leftIcon={Save}
              onClick={() => handleSaveEditor('published')}
            >
              Publish Article
            </Button>
          </div>
        </div>

        {/* Editor Main Container */}
        <div className="rounded-3xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-md overflow-hidden">
          {/* Tab Navigation Controls */}
          <div className="flex border-b border-slate-200 dark:border-slate-800 px-6 bg-slate-50/50 dark:bg-slate-950">
            <button
              onClick={() => setActiveEditorTab('content')}
              className={`py-3.5 px-4 text-xs font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeEditorTab === 'content'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Edit3 className="h-4 w-4" />
              <span>Content & Body</span>
            </button>
            <button
              onClick={() => setActiveEditorTab('seo')}
              className={`py-3.5 px-4 text-xs font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeEditorTab === 'seo'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Globe className="h-4 w-4" />
              <span>SEO & Metadata</span>
            </button>
          </div>

          <div className="p-6 sm:p-8 space-y-6">
            {activeEditorTab === 'content' ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Article Title"
                    value={editingPost.title || ''}
                    onChange={(e) => setEditingPost({ ...editingPost, title: e.target.value })}
                    placeholder="e.g. How to Compress Images Without Quality Loss"
                    required
                  />
                  <Input
                    label="URL Slug (/blog/...)"
                    value={editingPost.slug || ''}
                    onChange={(e) => setEditingPost({ ...editingPost, slug: e.target.value })}
                    placeholder="e.g. how-to-compress-images-without-losing-quality"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Input
                    label="Category"
                    value={editingPost.category || ''}
                    onChange={(e) => setEditingPost({ ...editingPost, category: e.target.value })}
                    placeholder="e.g. Tutorials, Optimization, Format Guides"
                  />
                  <Input
                    label="Read Time"
                    value={editingPost.readTime || ''}
                    onChange={(e) => setEditingPost({ ...editingPost, readTime: e.target.value })}
                    placeholder="e.g. 4 min read"
                  />
                  <Input
                    label="Cover Image URL"
                    value={editingPost.coverImage || ''}
                    onChange={(e) => setEditingPost({ ...editingPost, coverImage: e.target.value })}
                    placeholder="https://images.unsplash.com/..."
                  />
                </div>

                <Textarea
                  label="Lead Summary / Excerpt"
                  rows={2}
                  value={editingPost.excerpt || ''}
                  onChange={(e) => setEditingPost({ ...editingPost, excerpt: e.target.value })}
                  placeholder="Short lead paragraph summarizing key points for cards and search snippets..."
                />

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                    Visual WYSIWYG Rich Content Editor
                  </label>
                  <VisualRichTextEditor
                    value={editingPost.contentHtml || ''}
                    onChange={(html) => setEditingPost({ ...editingPost, contentHtml: html })}
                    minHeight="420px"
                  />
                </div>
              </>
            ) : (
              <div className="space-y-4 max-w-2xl">
                <Input
                  label="Search Engine Title (SEO Title)"
                  value={editingPost.seo?.seoTitle || editingPost.title || ''}
                  onChange={(e) =>
                    setEditingPost({
                      ...editingPost,
                      seo: { ...editingPost.seo, seoTitle: e.target.value },
                    })
                  }
                  placeholder="Page title displayed in Google search results tab"
                />
                <Textarea
                  label="Meta Description"
                  rows={3}
                  value={editingPost.seo?.metaDescription || editingPost.excerpt || ''}
                  onChange={(e) =>
                    setEditingPost({
                      ...editingPost,
                      seo: { ...editingPost.seo, metaDescription: e.target.value },
                    })
                  }
                  placeholder="150-160 character description for search snippets"
                />
                <Input
                  label="H1 Heading Override"
                  value={editingPost.seo?.h1Title || editingPost.title || ''}
                  onChange={(e) =>
                    setEditingPost({
                      ...editingPost,
                      seo: { ...editingPost.seo, h1Title: e.target.value },
                    })
                  }
                  placeholder="Custom H1 title rendered on the article header"
                />
                <Input
                  label="Canonical URL"
                  value={editingPost.seo?.canonicalUrl || ''}
                  onChange={(e) =>
                    setEditingPost({
                      ...editingPost,
                      seo: { ...editingPost.seo, canonicalUrl: e.target.value },
                    })
                  }
                  placeholder="https://aetherpix.com/blog/..."
                />
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Filtered posts
  const filteredPosts = posts.filter((p) => {
    if (categoryFilter !== 'all' && p.category !== categoryFilter) return false;
    if (statusFilter !== 'all' && p.status !== statusFilter) return false;
    return true;
  });

  const categories = Array.from(new Set(posts.map((p) => p.category)));
  const totalViews = posts.reduce((sum, p) => sum + (p.views || 0), 0);
  const publishedCount = posts.filter((p) => p.status === 'published').length;
  const draftCount = posts.filter((p) => p.status === 'draft').length;

  const columns: DataTableColumn<BlogPostItem>[] = [
    {
      id: 'article',
      header: 'ARTICLE',
      accessorKey: 'title',
      sortable: true,
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          {row.coverImage ? (
            <img
              src={row.coverImage}
              alt=""
              className="h-10 w-14 rounded-lg object-cover border border-slate-200 dark:border-slate-800 shrink-0"
            />
          ) : (
            <div className="h-10 w-14 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0">
              <FileText className="h-5 w-5" />
            </div>
          )}
          <div className="min-w-0">
            <h4 className="font-bold text-xs text-slate-900 dark:text-white truncate max-w-xs hover:text-primary transition-colors">
              {row.title}
            </h4>
            <p className="text-[10px] text-slate-500 font-mono truncate max-w-xs mt-0.5">
              /blog/{row.slug}
            </p>
          </div>
        </div>
      ),
    },
    {
      id: 'category',
      header: 'CATEGORY',
      accessorKey: 'category',
      sortable: true,
      cell: ({ row }) => (
        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
          {row.category}
        </span>
      ),
    },
    {
      id: 'views',
      header: 'READERS / VIEWS',
      accessorKey: 'views',
      sortable: true,
      cell: ({ row }) => (
        <div className="flex items-center gap-1 text-xs font-mono font-bold text-slate-700 dark:text-slate-300">
          <Eye className="h-3.5 w-3.5 text-slate-400" />
          <span>{(row.views || 0).toLocaleString()}</span>
        </div>
      ),
    },
    {
      id: 'status',
      header: 'STATUS',
      sortable: true,
      cell: ({ row }) => (
        <button
          onClick={() => handleToggleStatus(row.id)}
          className={`px-2.5 py-1 rounded-lg font-bold text-[10px] uppercase cursor-pointer transition-all ${
            row.status === 'published'
              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20'
              : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 hover:bg-amber-500/20'
          }`}
        >
          {row.status}
        </button>
      ),
    },
    {
      id: 'actions',
      header: 'ACTIONS',
      align: 'right',
      sortable: false,
      cell: ({ row }) => (
        <div className="flex items-center justify-end gap-1.5">
          <Link href={`/admin/blogs/edit/${row.id}`}>
            <IconButton
              icon={Edit3}
              variant="ghost"
              size="sm"
              aria-label="Edit Article"
              title="Edit Article"
            />
          </Link>
          <IconButton
            icon={Trash2}
            variant="ghost"
            size="sm"
            onClick={() => handleDelete(row.id, row.title)}
            className="hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
            aria-label="Delete Article"
            title="Delete Article"
          />
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-2xs space-y-1">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Total Articles</div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">{posts.length}</div>
        </div>
        <div className="p-4 rounded-2xl border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-2xs space-y-1">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Published Live</div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{publishedCount}</div>
        </div>
        <div className="p-4 rounded-2xl border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-2xs space-y-1">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Drafts</div>
          <div className="text-2xl font-black text-amber-600 dark:text-amber-400">{draftCount}</div>
        </div>
        <div className="p-4 rounded-2xl border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-2xs space-y-1">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Total Readers</div>
          <div className="text-2xl font-black text-primary">{totalViews.toLocaleString()}</div>
        </div>
      </div>

      {/* Main Table View */}
      <DataTable
        data={filteredPosts}
        columns={columns}
        keyExtractor={(item) => item.id}
        enableSelection={true}
        selectedActions={({ selectedIds, clearSelection }) => (
          <Button
            variant="destructive"
            size="sm"
            leftIcon={Trash2}
            onClick={() => {
              handleBulkDelete(selectedIds);
              clearSelection();
            }}
          >
            Delete Selected ({selectedIds.length})
          </Button>
        )}
        searchPlaceholder="Search articles by title, slug, or tags..."
        exportFileName="aetherpix_blog_posts"
        defaultPageSize={10}
        headerActions={
          <div className="flex items-center gap-2">
            <Link href="/admin/seo">
              <Button
                variant="outline"
                size="sm"
                leftIcon={Sparkles}
                className="text-blue-600 border-blue-200 dark:border-blue-800 dark:text-blue-400"
                title="Run SEO Audit across Firestore blogs & tools"
              >
                SEO Audit
              </Button>
            </Link>
            <Button
              variant="secondary"
              size="sm"
              leftIcon={Sparkles}
              disabled={isSeeding}
              onClick={handleSeedDefaults}
              title="Push built-in baseline articles to Firestore database"
            >
              {isSeeding ? 'Syncing...' : 'Sync Defaults'}
            </Button>
            <div className="w-44">
              <CustomSelect
                value={categoryFilter}
                onChange={(val) => setCategoryFilter(val)}
                options={[
                  { value: 'all', label: `All Categories (${posts.length})` },
                  ...categories.map((cat) => ({
                    value: cat,
                    label: `${cat} (${posts.filter((p) => p.category === cat).length})`,
                  })),
                ]}
              />
            </div>
            <Link href="/admin/blogs/new">
              <Button variant="primary" size="sm" leftIcon={Plus}>
                Create Blog Post
              </Button>
            </Link>
          </div>
        }
      />
    </div>
  );
};
