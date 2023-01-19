<svelte:options />

<script lang="ts">
    import { Feature, LogLevel } from "../config/config";

    import { rootLog } from "../utils/log";
    import { featureOptions } from "./common";
    import * as store from "./store";
    import { isValueInputElement } from "./utils";
    import defaultTo from "lodash-es/defaultTo";

    const log = rootLog.subLogger(LogLevel.V, "feature");
    let features: Feature[] = [];
    store.userConfig.subscribe((cfg) => {
        features = defaultTo(cfg.features, []) as Feature[];
    });

    function onchange(event: Event) {
        const { target } = event;
        if (!isValueInputElement(target)) {
            return;
        }
        if (!target.checked) {
            log.V("remove feature: ", target.value);
            store.userConfig.update((cfg) => {
                cfg.features = cfg.features.filter((f) => f !== target.value);
                return cfg;
            });
            return;
        } else {
            log.V("add feature: ", target.value);
            store.userConfig.update((cfg) => {
                cfg.features.push(target.value);
                return cfg;
            });
        }
    }
</script>

<div style="display: flex;">
    <form on:change={onchange}>
        {#each featureOptions as featureOption}
            <label>
                <input
                    type="checkbox"
                    value={featureOption.value}
                    checked={features.includes(featureOption.value)}
                />
                {featureOption.label}
            </label>
        {/each}
    </form>
</div>
