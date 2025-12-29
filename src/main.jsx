import React from 'react'
import { createRoot } from 'react-dom/client'
import StrategyCanvas from './StrategyCanvas'

import './styles.css'

function App(){
  return <StrategyCanvas />
}

createRoot(document.getElementById('root')).render(<App />)
