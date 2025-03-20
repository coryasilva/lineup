import { $, t, xid } from "./helpers.js";
import { Player } from "./player.js";

// TODO: Validate lineup
// TODO: Revamp algo ()
// TODO: Bundle & minify JS

export class ViewModel {
  /**
   * @param {import("./model.js").Model} model
   */
  constructor(model) {
    this.model = model;

    // View elements
    this.shareButton = $("#share-button");
    this.demoButton = $("#demo-button");
    this.rosterSummary = $("#roster-summary");
    this.rosterEmpty = $("#roster-empty");
    this.rosterList = $("#roster > [role='list']");
    this.playerAddButton = $("#player-add-button");
    this.playerDialog = $("#player-dialog");
    this.playerForm = $("form[name='player']");
    this.playerDeleteDialog = $("#player-delete-dialog");
    this.playerDeleteForm = $("form[name='player-delete']");
    this.lineupBuildButton = $("#lineup-build-button");
    this.lineupDialog = $("#lineup-dialog");
    this.lineupDialogClose = $("#lineup-dialog-close-button");
    this.lineupTable = $("#lineup-table");

    // View bindings
    this.playerDialog.addEventListener("click", this.dialogHandler);
    this.playerDeleteDialog.addEventListener("click", this.dialogHandler);
    this.lineupDialog.addEventListener("click", this.dialogHandler);
    this.shareButton.addEventListener("click", this.shareHandler);
    this.demoButton.addEventListener("click", this.demoHandler);
    this.playerAddButton.addEventListener("click", this.playerAddHandler);
    this.rosterList.addEventListener("click", this.rosterListHandler);
    this.playerForm.addEventListener("submit", this.playerFormHandler);
    this.playerDeleteForm.addEventListener("submit", this.playerDeleteFromHandler);
    this.lineupBuildButton.addEventListener("click", this.lineupBuildHandler);

    // Model subscription
    this.model.addListener(this.listener);

    // Init
    this.renderRoster();
  }

  /**
   * @type {import("./model.js").Listener}
   */
  listener = (eventType, newValue) => {
    switch (eventType) {
      case "load":
        this.renderRoster();
        break;
      case "create":
        if (newValue instanceof Player) {
          this.addPlayer(newValue);
        }
        break;
      case "update":
        if (newValue instanceof Player) {
          this.replacePlayer(newValue);
        }
        break;
      case "delete":
        if (typeof newValue === "string") {
          this.removePlayer(newValue);
        }
        break;
    }
  };

  /**
   * Closes the dialog if backdrop or close button is clicked.
   * @param {MouseEvent} e
   */
  dialogHandler = (e) => {
    if (!(e.target instanceof HTMLElement)) return;
    if (!(e.currentTarget instanceof HTMLDialogElement)) return;
    if (e.target.getAttribute("data-modal-backdrop") || e.target.getAttribute("data-action") === "close") {
      e.currentTarget.close();
    }
  };

  shareHandler = () => {
    window.navigator.clipboard.writeText(window.location.href);
    this.shareButton.replaceChildren("Link copied!");
    this.shareButton.classList.add("opacity-0");
    setTimeout(() => {
      this.shareButton.classList.remove("opacity-0");
      this.shareButton.replaceChildren("Share");
    }, 1000);
  };

  demoHandler = () => {
    this.model.loadDemo();
  };

  playerAddHandler = () => {
    this.playerDialog.querySelector("h2").replaceChildren("Add player");
    this.playerForm.reset();
    this.playerForm.id.value = "";
    this.playerForm.position.value = "F";
    this.playerForm.active.checked = true;
    this.playerDialog.showModal();
  };

  /**
   * Opens form to edit or confirm delete of a player.
   * @param {MouseEvent} e
   */
  rosterListHandler = (e) => {
    if (!(e.target instanceof HTMLElement)) return;

    const id = e.target.getAttribute("data-player-id");
    const action = e.target.getAttribute("data-action");
    const player = this.model.getPlayer(id);
    const idTag = t("small", { class: "text-xs text-gray-600 font-normal ml-2" }, "id: ", player?.id);

    if (id && action === "delete") {
      this.playerDeleteDialog.querySelector("h2").replaceChildren("Delete player", idTag);
      this.playerDeleteDialog
        .querySelector("p")
        .replaceChildren("Are you sure you want to delete the player named ", t("strong", player.name), "?");
      this.playerDeleteForm.reset();
      this.playerDeleteForm.id.value = player.id;
      this.playerDeleteDialog.showModal();
    }

    if (id && action === "update") {
      this.playerDialog.querySelector("h2").replaceChildren("Edit player", idTag);
      this.playerForm.reset();
      this.playerForm.id.value = player.id;
      this.playerForm.name.value = player.name;
      this.playerForm.number.value = player.number;
      this.playerForm.skill.value = player.skill;
      this.playerForm.position.value = player.position;
      this.playerForm.active.checked = player.active;
      this.playerDialog.showModal();
    }
  };

  playerFormHandler = () => {
    const formData = new FormData(this.playerForm);
    const id = formData.get("id").toString();
    const hasId = !!id;
    const action = hasId ? "update" : "create";
    const player = new Player({
      id: hasId ? id : xid(),
      name: formData.get("name").toString(),
      number: formData.get("number").toString(),
      skill: Number.parseInt(formData.get("skill").toString(), 10),
      position: formData.get("position").toString(),
      active: !!formData.get("active"),
    });
    if (action === "create") this.model.createPlayer(player);
    if (action === "update") this.model.updatePlayer(player);
    this.playerForm.reset();
  };

  playerDeleteFromHandler = () => {
    const formData = new FormData(this.playerDeleteForm);
    const id = formData.get("id").toString();
    this.model.deletePlayer(id);
    this.playerDeleteForm.reset();
  };

  lineupBuildHandler = () => {
    console.log(this.model.validate());
    this.renderLineup();
    this.lineupDialog.showModal();
  };

  /**
   * Updates roster summary and empty state
   */
  updateRoster() {
    const activeCount = this.model.activePlayers.length;
    this.rosterSummary.replaceChildren(
      t("span", activeCount, ` active player${activeCount === 1 ? "" : "s"}, `, this.model.playerCount, " total"),
    );

    if (this.model.playerCount === 0) {
      this.rosterEmpty.classList.remove("hidden");
    } else {
      this.rosterEmpty.classList.add("hidden");
    }
  }

  /**
   * Builds a player list item DOM element.
   * @param {Player} player
   */
  buildPlayer(player) {
    return t(
      "div",
      { role: "listitem", "data-player-id": player.id, class: "flex flex-col border-b border-gray-800 py-4" },
      [
        t("div", { class: "flex justify-between text-base font-medium text-gray-200" }, [
          t("h3", [
            t("span", {
              "aria-label": player.active ? "Active" : "Inactive",
              class: [
                "inline-flex w-2.5 h-2.5 rounded-full me-1.5 shrink-0",
                player.active ? "bg-blue-500" : "bg-gray-700",
              ],
            }),
            player.name,
          ]),
          t("p", "#", player.number),
        ]),
        t("div", { class: "flex items-center justify-between" }, [
          t("p", { class: "text-sm text-gray-400" }, "Skill: ", [
            t("strong", player.skill),
            t("span", player.position === "G" && " | Goalie"),
          ]),
          t("div", { class: "flex gap-2 -mr-2" }, [
            t(
              "button",
              {
                type: "button",
                "data-action": "delete",
                "data-player-id": player.id,
                class: "text-sm font-medium text-red-400 hover:text-red-300 cursor-pointer px-2 py-1 transition-colors",
              },
              "Delete",
            ),
            t(
              "button",
              {
                type: "button",
                "data-action": "update",
                "data-player-id": player.id,
                class:
                  "text-sm font-medium text-blue-400 hover:text-blue-300 cursor-pointer px-2 py-1 transition-colors",
              },
              "Edit",
            ),
          ]),
        ]),
      ],
    );
  }

  /**
   * Renders player list items in DOM.
   */
  renderRoster() {
    const frag = new DocumentFragment();
    frag.append(...this.model.players.map(this.buildPlayer));
    this.rosterList.replaceChildren(frag);
    this.updateRoster();
  }

  /**
   * Removes a player list item from the DOM.
   * @param {string} id
   */
  removePlayer(id) {
    this.rosterList.querySelector(`[data-player-id="${id}"`).remove();
    this.updateRoster();
  }

  /**
   * Appends a player list item to the DOM.
   * @param {Player} player
   */
  addPlayer(player) {
    this.rosterList.append(this.buildPlayer(player));
    this.updateRoster();
  }

  /**
   * Replaces a player list item in the DOM.
   * @param {Player} player
   */
  replacePlayer(player) {
    this.rosterList.replaceChild(
      this.buildPlayer(player),
      this.rosterList.querySelector(`[data-player-id="${player.id}"`),
    );
  }

  /**
   * Builds a "dot" DOM element for lineup table.
   * @param {boolean} marked
   */
  buildLineupDot(marked) {
    return t("td", { class: "py-2 px-1 sm:px-2 border-x border-gray-800 text-center text-gray-200" }, [
      t(
        "div",
        {
          class:
            "inline-flex w-4 h-4 min-w-4 bg-gray-200 rounded-full text-sm align-baseline items-center justify-center empty:hidden",
        },
        marked && "X",
      ),
    ]);
  }

  /**
   * Builds a player row DOM element for lineup table.
   * @param {Player} player
   */
  buildLineupPlayer(player) {
    /** @param {boolean} marked */
    const dot = (marked) =>
      t("td", { class: "py-2 px-1 sm:px-2 border-x border-gray-800 text-center text-gray-200" }, [
        t(
          "div",
          {
            class:
              "inline-flex w-4 h-4 min-w-4 bg-gray-200 rounded-full text-sm align-baseline items-center justify-center empty:hidden",
          },
          marked && "X",
        ),
      ]);
    return t("tr", { class: "odd:bg-gray-900" }, [
      t("td", { class: "p-2 border-gray-800 text-gray-200 font-medium" }, player.name),
      t("td", { class: "p-2 border-gray-800 text-gray-200 font-medium" }, player.number),
      t("td", { class: "p-2 border-gray-800 text-gray-200 text-center" }, player.position),
      ...player.lines.map((l) => dot(l)),
    ]);
  }

  buildLineupStats(scores, standardDeviation) {
    return [
      t("tr", [
        t("td", { colspan: "3", class: "pt-2 px-2 text-right" }, "Line scores:"),
        ...scores.map((s) => t("td", { class: "pt-2 px-1 sm:px-2" }, s)),
      ]),
      t("tr", {}, [
        t("td", { colspan: "3", class: "px-2 text-right" }, "Standard deviation:"),
        t("td", { colspan: "9", class: "px-1 sm:px-2" }, standardDeviation.toFixed(2)),
      ]),
    ];
  }

  /**
   * Renders Lineup table's player and stat rows in DOM.
   */
  renderLineup() {
    const { players, scores, sd } = this.model.buildLineup();
    const tbody = this.lineupTable.querySelector("tbody");
    const tbodyFrag = document.createDocumentFragment();
    const tfoot = this.lineupTable.querySelector("tfoot");
    const tfootFrag = document.createDocumentFragment();
    tbodyFrag.append(...players.map(this.buildLineupPlayer));
    tfootFrag.append(...this.buildLineupStats(scores, sd));
    tbody.replaceChildren(tbodyFrag);
    tfoot.replaceChildren(tfootFrag);
  }
}
