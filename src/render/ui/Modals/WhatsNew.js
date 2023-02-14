import { createElement, memo, Fragment } from "react";

import buildClassName from "Util/buildClassName";
import { getDispatch } from 'Util/Store';
import { SVG } from '../svg';

import { Modal } from 'UI/Modals';

import style from 'CSS/modal.module.css';


const WhatsNewContent = memo(() => (
	<div>
		<img src="https://www.tjmcraft.ga/nav_cr.png" style={{ height: "25em" }} />
		<h1 class={buildClassName(style.added, style.title)}>НОВЫЕ ФУНКЦИИ </h1>
		<ul>
			<li>
				<strong>Фоны для видеозвонков.</strong> Делайте фон видео размытым, меняйте его на официальный фон Discord или, если у вас есть подписка Discord Nitro, установите собственный фон.
			</li>
			<li>
				<strong>Наконец-то можно загружать несколько файлов одновременно.</strong> Не верится? Нам тоже. А ведь мы здесь работаем!
			</li>
			<li>
				<strong>Теперь к загружаемым изображениям можно добавить описание.</strong> Чтобы добавить alt-текст, щёлкните по значку карандаша при загрузке изображения. Пользователи с экранными дикторами будут вам благодарны &lt;3.
			</li>
			<li>
				<strong>Включение/выключение предпросмотра видео.</strong> Теперь при переходе в видеорежим доступен предпросмотр камеры. Изменить этот параметр можно в меню «Настройки пользователя» &gt; «Голос и видео». Впрочем, советуем его не выключать, если вы привыкли сушить носки на том коварном стуле, что так и норовит влезть в кадр.
			</li>
			<li>
				<strong>Добавляйте ботов прямо из профилей.</strong> Теперь разработчики могут активировать в профилях ботов кнопку «Добавить на сервер», чтобы пользователям было проще их установить.
			</li>
			<li>
				<strong>Улучшения обрезки GIF.</strong> Теперь выполнять обрезку изображений GIF для аватаров и баннеров профиля стало гораздо быстрее и удобнее. Кроме того, мы усовершенствовали кнопку отмены. И под «усовершенствовали» мы имеем в виду, что теперь она реально работает.
			</li>
		</ul>
		<h1 class={buildClassName(style.fixed, style.title)}>NITRO И БУСТЫ </h1>
		<ul>
			<li>
				<strong>Улучшенные профили серверов.</strong> Теперь вдобавок к аватарам подписчики Nitro смогут использовать на каждом из своих серверов разные баннеры и биографии профиля.
			</li>
			<li>
				<strong>В эти предновогодние дни подарки Nitro будут выглядеть чуточку по-другому.</strong> До 31&nbsp;декабря подарить другу подписку Nitro&nbsp;— значит окунуться в атмосферу настоящего праздника. Щёлкните по изображению подарка на панели чата, и да начнётся веселье!
			</li>
		</ul>
		<h1 class={buildClassName(style.progress, style.title)}>СПЕЦИАЛЬНЫЕ ВОЗМОЖНОСТИ И БЕЗОПАСНОСТЬ </h1>
		<ul>
			<li>
				<strong>Новая функция тайм-аута на сервере.</strong> Теперь, чтобы пресекать некорректное поведение, администраторы и модераторы серверов могут временно запрещать определённым пользователям взаимодействие с другими участниками. Функция также известна как «чел, прекрати, это уже не смешно».
			</li>
			<li>
				<strong>Возможность напрямую пожаловаться на спам.</strong> В ЛС появилась заметная кнопка «Пожаловаться на спам». Теперь, если кто-то начнёт вас доставать, мы узнаем об этом быстрее. Появилась и другая кнопка&nbsp;— «Пожарить спам». На случай, если дело явно пахнет жареным.
			</li>
			<li>
				<strong>Улучшена система предупреждения о подозрительных ссылках.</strong> Новая система ещё бдительнее отслеживает вредоносные домены и предупреждает вас о них. Не переходите по подозрительным ссылкам. Бесплатная подписка Nitro в обмен на входные данные&nbsp;— наглая ложь. Сотрудники Discord никогда не попросят сообщить им ваш пароль: свои-то с трудом в голове держим…
			</li>
		</ul>
		<h1 class={buildClassName(style.progress, style.title)}>И, ПРЕЖДЕ ЧЕМ ЗАКОНЧИТЬ… </h1>
		<ul>
			<li>
				<strong>Поздравляем вас с Новым Годом! &lt;3</strong> Спасибо, что используете Discord для общения с друзьями и сообществами. Около 7&nbsp;лет назад Discord был одной из тех штук, которые подбивает скачать друг, а вы отказываетесь, потому что не хотите «забивать память еще одной прогой». Сегодня уже вы&nbsp;— тот самый назойливый друг, который агитирует других скачать эту самую прогу. Время летит, всё меняется&nbsp;— мы лишь надеемся, что прежним остаётся удовольствие от общения с близкими в Discord. Желаем вам счастья и безопасности в новом 2022 году. До встречи!
			</li>
		</ul>
	</div>
));

const Header = memo(() => {
	const { closeModal } = getDispatch();
	const onClose = () => closeModal();
	return createElement('div', { class: buildClassName('flex-group', 'horizontal', style.header) },
		createElement('div', { class: buildClassName('flex-child') },
			createElement('h2', null, 'Что нового?'),
			createElement('div', { class: buildClassName('size12', 'colorStandart', style.date) }, "20 декабря 2021г.")),
		createElement('div', { class: buildClassName('button'), onClick: onClose }, SVG('cross')));
});

const Content = memo(() => {
	return createElement('div', { class: buildClassName(style.content, 'thin-s') }, <WhatsNewContent />);
});

const WhatsNewContainer = memo(() => {
	return (
		<Fragment>
			<Header />
			<Content />
			<Footer />
		</Fragment>
	);
});

const Footer = memo(() => {
	return createElement('div', { class: style.footer },
		createElement('a', { class: 'anchor', href: 'https://twitter.com/im_byte', rel: ['noreferrer', 'noopener'], target: '_blank' }, 'Twitter'),
		createElement('a', { class: 'anchor', href: 'https://facebook.com/tjmcraft' }, 'Facebook'),
		createElement('a', { class: 'anchor', href: 'https://instagram.com/tjmcraft.ga' }, 'Instagram'),
		createElement('div', { class: buildClassName('size12', 'colorStandart') }, 'Подписывайтесь на наш канал, здесь говорят правду'));
});

const WhatsNew = memo((props) => {
	return createElement(Modal, { ...props, small: true },
		createElement(WhatsNewContainer));
});

export default WhatsNew;