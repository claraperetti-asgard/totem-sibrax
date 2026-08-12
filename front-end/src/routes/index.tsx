import { Routes, Route } from 'react-router-dom'
import AppLayout from '../components/AppLayout'
import Home from '../pages/Home'
import SlotMachine from '../pages/SlotMachine'
import EndScreen from '../pages/EndScreen'
import Formulario from '../pages/Formulario'
import Sorteio from '../pages/Sorteio'


export function AppRoutes() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path='/' element={<Home/>}/>
        <Route path='/slotmachine' element={<SlotMachine/>}/>
        <Route path='/end' element={<EndScreen/>}/>
        <Route path='/forms' element={<Formulario/>}/>
        <Route path='/sorteio' element={<Sorteio/>}/>
      </Route>
    </Routes>
  )
}           