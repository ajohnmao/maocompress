// 在 InstagramFeed 类中添加以下方法

initializePostInteractions(postElement, post) {
  const likeBtn = postElement.querySelector('.post-action-btn:first-child');
  const commentBtn = postElement.querySelector('.post-action-btn:nth-child(2)');
  const likesCount = postElement.querySelector('.post-likes');
  const commentsSection = postElement.querySelector('.post-comments');

  likeBtn.addEventListener('click', () => {
    const isLiked = likeBtn.classList.toggle('liked');
    post.likes += isLiked ? 1 : -1;
    likesCount.textContent = `${post.likes} 次赞`;
    
    // 添加点赞动画
    likeBtn.querySelector('svg').style.transform = 'scale(1.2)';
    setTimeout(() => {
      likeBtn.querySelector('svg').style.transform = 'scale(1)';
    }, 200);
  });

  commentBtn.addEventListener('click', () => {
    // 显示评论输入框
    const commentInput = document.createElement('div');
    commentInput.className = 'comment-input-container';
    commentInput.innerHTML = `
      <input type="text" placeholder="添加评论..." class="comment-input">
      <button class="post-comment-btn">发布</button>
    `;
    
    const existingInput = postElement.querySelector('.comment-input-container');
    if (!existingInput) {
      postElement.querySelector('.post-content').appendChild(commentInput);
      
      const input = commentInput.querySelector('.comment-input');
      const postBtn = commentInput.querySelector('.post-comment-btn');
      
      input.focus();
      
      postBtn.addEventListener('click', () => {
        const commentText = input.value.trim();
        if (commentText) {
          post.comments.push({
            author: '当前用户',
            content: commentText
          });
          
          commentsSection.textContent = `查看全部 ${post.comments.length} 条评论`;
          input.value = '';
        }
      });
    }
  });
} 