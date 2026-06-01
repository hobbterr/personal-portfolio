import React, { useEffect, useMemo, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { createPortal } from "react-dom";
import { ArrowLeft, ArrowRight, Grid2X2, Mail, Menu, MessageCircle, Sparkle, X } from "lucide-react";
import { works } from "./works";
import "./styles.css";

const categoryMap = {
  branding: "品牌视觉",
  event: "活动视觉"
};

function App() {
  const [page, setPage] = useState("home");
  const [category, setCategory] = useState("branding");
  const [brandFilter, setBrandFilter] = useState("全部");
  const [activeWork, setActiveWork] = useState(null);
  const [showreelOpen, setShowreelOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handlePopState = (event) => {
      setActiveWork(null);
      setShowreelOpen(false);
      setMenuOpen(false);
      if (event.state?.portfolioPage === "category") {
        setPage("category");
        setCategory(event.state.category ?? "branding");
        setBrandFilter(event.state.brandFilter ?? "全部");
        return;
      }
      setPage("home");
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const categoryWorks = useMemo(() => {
    const typedWorks = works.filter((work) => work.category === category);
    if (brandFilter === "全部") return typedWorks;
    return typedWorks.filter((work) => work.brand === brandFilter);
  }, [category, brandFilter]);

  const categoryBrands = useMemo(() => {
    const typedWorks = works.filter((work) => work.category === category);
    return ["全部", ...Array.from(new Set(typedWorks.map((work) => work.brand)))];
  }, [category]);

  function openCategory(nextCategory) {
    setCategory(nextCategory);
    setBrandFilter("全部");
    setPage("category");
    setMenuOpen(false);
    window.history.pushState(
      { portfolioPage: "category", category: nextCategory, brandFilter: "全部" },
      "",
      "#works"
    );
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function openHome() {
    setPage("home");
    setMenuOpen(false);
    window.history.replaceState({ portfolioPage: "home" }, "", window.location.pathname);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function openWork(work) {
    setActiveWork(work);
    window.history.pushState(
      {
        portfolioOverlay: "work",
        returnPage: page,
        category,
        brandFilter
      },
      "",
      window.location.href
    );
  }

  function closeWork() {
    if (window.history.state?.portfolioOverlay === "work") {
      window.history.back();
      return;
    }
    setActiveWork(null);
  }

  function openShowreel() {
    setShowreelOpen(true);
    window.history.pushState({ portfolioOverlay: "showreel" }, "", window.location.href);
  }

  function closeShowreel() {
    if (window.history.state?.portfolioOverlay === "showreel") {
      window.history.back();
      return;
    }
    setShowreelOpen(false);
  }

  return (
    <main className={`site-shell ${menuOpen ? "menu-open" : ""}`}>
      {page === "home" ? (
        <HomePage
          onOpenCategory={openCategory}
          onOpenWork={openWork}
          onOpenShowreel={openShowreel}
          onToggleMenu={() => setMenuOpen((open) => !open)}
        />
      ) : (
        <CategoryPage
          category={category}
          works={categoryWorks}
          brands={categoryBrands}
          brandFilter={brandFilter}
          onBack={() => setPage("home")}
          onToggleMenu={() => setMenuOpen((open) => !open)}
          onBrandChange={setBrandFilter}
          onOpenWork={openWork}
        />
      )}
      {menuOpen && <SiteMenu onHome={openHome} onCategory={openCategory} onClose={() => setMenuOpen(false)} />}
      {activeWork && <Preview work={activeWork} onClose={closeWork} />}
      {showreelOpen && <ShowreelPreview onClose={closeShowreel} />}
    </main>
  );
}

function HomePage({ onOpenCategory, onOpenWork, onOpenShowreel, onToggleMenu }) {
  const featuredWorks = works.filter((work) => work.featured).slice(0, 4);

  return (
    <>
      <Hero onOpenShowreel={onOpenShowreel} onToggleMenu={onToggleMenu} />
      <About />
      <Categories onOpenCategory={onOpenCategory} />
      <FeaturedWorks works={featuredWorks} onOpenWork={onOpenWork} />
      <Contact />
    </>
  );
}

function Hero({ onOpenShowreel, onToggleMenu }) {
  const showreelRef = useRef(null);
  const showreelSrc = "/media/2025-showreel.mp4";

  useEffect(() => {
    const video = showreelRef.current;
    if (!video) return;
    video.muted = true;
    video.defaultMuted = true;
    video.setAttribute("muted", "");
    video.load();
    video.play().catch(() => {
      // 浏览器偶尔会拦截自动播放，保持静默失败，用户滚动后仍可继续浏览页面。
    });
  }, []);

  return (
    <section className="hero-section">
      <nav className="hero-nav" aria-label="页面导航">
        <a className="logo-mark" href="#top" aria-label="回到首页">
          Hi, I'm 糊涂夹子
        </a>
        <button className="menu-button" type="button" aria-label="打开菜单" onClick={onToggleMenu}>
          <Menu size={23} />
        </button>
      </nav>

      <div className="hero-copy" id="top">
        <div className="hero-label">
          <span className="target-icon" />
          <p>VISUAL DESIGN<br />PORTFOLIO</p>
        </div>
        <h1>视觉设计<br />作品集</h1>
      </div>

      <div className="hero-showreel" aria-label="2025 Showreel 视频预览">
        <video
          ref={showreelRef}
          muted
          defaultMuted
          loop
          autoPlay
          playsInline
          preload="metadata"
        >
          <source src={withH264Fallback(showreelSrc)} type="video/mp4" />
          <source src={showreelSrc} type="video/mp4" />
        </video>
        <button className="showreel-badge" type="button" onClick={onOpenShowreel}>
          2025 SHOWREEL
        </button>
      </div>
    </section>
  );
}

function About() {
  return (
    <section className="about-section">
      <SectionTitle title="个人介绍" ghost="ABOUT" />
      <div className="about-panel">
        <p>
          我是一名专注品牌视觉与活动视觉的视觉设计师。我关注品牌与活动在第一眼中的视觉记忆：主视觉、传播物料、社交媒体图形、线下活动画面与整套视觉延展。
        </p>
        <div className="about-tags">
          <span>品牌主视觉</span>
          <span>活动视觉</span>
          <span>海报延展</span>
          <span>社媒物料</span>
        </div>
      </div>
    </section>
  );
}

function Categories({ onOpenCategory }) {
  return (
    <section className="category-section">
      <SectionTitle title="作品分类" ghost="CATEGORY" />
      <div className="category-list">
        <button type="button" className="category-card" onClick={() => onOpenCategory("branding")}>
          <img src="/works/category-branding.svg" alt="" />
          <span>
            <b>品牌视觉</b>
            <small>BRANDING</small>
          </span>
          <i><ArrowRight size={22} /></i>
        </button>
        <button type="button" className="category-card" onClick={() => onOpenCategory("event")}>
          <img src="/works/category-event.svg" alt="" />
          <span>
            <b>活动视觉</b>
            <small>EVENT VISUAL</small>
          </span>
          <i><ArrowRight size={22} /></i>
        </button>
      </div>
    </section>
  );
}

function FeaturedWorks({ works, onOpenWork }) {
  return (
    <section className="featured-section" id="works">
      <SectionTitle title="精选作品" ghost="SELECTED" />
      <MasonryGrid
        works={works}
        renderWork={(work) => <WorkThumb key={work.id} work={work} onClick={() => onOpenWork(work)} compact />}
      />
    </section>
  );
}

function CategoryPage({ category, works, brands, brandFilter, onBack, onToggleMenu, onBrandChange, onOpenWork }) {
  return (
    <section className="category-page">
      <header className="category-topbar">
        <button type="button" onClick={onBack} aria-label="返回首页">
          <ArrowLeft size={22} />
        </button>
        <h1>{categoryMap[category]}<Sparkle size={18} /></h1>
        <button type="button" aria-label="打开菜单" onClick={onToggleMenu}>
          <Menu size={22} />
        </button>
      </header>

      <div className="brand-tabs" aria-label="品牌筛选">
        {brands.map((item) => (
          <button
            type="button"
            className={item === brandFilter ? "active" : ""}
            key={item}
            onClick={() => onBrandChange(item)}
          >
            {item}
          </button>
        ))}
        <Grid2X2 size={19} />
      </div>

      <MasonryGrid
        works={works}
        renderWork={(work) => <WorkCard key={work.id} work={work} onClick={() => onOpenWork(work)} />}
      />
    </section>
  );
}

function MasonryGrid({ works, renderWork }) {
  const columnCount = useResponsiveColumnCount();
  const columns = useMemo(() => {
    const nextColumns = Array.from({ length: columnCount }, () => []);
    works.forEach((work, index) => {
      nextColumns[index % columnCount].push(work);
    });
    return nextColumns;
  }, [works, columnCount]);

  return (
    <div className="masonry-grid">
      {columns.map((column, index) => (
        <div className="masonry-column" key={index}>
          {column.map(renderWork)}
        </div>
      ))}
    </div>
  );
}

function useResponsiveColumnCount() {
  const getColumnCount = () => (window.innerWidth >= 760 ? 4 : 2);
  const [columnCount, setColumnCount] = useState(getColumnCount);

  useEffect(() => {
    const onResize = () => setColumnCount(getColumnCount());
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return columnCount;
}

function WorkThumb({ work, onClick, compact = false }) {
  return (
    <button className={compact ? "work-thumb compact" : "work-thumb"} type="button" onClick={onClick}>
      <MediaAsset work={work} />
      <span>
        <b>{work.title}</b>
        <small>{work.brand} · {work.type}</small>
      </span>
    </button>
  );
}

function WorkCard({ work, onClick }) {
  return (
    <button className="work-card" type="button" onClick={onClick}>
      <MediaAsset work={work} />
      <span>
        <b>{work.title}</b>
        <small>{work.brand} · {work.type}</small>
      </span>
    </button>
  );
}

function MediaAsset({ work }) {
  if (work.mediaType === "video") {
    if (work.poster) {
      return <img className="video-poster-image" src={work.poster} alt={work.title} loading="lazy" />;
    }

    return <span className="video-poster" aria-label={work.title}><span>{work.brand}</span></span>;
  }

  return <img src={work.cover} alt={work.title} loading="lazy" />;
}

function withH264Fallback(src) {
  return src.replace(/\.mp4$/i, "-h264.mp4");
}

function Contact() {
  return (
    <footer className="contact-section">
      <SectionTitle title="联系方式" ghost="CONTACT" />
      <div className="contact-panel">
        <span>微信：Flower__travel</span>
        <a href="https://www.xiaohongshu.com/user/profile/5c9560bc000000001202fcc3">小红书</a>
        <a href="https://www.behance.net/yan1989">Behance</a>
      </div>
    </footer>
  );
}

function SectionTitle({ title, ghost }) {
  return (
    <div className="section-title">
      <h2>{title}<span /></h2>
      <p>{ghost}</p>
    </div>
  );
}

function Preview({ work, onClose }) {
  const media = work.images?.length ? work.images : [work.cover];
  const previewVideoRef = useRef(null);

  useEffect(() => {
    if (work.mediaType !== "video") return;
    const video = previewVideoRef.current;
    if (!video) return;
    video.muted = false;
    video.volume = 1;
    video.play().catch(() => {
      // 如果浏览器阻止有声自动播放，用户仍可点击播放器播放。
    });
  }, [work.mediaType]);

  return (
    <div className="preview-layer" role="dialog" aria-modal="true" onClick={onClose}>
      <div className="preview-panel" onClick={(event) => event.stopPropagation()}>
        <p>{work.brand} · {work.type}</p>
        <h3>{work.title}</h3>
        <div className="preview-images">
          {media.map((item) => (
            work.mediaType === "video" ? (
              <video key={item} ref={previewVideoRef} controls playsInline autoPlay loop preload="auto">
                <source src={withH264Fallback(item)} type="video/mp4" />
                <source src={item} type="video/mp4" />
              </video>
            ) : (
              <img src={item} alt={work.title} key={item} />
            )
          ))}
        </div>
      </div>
    </div>
  );
}

function ShowreelPreview({ onClose }) {
  const videoRef = useRef(null);
  const src = "/media/2025-showreel.mp4";

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = false;
    video.volume = 1;
    video.play().catch(() => {});
  }, []);

  return (
    <div className="preview-layer showreel-layer" role="dialog" aria-modal="true" onClick={onClose}>
      <div className="showreel-player" onClick={(event) => event.stopPropagation()}>
        <video ref={videoRef} controls playsInline autoPlay loop preload="auto">
          <source src={withH264Fallback(src)} type="video/mp4" />
          <source src={src} type="video/mp4" />
        </video>
      </div>
    </div>
  );
}

function SiteMenu({ onHome, onCategory, onClose }) {
  return createPortal(
    <div className="site-menu-layer" role="dialog" aria-modal="true" onClick={onClose}>
      <nav className="site-menu" aria-label="主菜单" onClick={(event) => event.stopPropagation()}>
        <button type="button" onClick={onHome}>首页</button>
        <button type="button" onClick={() => onCategory("branding")}>品牌视觉</button>
        <button type="button" onClick={() => onCategory("event")}>活动视觉</button>
      </nav>
    </div>,
    document.body
  );
}

function BottomDock() {
  return (
    <div className="bottom-dock" aria-label="快捷联系">
      <a href="mailto:yourname@example.com" aria-label="发送邮件"><Mail size={24} /></a>
      <a className="dock-primary" href="#works" aria-label="查看作品"><Sparkle size={25} /></a>
      <a href="#" aria-label="微信联系"><MessageCircle size={24} /></a>
    </div>
  );
}

createRoot(document.getElementById("root")).render(<App />);
