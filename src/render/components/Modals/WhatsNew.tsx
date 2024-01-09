import React, { createElement, memo, Fragment } from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";

import useGlobal from "Hooks/useGlobal";
import buildClassName from "Util/buildClassName";
import { getDispatch } from 'Store/Global';

import { Modal } from 'UI/Modal';

import style from 'CSS/modal.module.css';
import "CSS/markdown.css";
import mountainImg from "IMG/mountain.png";


const Header = (({ title, date }: { title: string; date: Date }) => {
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
			<button className="button" onClick={onClose} role="button" tabIndex={1}><i className="icon-close"></i></button>
		</div>
	);
});

const Content = (({ children }: { children: React.ReactNode }) => createElement('div', { class: buildClassName(style.content, 'thin-s') }, children));

const WhatsNewContainer = memo(function WhatsNewContainer() {
	const releases = useGlobal(global => global.releases);
	if (releases) {
		const latestRelease = releases.find(e => e.tag_name == `v${APP_VERSION}`);
		if (latestRelease) {
			return (
				<Fragment>
					<Header title={latestRelease.name} date={latestRelease.published_at} />
					<Content>
						<img
							style={{ height: "20em" }}
							src={mountainImg}
							onError={({ currentTarget }) => {
								currentTarget.onerror = void 0;
								currentTarget.src = mountainImg;
							}}
						/>
						<div className={buildClassName("colorStandart", "size14")}>
							<span className="markdown">
								<Markdown remarkPlugins={[remarkGfm]}>{latestRelease.body}</Markdown>
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

const Footer = memo(function Footer() {
	return createElement('div', { class: style.footer },
		createElement('a', { class: 'anchor', href: 'https://twitter.com/im_byte', rel: ['noreferrer', 'noopener'], target: '_blank' }, 'Twitter'),
		createElement('a', { class: 'anchor', href: 'https://facebook.com/tjmcraft' }, 'Facebook'),
		createElement('a', { class: 'anchor', href: 'https://instagram.com/tjmcraft.ga' }, 'Instagram'),
		createElement('div', { class: buildClassName('size12', 'colorStandart') }, 'Подписывайтесь на наш канал, здесь говорят правду'));
});

const WhatsNew = () => (
	<Modal small={true}>
		<WhatsNewContainer />
	</Modal>
);


export default memo(WhatsNew);