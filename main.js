import projectsData from './projects.json' with { type: 'json' };
import { marked } from "https://cdn.jsdelivr.net/npm/marked/lib/marked.esm.js";

const projectsSection = document.getElementById('projects');
const gradientColors = ['#ff0000', '#ff7f00', '#ffff00', '#00ff00', '#0000ff', '#4b0082', '#9400d3'];
const sizeMax = new Map([
	['font-size', 32],
	['padding', 28],
	['padding-small', 14],
	['radius', 32],
	['size', 100],
]);
const sizeMin = new Map([
	['font-size', 12],
	['padding', 4],
	['padding-small', 2],
	['radius', 6],
	['size', 10],
]);

function updateProjects() {
	// clear projects
	projectsSection.innerHTML = '';

	// get current tag
	const currentTag = document.querySelector('#filter button.active')?.dataset.tag || 'all';

	projectsData.sort((a, b) => b.score - a.score);
	// Create DOM Section
	for (const project of projectsData) {
		let content = marked.parse(project.content);
		content = content.replace(/<h1>/g, '<h2>');
		const article = document.createElement('article');
		article.classList.add(...project.tags.map(tag => tag.toLowerCase().replace(/\s+/g, '-')));
		if (currentTag !== 'all' && !article.classList.contains(currentTag)) {
			continue;
		}
		if (project.links.url || project.images.length > 0) {
			article.classList.add('-link');
		}

		// Project Template
		article.innerHTML = `
			<h2>${project.title}</h2>
			<h3>${project.company}</h3>
			<h4>${project.year}</h4>
			<div>${content}</div>
			${
				project.links.url ? `
				<div class="project-links">
					<a class="project-link" href="${project.links.url}" target="_blank"></a>
				</div>
			` : ''}
			${
				project.images.length > 0 ? `
				<div class="project-images">
					${project.images.map(image => `<img class="project-image" data-src="images/${project.slug}_${image}" alt="${project.title}">`).join('')}
				</div>
			` : ''}
		`;
		projectsSection.appendChild(article);

		// Event Listener: open modal
		article.querySelectorAll('.project-images').forEach(images => {
			images.addEventListener('click', openModal);
		});
	}
}

function replaceUrlQuery(tag) {
	const url = new URL(window.location.href);
	url.searchParams.set('tag', tag);
	window.history.pushState({}, '', url.toString());
}

function scrollToTop() {
	window.scrollTo({
		top: 0,
		behavior: 'smooth'
	});
}

function filterButtonClick(e) {
	document.querySelector('#filter button.active').classList.remove('active');
	e.target.classList.add('active');
	updateProjects();
	replaceUrlQuery(e.target.dataset.tag);
	scrollToTop();
}

function updateFilter() {
	const tags = new Set();
	const weigth = {
		"Web": 2,
		"CMS Integration": 2,
		"Animation": 1
	}
	for (const project of projectsData) {
		for (const tag of project.tags) {
			tags.add(tag);
		}
	}
	const filter = document.getElementById('filter');
	for (const tag of [...tags].sort((a, b) => weigth[a] - weigth[b]).reverse()) {
		const button = document.createElement('button');
		button.dataset.tag = tag.toLowerCase().replace(/\s+/g, '-');
		button.innerHTML = tag;
		filter.appendChild(button);
	}
	// add event listener to filter buttons
	document.querySelectorAll('#filter button').forEach(button => {
		button.addEventListener('click', filterButtonClick);
	});
	// add button class active by url query or default set to all
	const url = new URL(window.location.href);
	const tag = url.searchParams.get('tag');
	if (tag) {
		document.querySelector(`#filter button[data-tag="${tag}"]`).classList.add('active');
	} else {
		document.querySelector('#filter button[data-tag="all"]').classList.add('active');
	}
}

function openModal(e) {
	const imagesDOM = e.target.closest('.project-images').querySelectorAll('.project-image');
	const modal = document.createElement('div');
	const modelContainer = document.createElement('div');
  const closeButton = document.createElement('button');
  closeButton.innerHTML = 'Close';
	closeButton.classList.add('modal-close');
  closeButton.addEventListener('click', closeModal);
	modal.addEventListener('click', closeModal);
	
	modal.classList.add('modal');
	modelContainer.classList.add('modal-container');
	for (const image of imagesDOM) {
		const img = document.createElement('img');
		img.src = image.dataset.src;
		modelContainer.appendChild(img);
	}
	modal.appendChild(closeButton);
	modal.appendChild(modelContainer);
	document.body.appendChild(modal);
}

function closeModal(e) {
	// if modal-container prevent event
	if (e.target.closest('.modal-container')) {
		e.preventDefault();
		return;
	}
	const modal = e.target.closest('.modal');
	modal.remove();
}

function bindColorPalette() {
	const colorPalette = document.querySelector('.color-palette');
	colorPalette.addEventListener('mousemove', (e) => {
		// if click
		if (e.buttons === 0) {
			return;
		}
		const rect = colorPalette.getBoundingClientRect();
		const x = e.clientX - rect.left;
		const width = rect.width;
		const ratio = Math.max(0, Math.min(1, x / width));
		const index = Math.floor(ratio * (gradientColors.length - 1));
		const nextIndex = Math.min(index + 1, gradientColors.length - 1);
		const localRatio = (ratio * (gradientColors.length - 1)) - index;
		
		const color1 = gradientColors[index];
		const color2 = gradientColors[nextIndex];
		
		// 簡單的顏色插值
		const r1 = parseInt(color1.slice(1, 3), 16);
		const g1 = parseInt(color1.slice(3, 5), 16);
		const b1 = parseInt(color1.slice(5, 7), 16);
		const r2 = parseInt(color2.slice(1, 3), 16);
		const g2 = parseInt(color2.slice(3, 5), 16);
		const b2 = parseInt(color2.slice(5, 7), 16);
		
		const r = Math.round(r1 + (r2 - r1) * localRatio);
		const g = Math.round(g1 + (g2 - g1) * localRatio);
		const b = Math.round(b1 + (b2 - b1) * localRatio);
		
		const interpolatedColor = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
		
		// 計算互補色
		const complementaryR = 255 - r;
		const complementaryG = 255 - g;
		const complementaryB = 255 - b;
		const complementaryColor = `#${complementaryR.toString(16).padStart(2, '0')}${complementaryG.toString(16).padStart(2, '0')}${complementaryB.toString(16).padStart(2, '0')}`;
		document.querySelector('.footer-text').innerHTML = `fine?`;
		
		document.documentElement.style.setProperty('--primary-color', interpolatedColor);
		document.documentElement.style.setProperty('--secondary-color', complementaryColor);

		document.querySelector('.footer-text').innerHTML = partyText;
	});
	colorPalette.addEventListener('mouseleave', () => {
	});
	document.querySelector('.color-palette-white').addEventListener('mousemove', () => {
		document.documentElement.style.setProperty('--primary-color', '#000000');
		document.documentElement.style.setProperty('--secondary-color', '#ffffff');
	});
	document.querySelector('.color-palette-black').addEventListener('mousemove', () => {
		document.documentElement.style.setProperty('--primary-color', '#ffffff');
		document.documentElement.style.setProperty('--secondary-color', '#000000');
	});
}

function addDocumentSize() {
	let fontSize = document.documentElement.style.getPropertyValue('font-size');
	let padSize = document.documentElement.style.getPropertyValue('--global-padding');
	let padSizeSmall = document.documentElement.style.getPropertyValue('--global-padding-small');
	let radiusSize = document.documentElement.style.getPropertyValue('--global-radius');
	let sizeSize = document.documentElement.style.getPropertyValue('--global-size');
	console.log(padSize, padSizeSmall, radiusSize, sizeSize);
	// remove px
	fontSize = parseInt(fontSize.replace('px', ''));
	padSize = parseInt(padSize.replace('px', ''));
	padSizeSmall = parseInt(padSizeSmall.replace('px', ''));
	radiusSize = parseInt(radiusSize.replace('px', ''));
	sizeSize = parseInt(sizeSize.replace('px', ''));

	let size = new Map([
		['font-size', fontSize + 8],
		['padding', padSize + 4],
		['padding-small', padSizeSmall + 2],
		['radius', radiusSize + 8],
		['size', sizeSize + 32],
	]);

	for (let [key, value] of size) {
		if (value < sizeMin.get(key)) {
			value = sizeMin.get(key);
		}
		if (value > sizeMax.get(key)) {
			value = sizeMax.get(key);
		}
		size.set(key, value);
	}
	document.documentElement.style.setProperty('font-size', size.get('font-size') + 'px');
	document.documentElement.style.setProperty('--global-padding', size.get('padding') + 'px');
	document.documentElement.style.setProperty('--global-padding-small', size.get('padding-small') + 'px');
	document.documentElement.style.setProperty('--global-radius', size.get('radius') + 'px');
	document.documentElement.style.setProperty('--global-size', size.get('size') + 'px');
}

function minusDocumentSize() {
	let padSize = document.documentElement.style.getPropertyValue('--global-padding');
	let padSizeSmall = document.documentElement.style.getPropertyValue('--global-padding-small');
	let radiusSize = document.documentElement.style.getPropertyValue('--global-radius');
	let sizeSize = document.documentElement.style.getPropertyValue('--global-size');
	let fontSize = document.documentElement.style.getPropertyValue('font-size');
	// remove px
	padSize = parseInt(padSize.replace('px', ''));
	padSizeSmall = parseInt(padSizeSmall.replace('px', ''));
	radiusSize = parseInt(radiusSize.replace('px', ''));
	sizeSize = parseInt(sizeSize.replace('px', ''));
	fontSize = parseInt(fontSize.replace('px', ''));
	let size = new Map([
		['font-size', fontSize - 8],
		['padding', padSize - 4],
		['padding-small', padSizeSmall - 2],
		['radius', radiusSize - 8],
		['size', sizeSize - 32],
	]);
	for (let [key, value] of size) {
		if (value < sizeMin.get(key)) {
			value = sizeMin.get(key);
		}
		if (value > sizeMax.get(key)) {
			value = sizeMax.get(key);
		}
		size.set(key, value);
	}
	document.documentElement.style.setProperty('font-size', size.get('font-size') + 'px');
	document.documentElement.style.setProperty('--global-padding', size.get('padding') + 'px');
	document.documentElement.style.setProperty('--global-padding-small', size.get('padding-small') + 'px');
	document.documentElement.style.setProperty('--global-radius', size.get('radius') + 'px');
	document.documentElement.style.setProperty('--global-size', size.get('size') + 'px');
}

function bindSizeController() {
	document.querySelector('.size-controller-button-minus').addEventListener('click', minusDocumentSize);
	document.querySelector('.size-controller-button-plus').addEventListener('click', addDocumentSize);
}

function bindLoading() {
	setTimeout(() => {
		const loading = document.getElementById('loading');
		loading.classList.remove('animation');
		loading.classList.add('hidden');
		setTimeout(() => {
			loading.style.display = 'none';
		}, 2000);
	}, 1000);
}

function initialize() {
	updateFilter();
	updateProjects();
	bindColorPalette();
	bindSizeController();
	bindLoading();
}

document.addEventListener('DOMContentLoaded', () => {
	initialize();
});