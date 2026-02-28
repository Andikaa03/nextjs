"use client";

import { useState, useEffect } from 'react';
import { getCommentsByArticle, createComment } from '@/services/commentService';
import Link from 'next/link';
import { useTranslations } from '@/lib/translations';

const ArticleComments = ({ articleSlug, articleDocumentId, locale = 'bn' }) => {
  const { t } = useTranslations(locale);
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

  useEffect(() => {
    fetchComments();
  }, [articleDocumentId]);

  const fetchComments = async () => {
    try {
      // Plugin uses documentId-based lookup
      const response = await getCommentsByArticle(articleDocumentId);
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
    setSubmitting(true);
    try {
      await createComment(
        articleDocumentId,
        formData.name,
        formData.email,
        formData.message,
        replyTo ? replyTo.id : null
      );

      setFormData({ name: '', email: '', message: '' });
      setReplyTo(null);
      await fetchComments();
      alert(t('commentSubmitted') || "Comment submitted successfully!");
    } catch (error) {
      console.error("Error submitting comment:", error);
      alert(t('commentFailed') || "Failed to submit comment. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // Render a single comment (plugin structure: { id, content, author: { name, email }, children, createdAt })
  const renderCommentItem = (comment, isReply = false) => {
    const authorName = comment.author?.name || comment.authorName || t('anonymous');
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
          <div className="comment-avatar">
            <img src="/default.jpg" alt={authorName} />
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

      <form className="comment-form" id="comment-form" onSubmit={handleSubmit}>
        <h3>
          <strong>{t('leaveAComment').split(' ')[0]}</strong> {t('leaveAComment').split(' ').slice(1).join(' ')} {replyTo && <span style={{ fontSize: '0.6em' }}>({t('replyingTo')} {replyTo.name} - <button type="button" onClick={handleCancelReply} style={{ background: 'none', border: 'none', color: 'red', cursor: 'pointer' }}>{t('cancel')}</button>)</span>}
        </h3>
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
      </form>
    </>
  );
};

export default ArticleComments;
