import React from 'react'
import ReactDOM from 'react-dom'
import './index.css'
import LoginApp from './LoginApp'
import registerServiceWorker from './registerServiceWorker'

ReactDOM.render(<LoginApp />, document.getElementById('root'))
registerServiceWorker()
