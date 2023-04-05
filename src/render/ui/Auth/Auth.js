import { createElement, memo, useCallback, useEffect, useState } from "react";

import { getDispatch } from "Store/Global";
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

	const canSubmit = login.length > 0;

	const onLoginChange = (e) => {
		const { value } = e.target;
		setLogin(value);
	};

	const onSubmit = (e) => {
		e.preventDefault();

		if (authIsLoading || !canSubmit) return;

		requestAuth({
			login,
		});
	};

	const handleTJMCIDAuth = useCallback(() => {
		requestAuth({ login: undefined });
	}, [requestAuth]);

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
								placeholder="Имя пользователя"
								onChange={onLoginChange}
								value={login || ''}
								label="Username"
								error={authError}
							/>
							<Button
								type="submit"
								className={buildClassName("filled", "colorBrand")}
								isLoading={authIsLoading}
								disabled={!canSubmit}
							>{"Войти"}</Button>
							<Button
								type="button"
								onClick={handleTJMCIDAuth}
								className={buildClassName("filled")}
							>{"TJMC ID"}</Button>
						</div>
					</div>
				</form>
			</div>
		</div>
	);

};

export default memo(Authentication);