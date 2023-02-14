import { createElement, memo, useCallback, useEffect, useState } from "react";

import { getDispatch, stateComponent } from "Util/Store";
import buildClassName from "Util/buildClassName";
import { pick } from "Util/Iterates";

import { InputPassword, InputText } from "UI/components/Input";
import Button from "UI/components/Button";

import style from "CSS/auth.module.css";

// TODO: Implement multiscreen authState support
// Need to implement multiAuthState support under API Requests and API itself

const Authentication = ({
	authIsLoading, authError
}) => {

	const { requestAuth } = getDispatch();

	const [login, setLogin] = useState('');
	const [password, setPassword] = useState('');
	const canSubmit = login.length > 0 && password.length >= 3;

	const onLoginChange = (e) => {
		const { value } = e.target;
		setLogin(value);
	};

	const onPasswordChange = (e) => {
		const { value } = e.target;
		setPassword(value);
	};

	const onSubmit = (e) => {
		e.preventDefault();

		if (authIsLoading || !canSubmit) return;

		requestAuth({
			login,
			password,
		});
	};

	const [showPassword, setShowPassword] = useState(false);

	const handleChangePasswordVisibility = useCallback((isVisible) => {
		setShowPassword(isVisible);
	}, []);

	useEffect(() => {
		console.debug(">> authIsLoading", authIsLoading);
	}, [authIsLoading]);

	useEffect(() => {
		console.debug(">> authError", authError);
	}, [authError]);

	return (
		<div class={style.container}>
			<a class={style.floatingLogo} href="/" target="_blank" rel="noopener" />

			<div class={style.wrapper}>
				<form class={style.authBox} onsubmit={onSubmit}>
					<div class={style.mainLoginContainer}>
						<div class={style.header}>
							<p class={buildClassName(style.title, 'size24')}>{"Добро пожаловать!"}</p>
							<p class={buildClassName(style.subtitle, 'size16')}>{"Войдите в свой аккаунт"}</p>
						</div>
						<div class={style.block}>

							<InputText id="email"
								name="email"
								required={true}
								autoFocus={true}
								autoComplete="email"
								placeholder="Email"
								onChange={onLoginChange}
								value={login || ''}
								label="Email"
								error={authError}
							/>

							<InputPassword id="password"
								name="password"
								required={true}
								autoComplete="current-password"
								placeholder="Пароль"
								onChange={onPasswordChange}
								value={password || ''}
								label="Password"
								error={authError}
								isPasswordVisible={showPassword}
								onChangePasswordVisibility={handleChangePasswordVisibility}
							/>

							<Button type="submit" className={buildClassName("filled", "colorBrand")} isLoading={authIsLoading} disabled={!canSubmit}>{"Войти"}</Button>

						</div>
					</div>
				</form>
			</div>
		</div>
	);

};

export default memo(stateComponent((global) =>
	pick(global, [
		'authState',
		'authIsLoading',
		'authError',
	]))(Authentication));