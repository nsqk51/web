import React, { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import Header from '../components/Header'
import Graph from '../components/Graph'
import { logout } from '../store/authSlice'
import { clearResultsState, checkPointThunk, fetchResultsThunk } from '../store/resultsSlice'

import { Card } from 'primereact/card'
import { Button } from 'primereact/button'
import { Message } from 'primereact/message'
import { RadioButton } from 'primereact/radiobutton'
import { Slider } from 'primereact/slider'
import { DataTable } from 'primereact/datatable'
import { Column } from 'primereact/column'

export default function MainPage() {
    const dispatch = useDispatch()
    const { items, error } = useSelector((s) => s.results)

    const xOptions = useMemo(() => [-4, -3, -2, -1, 0, 1, 2, 3, 4], [])
    const rOptions = useMemo(() => [-4, -3, -2, -1, 0, 1, 2, 3, 4], [])

    const [x, setX] = useState(0)
    const [r, setR] = useState(1)
    const [y, setY] = useState(0)

    const [clientError, setClientError] = useState(null)

    useEffect(() => {
        dispatch(fetchResultsThunk())
    }, [dispatch])

    function validateForm() {
        if (r <= 0) return 'Радиус не может быть отрицательным или нулём'
        return null
    }

    async function onFormSubmit() {
        const err = validateForm()
        setClientError(err)
        if (err) return
        await dispatch(checkPointThunk({ x, y, r }))
    }

    async function onGraphClick(clickX, clickY) {
        if (r <= 0) {
            setClientError('Невозможно проверить точку: радиус некорректен')
            return
        }
        setClientError(null)
        await dispatch(checkPointThunk({ x: clickX, y: clickY, r }))
    }

    function onLogout() {
        dispatch(logout())
        dispatch(clearResultsState())
    }

    return (
        <div className="container">
            <Header />

            <div style={{display:'flex', justifyContent:'flex-end', marginBottom:'1rem'}}>
                <Button
                    label="Выйти"
                    icon="pi pi-sign-out"
                    className="p-button-danger p-button-text"
                    onClick={onLogout}
                />
            </div>

            <div className="grid">
                {/* 1. ПАРАМЕТРЫ (Слева) */}
                <Card title="Параметры" className="card">
                    <div className="form">
                        <div className="form-field">
                            <label>X</label>
                            <div className="radio-group">
                                {xOptions.map((v) => (
                                    <div key={v} className="radio-item">
                                        <RadioButton inputId={`x-${v}`} value={v} checked={x === v} onChange={() => setX(v)} />
                                        <label htmlFor={`x-${v}`}>{v}</label>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="form-field">
                            <label>Y: <span style={{color:'var(--primary)'}}>{y.toFixed(3)}</span></label>
                            <Slider value={y} onChange={(e) => setY(e.value)} min={-5} max={5} step={0.01} />
                            <small style={{color:'var(--muted)'}}>(-5 ... 5)</small>
                        </div>

                        <div className="form-field">
                            <label>R</label>
                            <div className="radio-group">
                                {rOptions.map((v) => (
                                    <div key={v} className="radio-item">
                                        <RadioButton inputId={`r-${v}`} value={v} checked={r === v} onChange={() => setR(v)} />
                                        <label htmlFor={`r-${v}`}>{v}</label>
                                    </div>
                                ))}
                            </div>
                            {r <= 0 && <small className="p-error">Радиус должен быть > 0</small>}
                        </div>

                        {clientError && <Message severity="warn" text={clientError} style={{ width: '100%' }} />}
                        {error && <Message severity="error" text={String(error)} style={{ width: '100%' }} />}

                        <Button label="Проверить" icon="pi pi-check" onClick={onFormSubmit} disabled={r <= 0} />
                    </div>
                </Card>

                {/* 2. ГРАФИК (Справа) */}
                <Card title="График" className="card h-full">
                    <div style={{ width: '100%', height: '100%', minHeight: '400px', display: 'flex', alignItems: 'center' }}>
                        <Graph r={r} points={items} onPoint={onGraphClick} />
                    </div>
                </Card>

                {/* 3. ИСТОРИЯ (Снизу во всю ширину) */}
                <Card title="История проверок" className="card" style={{ gridColumn: '1 / -1' }}>
                    <DataTable value={items} paginator rows={5} rowsPerPageOptions={[5, 10, 25]} emptyMessage="Нет результатов">
                        <Column field="x" header="X" body={(row) => Number(row.x).toFixed(3)} />
                        <Column field="y" header="Y" body={(row) => Number(row.y).toFixed(3)} />
                        <Column field="r" header="R" />
                        <Column
                            header="Статус"
                            body={(row) => (
                                <span className={row.hit ? 'hit-badge' : 'miss-badge'}>
                                    {row.hit ? 'Попадание' : 'Промах'}
                                </span>
                            )}
                        />
                        <Column field="serverTime" header="Время" />
                        <Column field="execTimeNs" header="Время (нс)" />
                    </DataTable>
                </Card>
            </div>
        </div>
    )
}