import m from 'mithril';

import { BindData } from 'app/db';

const navbar = {
  view () {
    const links  = [{
      name: 'home',
      href: '/',
    }, {
      name: 'grid world',
      href: '/gridworld',
    }];
    return m('ul.Navbar', links.map(link => {
      const { name, href } = link;
      return m('li', {
        key: href,
      }, m('a', {
        href: href,
        config: m.route,
      }, name));
    }));
  }
};

const Layout = {
  controller () {
    const ctrl = this;

    BindData(ctrl , {
      user: ['user']
    });
  },
  view (ctrl, args) {
    const { component } = args;
    const user = ctrl.data.user;
    return m('div', [
      m(navbar),
      m(component),
    ]);
  }
};

export default Layout;
