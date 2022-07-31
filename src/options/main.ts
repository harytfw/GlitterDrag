import App from './options.svelte'


function setup() {
	new App({ target: document.body })

}

if (document.readyState !== 'loading') {
	setup()
} else {
	document.addEventListener('DOMContentLoaded', () => {
		setup()
	});
}
