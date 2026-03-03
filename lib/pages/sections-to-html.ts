import type { Section } from "./types";

/** Base path for assets (CSS, images). Match the consumer site, e.g. "" or "assets/" */
const ASSETS_BASE = "assets";

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function headTemplate(title: string): string {
  return `<!DOCTYPE html>
<html lang="en" dir="ltr">
  <head>
    <meta charset="UTF-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(title)}</title>
    <link rel="icon" type="image/x-icon" sizes="20x20" href="${ASSETS_BASE}/images/logo/favicon.ico" />
    <link rel="stylesheet" type="text/css" href="${ASSETS_BASE}/css/bootstrap-5.3.0.min.css" />
    <link rel="stylesheet" type="text/css" href="${ASSETS_BASE}/css/remixicon.css" />
    <link rel="stylesheet" type="text/css" href="${ASSETS_BASE}/css/plugin.css" />
    <link rel="stylesheet" type="text/css" href="${ASSETS_BASE}/css/main-style.css" />
    <link rel="stylesheet" href="${ASSETS_BASE}/css/style.css" />
    <link rel="stylesheet" href="${ASSETS_BASE}/css/about.css" />
  </head>
  <body>`;
}

function headerTemplate(): string {
  return `    <header>
      <div class="header-area">
        <div class="main-header header-sticky bg-orange">
          <div class="container">
            <div class="row">
              <div class="col-lg-12">
                <div class="menu-wrapper d-flex align-items-center justify-content-between">
                  <div class="header-left d-flex align-items-center justify-content-between">
                    <div class="logo logo-large light-logo">
                      <a href="index.html"><img src="${ASSETS_BASE}/images/logo/Rectangle 2.png" alt="logo" class="logo-img" /></a>
                    </div>
                    <div class="logo logo-mobile light-logo">
                      <a href="index.html"><img src="${ASSETS_BASE}/images/logo/Rectangle 2.png" alt="logo" class="logo-img" /></a>
                    </div>
                  </div>
                  <div class="main-menu d-none d-lg-block">
                    <nav>
                      <ul class="listing" id="navigation">
                        <li class="single-list"><a href="index.html" class="single navbar-links">Home</a></li>
                        <li class="single-list"><a href="about.html" class="single navbar-links">About Us</a></li>
                        <li class="single-list"><a href="approach.html" class="single navbar-links">Our Approach</a></li>
                        <li class="single-list"><a href="events.html" class="single navbar-links">Events</a></li>
                        <li class="single-list"><a href="contact-us.html" class="single navbar-links">Contacts</a></li>
                      </ul>
                    </nav>
                  </div>
                  <div class="header-right">
                    <div class="cart">
                      <a href="donation.html" class="navbar-btn" style="border-radius: 10px">Donation <i class="ri-arrow-right-line"></i></a>
                    </div>
                  </div>
                </div>
                <div class="div">
                  <div class="mobile_menu d-block d-lg-none"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>`;
}

function breadcrumbTemplate(pageTitle: string): string {
  const title = escapeHtml(pageTitle || "Page");
  return `    <main>
      <section class="breadcrumb-section breadcrumb-bg">
        <div class="container">
          <div class="breadcrumb-text">
            <nav aria-label="breadcrumb" class="breadcrumb-nav wow fadeInUp" data-wow-delay="0.0s">
              <ul class="breadcrumb listing">
                <li class="breadcrumb-item single-list"><a href="index.html" class="single">Home</a></li>
                <li class="breadcrumb-item single-list" aria-current="page"><a href="javascript:void(0)" class="single">${title}</a></li>
              </ul>
            </nav>
            <h1 class="title wow fadeInUp" data-wow-delay="0.1s">${title}</h1>
          </div>
        </div>
      </section>`;
}

function footerTemplate(): string {
  return `    <footer>
      <div class="footer-wrapper footer-bg-one">
        <div class="container">
          <div class="footer-menu">
            <div class="col-lg-12">
              <div class="menu-wrapper d-flex align-items-center justify-content-between">
                <div class="header-left d-flex align-items-center justify-content-between">
                  <div class="logo">
                    <a href="index.html"><img src="${ASSETS_BASE}/images/logo/Rectangle 2.png" alt="logo" /></a>
                  </div>
                </div>
                <div class="main-menu d-none d-lg-block">
                  <nav>
                    <ul class="listing" id="navigation2">
                      <li class="single-list"><a href="index.html" class="single">Home</a></li>
                      <li class="single-list"><a href="about.html" class="single">About Us</a></li>
                      <li class="single-list"><a href="approach.html" class="single">Our Approach</a></li>
                      <li class="single-list"><a href="events.html" class="single">Events</a></li>
                      <li class="single-list"><a href="contact-us.html" class="single">Contacts</a></li>
                    </ul>
                  </nav>
                </div>
                <ul class="cart">
                  <li class="cart-list"><a href="donation.html" class="donate-btn" style="background-color: #fff; color: black">Donate</a></li>
                </ul>
              </div>
            </div>
          </div>
          <hr class="footer-line" />
        </div>
        <div class="footer-bottom-area">
          <div class="container">
            <div class="footer-border">
              <div class="row">
                <div class="col-xl-12">
                  <div class="footer-copy-right text-center">
                    <p class="pera">Copyright © End FGM/C Network Africa. All rights reserved.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  </body>
</html>`;
}

/**
 * Convert sections + media URL map into full HTML document.
 * Uses the same structure and class names as the End FGM Africa about page
 * so existing CSS (Bootstrap, main-style, style, about.css) applies.
 */
export function sectionsToHtml(
  sections: Section[],
  mediaUrls: Record<number, string>,
  pageTitle?: string | null
): string {
  const title = pageTitle?.trim() || "Page";
  const parts: string[] = [];

  for (const section of sections) {
    if (section.type === "heading") {
      const tag = `h${section.level}`;
      const titleClass = section.level === 1 ? "title font-700" : "title font-700 pb-15";
      parts.push(
        `      <section class="about-area">
        <div class="container">
          <div class="row">
            <div class="col-lg-12">
              <div class="section-tittle mb-35">
                <${tag} class="${titleClass}">${escapeHtml(section.text)}</${tag}>
              </div>
            </div>
          </div>
        </div>
      </section>`
      );
    } else if (section.type === "paragraph") {
      parts.push(
        `      <section class="about-area">
        <div class="container">
          <div class="row">
            <div class="col-lg-12">
              <div class="section-tittle">
                <div class="pera-subtitle mb-15">${section.content}</div>
              </div>
            </div>
          </div>
        </div>
      </section>`
      );
    } else if (section.type === "image") {
      const url = mediaUrls[section.media_id];
      const alt = section.alt ? escapeHtml(section.alt) : "";
      if (url) {
        const caption = section.caption
          ? `<p class="pera mt-15">${escapeHtml(section.caption)}</p>`
          : "";
        parts.push(
          `      <section class="about-area">
        <div class="container">
          <div class="row justify-content-center">
            <div class="col-lg-10">
              <img class="w-100 d-block" src="${escapeHtml(url)}" alt="${alt}" />
              ${caption}
            </div>
          </div>
        </div>
      </section>`
        );
      }
    } else if (section.type === "columns") {
      const colClass = section.columns.length === 3 ? "col-lg-4" : "col-lg-6";
      const cols = section.columns
        .map(
          (c) =>
            `            <div class="${colClass} my-auto">
              <div class="section-tittle">
                <div class="pera-subtitle">${c}</div>
              </div>
            </div>`
        )
        .join("\n");
      parts.push(
        `      <section class="about-area">
        <div class="container">
          <div class="row justify-content-between gy-24">
${cols}
          </div>
        </div>
      </section>`
      );
    } else if (section.type === "html") {
      parts.push(
        `      <section class="about-area">
        <div class="container">
          <div class="row">
            <div class="col-lg-12">
              ${section.content}
            </div>
          </div>
        </div>
      </section>`
      );
    }
  }

  const mainContent = parts.join("\n");
  return (
    headTemplate(title) +
    "\n" +
    headerTemplate() +
    "\n" +
    breadcrumbTemplate(title) +
    "\n" +
    mainContent +
    "\n    </main>\n" +
    footerTemplate()
  );
}
