import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import { loginThunk, registerThunk } from '../store/authSlice'

import { Card } from 'primereact/card'
import { InputText } from 'primereact/inputtext'
import { Password } from 'primereact/password'
import { Button } from 'primereact/button'
import { Message } from 'primereact/message'
import { ToggleButton } from 'primereact/togglebutton'

export default function LoginPage() {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const { status, error } = useSelector((s) => s.auth)

    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [isRegister, setIsRegister] = useState(false)

    async function onSubmit(e) {
        e.preventDefault()
        try {
            if (isRegister) {
                await dispatch(registerThunk({ username, password })).unwrap()
            } else {
                await dispatch(loginThunk({ username, password })).unwrap()
            }
            navigate('/app')
        } catch (_) {
            // ошибка уже в store
        }
    }

    return (
        <div className="container" style={{maxWidth: '500px'}}>
            <Header />

            <Card title={isRegister ? 'Регистрация нового пользователя' : 'Вход в систему'} className="card">
                <form className="form" onSubmit={onSubmit}>
                    <div className="form-field">
                        <label>Режим доступа</label>
                        <ToggleButton
                            checked={isRegister}
                            onChange={(e) => setIsRegister(e.value)}
                            onLabel="Регистрация"
                            offLabel="Вход"
                            style={{width: '100%'}}
                        />
                    </div>

                    <div className="form-field">
                        <label htmlFor="username">Логин</label>
                        <InputText
                            id="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Введите логин"
                        />
                    </div>

                    <div className="form-field">
                        <label htmlFor="password">Пароль</label>
                        <Password
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            feedback={false}
                            toggleMask
                            placeholder="Введите пароль"
                            inputStyle={{width: '100%'}}
                            style={{width: '100%'}}
                        />
                    </div>

                    {error && <Message severity="error" text={String(error)} style={{ width: '100%' }} />}

                    <Button
                        type="submit"
                        label={status === 'loading' ? 'Загрузка...' : (isRegister ? 'Зарегистрироваться' : 'Войти')}
                        disabled={status === 'loading'}
                        className="p-button-lg"
                    />

                    {!isRegister && (
                        <div style={{textAlign: 'center', marginTop: '1rem', color: 'var(--muted)', fontSize: '0.9rem'}}>
                            Тестовый аккаунт: <b>user</b> / <b>user</b>
                        </div>
                    )}
                </form>
            </Card>
        </div>
    )
}