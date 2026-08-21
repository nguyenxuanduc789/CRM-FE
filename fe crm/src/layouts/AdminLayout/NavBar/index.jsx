import React, { useContext, useState } from 'react';
import { Link } from 'react-router-dom';

import NavLeft from './NavLeft';
import NavRight from './NavRight';

import { ConfigContext } from '../../../contexts/ConfigContext';
import * as actionType from '../../../store/actions';
import { BRAND_LOGO_URL } from '../../../config/brand';
const NavBar = () => {
  const [moreToggle, setMoreToggle] = useState(false);
  const configContext = useContext(ConfigContext);
  const { collapseMenu, headerFixedLayout, layout } = configContext.state;
  const { dispatch } = configContext;

  let headerClass = ['navbar', 'pcoded-header', 'navbar-expand-lg'];
  if (headerFixedLayout && layout === 'vertical') {
    headerClass = [...headerClass, 'headerpos-fixed'];
  }

  let toggleClass = ['mobile-menu'];
  if (collapseMenu) {
    toggleClass = [...toggleClass, 'on'];
  }

  const navToggleHandler = () => {
    dispatch({ type: actionType.COLLAPSE_MENU });
  };

  let moreClass = ['mob-toggler'];

  let collapseClass = ['collapse navbar-collapse'];
  if (moreToggle) {
    moreClass = [...moreClass, 'on'];
    collapseClass = [...collapseClass, 'show'];
  }

  let navBar = (
    <React.Fragment>
      <div className="m-header">
        <Link to="#" className={toggleClass.join(' ')} id="mobile-collapse" onClick={navToggleHandler}>
          <span />
        </Link>
        <Link to="#" className="b-brand">
        <div style={{ textAlign: 'right' }}>
          <img style={{ width: '90px', height: 'auto', paddingRight: '10px' }} src={BRAND_LOGO_URL} alt="Khí Tâm Therapy" className="b-logo" />
        </div>
        </Link>
        <div className="d-flex align-items-center">
          <Link to="#" className="d-lg-none" style={{ color: '#fff', marginRight: '15px', fontSize: '1.2rem' }} onClick={() => {
            localStorage.clear();
            window.location.reload();
          }}>
            <i className="feather icon-log-out" />
          </Link>
          <Link to="#" className={moreClass.join(' ')} onClick={() => setMoreToggle(!moreToggle)}>
            <i className="feather icon-more-vertical" />
          </Link>
        </div>
      </div>
      <div style={{ justifyContent: 'space-between' }} className={collapseClass.join(' ')}>
        <NavLeft />
        <NavRight />
      </div>
    </React.Fragment>
  );

  return (
    <React.Fragment>
      <header className={headerClass.join(' ')}>{navBar}</header>
    </React.Fragment>
  );
};

export default NavBar;
