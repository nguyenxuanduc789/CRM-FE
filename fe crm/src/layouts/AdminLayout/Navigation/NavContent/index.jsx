import PropTypes from 'prop-types';
import React, { useEffect, useMemo, useState } from 'react';
import { ListGroup } from 'react-bootstrap';
import PerfectScrollbar from 'react-perfect-scrollbar';

import NavGroup from './NavGroup';

const NavContent = ({ navigation }) => {
  const storageKey = 'menu-order-groups';

  const [orderedGroups, setOrderedGroups] = useState([]);
  const [dragGroupId, setDragGroupId] = useState(null);

  const navigationGroups = useMemo(() => navigation.filter((g) => g.type === 'group'), [navigation]);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey) || '[]');
      const idToGroup = new Map(navigationGroups.map((g) => [g.id, g]));
      const restored = saved
        .filter((id) => idToGroup.has(id))
        .map((id) => idToGroup.get(id));
      const missing = navigationGroups.filter((g) => !saved.includes(g.id));
      setOrderedGroups([...restored, ...missing]);
    } catch (e) {
      setOrderedGroups(navigationGroups);
    }
  }, [navigationGroups]);

  const persistOrder = (groups) => {
    const ids = groups.map((g) => g.id);
    localStorage.setItem(storageKey, JSON.stringify(ids));
  };

  const onDragStartGroup = (e, id) => {
    setDragGroupId(id);
    try {
      e.dataTransfer.setData('text/plain', id);
      e.dataTransfer.effectAllowed = 'move';
    } catch (err) {
      /* ignore */
    }
  };

  const onDragOverGroup = (e) => {
    e.preventDefault();
  };

  const onDropGroup = (e, overId) => {
    e.preventDefault();
    const fromId = dragGroupId || e.dataTransfer.getData('text/plain');
    if (!fromId || fromId === overId) return;
    const updated = [...orderedGroups];
    const fromIndex = updated.findIndex((g) => g.id === fromId);
    const toIndex = updated.findIndex((g) => g.id === overId);
    if (fromIndex === -1 || toIndex === -1) return;
    const [moved] = updated.splice(fromIndex, 1);
    updated.splice(toIndex, 0, moved);
    setOrderedGroups(updated);
    persistOrder(updated);
    setDragGroupId(null);
  };

  const navItems = orderedGroups.map((item) => {
    switch (item.type) {
      case 'group':
        return (
          <div
            key={'nav-group-wrapper-' + item.id}
            data-id={item.id}
            draggable
            onDragStart={(e) => onDragStartGroup(e, item.id)}
            onDragOver={onDragOverGroup}
            onDrop={(e) => onDropGroup(e, item.id)}
          >
            <NavGroup key={'nav-group-' + item.id} group={item} />
          </div>
        );
      default:
        return false;
    }
  });

  let mainContent = '';

  mainContent = (
    <div className="navbar-content datta-scroll">
      <PerfectScrollbar>
        <ListGroup variant="flush" as="ul" bsPrefix=" " className="nav pcoded-inner-navbar" id="nav-ps-next">
          {navItems}
        </ListGroup>
      </PerfectScrollbar>
    </div>
  );

  return <React.Fragment>{mainContent}</React.Fragment>;
};

NavContent.propTypes = {
  navigation: PropTypes.array
};

export default NavContent;
