(function () {
  function renderConnectivitySections() {
    const grid = document.querySelector("#connectivity-sections-grid");
    const data = window.CONNECTIVITY_DATA;

    if (!grid || !data || !Array.isArray(data.sections)) {
      return;
    }

    data.sections.forEach(function (section) {
      grid.appendChild(createConnectivitySectionCard(section, data.items || []));
    });
  }

  function renderConnectivitySectionView() {
    const title = document.querySelector("#section-title");
    const data = window.CONNECTIVITY_DATA;

    if (!title || !data || !Array.isArray(data.sections)) {
      return;
    }

    const params = new URLSearchParams(window.location.search);
    const sectionId = params.get("id");
    const section = data.sections.find(function (candidate) {
      return candidate.id === sectionId;
    });

    if (!section) {
      showSectionNotFound();
      return;
    }

    const items = (data.items || []).filter(function (item) {
      return item.identity && item.identity.section === section.id;
    });

    populateSectionHeader(section);
    populateSectionOverview(section, items);
    populateSectionItems(items);
  }

  function showSectionNotFound() {
    const title = document.querySelector("#section-title");
    const breadcrumbLabel = document.querySelector("#section-breadcrumb-label");
    const statusMessage = document.querySelector("#section-status-message");

    title.textContent = "Section not found";

    if (breadcrumbLabel) {
      breadcrumbLabel.textContent = "Section not found";
    }

    if (statusMessage) {
      statusMessage.textContent = "Section not found";
    }
  }

  function populateSectionHeader(section) {
    const title = document.querySelector("#section-title");
    const breadcrumbLabel = document.querySelector("#section-breadcrumb-label");

    title.textContent = section.name;

    if (breadcrumbLabel) {
      breadcrumbLabel.textContent = section.name;
    }
  }

  function populateSectionOverview(section, items) {
    const statusMessage = document.querySelector("#section-status-message");
    const overviewCard = document.querySelector("#section-overview-card");
    const overviewDetails = document.querySelector("#section-overview-details");

    if (!overviewCard || !overviewDetails) {
      return;
    }

    overviewDetails.textContent = "";

    appendLocalizedDefinition(overviewDetails, "Arabic description", section.description && section.description.ar ? section.description.ar : "Placeholder", "ar");
    appendLocalizedDefinition(overviewDetails, "English description", section.description && section.description.en ? section.description.en : "Placeholder", "en");
    appendDefinition(overviewDetails, "Items", items.length.toString());
    appendDefinition(overviewDetails, "Capabilities", formatList(section.commonCapabilities));

    overviewCard.hidden = false;

    if (statusMessage) {
      statusMessage.textContent = "Section loaded from the centralized connectivity data model.";
    }
  }

  function populateSectionItems(items) {
    const itemsArea = document.querySelector("#section-items-area");
    const itemsGrid = document.querySelector("#section-items-grid");

    if (!itemsArea || !itemsGrid) {
      return;
    }

    itemsGrid.textContent = "";

    items.forEach(function (item) {
      itemsGrid.appendChild(createSectionItemCard(item));
    });

    itemsArea.hidden = false;
  }

  function createSectionItemCard(item) {
    const article = document.createElement("article");
    article.className = "reference-card";

    const button = document.createElement("button");
    button.className = "item-card-button";
    button.type = "button";
    button.dataset.itemId = item.id;

    button.appendChild(createItemCardPreview(item));

    const heading = document.createElement("h3");
    heading.textContent = item.name;
    button.appendChild(heading);

    const metadata = document.createElement("div");
    metadata.className = "item-card-metadata";

    const type = document.createElement("span");
    type.className = "item-card-type";
    type.textContent = formatTitleValue(item.identity && item.identity.type ? item.identity.type : "Placeholder");
    metadata.appendChild(type);

    const status = document.createElement("span");
    status.className = "item-card-status";
    status.textContent = formatTitleValue(item.identity && item.identity.status ? item.identity.status : "Placeholder");
    metadata.appendChild(status);

    button.appendChild(metadata);

    const chips = document.createElement("div");
    chips.className = "item-card-capabilities";

    if (Array.isArray(item.capabilities) && item.capabilities.length > 0) {
      item.capabilities.forEach(function (capability) {
        const chip = document.createElement("span");
        chip.className = "item-card-capability";
        chip.textContent = formatTitleValue(capability);
        chips.appendChild(chip);
      });
    }

    button.appendChild(chips);

    const action = document.createElement("span");
    action.className = "item-card-action";
    action.innerHTML = "View technical reference <span aria-hidden=\"true\">&rarr;</span>";
    button.appendChild(action);

    button.addEventListener("click", function () {
      openItemModal(item.id);
    });

    article.appendChild(button);

    return article;
  }

  function getTechnicalIconType(item) {
    const identity = item && item.identity ? item.identity : {};
    const type = (identity.type || "").toLowerCase();
    const section = (identity.section || "").toLowerCase();
    const capabilities = Array.isArray(item && item.capabilities) ? item.capabilities : [];
    const tokenSource = [type, section, ...capabilities].join(" ").toLowerCase();

    if (/power|ups|battery/.test(tokenSource)) return "power";
    if (/network|ethernet|fiber|coax|wireless/.test(tokenSource)) return "network";
    if (/video|display|monitor|hdmi|graphics/.test(tokenSource)) return "display";
    if (/camera|cctv|imaging/.test(tokenSource)) return "camera";
    if (/storage|drive|disk|ssd|hdd|sata|nvme|ide|scsi|m\.2/.test(tokenSource)) return "storage";
    if (/console|management|terminal|admin/.test(tokenSource)) return "terminal";
    if (/audio|speaker|headset/.test(tokenSource)) return "audio";
    if (/cable|connector|port|header|adapter|interface/.test(tokenSource)) return "cable";
    if (/data|usb|peripheral/.test(tokenSource)) return "peripheral";
    return "terminal";
  }

  function createTechnicalIcon(kind) {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("aria-hidden", "true");
    svg.setAttribute("focusable", "false");
    path.setAttribute("fill", "none");
    path.setAttribute("stroke", "currentColor");
    path.setAttribute("stroke-width", "1.7");
    path.setAttribute("stroke-linecap", "round");
    path.setAttribute("stroke-linejoin", "round");

    const iconMap = {
      terminal: "M4 6.5h16M4 17.5h8M7 10.5l-2.5 2.5L7 15.5M12.5 15.5h3.5",
      hardware: "M6 5.5h12v13H6zm3 4h6M9 14h6M10 8.5v7M14 8.5v7",
      network: "M7 8.5h10M7 15.5h10M9 5.5V4.5M15 5.5V4.5M9 19.5v-1M15 19.5v-1M7 8.5v7M17 8.5v7",
      storage: "M5 7.5h14v9H5zm3 2.5h8M8 12h8M9 16h6M7 5.5V4.5M17 5.5V4.5",
      windows: "M4 6.5h7v7H4zm9 0h7v7h-7zm-9 9h7v7H4zm9 0h7v7h-7z",
      admin: "M8 5.5l2 2M16 5.5l-2 2M12 8.5v3.5M9.5 13.5h5L14 18.5H10zM7 10.5h10",
      folder: "M3.5 8.5h5l1.5 2h10v7.5h-16zM3.5 8.5V6.5h5l1.5 2",
      power: "M12 3.5v6M8.5 6.5h7l-1.5 4.5h3l-7 9 1.5-6.5H7.5z",
      cable: "M8 6.5h2.5v4H8zm5.5 0H16v4h-2.5zm-5.5 10h2.5v4H8zm5.5 0H16v4h-2.5zM10.5 10.5h3v3h-3zM7 8.5h2M15 8.5h2M7 15.5h2M15 15.5h2",
      device: "M7 6.5h10v11H7zm3 14h4M9 9.5h6M9 12.5h6",
      display: "M4 6.5h16v9H4zm6 11.5h4M9 18.5l-1 2M15 18.5l1 2",
      camera: "M5 8.5h2.5l1.5-2h6l1.5 2H19v9H5zm7 2a3 3 0 1 1 0 6 3 3 0 0 1 0-6z",
      audio: "M7 9.5v5h3l4 3v-11l-4 3H7zM16.5 10.5a3.5 3.5 0 0 1 0 3M18.5 8.5a6 6 0 0 1 0 7",
      peripheral: "M7 8.5h10v7H7zm2.5-3h5M9 18.5v1.5M15 18.5v1.5",
      fallback: "M6 6.5h12v11H6zm2 2.5h8M8 13.5h8"
    };

    path.setAttribute("d", iconMap[kind] || iconMap.fallback);
    svg.appendChild(path);
    return svg;
  }

  function createItemCardPreview(item) {
    const preview = document.createElement("div");
    preview.className = "item-card-preview";
    preview.setAttribute("aria-hidden", "true");

    const icon = createTechnicalIcon(getTechnicalIconType(item));
    icon.classList.add("item-card-technical-icon");
    preview.appendChild(icon);

    return preview;
  }

  function openItemModal(itemId) {
    const data = window.CONNECTIVITY_DATA;
    const modal = document.querySelector("#item-detail-modal");
    const title = document.querySelector("#modal-item-title");
    const metadata = document.querySelector("#modal-item-metadata");
    const capabilities = document.querySelector("#modal-item-capabilities");
    const accordion = document.querySelector("#modal-item-accordion");

    if (!data || !modal || !title || !metadata || !capabilities || !accordion) {
      return;
    }

    const item = (data.items || []).find(function (candidate) {
      return candidate.id === itemId;
    });

    if (!item) {
      return;
    }

    const section = (data.sections || []).find(function (candidate) {
      return item.identity && candidate.id === item.identity.section;
    });

    modal.classList.toggle("sata-reference-modal", item.id === "sata-data-cable");
    title.textContent = item.name;
    metadata.textContent = [
      formatTitleValue(item.identity && item.identity.type),
      section ? section.name : item.identity && item.identity.section,
      formatTitleValue(item.identity && item.identity.status)
    ].filter(Boolean).join(" \u2022 ");

    renderCapabilityBadges(capabilities, item.capabilities);

    if (item.id === "sata-data-cable") {
      renderSataDataCableReference(accordion, item);
    } else {
      renderItemAccordion(accordion, item);
    }

    modal.hidden = false;
    document.body.classList.add("modal-open");

    const closeButton = document.querySelector("#modal-close-button");
    if (closeButton) {
      closeButton.focus();
    }
  }

  function renderCapabilityBadges(container, values) {
    container.textContent = "";

    if (!Array.isArray(values) || values.length === 0) {
      return;
    }

    values.forEach(function (value) {
      const badge = document.createElement("span");
      badge.className = "capability-badge";
      badge.textContent = formatTitleValue(value);
      container.appendChild(badge);
    });
  }

  function renderItemAccordion(container, item) {
    container.textContent = "";
    container.className = "modal-accordion";

    const sections = getItemDetailSections(item, true);

    sections.forEach(function (section) {
      if (section.content) {
        container.appendChild(createAccordionSection(section.title, section.content));
      }
    });
  }

  function renderSataDataCableReference(container, item) {
    container.textContent = "";
    container.className = "modal-accordion technical-reference-layout";

    const switcher = createSataReferenceLanguageSwitch(container);
    const panes = document.createElement("div");
    panes.className = "technical-reference-panes";

    container.appendChild(switcher);
    panes.appendChild(createSataReferencePane(item, "ar"));
    panes.appendChild(createSataReferencePane(item, "en"));
    container.appendChild(panes);

    setSataReferenceLanguage(container, "ar");
  }

  function createSataReferenceLanguageSwitch(container) {
    const switcher = document.createElement("div");
    switcher.className = "technical-reference-language-switch";
    switcher.dir = "ltr";
    switcher.setAttribute("role", "group");
    switcher.setAttribute("aria-label", "Technical reference language");

    ["ar", "en"].forEach(function (language, index) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "technical-reference-language-button";
      button.dataset.language = language;
      button.textContent = language.toUpperCase();
      button.addEventListener("click", function () {
        setSataReferenceLanguage(container, language);
      });
      switcher.appendChild(button);

      if (index === 0) {
        const separator = document.createElement("span");
        separator.className = "technical-reference-language-separator";
        separator.textContent = "|";
        separator.setAttribute("aria-hidden", "true");
        switcher.appendChild(separator);
      }
    });

    return switcher;
  }

  function setSataReferenceLanguage(container, language) {
    container.lang = language;
    container.dir = language === "ar" ? "rtl" : "ltr";

    container.querySelectorAll(".technical-reference-language-button").forEach(function (button) {
      const isSelected = button.dataset.language === language;
      button.setAttribute("aria-pressed", isSelected ? "true" : "false");
    });

    container.querySelectorAll(".technical-reference-language-pane").forEach(function (pane) {
      pane.hidden = pane.dataset.language !== language;
    });
  }

  function createSataReferencePane(item, language) {
    const pane = document.createElement("div");
    pane.className = "technical-reference-language-pane " + (language === "ar" ? "ar-text" : "en-text");
    pane.dataset.language = language;
    pane.dir = language === "ar" ? "rtl" : "ltr";
    pane.lang = language;

    pane.appendChild(createSataReferenceHeader(item, language));
    pane.appendChild(createSataIdentificationSection(item, language));
    pane.appendChild(createSataSpecificationsSection(item, language));
    pane.appendChild(createSataFieldUseSection(item, language));
    pane.appendChild(createSataDiagnosticsSection(item, language));
    pane.appendChild(createSataLimitationsSection(item, language));
    pane.appendChild(createSataOsVisibilitySection(item, language));
    pane.appendChild(createSataRelatedItemsSection(item, language));

    return pane;
  }

  function createSataReferenceHeader(item, language) {
    const header = document.createElement("section");
    header.className = "technical-reference-header";

    const identity = document.createElement("div");
    identity.className = "technical-reference-identity";

    const eyebrow = document.createElement("p");
    eyebrow.className = "technical-reference-eyebrow";
    eyebrow.textContent = getReferenceLabel("referenceSheet", language);
    identity.appendChild(eyebrow);

    const title = document.createElement("h2");
    title.textContent = item.name;
    identity.appendChild(title);

    const metadata = document.createElement("dl");
    metadata.className = "technical-reference-metadata";
    appendReferenceMetadata(metadata, getReferenceLabel("type", language), formatTitleValue(item.identity && item.identity.type));
    appendReferenceMetadata(metadata, getReferenceLabel("status", language), formatTitleValue(item.identity && item.identity.status));
    appendReferenceMetadata(metadata, getReferenceLabel("capabilities", language), formatList(item.capabilities));
    identity.appendChild(metadata);

    header.appendChild(identity);

    const media = createMediaFigure(item.media && item.media.primary, language, "technical-reference-header-media");
    if (media) {
      header.appendChild(media);
    }

    return header;
  }

  function appendReferenceMetadata(list, termText, descriptionText) {
    const wrapper = document.createElement("div");
    const term = document.createElement("dt");
    const description = document.createElement("dd");

    term.textContent = termText;
    description.textContent = descriptionText;

    wrapper.appendChild(term);
    wrapper.appendChild(description);
    list.appendChild(wrapper);
  }

  function createSataIdentificationSection(item, language) {
    const section = createTechnicalReferenceSection(getReferenceLabel("identification", language));

    section.appendChild(createTechnicalSubsection(getReferenceLabel("overview", language), createLocalizedTextBlock(item.description && item.description[language], language), "technical-reference-subsection-compact"));
    section.appendChild(createTechnicalSubsection(getReferenceLabel("recognition", language), createRecognitionReference(item, language)));

    return section;
  }

  function createRecognitionReference(item, language) {
    const recognition = item.recognition || {};
    const content = document.createElement("div");
    content.className = "technical-reference-fact-stack";

    appendFactBlock(content, recognition.physicalIdentification && recognition.physicalIdentification[language], language);

    if (Array.isArray(recognition.connector)) {
      recognition.connector.forEach(function (entry) {
        appendFactBlock(content, entry && entry[language], language);
      });
    }

    if (hasMeaningfulValue(recognition.pinCount)) {
      const pinFact = document.createElement("div");
      pinFact.className = "technical-reference-inline-fact";

      const label = document.createElement("span");
      label.textContent = getReferenceLabel("pinCount", language);
      pinFact.appendChild(label);

      const value = document.createElement("strong");
      value.textContent = recognition.pinCount + "-pin";
      pinFact.appendChild(value);

      content.appendChild(pinFact);
    }

    if (Array.isArray(recognition.construction)) {
      recognition.construction.forEach(function (entry) {
        appendFactBlock(content, entry && entry[language], language);
      });
    }

    appendMediaGallery(content, item.media && item.media.recognition, language, "technical-reference-media-gallery");
    appendMediaGallery(content, item.media && item.media.comparison, language, "technical-reference-media-gallery");

    return content.childElementCount > 0 ? content : null;
  }

  function appendFactBlock(container, text, language) {
    if (!hasMeaningfulValue(text)) {
      return;
    }

    const block = document.createElement("div");
    block.className = "technical-reference-fact";
    block.appendChild(createLocalizedTextBlock(text, language));
    container.appendChild(block);
  }

  function appendMediaGallery(container, mediaItems, language, className) {
    if (!Array.isArray(mediaItems) || mediaItems.length === 0) {
      return;
    }

    const gallery = document.createElement("div");
    gallery.className = className;

    mediaItems.forEach(function (media) {
      const figure = createMediaFigure(media, language, "overview-primary-media");

      if (figure) {
        gallery.appendChild(figure);
      }
    });

    if (gallery.childElementCount > 0) {
      container.appendChild(gallery);
    }
  }

  function createSataSpecificationsSection(item, language) {
    const section = createTechnicalReferenceSection(getReferenceLabel("technicalSpecifications", language));
    const layout = document.createElement("div");
    layout.className = "technical-reference-flow-grid";

    layout.appendChild(createTechnicalSubsection(getReferenceLabel("performance", language), createPerformanceReference(item.performance, language), "technical-reference-subsection-wide"));
    layout.appendChild(createTechnicalSubsection(getReferenceLabel("power", language), createLocalizedTextBlock(item.power && item.power.notes && item.power.notes[language], language)));
    layout.appendChild(createTechnicalSubsection(getReferenceLabel("compatibility", language), createLocalizedTextBlock(item.compatibility && item.compatibility.adapterNotes && item.compatibility.adapterNotes[language], language), "technical-reference-subsection-wide"));

    section.appendChild(layout);
    return section;
  }

  function createPerformanceReference(performance, language) {
    if (!hasMeaningfulValue(performance)) {
      return null;
    }

    const content = document.createElement("div");
    content.className = "technical-reference-performance";

    if (Array.isArray(performance.supportedSpeeds) && performance.supportedSpeeds.length > 0) {
      const speedList = document.createElement("div");
      speedList.className = "technical-reference-speed-list";

      performance.supportedSpeeds.forEach(function (speed) {
        const chip = document.createElement("span");
        chip.textContent = speed;
        speedList.appendChild(chip);
      });

      content.appendChild(speedList);
    }

    const notes = createLocalizedTextBlock(performance.notes && performance.notes[language], language);
    if (notes) {
      content.appendChild(notes);
    }

    return content.childElementCount > 0 ? content : null;
  }

  function createSataFieldUseSection(item, language) {
    const section = createTechnicalReferenceSection(getReferenceLabel("fieldUse", language));
    const layout = document.createElement("div");
    layout.className = "technical-reference-flow-grid technical-reference-flow-grid-two";

    layout.appendChild(createTechnicalSubsection(getReferenceLabel("commonUses", language), createReferenceList(item.usage && item.usage.commonUses && item.usage.commonUses[language], language)));
    layout.appendChild(createTechnicalSubsection(getReferenceLabel("technicianNotes", language), createReferenceList(item.technician && item.technician.notes && item.technician.notes[language], language)));

    section.appendChild(layout);
    appendMediaGallery(section, item.media && item.media.installation, language, "technical-reference-media-gallery");

    return section;
  }

  function createSataDiagnosticsSection(item, language) {
    const technician = item.technician || {};
    const section = createTechnicalReferenceSection(getReferenceLabel("diagnostics", language));
    const workflow = document.createElement("div");
    workflow.className = "technical-reference-diagnostics";

    workflow.appendChild(createDiagnosticStage(getReferenceLabel("symptom", language), technician.symptoms && technician.symptoms[language], language));
    workflow.appendChild(createDiagnosticStage(getReferenceLabel("checkCause", language), technician.commonProblems && technician.commonProblems[language], language));
    workflow.appendChild(createDiagnosticStage(getReferenceLabel("action", language), technician.troubleshooting && technician.troubleshooting[language], language, true));

    section.appendChild(workflow);
    return section;
  }

  function createDiagnosticStage(title, items, language, ordered) {
    const stage = document.createElement("div");
    stage.className = "technical-reference-diagnostic-stage";

    const heading = document.createElement("h4");
    heading.textContent = title;
    stage.appendChild(heading);

    const list = createReferenceList(items, language, ordered);
    if (list) {
      stage.appendChild(list);
    }

    return stage;
  }

  function createSataLimitationsSection(item, language) {
    const section = createTechnicalReferenceSection(getReferenceLabel("limitations", language));
    section.appendChild(createReferenceList(item.technician && item.technician.limitations && item.technician.limitations[language], language));
    return section;
  }

  function createSataOsVisibilitySection(item, language) {
    const osVisibility = item.osVisibility || {};
    const section = createTechnicalReferenceSection(getReferenceLabel("osPowerShellVisibility", language));
    const layout = document.createElement("div");
    layout.className = "technical-reference-os-grid";

    layout.appendChild(createTechnicalSubsection(getReferenceLabel("canObserve", language), createReferenceList(osVisibility.whatCanBeDetected && osVisibility.whatCanBeDetected[language], language), "technical-reference-observe-panel"));
    layout.appendChild(createTechnicalSubsection(getReferenceLabel("cannotIdentify", language), createReferenceList(osVisibility.whatCannotBeDetected && osVisibility.whatCannotBeDetected[language], language), "technical-reference-cannot-panel"));

    const commands = createCommandReference(osVisibility.commands, language);
    if (commands) {
      layout.appendChild(createTechnicalSubsection(getReferenceLabel("commands", language), commands, "technical-reference-subsection-wide"));
    }

    section.appendChild(layout);
    return section;
  }

  function createCommandReference(commands, language) {
    if (!Array.isArray(commands) || commands.length === 0) {
      return null;
    }

    const list = document.createElement("div");
    list.className = "technical-reference-command-list";

    commands.forEach(function (command) {
      const commandText = getObjectContent(command && command.command ? command.command : command);

      if (!hasMeaningfulValue(commandText)) {
        return;
      }

      const pre = document.createElement("pre");
      pre.dir = "ltr";
      pre.lang = "en";

      const code = document.createElement("code");
      code.textContent = commandText;
      pre.appendChild(code);

      list.appendChild(pre);

      const note = command && command.description && command.description[language];
      if (hasMeaningfulValue(note)) {
        const description = document.createElement("p");
        appendLocalizedText(description, note, language);
        list.appendChild(description);
      }
    });

    return list.childElementCount > 0 ? list : null;
  }

  function createSataRelatedItemsSection(item, language) {
    const section = createTechnicalReferenceSection(getReferenceLabel("relatedItems", language));
    const relatedItems = createRelatedItemChips(item.relations, language);

    if (relatedItems) {
      section.appendChild(relatedItems);
    }

    return section;
  }

  function createRelatedItemChips(relations) {
    if (!relations || !Array.isArray(relations.relatedItems) || relations.relatedItems.length === 0) {
      return null;
    }

    const data = window.CONNECTIVITY_DATA;
    const list = document.createElement("ul");
    list.className = "technical-reference-related-list";

    relations.relatedItems.forEach(function (itemId) {
      const relatedItem = data && Array.isArray(data.items) ? data.items.find(function (candidate) {
        return candidate.id === itemId;
      }) : null;

      if (!relatedItem) {
        return;
      }

      const listItem = document.createElement("li");
      listItem.textContent = relatedItem.name;
      list.appendChild(listItem);
    });

    return list.childElementCount > 0 ? list : null;
  }

  function createTechnicalReferenceSection(title) {
    const section = document.createElement("section");
    section.className = "technical-reference-group";

    const heading = document.createElement("h3");
    heading.textContent = title;
    section.appendChild(heading);

    return section;
  }

  function createTechnicalSubsection(title, content, className) {
    const subsection = document.createElement("article");
    subsection.className = "technical-reference-subsection" + (className ? " " + className : "");

    const heading = document.createElement("h4");
    heading.textContent = title;
    subsection.appendChild(heading);

    if (content) {
      subsection.appendChild(content);
    }

    return subsection;
  }

  function createLocalizedTextBlock(text, language) {
    if (!hasMeaningfulValue(text)) {
      return null;
    }

    return createOverviewLanguageBlock(text, language);
  }

  function createReferenceList(items, language, ordered) {
    if (!Array.isArray(items) || items.length === 0) {
      return null;
    }

    const list = document.createElement(ordered ? "ol" : "ul");
    list.className = "technical-reference-list";

    items.forEach(function (entry) {
      const item = document.createElement("li");
      appendLocalizedText(item, entry, language);
      list.appendChild(item);
    });

    return list;
  }

  function getReferenceLabel(key, language) {
    const labels = {
      referenceSheet: { ar: "ورقة مرجعية فنية", en: "Technical Reference Sheet" },
      type: { ar: "النوع", en: "Type" },
      status: { ar: "الحالة", en: "Status" },
      capabilities: { ar: "القدرات", en: "Capabilities" },
      identification: { ar: "التعريف", en: "Identification" },
      overview: { ar: "نظرة عامة", en: "Overview" },
      recognition: { ar: "التعرّف", en: "Recognition" },
      pinCount: { ar: "عدد الأطراف", en: "Pin count" },
      technicalSpecifications: { ar: "المواصفات الفنية", en: "Technical Specifications" },
      performance: { ar: "الأداء", en: "Performance" },
      power: { ar: "الطاقة", en: "Power" },
      compatibility: { ar: "التوافق", en: "Compatibility" },
      fieldUse: { ar: "الاستخدام الميداني", en: "Field Use" },
      commonUses: { ar: "الاستخدامات الشائعة", en: "Common Uses" },
      technicianNotes: { ar: "ملاحظات الفني", en: "Technician Notes" },
      diagnostics: { ar: "التشخيص", en: "Diagnostics" },
      symptom: { ar: "العَرَض", en: "Symptom" },
      checkCause: { ar: "الفحص / السبب المحتمل", en: "Check / Possible Cause" },
      action: { ar: "الإجراء", en: "Action" },
      limitations: { ar: "القيود", en: "Limitations" },
      osPowerShellVisibility: { ar: "ظهور النظام / PowerShell", en: "OS / PowerShell Visibility" },
      canObserve: { ar: "ما يمكن أن يساعد Windows / PowerShell في ملاحظته", en: "What Windows / PowerShell Can Help Observe" },
      cannotIdentify: { ar: "ما لا يمكنه تحديده مباشرة عن الكابل الفيزيائي", en: "What It Cannot Directly Identify About The Physical Cable" },
      commands: { ar: "الأوامر", en: "Commands" },
      relatedItems: { ar: "العناصر المرتبطة", en: "Related Items" }
    };

    return labels[key] && labels[key][language] ? labels[key][language] : key;
  }

  function getItemDetailSections(item, includePrimaryMedia) {
    return [
      { title: "Overview", content: getDescriptionContent(item.description, includePrimaryMedia ? item.media && item.media.primary : null) },
      { title: "Recognition", content: getRecognitionContent(item.recognition, item.media && item.media.recognition, item.media && item.media.comparison) },
      { title: "Performance", content: getPerformanceContent(item.performance) },
      { title: "Power", content: getLocalizedContent(item.power && item.power.notes) },
      { title: "Compatibility", content: getLocalizedContent(item.compatibility && item.compatibility.adapterNotes) },
      { title: "Common Uses", content: getLocalizedListContent(item.usage && item.usage.commonUses) },
      { title: "Technician Notes", content: getLocalizedListContent(item.technician && item.technician.notes) },
      { title: "Common Problems", content: getLocalizedListContent(item.technician && item.technician.commonProblems) },
      { title: "Troubleshooting", content: getTroubleshootingContent(item.technician) },
      { title: "Limitations", content: getLocalizedListContent(item.technician && item.technician.limitations) },
      { title: "OS / PowerShell Visibility", content: getOsVisibilityContent(item.osVisibility) },
      { title: "Related Items", content: getRelatedItemsContent(item.relations) }
    ];
  }

  function createTechnicalReferenceGroup(title, className, sectionEntries) {
    const availableSections = sectionEntries.filter(function (entry) {
      return entry[1];
    });

    if (availableSections.length === 0) {
      return null;
    }

    const group = document.createElement("section");
    group.className = "technical-reference-group";

    const heading = document.createElement("h3");
    heading.textContent = title;
    group.appendChild(heading);

    const grid = document.createElement("div");
    grid.className = className;

    availableSections.forEach(function (entry) {
      const panel = document.createElement("article");
      panel.className = "technical-reference-panel";

      const panelHeading = document.createElement("h4");
      panelHeading.textContent = entry[0];
      panel.appendChild(panelHeading);
      panel.appendChild(entry[1]);

      grid.appendChild(panel);
    });

    group.appendChild(grid);
    return group;
  }

  function createAccordionSection(title, content) {
    const details = document.createElement("details");
    details.className = "accordion-section";

    const summary = document.createElement("summary");
    summary.textContent = title;
    details.appendChild(summary);

    const body = document.createElement("div");
    body.className = "accordion-body";
    if (typeof content === "string") {
      body.textContent = content;
    } else {
      body.appendChild(content);
    }
    details.appendChild(body);

    details.addEventListener("toggle", function () {
      if (!details.open || !details.parentElement) {
        return;
      }

      details.parentElement.querySelectorAll(".accordion-section").forEach(function (section) {
        if (section !== details && section.open) {
          section.open = false;
        }
      });

      window.requestAnimationFrame(function () {
        keepAccordionHeaderVisible(details);
      });
    });

    return details;
  }

  function keepAccordionHeaderVisible(details) {
    const panel = details.closest(".modal-panel");
    const summary = details.querySelector("summary");

    if (!panel || !summary) {
      return;
    }

    const panelRect = panel.getBoundingClientRect();
    const summaryRect = summary.getBoundingClientRect();
    const margin = 16;
    let scrollAdjustment = 0;

    if (summaryRect.top < panelRect.top + margin) {
      scrollAdjustment = summaryRect.top - panelRect.top - margin;
    } else if (summaryRect.bottom > panelRect.bottom - margin) {
      scrollAdjustment = summaryRect.bottom - panelRect.bottom + margin;
    }

    if (scrollAdjustment !== 0) {
      panel.scrollTo({
        top: panel.scrollTop + scrollAdjustment,
        behavior: "smooth"
      });
    }
  }

  function getDescriptionContent(description, primaryMedia) {
    if (!description || ![description.ar, description.en].some(hasMeaningfulValue)) {
      return null;
    }

    return createBilingualContent(description, function (text, language) {
      const block = createOverviewLanguageBlock(text, language);
      const media = createMediaFigure(primaryMedia, language, "overview-primary-media");

      if (media) {
        block.insertBefore(media, block.firstChild);
      }

      return block;
    });
  }

  function createMediaFigure(media, language, className) {
    const figure = document.createElement("figure");
    const captionText = media && media.caption && media.caption[language];
    const iconKind = media && media.kind ? media.kind : "terminal";

    figure.className = className;
    figure.classList.add("technical-media-figure");

    const icon = createTechnicalIcon(iconKind);
    icon.classList.add("technical-media-icon");
    figure.appendChild(icon);

    if (hasMeaningfulValue(captionText)) {
      const caption = document.createElement("figcaption");
      appendLocalizedText(caption, captionText, language);
      figure.appendChild(caption);
    }

    return figure;
  }

  function getRecognitionContent(recognition, recognitionMedia, comparisonMedia) {
    const hasText = !!(recognition && hasMeaningfulValue(recognition));
    const hasMedia = (Array.isArray(recognitionMedia) && recognitionMedia.length > 0) || (Array.isArray(comparisonMedia) && comparisonMedia.length > 0);

    if (!hasText && !hasMedia) {
      return null;
    }

    if (!hasText) {
      const localizedContent = { ar: "", en: "" };

      return createBilingualContent(localizedContent, function (text, language) {
        const block = createOverviewLanguageBlock(text, language);
        appendMediaGallery(block, recognitionMedia, language, "technical-reference-media-gallery");
        appendMediaGallery(block, comparisonMedia, language, "technical-reference-media-gallery");
        return block;
      });
    }

    const localizedContent = { ar: [], en: [] };

    appendLocalizedRecognitionField(localizedContent, recognition.physicalIdentification);

    if (Array.isArray(recognition.connector) && recognition.connector.length > 0) {
      appendLocalizedRecognitionField(localizedContent, recognition.connector[0]);
    }

    if (hasMeaningfulValue(recognition.pinCount)) {
      localizedContent.ar.push("عدد الأطراف:\n" + recognition.pinCount + "-pin");
      localizedContent.en.push("Pin count:\n" + recognition.pinCount + "-pin");
    }

    if (Array.isArray(recognition.connector)) {
      recognition.connector.slice(1).forEach(function (entry) {
        appendLocalizedRecognitionField(localizedContent, entry);
      });
    }

    if (Array.isArray(recognition.construction)) {
      recognition.construction.forEach(function (entry) {
        appendLocalizedRecognitionField(localizedContent, entry);
      });
    }

    const joinedContent = {
      ar: localizedContent.ar.join("\n\n"),
      en: localizedContent.en.join("\n\n")
    };

    return createBilingualContent(joinedContent, function (text, language) {
      const block = createOverviewLanguageBlock(text, language);
      appendMediaGallery(block, recognitionMedia, language, "technical-reference-media-gallery");
      appendMediaGallery(block, comparisonMedia, language, "technical-reference-media-gallery");
      return block;
    });
  }

  function appendLocalizedRecognitionField(target, field) {
    if (!field || typeof field !== "object") {
      return;
    }

    ["ar", "en"].forEach(function (language) {
      if (hasMeaningfulValue(field[language])) {
        target[language].push(field[language]);
      }
    });
  }

  function getPerformanceContent(performance) {
    if (!hasMeaningfulValue(performance)) {
      return null;
    }

    const speeds = Array.isArray(performance.supportedSpeeds) ? performance.supportedSpeeds : [];
    const localized = {
      ar: "سرعات واجهة SATA:\n" + formatTextList(speeds, false) + "\n\n" + (performance.notes && performance.notes.ar ? performance.notes.ar : ""),
      en: "SATA interface rates:\n" + formatTextList(speeds, false) + "\n\n" + (performance.notes && performance.notes.en ? performance.notes.en : "")
    };

    return getLocalizedContent(localized);
  }

  function getLocalizedContent(localizedContent) {
    if (!localizedContent || ![localizedContent.ar, localizedContent.en].some(hasMeaningfulValue)) {
      return null;
    }

    return createBilingualContent(localizedContent, createOverviewLanguageBlock);
  }

  function getLocalizedListContent(localizedItems) {
    if (!localizedItems) {
      return null;
    }

    return getLocalizedContent({
      ar: formatTextList(localizedItems.ar, false),
      en: formatTextList(localizedItems.en, false)
    });
  }

  function getTroubleshootingContent(technician) {
    if (!technician || (!hasMeaningfulValue(technician.symptoms) && !hasMeaningfulValue(technician.troubleshooting))) {
      return null;
    }

    return getLocalizedContent({
      ar: "الأعراض:\n" + formatTextList(technician.symptoms && technician.symptoms.ar, false) +
        "\n\nاستكشاف الأخطاء وإصلاحها:\n" + formatTextList(technician.troubleshooting && technician.troubleshooting.ar, true),
      en: "Symptoms:\n" + formatTextList(technician.symptoms && technician.symptoms.en, false) +
        "\n\nTroubleshooting:\n" + formatTextList(technician.troubleshooting && technician.troubleshooting.en, true)
    });
  }

  function getOsVisibilityContent(osVisibility) {
    if (!hasMeaningfulValue(osVisibility)) {
      return null;
    }

    const localized = { ar: "", en: "" };

    ["ar", "en"].forEach(function (language) {
      const detectable = osVisibility.whatCanBeDetected && osVisibility.whatCanBeDetected[language] || [];
      const notDetectable = osVisibility.whatCannotBeDetected && osVisibility.whatCannotBeDetected[language] || [];
      const parts = [];

      if (detectable[0]) {
        parts.push(detectable[0]);
      }

      if (detectable[1]) {
        parts.push(detectable[1] + "\n" + formatTextList(detectable.slice(2), false));
      }

      if (notDetectable.length > 0) {
        parts.push(notDetectable.join("\n"));
      }

      localized[language] = parts.join("\n\n");
    });

    return getLocalizedContent(localized);
  }

  function getRelatedItemsContent(relations) {
    if (!relations || !Array.isArray(relations.relatedItems) || relations.relatedItems.length === 0) {
      return null;
    }

    const data = window.CONNECTIVITY_DATA;
    const list = document.createElement("ul");
    list.className = "related-items-list";

    relations.relatedItems.forEach(function (itemId) {
      const relatedItem = data && Array.isArray(data.items) ? data.items.find(function (item) {
        return item.id === itemId;
      }) : null;

      if (relatedItem) {
        const listItem = document.createElement("li");
        listItem.textContent = relatedItem.name;
        list.appendChild(listItem);
      }
    });

    return list.childElementCount > 0 ? list : null;
  }

  function formatTextList(values, ordered) {
    if (!Array.isArray(values)) {
      return "";
    }

    return values.map(function (value, index) {
      return (ordered ? index + 1 + ". " : "- ") + value;
    }).join("\n");
  }

  function createBilingualContent(localizedContent, createLanguageBlock) {
    const content = document.createElement("div");
    const availableLanguages = ["ar", "en"].filter(function (language) {
      return hasMeaningfulValue(localizedContent[language]);
    });
    const blocks = {};

    if (availableLanguages.length > 1) {
      const switcher = document.createElement("div");
      switcher.className = "language-switch";
      switcher.dir = "ltr";
      switcher.setAttribute("role", "group");
      switcher.setAttribute("aria-label", "Content language");

      availableLanguages.forEach(function (language, index) {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "language-switch-button";
        button.dataset.language = language;
        button.textContent = language.toUpperCase();
        button.setAttribute("aria-pressed", language === "ar" ? "true" : "false");

        button.addEventListener("click", function () {
          availableLanguages.forEach(function (candidate) {
            const isSelected = candidate === language;
            blocks[candidate].hidden = !isSelected;
            switcher.querySelector("[data-language=\"" + candidate + "\"]").setAttribute("aria-pressed", isSelected ? "true" : "false");
          });
        });

        switcher.appendChild(button);

        if (index < availableLanguages.length - 1) {
          const separator = document.createElement("span");
          separator.className = "language-switch-separator";
          separator.textContent = "|";
          separator.setAttribute("aria-hidden", "true");
          switcher.appendChild(separator);
        }
      });

      content.appendChild(switcher);
    }

    availableLanguages.forEach(function (language) {
      const block = createLanguageBlock(localizedContent[language], language);
      block.hidden = availableLanguages.length > 1 && language !== "ar";
      blocks[language] = block;
      content.appendChild(block);
    });

    return content;
  }

  function createOverviewLanguageBlock(text, language) {
    const block = document.createElement("section");
    const lines = text.split(/\r?\n/);
    block.className = "overview-language " + (language === "ar" ? "ar-text" : "en-text");
    block.dir = language === "ar" ? "rtl" : "ltr";
    block.lang = language;

    for (let index = 0; index < lines.length; index += 1) {
      const line = lines[index].trim();

      if (!line) {
        continue;
      }

      if (line.indexOf("- ") === 0) {
        const list = document.createElement("ul");

        while (index < lines.length && lines[index].trim().indexOf("- ") === 0) {
          const item = document.createElement("li");
          appendLocalizedText(item, lines[index].trim().slice(2), language);
          list.appendChild(item);
          index += 1;
        }

        index -= 1;
        block.appendChild(list);
        continue;
      }

      if (/^\d+\.\s/.test(line)) {
        const list = document.createElement("ol");

        while (index < lines.length && /^\d+\.\s/.test(lines[index].trim())) {
          const item = document.createElement("li");
          appendLocalizedText(item, lines[index].trim().replace(/^\d+\.\s/, ""), language);
          list.appendChild(item);
          index += 1;
        }

        index -= 1;
        block.appendChild(list);
        continue;
      }

      const isHeading = /[?:：؟]$/.test(line);
      const element = document.createElement(isHeading ? "h4" : "p");
      appendLocalizedText(element, line, language);
      block.appendChild(element);
    }

    return block;
  }

  function getObjectContent(value) {
    if (!hasMeaningfulValue(value)) {
      return "";
    }

    if (typeof value === "string") {
      return value;
    }

    if (Array.isArray(value)) {
      return value.filter(hasMeaningfulValue).join(", ");
    }

    if (typeof value === "object") {
      return Object.keys(value).map(function (key) {
        const nestedValue = getObjectContent(value[key]);
        return nestedValue ? formatTitleValue(key) + ": " + nestedValue : "";
      }).filter(Boolean).join(" ");
    }

    return String(value);
  }

  function hasMeaningfulValue(value) {
    if (value === null || value === undefined || value === false) {
      return false;
    }

    if (typeof value === "string") {
      return value.trim() !== "";
    }

    if (Array.isArray(value)) {
      return value.some(hasMeaningfulValue);
    }

    if (typeof value === "object") {
      return Object.keys(value).some(function (key) {
        return hasMeaningfulValue(value[key]);
      });
    }

    return true;
  }

  function formatTitleValue(value) {
    if (!value) {
      return "";
    }

    return String(value).split("-").map(function (part) {
      return part.charAt(0).toUpperCase() + part.slice(1);
    }).join(" ");
  }

  function closeItemModal() {
    const modal = document.querySelector("#item-detail-modal");

    if (!modal || modal.hidden) {
      return;
    }

    modal.hidden = true;
    document.body.classList.remove("modal-open");
  }

  function setupItemModal() {
    const modal = document.querySelector("#item-detail-modal");
    const closeButton = document.querySelector("#modal-close-button");

    if (!modal) {
      return;
    }

    if (closeButton) {
      closeButton.addEventListener("click", closeItemModal);
    }

    modal.addEventListener("click", function (event) {
      if (event.target === modal) {
        closeItemModal();
      }
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") {
        closeItemModal();
      }
    });
  }

  function getCategoryIconKind(title) {
    const value = (title || "").toLowerCase();

    if (!value) return "terminal";
    if (/system information|device|inventory|info/.test(value)) return "terminal";
    if (/hardware|component|motherboard|cpu|gpu|memory|storage/.test(value)) return "hardware";
    if (/network|ethernet|wireless|dns|ip|adapter|connection/.test(value)) return "network";
    if (/storage|disk|drive|volume|ssd|hdd|filesystem/.test(value)) return "storage";
    if (/windows|os|startup|recovery|update/.test(value)) return "windows";
    if (/system administration|service|permission|user|group|task|process|environment/.test(value)) return "admin";
    if (/file|folder|path|copy|move|delete|search/.test(value)) return "folder";
    if (/power|battery|sleep|shutdown|charge/.test(value)) return "power";
    if (/port|connection|connector|cable|interface/.test(value)) return "cable";
    if (/device|printer|usb|camera|audio|keyboard|mouse|display/.test(value)) return "device";
    return "terminal";
  }

  function decorateCategoryCards() {
    document.querySelectorAll(".category-card").forEach(function (card) {
      if (card.querySelector(".category-card-header")) {
        return;
      }

      const content = card.querySelector(".card-link") || card;
      const heading = content.querySelector("h3");

      if (!heading) {
        return;
      }

      const header = document.createElement("div");
      const icon = createTechnicalIcon(getCategoryIconKind((card.dataset && card.dataset.title) || heading.textContent || ""));

      header.className = "category-card-header";
      icon.classList.add("category-card-icon");
      header.appendChild(icon);

      heading.parentNode.insertBefore(header, heading);
      header.appendChild(heading);
    });
  }

  function createConnectivitySectionCard(section, items) {
    const article = document.createElement("article");
    article.className = "reference-card connectivity-section-card";
    article.dataset.title = section.name;
    article.dataset.sectionId = section.id;

    const icon = document.createElement("div");
    icon.className = "terminal-icon terminal-icon-compact";
    icon.setAttribute("aria-hidden", "true");
    icon.appendChild(createTechnicalIcon("terminal"));
    article.appendChild(icon);

    const heading = document.createElement("h3");
    heading.textContent = section.name;
    article.appendChild(heading);

    const details = document.createElement("dl");

    appendDefinition(details, "Items", countItemsForSection(section.id, items).toString());
    appendDefinition(details, "Capabilities", formatList(section.commonCapabilities));
    appendLocalizedDefinition(details, "Arabic description", section.description && section.description.ar ? section.description.ar : "Placeholder", "ar");
    appendLocalizedDefinition(details, "English description", section.description && section.description.en ? section.description.en : "Placeholder", "en");

    article.appendChild(details);

    const action = document.createElement("a");
    action.className = "section-action-placeholder";
    action.href = "section.html?id=" + encodeURIComponent(section.id);
    action.textContent = "Open Section";
    article.appendChild(action);

    return article;
  }

  function appendDefinition(list, termText, descriptionText, descriptionClassName) {
    const term = document.createElement("dt");
    const description = document.createElement("dd");

    term.textContent = termText;
    description.textContent = descriptionText;

    if (descriptionClassName) {
      description.className = descriptionClassName;
    }

    list.appendChild(term);
    list.appendChild(description);
  }

  function appendLocalizedDefinition(list, termText, descriptionText, language) {
    const term = document.createElement("dt");
    const description = document.createElement("dd");

    term.textContent = termText;
    description.className = language === "ar" ? "section-description ar-text" : "section-description en-text";
    description.dir = language === "ar" ? "rtl" : "ltr";
    description.lang = language;

    appendLocalizedText(description, descriptionText, language);

    list.appendChild(term);
    list.appendChild(description);
  }

  function appendLocalizedText(element, text, language) {
    if (language !== "ar") {
      element.textContent = text;
      return;
    }

    const technicalTerms = [
      "SATA Power Cable",
      "SATA 1.5 Gb/s",
      "SATA 3 Gb/s",
      "SATA 6 Gb/s",
      "DVD/Blu-ray",
      "SATA Data Cable",
      "SATA DVD/Blu-ray",
      "Right-angle connector",
      "Straight connector",
      "SATA Controller",
      "SATA Power connector",
      "SATA HDD",
      "SATA port",
      "1.5 و3 و6 Gb/s",
      "BIOS/UEFI",
      "NVMe/PCIe",
      "DVD/Blu-ray",
      "2.5-inch",
      "PowerShell",
      "Windows",
      "eSATA",
      "Optical Drive",
      "Keyed Profile",
      "Locking Latch",
      "locking latch",
      "L-shaped",
      "SATA Data",
      "SATA Power",
      "SATA SSD",
      "15-pin",
      "7-pin",
      "Thunderbolt",
      "Blu-ray",
      "HDMI",
      "SATA",
      "NVMe",
      "PCIe",
      "Host",
      "USB",
      "HDD",
      "SSD",
      "DVD",
      "Gb/s",
      "UPS",
      "DSL",
      "KVM",
      "L"
    ];
    const pattern = new RegExp("(" + technicalTerms.map(function (term) {
      return term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    }).join("|") + ")", "g");
    const parts = text.split(pattern);

    parts.forEach(function (part) {
      if (!part) {
        return;
      }

      if (technicalTerms.indexOf(part) !== -1) {
        const term = document.createElement("span");
        term.className = "tech-term";
        term.dir = "ltr";
        term.textContent = part;
        element.appendChild(term);
        return;
      }

      element.appendChild(document.createTextNode(part));
    });
  }

  function countItemsForSection(sectionId, items) {
    return items.filter(function (item) {
      return item.identity && item.identity.section === sectionId;
    }).length;
  }

  function formatList(values) {
    if (!Array.isArray(values) || values.length === 0) {
      return "Placeholder";
    }

    return values.join(", ");
  }

  function setupFilter(options) {
    const searchInput = document.querySelector(options.inputSelector);
    const items = Array.from(document.querySelectorAll(options.itemSelector));
    const emptyState = document.querySelector(options.emptySelector);

    if (!searchInput || items.length === 0) {
      return;
    }

    searchInput.addEventListener("input", function () {
      const query = searchInput.value.trim().toLowerCase();
      let visibleCount = 0;

      items.forEach(function (item) {
        const text = item.textContent.toLowerCase();
        const isMatch = text.includes(query);

        item.hidden = !isMatch;

        if (isMatch) {
          visibleCount += 1;
        }
      });

      if (options.groupSelector) {
        updateGroups(options.groupSelector, options.itemSelector);
      }

      if (emptyState) {
        emptyState.hidden = visibleCount > 0;
      }
    });
  }

  function updateGroups(groupSelector, itemSelector) {
    const groups = Array.from(document.querySelectorAll(groupSelector));

    groups.forEach(function (group) {
      const visibleItems = Array.from(group.querySelectorAll(itemSelector)).filter(function (item) {
        return !item.hidden;
      });

      group.hidden = visibleItems.length === 0;
    });
  }

  console.info("KZ Support Reference app loaded.");

  decorateCategoryCards();
  renderConnectivitySections();
  renderConnectivitySectionView();
  setupItemModal();

  setupFilter({
    inputSelector: "#category-search",
    itemSelector: ".category-card",
    emptySelector: "#empty-state"
  });

  setupFilter({
    inputSelector: "#connectivity-search",
    itemSelector: ".connectivity-section-card",
    emptySelector: "#connectivity-empty-state"
  });
})();
