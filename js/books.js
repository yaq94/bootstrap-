/*
 * js/books.js (v3) - Final Correct Version
 * 
 * "古籍典藏"页面 V3 设计方案专属脚本文件
 * 设计理念："探索古籍的层叠世界"
 */
document.addEventListener('DOMContentLoaded', () => {
  console.log('Books V3 JS Loaded');
  
  class BooksV3 {
    constructor() {
      this.booksData = [];
      this.activeFilter = null;
      this.isAnimating = false; // Add state for ink pool
      this.resetTimer = null; // Timer for auto-resetting the quote
      this.dom = {
        loomContainer: document.getElementById('loom-of-classics-container'),
        slipsContainer: document.getElementById('layered-slips-container'),
        modalContent: document.getElementById('book-details-modal-content'),
        // New DOM elements for Ink Pool module
        inkPoolContainer: document.getElementById('ink-pool-container'),
        inkPoolQuote: document.getElementById('ink-pool-quote'),
        inkPoolKeywords: document.getElementById('ink-pool-keywords'),
        inkPoolButton: document.getElementById('ink-pool-button'),
        ripple: document.querySelector('.ripple'),
      };
      this.detailsModal = new bootstrap.Modal(document.getElementById('book-details-modal'));
      this.init();
    }

    async init() {
      await this.loadData();
      if (!this.booksData || this.booksData.length === 0) return;

      this.renderLoomOfClassics();
      this.addLoomEventListeners();
      this.renderLayeredSlips();
      this.addSlipsEventListeners();
      this.addInkPoolListener(); // Changed from addInkDropListener
    }

    async loadData() {
      try {
        const response = await fetch('data/books.json?v=' + new Date().getTime());
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        this.booksData = await response.json();
      } catch (error) {
        console.error('Failed to load book data:', error);
        this.dom.loomContainer.innerHTML = '<p class="text-danger">数据加载失败，请刷新页面重试。</p>';
      }
    }

    renderLoomOfClassics() {
      const categories = [...new Set(this.booksData.map(b => b.category))].filter(Boolean);
      const dynasties = [...new Set(this.booksData.map(b => b.dynasty))].sort((a, b) => {
        if (a === '未知') return 1;
        if (b === '未知') return -1;
        const yearA = this.booksData.find(book => book.dynasty === a)?.year || 0;
        const yearB = this.booksData.find(book => book.dynasty === b)?.year || 0;
        return yearA - yearB;
      });

      let html = '<div class="loom-grid">';
      html += '<div class="loom-row loom-header"><div class="loom-cell loom-y-axis-label">类别\\朝代</div>';
      dynasties.forEach(d => { html += `<div class="loom-cell loom-x-axis-label">${d}</div>`; });
      html += '</div>';

      categories.forEach(cat => {
        html += '<div class="loom-row">';
        html += `<div class="loom-cell loom-y-axis-label">${cat}</div>`;
        dynasties.forEach(dyn => {
          const booksInCell = this.booksData.filter(b => b.category === cat && b.dynasty === dyn);
          const count = booksInCell.length;
          const cellClass = count > 0 ? 'has-books' : '';
          const tooltip = count > 0 ? `${cat} - ${dyn}: ${count}部` : '';
          html += `<div class="loom-cell ${cellClass}" data-category="${cat}" data-dynasty="${dyn}" title="${tooltip}">`;
          if (count > 0) html += `<span class="loom-dot" style="--book-count: ${count}"></span>`;
          html += '</div>';
        });
        html += '</div>';
      });

      html += '</div>';
      this.dom.loomContainer.innerHTML = html;
    }

    addLoomEventListeners() {
      this.dom.loomContainer.addEventListener('click', (e) => {
        const cell = e.target.closest('.loom-cell.has-books');
        if (!cell) return;
        const { category, dynasty } = cell.dataset;
        if (this.activeFilter && this.activeFilter.category === category && this.activeFilter.dynasty === dynasty) {
            this.activeFilter = null;
            this.dom.loomContainer.querySelectorAll('.loom-cell.active').forEach(c => c.classList.remove('active'));
        } else {
            this.activeFilter = { category, dynasty };
            this.dom.loomContainer.querySelectorAll('.loom-cell.active').forEach(c => c.classList.remove('active'));
            cell.classList.add('active');
        }
        this.renderLayeredSlips();
      });
    }

    renderLayeredSlips() {
      let booksToRender = this.booksData;
      if (this.activeFilter) {
          booksToRender = this.booksData.filter(b => 
              b.category === this.activeFilter.category && b.dynasty === this.activeFilter.dynasty
          );
      }
      if (booksToRender.length === 0) {
          this.dom.slipsContainer.innerHTML = '<p class="text-center text-muted">暂无符合条件的书籍。</p>';
          return;
      }
      const html = booksToRender.map((book, index) => `
          <div class="slip-card" style="--i: ${index}" data-id="${book.id}">
              <div class="slip-content">
                  <h5 class="slip-title">${book.title}</h5>
                  <p class="slip-meta">${book.author} / ${book.dynasty}</p>
              </div>
          </div>
      `).join('');
      this.dom.slipsContainer.innerHTML = html;
    }

    addSlipsEventListeners() {
      this.dom.slipsContainer.addEventListener('click', (e) => {
          const card = e.target.closest('.slip-card');
          if (!card) return;
          const bookId = card.dataset.id;
          const bookData = this.booksData.find(b => b.id === bookId);
          if (bookData) {
              this.renderBookDetails(bookData);
              this.detailsModal.show();
          }
      });
    }

    renderBookDetails(book) {
      const tocHtml = book.table_of_contents.map(item => `<li>${item}</li>`).join('');
      const html = `
          <div class="modal-header border-0">
              <h4 class="details-modal-title" id="bookDetailsModalLabel">${book.title}</h4>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body book-details-body">
              <div class="row">
                  <div class="col-md-8">
                      <p class="details-meta"><strong>作者:</strong> ${book.author} / ${book.dynasty} (约 ${book.year}年)</p>
                      <hr>
                      <p class="details-summary">${book.summary}</p>
                      ${book.commentary ? `
                      <h5 class="sidebar-title mt-4">评注与解读</h5>
                      <p class="details-commentary">${book.commentary}</p>
                      ` : ''}
                      <blockquote class="details-excerpt">
                          <p>${book.excerpt}</p>
                      </blockquote>
                  </div>
                  <div class="col-md-4 details-sidebar">
                      <h5 class="sidebar-title">主要目录</h5>
                      <ul class="details-toc">${tocHtml}</ul>
                  </div>
              </div>
          </div>
      `;
      this.dom.modalContent.innerHTML = html;
    }

    // --- New Methods for Ink Pool ---
    
    addInkPoolListener() {
        if (!this.dom.inkPoolButton) return;
        this.dom.inkPoolButton.addEventListener('click', () => {
            if (this.isAnimating) return;
            this.startInkPoolAnimation();
        });
    }

    startInkPoolAnimation() {
        this.isAnimating = true;
        
        // 1. Reset state
        this.dom.inkPoolQuote.classList.remove('visible');
        this.dom.inkPoolKeywords.innerHTML = '';

        // 2. Ripple Animation
        if (this.dom.ripple) {
            this.dom.ripple.classList.add('animate');
            this.dom.ripple.addEventListener('animationend', () => {
                this.dom.ripple.classList.remove('animate');
            }, { once: true });
        }

        // 3. Get data and extract keywords
        const randomBook = this.booksData[Math.floor(Math.random() * this.booksData.length)];
        const quote = randomBook?.excerpt || "道可道，非常道。";
        const keywords = this.extractKeywords(quote);

        // 4. Display keywords after a delay
        setTimeout(() => {
            this.displayKeywords(keywords, quote);
        }, 500); // Delay for ripple to subside
    }

    extractKeywords(quote) {
        // A simple keyword extractor for Chinese text
        const words = quote.split(/[，。；？！、]/).filter(w => w.length >= 2 && w.length <= 4);
        const uniqueWords = [...new Set(words)];
        return uniqueWords.slice(0, 4); // Return max 4 keywords
    }

    displayKeywords(keywords, fullQuote) {
        if (!this.dom.inkPoolContainer) return;
        const radius = 180; // Radius for keyword circle
        const angleStep = (2 * Math.PI) / keywords.length;

        keywords.forEach((word, i) => {
            const angle = angleStep * i - (Math.PI / 2); // Start from top
            const x = Math.cos(angle) * radius + (this.dom.inkPoolContainer.offsetWidth / 2);
            const y = Math.sin(angle) * radius + (this.dom.inkPoolContainer.offsetHeight / 2);
            
            const keywordEl = document.createElement('div');
            keywordEl.className = 'keyword';
            keywordEl.textContent = word;
            keywordEl.style.left = `${x}px`;
            keywordEl.style.top = `${y}px`;
            
            // Staggered fade-in animation
            setTimeout(() => {
                keywordEl.style.opacity = '1';
                keywordEl.style.transform = 'translate(-50%, -50%) scale(1)';
            }, i * 150);
            
            keywordEl.addEventListener('click', () => {
                // Prevent clicking another keyword while a quote is already visible
                if (this.dom.inkPoolQuote.classList.contains('visible')) return;
                this.displayQuoteInPool(fullQuote, word);
            }); // Removed { once: true }

            this.dom.inkPoolKeywords.appendChild(keywordEl);
        });
        
        // Allow new interaction after animation is complete
        setTimeout(() => {
            this.isAnimating = false;
        }, 500 + keywords.length * 150);
    }

    displayQuoteInPool(quote, clickedKeyword) {
        // Clear any existing reset timer
        if (this.resetTimer) {
            clearTimeout(this.resetTimer);
        }

        // Highlight the clicked keyword in the full quote
        const highlightedQuote = quote.replace(new RegExp(clickedKeyword, 'g'), `<span class="highlight">${clickedKeyword}</span>`);
        this.dom.inkPoolQuote.innerHTML = highlightedQuote;
        this.dom.inkPoolQuote.classList.add('visible');

        // Make all keywords non-interactive while quote is visible
        this.dom.inkPoolKeywords.querySelectorAll('.keyword').forEach(el => {
            el.style.pointerEvents = 'none';
        });

        // Set timer to return to keyword selection
        this.resetTimer = setTimeout(() => {
            this.dom.inkPoolQuote.classList.remove('visible'); // Hide quote
            // Make keywords interactive again
            this.dom.inkPoolKeywords.querySelectorAll('.keyword').forEach(el => {
                el.style.pointerEvents = 'auto';
            });
        }, 5000); // 5-second delay as requested
    }
  }

  new BooksV3();
});