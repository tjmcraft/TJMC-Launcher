import { createElement, memo, useCallback, useEffect, useState } from "react";

import { getDispatch, stateComponent } from "Util/Store";
import buildClassName from "Util/buildClassName";
import useGlobal from "Hooks/useGlobal";
import { pick } from "Util/Iterates";

import { InputPassword, InputText } from "UI/components/Input";
import Button from "UI/components/Button";

import style from "CSS/auth.module.css";

// TODO: Implement multiscreen authState support
// Need to implement multiAuthState support under API Requests and API itself

const Authentication = () => {

	const { authIsLoading, authError } = useGlobal(global => pick(global, [
		'authState', 'authIsLoading', 'authError'
	]));

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
		<div className={style.container}>
			<a className={style.floatingLogo} href="/" target="_blank" rel="noopener" />

			<div className={style.wrapper}>
				<form className={style.authBox} onSubmit={onSubmit}>
					<div className={style.mainLoginContainer}>
						<div className={style.header}>
							<p className={buildClassName(style.title)}>{"Добро пожаловать!"}</p>
							<p className={buildClassName(style.subtitle)}>{"Войдите в свой аккаунт"}</p>
						</div>
						<div className={style.block}>

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

export default memo(Authentication);