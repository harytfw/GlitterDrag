import { updateIndicator } from "./indicator";
import { onDocumentLoaded } from "../../content_scripts/utils";

onDocumentLoaded(()=>{
	updateIndicator({
		type: "show",
		radius: 100,
		center: {
			x: 500,
			y: 500
		}
	})
})