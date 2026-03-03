import type { PageFormData, AboutPerson, AboutSocial } from "./form-types";

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Build full HTML (head + body) from form data for the "about" template.
 * baseUrl is used for image URLs (e.g. baseUrl + "/api/media/1").
 */
export function buildHtmlFromFormData(data: PageFormData, baseUrl: string): string {
  const img = (id: number | null) =>
    id ? `${baseUrl}/api/media/${id}` : "";
  const personCards = (data.people ?? [])
    .map(
      (p: AboutPerson) => `
            <div class="col-xl-4 col-lg-6 col-md-6 col-sm-12 view-wrapper">
              <div class="single-team h-calc wow fadeInUp" data-wow-delay="0.0s">
                <div class="team-img">
                  <img src="${p.image_id ? img(p.image_id) : "assets/images/gallery/placeholder.png"}" class="img-fluid w-100" alt="${esc(p.name || "Team member")}" />
                </div>
                <div class="team-info">
                  <div class="d-flex justify-content-between align-items-center">
                    <div class="team-info-title mb-8">
                      <div class="d-flex gap-40 align-items-center">
                        <div class="content">
                          <h4 class="title text-capitalize">${esc(p.name || "")}</h4>
                          <p>${esc(p.bio || "")}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>`
    )
    .join("\n");

  const objectivesList = (data.objectives ?? [])
    .filter(Boolean)
    .map((o) => `<li>${esc(o)}</li>`)
    .join("\n");

  const socialsHtml = (data.socials ?? [])
    .filter((s: AboutSocial) => s.url)
    .map(
      (s) =>
        `<a href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">${esc(s.platform || "Link")}</a>`
    )
    .join("\n");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${esc(data.title || "About")} – End FGM/C Network Africa</title>
  <link rel="stylesheet" href="assets/css/bootstrap-5.3.0.min.css" />
  <link rel="stylesheet" href="assets/css/remixicon.css" />
  <link rel="stylesheet" href="assets/css/main-style.css" />
  <link rel="stylesheet" href="assets/css/about.css" />
</head>
<body>
  <header>
    <div class="header-area">
      <div class="main-header header-sticky bg-orange">
        <div class="container">
          <div class="row">
            <div class="col-lg-12">
              <div class="menu-wrapper d-flex align-items-center justify-content-between">
                <div class="header-left d-flex align-items-center">
                  <div class="logo logo-large light-logo">
                    <a href="index.html"><img src="assets/images/logo/Rectangle 2.png" alt="logo" class="logo-img" /></a>
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
                  <a href="donation.html" class="navbar-btn" style="border-radius: 10px">Donation <i class="ri-arrow-right-line"></i></a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </header>
  <main>
    <section class="breadcrumb-section breadcrumb-bg">
      <div class="container">
        <div class="breadcrumb-text">
          <nav aria-label="breadcrumb" class="breadcrumb-nav">
            <ul class="breadcrumb listing">
              <li class="breadcrumb-item single-list"><a href="index.html" class="single">Home</a></li>
              <li class="breadcrumb-item single-list" aria-current="page"><span class="single">${esc(data.title || "About Us")}</span></li>
            </ul>
          </nav>
          <h1 class="title">${esc(data.title || "About Us")}</h1>
        </div>
      </div>
    </section>

    <section class="about-area">
      <div class="container">
        <div class="row justify-content-between">
          <div class="col-lg-6 my-auto">
            <div class="section-tittle mb-35">
              <span class="sub-tittle text-capitalize font-600">About us</span>
              <h2 class="title font-700 pb-15" id="about-title">${esc(data.title || "About")}</h2>
              <p class="pera-subtitle mb-15" id="about-description">${esc(data.description || "")}</p>
            </div>
          </div>
          <div class="col-lg-5">
            <img class="w-100 d-none d-lg-block" src="assets/images/gallery/hijab woman.png" alt="About" />
          </div>
        </div>
      </div>
    </section>

    <section class="helpful-area margin-b">
      <div class="container">
        <div class="row gy-24">
          <div class="col-xl-3 col-md-6 col-lg-6">
            <div class="helpful-card h-calc bg-hover align-center">
              <div class="helpful-card-caption">
                <h4 class="caption-title">Our Mission</h4>
                <p class="caption-para text-hover" id="about-mission">${esc(data.mission || "")}</p>
              </div>
            </div>
          </div>
          <div class="col-xl-3 col-md-6 col-lg-6">
            <div class="helpful-card h-calc bg-hover align-center">
              <div class="helpful-card-caption">
                <h4 class="caption-title">Our Vision</h4>
                <p class="caption-para text-hover" id="about-vision">${esc(data.vision || "")}</p>
              </div>
            </div>
          </div>
          <div class="col-xl-3 col-md-6 col-lg-6">
            <div class="helpful-card h-calc bg-hover align-center">
              <div class="helpful-card-caption">
                <h4 class="caption-title">Policies</h4>
                <p class="caption-para text-hover" id="about-policies">${esc(data.policies || "")}</p>
              </div>
            </div>
          </div>
          <div class="col-xl-3 col-md-6 col-lg-6">
            <div class="helpful-card h-calc bg-hover align-center">
              <div class="helpful-card-caption">
                <h4 class="caption-title">Education</h4>
                <p class="caption-para text-hover" id="about-education">${esc(data.education || "")}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="Objectives">
      <div class="obj-box">
        <h1>Objectives</h1>
        <ul id="about-objectives-list">${objectivesList || "<li>—</li>"}</ul>
      </div>
    </section>

    <section class="Background">
      <div class="background-container">
        <div class="background-content">
          <div class="background-row1">
            <h1>Background</h1>
            <p id="about-background">${esc(data.background || "")}</p>
          </div>
          <div class="background-row2">
            <img src="assets/images/gallery/background-img.png" alt="Background" />
          </div>
        </div>
      </div>
    </section>

    <section class="team-section">
      <div class="container">
        <div class="row justify-content-center">
          <div class="col-xl-7">
            <div class="section-tittle text-center mb-50">
              <h2 class="title font-700">Meet the Co-Hosts &amp; Network Coordinator</h2>
            </div>
          </div>
        </div>
        <div class="row gy-24" id="about-people-row">${personCards || ""}</div>
      </div>
    </section>

    <section class="contact-us">
      <div class="contact-us-container">
        <div class="contact-img">
          <img src="assets/images/gallery/Screenshot 2024-08-12 004444 1.png" alt="Contact" />
        </div>
        <div class="contact-box">
          <h1>Contact us</h1>
          <p><b>E-mail:</b> <a class="single" href="contact-us.html">Contact Us</a></p>
          <p>Follow our hashtag <span style="color: #00715d">#FGMCAFRICA</span> on social media</p>
          <div class="socials-box" id="about-socials">${socialsHtml || ""}</div>
        </div>
      </div>
    </section>
  </main>
  <footer>
    <div class="footer-wrapper footer-bg-one">
      <div class="container">
        <div class="footer-copy-right text-center">
          <p class="pera">Copyright © ${new Date().getFullYear()} End FGM/C Network Africa. All rights reserved.</p>
        </div>
      </div>
    </div>
  </footer>
  <script src="assets/js/jquery-3.7.0.min.js"></script>
  <script src="assets/js/bootstrap-5.3.0.min.js"></script>
  <script src="assets/js/main.js"></script>
</body>
</html>`;
}
