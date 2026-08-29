(() => {
    'use strict';

    const state = {
        user: null,
        isSuperAdmin: false,
        posts: [],
        filteredPosts: [],
        searchQuery: '',
        filterCategory: 'all',
        filterStatus: 'all',
        editingPostId: null,
        selectedImageFile: null,
        uploadedImageUrl: ''
    };

    const $ = (id) => document.getElementById(id);

    // Toast helper
    function toast(msg) {
        const t = $('toast');
        if (!t) return;
        t.textContent = msg;
        t.style.display = 'block';
        t.classList.add('show');
        setTimeout(() => {
            t.classList.remove('show');
            setTimeout(() => { t.style.display = 'none'; }, 300);
        }, 2200);
    }

    const safe = (v) => String(v ?? '').replace(/[<>&'"]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&#39;', '"': '&quot;' }[c]));

    // Format date
    function formatDateStr(val) {
        if (!val) return '2026-08-22';
        if (val.toDate) {
            const d = val.toDate();
            return d.toISOString().slice(0, 10);
        }
        if (typeof val === 'string') return val.slice(0, 10);
        return '2026-08-22';
    }

    // Super Admin Security Guard
    async function guardSuperAdmin(user) {
        if (!user) {
            window.location.href = '/auth/login.html';
            return false;
        }

        const token = await user.getIdTokenResult(true).catch(() => null);
        const claimAdmin = !!(token && token.claims && (token.claims.admin === true || token.claims.superAdmin === true));
        
        const db = firebase.firestore();
        const udoc = await db.collection('users').doc(user.uid).get().catch(() => null);
        const u = udoc && udoc.exists ? (udoc.data() || {}) : {};
        const docAdmin = u.superAdmin === true || String(u.role || '').toUpperCase() === 'SUPER_ADMIN';

        state.isSuperAdmin = claimAdmin || docAdmin;
        if (!state.isSuperAdmin) {
            alert('Access Denied: Super Admin privileges required.');
            window.location.href = '/modules/core/dashboard.html';
            return false;
        }

        return true;
    }

    // Load Posts from Firestore
    async function loadPosts() {
        const db = firebase.firestore();
        try {
            const snap = await db.collection('blog_posts').orderBy('createdAt', 'desc').get().catch(async (e) => {
                console.warn('[BlogManager] Fallback get:', e);
                return await db.collection('blog_posts').get();
            });

            state.posts = snap.docs.map(doc => {
                const d = doc.data() || {};
                return {
                    id: doc.id,
                    title: d.title || 'Untitled Post',
                    category: d.category || 'features',
                    categoryLabel: d.categoryLabel || '',
                    icon: d.icon || '📈',
                    desc: d.desc || d.summary || '',
                    content: d.content || '',
                    imageUrl: d.imageUrl || '',
                    author: d.author || 'DIGIBIZ Engineering',
                    date: d.date || formatDateStr(d.createdAt),
                    createdAt: d.createdAt,
                    published: d.published !== false
                };
            });

            updateStats();
            applyFilter();
        } catch (err) {
            console.error('[BlogManager] Error loading posts:', err);
            toast('Failed to load posts: ' + err.message);
        }
    }

    // Update Top Summary Stats
    function updateStats() {
        const total = state.posts.length;
        const published = state.posts.filter(p => p.published).length;
        const drafts = total - published;
        const features = state.posts.filter(p => p.category === 'features').length;
        const tips = state.posts.filter(p => p.category === 'tips').length;

        $('stTotalPosts').textContent = total;
        $('stPublishedPosts').textContent = published;
        $('stDraftPosts').textContent = drafts;
        $('stCatFeatures').textContent = features;
        $('stCatTips').textContent = tips;
    }

    // Apply Filter & Search
    function applyFilter() {
        const q = state.searchQuery.trim().toLowerCase();
        const cat = state.filterCategory;
        const status = state.filterStatus;

        state.filteredPosts = state.posts.filter(p => {
            const matchCat = cat === 'all' || p.category === cat;
            const matchStatus = status === 'all' || (status === 'published' && p.published) || (status === 'draft' && !p.published);
            const matchQuery = !q || p.title.toLowerCase().includes(q) || p.desc.toLowerCase().includes(q);
            return matchCat && matchStatus && matchQuery;
        });

        renderTable();
    }

    // Render Table Body
    function renderTable() {
        const tbody = $('postsTableBody');
        if (state.filteredPosts.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" style="text-align:center;padding:40px;color:#64748b;">
                        No blog posts matching the selected filters.
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = state.filteredPosts.map(p => {
            const statusClass = p.published ? 'badge-published' : 'badge-draft';
            const statusText = p.published ? '🟢 Published' : '⚪ Draft';

            return `
                <tr>
                    <td>
                        <div class="post-icon-badge">${safe(p.icon)}</div>
                    </td>
                    <td>
                        <div class="post-title-cell">${safe(p.title)}</div>
                        <div style="font-size:12.5px;color:#64748b;margin-top:2px;max-width:500px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">
                            ${safe(p.desc)}
                        </div>
                    </td>
                    <td>
                        <span style="font-size:12px;font-weight:700;background:#f1f5f9;padding:4px 8px;border-radius:6px;color:#334155;">
                            ${safe(p.category)}
                        </span>
                    </td>
                    <td style="font-size:13px;color:#64748b;">
                        ${safe(p.date)}
                    </td>
                    <td>
                        <button type="button" class="badge-status ${statusClass}" onclick="togglePublishStatus('${p.id}', ${!p.published})" title="Click to toggle publish">
                            ${statusText}
                        </button>
                    </td>
                    <td style="text-align:right;">
                        <div class="table-actions" style="justify-content:flex-end;">
                            <button type="button" class="btn-action-icon" style="color:#0284c7;" onclick="broadcastPushNotification('${p.id}')" title="Broadcast Push Notification (FCM)">
                                <i class="fa-solid fa-bullhorn"></i>
                            </button>
                            <button type="button" class="btn-action-icon" onclick="openEditModal('${p.id}')" title="Edit Post">
                                <i class="fa-solid fa-pen"></i>
                            </button>
                            <a href="/blog.html?id=${p.id}" target="_blank" class="btn-action-icon" title="View on Public Blog">
                                <i class="fa-solid fa-eye"></i>
                            </a>
                            <button type="button" class="btn-action-icon btn-action-delete" onclick="confirmDeletePost('${p.id}')" title="Delete Post">
                                <i class="fa-solid fa-trash"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    }

    // Broadcast Push Notification
    window.broadcastPushNotification = async function(postId) {
        const post = state.posts.find(p => p.id === postId);
        if (!post) return;
        if (!confirm(`📢 Send Web Push Notification to all subscribers for:\n\n"${post.title}"?`)) return;

        toast('Broadcasting Web Push Notification to subscribers...');
        try {
            const functionsSvc = firebase.app().functions('us-central1');
            const broadcastFn = functionsSvc.httpsCallable('broadcastBlogPushNotification');
            const res = await broadcastFn({
                postId: post.id,
                title: post.title,
                desc: post.desc,
                icon: post.icon,
                imageUrl: post.imageUrl
            });

            const data = res.data || {};
            if (data.success) {
                toast(`🔔 Push Notification sent! Delivered: ${data.successCount}, Subscribers: ${data.totalSubscribers}`);
            } else {
                toast(data.message || 'Notification broadcast completed.');
            }
        } catch (err) {
            console.error('[BlogManager] Broadcast error:', err);
            toast('Broadcast notice: ' + err.message);
        }
    };

    // Toggle Published Status
    window.togglePublishStatus = async function(postId, newStatus) {
        const db = firebase.firestore();
        try {
            await db.collection('blog_posts').doc(postId).update({
                published: newStatus,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });

            const p = state.posts.find(x => x.id === postId);
            if (p) p.published = newStatus;
            updateStats();
            applyFilter();
            toast(`Post ${newStatus ? 'Published' : 'Unpublished'} successfully!`);
        } catch (e) {
            toast('Failed to update status: ' + e.message);
        }
    };

    // Client-side image compression
    function compressImageFile(file, maxWidth = 1200, maxHeight = 800, quality = 0.85) {
        return new Promise((resolve, reject) => {
            if (!file || !file.type.startsWith('image/')) return reject(new Error('Invalid image'));
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    let w = img.width;
                    let h = img.height;
                    if (w > maxWidth) {
                        h = Math.round((h * maxWidth) / w);
                        w = maxWidth;
                    }
                    if (h > maxHeight) {
                        w = Math.round((w * maxHeight) / h);
                        h = maxHeight;
                    }
                    const canvas = document.createElement('canvas');
                    canvas.width = w;
                    canvas.height = h;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, w, h);
                    canvas.toBlob((blob) => {
                        resolve(blob);
                    }, 'image/jpeg', quality);
                };
                img.onerror = reject;
                img.src = e.target.result;
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    // Upload banner image to Firebase Storage
    async function uploadBannerImage(file) {
        if (!file) return null;
        try {
            const compressedBlob = await compressImageFile(file);
            const now = new Date();
            const dateFolder = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
            const fileName = `${Date.now()}_blog_cover.jpg`;
            const storagePath = `blog-images/${dateFolder}/${fileName}`;
            
            const storageRef = firebase.storage().ref().child(storagePath);
            const snapshot = await storageRef.put(compressedBlob, { contentType: 'image/jpeg' });
            return await snapshot.ref.getDownloadURL();
        } catch (e) {
            console.warn('[BlogManager] Storage upload error:', e);
            throw e;
        }
    }

    // Modal Helpers
    function openComposerModal(isEdit = false, post = null) {
        state.editingPostId = isEdit && post ? post.id : null;
        state.selectedImageFile = null;

        $('modalComposerTitle').textContent = isEdit ? 'Edit Blog Post' : 'Compose New Blog Post';
        $('formPostId').value = isEdit && post ? post.id : '';
        $('formTitle').value = isEdit && post ? post.title : '';
        $('formCategory').value = isEdit && post ? post.category : 'features';
        $('formCategoryLabel').value = isEdit && post ? (post.categoryLabel || '') : '';
        $('formIcon').value = isEdit && post ? (post.icon || '📈') : '📈';
        $('formAuthor').value = isEdit && post ? (post.author || 'DIGIBIZ Engineering') : 'DIGIBIZ Engineering';
        $('formDesc').value = isEdit && post ? post.desc : '';
        $('formContent').value = isEdit && post ? post.content : '';
        
        const today = new Date().toISOString().slice(0, 10);
        $('formDate').value = isEdit && post ? (post.date || today) : today;
        $('formPublished').checked = isEdit && post ? post.published : true;

        const imgUrl = isEdit && post ? (post.imageUrl || '') : '';
        $('formImageUrl').value = imgUrl;
        $('formImageFile').value = '';

        if (imgUrl) {
            $('imagePreview').src = imgUrl;
            $('imagePreviewBox').style.display = 'block';
        } else {
            $('imagePreviewBox').style.display = 'none';
        }

        $('composerModal').classList.add('active');
    }

    function closeComposerModal() {
        $('composerModal').classList.remove('active');
        state.editingPostId = null;
        state.selectedImageFile = null;
    }

    window.openEditModal = function(postId) {
        const post = state.posts.find(p => p.id === postId);
        if (post) openComposerModal(true, post);
    };

    window.confirmDeletePost = async function(postId) {
        if (!confirm('Are you sure you want to permanently delete this blog post?')) return;
        const db = firebase.firestore();
        try {
            await db.collection('blog_posts').doc(postId).delete();
            state.posts = state.posts.filter(p => p.id !== postId);
            updateStats();
            applyFilter();
            toast('Post deleted successfully!');
        } catch (e) {
            toast('Failed to delete post: ' + e.message);
        }
    };

    // Emoji select
    window.selectEmoji = function(emoji) {
        $('formIcon').value = emoji;
    };

    // Editor formatting helpers
    window.insertMd = function(prefix) {
        const textarea = $('formContent');
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const text = textarea.value;
        textarea.value = text.substring(0, start) + prefix + text.substring(end);
        textarea.focus();
        textarea.setSelectionRange(start + prefix.length, start + prefix.length);
    };

    window.insertWrapMd = function(prefix, suffix) {
        const textarea = $('formContent');
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const text = textarea.value;
        const selected = text.substring(start, end) || 'text';
        textarea.value = text.substring(0, start) + prefix + selected + suffix + text.substring(end);
        textarea.focus();
        textarea.setSelectionRange(start + prefix.length, start + prefix.length + selected.length);
    };

    // Save Post Action
    async function savePost() {
        const title = $('formTitle').value.trim();
        const category = $('formCategory').value;
        const categoryLabel = $('formCategoryLabel').value.trim();
        const icon = $('formIcon').value.trim() || '📈';
        const author = $('formAuthor').value.trim() || 'DIGIBIZ Engineering';
        const desc = $('formDesc').value.trim();
        const content = $('formContent').value.trim();
        const date = $('formDate').value || new Date().toISOString().slice(0, 10);
        const published = $('formPublished').checked;
        let imageUrl = $('formImageUrl').value.trim();

        if (!title || !desc || !content) {
            alert('Please fill all required fields (Title, Excerpt, Content).');
            return;
        }

        const btnSave = $('btnSavePost');
        btnSave.disabled = true;
        btnSave.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Saving...';

        try {
            // Handle image upload if a file was selected
            if (state.selectedImageFile) {
                btnSave.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Uploading Image...';
                imageUrl = await uploadBannerImage(state.selectedImageFile);
            }

            const db = firebase.firestore();
            const postData = {
                title,
                category,
                categoryLabel: categoryLabel || (category === 'features' ? 'නව විශේෂාංගය' : category === 'tips' ? 'භාවිත උපදෙස්' : 'පද්ධති නිවේදන'),
                icon,
                author,
                desc,
                content,
                imageUrl: imageUrl || '',
                date,
                published,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            };

            let savedPostId = state.editingPostId;
            if (state.editingPostId) {
                // Update existing
                await db.collection('blog_posts').doc(state.editingPostId).update(postData);
                toast('Post updated successfully!');
            } else {
                // Create new
                postData.createdAt = firebase.firestore.FieldValue.serverTimestamp();
                const docRef = await db.collection('blog_posts').add(postData);
                savedPostId = docRef.id;
                postData.id = docRef.id;
                toast('New post published successfully!');
            }

            // Auto-trigger FCM Push Notification Broadcast if checked and published
            const sendPush = $('formSendPush') && $('formSendPush').checked;
            if (published && sendPush && savedPostId) {
                try {
                    const functionsSvc = firebase.app().functions('us-central1');
                    const broadcastFn = functionsSvc.httpsCallable('broadcastBlogPushNotification');
                    broadcastFn({
                        postId: savedPostId,
                        title: postData.title,
                        desc: postData.desc,
                        icon: postData.icon,
                        imageUrl: postData.imageUrl
                    }).then(res => {
                        const count = res.data ? res.data.successCount : 0;
                        console.log('[BlogManager] Auto push notification sent to', count, 'subscribers');
                    }).catch(e => {
                        console.warn('[BlogManager] Auto push broadcast notice:', e);
                    });
                } catch(ePush) {
                    console.warn('[BlogManager] Push trigger notice:', ePush);
                }
            }

            closeComposerModal();
            await loadPosts();
        } catch (err) {
            console.error('[BlogManager] Error saving post:', err);
            toast('Error saving post: ' + err.message);
        } finally {
            btnSave.disabled = false;
            btnSave.innerHTML = '<i class="fa-solid fa-cloud-arrow-up"></i> Save & Broadcast';
        }
    }

    // Attach Events
    function attachEvents() {
        $('btnOpenNewPostModal').addEventListener('click', () => openComposerModal(false));
        $('btnCloseComposer').addEventListener('click', closeComposerModal);
        $('btnCancelComposer').addEventListener('click', closeComposerModal);
        $('btnSavePost').addEventListener('click', savePost);

        // Search & filter
        $('adminSearchInput').addEventListener('input', (e) => {
            state.searchQuery = e.target.value;
            applyFilter();
        });

        $('filterCategory').addEventListener('change', (e) => {
            state.filterCategory = e.target.value;
            applyFilter();
        });

        $('filterStatus').addEventListener('change', (e) => {
            state.filterStatus = e.target.value;
            applyFilter();
        });

        $('btnRefreshList').addEventListener('click', loadPosts);

        // Attach Release Template Button
        $('btnLoadReleaseTemplate').addEventListener('click', loadProReleaseTemplate);

        // Comments Filter & Refresh
        $('filterCommentsStatus').addEventListener('change', (e) => {
            state.filterCommentsStatus = e.target.value;
            renderCommentsTable();
        });

        $('btnRefreshComments').addEventListener('click', loadComments);

        // Image file change
        $('formImageFile').addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                state.selectedImageFile = file;
                const reader = new FileReader();
                reader.onload = (re) => {
                    $('imagePreview').src = re.target.result;
                    $('imagePreviewBox').style.display = 'block';
                };
                reader.readAsDataURL(file);
            }
        });

        // Image URL change
        $('formImageUrl').addEventListener('input', (e) => {
            const url = e.target.value.trim();
            if (url) {
                $('imagePreview').src = url;
                $('imagePreviewBox').style.display = 'block';
            } else if (!state.selectedImageFile) {
                $('imagePreviewBox').style.display = 'none';
            }
        });

        // Remove image
        $('btnRemoveImage').addEventListener('click', () => {
            state.selectedImageFile = null;
            $('formImageFile').value = '';
            $('formImageUrl').value = '';
            $('imagePreview').src = '';
            $('imagePreviewBox').style.display = 'none';
        });
    }

    // Load Reader Comments for Moderation
    async function loadComments() {
        const db = firebase.firestore();
        const tbody = $('commentsTableBody');
        tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:30px;color:#64748b;"><i class="fa-solid fa-spinner fa-spin"></i> Loading comments...</td></tr>`;

        try {
            const snap = await db.collection('blog_comments').get();
            state.comments = [];
            snap.forEach(doc => {
                const d = doc.data();
                d.id = doc.id;
                state.comments.push(d);
            });

            // Sort by createdAt desc
            state.comments.sort((a, b) => {
                const tA = a.createdAt && a.createdAt.seconds ? a.createdAt.seconds : 0;
                const tB = b.createdAt && b.createdAt.seconds ? b.createdAt.seconds : 0;
                return tB - tA;
            });

            const total = state.comments.length;
            const pending = state.comments.filter(c => !c.approved).length;

            $('stTotalComments').textContent = total;
            $('stPendingComments').textContent = pending;

            renderCommentsTable();
        } catch (err) {
            console.error('[BlogManager] Error loading comments:', err);
            tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:30px;color:#ef4444;">Failed to load comments: ${err.message}</td></tr>`;
        }
    }

    // Render Comments Table Body
    function renderCommentsTable() {
        const tbody = $('commentsTableBody');
        const filter = state.filterCommentsStatus || 'pending';

        const filtered = state.comments.filter(c => {
            if (filter === 'pending') return !c.approved;
            if (filter === 'approved') return !!c.approved;
            return true;
        });

        if (filtered.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" style="text-align:center;padding:30px;color:#64748b;">
                        No comments found for selected filter (${filter}).
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = filtered.map(c => {
            const statusClass = c.approved ? 'badge-published' : 'badge-draft';
            const statusText = c.approved ? '✓ Approved' : '⏳ Pending Approval';
            const stars = '★'.repeat(c.rating || 5);
            const dateStr = c.createdAt && c.createdAt.toDate ? c.createdAt.toDate().toISOString().slice(0, 10) : 'Recent';

            return `
                <tr>
                    <td style="font-weight:700;color:#0f172a;font-size:13px;max-width:180px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">
                        ${safe(c.postTitle || c.postId)}
                    </td>
                    <td>
                        <div style="font-weight:700;color:#0f172a;">${safe(c.authorName || 'Anonymous')}</div>
                        <div style="font-size:11.5px;color:#64748b;">${safe(c.authorContact || 'No contact info')}</div>
                    </td>
                    <td style="color:#fbbf24;font-size:14px;letter-spacing:1px;">
                        ${stars}
                    </td>
                    <td style="font-size:13px;color:#334155;max-width:280px;line-height:1.5;">
                        ${safe(c.comment)}
                    </td>
                    <td style="font-size:12.5px;color:#64748b;">
                        ${dateStr}
                    </td>
                    <td>
                        <span class="badge-status ${statusClass}">${statusText}</span>
                    </td>
                    <td style="text-align:right;">
                        <div class="table-actions" style="justify-content:flex-end;">
                            ${!c.approved ? `
                                <button type="button" class="btn-action-icon" style="color:#10b981;" onclick="toggleCommentApproval('${c.id}', true)" title="Approve Comment for Public Display">
                                    <i class="fa-solid fa-check"></i>
                                </button>
                            ` : `
                                <button type="button" class="btn-action-icon" style="color:#f59e0b;" onclick="toggleCommentApproval('${c.id}', false)" title="Unapprove / Move to Pending">
                                    <i class="fa-solid fa-xmark"></i>
                                </button>
                            `}
                            <button type="button" class="btn-action-icon btn-action-delete" onclick="deleteComment('${c.id}')" title="Delete Comment">
                                <i class="fa-solid fa-trash"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    }

    // Toggle Comment Approval
    window.toggleCommentApproval = async function(commentId, newStatus) {
        const db = firebase.firestore();
        try {
            await db.collection('blog_comments').doc(commentId).update({
                approved: newStatus,
                status: newStatus ? 'approved' : 'pending',
                approvedAt: firebase.firestore.FieldValue.serverTimestamp()
            });

            const c = state.comments.find(x => x.id === commentId);
            if (c) c.approved = newStatus;

            toast(`Comment ${newStatus ? 'Approved and made Public' : 'Unapproved'}!`);
            loadComments();
        } catch (e) {
            toast('Failed to update comment: ' + e.message);
        }
    };

    // Delete Comment
    window.deleteComment = async function(commentId) {
        if (!confirm('Are you sure you want to permanently delete this comment?')) return;
        const db = firebase.firestore();
        try {
            await db.collection('blog_comments').doc(commentId).delete();
            state.comments = state.comments.filter(c => c.id !== commentId);
            toast('Comment deleted permanently.');
            loadComments();
        } catch (e) {
            toast('Failed to delete comment: ' + e.message);
        }
    };

    // Pre-fill Release Note Template
    function loadProReleaseTemplate() {
        openComposerModal(false);
        const today = new Date().toISOString().slice(0, 10);

        $('formTitle').value = 'DIGIBIZ.PRO Version 2.6 Live Release: ප්‍රධාන පද්ධති යාවත්කාලීනයන් සහ නව විශේෂාංග';
        $('formCategory').value = 'announcements';
        $('formCategoryLabel').value = 'පද්ධති නිවේදන';
        $('formIcon').value = '🚀';
        $('formAuthor').value = 'DIGIBIZ Release Engineering';
        $('formDate').value = today;
        $('formDesc').value = 'DIGIBIZ.PRO පද්ධතියේ නවතම Version 2.6 යාවත්කාලීනය දැන් සියලුම සක්‍රීය ව්‍යාපාර සඳහා සජීවීව ක්‍රියාත්මකයි. ප්‍රධාන වෙනස්කම් සහ නව විශේෂාංග මෙතැනින් කියවන්න.';
        
        $('formContent').value = `## 🚀 DIGIBIZ.PRO Version 2.6 Release Notes

DIGIBIZ.PRO පද්ධතියේ නවතම **Version 2.6** යාවත්කාලීනය දැන් සියලුම සක්‍රීය ව්‍යාපාර (Retail, Tire Center, Auto Care, Pharmacy, Wholesale & Manufacturing) සඳහා සජීවීව ක්‍රියාත්මක කර ඇත.

---

### 🌟 නව විශේෂාංග (What's New in v2.6):
1. **Interactive Real-time Profit Analytics:** දින 365 ක සැබෑ ලාභය Area Chart මඟින් ක්ෂණිකව බලාගැනීමේ හැකියාව.
2. **Direct WhatsApp Receipts:** පාරිභෝගිකයාගේ WhatsApp අංකයට තත්පර 2 කින් Digital Bill සහ Receipt Link යැවීම.
3. **Web Push Notifications (FCM):** වැදගත් පද්ධති නිවේදන සහ Updates ක්ෂණිකව ඔබගේ උපාංගය වෙත ලැබීමේ පහසුකම.
4. **Enhanced Mobile Scanner:** අඩු ආලෝක තත්වයන් යටතේ වුවද වේගවත් Barcode සහ QR Scanning හැකියාව.

---

### ⚡ කාර්යසාධන වැඩිදියුණු කිරීම් (Performance Enhancements):
* Cloud Syncing වේගය 40% කින් වැඩි කර ඇති අතර Firestore Read/Write Queries උපරිමයෙන් ප්‍රශස්ත කර ඇත.
* Offline Billing Terminal එකේ දේශීය දත්ත ආරක්ෂාව (IndexedDB Cache) තවදුරටත් ශක්තිමත් කර ඇත.

---

### 📖 මෙම පහසුකම් භාවිතා කරන අයුරු:
සියලුම යාවත්කාලීනයන් ඔබගේ ගිණුමට ස්වයංක්‍රීයව එක් කර ඇති අතර, කිසිදු අමතර මෘදුකාංගයක් Install කිරීම හෝ ගාස්තු ගෙවීමක් අවශ්‍ය නොවේ.

> [!TIP]
> කිසියම් ගැටලුවක් ඇත්නම් පහත Comment තීරුවෙන් අපගේ ඉංජිනේරු කණ්ඩායම අමතන්න.`;

        $('formPublished').checked = false; // Set as Draft initially for review!
        toast('PRO Release Note Template loaded successfully in Draft mode!');
    }

    // Auth state change
    firebase.auth().onAuthStateChanged(async (user) => {
        if (!user) {
            window.location.href = '/auth/login.html';
            return;
        }
        state.user = user;
        const ok = await guardSuperAdmin(user);
        if (ok) {
            attachEvents();
            await loadPosts();
            await loadComments();
        }
    });

})();
