(function() {
    'use strict';

    document.addEventListener('DOMContentLoaded', function() {
        console.log('Community page script loaded.');

        // Function to fetch data
        async function fetchData() {
            try {
                const response = await fetch('data/community.json');
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return await response.json();
            } catch (error) {
                console.error("Could not fetch community data:", error);
            }
        }

        // Initialize all modules
        async function initModules() {
            const data = await fetchData();
            if (!data) {
                return;
            }

            initQaBoard(data.qa_board);
            initForumArena(data.forum_arena);
            initPollStation(data.poll_station);
            initMemberSpotlight(data.member_spotlight);
            initEventCalendar(data.event_calendar);
            initUserComments(data.user_comments);
            // Future modules will be initialized here
        }

        // Module 1: QA Board ("问道石")
        function initQaBoard(qaData) {
            const qaBoard = document.getElementById('qa-board');
            if (!qaBoard) return;

            let content = `<div class="text-center"><h2>问道石</h2></div>`;
            content += '<div class="qa-grid">';

            qaData.forEach(item => {
                content += `
                    <div class="qa-card" data-id="${item.id}">
                        <div class="qa-card-inner">
                            <div class="qa-card-front">
                                <div class="upvotes">
                                    <i class="bi bi-hand-thumbs-up-fill"></i> ${item.upvotes}
                                </div>
                                <p class="question">${item.question}</p>
                            </div>
                            <div class="qa-card-back">
                                <p class="answer">${item.answer}</p>
                            </div>
                        </div>
                    </div>
                `;
            });

            content += '</div>';
            qaBoard.innerHTML = content;

            // Add event listeners for the flip animation
            const cards = qaBoard.querySelectorAll('.qa-card');
            cards.forEach(card => {
                card.addEventListener('click', () => {
                    card.classList.toggle('flipped');
                });
            });
        }

        // Module 2: Forum Arena ("论道场")
        function initForumArena(forumData) {
            const forumArena = document.getElementById('forum-arena');
            if (!forumArena) return;

            let content = `<div class="text-center"><h2>论道场</h2></div>`;
            content += '<div class="forum-container">';

            const gradients = [
                'linear-gradient(45deg, #2c3e50, #3498db)',
                'linear-gradient(45deg, #16a085, #f1c40f)',
                'linear-gradient(45deg, #c0392b, #8e44ad)'
            ];

            forumData.forEach((item, index) => {
                const gradient = gradients[index % gradients.length];
                let threadsHtml = '<ul class="threads-list">';
                item.threads.forEach((thread, threadIndex) => {
                    threadsHtml += `
                        <li data-category-id="${item.id}" data-thread-index="${threadIndex}">
                            <span class="thread-title">${thread.title}</span>
                            <span class="thread-meta">
                                ${thread.author} <i class="bi bi-chat-dots-fill"></i> ${thread.replies}
                            </span>
                        </li>
                    `;
                });
                threadsHtml += '</ul>';

                content += `
                    <div class="forum-item" style="background-image: ${gradient};">
                        <div class="forum-content">
                            <h3 class="category-title">
                                <i class="bi ${item.icon}"></i> ${item.category}
                            </h3>
                            ${threadsHtml}
                        </div>
                    </div>
                `;
            });

            content += '</div>';
            forumArena.innerHTML = content;

            const container = forumArena.querySelector('.forum-container');
            const items = forumArena.querySelectorAll('.forum-item');
            const threadModalEl = document.getElementById('thread-modal');
            const threadModal = threadModalEl ? new bootstrap.Modal(threadModalEl) : null;

            container.addEventListener('click', (e) => {
                const item = e.target.closest('.forum-item');
                if (item) {
                     // Handle accordion expansion
                    if (!item.classList.contains('active')) {
                        items.forEach(i => i.classList.remove('active'));
                        item.classList.add('active');
                    }
                }
                
                const threadLi = e.target.closest('.threads-list li');
                if (threadLi && threadModal) {
                    const categoryId = threadLi.dataset.categoryId;
                    const threadIndex = parseInt(threadLi.dataset.threadIndex);
                    
                    const category = forumData.find(f => f.id === categoryId);
                    const thread = category.threads[threadIndex];
                    
                    const modalTitle = threadModalEl.querySelector('.modal-title');
                    const modalBody = threadModalEl.querySelector('.modal-body');

                    modalTitle.textContent = thread.title;
                    modalBody.innerHTML = `
                        <div class="thread-modal-content">
                            <p><strong>作者: ${thread.author}</strong></p>
                            <p>${thread.content}</p>
                        </div>
                        <hr>
                        <h5>即时评论</h5>
                        <ul class="thread-comments-list">
                            <li class="comment-item">
                                <img src="https://i.pravatar.cc/150?u=m3" alt="天机子" class="comment-avatar">
                                <div class="comment-body">
                                    <div class="comment-header"><span class="comment-author">天机子</span><span class="comment-timestamp">5分钟前</span></div>
                                    <p class="comment-text">说得好！补充一点，月破之爻若得日辰来合，亦为有救。</p>
                                </div>
                            </li>
                        </ul>
                        <form class="thread-comment-form">
                            <div class="input-group">
                                <input type="text" class="form-control" placeholder="对此帖子发表评论..." required>
                                <button class="btn btn-primary" type="submit">评论</button>
                            </div>
                        </form>
                    `;
                    
                    threadModal.show();

                    const commentForm = threadModalEl.querySelector('.thread-comment-form');
                    const commentInput = commentForm.querySelector('input');
                    const commentsList = threadModalEl.querySelector('.thread-comments-list');

                    commentForm.addEventListener('submit', (ev) => {
                        ev.preventDefault();
                        const text = commentInput.value.trim();
                        if (text === '') return;
                        
                        const newCommentHTML = `
                            <li class="comment-item">
                                <img src="https://i.pravatar.cc/150?u=guest${Date.now()}" alt="访客" class="comment-avatar">
                                <div class="comment-body">
                                    <div class="comment-header"><span class="comment-author">访客</span><span class="comment-timestamp">刚刚</span></div>
                                    <p class="comment-text">${text}</p>
                                </div>
                            </li>
                        `;
                        commentsList.insertAdjacentHTML('beforeend', newCommentHTML);
                        commentInput.value = '';
                    });
                }
            });
        }

        // Module 3: Poll Station ("众说纷纭")
        function initPollStation(pollData) {
            const pollStation = document.getElementById('poll-station');
            if (!pollStation) return;

            let questionHTML = `<div class="text-center"><h2>众说纷纭</h2></div>`;
            questionHTML += `<p class="poll-question">${pollData.question}</p>`;
            
            let optionsHTML = '<div class="poll-options">';
            pollData.options.forEach(option => {
                optionsHTML += `<button class="poll-option" data-id="${option.id}">${option.text}</button>`;
            });
            optionsHTML += '</div>';

            pollStation.innerHTML = questionHTML + optionsHTML;

            const optionsContainer = pollStation.querySelector('.poll-options');
            optionsContainer.addEventListener('click', function(e) {
                if (e.target.classList.contains('poll-option') && !optionsContainer.classList.contains('voted')) {
                    
                    optionsContainer.classList.add('voted');
                    e.target.classList.add('voted');

                    // Simulate vote
                    const selectedOption = pollData.options.find(opt => opt.id === e.target.dataset.id);
                    selectedOption.votes++;

                    // Calculate totals and percentages
                    const totalVotes = pollData.options.reduce((sum, opt) => sum + opt.votes, 0);
                    
                    let resultsHTML = '<ul class="poll-results">';
                    pollData.options.forEach(option => {
                        const percentage = ((option.votes / totalVotes) * 100).toFixed(1);
                        resultsHTML += `
                            <li class="poll-result-item">
                                <div class="info">
                                    <span>${option.text}</span>
                                    <span>${option.votes}票 (${percentage}%)</span>
                                </div>
                                <div class="poll-result-bar">
                                    <div class="poll-result-bar-inner" data-width="${percentage}%"></div>
                                </div>
                            </li>
                        `;
                    });
                    resultsHTML += '</ul>';

                    // Transition to results view
                    optionsContainer.style.opacity = '0';
                    setTimeout(() => {
                        optionsContainer.innerHTML = resultsHTML;
                        optionsContainer.style.opacity = '1';
                        
                        // Set width to trigger animation
                        const bars = optionsContainer.querySelectorAll('.poll-result-bar-inner');
                        bars.forEach(bar => {
                            setTimeout(() => {
                                bar.style.width = bar.dataset.width;
                            }, 100); // Small delay to ensure render
                        });
                    }, 500); // Match CSS transition
                }
            });
        }

        // Module 4: Member Spotlight ("同好风采")
        function initMemberSpotlight(memberData) {
            const spotlight = document.getElementById('member-spotlight');
            if (!spotlight || memberData.length === 0) return;

            let content = `
                <div class="text-center"><h2>同好风采</h2></div>
                <div class="spotlight-container">
                    <div class="spotlight-track"></div>
                </div>
                <button id="spotlight-prev" class="spotlight-nav"><i class="bi bi-chevron-left"></i></button>
                <button id="spotlight-next" class="spotlight-nav"><i class="bi bi-chevron-right"></i></button>
            `;
            spotlight.innerHTML = content;

            const track = spotlight.querySelector('.spotlight-track');
            const cardData = [...memberData, ...memberData.slice(0, 4)]; // Clone first 4 for infinite loop

            cardData.forEach(member => {
                let tagsHtml = '';
                member.tags.forEach(tag => {
                    tagsHtml += `<span class="tag">${tag}</span>`;
                });
                track.innerHTML += `
                    <div class="spotlight-card">
                        <div class="spotlight-card-inner">
                            <img src="${member.avatar}" alt="${member.name}" class="spotlight-avatar">
                            <h4 class="spotlight-name">${member.name}</h4>
                            <p class="spotlight-bio">"${member.bio}"</p>
                            <div class="spotlight-tags">${tagsHtml}</div>
                        </div>
                    </div>
                `;
            });

            const cards = track.querySelectorAll('.spotlight-card');
            const cardWidth = cards[0].offsetWidth;
            let currentIndex = 0;
            let isTransitioning = false;
            let autoPlayInterval;

            function goToCard(index) {
                if (isTransitioning) return;
                isTransitioning = true;
                track.style.transition = 'transform 0.5s ease-in-out';
                track.style.transform = `translateX(-${index * cardWidth}px)`;
                currentIndex = index;
            }

            function startAutoPlay() {
                stopAutoPlay();
                autoPlayInterval = setInterval(() => {
                    goToCard(currentIndex + 1);
                }, 4000);
            }

            function stopAutoPlay() {
                clearInterval(autoPlayInterval);
            }

            spotlight.querySelector('#spotlight-next').addEventListener('click', () => goToCard(currentIndex + 1));
            spotlight.querySelector('#spotlight-prev').addEventListener('click', () => goToCard(currentIndex - 1));
            
            track.addEventListener('transitionend', () => {
                isTransitioning = false;
                if (currentIndex >= memberData.length) {
                    currentIndex = currentIndex - memberData.length;
                    track.style.transition = 'none';
                    track.style.transform = `translateX(-${currentIndex * cardWidth}px)`;
                }
                if (currentIndex < 0) {
                    currentIndex = memberData.length - 1;
                    track.style.transition = 'none';
                    track.style.transform = `translateX(-${currentIndex * cardWidth}px)`;
                }
            });

            spotlight.addEventListener('mouseenter', stopAutoPlay);
            spotlight.addEventListener('mouseleave', startAutoPlay);

            // Parallax effect
            cards.forEach(card => {
                const cardInner = card.querySelector('.spotlight-card-inner');
                card.addEventListener('mousemove', (e) => {
                    const rect = card.getBoundingClientRect();
                    const x = e.clientX - rect.left;
                    const y = e.clientY - rect.top;
                    const centerX = rect.width / 2;
                    const centerY = rect.height / 2;
                    const rotateX = (y - centerY) / 20;
                    const rotateY = -(x - centerX) / 20;

                    cardInner.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
                    cardInner.style.setProperty('--x', `${(x / rect.width) * 100}%`);
                    cardInner.style.setProperty('--y', `${(y / rect.height) * 100}%`);
                });

                card.addEventListener('mouseleave', () => {
                    cardInner.style.transform = 'rotateX(0) rotateY(0)';
                });
            });

            startAutoPlay();
        }

        // Module 5: Event Calendar ("奇门遁甲")
        function initEventCalendar(calendarData) {
            const calendarEl = document.getElementById('event-calendar');
            if (!calendarEl) return;

            let content = `
                <div class="calendar-container">
                    <div class="text-center"><h2>奇门遁甲</h2></div>
                    <div class="calendar-header"></div>
                    <div class="calendar-grid"></div>
                </div>
                <div class="event-details-panel">
                    <h4>活动详情</h4>
                    <p>点击一个高亮的日期查看活动信息。</p>
                </div>
            `;
            calendarEl.innerHTML = content;

            const grid = calendarEl.querySelector('.calendar-grid');
            const header = calendarEl.querySelector('.calendar-header');
            const detailsPanel = calendarEl.querySelector('.event-details-panel');

            const month = calendarData.month - 1; // JS months are 0-indexed
            const year = calendarData.year;
            const today = new Date();

            const firstDay = new Date(year, month, 1);
            const daysInMonth = new Date(year, month + 1, 0).getDate();
            const startDay = firstDay.getDay();

            header.innerHTML = `<h3>${firstDay.toLocaleString('zh-CN', { month: 'long', year: 'numeric' })}</h3>`;

            const dayHeaders = ['日', '一', '二', '三', '四', '五', '六'];
            dayHeaders.forEach(day => {
                grid.innerHTML += `<div class="calendar-cell day-header">${day}</div>`;
            });

            for (let i = 0; i < startDay; i++) {
                grid.innerHTML += `<div class="calendar-cell"></div>`;
            }

            for (let i = 1; i <= daysInMonth; i++) {
                const day = new Date(year, month, i);
                let classes = 'date-cell';
                if (i === today.getDate() && month === today.getMonth() && year === today.getFullYear()) {
                    classes += ' today';
                }
                const event = calendarData.events.find(e => e.day === i);
                if (event) {
                    classes += ' has-event';
                }
                grid.innerHTML += `<div class="${classes}" data-day="${i}">${i}</div>`;
            }

            grid.addEventListener('click', function(e){
                const target = e.target;
                if (!target.classList.contains('has-event')) return;

                const day = parseInt(target.dataset.day);
                const event = calendarData.events.find(e => e.day === day);
                
                const previouslySelected = grid.querySelector('.selected');
                if (previouslySelected) {
                    previouslySelected.classList.remove('selected');
                }
                
                if (detailsPanel.classList.contains('active') && previouslySelected === target) {
                    detailsPanel.classList.remove('active');
                } else {
                    target.classList.add('selected');
                    const panelContent = `
                        <h4>${event.title}</h4>
                        <p>${event.description}</p>
                    `;
                    detailsPanel.innerHTML = panelContent;
                    detailsPanel.classList.add('active');
                }
            });
        }

        // Module 6: User Comments ("畅所欲言")
        function initUserComments(commentsData) {
            const commentsEl = document.getElementById('user-comments');
            if (!commentsEl) return;
            
            let content = `
                <div class="text-center"><h2>畅所欲言</h2></div>
                <form class="comment-form mb-4">
                    <div class="mb-3">
                        <textarea class="form-control" id="comment-input" placeholder="分享您的见解..." required></textarea>
                    </div>
                    <button type="submit" class="btn btn-primary">发表留言</button>
                </form>
                <ul class="comments-list"></ul>
            `;
            commentsEl.innerHTML = content;

            const commentsList = commentsEl.querySelector('.comments-list');
            const commentForm = commentsEl.querySelector('.comment-form');
            const commentInput = commentsEl.querySelector('#comment-input');

            function renderComment(comment) {
                 return `
                    <li class="comment-item">
                        <img src="${comment.avatar}" alt="${comment.author}" class="comment-avatar">
                        <div class="comment-body">
                            <div class="comment-header">
                                <span class="comment-author">${comment.author}</span>
                                <span class="comment-timestamp">${comment.timestamp}</span>
                            </div>
                            <p class="comment-text">${comment.text}</p>
                        </div>
                    </li>
                `;
            }

            // Render initial comments from JSON
            if (commentsData && commentsData.length > 0) {
                commentsData.forEach(comment => {
                    commentsList.innerHTML += renderComment(comment);
                });
            }

            // Handle new comment submission
            commentForm.addEventListener('submit', function(e) {
                e.preventDefault();
                const text = commentInput.value.trim();
                if (text === '') return;

                const newComment = {
                    author: "访客",
                    avatar: "https://i.pravatar.cc/150?u=guest" + Date.now(),
                    timestamp: "刚刚",
                    text: text
                };

                const newCommentHTML = renderComment(newComment);
                commentsList.insertAdjacentHTML('afterbegin', newCommentHTML);
                
                commentInput.value = '';
            });
        }

        initModules();

    });

})(); 