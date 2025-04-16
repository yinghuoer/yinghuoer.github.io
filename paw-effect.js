/**
 * 爪印和小狐狸贴纸点击特效
 * 功能：
 * 1. 点击页面空白处会出现随机颜色、大小、角度的爪印，5-6秒后消失
 * 2. 有5%概率出现小狐狸贴纸，不会消失
 * 3. 右下角显示爪印和贴纸的数量
 */

// 等待DOM加载完成
document.addEventListener('DOMContentLoaded', function() {
  // 创建样式
  const style = document.createElement('style');
  style.textContent = `
    .paw-container {
      position: absolute;
      pointer-events: none;
      z-index: 9999;
      transition: opacity 1s ease;
    }

    .fade-out {
      opacity: 0 !important;
    }

    .counter-box {
      display: flex;
      align-items: center;
      font-family: sans-serif;
      font-size: 14px;
      color: #333;
      transition: opacity 0.3s ease;
      position: relative;
    }

    .counter-box:not(:last-child)::after {
      content: '';
      position: absolute;
      right: -7.5px;
      height: 20px;
      width: 1px;
      background-color: rgba(0, 0, 0, 0.1);
    }

    .counter-box i {
      margin-right: 5px;
      font-size: 16px;
    }

    #paw-counter i {
      color: #FFAFCC;
    }

    #sticker-counter i {
      color: #A2D2FF;
    }
  `;
  document.head.appendChild(style);

  // 创建计数器容器
  const counterContainer = document.createElement('div');
  counterContainer.style.position = 'fixed';
  counterContainer.style.left = '50%';
  counterContainer.style.bottom = '20px';
  counterContainer.style.transform = 'translateX(-50%)';
  counterContainer.style.display = 'flex';
  counterContainer.style.flexDirection = 'row';
  counterContainer.style.alignItems = 'center';
  counterContainer.style.justifyContent = 'center';
  counterContainer.style.gap = '15px';
  counterContainer.style.zIndex = '99999';
  counterContainer.style.background = 'rgba(255, 255, 255, 0.5)';
  counterContainer.style.backdropFilter = 'blur(5px)';
  counterContainer.style.borderRadius = '30px';
  counterContainer.style.padding = '8px 15px';
  counterContainer.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
  counterContainer.style.border = '1px solid rgba(255, 255, 255, 0.3)';
  counterContainer.style.transition = 'opacity 0.3s ease';
  document.body.appendChild(counterContainer);

  // 创建爪印计数器
  const pawCounter = document.createElement('div');
  pawCounter.id = 'paw-counter';
  pawCounter.className = 'counter-box';
  pawCounter.innerHTML = '<i class="fas fa-paw"></i>爪印：0';
  counterContainer.appendChild(pawCounter);

  // 创建贴纸计数器
  const stickerCounter = document.createElement('div');
  stickerCounter.id = 'sticker-counter';
  stickerCounter.className = 'counter-box';
  stickerCounter.innerHTML = '<i class="fas fa-star"></i>贴纸：0';
  counterContainer.appendChild(stickerCounter);

  // 添加自动淡出效果
  let fadeTimeout;
  const fadeCounters = () => {
    counterContainer.style.opacity = '0.4';
  };

  // 初始设置低透明度
  setTimeout(fadeCounters, 2000);

  // 鼠标移入时显示
  counterContainer.addEventListener('mouseenter', () => {
    clearTimeout(fadeTimeout);
    counterContainer.style.opacity = '1';
  });

  // 鼠标移出时淡出
  counterContainer.addEventListener('mouseleave', () => {
    fadeTimeout = setTimeout(fadeCounters, 1000);
  });

  // 预加载图片
  const pawImage = new Image();
  pawImage.src = 'image/paw.png';

  const sticker1Image = new Image();
  sticker1Image.src = 'image/sticker1.png';

  const sticker2Image = new Image();
  sticker2Image.src = 'image/sticker2.png';

  // 马卡龙颜色数组
  const colors = [
    '#ffb6c1', '#f9c6d1', '#ffd6a5',
    '#caffbf', '#b5ead7', '#bae1ff', '#e0bbff', '#E7C6FF', '#FFD6FF', '#FFAFCC', '#CAF0F8', '#ADE8F4'
  ];

  // 计数器
  let pawCount = 0;
  let stickerCount = 0;
  const pawCounterEl = document.getElementById('paw-counter');
  const stickerCounterEl = document.getElementById('sticker-counter');

  // 点击时显示计数器
  const showCounters = () => {
    clearTimeout(fadeTimeout);
    counterContainer.style.opacity = '1';
    fadeTimeout = setTimeout(fadeCounters, 3000);
  };

  // 小狐狸贴纸数组
  const stickerImages = [sticker1Image, sticker2Image];

  // 等待所有图片加载完成
  Promise.all([pawImage, sticker1Image, sticker2Image].map(img => {
    return new Promise((resolve) => {
      if (img.complete) {
        resolve();
      } else {
        img.onload = resolve;
      }
    });
  })).then(() => {
    // 添加点击事件监听器
    document.addEventListener('click', function(e) {
      const tag = e.target.tagName.toLowerCase();
      const id = e.target.id || '';

      // 忽略按钮、输入框、链接等元素的点击
      // 以及小狐狸贴纸目录按钮
      const ignoredTags = ['button', 'input', 'textarea', 'a', 'label', 'select'];
      const ignoredIds = ['tocButton', 'tocButtonImg'];
      if (ignoredTags.includes(tag) || ignoredIds.includes(id) || e.target.closest('#tocButton')) return;

      // 考虑页面滚动的位置
      const scrollX = window.pageXOffset || document.documentElement.scrollLeft;
      const scrollY = window.pageYOffset || document.documentElement.scrollTop;

      // 生成随机参数
      const size = Math.random() * 40 + 30; // 30~70px
      const angle = Math.random() * 360;

      // 决定是否显示小狐狸贴纸（5%的概率）
      const isSticker = Math.random() < 0.05;

      if (isSticker) {
        // 创建小狐狸贴纸
        const stickerSize = Math.random() * 60 + 40; // 40~100px
        const stickerAngle = Math.random() * 360;

        // 随机选择一个贴纸
        const stickerImage = stickerImages[Math.floor(Math.random() * stickerImages.length)];

        // 创建容器
        const container = document.createElement('div');
        container.className = 'paw-container';
        container.style.left = `${e.clientX + scrollX}px`;
        container.style.top = `${e.clientY + scrollY}px`;
        container.style.transform = `translate(-50%, -50%)`;
        container.style.opacity = '0.9';
        container.style.zIndex = '9998'; // 让贴纸在爪印下面

        // 创建 Canvas
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        // 设置 Canvas 大小
        canvas.width = stickerSize;
        canvas.height = stickerSize;

        // 将 Canvas 添加到容器
        container.appendChild(canvas);
        document.body.appendChild(container);

        // 绘制贴纸
        ctx.save();
        ctx.translate(stickerSize/2, stickerSize/2);
        ctx.rotate(stickerAngle * Math.PI / 180);
        ctx.translate(-stickerSize/2, -stickerSize/2);

        // 绘制贴纸图片
        ctx.drawImage(stickerImage, 0, 0, stickerSize, stickerSize);

        ctx.restore();

        // 更新贴纸计数
        stickerCount++;
        stickerCounterEl.innerHTML = `<i class="fas fa-star"></i>贴纸：${stickerCount}`;

        // 显示计数器
        showCounters();

        // 贴纸不会消失
      } else {
        // 创建爪印
        const color = colors[Math.floor(Math.random() * colors.length)];

        // 创建容器
        const container = document.createElement('div');
        container.className = 'paw-container';
        container.style.left = `${e.clientX + scrollX}px`;
        container.style.top = `${e.clientY + scrollY}px`;
        container.style.transform = `translate(-50%, -50%)`;
        container.style.opacity = '0.8';

        // 创建 Canvas
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        // 设置 Canvas 大小
        canvas.width = size;
        canvas.height = size;

        // 将 Canvas 添加到容器
        container.appendChild(canvas);
        document.body.appendChild(container);

        // 绘制彩色爪印
        ctx.save();
        ctx.translate(size/2, size/2);
        ctx.rotate(angle * Math.PI / 180);
        ctx.translate(-size/2, -size/2);

        // 绘制爪印
        ctx.drawImage(pawImage, 0, 0, size, size);

        // 应用颜色
        ctx.globalCompositeOperation = 'source-in';
        ctx.fillStyle = color;
        ctx.fillRect(0, 0, size, size);

        ctx.restore();

        // 更新爪印计数
        pawCount++;
        pawCounterEl.innerHTML = `<i class="fas fa-paw"></i>爪印：${pawCount}`;

        // 显示计数器
        showCounters();

        // 淡出并销毁
        setTimeout(() => container.classList.add('fade-out'), 5000);
        setTimeout(() => container.remove(), 6000);
      }
    });
  });
});
