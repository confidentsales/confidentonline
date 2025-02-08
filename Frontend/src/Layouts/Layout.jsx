import React from 'react'
import {Outlet} from 'react-router-dom'
import Header from './Header'
import Footer from './Footer'


function Layout() {
  return (
 
    <div className="flex flex-col min-h-screen">
      <header ><Header/></header>
      <Outlet className="w-max-full"/>
      {/* <footer className="mt-auto ">
        <Footer/>
      </footer> */}
    </div>
  
  )
}

export default Layout