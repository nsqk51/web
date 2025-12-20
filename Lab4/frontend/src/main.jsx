import React from 'react'
import ReactDOM from 'react-dom/client'
import { Provider } from 'react-redux'
import { BrowserRouter } from 'react-router-dom'
import { store } from './store/store'
import App from './App'

import 'primereact/resources/themes/lara-dark-teal/theme.css'
import 'primereact/resources/primereact.min.css'
import 'primeicons/primeicons.css'

// ВАЖНО: убедись, что файл лежит в frontend/src/styles/style.css
import './styles/style.css'

// Импортируем фон (убедись, что файл есть по этому пути)
import bgImage from './assets/images/fzt2.gif'

// Установка фона
document.body.style.backgroundImage = `url(${bgImage})`;
document.body.style.backgroundSize = 'cover';
document.body.style.backgroundPosition = 'center';
document.body.style.backgroundAttachment = 'fixed';

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <Provider store={store}>
            <BrowserRouter>
                <App />
            </BrowserRouter>
        </Provider>
    </React.StrictMode>
)