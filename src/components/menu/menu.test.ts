import { MenuLayout } from "../../config/config";
import { onDocumentLoaded } from "../../content_scripts/utils";
import { updateMenu } from "./menu";

onDocumentLoaded(()=>{
	updateMenu({
		type: "show",
		layout: MenuLayout.circle,
		center: {x: 100, y: 100},
		items: [
			{
				id: "1",
				title: "1",
				htmlContent: ""
			},
			{
				id: "2",
				title: "2",
				htmlContent: ""
			},
			{
				id: "3",
				title: "3",
				htmlContent: ""
			},
		]
	})
})
