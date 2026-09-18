import { Outlet } from 'react-router';
import Header from './header';
import Foot from './foot';

const Layout = () => {
  return (
    <main >
      <Header />
      <Outlet />
      <Foot />
    </main>
  );
};

export default Layout;
