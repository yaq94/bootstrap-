document.addEventListener('DOMContentLoaded', function() {

    // 激活当前页面的导航链接
    // 确保只在有导航栏的页面执行
    if (document.getElementById('navbarNav')) {
        // 根据当前页面URL设置导航栏的激活状态
        const currentPage = window.location.pathname.split("/").pop();
        const navLinks = {
            "index.html": "nav-index",
            "intro.html": "nav-intro",
            "deities.html": "nav-deities",
            "cases.html": "nav-cases",
            "divination.html": "nav-divination",
            "books.html": "nav-books",
            "community.html": "nav-community",
        };
        const activeNavLinkId = navLinks[currentPage] || 'nav-index';
        const activeNavLink = document.getElementById(activeNavLinkId);
        if (activeNavLink) {
            activeNavLink.classList.add('active');
            activeNavLink.setAttribute('aria-current', 'page');
        }
    }

    // 导航栏滚动隐藏功能 (仅在非排盘页执行)
    if (!document.getElementById('divination-container')) {
        let lastScrollTop = 0;
        const header = document.querySelector('header');
        if (header) {
            window.addEventListener('scroll', function() {
                let scrollTop = window.pageYOffset || document.documentElement.scrollTop;
                if (scrollTop > lastScrollTop && scrollTop > header.offsetHeight) {
                    // 向下滚动
                    header.classList.add('navbar-hidden');
                } else {
                    // 向上滚动
                    header.classList.remove('navbar-hidden');
                }
                lastScrollTop = scrollTop <= 0 ? 0 : scrollTop; // For Mobile or negative scrolling
            }, false);
        }
    }
});