<svelte:options />

<script lang="ts">
    import cloneDeep from "lodash-es/cloneDeep";
    import intersection from "lodash-es/intersection";

    import browser from "webextension-polyfill";

    import {
        ActionConfig,
        Asset,
        CommandKind,
        CommandRequest,
        CommonConfig,
        ContextDataType,
        ContextType,
        LogLevel,
        OperationMode,
        Script,
        type PlainActionConfig,
        type PlainCommonConfig,
    } from "../config/config";

    import { rootLog } from "../utils/log";
    import {
        commands,
        contextDataTypeOptionsForLink,
        contextTypeOptions,
        directionOptions,
        modeOptions,
        tabPositionOptions,
        type MultipleOptionModel,
    } from "./common";
    import * as store from "./store";
    import { isValueInputElement, titleCase, uuidv4 } from "./utils";

    import {
        angleToDirection,
        getAngle as transformAngle,
    } from "../content_scripts/utils";
    import { defaultLocaleMessage as locale } from "../localization/helper";
    import { isFirefox } from "../utils/vendor";
    import {
        actionOptionConfig,
        applyValueChange,
        collectChange,
        type ValueChange,
    } from "./cfg_utils";
    import ConfirmDialog from "./confirm_dialog.svelte";
    import { includes } from "lodash-es";

    const log = rootLog.subLogger(LogLevel.V, "actions");

    let originActions: PlainActionConfig[] = [];
    let curentActions: PlainActionConfig[] = [];
    let transformedActions: ActionConfig[] = [];

    const defaultAddActionModel = {
        id: "",
        name: "",
        contextType: ContextType.selection,
        command: CommandKind.invalid,
        mode: OperationMode.normal,
    };
    let addActionModel = cloneDeep(defaultAddActionModel);

    let editId: string = "";
    let editPlainAction: PlainActionConfig = {};
    $: editAction = new ActionConfig(editPlainAction);

    let addActionDialog: HTMLDialogElement;
    let confirmDeleteDialog: ConfirmDialog;
    let editActionDialog: HTMLDialogElement;
    let organizeActionOrderDialog: HTMLDialogElement;

    let directionEditorEditFlag: boolean = false;
    let directionEditorValues: string[] = [];
    let directionEditorText = "";
    let directionEditorPos1 = { x: 0, y: 0 };
    let directionEditorPos2 = { x: 0, y: 0 };

    let filter: {
        name?: string;
        contextType?: string;
        command?: string;
        mode?: string;
    } = {};

    let scriptOptions: Readonly<MultipleOptionModel> = [];
    let assetOptions: Readonly<MultipleOptionModel> = [];
    let requestOptions: Readonly<MultipleOptionModel> = [];
    let containerOptions: Readonly<MultipleOptionModel> = [];

    let originCommonConfig: PlainCommonConfig = {};
    let transformedCommonConfig: CommonConfig = new CommonConfig(
        originCommonConfig
    );

    store.assets.subscribe((arr) => {
        assetOptions = arr
            .map((s) => new Asset(s))
            .map((s) => {
                return {
                    label: s.name,
                    value: s.id,
                };
            });
    });

    store.scripts.subscribe((arr) => {
        scriptOptions = arr
            .map((s) => new Script(s))
            .map((s) => {
                return {
                    label: s.name,
                    value: s.id,
                };
            });
    });

    store.requests.subscribe(async (arr) => {
        requestOptions = arr
            .map((r) => new CommandRequest(r))
            .map((r) => {
                return {
                    label: r.name,
                    value: r.id,
                };
            });
    });

    store.containers.subscribe((arr) => {
        containerOptions = [
            { label: locale.inheritContainer, value: "" },
            ...arr.map((c) => {
                return {
                    label: c,
                    value: c,
                };
            }),
        ];
    });

    store.common.subscribe((val) => {
        originCommonConfig = cloneDeep(val);
        transformedCommonConfig = new CommonConfig(originCommonConfig);
    });

    const applyFilter = () => {
        log.V("current filter: ", filter);
        const remainIds = originActions
            .map((s) => new ActionConfig(s))
            .filter((o) => {
                if (typeof filter.name === "string") {
                    return o.name.includes(filter.name);
                }
                return true;
            })
            .filter((o) => {
                if (typeof filter.contextType === "string") {
                    return o.condition.contextTypes.includes(
                        filter.contextType as ContextType
                    );
                }
                return true;
            })
            .filter((o) => {
                if (typeof filter.mode === "string") {
                    return o.condition.modes.includes(
                        filter.mode as OperationMode
                    );
                }
                return true;
            })
            .filter((o) => {
                if (typeof filter.command === "string") {
                    return o.command.includes(filter.command as CommandKind);
                }
                return true;
            })
            .map((o) => o.id);
        curentActions = originActions.filter((o) => remainIds.includes(o.id));
        transformedActions = curentActions.map((s) => new ActionConfig(s));
    };

    store.actions.subscribe((arr) => {
        originActions = cloneDeep(arr);
        curentActions = originActions;
        applyFilter();
    });

    const resetFilter = () => {
        log.V("reset filter");
        filter = {};
        applyFilter();
    };

    const queryActionId = (target: EventTarget): string => {
        if (!(target instanceof HTMLElement)) {
            return "";
        }
        let cur: HTMLElement = target.closest("[data-id]");
        if (cur) {
            return cur.dataset["id"];
        }
        return "";
    };

    const onFilterChange = (e: Event) => {
        const target = e.target;
        if (!(target instanceof HTMLElement)) {
            return;
        }
        const form = target.closest("form");
        const formData = new FormData(form);
        for (const [f, data] of formData.entries()) {
            const text = data.toString();
            if (text.length === 0) {
                delete filter[f];
            } else {
                filter[f] = data.toString();
            }
        }
        applyFilter();
    };

    const onOpenAddActionDialog = () => {
        addActionModel = cloneDeep(defaultAddActionModel);

        if (filter.command) {
            addActionModel.command = filter.command as CommandKind;
        } else {
            addActionModel.command = CommandKind.invalid;
        }

        if (filter.contextType) {
            addActionModel.contextType = filter.contextType as ContextType;
        } else {
            addActionModel.contextType = ContextType.selection;
        }

        if (filter.name) {
            addActionModel.name = filter.name;
        } else {
            addActionModel.name = "";
        }

        if (filter.mode) {
            addActionModel.mode = filter.mode as OperationMode;
        } else {
            addActionModel.mode = OperationMode.normal;
        }

        addActionDialog.showModal();
    };

    const onOpenEditActionDialog = (e: MouseEvent) => {
        if (!(e.target instanceof HTMLElement)) {
            return;
        }
        const id = queryActionId(e.target);
        editId = id;
        editPlainAction = cloneDeep(curentActions.find((a) => a.id === id));
        log.V("edit action: ", editId, editPlainAction);
        editActionDialog.showModal();
    };

    const onDuplicateAction = (e: MouseEvent) => {
        const id = queryActionId(e.target);
        if (!id.length) {
            log.E("id not found: ", e);
            return;
        }
        store.userConfig.update((uc) => {
            const n = cloneDeep(uc.actions.find((a) => a.id === id));
            if (!n) {
                throw new Error("TODO: ");
            }
            n.id = uuidv4();

            let newName = n.name + " (1)";
            const matches = Array.from(n.name.matchAll(/\((\d+)\)/g)).reverse();
            for (const match of matches) {
                const start = match.index;
                const end = match.index + match[0].length;
                newName =
                    n.name.substring(0, start) +
                    `(${parseInt(match[1]) + 1})` +
                    n.name.substring(end);
                break;
            }
            n.name = newName;
            log.V("new name: ", newName);
            uc.actions.unshift(n);
            return uc;
        });
    };

    const onDeleteAction = async (e: MouseEvent) => {
        const id = queryActionId(e.target);
        if (!id.length) {
            return;
        }
        const ok = await confirmDeleteDialog.confirm(
            browser.i18n.getMessage(
                "confirmDelete",
                transformedActions.find((a) => a.id === id).name
            )
        );
        if (ok) {
            log.V("delete id: ", id);
            store.userConfig.update((uc) => {
                uc.actions = uc.actions.filter((a) => a.id !== id);
                return uc;
            });
        }
    };

    const onEditActionDialogFormChange = async (e: Event) => {
        if (!(e.target instanceof HTMLElement)) {
            return;
        }
        const change = await collectChange(e.target, actionOptionConfig);
        log.V("dialog temporary change: ", change);
        editPlainAction = applyValueChange(editPlainAction, [change]);
    };

    const onEditActionDialogConfirmBtnClick = async (e: MouseEvent) => {
        if (!(e.target instanceof HTMLElement)) {
            return;
        }
        const form = e.target.closest("form");
        const seenPath = new Set();
        for (const element of form.querySelectorAll("[name]")) {
            if (!isValueInputElement(element)) {
                continue;
            }
            const path = element.name;
            if (seenPath.has(path)) {
                log.V("skip duplicate path: ", path);
                continue;
            }
            seenPath.add(path);
            const change = await collectChange(element);
            for (const cfg of actionOptionConfig) {
                if (cfg.path.includes(change.path) && cfg.requestPermission) {
                    const ok = await cfg.requestPermission(change.values);
                    if (!ok) {
                        log.E("request permission failed: ", change.path);
                    }
                    break;
                }
            }
        }
    };

    const onOperationModeChange = async (e: Event) => {
        if (!(e.target instanceof HTMLElement)) {
            return;
        }
        const change = await collectChange(e.target);
        store.userConfig.update((uc) => {
            uc.common = applyValueChange(uc.common, [change]);
            return uc;
        });
    };

    const onEditActionDialogConfirm = async (e: Event) => {
        if (!(e.target instanceof HTMLElement)) {
            return;
        }
        const form = e.target.querySelector("form");
        if (!form.reportValidity()) {
            return;
        }
        const changes: ValueChange[] = [];
        const seenPath = new Set();
        for (const element of form.querySelectorAll("[name]")) {
            if (
                element instanceof HTMLInputElement ||
                element instanceof HTMLSelectElement ||
                element instanceof HTMLTextAreaElement
            ) {
                const path = element.name;
                if (seenPath.has(path)) {
                    log.V("skip duplicate path: ", path);
                    continue;
                }
                seenPath.add(path);
                const change = await collectChange(element, actionOptionConfig);
                changes.push(change);
            }
        }
        log.V("final changes: ", changes);
        store.userConfig.update((uc) => {
            const index = uc.actions.findIndex((t) => t.id === editId);
            uc.actions[index] = applyValueChange(uc.actions[index], changes);
            return uc;
        });
        editId = "";
        editPlainAction = {};
    };

    const onAddActionSave = () => {
        const form = addActionDialog.querySelector("form");
        if (!form.reportValidity()) {
            return;
        }
        let { id, name, command, contextType, mode } = addActionModel;
        if (!id) {
            id = uuidv4();
        }
        store.userConfig.update((uc) => {
            const cfg: PlainActionConfig = {
                id,
                name,
                command,
                condition: { contextTypes: [contextType], modes: [mode] },
            };
            log.VV("add action: ", cloneDeep(cfg));
            uc.actions.unshift(cfg);
            return uc;
        });
    };

    const pickDirectionDragStart = (e: DragEvent) => {
        directionEditorPos1.x = directionEditorPos2.x = e.clientX;
        directionEditorPos1.y = directionEditorPos2.y = e.clientY;
        directionEditorEditFlag = true;
        directionEditorValues = [];
        directionEditorText = "[";
    };

    const pickDirectionDragOver = (e: DragEvent) => {
        directionEditorPos2.x = e.clientX;
        directionEditorPos2.y = e.clientY;
        const dist = Math.hypot(
            directionEditorPos1.x - directionEditorPos2.x,
            directionEditorPos1.y - directionEditorPos2.y
        );
        if (dist < 5) {
            return;
        }

        const label = angleToDirection(
            OperationMode.chain,
            transformAngle(directionEditorPos1, directionEditorPos2)
        );

        if (
            directionEditorValues.length === 0 ||
            directionEditorValues[directionEditorValues.length - 1] !== label
        ) {
            if (directionEditorValues.length > 0) {
                directionEditorText += ", ";
            }
            directionEditorValues.push(label);
            directionEditorText += locale["direction" + titleCase(label)];
        }
    };

    const pickDirectionDragEnd = (e: DragEvent) => {
        const change = {
            path: "condition.directions",
            values: cloneDeep(directionEditorValues),
            multiple: true,
        };
        editPlainAction = applyValueChange(editPlainAction, [change]);
        directionEditorEditFlag = false;
        directionEditorText = "";
        directionEditorValues = [];
    };

    let organizeOrderContainer: HTMLElement;
    let organizeOrderMarker: HTMLElement | null = null;

    const openOrganizeActionOrderDialog = () => {
        while (organizeOrderContainer.firstElementChild) {
            organizeOrderContainer.firstElementChild.remove();
        }
        for (const action of transformedActions) {
            const li = document.createElement("li");
            li.dataset["id"] = action.id;
            li.draggable = true;
            li.textContent = action.name;
            li.classList.add("organizeOrderItem");
            organizeOrderContainer.append(li);
        }
        organizeActionOrderDialog.showModal();
    };
    const organizeActionOrderConfirm = () => {
        const ids: string[] = [];
        for (const element of organizeOrderContainer.children) {
            const id = (element as HTMLElement).dataset["id"];
            ids.push(id);
        }
        const m = new Map(ids.map((id, i) => [id, i]));
        store.userConfig.update((uc) => {
            const sorted = [];
            const updatePlaces = [];

            for (let i = 0; i < uc.actions.length; i++) {
                if (m.has(uc.actions[i].id)) {
                    sorted.push(uc.actions[i]);
                    updatePlaces.push(i);
                }
            }

            sorted.sort((a, b) => {
                if (m.get(a.id) < m.get(b.id)) {
                    return -1;
                } else if (m.get(a.id) > m.get(b.id)) {
                    return 1;
                }
                return 0;
            });

            for (let i = 0; i < sorted.length; i++) {
                uc.actions[updatePlaces[i]] = sorted[i];
            }

            return uc;
        });
        organizeActionOrderDialog.close();
    };

    const organizeActionOrderDragStart = (e: DragEvent) => {
        organizeOrderMarker = (e.target as HTMLElement).closest(
            ".organizeOrderItem"
        );
        organizeOrderMarker.style.backgroundColor = "red";
        log.V("organize order:", organizeOrderMarker.dataset["id"]);
    };

    const organizeActionOrderDragEnd = (e: DragEvent) => {
        organizeOrderMarker.style.backgroundColor = "";
    };

    const organizeActionOrderDragEnter = (e: DragEvent) => {
        if (organizeOrderMarker) {
            const target = (e.target as HTMLElement).closest(
                ".organizeOrderItem"
            ) as HTMLElement;
            if (!target || target === organizeOrderMarker) {
                return;
            }
            const pos = organizeOrderMarker.compareDocumentPosition(target);
            if ((pos & 2) != 0) {
                target.parentNode.insertBefore(organizeOrderMarker, target);
                log.V("organize order, move up:", target);
            } else if ((pos & 4) != 0) {
                target.parentNode.insertBefore(
                    organizeOrderMarker,
                    target.nextElementSibling
                );
                log.V("organize order, move down:", target);
            }
        }
    };
</script>

<div>
    <div id="actions-ctrl-area">
        <form
            style="grid-area: row1"
            on:submit|preventDefault={() => {}}
            on:change={onOperationModeChange}
        >
            <fieldset>
                <legend>{locale.operationMode}</legend>
                <div class="h-flex">
                    <label for="mode.selection"
                        >{locale.contextTypeSelection}</label
                    >
                    <select name="mode.selection">
                        {#each modeOptions as m}
                            <option
                                value={m.value}
                                selected={transformedCommonConfig.mode
                                    .selection === m.value}
                            >
                                {m.label}
                            </option>
                        {/each}
                    </select>
                    <label for="mode.link">{locale.contextTypeLink}</label>
                    <select name="mode.link">
                        {#each modeOptions as m}
                            <option
                                value={m.value}
                                selected={transformedCommonConfig.mode.link ===
                                    m.value}
                            >
                                {m.label}
                            </option>
                        {/each}
                    </select>
                    <label for="mode.image">{locale.contextTypeImage}</label>
                    <select name="mode.image">
                        {#each modeOptions as m}
                            <option
                                value={m.value}
                                selected={transformedCommonConfig.mode.image ===
                                    m.value}
                            >
                                {m.label}
                            </option>
                        {/each}
                    </select>
                </div>
            </fieldset>
        </form>
        <form style="grid-area: row2" on:submit|preventDefault={() => {}}>
            <fieldset>
                <legend>
                    {locale.manageActions}
                </legend>
                <div class="h-flex">
                    <button
                        id="addAction"
                        type="button"
                        on:click={onOpenAddActionDialog}
                    >
                        {locale.add}
                    </button>

                    <button
                        id="organizeActionOrder"
                        type="button"
                        on:click={openOrganizeActionOrderDialog}
                    >
                        {locale.organizeActionOrder}
                    </button>
                </div>
            </fieldset>
        </form>

        <form
            id="actions-filter"
            style="grid-area: row3;"
            on:change={onFilterChange}
            on:reset={resetFilter}
            on:submit|preventDefault={() => {}}
        >
            <fieldset>
                <legend>{locale.filterActions}</legend>
                <div class="h-flex">
                    <label for="contextType">{locale.contextType}</label>
                    <select name="contextType">
                        <option value=""> {locale.noFilter} </option>
                        {#each contextTypeOptions as t}
                            <option value={t.value}>
                                {t.label}
                            </option>
                        {/each}
                    </select>
                    <label for="mode">{locale.operationMode}</label>
                    <select name="mode">
                        <option value=""> {locale.noFilter} </option>
                        {#each modeOptions as c}
                            <option value={c.value}>
                                {c.label}
                            </option>
                        {/each}
                    </select>
                    <label for="command">{locale.command}</label>
                    <select name="command">
                        <option value=""> {locale.noFilter} </option>
                        {#each commands as c}
                            <option value={c.value}>
                                {c.label}
                            </option>
                        {/each}
                    </select>
                    <label for="name">{locale.name}</label>
                    <input name="name" />
                    <button type="reset">{locale.reset}</button>
                </div>
            </fieldset>
        </form>
    </div>
</div>
<section>
    <div style="display: flex; flex-direction: row; flex-wrap: wrap;">
        <table style="display: table;">
            <thead>
                <tr>
                    <th>
                        {locale.name}
                    </th>
                    <th>
                        {locale.contextType}
                    </th>
                    <th>
                        {locale.command}
                    </th>
                    <th> Operation </th>
                </tr>
            </thead>
            <tbody>
                {#each transformedActions as action}
                    <tr id="action-{action.id}" data-id={action.id}>
                        <td>
                            {action.name}
                        </td>
                        <td>
                            {action.condition.contextTypes.length > 0
                                ? locale[
                                      "contextType" +
                                          titleCase(
                                              action.condition.contextTypes[0]
                                          )
                                  ]
                                : ""}
                        </td>
                        <td>
                            {locale["command" + titleCase(action.command)]}
                        </td>
                        <!-- svelte-ignore a11y-invalid-attribute -->
                        <td>
                            <a
                                class="editAction"
                                href="#action-{action.id}"
                                on:click={onOpenEditActionDialog}
                            >
                                {locale.edit}
                            </a>
                            <a
                                class="duplicateAction"
                                href="#action-{action.id}"
                                on:click={onDuplicateAction}
                            >
                                {locale.duplicate}
                            </a>
                            <a
                                class="deleteAction"
                                href="#action-{action.id}"
                                on:click={onDeleteAction}
                            >
                                {locale.delete}
                            </a>
                        </td>
                    </tr>
                {/each}
            </tbody>
        </table>
        <!-- {#each [] as action}
            <form>
                <fieldset>
                    <input type="hidden" name="id" value={action.id} />
                    <legend>{action.name}</legend>
                    <p>
                        <label for="">{locale.name}</label>
                        <input
                            disabled={true}
                            type="text"
                            required={true}
                            value={action.name}
                        />
                    </p>
                    <p>
                        <label for="">{locale.contextType}</label>
                        <input
                            disabled={true}
                            type="text"
                            value={action.condition.contextTypes.length > 0
                                ? locale[
                                      "contextType" +
                                          titleCase(
                                              action.condition.contextTypes[0]
                                          )
                                  ]
                                : ""}
                        />
                    </p>
                    <p>
                        <label for="">
                            {locale.command}
                        </label>
                        <input
                            disabled={true}
                            type="text"
                            value={locale[
                                "command" + titleCase(action.command)
                            ]}
                        />
                    </p>
                    <div class="h-flex">
                        <button
                            id="editAction"
                            type="button"
                            on:click={onOpenEditActionDialog}
                        >
                            {locale.edit}
                        </button>
                        <button
                            id="duplicateAction"
                            type="button"
                            on:click={onDuplicateAction}
                        >
                            {locale.duplicate}
                        </button>
                        <button
                            id="deleteAction"
                            type="button"
                            on:click={onDeleteAction}
                        >
                            {locale.delete}
                        </button>
                    </div>
                </fieldset>
            </form>
        {/each} -->
    </div>
    <dialog bind:this={addActionDialog}>
        <form method="dialog">
            <p>
                <strong>{locale.add}</strong>
            </p>
            <p>
                <label for=""
                    >{locale.name}<span
                        class="help-question-mark"
                        title={locale.helpActionName}>❔</span
                    ></label
                >
                <input
                    type="text"
                    required={true}
                    bind:value={addActionModel.name}
                />
            </p>
            <p>
                <label for=""
                    >{locale.command}<span
                        class="help-question-mark"
                        title={locale.helpActionCommand}>❔</span
                    ></label
                >
                <select name="command" bind:value={addActionModel.command}>
                    {#each commands as c}
                        <option value={c.value}>
                            {c.label}
                        </option>
                    {/each}
                </select>
            </p>
            <p>
                <label for="contextType"
                    >{locale.contextType}<span
                        class="help-question-mark"
                        title={locale.helpActionContextType}>❔</span
                    ></label
                >
                <select
                    name="contextType"
                    bind:value={addActionModel.contextType}
                >
                    {#each contextTypeOptions as t}
                        <option value={t.value}>
                            {t.label}
                        </option>
                    {/each}
                </select>
            </p>
            <p>
                <label for="mode">
                    {locale.operationMode}
                    <span
                        class="help-question-mark"
                        title={locale.helpOperationMode}
                    >
                        ❔
                    </span></label
                >
                <select name="mode" bind:value={addActionModel.mode}>
                    {#each modeOptions as c}
                        <option value={c.value}>
                            {c.label}
                        </option>
                    {/each}
                    >
                </select>
            </p>
            <button type="submit" on:click={onAddActionSave}
                >{locale.add}</button
            >
        </form>
    </dialog>
    <dialog
        style="height: 80%; width: 60%"
        bind:this={editActionDialog}
        on:close={onEditActionDialogConfirm}
    >
        <form method="dialog" on:change={onEditActionDialogFormChange}>
            <p>
                <label for=""
                    >{locale.name}<span
                        class="help-question-mark"
                        title={locale.helpActionName}>❔</span
                    ></label
                >
                <input
                    name="name"
                    type="text"
                    required={true}
                    value={editAction.name}
                />
            </p>
            <p>
                <label for=""
                    >{locale.contextType}<span
                        class="help-question-mark"
                        title={locale.helpActionContextType}>❔</span
                    ></label
                >
            </p>
            <div
                style="display: flex; justify-content:start; align-items: center;"
            >
                {#each contextTypeOptions as t}
                    <label>
                        <input
                            name="condition.contextTypes"
                            type="radio"
                            value={t.value}
                            checked={editAction.condition.contextTypes.includes(
                                t.value
                            )}
                        />
                        {t.label}
                    </label>
                {/each}
            </div>
            <p>
                <label for=""
                    >{locale.command}<span
                        class="help-question-mark"
                        title={locale.helpActionCommand}>❔</span
                    ></label
                >
                <select name="command">
                    {#each commands as c}
                        <option
                            value={c.value}
                            selected={editAction.command === c.value}
                        >
                            {c.label}
                        </option>
                    {/each}
                </select>
            </p>
            <p>
                <label for=""
                    >{locale.prompt}<span
                        class="help-question-mark"
                        title={locale.helpActionPrompt}>❔</span
                    ></label
                >
                <input name="prompt" type="text" value={editAction.prompt} />
            </p>
            <p>
                <label for=""
                    >{locale.operationMode}<span
                        class="help-question-mark"
                        title={locale.helpActionOperationMode}>❔</span
                    ></label
                >
                <select name="condition.modes">
                    {#each modeOptions as m}
                        <option
                            value={m.value}
                            selected={editAction.condition.modes.includes(
                                m.value
                            )}
                        >
                            {m.label}
                        </option>
                    {/each}
                </select>
            </p>

            {#if editAction.condition.modes.includes(OperationMode.normal)}
                <p>
                    <label for=""
                        >{locale.direction}<span
                            class="help-question-mark"
                            title={locale.helpActionDirection}>❔</span
                        ></label
                    >
                </p>
                <div
                    style="display: flex; justify-content: start; align-items: center"
                >
                    {#each directionOptions as m}
                        <label>
                            <input
                                name="condition.directions"
                                type="radio"
                                value={m.value}
                                checked={editAction.condition.directions.includes(
                                    m.value
                                )}
                            />
                            {m.label}
                        </label>
                    {/each}
                </div>
            {:else if editAction.condition.modes.includes(OperationMode.chain)}
                <input
                    type="hidden"
                    name="condition.directions"
                    value={editAction.condition.directions.join(",")}
                />
                <p>
                    <label for=""
                        >{locale.direction}<span
                            class="help-question-mark"
                            title={locale.helpActionDirectionChain}>❔</span
                        ></label
                    >
                </p>
                <div
                    style="display: flex; flex-direction: row; justify-content: center;
align-items: center; width: 100px; height: 100px; background-color: #0909090f; justify-content: center; align-items: center"
                    on:dragover={pickDirectionDragOver}
                >
                    <div
                        class="drag"
                        draggable="true"
                        style="font-size: 1rem; cursor: move;"
                        on:dragstart={pickDirectionDragStart}
                        on:dragend={pickDirectionDragEnd}
                    >
                        ≡
                    </div>
                </div>
                <p>
                    <span>
                        {directionEditorEditFlag
                            ? directionEditorText
                            : "[" +
                              editAction.condition.directions
                                  .map(
                                      (l) => locale["direction" + titleCase(l)]
                                  )
                                  .join(", ") +
                              "]"}
                    </span>
                </p>
            {/if}

            {#if intersection( editAction.condition.contextTypes, [ContextType.link, ContextType.image] ).length > 0}
                <p>
                    <label for=""
                        >{locale.preferContextDataType}<span
                            class="help-question-mark"
                            title={locale.helpActionPreferDataType}>❔</span
                        ></label
                    >
                </p>
                <div
                    style="display: flex; justify-content: start; align-items: center;"
                >
                    {#if editAction.condition.contextTypes.includes(ContextType.link)}
                        {#each [ContextDataType.link, ContextDataType.linkText] as t}
                            <label>
                                <input
                                    type="checkbox"
                                    name="config.preferDataTypes"
                                    value={t}
                                    checked={editAction.config.preferDataTypes.includes(
                                        t
                                    )}
                                />
                                {locale[
                                    "contextDataType" +
                                        titleCase(t)
                                ]}
                            </label>
                        {/each}
                    {/if}
                    {#if editAction.condition.contextTypes.includes(ContextType.image)}
                        {#each [ContextDataType.image, ContextDataType.imageSource] as t}
                            <label>
                                <input
                                    type="checkbox"
                                    name="config.preferDataTypes"
                                    value={t}
                                    checked={editAction.config.preferDataTypes.includes(
                                        t
                                    )}
                                />
                                {locale[
                                    "contextDataType" +
                                        titleCase(t)
                                ]}
                            </label>
                        {/each}
                    {/if}
                </div>
            {/if}
            {#if [CommandKind.request, CommandKind.open].includes(editAction.command)}
                <p>
                    <label>
                        <input
                            name="config.activeTab"
                            type="checkbox"
                            value="true"
                            checked={editAction.config.activeTab}
                        />
                        {locale.activeTab}
                    </label>
                </p>
                <p>
                    <label for="">{locale.tabPosition}</label>
                    <select name="config.tabPosition">
                        {#each tabPositionOptions as pos}
                            <option
                                value={pos.value}
                                selected={editAction.config.tabPosition ===
                                    pos.value}
                            >
                                {pos.label}
                            </option>
                        {/each}
                    </select>
                </p>
            {/if}
            {#if editAction.command === CommandKind.request}
                <p>
                    <label for=""
                        >{locale.requests}<span
                            class="help-question-mark"
                            title={locale.helpCommandRequest}>❔</span
                        ></label
                    >
                    <select name="config.requestId">
                        {#each requestOptions as req}
                            <option
                                selected={editAction.config.requestId ===
                                    req.value}
                                value={req.value}
                            >
                                {req.label}
                            </option>
                        {/each}
                    </select>
                </p>
            {/if}
            {#if editAction.command === CommandKind.script}
                <p>
                    <label for=""
                        >{locale.scripts}<span
                            class="help-question-mark"
                            title={locale.helpScript}>❔</span
                        ></label
                    >
                    <select name="config.scriptId">
                        {#each scriptOptions as script}
                            <option
                                selected={editAction.config.scriptId ===
                                    script.value}
                                value={script.value}
                            >
                                {script.label}
                            </option>
                        {/each}
                    </select>
                </p>
            {/if}
            {#if [OperationMode.gridMenu, OperationMode.circleMenu].some( (target) => editAction.condition.modes.includes(target) )}
                <p>
                    <label for=""
                        >{locale.actionIcon}<span
                            class="help-question-mark"
                            title={locale.helpActionIcon}>❔</span
                        ></label
                    >
                    <select name="iconAssetId">
                        {#each assetOptions as asset}
                            <option
                                selected={editAction.iconAssetId ===
                                    asset.value}
                                value={asset.value}
                            >
                                {asset.label}
                            </option>
                        {/each}
                    </select>
                </p>
            {/if}
            {#if editAction.command === CommandKind.download}
                <p>
                    <label for="">{locale.downloadDirectory}</label>
                    <input
                        name="config.directory"
                        type="text"
                        value={editAction.config.directory}
                    />
                </p>

                <p>
                    <label>
                        <input
                            name="config.showSaveAsDialog"
                            type="checkbox"
                            value="true"
                            checked={editAction.config.showSaveAsDialog}
                        />
                        {locale.showSaveAsDialog}
                    </label>
                </p>
            {/if}

            {#if isFirefox()}
                <p>
                    <label for=""
                        >{locale.container}<span
                            class="help-question-mark"
                            title={locale.helpActionContainer}>❔</span
                        ></label
                    >
                    <select name="config.container">
                        {#each containerOptions as c}
                            <option
                                selected={editAction.config.container ===
                                    c.value}
                                value={c.value}
                            >
                                {c.label}
                            </option>
                        {/each}
                    </select>
                </p>
            {/if}
            <button type="submit" on:click={onEditActionDialogConfirmBtnClick}>
                {locale.confirm}
            </button>
        </form>
    </dialog>
    <dialog bind:this={organizeActionOrderDialog} style="width: 60%">
        <p>
            <button type="button" on:click={organizeActionOrderConfirm}
                >{locale.confirm}</button
            >
        </p>
        <ol
            class="organizeOrderContainer"
            bind:this={organizeOrderContainer}
            on:dragstart={organizeActionOrderDragStart}
            on:dragend={organizeActionOrderDragEnd}
            on:dragover={organizeActionOrderDragEnter}
        />
    </dialog>
    <ConfirmDialog bind:this={confirmDeleteDialog} />
</section>
