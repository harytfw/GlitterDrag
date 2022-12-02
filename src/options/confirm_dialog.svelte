<svelte:options/>

<script lang="ts">
	import { localeMessageProxy } from "../locale";

	const locale = localeMessageProxy();

	let dialog: HTMLDialogElement;
	let text: string = "";

	export async function confirm(prompt: string): Promise<boolean> {
		return new Promise((resolve) => {
			text = prompt;
			dialog.returnValue = "";
			dialog.addEventListener(
				"close",
				() => {
					if (dialog.returnValue === "default") {
						resolve(true);
						return;
					}
					resolve(false);
				},
				{ once: true }
			);
			dialog.showModal();
		});
	}
</script>

<dialog bind:this={dialog}>
	<form method="dialog">
		<p>
			{text}
		</p>
		<div>
			<button type="submit" value="default">{locale.confirm}</button>
			<button type="submit" value="cancel">{locale.cancel}</button>
		</div>
	</form>
</dialog>
