import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar/Navbar';

const Layout = () => (
	<>
	<Navbar />
	<main>
	<Outlet />
	</main>
  </>
);

export default Layout;
