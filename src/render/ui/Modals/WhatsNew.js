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


const Header = (({ title, date }) => {
	const { closeModal } = getDispatch();
	const onClose = () => closeModal();
	return (
		<div className={buildClassName('flex-group', 'horizontal', style.header)}>
			<div className="flex-child">
				<h2>{title || 'Что нового?'}</h2>
				<div className={buildClassName('size12', 'colorStandart', style.date)}>
					{new Date(date).toLocaleString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
				</div>
			</div>
			<div className="button" onClick={onClose}>{SVG('cross')}</div>
		</div>
	);
});

const Content = (({ children }) => createElement('div', { class: buildClassName(style.content, 'thin-s') }, children));

const WhatsNewContainer = memo(() => {
	const releases = useGlobal(global => global.releases);
	if (releases) {
		const latestRelease = releases.find(e => e.tag_name == `v${APP_VERSION}`);
		if (latestRelease) {
			return (
				<Fragment>
					<Header title={latestRelease.name} date={latestRelease.published_at} />
					<Content>
						<img src="https://cdn.tjmc.ru/images/1501915239_image.gif" style={{ height: "20em" }} />
						<div className={buildClassName("colorStandart", "size14")}>
							<span className="markdown">
								<Markdown remarkPlugins={[remarkGfm]} children={latestRelease.body} />
							</span>
						</div>
					</Content>
					<Footer />
				</Fragment>
			);
		} else {
			return (
				<div className={buildClassName("main-content", "d-flex", "vertical", "centred", "no-scroll")} style={{ flex: 1 }}>
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