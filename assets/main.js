(() => {
  const body = document.body;
  const root = document.documentElement;
  const navToggle = document.querySelector("[data-nav-toggle]");
  const navLinks = document.querySelectorAll(".nav-links a");

  const closeNav = () => {
    body.classList.remove("nav-open");
    if (navToggle) {
      navToggle.setAttribute("aria-expanded", "false");
    }
  };

  if (navToggle) {
    navToggle.addEventListener("click", () => {
      const isOpen = body.classList.toggle("nav-open");
      navToggle.setAttribute("aria-expanded", String(isOpen));
    });
  }

  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      closeNav();
    });
  });

  const themeToggle = document.querySelector("[data-theme-toggle]");
  const storedTheme = localStorage.getItem("theme");
  const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;

  if (storedTheme) {
    root.setAttribute("data-theme", storedTheme);
  } else if (prefersDark) {
    root.setAttribute("data-theme", "dark");
  }

  const updateThemeLabel = () => {
    if (!themeToggle) {
      return;
    }
    const currentTheme = root.getAttribute("data-theme") || "light";
    themeToggle.textContent = currentTheme === "dark" ? "Light mode" : "Dark mode";
  };

  updateThemeLabel();

  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      const currentTheme = root.getAttribute("data-theme") || (prefersDark ? "dark" : "light");
      const nextTheme = currentTheme === "dark" ? "light" : "dark";
      root.setAttribute("data-theme", nextTheme);
      localStorage.setItem("theme", nextTheme);
      updateThemeLabel();
    });
  }

  const progressBar = document.querySelector(".scroll-progress__bar");
  let progressTicking = false;

  const updateProgress = () => {
    if (!progressBar) {
      return;
    }
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
    progressBar.style.width = `${progress}%`;
  };

  const onProgressScroll = () => {
    if (progressTicking) {
      return;
    }
    progressTicking = true;
    window.requestAnimationFrame(() => {
      updateProgress();
      progressTicking = false;
    });
  };

  if (progressBar) {
    updateProgress();
    window.addEventListener("scroll", onProgressScroll, { passive: true });
    window.addEventListener("resize", updateProgress);
  }

  const createExternalLink = (url, label) => {
    const link = document.createElement("a");
    link.href = url;
    link.textContent = label;
    if (url.startsWith("http")) {
      link.target = "_blank";
      link.rel = "noreferrer";
    }
    return link;
  };

  const highlightAuthor = (authors) => {
    const nameVariants = [
      "Y Zhang",
      "Yiqin Zhang",
      "Zhang, Y\\."
    ];
    const chineseVariants = [
      "张逸勤"
    ];
    const latinPattern = new RegExp(`\\b(${nameVariants.join("|")})\\b`, "g");
    const chinesePattern = new RegExp(`(${chineseVariants.join("|")})`, "g");
    return authors
      .replace(latinPattern, '<strong class="author-me">$1</strong>')
      .replace(chinesePattern, '<strong class="author-me">$1</strong>');
  };

  const renderHighlights = () => {
    const pubContainer = document.querySelector("[data-highlight=publications]");
    const talkContainer = document.querySelector("[data-highlight=talks]");

    if (pubContainer && Array.isArray(window.PUBLICATIONS)) {
      const pubs = window.PUBLICATIONS.filter((item) => item.featured);
      const selected = pubs.length ? pubs : window.PUBLICATIONS;
      pubContainer.innerHTML = "";
      selected.slice(0, 3).forEach((item) => {
        const wrapper = document.createElement("div");
        const link = document.createElement("a");
        link.href = `publications.html#${item.id}`;
        link.textContent = item.title;
        const meta = document.createElement("span");
        meta.textContent = `${item.year}`;
        wrapper.appendChild(link);
        wrapper.appendChild(document.createElement("br"));
        wrapper.appendChild(meta);
        pubContainer.appendChild(wrapper);
      });
    }

    if (talkContainer && Array.isArray(window.TALKS)) {
      const talks = window.TALKS.filter((item) => item.featured);
      const selected = talks.length ? talks : window.TALKS;
      talkContainer.innerHTML = "";
      selected.slice(0, 3).forEach((item) => {
        const wrapper = document.createElement("div");
        const link = document.createElement("a");
        link.href = `talks.html#${item.id}`;
        link.textContent = item.title;
        const meta = document.createElement("span");
        meta.textContent = `${item.type} | ${item.year}`;
        wrapper.appendChild(link);
        wrapper.appendChild(document.createElement("br"));
        wrapper.appendChild(meta);
        talkContainer.appendChild(wrapper);
      });
    }
  };

  const renderPublications = () => {
    const listEl = document.getElementById("pubList");
    if (!listEl || !Array.isArray(window.PUBLICATIONS)) {
      return;
    }

    const yearSelect = document.getElementById("pubYear");
    const typeSelect = document.getElementById("pubType");
    const searchInput = document.getElementById("pubSearch");
    const countEl = document.getElementById("pubCount");

    const typeOrder = [
      "Journal Articles",
      "Conference Papers",
      "Preprints",
      "Chinese Journals"
    ];

    const uniqueYears = Array.from(new Set(window.PUBLICATIONS.map((item) => item.year)))
      .sort((a, b) => b - a);

    if (yearSelect) {
      uniqueYears.forEach((year) => {
        const option = document.createElement("option");
        option.value = String(year);
        option.textContent = String(year);
        yearSelect.appendChild(option);
      });
    }

    const uniqueTypes = Array.from(new Set(window.PUBLICATIONS.map((item) => item.type)));
    if (typeSelect) {
      uniqueTypes.forEach((type) => {
        if (!typeOrder.includes(type)) {
          typeOrder.push(type);
        }
        const option = document.createElement("option");
        option.value = type;
        option.textContent = type;
        typeSelect.appendChild(option);
      });
    }

    const matchesSearch = (item, query) => {
      const haystack = `${item.title} ${item.authors} ${item.venue}`.toLowerCase();
      return haystack.includes(query);
    };

    const buildLinkRow = (links) => {
      const row = document.createElement("div");
      row.className = "link-row";
      const labels = {
        pdf: "PDF",
        doi: "DOI",
        code: "Code",
        data: "Data",
        blog: "Blog",
        talk: "Talk",
        codeData: "Code & Data"
      };

      if (!links) {
        return row;
      }

      Object.keys(labels).forEach((key) => {
        const value = links[key];
        if (value) {
          row.appendChild(createExternalLink(value, labels[key]));
        }
      });

      Object.keys(links).forEach((key) => {
        if (labels[key]) {
          return;
        }
        const value = links[key];
        if (!value) {
          return;
        }
        const label = key
          .replace(/([a-z])([A-Z])/g, "$1 $2")
          .replace(/_/g, " ")
          .replace(/\b\w/g, (match) => match.toUpperCase());
        row.appendChild(createExternalLink(value, label));
      });
      return row;
    };

    const render = () => {
      const yearValue = yearSelect ? yearSelect.value : "";
      const typeValue = typeSelect ? typeSelect.value : "";
      const query = searchInput ? searchInput.value.trim().toLowerCase() : "";

      const filtered = window.PUBLICATIONS.filter((item) => {
        if (yearValue && String(item.year) !== yearValue) {
          return false;
        }
        if (typeValue && item.type !== typeValue) {
          return false;
        }
        if (query && !matchesSearch(item, query)) {
          return false;
        }
        return true;
      });

      listEl.innerHTML = "";
      if (countEl) {
        countEl.textContent = `${filtered.length} result${filtered.length === 1 ? "" : "s"}`;
      }

      if (!filtered.length) {
        const empty = document.createElement("p");
        empty.className = "muted";
        empty.textContent = "No publications match the current filters.";
        listEl.appendChild(empty);
        return;
      }

      typeOrder.forEach((type) => {
        const items = filtered.filter((item) => item.type === type);
        if (!items.length) {
          return;
        }
        const group = document.createElement("section");
        group.className = "section";
        const heading = document.createElement("h2");
        heading.className = "section-title";
        heading.textContent = type;
        group.appendChild(heading);

        const list = document.createElement("div");
        list.className = "list";

        items.forEach((item) => {
          const article = document.createElement("article");
          article.className = "list-item pub-item";
          article.id = item.id;
          if (item.type === "Chinese Journals") {
            article.classList.add("pub-item--chinese");
          }

          const title = document.createElement("h3");
          title.textContent = item.title;

          const meta = document.createElement("p");
          meta.className = "muted";
          meta.innerHTML = `${highlightAuthor(item.authors)} | ${item.venue} (${item.year})`;

          const reference = document.createElement("p");
          reference.className = "pub-reference";
          if (item.reference) {
            reference.textContent = `Reference: ${item.reference}`;
          }

          article.appendChild(title);
          article.appendChild(meta);
          if (item.reference) {
            article.appendChild(reference);
          }
          const linksRow = buildLinkRow(item.links);
          if (linksRow.children.length) {
            article.appendChild(linksRow);
          }
          list.appendChild(article);
        });

        group.appendChild(list);
        listEl.appendChild(group);
      });
    };

    [yearSelect, typeSelect, searchInput].forEach((control) => {
      if (control) {
        control.addEventListener("input", render);
      }
    });

    render();
  };

  const renderTalks = () => {
    const listEl = document.getElementById("talkList");
    if (!listEl || !Array.isArray(window.TALKS)) {
      return;
    }

    const yearSelect = document.getElementById("talkYear");
    const typeSelect = document.getElementById("talkType");
    const tagSelect = document.getElementById("talkTag");
    const searchInput = document.getElementById("talkSearch");
    const countEl = document.getElementById("talkCount");

    const uniqueYears = Array.from(new Set(window.TALKS.map((item) => item.year)))
      .sort((a, b) => b - a);

    if (yearSelect) {
      uniqueYears.forEach((year) => {
        const option = document.createElement("option");
        option.value = String(year);
        option.textContent = String(year);
        yearSelect.appendChild(option);
      });
    }

    const uniqueTypes = Array.from(new Set(window.TALKS.map((item) => item.type)));
    if (typeSelect) {
      uniqueTypes.forEach((type) => {
        const option = document.createElement("option");
        option.value = type;
        option.textContent = type;
        typeSelect.appendChild(option);
      });
    }

    const uniqueTags = Array.from(
      new Set(window.TALKS.flatMap((item) => item.tags || []))
    ).sort();

    if (tagSelect) {
      uniqueTags.forEach((tag) => {
        const option = document.createElement("option");
        option.value = tag;
        option.textContent = tag;
        tagSelect.appendChild(option);
      });
    }

    const matchesSearch = (item, query) => {
      const haystack = `${item.title} ${item.venue} ${item.host} ${(item.summary || "")} ${(item.relatedPapers || []).join(" ")}`
        .toLowerCase();
      return haystack.includes(query);
    };

    const buildLinkRow = (links) => {
      const row = document.createElement("div");
      row.className = "link-row";
      const labels = {
        video: "Video",
        slides: "Slides",
        transcript: "Transcript",
        post: "Post",
        codeData: "Code & Data"
      };

      if (!links) {
        return row;
      }

      Object.keys(labels).forEach((key) => {
        const value = links[key];
        if (value) {
          row.appendChild(createExternalLink(value, labels[key]));
        }
      });

      Object.keys(links).forEach((key) => {
        if (labels[key]) {
          return;
        }
        const value = links[key];
        if (!value) {
          return;
        }
        const label = key
          .replace(/([a-z])([A-Z])/g, "$1 $2")
          .replace(/_/g, " ")
          .replace(/\b\w/g, (match) => match.toUpperCase());
        row.appendChild(createExternalLink(value, label));
      });
      return row;
    };

    const render = () => {
      const yearValue = yearSelect ? yearSelect.value : "";
      const typeValue = typeSelect ? typeSelect.value : "";
      const tagValue = tagSelect ? tagSelect.value : "";
      const query = searchInput ? searchInput.value.trim().toLowerCase() : "";

      const filtered = window.TALKS.filter((item) => {
        if (yearValue && String(item.year) !== yearValue) {
          return false;
        }
        if (typeValue && item.type !== typeValue) {
          return false;
        }
        if (tagValue && !(item.tags || []).includes(tagValue)) {
          return false;
        }
        if (query && !matchesSearch(item, query)) {
          return false;
        }
        return true;
      });

      listEl.innerHTML = "";
      if (countEl) {
        countEl.textContent = `${filtered.length} result${filtered.length === 1 ? "" : "s"}`;
      }

      if (!filtered.length) {
        const empty = document.createElement("p");
        empty.className = "muted";
        empty.textContent = "No talks or media items match the current filters.";
        listEl.appendChild(empty);
        return;
      }

      filtered
        .sort((a, b) => b.date.localeCompare(a.date))
        .forEach((item) => {
          const article = document.createElement("article");
          article.className = "list-item";
          article.id = item.id;

          const title = document.createElement("h3");
          title.textContent = item.title;

          const meta = document.createElement("p");
          meta.className = "muted";
          meta.textContent = `${item.type} | ${item.date} | ${item.venue}`;

          const host = document.createElement("p");
          host.className = "muted";
          host.textContent = `Host: ${item.host}`;

          const summary = document.createElement("p");
          summary.textContent = item.summary;

          const related = document.createElement("p");
          related.className = "muted";
          related.textContent = `Related papers: ${(item.relatedPapers || []).join("; ")}`;

          const tags = document.createElement("div");
          tags.className = "tag-list";
          (item.tags || []).forEach((tag) => {
            const span = document.createElement("span");
            span.className = "tag";
            span.textContent = tag;
            tags.appendChild(span);
          });

          article.appendChild(title);
          article.appendChild(meta);
          article.appendChild(host);
          article.appendChild(summary);
          article.appendChild(related);
          article.appendChild(tags);
          const linksRow = buildLinkRow(item.links);
          if (linksRow.children.length) {
            article.appendChild(linksRow);
          }
          listEl.appendChild(article);
        });
    };

    [yearSelect, typeSelect, tagSelect, searchInput].forEach((control) => {
      if (control) {
        control.addEventListener("input", render);
      }
    });

    render();
  };

  renderHighlights();
  renderPublications();
  renderTalks();
})();
