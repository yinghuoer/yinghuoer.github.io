document.addEventListener('DOMContentLoaded', function() {
    // 当前页码和分类
    let currentPage = 1;
    let currentCategory = 'all';
    const videosPerPage = 8;

    // 初始化页面
    initPage();

    function initPage() {
        // 加载特色视频
        loadFeaturedVideo();
        
        // 加载视频列表
        loadVideos();
        
        // 设置筛选按钮事件
        setupFilterButtons();
        
        // 设置分页按钮事件
        updatePagination();
    }

    // 加载特色视频
    function loadFeaturedVideo() {
        const featuredVideo = getFeaturedVideo();
        const featuredContainer = document.querySelector('.featured-video-container');
        
        if (featuredVideo && featuredContainer) {
            const featuredPlayer = featuredContainer.querySelector('.featured-video-player');
            const featuredInfo = featuredContainer.querySelector('.featured-video-info');
            
            // 更新播放器
            featuredPlayer.innerHTML = `
                <div class="placeholder-thumbnail" style="width: 100%; height: 100%;">
                    <img src="${featuredVideo.thumbnail}" alt="${featuredVideo.title}" style="width: 100%; height: 100%; object-fit: cover;">
                    <div class="video-duration">${featuredVideo.duration}</div>
                    <div class="video-play"><i class="fas fa-play"></i></div>
                </div>
            `;
            
            // 更新信息
            featuredInfo.querySelector('h3').textContent = featuredVideo.title;
            
            // 更新元数据
            const metaHTML = `
                <span><i class="far fa-calendar-alt"></i> ${featuredVideo.date}</span>
                <span><i class="far fa-eye"></i> ${formatNumber(featuredVideo.views)} 次观看</span>
            `;
            featuredInfo.querySelector('.video-meta').innerHTML = metaHTML;
            
            // 更新描述
            featuredInfo.querySelector('.featured-video-description').innerHTML = `<p>${featuredVideo.description}</p>`;
            
            // 更新标签
            const tagsHTML = featuredVideo.tags.map(tag => `<span class="video-tag">${tag}</span>`).join('');
            featuredInfo.querySelector('.video-tags').innerHTML = tagsHTML;
            
            // 更新链接
            featuredInfo.querySelector('.btn').href = featuredVideo.url;
            
            // 添加点击事件
            featuredPlayer.addEventListener('click', function() {
                window.open(featuredVideo.url, '_blank');
            });
        }
    }

    // 加载视频列表
    function loadVideos() {
        // 获取筛选后的视频
        const filteredVideos = filterVideosByCategory(currentCategory);
        
        // 获取当前页的视频
        const currentVideos = paginateVideos(filteredVideos, currentPage, videosPerPage);
        
        // 获取视频网格容器
        const videoGrid = document.querySelector('.video-grid');
        
        // 清空容器
        videoGrid.innerHTML = '';
        
        // 如果没有视频，显示提示信息
        if (currentVideos.length === 0) {
            videoGrid.innerHTML = '<div class="no-videos">没有找到符合条件的视频</div>';
            return;
        }
        
        // 添加视频卡片
        currentVideos.forEach(video => {
            const videoCard = createVideoCard(video);
            videoGrid.appendChild(videoCard);
        });
        
        // 更新分页
        updatePagination(filteredVideos);
    }

    // 创建视频卡片
    function createVideoCard(video) {
        const videoItem = document.createElement('div');
        videoItem.className = 'video-item';
        videoItem.setAttribute('data-category', video.category);
        
        videoItem.innerHTML = `
            <div class="video-thumbnail">
                <img src="${video.thumbnail}" alt="${video.title}" style="width: 100%; height: 100%; object-fit: cover;">
                <div class="video-duration">${video.duration}</div>
                <div class="video-play"><i class="fas fa-play"></i></div>
            </div>
            <div class="video-info">
                <h3 class="video-title">${video.title}</h3>
                <div class="video-meta">
                    <span><i class="far fa-calendar-alt"></i> ${video.date}</span>
                    <span><i class="far fa-eye"></i> ${formatNumber(video.views)} 次观看</span>
                </div>
                <p class="video-description">${video.description}</p>
                <div class="video-tags">
                    ${video.tags.map(tag => `<span class="video-tag">${tag}</span>`).join('')}
                </div>
            </div>
        `;
        
        // 添加点击事件
        videoItem.addEventListener('click', function() {
            window.open(video.url, '_blank');
        });
        
        return videoItem;
    }

    // 设置筛选按钮事件
    function setupFilterButtons() {
        const filterButtons = document.querySelectorAll('.filter-btn');
        
        filterButtons.forEach(button => {
            button.addEventListener('click', function() {
                // 移除所有按钮的active类
                filterButtons.forEach(btn => btn.classList.remove('active'));
                
                // 为当前点击的按钮添加active类
                this.classList.add('active');
                
                // 获取筛选类别
                const filter = this.getAttribute('data-filter');
                
                // 更新当前类别和页码
                currentCategory = filter;
                currentPage = 1;
                
                // 重新加载视频
                loadVideos();
            });
        });
    }

    // 更新分页
    function updatePagination(filteredVideos) {
        const videos = filteredVideos || filterVideosByCategory(currentCategory);
        const totalPages = getTotalPages(videos, videosPerPage);
        
        const pagination = document.querySelector('.pagination');
        pagination.innerHTML = '';
        
        // 如果只有一页，不显示分页
        if (totalPages <= 1) {
            pagination.style.display = 'none';
            return;
        } else {
            pagination.style.display = 'flex';
        }
        
        // 添加上一页按钮
        if (currentPage > 1) {
            const prevBtn = document.createElement('div');
            prevBtn.className = 'page-btn';
            prevBtn.innerHTML = '<i class="fas fa-angle-left"></i>';
            prevBtn.addEventListener('click', function() {
                currentPage--;
                loadVideos();
            });
            pagination.appendChild(prevBtn);
        }
        
        // 添加页码按钮
        const maxVisiblePages = 5;
        let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
        let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
        
        // 调整起始页，确保显示足够的页码
        if (endPage - startPage + 1 < maxVisiblePages) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }
        
        // 添加第一页
        if (startPage > 1) {
            const firstPageBtn = document.createElement('div');
            firstPageBtn.className = 'page-btn';
            firstPageBtn.textContent = '1';
            firstPageBtn.addEventListener('click', function() {
                currentPage = 1;
                loadVideos();
            });
            pagination.appendChild(firstPageBtn);
            
            // 添加省略号
            if (startPage > 2) {
                const ellipsisBtn = document.createElement('div');
                ellipsisBtn.className = 'page-btn ellipsis';
                ellipsisBtn.innerHTML = '<i class="fas fa-ellipsis-h"></i>';
                pagination.appendChild(ellipsisBtn);
            }
        }
        
        // 添加中间的页码
        for (let i = startPage; i <= endPage; i++) {
            const pageBtn = document.createElement('div');
            pageBtn.className = 'page-btn';
            if (i === currentPage) {
                pageBtn.classList.add('active');
            }
            pageBtn.textContent = i;
            pageBtn.addEventListener('click', function() {
                currentPage = i;
                loadVideos();
            });
            pagination.appendChild(pageBtn);
        }
        
        // 添加最后一页
        if (endPage < totalPages) {
            // 添加省略号
            if (endPage < totalPages - 1) {
                const ellipsisBtn = document.createElement('div');
                ellipsisBtn.className = 'page-btn ellipsis';
                ellipsisBtn.innerHTML = '<i class="fas fa-ellipsis-h"></i>';
                pagination.appendChild(ellipsisBtn);
            }
            
            const lastPageBtn = document.createElement('div');
            lastPageBtn.className = 'page-btn';
            lastPageBtn.textContent = totalPages;
            lastPageBtn.addEventListener('click', function() {
                currentPage = totalPages;
                loadVideos();
            });
            pagination.appendChild(lastPageBtn);
        }
        
        // 添加下一页按钮
        if (currentPage < totalPages) {
            const nextBtn = document.createElement('div');
            nextBtn.className = 'page-btn';
            nextBtn.innerHTML = '<i class="fas fa-angle-right"></i>';
            nextBtn.addEventListener('click', function() {
                currentPage++;
                loadVideos();
            });
            pagination.appendChild(nextBtn);
        }
    }
});
