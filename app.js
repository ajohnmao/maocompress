class ImageTools {
    constructor() {
        this.dropZone = document.getElementById('dropZone');
        this.fileInput = document.getElementById('fileInput');
        this.imageGrid = document.getElementById('imageGrid');
        this.qualitySlider = document.getElementById('qualitySlider');
        this.qualityValue = document.getElementById('qualityValue');
        this.compressButton = document.getElementById('compressButton');
        this.downloadButton = document.getElementById('downloadButton');
        this.maxWidth = document.getElementById('maxWidth');
        this.imageCount = document.getElementById('imageCount');
        
        this.images = [];
        this.compressedImages = [];
        
        this.suggestionContent = document.getElementById('suggestionContent');
        this.qualitySuggestion = document.getElementById('qualitySuggestion');
        
        // 添加支持的文件类型
        this.supportedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
        
        // 添加预览限制
        this.previewLimit = 5;
        
        // 添加点击计数器，防止重复触发
        this.isFileDialogOpen = false;
        
        // 新增：背景去除相关属性
        this.initializeBackgroundRemovalProperties();
        
        // 新增：导航相关属性
        this.initializeNavigationProperties();
        
        // 初始化所有事件监听
        this.initializeEventListeners();
        
        // 添加 API 密钥
        this.removeBgApiKey = 'UN4JLeb6xtBDjzbg5TQ7PYqh';
        
        // 添加加载状态
        this.loadingOverlay = document.createElement('div');
        this.loadingOverlay.className = 'loading-overlay';
        this.loadingOverlay.innerHTML = `
            <div class="loading-spinner"></div>
            <div class="loading-text">处理中...</div>
        `;
        document.body.appendChild(this.loadingOverlay);
    }

    initializeCompressorProperties() {
        // ... 原有的压缩工具属性保持不变 ...
    }

    initializeBackgroundRemovalProperties() {
        this.bgType = document.getElementById('bgType');
        this.bgColor = document.getElementById('bgColor');
        this.colorPicker = document.getElementById('colorPicker');
        this.tabButtons = document.querySelectorAll('.tab-button');
        this.tabContents = document.querySelectorAll('.tab-content');
        
        // 当前处理模式：'compress' 或 'background'
        this.currentMode = 'compress';
    }

    initializeNavigationProperties() {
        this.navItems = document.querySelectorAll('.nav-item');
        this.toolContent = document.querySelector('.tool-content');
        this.toolHeader = document.querySelector('.tool-header');
    }

    initializeEventListeners() {
        // 修改点击上传区域的处理
        this.dropZone.addEventListener('click', (e) => {
            // 防止重复触发文件选择框
            if (this.isFileDialogOpen) {
                return;
            }
            
            // 如果点击的是上传按钮，不要触发文件选择
            if (e.target.classList.contains('upload-button')) {
                return;
            }
            
            this.isFileDialogOpen = true;
            this.fileInput.click();
        });

        // 修改文件选择事件
        this.fileInput.addEventListener('click', (e) => {
            // 阻止冒泡，防止触发 dropZone 的点击事件
            e.stopPropagation();
        });

        this.fileInput.addEventListener('change', (e) => {
            this.handleFiles(e.target.files);
            // 重置文件输入，允许选择相同文件
            e.target.value = '';
            this.isFileDialogOpen = false;
        });

        // 添加窗口失焦事件处理
        window.addEventListener('focus', () => {
            // 当窗口重新获得焦点时，重置标志
            setTimeout(() => {
                this.isFileDialogOpen = false;
            }, 300);
        });

        // 质量滑块
        this.qualitySlider.addEventListener('input', () => {
            const quality = parseInt(this.qualitySlider.value);
            this.qualityValue.textContent = `${quality}%`;
            this.updateQualitySuggestion(quality);
        });

        // 压缩按钮
        this.compressButton.addEventListener('click', () => this.processImages());
        
        // 下载按钮
        this.downloadButton.addEventListener('click', () => this.downloadAsZip());

        // 新增：标签切换事件
        this.tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                this.switchTab(button.dataset.tab);
            });
        });

        // 新增：背景类型选择事件
        this.bgType.addEventListener('change', () => {
            this.updateBackgroundOptions();
        });

        // 新增：导航事件
        this.navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleNavigation(item);
            });
        });
    }

    // 新增：处理导航
    handleNavigation(item) {
        // 移除所有活动状态
        this.navItems.forEach(nav => nav.classList.remove('active'));
        // 添加当前活动状态
        item.classList.add('active');

        // 更新工具标题和描述
        const toolName = item.textContent.trim();
        this.updateToolHeader(toolName);

        // 如果是图片处理相关的工具，显示处理区域
        if (['图片压缩', '调整大小', '图片格式转换', '去除背景'].includes(toolName)) {
            this.toolContent.style.display = 'block';
            // 根据工具类型显示相应的选项
            this.updateToolOptions(toolName);
        } else {
            this.toolContent.style.display = 'none';
        }
    }

    // 新增：更新工具标题和描述
    updateToolHeader(toolName) {
        const descriptions = {
            '图片压缩': '使用我们的压缩工具，您可以轻松地减小图片文件大小。上传您的图片，调整压缩质量，然后点击压缩按钮即可。',
            '去除背景': '智能去除图片背景，支持人物、物品等多种场景。可选择透明背景或自定义背景色。',
            '调整大小': '批量调整图片尺寸，支持按比例缩放或指定具体尺寸。',
            '图片格式转换': '支持多种格式之间的转换，包括 JPG、PNG、WebP 等常用格式。'
        };

        const h1 = this.toolHeader.querySelector('h1');
        const description = this.toolHeader.querySelector('.tool-description');
        
        h1.textContent = toolName;
        description.textContent = descriptions[toolName] || '';
    }

    // 新增：更新工具选项
    updateToolOptions(toolName) {
        const compressOptions = document.getElementById('compressOptions');
        const backgroundOptions = document.getElementById('backgroundOptions');
        
        switch (toolName) {
            case '图片压缩':
                this.switchTab('compress');
                break;
            case '去除背景':
                this.switchTab('background');
                break;
            // 可以继续添加其他工具的选项
        }
    }

    // 新增：切换选项卡
    switchTab(tabName) {
        this.currentMode = tabName;
        
        // 更新标签按钮状态
        this.tabButtons.forEach(button => {
            button.classList.toggle('active', button.dataset.tab === tabName);
        });

        // 更新内容显示
        this.tabContents.forEach(content => {
            content.classList.toggle('active', content.id === `${tabName}Options`);
        });

        // 更新处理按钮文本
        this.compressButton.textContent = tabName === 'compress' ? '开始压缩' : '去除背景';
    }

    // 新增：更新背景选项
    updateBackgroundOptions() {
        const selectedType = this.bgType.value;
        this.colorPicker.style.display = selectedType === 'color' ? 'block' : 'none';
    }

    // 修改：处理图片方法
    async processImages() {
        if (this.currentMode === 'compress') {
            await this.compressImages();
        } else {
            await this.removeBackground();
        }
    }

    // 修改去除背景方法
    async removeBackground() {
        if (this.images.length === 0) {
            alert('请先上传图片');
            return;
        }

        this.compressButton.disabled = true;
        this.compressButton.textContent = '处理中...';
        this.loadingOverlay.style.display = 'flex';
        
        try {
            this.compressedImages = [];
            
            for (let i = 0; i < this.images.length; i++) {
                const image = this.images[i];
                this.loadingOverlay.querySelector('.loading-text').textContent = 
                    `正在处理第 ${i + 1}/${this.images.length} 张图片...`;
                
                try {
                    const processedBlob = await this.processImageBackground(image);
                    if (processedBlob) {
                        // 使用原始文件名，但添加 nobg 前缀
                        const fileName = `nobg_${image.name.replace(/\.[^/.]+$/, '')}.png`;
                        this.compressedImages.push({
                            data: processedBlob,
                            name: fileName
                        });
                    }
                } catch (error) {
                    console.error(`处理图片 ${image.name} 失败:`, error);
                    alert(`处理图片 ${image.name} 失败: ${error.message}`);
                }
            }
            
            if (this.compressedImages.length > 0) {
                this.downloadButton.disabled = false;
                alert(`处理完成！成功处理 ${this.compressedImages.length} 张图片`);
            } else {
                throw new Error('没有成功处理的图片');
            }
        } catch (error) {
            console.error('背景去除错误:', error);
            alert('处理过程中出现错误：' + error.message);
        } finally {
            this.compressButton.disabled = false;
            this.compressButton.textContent = '去除背景';
            this.loadingOverlay.style.display = 'none';
        }
    }

    // 修改处理单张图片背景的方法
    async processImageBackground(image) {
        try {
            // 将 base64 转换为 Blob
            const base64Data = image.original.split(',')[1];
            const binaryData = atob(base64Data);
            const array = new Uint8Array(binaryData.length);
            for (let i = 0; i < binaryData.length; i++) {
                array[i] = binaryData.charCodeAt(i);
            }
            const blob = new Blob([array], { type: 'image/jpeg' }); // 修改为 jpeg

            // 准备表单数据
            const formData = new FormData();
            formData.append('image_file', blob, 'image.jpg'); // 使用固定的文件名
            formData.append('size', 'auto');

            // 根据选择的背景类型设置参数
            switch (this.bgType.value) {
                case 'transparent':
                    formData.append('bg_color', ''); // 空字符串表示透明
                    break;
                case 'color':
                    formData.append('bg_color', this.bgColor.value.substring(1));
                    break;
                case 'blur':
                    formData.append('bg_blur', '1');
                    break;
            }

            // API 调用
            const response = await fetch('https://api.remove.bg/v1.0/removebg', {
                method: 'POST',
                headers: {
                    'X-Api-Key': 'UN4JLeb6xtBDjzbg5TQ7PYqh'
                },
                body: formData
            });

            // 检查响应状态
            if (!response.ok) {
                let errorMessage;
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.errors[0]?.title || '背景去除失败';
                } catch {
                    errorMessage = await response.text();
                }
                throw new Error(errorMessage);
            }

            // 获取处理后的图片数据
            const buffer = await response.arrayBuffer();
            
            // 转换为 Blob
            const processedBlob = new Blob([buffer], { 
                type: 'image/png'
            });

            // 验证处理后的图片大小
            if (processedBlob.size === 0) {
                throw new Error('处理后的图片数据为空');
            }

            return processedBlob;

        } catch (error) {
            console.error('Background removal error:', error);
            throw new Error(`处理图片失败: ${error.message}`);
        }
    }

    // 工具方法：将十六进制颜色转换为RGB
    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }

    handleFiles(files) {
        // 修改文件类型验证
        const imageFiles = Array.from(files).filter(file => {
            const isValidType = this.supportedTypes.includes(file.type);
            const isValidSize = file.size <= 10 * 1024 * 1024; // 10MB
            
            if (!isValidType) {
                alert(`不支持的文件类型: ${file.name}\n支持的格式：JPG、PNG、WebP`);
            }
            if (!isValidSize) {
                alert(`文件过大: ${file.name}\n最大支持10MB`);
            }
            
            return isValidType && isValidSize;
        });

        // 读取图片文件
        imageFiles.forEach(file => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const image = {
                    original: e.target.result,
                    compressed: null,
                    name: file.name,
                    size: file.size
                };
                this.images.push(image);
                this.updateImageGrid();
            };
            reader.readAsDataURL(file);
        });
    }

    updateImageGrid() {
        this.imageGrid.innerHTML = '';
        const totalImages = this.images.length;
        
        this.images.forEach((image, index) => {
            if (index < this.previewLimit) {
                const imageItem = document.createElement('div');
                imageItem.className = 'image-item';
                
                const originalSize = this.formatFileSize(image.size);
                const simplifiedName = this.getSimplifiedFileName(image.name);
                
                const showMoreBadge = (index === this.previewLimit - 1 && totalImages > this.previewLimit);
                
                imageItem.innerHTML = `
                    <img src="${image.original}" alt="Image ${index + 1}">
                    ${showMoreBadge ? 
                        `<div class="image-count-badge">+${totalImages - this.previewLimit} 张</div>` 
                        : ''}
                    <div class="image-info">
                        <span class="image-name" title="${image.name}">${simplifiedName}</span>
                        <span class="image-size">${originalSize}</span>
                    </div>
                `;
                this.imageGrid.appendChild(imageItem);
            }
        });

        this.imageCount.textContent = `共 ${totalImages} 张图片`;
        this.compressButton.disabled = totalImages === 0;
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    async compressImages() {
        this.compressButton.disabled = true;
        this.compressButton.textContent = '压缩中...';
        
        this.compressedImages = [];
        
        try {
            for (let image of this.images) {
                const compressed = await this.compressImage(
                    image.original,
                    this.qualitySlider.value / 100,
                    parseInt(this.maxWidth.value)
                );
                this.compressedImages.push({
                    data: compressed,
                    name: image.name
                });
            }
            
            this.downloadButton.disabled = false;
            alert('压缩完成！');
        } catch (error) {
            alert('压缩过程中出现错误：' + error.message);
        } finally {
            this.compressButton.disabled = false;
            this.compressButton.textContent = '开始压缩';
        }
    }

    compressImage(src, quality, maxWidth) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                if (width > maxWidth) {
                    height = (maxWidth * height) / width;
                    width = maxWidth;
                }

                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                
                // 根据原始图片格式定输出格式
                const outputFormat = this.getOutputFormat(src);
                
                // 转换为 Blob
                canvas.toBlob((blob) => {
                    resolve(blob);
                }, outputFormat, quality);
            };
            
            img.onerror = reject;
            img.src = src;
        });
    }

    // 新增：确定输出格式的方法
    getOutputFormat(src) {
        // 如果原图是 WebP，保持 WebP 格式
        if (src.startsWith('data:image/webp')) {
            return 'image/webp';
        }
        // 默认使用 JPEG
        return 'image/jpeg';
    }

    // 修改下载方法以支持不同的处理模式
    async downloadAsZip() {
        try {
            this.downloadButton.disabled = true;
            this.downloadButton.textContent = '打包中...';
            this.loadingOverlay.style.display = 'flex';

            const zip = new JSZip();
            const folder = zip.folder(this.currentMode === 'compress' ? 
                "compressed_images" : "nobg_images");
            
            if (this.compressedImages.length === 0) {
                throw new Error('没有处理完成的图片');
            }

            // 添加图片到 ZIP
            for (let i = 0; i < this.compressedImages.length; i++) {
                const image = this.compressedImages[i];
                if (!image.data) {
                    console.error(`图片 ${image.name} 数据为空`);
                    continue;
                }

                const newFileName = this.currentMode === 'compress' ?
                    `compressed_${String(i + 1).padStart(3, '0')}.${image.name.split('.').pop()}` :
                    `nobg_${String(i + 1).padStart(3, '0')}.png`;

                // 验证 Blob 数据
                if (!(image.data instanceof Blob)) {
                    console.error('Invalid image data type:', typeof image.data);
                    continue;
                }

                // 读取 Blob 数据并添加到 ZIP
                const arrayBuffer = await image.data.arrayBuffer();
                folder.file(newFileName, arrayBuffer, {binary: true});
            }
            
            // 生成 ZIP 文件
            const content = await zip.generateAsync({
                type: "blob",
                compression: "DEFLATE",
                compressionOptions: {
                    level: 9
                }
            });
            
            // 下载 ZIP 文件
            const date = new Date();
            const dateStr = date.toISOString().split('T')[0];
            const prefix = this.currentMode === 'compress' ? 'compressed' : 'nobg';
            const zipFileName = `${prefix}_images_${dateStr}.zip`;
            
            const link = document.createElement('a');
            link.href = URL.createObjectURL(content);
            link.download = zipFileName;
            link.click();
            
            URL.revokeObjectURL(link.href);

        } catch (error) {
            console.error('下载错误:', error);
            alert('下载过程中出现错误：' + error.message);
        } finally {
            this.downloadButton.disabled = false;
            this.downloadButton.textContent = '下载全部';
            this.loadingOverlay.style.display = 'none';
        }
    }

    updateQualitySuggestion(quality) {
        // 移除所有质量等级类名
        this.qualitySuggestion.classList.remove('high', 'medium', 'low');
        
        let suggestion = '';
        
        if (quality >= 80) {
            this.qualitySuggestion.classList.add('high');
            suggestion = {
                text: '高质量压缩，适合：',
                uses: [
                    '• 摄影作品展示',
                    '• 专业印刷需求',
                    '• 重要活动照片'
                ],
                size: '文件大小约为原图的 80-90%'
            };
        } else if (quality >= 60) {
            this.qualitySuggestion.classList.add('medium');
            suggestion = {
                text: '平衡质量，适合：',
                uses: [
                    '• 社交媒体分享',
                    '• 网站图片展示',
                    '• 日常照片存储'
                ],
                size: '文件大小约为原图的 40-60%'
            };
        } else if (quality >= 30) {
            this.qualitySuggestion.classList.add('medium');
            suggestion = {
                text: '普通质量，适合：',
                uses: [
                    '• 网页缩略图',
                    '• 即时通讯分享',
                    '• 预览图片'
                ],
                size: '文件大小约为原图的 20-30%'
            };
        } else {
            this.qualitySuggestion.classList.add('low');
            suggestion = {
                text: '低质量压缩，适合：',
                uses: [
                    '• 图片图标',
                    '• 临时预览',
                    '• 超小尺寸需求'
                ],
                size: '文件大小低于原图的 20%'
            };
        }

        // 更新建议内容
        this.suggestionContent.innerHTML = `
            <div>${suggestion.text}</div>
            <div>${suggestion.uses.join('<br>')}</div>
            <div style="margin-top: 8px; font-style: italic;">${suggestion.size}</div>
        `;
    }

    // 修改上传提示文本
    updateUploadHint() {
        const uploadHint = document.querySelector('.upload-hint');
        if (uploadHint) {
            uploadHint.textContent = '支持 JPG、PNG、WebP 格式，最大 10MB';
        }
    }

    // 修改文件名处理方法
    getSimplifiedFileName(fileName) {
        // 如果文件名超过20个字符，保留前10个和后8个字符
        if (fileName.length > 20) {
            const ext = fileName.split('.').pop();
            const name = fileName.substring(0, fileName.lastIndexOf('.'));
            return `${name.substring(0, 10)}...${name.slice(-4)}.${ext}`;
        }
        return fileName;
    }
}

// 初始化应用
window.addEventListener('DOMContentLoaded', () => {
    const imageTools = new ImageTools();
    imageTools.updateUploadHint();
}); 