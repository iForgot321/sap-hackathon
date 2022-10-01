import React from 'react'
import ReactDOM from 'react-dom'
import './index.css'
import LoginApp from './LoginApp'
import registerServiceWorker from './registerServiceWorker'
import 'bootstrap/dist/css/bootstrap.css';

ReactDOM.render(<LoginApp />, document.getElementById('root'))
registerServiceWorker()
