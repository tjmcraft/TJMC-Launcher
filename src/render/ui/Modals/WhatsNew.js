import { createElement, memo, Fragment } from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";

import useGlobal from "Hooks/useGlobal";
import buildClassName from "Util/buildClassName";
import { getDispatch } from 'Store/Global';
import { SVG } from '../svg';

import { Modal } from 'UI/Modals';

import style from 'CSS/modal.module.css';
import "CSS/markdown.css";


const WhatsNewContent = (({latestRelease}) => {
	return (
		<div>
			<img src="https://www.tjmcraft.ga/nav_cr.png" style={{ height: "25em" }} />
			<div className={buildClassName("colorStandart", "size14")}>
				<span className="markdown">
					<Markdown remarkPlugins={[remarkGfm]} children={latestRelease.body} />
				</span>
			</div>
		</div>
	);
});

const Header = (({ title, date }) => {
	const { closeModal } = getDispatch();
	const onClose = () => closeModal();
	return createElement('div', { class: buildClassName('flex-group', 'horizontal', style.header) },
		createElement('div', { class: buildClassName('flex-child') },
			createElement('h2', null, title || 'Что нового?'),
			createElement('div', { class: buildClassName('size12', 'colorStandart', style.date) }, new Date(date).toLocaleString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }))),
		createElement('div', { class: buildClassName('button'), onClick: onClose }, SVG('cross')));
});

const Content = (({latestRelease}) => {
	return createElement('div', { class: buildClassName(style.content, 'thin-s') }, <WhatsNewContent latestRelease={latestRelease} />);
});

const WhatsNewContainer = memo(() => {
	const releases = useGlobal(global => global.releases);
	if (releases) {
		const latestRelease = releases.find(e => e.tag_name == `v${APP_VERSION}`);
		if (latestRelease) {
			return (
				<Fragment>
					<Header title={latestRelease.name} date={latestRelease.published_at} />
					<Content latestRelease={latestRelease} />
					<Footer />
				</Fragment>
			);
		} else {
			return (

				<div className={buildClassName("main-content", "d-flex", "vertical", "centred", "no-scroll")} style={{flex: 1}}>
					<h1>{`Early build (v${APP_VERSION})`}</h1>
					<h3>Cannot be found on GitHub</h3>
				</div>

			);
		}
	}
	return undefined;
});

const Footer = memo(() => {
	return createElement('div', { class: style.footer },
		createElement('a', { class: 'anchor', href: 'https://twitter.com/im_byte', rel: ['noreferrer', 'noopener'], target: '_blank' }, 'Twitter'),
		createElement('a', { class: 'anchor', href: 'https://facebook.com/tjmcraft' }, 'Facebook'),
		createElement('a', { class: 'anchor', href: 'https://instagram.com/tjmcraft.ga' }, 'Instagram'),
		createElement('div', { class: buildClassName('size12', 'colorStandart') }, 'Подписывайтесь на наш канал, здесь говорят правду'));
});

const WhatsNew = memo(() => {
	return (
		<Modal small={true}>
			<WhatsNewContainer />
		</Modal>
	);
});

export default WhatsNew;