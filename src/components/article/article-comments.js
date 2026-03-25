"use client";

import { useState, useEffect } from 'react';
import { getCommentsByArticle, createComment } from '@/services/commentService';
import Link from 'next/link';
import { useTranslations } from '@/lib/translations';

const ArticleComments = ({ articleSlug, articleDocumentId, locale = 'bn' }) => {
  const { t } = useTranslations(locale);
  const getText = (key, fallback) => {
    const value = t(key);
    return value && value !== key ? value : fallback;
  };
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [displayCount, setDisplayCount] = useState(20);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [replyTo, setReplyTo] = useState(null);
  const [submitStatus, setSubmitStatus] = useState({ type: '', message: '' });

  useEffect(() => {
    fetchComments();
  }, [articleDocumentId, locale]);

  const fetchComments = async () => {
    try {
      // Plugin uses documentId-based lookup
      const response = await getCommentsByArticle(articleDocumentId, locale);
      // Plugin returns array directly or { data: [...] }
      const commentData = Array.isArray(response) ? response : (response?.data || []);
      setComments(commentData);
    } catch (error) {
      console.error("Error fetching comments:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    if (submitStatus.message) {
      setSubmitStatus({ type: '', message: '' });
    }
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleReply = (commentId, authorName) => {
    setReplyTo({ id: commentId, name: authorName });
    const formElement = document.getElementById('comment-form');
    if (formElement) {
      formElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleCancelReply = () => {
    setReplyTo(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitStatus({ type: '', message: '' });
    setSubmitting(true);
    try {
      await createComment(
        articleDocumentId,
        formData.name,
        formData.email,
        formData.message,
        replyTo ? replyTo.id : null,
        locale
      );

      setFormData({ name: '', email: '', message: '' });
      setReplyTo(null);
      await fetchComments();
      setSubmitStatus({
        type: 'success',
        message: getText('commentSubmitted', 'Comment submitted successfully!'),
      });
    } catch (error) {
      console.error("Error submitting comment:", error);
      const status = error?.status;
      if (status === 403) {
        setSubmitStatus({
          type: 'error',
          message: locale === 'bn'
            ? 'মন্তব্য জমা দেওয়া এখন সাময়িকভাবে বন্ধ আছে। একটু পরে আবার চেষ্টা করুন।'
            : 'Comment submission is temporarily unavailable. Please try again later.',
        });
      } else {
        setSubmitStatus({
          type: 'error',
          message: getText('commentFailed', 'Failed to submit comment. Please try again.'),
        });
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Render a single comment (plugin structure: { id, content, author: { name, email }, children, createdAt })
  const renderCommentItem = (comment, isReply = false) => {
    const authorName = comment.author?.name || comment.authorName || t('anonymous');
    const avatarInitial = String(authorName).trim().charAt(0).toUpperCase() || 'A';
    const createdAt = comment.createdAt;
    const date = createdAt ? new Date(createdAt).toLocaleDateString(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }) : '';

    const children = comment.children || [];

    return (
      <li key={comment.id}>
        <div className="comment-main-level">
          <div className="comment-avatar comment-avatar-fallback" aria-hidden="true">
            {avatarInitial}
          </div>
          <div className="comment-box">
            <div className="comment-content">
              <div className="comment-header">
                <cite className="comment-author">{authorName}</cite>
                <time dateTime={createdAt} className="comment-datetime">
                  {date}
                </time>
              </div>
              <p>{comment.content}</p>
              {!isReply && (
                <button
                  onClick={() => handleReply(comment.id, authorName)}
                  className="btn btn-news"
                  style={{ cursor: 'pointer' }}
                >
                  {t('reply')}
                </button>
              )}
            </div>
          </div>
        </div>
        {/* Nested Replies */}
        {children.length > 0 && (
          <ul className="comments-list reply-list">
            {children.map(child => renderCommentItem(child, true))}
          </ul>
        )}
      </li>
    );
  };

  if (loading) return <div>Loading comments...</div>;

  const displayedComments = comments.slice(0, displayCount);
  const hasMoreComments = comments.length > displayCount;

  return (
    <>
      <div className="comments-container">
        <h3>{t('comments')} ({comments.length})</h3>
        <ul className="comments-list">
          {displayedComments.map(comment => renderCommentItem(comment))}
        </ul>
        {hasMoreComments && (
          <div className="text-center mt-3 mb-3">
            <button
              type="button"
              className="btn btn-news"
              onClick={() => setDisplayCount(prev => prev + 20)}
            >
              {t('loadMoreComments')}
            </button>
          </div>
        )}
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .comment-form h3 {
          font-size: 1.15rem !important;
          font-weight: 400 !important;
          margin-bottom: 20px !important;
        }
        .comment-form label {
          font-size: 13px !important;
          font-weight: 400 !important;
          text-transform: uppercase !important;
          letter-spacing: 0.5px !important;
        }
        .comment-form .form-control {
          color: #1f2937 !important;
        }
        .comment-form .form-control::placeholder {
          color: #6b7280 !important;
          font-size: 15px !important;
          opacity: 1 !important;
        }
        [data-theme=skin-dark] .comment-form .form-control {
          color: #e5e7eb !important;
          background-color: rgba(255, 255, 255, 0.07) !important;
        }
        [data-theme=skin-dark] .comment-form .form-control::placeholder {
          color: #9ca3af !important;
          opacity: 1 !important;
        }
        [data-theme=skin-dark] .comment-form label {
          color: #d1d5db !important;
        }
        .comment-form .submit-status {
          margin-top: 12px;
          padding: 10px 12px;
          border-radius: 4px;
          font-size: 14px;
          line-height: 1.4;
        }
        .comment-form .submit-status.status-success {
          color: #166534;
          background: #dcfce7;
          border: 1px solid #86efac;
        }
        .comment-form .submit-status.status-error {
          color: #991b1b;
          background: #fee2e2;
          border: 1px solid #fca5a5;
        }
        .comment-form .replying-banner {
          margin: -6px 0 14px;
          padding: 9px 12px;
          border: 1px solid #cbd5e1;
          border-radius: 8px;
          background: #f8fafc;
          color: #334155;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          flex-wrap: wrap;
          font-size: 13px;
          line-height: 1.45;
        }
        .comment-form .replying-banner .replying-name {
          color: #0f172a;
          font-weight: 600;
        }
        .comment-form .replying-banner .reply-cancel-btn {
          background: #fff;
          border: 1px solid #cbd5e1;
          border-radius: 6px;
          color: #334155;
          font-size: 12px;
          font-weight: 600;
          padding: 4px 10px;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .comment-form .replying-banner .reply-cancel-btn:hover {
          background: #fff1f2;
          border-color: #fda4af;
          color: #9f1239;
        }
        @media (max-width: 576px) {
          .comment-form .replying-banner {
            font-size: 12px;
            padding: 8px 10px;
          }
        }
        .comment-avatar.comment-avatar-fallback {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background: #e5e7eb;
          color: #1f2937;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 22px;
          font-weight: 700;
          text-transform: uppercase;
        }
      ` }} />
      <form className="comment-form" id="comment-form" onSubmit={handleSubmit}>
        <h3>{t('leaveAComment')}</h3>
        {replyTo && (
          <div className="replying-banner" role="status" aria-live="polite">
            <span>
              {t('replyingTo')} <span className="replying-name">{replyTo.name}</span>
            </span>
            <button
              type="button"
              className="reply-cancel-btn"
              onClick={handleCancelReply}
            >
              {t('cancel')}
            </button>
          </div>
        )}
        <div className="row">
          <div className="col-sm-6">
            <div className="form-group">
              <label htmlFor="name">{t('fullName')}*</label>
              <input
                type="text"
                className="form-control"
                id="name"
                name="name"
                placeholder={t('yourName')}
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          <div className="col-sm-6">
            <label htmlFor="email">{t('email')}*</label>
            <div className="form-group">
              <input
                type="email"
                className="form-control"
                id="email"
                name="email"
                placeholder={t('yourEmailAddress')}
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
          </div>
        </div>
        <div className="form-group">
          <label htmlFor="message">{t('message')}</label>
          <textarea
            className="form-control"
            id="message"
            name="message"
            placeholder={t('yourComment')}
            rows={5}
            value={formData.message}
            onChange={handleChange}
            required
          />
        </div>
        <button type="submit" className="btn btn-news" disabled={submitting}>
          {submitting ? t('submit') + '...' : t('submit')}
        </button>
        {submitStatus.message && (
          <div
            className={`submit-status ${submitStatus.type === 'success' ? 'status-success' : 'status-error'}`}
            role="status"
            aria-live="polite"
          >
            {submitStatus.message}
          </div>
        )}
      </form>
    </>
  );
};

export default ArticleComments;
